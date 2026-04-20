/**
 * /api/trending.js
 * Fetches trending topics from free RSS feeds
 * No API keys needed
 */

const FEEDS = [
  { url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN', category: 'india-news' },
  { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'india-news' },
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'india-news' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'india-news' },
  { url: 'https://sports.ndtv.com/rss/all', category: 'sports' },
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', category: 'sports' },
  { url: 'https://feeds.feedburner.com/gadgets360-latest', category: 'technology' },
  { url: 'https://www.moneycontrol.com/rss/marketsnews.xml', category: 'business' },
  { url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml', category: 'entertainment' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'health' },
];

function extractTags(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches = []; let m;
  while ((m = regex.exec(xml)) !== null) matches.push(m[1].replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,'').trim());
  return matches;
}

async function fetchFeed(url, category) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'SfriTrav/1.0 (+https://sfritrav.com)' } });
    if (!r.ok) return [];
    const xml = await r.text();
    const titles = extractTags(xml, 'title').slice(1, 8);
    return titles.filter(t => t.length > 10 && t.length < 150).map(title => ({ title, category }));
  } catch { return []; }
}

const rlMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const e = rlMap.get(ip) || { c: 0, r: now + 60000 };
  if (now > e.r) { e.c = 0; e.r = now + 60000; }
  e.c++; rlMap.set(ip, e);
  return e.c > 30;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too Many Requests' });

  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f.url, f.category)));
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  const seen = new Set();
  const unique = all.filter(item => {
    const key = item.title.toLowerCase().substring(0, 40);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  const trending = unique.slice(0, 20).map(({ title, category }) => ({ title, category }));

  if (trending.length === 0) {
    trending.push(
      { title: 'Budget 2026 income tax relief for middle class', category: 'india-news' },
      { title: 'IPL 2026 points table update', category: 'sports' },
      { title: 'Best budget smartphones India April 2026', category: 'technology' },
      { title: 'India heatwave red alert 12 states', category: 'environment' },
      { title: 'Top government job openings April 2026', category: 'jobs' },
    );
  }

  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', 'https://sfritrav.com');
  return res.status(200).json({ trending, fetchedAt: new Date().toISOString() });
}
