/**
 * /api/articles.js
 * GET  /api/articles        — returns all KV-stored articles (newest first)
 * POST /api/articles        — saves a new article (internal use by generate-article)
 *
 * Uses Vercel KV (free tier — enable in Vercel dashboard under Storage)
 * Falls back gracefully if KV is not connected yet.
 */

import { kv } from '@vercel/kv';

const KV_LIST_KEY  = 'sfritrav:article_slugs'; // ordered list of slugs
const KV_ART_PFX   = 'sfritrav:article:';      // prefix for each article
const MAX_ARTICLES  = 200;                       // keep newest 200

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET — return all articles ──────────────────────────────────
  if (req.method === 'GET') {
    try {
      const slugs = await kv.lrange(KV_LIST_KEY, 0, MAX_ARTICLES - 1);
      if (!slugs || !slugs.length) return res.status(200).json({ articles: [] });

      const pipeline = kv.pipeline();
      slugs.forEach(s => pipeline.get(KV_ART_PFX + s));
      const results = await pipeline.exec();

      const articles = results
        .map((a, i) => a ? { ...a, slug: slugs[i] } : null)
        .filter(Boolean);

      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ articles, count: articles.length });
    } catch (err) {
      console.warn('[articles] KV read error:', err.message);
      return res.status(200).json({ articles: [], error: 'KV unavailable' });
    }
  }

  // ── POST — save article (called by generate-article.js) ────────
  if (req.method === 'POST') {
    const secret = process.env.ARTICLE_GEN_SECRET;
    const auth   = req.headers['x-article-secret'];
    if (secret && auth !== secret) return res.status(401).json({ error: 'Unauthorized' });

    let article;
    try {
      article = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    } catch { return res.status(400).json({ error: 'Invalid body' }); }

    if (!article || !article.slug || !article.title) {
      return res.status(400).json({ error: 'Missing slug or title' });
    }

    try {
      // Store article object under its slug
      await kv.set(KV_ART_PFX + article.slug, article);
      // Prepend slug to ordered list (newest first), trim to MAX_ARTICLES
      await kv.lpush(KV_LIST_KEY, article.slug);
      await kv.ltrim(KV_LIST_KEY, 0, MAX_ARTICLES - 1);

      console.log('[articles] saved:', article.slug);
      return res.status(200).json({ ok: true, slug: article.slug });
    } catch (err) {
      console.error('[articles] KV write error:', err.message);
      return res.status(500).json({ error: 'KV write failed' });
    }
  }

  return res.status(405).end();
}
