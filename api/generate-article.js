/**
 * Vercel Serverless Function: /api/generate-article
 * Generates travel/lifestyle articles using Groq API (free tier)
 * Model: llama-3.3-70b-versatile — fast, high quality, FREE
 * Free tier: 14,400 req/day, 30 req/min — plenty for 3 articles/day
 * Sign up at: https://console.groq.com
 * CRON: Called daily via Vercel Cron Jobs
 */

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting store (in-memory, resets per cold start)
const rateLimitStore = new Map();

function checkRateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = ip;
  let record = rateLimitStore.get(key);
  if (!record) { record = { count: 0, reset: now + windowMs }; rateLimitStore.set(key, record); }
  if (now > record.reset) { record.count = 0; record.reset = now + windowMs; }
  record.count++;
  return record.count <= limit;
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"'`]/g, '').substring(0, 200);
}

const CATEGORY_CONTEXT = {
  kashmir: 'Kashmir Valley travel, Dal Lake, Gulmarg, Pahalgam, Srinagar, trekking, houseboats, Kashmiri cuisine, culture, tourism',
  'hajj-umrah': 'Hajj pilgrimage, Umrah journey, Makkah, Madinah, spiritual travel, Islamic tourism, Nusuk platform, SafarArRooh, pilgrimage tips',
  lifestyle: 'Islamic lifestyle, modest living, Kashmiri crafts, travel lifestyle, cultural experiences, food and culture',
  perfumes: 'Arabic attars, oud perfumes, Islamic fragrances, non-alcoholic perfumes, luxury perfumery, SafarOoh shop',
  'india-travel': 'India travel destinations, heritage sites, cultural tourism, budget travel India, offbeat destinations',
};

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'");

  // Only POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit by IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip, 20, 60000)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Validate auth token (set ARTICLE_GEN_SECRET in Vercel env)
  const authHeader = req.headers['authorization'] || '';
  const secret = process.env.ARTICLE_GEN_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    // Allow calls without auth from same origin (browser clients)
    const origin = req.headers.origin || '';
    if (!origin.includes('sfritrav.com') && !origin.includes('localhost')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Parse body
  let category, topic;
  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    category = sanitizeInput(body.category || 'kashmir');
    topic = sanitizeInput(body.topic || 'Kashmir Valley travel tips');
  } catch {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Validate category
  const validCats = ['kashmir', 'hajj-umrah', 'lifestyle', 'perfumes', 'india-travel'];
  if (!validCats.includes(category)) category = 'kashmir';

  const context = CATEGORY_CONTEXT[category] || '';

  const systemPrompt = `You are a senior travel and lifestyle editor for SfriTrav.com, an Indian travel blog focused on Kashmir, Hajj & Umrah pilgrimages, luxury perfumes, and lifestyle. 
Your writing is expert, warm, culturally sensitive, and SEO-optimised for Indian audiences.
Write in clear British English with an authoritative but approachable tone.
Always provide factually accurate, helpful information.
Format responses as clean JSON only — no markdown code fences.`;

  const userPrompt = `Write a detailed blog article about: "${topic}"

Context for this category (${category}): ${context}

The article should:
- Be 600-900 words, well-structured with H2/H3 subheadings
- Be SEO-optimised with natural keyword placement
- Include practical, actionable advice
- Reference SafarArRooh (https://safararrooh.com) for Hajj/Umrah, Nusuk (https://nusuk.sa), or SafarOoh Shop (https://safarooh.shop) for perfumes where naturally relevant (not forced)
- Be culturally accurate and respectful of Islamic practices
- Include specific INR prices where relevant (approximate 2025 figures)

Return ONLY this JSON (no extra text, no markdown fences):
{
  "title": "SEO-optimised article title",
  "excerpt": "155-character meta description / excerpt",
  "readTime": "X min",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "body": "Full article HTML with <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <a> tags only. No scripts. No inline styles.",
  "slug": "url-friendly-slug"
}`;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Return mock article if no API key (dev mode)
      console.warn('GROQ_API_KEY not set — returning mock article');
      return res.status(200).json(mockArticle(topic, category));
    }

    const response = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Free, fast, high quality
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return res.status(200).json(mockArticle(topic, category)); // Graceful fallback
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON response
    let article;
    try {
      // Strip any accidental markdown fences
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      article = JSON.parse(clean);
    } catch {
      console.error('JSON parse failed:', content.substring(0, 200));
      return res.status(200).json(mockArticle(topic, category));
    }

    // Sanitize output
    article.title = (article.title || topic).substring(0, 200);
    article.excerpt = (article.excerpt || '').substring(0, 200);
    article.slug = (article.slug || slugify(article.title)).substring(0, 100);
    article.tags = (article.tags || []).slice(0, 8).map(t => String(t).substring(0, 50));
    article.readTime = article.readTime || '7 min';
    // Body: strip script tags for safety
    article.body = (article.body || '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/g, '');

    // Cache-Control: articles are good for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(article);

  } catch (err) {
    console.error('generate-article error:', err);
    return res.status(200).json(mockArticle(topic, category));
  }
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}

function mockArticle(topic, category) {
  return {
    title: `Discover ${topic}: A Complete Travel Guide`,
    excerpt: `Everything you need to know about ${topic}. Expert tips, practical advice, and insider knowledge for your next journey.`,
    readTime: '6 min',
    tags: [topic, category, 'Travel', 'Guide', 'India'],
    slug: slugify(`discover-${topic}`),
    body: `<p>Welcome to your complete guide to <strong>${topic}</strong>. This is one of the most sought-after experiences in the region, and with good reason.</p>
<h2>Getting Started</h2>
<p>Planning your visit requires some advance preparation. The best time to visit is typically between October and March when the weather is most favorable.</p>
<h2>What to Expect</h2>
<p>The experience is truly unique — a blend of culture, natural beauty, and authentic local hospitality that you won't find anywhere else in India.</p>
<h2>Practical Information</h2>
<p>Budget approximately ₹3,000–₹8,000 per day inclusive of accommodation, meals, and local transport. Book in advance during peak season.</p>
<h2>Final Thoughts</h2>
<p>Whether you're a first-time visitor or returning traveller, this destination never ceases to inspire. Add it to your bucket list today.</p>`
  };
}
