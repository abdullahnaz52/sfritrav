/**
 * /api/market-data.js — SfriTrav Live Market Ticker
 *
 * Uses Groq API (compound-beta with web search) to fetch real-time
 * market prices. Groq searches the web and returns current prices.
 * Falls back to er-api for forex if Groq fails.
 * Cached 60s on Vercel edge.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CACHE_TTL = 55_000;
let _cache = null, _cacheAt = 0;

function timedFetch(url, opts, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal })
    .then(r => { clearTimeout(t); return r; })
    .catch(e => { clearTimeout(t); throw e; });
}

/* ── Groq web-search approach ── */
async function fetchViaGroq(apiKey) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const prompt = `Today is ${dateStr}. Search the web for the LATEST real-time market prices right now.

Find current prices for ALL of these:
- BSE Sensex index
- NSE Nifty 50 index  
- Bank Nifty index
- Nifty Midcap index
- USD to INR exchange rate
- EUR to INR exchange rate
- GBP to INR exchange rate
- Gold price (USD per troy ounce)
- Silver price (USD per troy ounce)
- Crude Oil WTI (USD per barrel)
- Brent Crude (USD per barrel)
- Natural Gas (USD per MMBtu)
- Copper (USD per pound)
- S&P 500 index
- Dow Jones index
- Nasdaq Composite index
- Bitcoin price in INR
- Ethereum price in INR

Return ONLY a valid JSON array, no explanation, no markdown, no code fences.
Each object must have exactly these fields:
{"name":"...","price":"...","change":"...","direction":"up or down","type":"index or forex or commodity or crypto"}

For price: include currency symbol (₹ for INR, $ for USD).
For change: format as "+123 (+0.45%)" or "-50 (-0.12%)".
If a price is unavailable, skip that item entirely.`;

  const body = {
    model: 'compound-beta',        // Groq's model with live web search
    max_tokens: 2000,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a financial data assistant. You MUST search the web for current real-time prices. Return ONLY a valid JSON array. No markdown, no explanation.'
      },
      { role: 'user', content: prompt }
    ]
  };

  const r = await timedFetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  }, 25000); // Groq web search needs more time

  if (!r.ok) throw new Error('Groq HTTP ' + r.status);
  const data = await r.json();
  const text = data.choices?.[0]?.message?.content || '';

  // Parse JSON from response — strip any accidental markdown
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Find JSON array in the response
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in Groq response');

  const items = JSON.parse(match[0]);
  if (!Array.isArray(items) || !items.length) throw new Error('Empty array from Groq');

  // Normalise
  return items.map(item => ({
    symbol: item.name,
    name:   item.name,
    type:   item.type || 'index',
    price:  item.price || '—',
    change: item.change || '',
    rawChange: parseFloat((item.change || '0').replace(/[^0-9.\-]/g, '')) || 0,
    direction: item.direction === 'down' ? 'down' : 'up',
    marketState: 'REGULAR'
  })).filter(i => i.price && i.price !== '—');
}

/* ── Fallback: open.er-api for forex only ── */
async function fetchForex() {
  const r = await timedFetch('https://open.er-api.com/v6/latest/USD', {
    headers: { 'Accept': 'application/json' }
  }, 7000);
  if (!r.ok) throw new Error('er-api ' + r.status);
  const d = await r.json();
  const rates = d.rates || {};
  const inr = rates.INR;
  if (!inr) throw new Error('no INR');

  const fmt = (n, sym) => n ? sym + parseFloat(n).toFixed(2) : null;
  return [
    { symbol:'USD/INR', name:'USD/INR', type:'forex', price:fmt(inr,'₹'),                        change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'EUR/INR', name:'EUR/INR', type:'forex', price:fmt(inr/rates.EUR,'₹'),               change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'GBP/INR', name:'GBP/INR', type:'forex', price:fmt(inr/rates.GBP,'₹'),               change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'JPY/INR', name:'JPY/INR', type:'forex', price:fmt(inr/rates.JPY,'₹'),               change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'AED/INR', name:'AED/INR', type:'forex', price:fmt(inr/rates.AED,'₹'),               change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
    { symbol:'SAR/INR', name:'SAR/INR', type:'forex', price:fmt(inr/rates.SAR,'₹'),               change:'', rawChange:0, direction:'up', marketState:'CLOSED' },
  ].filter(x => x.price);
}

const ORDER = { index:0, forex:1, commodity:2, crypto:3, etf:4, stock:5 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') return res.status(405).end();

  // Serve fresh cache
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[market] GROQ_API_KEY not set');
    return res.status(200).json({ items: [], error: 'no api key', fetchedAt: new Date().toISOString() });
  }

  let items = [];
  const sources = [];

  /* 1. Groq web search (primary — gets all prices) */
  try {
    items = await fetchViaGroq(apiKey);
    sources.push('groq');
    console.log('[market] Groq OK:', items.length, 'items');
  } catch (e) {
    console.warn('[market] Groq failed:', e.message);
    // Retry once with slightly different model
    try {
      items = await fetchViaGroq(apiKey);
      sources.push('groq-retry');
    } catch (e2) {
      console.warn('[market] Groq retry failed:', e2.message);
    }
  }

  /* 2. Supplement/replace forex with er-api (more accurate exchange rates) */
  try {
    const fx = await fetchForex();
    sources.push('er-api');
    const fxNames = new Set(fx.map(f => f.name));
    // Remove Groq forex items, add er-api ones (more precise)
    items = items.filter(i => !fxNames.has(i.name));
    items.push(...fx);
    console.log('[market] Forex OK:', fx.length, 'pairs');
  } catch (e) {
    console.warn('[market] Forex failed:', e.message);
  }

  if (!items.length) {
    if (_cache) return res.status(200).json({ ..._cache, cached: true, stale: true });
    return res.status(200).json({ items: [], sources: ['none'], fetchedAt: new Date().toISOString() });
  }

  items.sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9));

  const result = { items, sources, fetchedAt: new Date().toISOString(), count: items.length };
  _cache = result; _cacheAt = Date.now();
  return res.status(200).json(result);
}
