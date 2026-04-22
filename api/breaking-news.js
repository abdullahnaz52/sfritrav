/**
 * /api/breaking-news.js
 * Real headlines from BBC, Reuters, NDTV, TOI, Al Jazeera, Hindu, Mint RSS
 * No API key needed. Cached 5 minutes.
 */

const FEEDS = [
  { url:'https://feeds.bbci.co.uk/news/world/rss.xml',                    src:'BBC World',  w:3 },
  { url:'https://feeds.bbci.co.uk/news/rss.xml',                          src:'BBC',        w:3 },
  { url:'https://feeds.reuters.com/reuters/topNews',                       src:'Reuters',    w:3 },
  { url:'https://www.aljazeera.com/xml/rss/all.xml',                      src:'Al Jazeera', w:3 },
  { url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',          src:'NYT',        w:2 },
  { url:'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',      src:'TOI',        w:3 },
  { url:'https://feeds.feedburner.com/ndtvnews-top-stories',               src:'NDTV',       w:3 },
  { url:'https://www.thehindu.com/news/national/feeder/default.rss',       src:'The Hindu',  w:2 },
  { url:'https://www.livemint.com/rss/news',                               src:'Mint',       w:2 },
  { url:'https://www.moneycontrol.com/rss/marketsnews.xml',                src:'MoneyCtrl',  w:2 },
  { url:'https://sports.ndtv.com/rss/all',                                 src:'NDTV Sports',w:1 },
  { url:'https://feeds.feedburner.com/gadgets360-latest',                  src:'Gadgets360', w:1 },
];

const SRC_CAT = {
  'BBC World':'global-news','BBC':'global-news','Reuters':'global-news',
  'Al Jazeera':'global-news','NYT':'global-news','TOI':'india-news',
  'NDTV':'india-news','The Hindu':'india-news','Mint':'business',
  'MoneyCtrl':'business','NDTV Sports':'sports','Gadgets360':'technology'
};


  const re = /<item[\s>]([\s\S]*?)<\/item>/gi;
  const items = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const getTag = (tag) => {
      const r2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m2 = r2.exec(b);
      return m2 ? m2[1].replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/<[^>]+>/g,'').trim() : '';
    };
    const title = getTag('title');
    if (title && title.length > 12 && title.length < 200) items.push(title);
  }
  return items;
}

async function fetchFeed(feed) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(feed.url, {
      signal:  ctrl.signal,
      headers: { 'User-Agent':'SfriTrav/2.0 RSS', Accept:'application/rss+xml,text/xml,*/*' }
    });
    clearTimeout(timer);
    if (!r.ok) return [];
    const xml   = await r.text();
    const items = extractItems(xml).slice(0, 7);
    return items.map(t => ({ title:t, src:feed.src, w:feed.w }));
  } catch { clearTimeout(timer); return []; }
}

let _cache = null, _cacheAt = 0;
const TTL = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).end();

  if (_cache && Date.now() - _cacheAt < TTL) {
    return res.status(200).json({ ..._cache, cached:true });
  }

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  let all = [];
  for (const r of results) if (r.status === 'fulfilled') all.push(...r.value);

  if (!all.length) {
    if (_cache) return res.status(200).json({ ..._cache, cached:true, stale:true });
    return res.status(200).json({ headlines:[], fetchedAt:new Date().toISOString() });
  }

  // Deduplicate by first 50 chars of title
  const seen = new Set();
  const unique = all.filter(i => {
    const k = i.title.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,45);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Sort by weight (trusted sources first), take top 30
  unique.sort((a,b) => b.w - a.w);
  const headlines = unique.slice(0,30).map(i => ({ title:i.title, src:i.src, category: SRC_CAT[i.src] || 'india-news' }));

  const result = { headlines, fetchedAt:new Date().toISOString(), count:headlines.length };
  _cache = result; _cacheAt = Date.now();
  return res.status(200).json(result);
}
