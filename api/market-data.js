/**
 * /api/market-data.js — SfriTrav Market Ticker
 *
 * Uses open.er-api.com for forex (free, no key, always works)
 * Uses Yahoo Finance with proper 2025 cookie+crumb flow for stocks/indices
 * Falls back to hardcoded realistic values if all sources fail
 * so the ticker ALWAYS shows something meaningful.
 */

const CACHE_TTL = 58_000;
let _cache = null, _cacheAt = 0;

function fmtN(n, decimals = 2) {
  if (n == null || isNaN(n)) return null;
  return parseFloat(n).toFixed(decimals);
}
function fmtINR(n) {
  if (n == null || isNaN(n)) return null;
  return '₹' + parseFloat(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
function fmtUSD(n) {
  if (n == null || isNaN(n)) return null;
  return '$' + parseFloat(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
function pct(chg, prev) {
  if (!prev) return 0;
  return ((chg / prev) * 100).toFixed(2);
}

async function timedFetch(url, opts = {}, ms = 9000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    return r;
  } catch (e) { clearTimeout(t); throw e; }
}

/* ── FOREX via open.er-api.com (100% free, no key, very reliable) ── */
async function getForex() {
  const r = await timedFetch('https://open.er-api.com/v6/latest/USD', {
    headers: { 'Accept': 'application/json' }
  }, 8000);
  if (!r.ok) throw new Error('er-api ' + r.status);
  const d = await r.json();
  const rates = d.rates || {};
  const inr = rates.INR;
  if (!inr) throw new Error('no INR');
  return [
    { symbol:'USD/INR', name:'USD/INR', type:'forex', price: fmtINR(inr),            rawChange:0, direction:'up' },
    { symbol:'EUR/INR', name:'EUR/INR', type:'forex', price: fmtINR(inr/rates.EUR),  rawChange:0, direction:'up' },
    { symbol:'GBP/INR', name:'GBP/INR', type:'forex', price: fmtINR(inr/rates.GBP),  rawChange:0, direction:'up' },
    { symbol:'JPY/INR', name:'JPY/INR', type:'forex', price: fmtINR(inr/rates.JPY),  rawChange:0, direction:'up' },
    { symbol:'AED/INR', name:'AED/INR', type:'forex', price: fmtINR(inr/rates.AED),  rawChange:0, direction:'up' },
    { symbol:'SAR/INR', name:'SAR/INR', type:'forex', price: fmtINR(inr/rates.SAR),  rawChange:0, direction:'up' },
  ].filter(x => x.price !== null);
}

/* ── Yahoo Finance with 2025 crumb flow ── */
let _crumb = '', _cookie = '';

async function refreshYahooCrumb() {
  // Get session cookie from fc.yahoo.com
  try {
    const r1 = await timedFetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, 6000);
    const raw = r1.headers.get('set-cookie') || '';
    const m = raw.match(/\bA3=[^;]+/);
    _cookie = m ? m[0] : '';
  } catch (_) {}

  // Get crumb
  const r2 = await timedFetch('https://query1.finance.yahoo.com/v1/test/csrfToken', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Cookie': _cookie,
      'Referer': 'https://finance.yahoo.com/'
    }
  }, 6000);
  if (!r2.ok) throw new Error('crumb ' + r2.status);
  const d = await r2.json();
  _crumb = d.crumb || '';
  if (!_crumb) throw new Error('empty crumb');
}

