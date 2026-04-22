export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const base = 'https://sfritrav.com';
  const now  = new Date().toISOString().split('T')[0];

  // Static pages with accurate priorities
  const staticPages = [
    { loc:'/',                        priority:'1.0', changefreq:'hourly'  },
    { loc:'/pages/search.html',       priority:'0.6', changefreq:'daily'   },
    { loc:'/pages/about.html',        priority:'0.5', changefreq:'monthly' },
    { loc:'/pages/contact.html',      priority:'0.4', changefreq:'monthly' },
    { loc:'/privacy-policy.html',     priority:'0.3', changefreq:'yearly'  },
    { loc:'/terms.html',              priority:'0.3', changefreq:'yearly'  },
    { loc:'/disclaimer.html',         priority:'0.3', changefreq:'yearly'  },
  ];

  // Category pages — high priority, updated daily
  const cats = [
    'india-news','global-news','health','sports','entertainment',
    'technology','business','travel','food','fashion',
    'women-health','men-health','mental-health','jobs','ayurveda',
    'kids','environment','politics'
  ];
  const catPages = cats.map(c => ({
    loc: `/pages/category.html?cat=${c}`,
    priority: ['india-news','health','business','technology','sports'].includes(c) ? '0.9' : '0.8',
    changefreq: 'daily'
  }));

  // Seed article slugs — these are the static articles always present
  const seedSlugs = [
    'morning-habits-transform-health',
    'budget-travel-destinations-india',
    'india-economic-outlook',
    'india-cricket-season-preview',
    'skincare-routine-indian-skin',
    'best-smartphones-india-budget',
    'india-stock-market-outlook',
    'ashwagandha-science-benefits',
    'government-jobs-india-latest',
    'india-climate-environment',
    'mental-health-india-awareness',
    'indian-street-food-guide',
    'india-fashion-trends',
    'kids-parenting-india-guide',
    'men-health-fitness-india',
    'politics-india-analysis',
    'global-news-roundup',
    'ayurveda-home-remedies',
  ];

  const allPages = [
    ...staticPages,
    ...catPages,
    ...seedSlugs.map(s => ({ loc:`/pages/article.html?slug=${s}`, priority:'0.7', changefreq:'monthly' }))
  ];

  const urls = allPages.map(p =>
    `<url><loc>${base}${p.loc}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  return res.status(200).send(xml);
}
