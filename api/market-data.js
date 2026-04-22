/**
 * /api/market-data.js — Live Market Ticker
 * 100% free, no API keys required:
 *   - CoinGecko public API  → crypto prices
 *   - open.er-api.com       → forex (USD/INR etc.)
 *   - metals.live           → Gold, Silver spot prices
 * Indian indices shown as reference (no free real-time NSE/BSE API exists)
 */

const CACHE_TTL = 10 * 60 * 1000;
const EDGE_TTL  = 60;

let _cache = null, _cacheAt = 0;

function timedFetch(url, opts, ms = 12000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...opts, signal: c.signal })
    .then(r => { clearTimeout(t); return r; })
    .catch(e => { clearTimeout(t); throw e; });
}

async function getCrypto() {
  const ids = 'bitcoin,ethereum,binancecoin,solana,ripple,dogecoin,cardano';
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const r = await timedFetch(url, { headers: { Accept: 'application/json' } }, 10000);
  if (!r.ok) throw new Error('CoinGecko ' + r.status);
  const d = await r.json();
  const map = { bitcoin:'Bitcoin', ethereum:'Ethereum', binancecoin:'BNB', solana:'Solana', ripple:'XRP', dogecoin:'Dogecoin', cardano:'Cardano' };
  return Object.entries(map).map(([id, name]) => {
    const coin = d[id]; if (!coin) return null;
    const p = coin.usd || 0, chg = coin.usd_24h_change || 0;
    const s = chg >= 0 ? '+' : '';
    const fmt = p >= 1000 ? '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 }) : p >= 1 ? '$' + p.toFixed(2) : '$' + p.toFixed(4);
    return { name, type:'crypto', price:fmt, rawPrice:p, change:`${s}${chg.toFixed(2)}%`, rawChange:chg, direction:chg>=0?'up':'down', marketState:'REGULAR', source:'coingecko' };
  }).filter(Boolean);
}

async function getForex() {
  const r = await timedFetch('https://open.er-api.com/v6/latest/USD', { headers:{ Accept:'application/json' } }, 8000);
  if (!r.ok) throw new Error('er-api ' + r.status);
  const d = await r.json();
  if (d.result !== 'success') throw new Error('er-api error');
  const rates = d.rates || {}, inr = rates.INR;
  if (!inr) throw new Error('no INR');
  const pairs = [
    {name:'USD/INR',val:inr}, {name:'EUR/INR',val:rates.EUR?inr/rates.EUR:null},
    {name:'GBP/INR',val:rates.GBP?inr/rates.GBP:null}, {name:'JPY/INR',val:rates.JPY?inr/rates.JPY:null},
    {name:'AED/INR',val:rates.AED?inr/rates.AED:null}, {name:'SAR/INR',val:rates.SAR?inr/rates.SAR:null},
    {name:'SGD/INR',val:rates.SGD?inr/rates.SGD:null}, {name:'CNY/INR',val:rates.CNY?inr/rates.CNY:null},
    {name:'CAD/INR',val:rates.CAD?inr/rates.CAD:null}, {name:'AUD/INR',val:rates.AUD?inr/rates.AUD:null},
  ].filter(p => p.val);
  return pairs.map(p => ({ name:p.name, type:'forex', price:'₹'+parseFloat(p.val).toFixed(2), rawPrice:p.val, change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'er-api' }));
}

async function getMetals(inrRate) {
  const r = await timedFetch('https://metals.live/api/spot', { headers:{ Accept:'application/json' } }, 8000);
  if (!r.ok) throw new Error('metals.live ' + r.status);
  const d = await r.json();
  const lookup = {};
  if (Array.isArray(d)) d.forEach(m => { if (m.metal && m.price) lookup[m.metal.toUpperCase()] = parseFloat(m.price); });
  else if (d && typeof d === 'object') Object.entries(d).forEach(([k,v]) => { lookup[k.toUpperCase()] = parseFloat(v); });

  const inr = inrRate || 84;
  const items = [];
  const goldUsd = lookup['XAU'] || lookup['GOLD'];
  const silverUsd = lookup['XAG'] || lookup['SILVER'];
  if (goldUsd)   items.push({ name:'Gold (oz)',   type:'commodity', price:'₹'+Math.round(goldUsd*inr).toLocaleString('en-IN'),   rawPrice:goldUsd*inr,   change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'metals.live' });
  if (silverUsd) items.push({ name:'Silver (oz)', type:'commodity', price:'₹'+Math.round(silverUsd*inr).toLocaleString('en-IN'), rawPrice:silverUsd*inr, change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'metals.live' });
  return items;
}

function getFuel() {
  return [
    { name:'Petrol Delhi',  type:'fuel', price:'₹94.77/L',  rawPrice:94.77,  change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'static' },
    { name:'Diesel Delhi',  type:'fuel', price:'₹87.67/L',  rawPrice:87.67,  change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'static' },
    { name:'Petrol Mumbai', type:'fuel', price:'₹103.44/L', rawPrice:103.44, change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'static' },
    { name:'Diesel Mumbai', type:'fuel', price:'₹89.97/L',  rawPrice:89.97,  change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'static' },
  ];
}

const ORDER = { index:0, forex:1, commodity:2, fuel:3, crypto:4 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, s-maxage=${EDGE_TTL}, stale-while-revalidate=120`);
  if (req.method !== 'GET') return res.status(405).end();

  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL) return res.status(200).json({ ..._cache, cached:true });

  const [cryptoR, forexR, metalsR] = await Promise.allSettled([getCrypto(), getForex(), getMetals(84)]);

  let crypto = [], forex = [], metals = [], sources = [];
  let inrRate = 84;

  if (forexR.status === 'fulfilled') {
    forex = forexR.value; sources.push('er-api');
    const usdInr = forex.find(f => f.name === 'USD/INR');
    if (usdInr) inrRate = usdInr.rawPrice;
  } else { console.warn('[market] forex:', forexR.reason?.message); }

  if (cryptoR.status === 'fulfilled') { crypto = cryptoR.value; sources.push('coingecko'); }
  else { console.warn('[market] crypto:', cryptoR.reason?.message); }

  if (metalsR.status === 'fulfilled') { metals = metalsR.value; sources.push('metals.live'); }
  else {
    console.warn('[market] metals:', metalsR.reason?.message);
    metals = [
      { name:'Gold (oz)',   type:'commodity', price:'₹'+Math.round(2350*inrRate).toLocaleString('en-IN'), rawPrice:2350*inrRate, change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'fallback' },
      { name:'Silver (oz)', type:'commodity', price:'₹'+Math.round(28*inrRate).toLocaleString('en-IN'),   rawPrice:28*inrRate,   change:'', rawChange:0, direction:'up', marketState:'CLOSED', source:'fallback' },
    ];
  }

  const items = [...forex, ...metals, ...getFuel(), ...crypto]
    .filter(i => i.price && i.price !== '—')
    .sort((a,b) => (ORDER[a.type]??9) - (ORDER[b.type]??9));

  const payload = { items, sources, count:items.length, fetchedAt:new Date().toISOString() };
  _cache = payload; _cacheAt = now;
  return res.status(200).json(payload);
}
