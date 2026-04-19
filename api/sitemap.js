export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const base = 'https://sfritrav.com';
  const now = new Date().toISOString().split('T')[0];
  const cats = ['health','travel','politics','entertainment','sports','technology','business','women-health','men-health','food','environment','fashion','mental-health','jobs','ayurveda','kids','global-news','india-news'];
  const staticPages = [
    { loc:'/', priority:'1.0', changefreq:'daily' },
    { loc:'/pages/about.html', priority:'0.7', changefreq:'monthly' },
    { loc:'/pages/contact.html', priority:'0.6', changefreq:'monthly' },
    { loc:'/pages/search.html', priority:'0.5', changefreq:'monthly' },
    { loc:'/privacy-policy.html', priority:'0.4', changefreq:'yearly' },
    { loc:'/terms.html', priority:'0.4', changefreq:'yearly' },
    { loc:'/disclaimer.html', priority:'0.4', changefreq:'yearly' },
    ...cats.map(c => ({ loc:`/pages/category.html?cat=${c}`, priority:'0.8', changefreq:'daily' }))
  ];
  const articleSlugs = ['10-morning-habits-transform-health-2025','best-budget-travel-destinations-india-2025','india-election-budget-2025-analysis','ipl-2025-preview-teams-predictions','skincare-routine-indian-women-2025','best-smartphones-under-20000-india-2025','sensex-nifty-market-outlook-april-2025','ashwagandha-benefits-science-2025','top-government-jobs-india-april-2025','climate-india-heatwave-2025','mental-health-india-stigma-2025','indian-street-food-guide-2025'];
  const urls = [
    ...staticPages.map(p=>`<url><loc>${base}${p.loc}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
    ...articleSlugs.map(s=>`<url><loc>${base}/pages/article.html?slug=${s}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=3600');
  return res.status(200).send(xml);
}
