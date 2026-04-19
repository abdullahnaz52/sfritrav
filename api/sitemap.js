export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const base = 'https://sfritrav.com';
  const articles = [
    { title:'10 Morning Habits That Transform Your Health in 2025', slug:'10-morning-habits-transform-health-2025', cat:'Health & Lifestyle', date:'Wed, 15 Apr 2025 06:00:00 +0530', excerpt:'Science-backed morning routines that top doctors and wellness experts swear by.' },
    { title:'15 Best Budget Travel Destinations in India for 2025', slug:'best-budget-travel-destinations-india-2025', cat:'Travel', date:'Tue, 14 Apr 2025 06:00:00 +0530', excerpt:'Incredible places across India where ₹5,000 a day gets you luxury-level experiences.' },
    { title:"India's Union Budget 2025: What It Means for the Common Man", slug:'india-election-budget-2025-analysis', cat:'India News', date:'Mon, 13 Apr 2025 06:00:00 +0530', excerpt:'A plain-language breakdown of Budget 2025\'s biggest announcements.' },
    { title:'IPL 2025: Team-by-Team Preview and Bold Predictions', slug:'ipl-2025-preview-teams-predictions', cat:'Sports', date:'Sun, 12 Apr 2025 06:00:00 +0530', excerpt:'Full squad analysis, key player battles, and trophy predictions.' },
    { title:'The Complete Skincare Routine for Indian Skin Tones: 2025', slug:'skincare-routine-indian-women-2025', cat:"Women's Health", date:'Sat, 11 Apr 2025 06:00:00 +0530', excerpt:'Dermatologist-approved skincare tailored for Indian skin.' },
  ];
  const items = articles.map(a=>`<item><title><![CDATA[${a.title}]]></title><link>${base}/pages/article.html?slug=${a.slug}</link><guid isPermaLink="true">${base}/pages/article.html?slug=${a.slug}</guid><description><![CDATA[${a.excerpt}]]></description><pubDate>${a.date}</pubDate><category><![CDATA[${a.cat}]]></category></item>`).join('');
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>SfriTrav — News, Health, Travel, Sports &amp; More</title><link>${base}</link><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/><description>Your complete daily read from India.</description><language>en-IN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  res.setHeader('Content-Type','application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=3600');
  return res.status(200).send(rss);
}
