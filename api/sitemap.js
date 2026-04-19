/**
 * /api/sitemap.js  →  /sitemap.xml
 * Dynamically generates XML sitemap including static pages + cached articles
 * Vercel serverless function (ESM)
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const base = 'https://sfritrav.com';
  const now = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { loc: '/',                          priority: '1.0', changefreq: 'daily'   },
    { loc: '/pages/about.html',          priority: '0.8', changefreq: 'monthly' },
    { loc: '/pages/contact.html',        priority: '0.7', changefreq: 'monthly' },
    { loc: '/pages/category.html?cat=kashmir',      priority: '0.9', changefreq: 'daily'   },
    { loc: '/pages/category.html?cat=hajj-umrah',   priority: '0.9', changefreq: 'daily'   },
    { loc: '/pages/category.html?cat=lifestyle',    priority: '0.8', changefreq: 'daily'   },
    { loc: '/pages/category.html?cat=perfumes',     priority: '0.8', changefreq: 'daily'   },
    { loc: '/pages/category.html?cat=india-travel', priority: '0.8', changefreq: 'daily'   },
    { loc: '/pages/search.html',         priority: '0.6', changefreq: 'monthly' },
    { loc: '/privacy-policy.html',       priority: '0.4', changefreq: 'yearly'  },
    { loc: '/terms.html',                priority: '0.4', changefreq: 'yearly'  },
    { loc: '/disclaimer.html',           priority: '0.4', changefreq: 'yearly'  },
  ];

  // Known seed article slugs (static list; in production these would come from a KV store or DB)
  const articleSlugs = [
    { slug: 'dal-lake-houseboat-guide-2025',     date: '2025-01-15', cat: 'kashmir'      },
    { slug: 'nusuk-app-hajj-guide',               date: '2025-01-14', cat: 'hajj-umrah'  },
    { slug: 'best-attars-for-hajj',               date: '2025-01-13', cat: 'perfumes'    },
    { slug: 'gulmarg-skiing-guide',               date: '2025-01-12', cat: 'kashmir'     },
    { slug: 'umrah-budget-guide-indians',         date: '2025-01-11', cat: 'hajj-umrah'  },
    { slug: 'kashmiri-cuisine-guide',             date: '2025-01-10', cat: 'lifestyle'   },
    { slug: 'top-arabic-luxury-perfumes-india',   date: '2025-01-09', cat: 'perfumes'    },
    { slug: 'varanasi-72-hour-guide',             date: '2025-01-08', cat: 'india-travel'},
    { slug: 'pahalgam-betaab-valley-guide',       date: '2025-01-07', cat: 'kashmir'     },
  ];

  const urlElements = [];

  // Static pages
  for (const p of staticPages) {
    urlElements.push(`
  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
  }

  // Article pages
  for (const a of articleSlugs) {
    urlElements.push(`
  <url>
    <loc>${base}/pages/article.html?slug=${a.slug}</loc>
    <lastmod>${a.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements.join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
