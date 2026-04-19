/**
 * /api/generate-article.js
 * Generates articles using Groq API (free tier)
 * Model: llama-3.3-70b-versatile
 * Sign up free at: https://console.groq.com
 */

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const rateLimitStore = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  let r = rateLimitStore.get(ip) || { count: 0, reset: now + 60000 };
  if (now > r.reset) { r.count = 0; r.reset = now + 60000; }
  r.count++; rateLimitStore.set(ip, r);
  return r.count <= 20;
}
function sanitize(s) { return typeof s === 'string' ? s.replace(/[<>&"'`]/g, '').substring(0, 300) : ''; }
function slugify(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100); }

const CAT_CONTEXT = {
  'health':        'Health tips, fitness, nutrition, preventive care, diseases, wellness habits for Indian audiences',
  'travel':        'Travel destinations in India and worldwide, itineraries, budget travel, hidden gems, travel tips',
  'politics':      'Indian and global politics, elections, government policies, geopolitics',
  'entertainment': 'Bollywood, Hollywood, OTT series, celebrities, movies, music, awards',
  'sports':        'Cricket, IPL, football, kabaddi, Olympics, Indian sports, athlete profiles',
  'technology':    'Smartphones, gadgets, AI, apps, tech companies, reviews, how-to guides',
  'business':      'Indian stock market, startups, economy, personal finance, investing, Sensex, Nifty',
  'women-health':  "Women's health, PCOS, skincare, fertility, hormones, beauty tips for Indian women",
  'men-health':    "Men's health, fitness, testosterone, grooming, hair loss, lifestyle tips",
  'food':          'Indian recipes, restaurant reviews, food trends, nutrition, street food, cooking tips',
  'environment':   'Climate change in India, pollution, sustainable living, weather events, conservation',
  'fashion':       'Fashion trends, styling tips, Indian fashion, beauty products, makeup, skincare',
  'mental-health': 'Mental health awareness, stress, anxiety, depression, therapy, mindfulness for Indian readers',
  'jobs':          'Government jobs in India, UPSC, SSC, private sector careers, job tips, resume advice',
  'ayurveda':      'Ayurvedic remedies, herbs, holistic wellness, traditional Indian medicine, home remedies',
  'kids':          'Parenting tips, child development, education, school, kids health, activities for children',
  'global-news':   'International news, world affairs, global events, foreign policy, conflicts, diplomacy',
  'india-news':    'Breaking news from India, current events, government announcements, economy, society',
};

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  let category, topic;
  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    category = sanitize(body.category || 'health');
    topic    = sanitize(body.topic    || 'Health tips for 2025');
  } catch { return res.status(400).json({ error: 'Invalid request body' }); }

  const validCats = Object.keys(CAT_CONTEXT);
  if (!validCats.includes(category)) category = 'health';

  const systemPrompt = `You are a professional journalist and content editor for SfriTrav.com, a popular Indian news and lifestyle blog. 
Write in clear, modern English. Be factual, helpful, and engaging. 
Target audience: Indian readers aged 18-45.
Format your response as a single valid JSON object — no markdown fences, no extra text.`;

  const userPrompt = `Write a detailed blog article about: "${topic}"
Category: ${category} — Context: ${CAT_CONTEXT[category]}

Requirements:
- 500-800 words, well-structured with H2 subheadings
- SEO-optimised with natural keywords
- Include specific facts, numbers, and actionable advice
- Relevant to Indian readers where applicable
- Mention current year (2025) context where relevant

Return ONLY this JSON (no code fences, no extra text):
{
  "title": "Compelling SEO headline under 70 chars",
  "excerpt": "Engaging meta description 120-155 chars",
  "readTime": "X min",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "body": "Full article HTML using only <h2><h3><p><ul><li><ol><strong><em><blockquote><a> tags",
  "slug": "url-friendly-slug-under-60-chars"
}`;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(200).json(mockArticle(topic, category));

    const response = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    });

    if (!response.ok) { const e = await response.text(); console.error('Groq error:', response.status, e); return res.status(200).json(mockArticle(topic, category)); }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let article;
    try {
      const clean = content.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      article = JSON.parse(clean);
    } catch { console.error('JSON parse fail:', content.substring(0,200)); return res.status(200).json(mockArticle(topic, category)); }

    article.title   = (article.title   || topic).substring(0, 200);
    article.excerpt = (article.excerpt || '').substring(0, 200);
    article.slug    = (article.slug    || slugify(article.title)).substring(0, 100);
    article.tags    = (article.tags    || []).slice(0, 8).map(t => String(t).substring(0, 50));
    article.readTime = article.readTime || '6 min';
    article.body    = (article.body    || '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').replace(/on\w+="[^"]*"/g,'');
    article.category = category;

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(article);

  } catch (err) { console.error('generate-article error:', err); return res.status(200).json(mockArticle(topic, category)); }
}

function mockArticle(topic, category) {
  return {
    title: `${topic}: Complete Guide for 2025`,
    excerpt: `Everything you need to know about ${topic}. Expert tips, facts, and actionable advice for Indian readers in 2025.`,
    readTime: '5 min', category,
    tags: [topic, category, 'India', '2025', 'Guide'],
    slug: slugify(topic),
    body: `<p>This comprehensive guide covers everything you need to know about <strong>${topic}</strong> in 2025.</p>
<h2>Why This Matters</h2>
<p>Understanding ${topic} is increasingly important for Indians today. With changing lifestyle patterns and growing awareness, this topic has never been more relevant.</p>
<h2>Key Facts</h2>
<p>Research and expert opinion consistently point to several important considerations. Staying informed helps you make better decisions for yourself and your family.</p>
<h2>Practical Advice</h2>
<p>Start with small, sustainable changes. Consult qualified professionals for personalised guidance. Use reliable sources for ongoing information.</p>
<h2>Next Steps</h2>
<p>Take action today. Share this article with someone who could benefit from it. Bookmark SfriTrav.com for daily updates on ${category} and more.</p>`
  };
}
