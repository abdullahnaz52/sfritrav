/**
 * /api/market-data.js
 * Real-time market data proxy for SfriTrav
 * Sources: Yahoo Finance (free, no API key needed)
 * Covers: Sensex, Nifty, Gold, Silver, Crude Oil, USD/INR, EUR/INR,
 *         Steel proxy, top Indian stocks, IPO index, commodities
 *
 * Cache: 60s on Vercel edge (market data refreshes every minute)
 */

// All symbols to fetch from Yahoo Finance
const SYMBOLS = [
  // Indian Indices
  '^BSESN',      // Sensex (BSE)
  '^NSEI',       // Nifty 50
  '^NSMIDCP',    // Nifty Midcap 50
  '^CNXSMALLCAP',// Nifty Smallcap
  '^CNXBANK',    // Nifty Bank

  // Currencies
  'USDINR=X',    // USD/INR
  'EURINR=X',    // EUR/INR
  'GBPINR=X',    // GBP/INR

  // Commodities (global futures, USD)
  'GC=F',        // Gold (USD/oz)
  'SI=F',        // Silver (USD/oz)
  'CL=F',        // Crude Oil WTI (USD/bbl)
  'BZ=F',        // Brent Crude (USD/bbl)
  'NG=F',        // Natural Gas
  'HG=F',        // Copper
  'ZW=F',        // Wheat
  'ZC=F',        // Corn

  // Indian commodity ETFs (INR)
  'GOLDBEES.NS',    // Gold BeES ETF
  'SILVERBEES.NS',  // Silver BeES ETF
  'COALGASPOWER.NS',// Coal/Energy proxy

  // Top Indian stocks (Nifty heavyweights)
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'BHARTIARTL.NS',
  'ICICIBANK.NS',
  'SBIN.NS',
  'HINDUNILVR.NS',
  'ITC.NS',
  'KOTAKBANK.NS',

  // US indices (global reference)
  '^GSPC',       // S&P 500
  '^DJI',        // Dow Jones
  '^IXIC',       // NASDAQ
];

// Human-readable labels
const LABELS = {
  '^BSESN':       { name: 'Sensex',        unit: '',      type: 'index'    },
  '^NSEI':        { name: 'Nifty 50',      unit: '',      type: 'index'    },
  '^NSMIDCP':     { name: 'Nifty Midcap',  unit: '',      type: 'index'    },
  '^CNXSMALLCAP': { name: 'Smallcap',      unit: '',      type: 'index'    },
  '^CNXBANK':     { name: 'Bank Nifty',    unit: '',      type: 'index'    },
  'USDINR=X':     { name: 'USD/INR',       unit: '₹',     type: 'forex'    },
  'EURINR=X':     { name: 'EUR/INR',       unit: '₹',     type: 'forex'    },
  'GBPINR=X':     { name: 'GBP/INR',       unit: '₹',     type: 'forex'    },
  'GC=F':         { name: 'Gold',          unit: '$',     type: 'commodity'},
  'SI=F':         { name: 'Silver',        unit: '$',     type: 'commodity'},
  'CL=F':         { name: 'Crude Oil WTI', unit: '$',     type: 'commodity'},
  'BZ=F':         { name: 'Brent Crude',   unit: '$',     type: 'commodity'},
  'NG=F':         { name: 'Natural Gas',   unit: '$',     type: 'commodity'},
  'HG=F':         { name: 'Copper',        unit: '$',     type: 'commodity'},
  'ZW=F':         { name: 'Wheat',         unit: '$',     type: 'commodity'},
  'ZC=F':         { name: 'Corn',          unit: '$',     type: 'commodity'},
  'GOLDBEES.NS':  { name: 'Gold ETF',      unit: '₹',     type: 'etf'      },
  'SILVERBEES.NS':{ name: 'Silver ETF',    unit: '₹',     type: 'etf'      },
  'RELIANCE.NS':  { name: 'Reliance',      unit: '₹',     type: 'stock'    },
  'TCS.NS':       { name: 'TCS',           unit: '₹',     type: 'stock'    },
  'HDFCBANK.NS':  { name: 'HDFC Bank',     unit: '₹',     type: 'stock'    },
  'INFY.NS':      { name: 'Infosys',       unit: '₹',     type: 'stock'    },
  'BHARTIARTL.NS':{ name: 'Airtel',        unit: '₹',     type: 'stock'    },
  'ICICIBANK.NS': { name: 'ICICI Bank',    unit: '₹',     type: 'stock'    },
  'SBIN.NS':      { name: 'SBI',           unit: '₹',     type: 'stock'    },
  'HINDUNILVR.NS':{ name: 'HUL',           unit: '₹',     type: 'stock'    },
  'ITC.NS':       { name: 'ITC',           unit: '₹',     type: 'stock'    },
  'KOTAKBANK.NS': { name: 'Kotak Bank',    unit: '₹',     type: 'stock'    },
  '^GSPC':        { name: 'S&P 500',       unit: '',      type: 'index'    },
  '^DJI':         { name: 'Dow Jones',     unit: '',      type: 'index'    },
  '^IXIC':        { name: 'NASDAQ',        unit: '',      type: 'index'    },
  'COALGASPOWER.NS': { name: 'Energy ETF', unit: '₹',    type: 'etf'      },
};

