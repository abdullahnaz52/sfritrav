/**
 * /api/trending.js
 * Fetches current trending travel/hajj/lifestyle topics from free RSS feeds
 * No API keys needed — uses Google Trends RSS, BBC Travel, Times of India Travel
 * Returns top 10 trending topics relevant to sfritrav categories
 */

const FEEDS = [
  // Google Trends - India
  { url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN', category: 'india-travel' },
  // Times of India - Travel
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936758.cms', category: 'india-travel' },
  // Kashmir Observer
  { url: 'https://kashmirobserver.net/feed/', category: 'kashmir' },
  // Al Arabiya - Hajj/Umrah related
  { url: 'https://english.alarabiya.net/tools/rss', category: 'hajj-umrah' },
  // Fragrantica news (perfume)
  { url: 'https://www.fragrantica.com/news/rss.xml', category: 'perfumes' },
  // Lonely Planet
  { url: 'https://www.lonelyplanet.com/articles/feed', category: 'india-travel' },
];

// Keywords to filter for relevance
const KEYWORD_MAP = {
  kashmir:      ['kashmir', 'srinagar', 'dal lake', 'gulmarg', 'pahalgam', 'leh', 'ladakh', 'jammu', 'amarnath', 'sonamarg'],
  'hajj-umrah': ['hajj', 'umrah', 'makkah', 'madinah', 'mecca', 'medina', 'nusuk', 'pilgrimage', 'kaaba', 'ihram', 'tawaf', 'ramadan'],
  perfumes:     ['perfume', 'fragrance', 'attar', 'oud', 'ittar', 'cologne', 'scent', 'arabica', 'niche perfume'],
  lifestyle:    ['lifestyle', 'wellness', 'food', 'cuisine', 'wazwan', 'travel tips', 'culture', 'fashion', 'health'],
  'india-travel': ['india', 'varanasi', 'rajasthan', 'kerala', 'goa', 'himachal', 'uttarakhand', 'tourism', 'travel'],
};

// Simple XML text extractor (no external lib)
function extractTags(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches = [];
  let m;
  while ((m = regex.exec(xml)) !== null) {
    matches.push(m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim());
  }
  return matches;
}

function scoreItem(text, category) {
  const lower = text.toLowerCase();
  const keywords = KEYWORD_MAP[category] || [];
  return keywords.reduce((score, kw) => score + (lower.includes(kw) ? 2 : 0), 0);
}

async function fetchFeed(feedUrl, category, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SfriTrav/1.0 (+https://sfritrav.com)' }
    });
    clearTimeout(timer);
    if (!resp.ok) return [];
    const xml = await resp.text();
    const titles = extractTags(xml, 'title').slice(1); // skip channel title
    const descriptions = extractTags(xml, 'description').slice(1);
    return titles.map((title, i) => ({
      title: title.substring(0, 150),
      description: (descriptions[i] || '').substring(0, 300),
      category,
      score: scoreItem(title + ' ' + (descriptions[i] || ''), category),
      source: feedUrl,
    }));
  } catch {
    clearTimeout(timer);
    return [];
  }
}

// Rate limiting (simple in-memory, resets per instance cold start)
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > 30; // 30 req/min per IP
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too Many Requests' });

  // Fetch all feeds in parallel (with 5s timeout each)
  const results = await Promise.allSettled(
    FEEDS.map(f => fetchFeed(f.url, f.category))
  );

  const allItems = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value);
  }

  // Deduplicate by title similarity (basic)
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.toLowerCase().substring(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by relevance score descending, take top 15
  const trending = unique
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(({ title, description, category }) => ({ title, description, category }));

  // Fallback topics if feeds all fail
  if (trending.length === 0) {
    trending.push(
      { title: 'Kashmir Spring 2025: Valley of Flowers in Full Bloom', category: 'kashmir', description: '' },
      { title: 'Hajj 2025 Registration Now Open: How to Apply', category: 'hajj-umrah', description: '' },
      { title: 'Best Oud Perfumes for Summer 2025', category: 'perfumes', description: '' }
    );
  }

  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', 'https://sfritrav.com');
  return res.status(200).json({ trending, fetchedAt: new Date().toISOString() });
}