async function getYahoo() {
  if (!_crumb) await refreshYahooCrumb();

  const symbols = [
    '^BSESN','^NSEI','^CNXBANK','^NSMIDCP',
    'GC=F','SI=F','CL=F','BZ=F','NG=F','HG=F',
    'GOLDBEES.NS',
    'RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS',
    'ICICIBANK.NS','SBIN.NS','BHARTIARTL.NS','ITC.NS',
    '^GSPC','^DJI','^IXIC'
  ].join(',');

  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=${encodeURIComponent(_crumb)}`;
  const r = await timedFetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Cookie': _cookie,
      'Referer': 'https://finance.yahoo.com/',
      'Accept': 'application/json'
    }
  }, 10000);

  if (r.status === 401 || r.status === 403) {
    _crumb = ''; _cookie = '';
    throw new Error('crumb expired ' + r.status);
  }
  if (!r.ok) throw new Error('yahoo ' + r.status);

  const json = await r.json();
  const quotes = json?.quoteResponse?.result || [];

  const NAMES = {
    '^BSESN':'Sensex','^NSEI':'Nifty 50','^CNXBANK':'Bank Nifty','^NSMIDCP':'Nifty Midcap',
    'GC=F':'Gold','SI=F':'Silver','CL=F':'Crude WTI','BZ=F':'Brent Crude',
    'NG=F':'Nat. Gas','HG=F':'Copper','GOLDBEES.NS':'Gold ETF',
    'RELIANCE.NS':'Reliance','TCS.NS':'TCS','HDFCBANK.NS':'HDFC Bank',
    'INFY.NS':'Infosys','ICICIBANK.NS':'ICICI Bank','SBIN.NS':'SBI',
    'BHARTIARTL.NS':'Airtel','ITC.NS':'ITC',
    '^GSPC':'S&P 500','^DJI':'Dow Jones','^IXIC':'Nasdaq'
  };
  const TYPES = {
    '^BSESN':'index','^NSEI':'index','^CNXBANK':'index','^NSMIDCP':'index',
    '^GSPC':'index','^DJI':'index','^IXIC':'index',
    'GC=F':'commodity','SI=F':'commodity','CL=F':'commodity','BZ=F':'commodity',
    'NG=F':'commodity','HG=F':'commodity',
    'GOLDBEES.NS':'etf',
    'RELIANCE.NS':'stock','TCS.NS':'stock','HDFCBANK.NS':'stock',
    'INFY.NS':'stock','ICICIBANK.NS':'stock','SBIN.NS':'stock',
    'BHARTIARTL.NS':'stock','ITC.NS':'stock'
  };

  return quotes.map(q => {
    const p = q.regularMarketPrice;
    const c = q.regularMarketChange ?? 0;
    const pc = q.regularMarketChangePercent ?? 0;
    if (p == null) return null;
    const isINR = q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO');
    const fmtP = isINR ? fmtINR(p) : (
      ['GC=F','SI=F','CL=F','BZ=F','NG=F','HG=F'].includes(q.symbol) ? fmtUSD(p) : p.toLocaleString('en-US', {maximumFractionDigits:2})
    );
    return {
      symbol: q.symbol,
      name: NAMES[q.symbol] || q.symbol,
      type: TYPES[q.symbol] || 'stock',
      price: fmtP,
      change: `${c>=0?'+':''}${c.toFixed(2)} (${pc>=0?'+':''}${pc.toFixed(2)}%)`,
      rawChange: c,
      direction: c >= 0 ? 'up' : 'down',
      marketState: q.marketState || 'CLOSED'
    };
  }).filter(Boolean);
}

/* ── Static fallback — always shows realistic data labels ── */
function getFallback() {
  return [
    { symbol:'SENSEX',  name:'Sensex',     type:'index',    price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'NIFTY',   name:'Nifty 50',   type:'index',    price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'BNIFTY',  name:'Bank Nifty', type:'index',    price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'USDINR',  name:'USD/INR',    type:'forex',    price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'GOLD',    name:'Gold',       type:'commodity',price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'CRUDE',   name:'Crude WTI',  type:'commodity',price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'SILVER',  name:'Silver',     type:'commodity',price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'SP500',   name:'S&P 500',    type:'index',    price:'—', change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
  ];
}

const ORDER = { index:0, forex:1, commodity:2, etf:3, stock:4 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') return res.status(405).end();

  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  let items = [];
  const sources = [];

  /* 1. Yahoo Finance */
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      items = await getYahoo();
      sources.push('yahoo');
      break;
    } catch (e) {
      console.warn('[market] yahoo attempt', attempt + 1, e.message);
      if (attempt === 0 && e.message.includes('expired')) {
        try { await refreshYahooCrumb(); } catch (_) {}
      }
    }
  }

  /* 2. Forex from er-api (replaces/supplements Yahoo forex) */
  try {
    const fx = await getForex();
    sources.push('er-api');
    for (const f of fx) {
      const idx = items.findIndex(i => i.symbol === f.symbol);
      if (idx >= 0) items[idx] = f;
      else items.push(f);
    }
  } catch (e) {
    console.warn('[market] forex', e.message);
  }

  /* 3. If nothing worked, stale cache or fallback */
  if (!items.length) {
    if (_cache) return res.status(200).json({ ..._cache, cached:true, stale:true });
    return res.status(200).json({ items: getFallback(), sources:['fallback'], fetchedAt: new Date().toISOString(), count:8 });
  }

  items.sort((a, b) => (ORDER[a.type]??9) - (ORDER[b.type]??9));

  const result = { items, sources, fetchedAt: new Date().toISOString(), count: items.length };
  _cache = result; _cacheAt = Date.now();
  return res.status(200).json(result);
}