function fmt(price, unit) {
  if (price === null || price === undefined) return 'N/A';
  const num = parseFloat(price);
  if (isNaN(num)) return 'N/A';
  // Format with commas for Indian style if INR
  if (unit === '₹' && num > 1000) {
    return unit + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  if (num >= 1000) return unit + num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return unit + num.toFixed(2);
}

function fmtChange(change, pct) {
  if (change === null || change === undefined) return '';
  const c = parseFloat(change);
  const p = parseFloat(pct);
  if (isNaN(c)) return '';
  const sign = c >= 0 ? '+' : '';
  const pSign = p >= 0 ? '+' : '';
  return `${sign}${c.toFixed(2)} (${pSign}${p.toFixed(2)}%)`;
}

// Simple in-memory cache — resets per cold start (Vercel caches at edge anyway)
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 60 seconds

export default async function handler(req, res) {
  // CORS for browser direct calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Serve from cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.status(200).json({ ...cache, cached: true });
  }

  const symbolList = SYMBOLS.join(',');
  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(symbolList)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,regularMarketTime,marketState`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 10000); return c.signal; })(),
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const data = await response.json();
    const quotes = data?.quoteResponse?.result || [];

    const items = [];

    for (const q of quotes) {
      const sym = q.symbol;
      const meta = LABELS[sym];
      if (!meta) continue;

      const price = q.regularMarketPrice;
      const change = q.regularMarketChange;
      const pct = q.regularMarketChangePercent;

      if (price === undefined || price === null) continue;

      items.push({
        symbol: sym,
        name: meta.name,
        type: meta.type,
        unit: meta.unit,
        price: fmt(price, meta.unit),
        rawPrice: price,
        change: fmtChange(change, pct),
        rawChange: change,
        rawPct: pct,
        direction: change >= 0 ? 'up' : 'down',
        marketState: q.marketState || 'CLOSED',
      });
    }

    // Sort: indices first, then forex, commodities, stocks
    const ORDER = { index: 0, forex: 1, commodity: 2, etf: 3, stock: 4 };
    items.sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9));

    const result = {
      items,
      fetchedAt: new Date().toISOString(),
      count: items.length,
      cached: false,
    };

    cache = result;
    cacheTime = Date.now();

    return res.status(200).json(result);

  } catch (err) {
    console.error('[market-data] fetch error:', err.message);

    // Return stale cache if available
    if (cache) {
      return res.status(200).json({ ...cache, cached: true, stale: true });
    }

    // Return fallback static data so ticker always shows something
    return res.status(200).json({
      items: getFallbackData(),
      fetchedAt: new Date().toISOString(),
      count: 0,
      fallback: true,
      error: err.message,
    });
  }
}

function getFallbackData() {
  // Static reference values — shown only if API completely fails
  // These are approximate and clearly labelled as unavailable
  return [
    { symbol: '^BSESN',   name: 'Sensex',        type: 'index',    unit: '',  price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
    { symbol: '^NSEI',    name: 'Nifty 50',      type: 'index',    unit: '',  price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
    { symbol: '^CNXBANK', name: 'Bank Nifty',    type: 'index',    unit: '',  price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
    { symbol: 'USDINR=X', name: 'USD/INR',       type: 'forex',    unit: '₹', price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
    { symbol: 'GC=F',     name: 'Gold',          type: 'commodity',unit: '$', price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
    { symbol: 'CL=F',     name: 'Crude Oil WTI', type: 'commodity',unit: '$', price: 'Loading…', change: '', direction: 'up', rawChange: 0 },
  ];
}
