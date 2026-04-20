/**
 * /api/market-data.js  — SfriTrav Live Market Ticker
 *
 * Sources (tried in order, first success wins):
 *   1. Yahoo Finance  — Sensex, Nifty, stocks, commodities, forex
 *      Uses proper crumb/cookie auth (required since 2024)
 *   2. stooq.com      — Indian indices backup (free CSV, no auth)
 *   3. open.er-api.com — Forex rates (completely free, no key)
 *
 * Edge-cached 60 s on Vercel. Falls back gracefully on any failure.
 */

/* ── symbols ────────────────────────────────────────────────── */
const SYMBOLS = [
  '^BSESN',      // Sensex
  '^NSEI',       // Nifty 50
  '^CNXBANK',    // Bank Nifty
  '^NSMIDCP',    // Nifty Midcap
  'USDINR=X',    // USD/INR
  'EURINR=X',    // EUR/INR
  'GBPINR=X',    // GBP/INR
  'GC=F',        // Gold (USD/oz)
  'SI=F',        // Silver (USD/oz)
  'CL=F',        // Crude Oil WTI
  'BZ=F',        // Brent Crude
  'NG=F',        // Natural Gas
  'HG=F',        // Copper
  'GOLDBEES.NS', // Gold ETF INR
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'ITC.NS',
  '^GSPC',       // S&P 500
  '^DJI',        // Dow Jones
  '^IXIC',       // Nasdaq
];

const META = {
  '^BSESN':      { name:'Sensex',        unit:'',  type:'index'     },
  '^NSEI':       { name:'Nifty 50',      unit:'',  type:'index'     },
  '^CNXBANK':    { name:'Bank Nifty',    unit:'',  type:'index'     },
  '^NSMIDCP':    { name:'Nifty Midcap',  unit:'',  type:'index'     },
  'USDINR=X':    { name:'USD/INR',       unit:'₹', type:'forex'     },
  'EURINR=X':    { name:'EUR/INR',       unit:'₹', type:'forex'     },
  'GBPINR=X':    { name:'GBP/INR',       unit:'₹', type:'forex'     },
  'GC=F':        { name:'Gold',          unit:'$', type:'commodity' },
  'SI=F':        { name:'Silver',        unit:'$', type:'commodity' },
  'CL=F':        { name:'Crude WTI',     unit:'$', type:'commodity' },
  'BZ=F':        { name:'Brent Crude',   unit:'$', type:'commodity' },
  'NG=F':        { name:'Nat. Gas',      unit:'$', type:'commodity' },
  'HG=F':        { name:'Copper',        unit:'$', type:'commodity' },
  'GOLDBEES.NS': { name:'Gold ETF',      unit:'₹', type:'etf'       },
  'RELIANCE.NS': { name:'Reliance',      unit:'₹', type:'stock'     },
  'TCS.NS':      { name:'TCS',           unit:'₹', type:'stock'     },
  'HDFCBANK.NS': { name:'HDFC Bank',     unit:'₹', type:'stock'     },
  'INFY.NS':     { name:'Infosys',       unit:'₹', type:'stock'     },
  'ICICIBANK.NS':{ name:'ICICI Bank',    unit:'₹', type:'stock'     },
  'SBIN.NS':     { name:'SBI',           unit:'₹', type:'stock'     },
  'BHARTIARTL.NS':{ name:'Airtel',       unit:'₹', type:'stock'     },
  'ITC.NS':      { name:'ITC',           unit:'₹', type:'stock'     },
  '^GSPC':       { name:'S&P 500',       unit:'',  type:'index'     },
  '^DJI':        { name:'Dow Jones',     unit:'',  type:'index'     },
  '^IXIC':       { name:'Nasdaq',        unit:'',  type:'index'     },
};

const ORDER = { index:0, forex:1, commodity:2, etf:3, stock:4 };

function fmtPrice(p, unit) {
  if (p == null || isNaN(p)) return null;
  const n = parseFloat(p);
  if (unit === '₹' && n >= 1000)
    return unit + n.toLocaleString('en-IN', { maximumFractionDigits:2 });
  if (n >= 1000)
    return unit + n.toLocaleString('en-US', { maximumFractionDigits:2 });
  return unit + n.toFixed(2);
}

function fmtChange(chg, pct) {
  if (chg == null || isNaN(chg)) return '';
  const sign = chg >= 0 ? '+' : '';
  const ps   = pct >= 0 ? '+' : '';
  return `${sign}${parseFloat(chg).toFixed(2)} (${ps}${parseFloat(pct).toFixed(2)}%)`;
}

