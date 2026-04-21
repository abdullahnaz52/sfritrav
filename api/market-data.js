/**
 * /api/market-data.js — Live Market Ticker
 * Groq (llama-3.3-70b) for indices/stocks/commodities — cached 10 min
 * open.er-api.com for live forex rates — cached 5 min
 * Call limits enforced by in-memory cache — no unnecessary API calls
 */

const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TTL  = 10 * 60 * 1000;
const FOREX_TTL =  5 * 60 * 1000;
const EDGE_TTL  = 60;

let _groqCache = null, _groqAt = 0;
let _fxCache   = null, _fxAt   = 0;

function timedFetch(url, opts, ms = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...opts, signal: c.signal })
    .then(r => { clearTimeout(t); return r; })
    .catch(e => { clearTimeout(t); throw e; });
}

async function getGroqPrices(key) {
  const yr = new Date().getFullYear();
  const r = await timedFetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      temperature: 0.1,
      messages: [
        { role:'system', content:'Return ONLY a raw JSON array. No markdown. No explanation.' },
        { role:'user', content:`Give me current approximate ${yr} market prices as a JSON array.
Include: BSE Sensex, NSE Nifty 50, Bank Nifty, Nifty Midcap 50,
Gold (USD/oz), Silver (USD/oz), Crude Oil WTI (USD/bbl), Brent Crude (USD/bbl),
Natural Gas (USD/MMBtu), Copper (USD/lb),
Reliance Industries, TCS, HDFC Bank, Infosys, ICICI Bank, SBI, Airtel (all INR),
S&P 500, Dow Jones, Nasdaq,
Bitcoin (USD), Ethereum (USD).

Each object: {"name":"...","price":"12345.67","chg":"+123.45","pct":"+0.29","type":"index|commodity|stock|crypto","unit":"INR|USD"}
price and chg are plain numbers with sign. No currency symbols in price field.` }
      ]
    })
  }, 20000);

  if (!r.ok) throw new Error('Groq ' + r.status);
  const d    = await r.json();
  const raw  = (d.choices?.[0]?.message?.content || '').replace(/```[a-z]*\n?/g,'').replace(/```/g,'').trim();
  const m    = raw.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('no JSON array');
  const arr  = JSON.parse(m[0]);
  if (!Array.isArray(arr) || arr.length < 8) throw new Error('too few items');

  return arr.map(i => {
    const p   = parseFloat(i.price) || 0;
    const c   = parseFloat(i.chg)   || 0;
    const pct = parseFloat(i.pct)   || 0;
    if (p <= 0) return null;
    const sym = i.unit === 'INR' ? '₹' : (i.unit === 'USD' ? '$' : '');
    const fmt = (n) => n >= 1000
      ? sym + n.toLocaleString(i.unit==='INR' ? 'en-IN' : 'en-US', {maximumFractionDigits:2})
      : sym + n.toFixed(2);
    const s = c >= 0 ? '+' : '';
    const ps = pct >= 0 ? '+' : '';
    return {
      name: i.name, type: i.type || 'index',
      price: fmt(p), rawPrice: p,
      change: `${s}${c.toFixed(2)} (${ps}${pct.toFixed(2)}%)`,
      rawChange: c, direction: c >= 0 ? 'up' : 'down',
      marketState: 'CLOSED', source: 'groq'
    };
  }).filter(Boolean);
}

async function getLiveForex() {
  const r = await timedFetch('https://open.er-api.com/v6/latest/USD', {
    headers: { Accept:'application/json' }
  }, 7000);
  if (!r.ok) throw new Error('er-api ' + r.status);
  const d = await r.json();
  if (d.result !== 'success') throw new Error('er-api error');
  const rates = d.rates || {}, inr = rates.INR;
  if (!inr) throw new Error('no INR');
  const fmt = n => n ? '₹' + parseFloat(n).toFixed(2) : null;
  return [
    { name:'USD/INR', val:inr },
    { name:'EUR/INR', val:rates.EUR ? inr/rates.EUR : null },
    { name:'GBP/INR', val:rates.GBP ? inr/rates.GBP : null },
    { name:'JPY/INR', val:rates.JPY ? inr/rates.JPY : null },
    { name:'AED/INR', val:rates.AED ? inr/rates.AED : null },
    { name:'SAR/INR', val:rates.SAR ? inr/rates.SAR : null },
    { name:'SGD/INR', val:rates.SGD ? inr/rates.SGD : null },
  ].filter(p => p.val).map(p => ({
    name:p.name, type:'forex', price:fmt(p.val), rawPrice:p.val,
    change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'er-api'
  }));
}

const ORD = {index:0,forex:1,commodity:2,stock:3,crypto:4,etf:5};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, s-maxage=${EDGE_TTL}, stale-while-revalidate=120`);
  if (req.method !== 'GET') return res.status(405).end();

  const key = process.env.GROQ_API_KEY;
  const now = Date.now();
  let items = [], sources = [];

  // Groq (10 min cache)
  if (_groqCache && now - _groqAt < GROQ_TTL) {
    items = [..._groqCache]; sources.push('groq-cache');
  } else if (key) {
    try {
      const gi = await getGroqPrices(key);
      _groqCache = gi; _groqAt = now;
      items = [...gi]; sources.push('groq');
      console.log('[market] Groq OK:', gi.length);
    } catch (e) {
      console.warn('[market] Groq:', e.message);
      if (_groqCache) { items = [..._groqCache]; sources.push('groq-stale'); }
    }
  } else {
    console.warn('[market] GROQ_API_KEY not set');
  }

  // Forex (5 min cache, always replaces Groq forex)
  let fx = [];
  if (_fxCache && now - _fxAt < FOREX_TTL) {
    fx = _fxCache; sources.push('fx-cache');
  } else {
    try {
      fx = await getLiveForex();
      _fxCache = fx; _fxAt = now;
      sources.push('er-api');
      console.log('[market] Forex OK:', fx.length);
    } catch (e) {
      console.warn('[market] Forex:', e.message);
      if (_fxCache) { fx = _fxCache; sources.push('fx-stale'); }
    }
  }

  if (fx.length) {
    const fxSet = new Set(fx.map(f => f.name));
    items = [...items.filter(i => !fxSet.has(i.name)), ...fx];
  }

  if (!items.length) {
    return res.status(200).json({ items:[], sources, fetchedAt:new Date().toISOString(), error: key?'all failed':'no GROQ_API_KEY' });
  }

  items.sort((a,b) => (ORD[a.type]??9) - (ORD[b.type]??9));
  return res.status(200).json({ items, sources, count:items.length, fetchedAt:new Date().toISOString() });
}
