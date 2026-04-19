/**
 * /api/cron-generate.js
 * Vercel Cron Job — runs daily at 00:30 UTC (6:00 AM IST)
 * 1. Fetches current trending topics from /api/trending
 * 2. Picks 3 diverse categories
 * 3. Generates 1 article per category via /api/generate-article
 *
 * Protected by CRON_SECRET header (set in Vercel dashboard)
 * Schedule: "30 0 * * *" in vercel.json
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfritrav.com';

const FALLBACK_TOPICS = {
  kashmir: [
    'Kashmir Spring 2025: Best Time to Visit the Valley',
    'Sonmarg Glacier Trek: Complete Guide for Beginners',
    'Budget Kashmir Trip: See It All Under ₹15,000',
    'Mughal Road Kashmir: The Ultimate Road Trip Guide',
    'Kashmir Tulip Garden 2025: Dates, Tickets & Tips',
    'Nagin Lake vs Dal Lake: Which Should You Choose?',
    'Best Kashmiri Handicrafts: What to Buy and Where',
  ],
  'hajj-umrah': [
    'Umrah Visa from India 2025: Step-by-Step Process',
    'Best Hotels Near Masjid al-Haram for Indian Pilgrims',
    'Hajj 2025 Dates: Everything Indian Pilgrims Need to Know',
    'Madinah Ziyarah Guide: 15 Sacred Sites to Visit',
    'Tawaf Guide for First-Time Umrah Pilgrims',
    'Umrah in Ramadan 2025: Planning Your Spiritual Journey',
    'SafarArRooh Review: Best Hajj Package Operator from India',
  ],
  perfumes: [
    'Top 5 Oud Perfumes Under ₹2,000 Available in India',
    'Difference Between Attar and EDP: A Beginner Guide',
    'Musk Perfumes for Summer: Best Non-Alcoholic Options',
    'Arabic vs Indian Attar: Which is Right for You?',
    'Perfume Layering: How to Create Signature Scents',
    'Best Rose Attars from Taif: Complete Review 2025',
    'Bakhoor & Oud Wood: The Art of Arabian Home Fragrance',
  ],
  lifestyle: [
    'Kashmiri Kehwa: The Perfect Winter Wellness Tea Recipe',
    'Slow Travel in Kashmir: Why You Should Stay Longer',
    'Indian Traveller Packing List for Cold Mountain Destinations',
    'Travel Photography Tips for Kashmir Golden Hour',
    'Best Kashmir Local Experiences Beyond Tourist Spots',
    'How to Eat Well While Travelling in India on a Budget',
    'Mindful Travel: How Pilgrimage Changed the Way I Journey',
  ],
  'india-travel': [
    'Hidden Gems of North India: 10 Underrated Destinations',
    'India Budget Travel 2025: Best Destinations Under ₹5,000',
    'Himachal Pradesh Road Trip: The Ultimate Itinerary',
    'Rajasthan in 7 Days: Complete Itinerary and Budget',
    'Kerala Backwaters: Houseboat Guide for First-Timers',
    'Spiti Valley: The Complete High-Altitude Travel Guide',
    'Northeast India: Why You Should Visit Meghalaya in 2025',
  ],
};

const CATEGORIES = ['kashmir', 'hajj-umrah', 'perfumes', 'lifestyle', 'india-travel'];

function pickThreeCategories() {
  return [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 3);
}

function getRandomFallback(category) {
  const topics = FALLBACK_TOPICS[category] || FALLBACK_TOPICS['india-travel'];
  return topics[Math.floor(Math.random() * topics.length)];
}

async function fetchTrendingTopics() {
  try {
    const res = await fetch(`${SITE_URL}/api/trending`, {
      headers: { 'User-Agent': 'SfriTrav-Cron/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.trending) && data.trending.length > 0 ? data.trending : null;
  } catch {
    return null;
  }
}

function selectTopicForCategory(trending, category, usedTopics) {
  if (trending) {
    const catTopics = trending.filter(t => t.category === category && !usedTopics.has(t.title));
    if (catTopics.length > 0) {
      const picked = catTopics[0];
      usedTopics.add(picked.title);
      return picked.title;
    }
  }
  let topic = getRandomFallback(category);
  let attempts = 0;
  while (usedTopics.has(topic) && attempts < 8) {
    topic = getRandomFallback(category);
    attempts++;
  }
  usedTopics.add(topic);
  return topic;
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[cron] CRON_SECRET not configured');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const results = { date: todayKey, generatedAt: new Date().toISOString(), articles: [], errors: [] };

  console.log(`[cron-generate] Starting for ${todayKey}`);

  const trending = await fetchTrendingTopics();
  console.log(`[cron-generate] Trending: ${trending ? trending.length + ' topics' : 'N/A (fallback mode)'}`);

  const selectedCategories = pickThreeCategories();
  console.log(`[cron-generate] Categories: ${selectedCategories.join(', ')}`);

  const usedTopics = new Set();

  for (let i = 0; i < selectedCategories.length; i++) {
    const category = selectedCategories[i];
    const topic = selectTopicForCategory(trending, category, usedTopics);
    console.log(`[cron-generate] Generating [${category}]: "${topic}"`);

    try {
      const genResponse = await fetch(`${SITE_URL}/api/generate-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-article-secret': process.env.ARTICLE_GEN_SECRET || '',
        },
        body: JSON.stringify({ category, topic, source: 'cron' }),
        signal: AbortSignal.timeout(50000),
      });

      if (!genResponse.ok) {
        const errText = await genResponse.text();
        throw new Error(`HTTP ${genResponse.status}: ${errText.substring(0, 200)}`);
      }

      const article = await genResponse.json();
      results.articles.push({ category, topic, slug: article.slug, title: article.title });
      console.log(`[cron-generate] ✓ "${article.title}"`);
    } catch (err) {
      console.error(`[cron-generate] ✗ [${category}]:`, err.message);
      results.errors.push({ category, topic, error: err.message });
    }

    if (i < selectedCategories.length - 1) {
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  const summary = { success: results.articles.length, failed: results.errors.length, total: selectedCategories.length };
  console.log(`[cron-generate] Done: ${summary.success}/${summary.total} generated`);

  return res.status(200).json({ status: 'completed', summary, results });
}