/* ── in-memory cache ───────────────────────────────────────── */
let _cache = null, _cacheAt = 0;
const CACHE_TTL = 55_000; // 55 s

/* ── HTTP helper ────────────────────────────────────────────── */
async function get(url, headers = {}, timeoutMs = 10000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers,
      },
    });
    clearTimeout(timer);
    return r;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/* ══════════════════════════════════════════════════════════════
   SOURCE 1 — Yahoo Finance with crumb authentication
   ══════════════════════════════════════════════════════════════ */
let _yfCrumb = null, _yfCookies = '';

async function getYahooCrumb() {
  // Step 1: hit the main site to get A3 session cookie
  const r1 = await get('https://fc.yahoo.com', {}, 8000);
  const setCookies = r1.headers.get('set-cookie') || '';
  // Extract A3 cookie
  const a3Match = setCookies.match(/A3=[^;]+/);
  _yfCookies = a3Match ? a3Match[0] : '';

  // Step 2: fetch crumb token
  const r2 = await get(
    'https://query1.finance.yahoo.com/v1/test/csrfToken',
    { 'Cookie': _yfCookies, 'Referer': 'https://finance.yahoo.com/' },
    8000
  );
  if (!r2.ok) throw new Error('crumb fetch failed: ' + r2.status);
  const data = await r2.json();
  _yfCrumb = data.crumb;
  if (!_yfCrumb) throw new Error('empty crumb');
  return _yfCrumb;
}

async function fetchYahoo() {
  // Get crumb if we don't have one
  if (!_yfCrumb) await getYahooCrumb();

  const symList = SYMBOLS.join(',');
  const url = `https://query1.finance.yahoo.com/v8/finance/quote` +
    `?symbols=${encodeURIComponent(symList)}&crumb=${encodeURIComponent(_yfCrumb)}` +
    `&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,marketState`;

  const r = await get(url, {
    'Cookie':  _yfCookies,
    'Referer': 'https://finance.yahoo.com/',
  });

  // If 401 crumb expired — reset and throw so caller retries once
  if (r.status === 401 || r.status === 403) {
    _yfCrumb = null; _yfCookies = '';
    throw new Error('Yahoo crumb expired: ' + r.status);
  }
  if (!r.ok) throw new Error('Yahoo HTTP ' + r.status);

  const json = await r.json();
  const quotes = json?.quoteResponse?.result || [];
  if (!quotes.length) throw new Error('Yahoo returned empty result');

  const items = [];
  for (const q of quotes) {
    const m = META[q.symbol]; if (!m) continue;
    const price = q.regularMarketPrice;
    if (price == null) continue;
    items.push({
      symbol:      q.symbol,
      name:        m.name,
      type:        m.type,
      price:       fmtPrice(price, m.unit),
      rawPrice:    price,
      change:      fmtChange(q.regularMarketChange, q.regularMarketChangePercent),
      rawChange:   q.regularMarketChange ?? 0,
      rawPct:      q.regularMarketChangePercent ?? 0,
      direction:   (q.regularMarketChange ?? 0) >= 0 ? 'up' : 'down',
      marketState: q.marketState || 'CLOSED',
    });
  }
  items.sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9));
  return items;
}

/* ══════════════════════════════════════════════════════════════
   SOURCE 2 — stooq.com  (CSV, no auth — Indian indices backup)
   ══════════════════════════════════════════════════════════════ */
const STOOQ_SYMBOLS = {
  '^bsesn': { name:'Sensex',    type:'index', unit:'' },
  '^nsei':  { name:'Nifty 50',  type:'index', unit:'' },
  '^nsebank':{ name:'Bank Nifty',type:'index', unit:'' },
};

async function fetchStooq() {
  const results = [];
  for (const [sym, meta] of Object.entries(STOOQ_SYMBOLS)) {
    try {
      const r = await get(
        `https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=csv`,
        { 'Accept': 'text/csv' },
        6000
      );
      if (!r.ok) continue;
      const text = await r.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) continue;
      const cols = lines[1].split(',');
      // Symbol,Date,Time,Open,High,Low,Close,Volume
      const close = parseFloat(cols[6]);
      const open  = parseFloat(cols[3]);
      if (isNaN(close)) continue;
      const chg = close - open;
      const pct = (chg / open) * 100;
      results.push({
        symbol: sym, name: meta.name, type: meta.type,
        price:     fmtPrice(close, meta.unit),
        rawPrice:  close,
        change:    fmtChange(chg, pct),
        rawChange: chg, rawPct: pct,
        direction: chg >= 0 ? 'up' : 'down',
        marketState: 'CLOSED',
      });
    } catch { /* skip */ }
  }
  return results;
}

/* ══════════════════════════════════════════════════════════════
   SOURCE 3 — open.er-api.com  (forex, completely free, no key)
   ══════════════════════════════════════════════════════════════ */
async function fetchForex() {
  const r = await get('https://open.er-api.com/v6/latest/USD', {}, 6000);
  if (!r.ok) throw new Error('er-api HTTP ' + r.status);
  const d = await r.json();
  const rates = d.rates || {};
  const inr = rates.INR;
  if (!inr) throw new Error('no INR rate');
  const items = [];
  const pairs = [
    { sym:'USDINR=X', name:'USD/INR', base:'USD', unit:'₹' },
    { sym:'EURINR=X', name:'EUR/INR', base:'EUR', unit:'₹' },
    { sym:'GBPINR=X', name:'GBP/INR', base:'GBP', unit:'₹' },
    { sym:'JPYINR=X', name:'JPY/INR', base:'JPY', unit:'₹' },
    { sym:'AEDINR=X', name:'AED/INR', base:'AED', unit:'₹' },
    { sym:'SARINR=X', name:'SAR/INR', base:'SAR', unit:'₹' },
  ];
  for (const p of pairs) {
    if (!rates[p.base] && p.base !== 'USD') continue;
    const rate = p.base === 'USD' ? inr : (inr / rates[p.base]);
    items.push({
      symbol: p.sym, name: p.name, type: 'forex',
      price:     fmtPrice(rate, p.unit),
      rawPrice:  rate,
      change:    '', rawChange: 0, rawPct: 0,
      direction: 'up', marketState: 'CLOSED',
    });
  }
  return items;
}

/* ══════════════════════════════════════════════════════════════
   MAIN HANDLER
   ══════════════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') return res.status(405).end();

  // Serve from cache if fresh
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  let items = [];
  let sources = [];

  /* --- Try Yahoo Finance first (most complete data) --- */
  try {
    items = await fetchYahoo();
    sources.push('yahoo');
    console.log('[market] Yahoo OK:', items.length, 'items');
  } catch (e1) {
    console.warn('[market] Yahoo failed:', e1.message);
    // Retry once with fresh crumb
    try {
      _yfCrumb = null; _yfCookies = '';
      items = await fetchYahoo();
      sources.push('yahoo-retry');
      console.log('[market] Yahoo retry OK:', items.length, 'items');
    } catch (e2) {
      console.warn('[market] Yahoo retry failed:', e2.message);
    }
  }

  /* --- Supplement or replace with stooq for Indian indices --- */
  try {
    const stooqItems = await fetchStooq();
    if (stooqItems.length) {
      sources.push('stooq');
      // Fill in any missing index items from Yahoo
      for (const s of stooqItems) {
        const already = items.find(i => i.name === s.name);
        if (!already) items.push(s);
        else if (already.price === null) Object.assign(already, s);
      }
      console.log('[market] Stooq supplemented:', stooqItems.length, 'items');
    }
  } catch (e) {
    console.warn('[market] Stooq failed:', e.message);
  }

  /* --- Always get fresh forex from er-api (free, no auth, reliable) --- */
  try {
    const forexItems = await fetchForex();
    sources.push('er-api');
    for (const f of forexItems) {
      const idx = items.findIndex(i => i.symbol === f.symbol);
      if (idx >= 0) items[idx] = f;   // replace Yahoo forex with er-api (more reliable)
      else items.push(f);
    }
    console.log('[market] Forex OK:', forexItems.length, 'items');
  } catch (e) {
    console.warn('[market] Forex failed:', e.message);
  }

  /* --- Sort final list --- */
  items.sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9));

  /* --- If we got nothing, return stale cache or minimal fallback --- */
  if (!items.length) {
    if (_cache) return res.status(200).json({ ..._cache, cached: true, stale: true });
    return res.status(200).json({ items: [], sources: [], fetchedAt: new Date().toISOString(), error: 'all sources failed' });
  }

  const result = { items, sources, fetchedAt: new Date().toISOString(), count: items.length };
  _cache   = result;
  _cacheAt = Date.now();
  return res.status(200).json(result);
}
