/**
 * /api/rss-feed.js  →  /feed.xml
 * Generates RSS 2.0 + Atom feed for feed readers & Google News
 * Vercel serverless function (ESM)
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const base = 'https://sfritrav.com';
  const buildDate = new Date().toUTCString();

  const articles = [
    {
      title: 'Dal Lake Houseboat Experience: The Complete 2025 Guide',
      slug:  'dal-lake-houseboat-guide-2025',
      category: 'Kashmir Travel',
      date: 'Wed, 15 Jan 2025 06:00:00 +0530',
      excerpt: 'Everything you need to know about staying on a traditional shikara-accessed houseboat on the serene Dal Lake in Srinagar — from choosing the right houseboat to what to expect on your first morning.',
      tags: ['Dal Lake','Houseboat','Srinagar','Kashmir'],
    },
    {
      title: 'How to Use the Nusuk App for Hajj 2025: Step-by-Step Guide',
      slug:  'nusuk-app-hajj-guide',
      category: 'Hajj & Umrah',
      date: 'Tue, 14 Jan 2025 06:00:00 +0530',
      excerpt: 'The Saudi Ministry of Hajj and Umrah\'s official Nusuk platform is now mandatory for pilgrims. Here\'s everything you need to register, book, and manage your Hajj journey digitally.',
      tags: ['Nusuk','Hajj 2025','Pilgrimage'],
    },
    {
      title: 'Best Attars (Ittars) to Carry for Hajj & Umrah: 2025 Guide',
      slug:  'best-attars-for-hajj',
      category: 'Perfumes',
      date: 'Mon, 13 Jan 2025 06:00:00 +0530',
      excerpt: 'The Prophet (ﷺ) loved fragrance. Carrying the right non-alcoholic attar on your pilgrimage elevates your spiritual experience. Here are the finest options from Madinah and beyond.',
      tags: ['Attar','Ittar','Hajj Perfume','Islamic Fragrance'],
    },
    {
      title: "Gulmarg Skiing: Asia's Best Ski Resort on a Budget",
      slug:  'gulmarg-skiing-guide',
      category: 'Kashmir Travel',
      date: 'Sun, 12 Jan 2025 06:00:00 +0530',
      excerpt: "Gulmarg is now firmly on the global ski map — with the world's highest gondola and incredible powder snow. Here's how to plan your ski trip from scratch.",
      tags: ['Gulmarg','Skiing','Kashmir Winter'],
    },
    {
      title: 'Umrah on a Budget: Complete Guide for Indian Pilgrims 2025',
      slug:  'umrah-budget-guide-indians',
      category: 'Hajj & Umrah',
      date: 'Sat, 11 Jan 2025 06:00:00 +0530',
      excerpt: 'Performing Umrah from India without breaking the bank is entirely possible. We break down every cost — visa, flights, hotel, food — with real 2025 prices.',
      tags: ['Umrah','India','Budget Pilgrimage'],
    },
    {
      title: 'Kashmiri Cuisine: 15 Dishes You Must Try Before You Leave',
      slug:  'kashmiri-cuisine-guide',
      category: 'Lifestyle',
      date: 'Fri, 10 Jan 2025 06:00:00 +0530',
      excerpt: 'From Rogan Josh to Kahwa tea, Kashmiri cuisine is a centuries-old tradition of warmth and spice. Here are 15 dishes that define the valley.',
      tags: ['Kashmiri Food','Wazwan','Rogan Josh'],
    },
    {
      title: 'Top 10 Arabic Luxury Perfumes Available in India 2025',
      slug:  'top-arabic-luxury-perfumes-india',
      category: 'Perfumes',
      date: 'Thu, 09 Jan 2025 06:00:00 +0530',
      excerpt: "Arabian perfumery's deep oud-and-musk tradition has taken India by storm. Here are 10 luxury Arabic fragrances you can now buy in India — or order online.",
      tags: ['Arabic Perfume','Oud','Luxury Fragrance','India'],
    },
    {
      title: 'Varanasi in 72 Hours: The Definitive Guide',
      slug:  'varanasi-72-hour-guide',
      category: 'India Travel',
      date: 'Wed, 08 Jan 2025 06:00:00 +0530',
      excerpt: 'Three days in the holiest city on the Ganges — how to spend every minute wisely, from the Ganga Aarti to hidden ghats only locals know.',
      tags: ['Varanasi','Ganga','India Travel','Ghats'],
    },
    {
      title: 'Pahalgam & Betaab Valley: Kashmir\'s Crown Jewels',
      slug:  'pahalgam-betaab-valley-guide',
      category: 'Kashmir Travel',
      date: 'Tue, 07 Jan 2025 06:00:00 +0530',
      excerpt: "Pahalgam's meadows, Betaab Valley's Bollywood glamour, and the Lidder River's trout-fishing calm — one destination, three worlds.",
      tags: ['Pahalgam','Betaab Valley','Kashmir','Lidder River'],
    },
  ];

  const items = articles.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${base}/pages/article.html?slug=${a.slug}</link>
      <guid isPermaLink="true">${base}/pages/article.html?slug=${a.slug}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${a.date}</pubDate>
      <category><![CDATA[${a.category}]]></category>
      ${a.tags.map(t => `<category><![CDATA[${t}]]></category>`).join('\n      ')}
      <source url="${base}/feed.xml">SfriTrav</source>
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>SfriTrav — Kashmir Travel, Hajj &amp; Umrah, Lifestyle</title>
    <link>${base}</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Authentic travel guides, Hajj &amp; Umrah tips, perfume reviews and lifestyle content from India.</description>
    <language>en-IN</language>
    <copyright>Copyright ${new Date().getFullYear()} SfriTrav.com</copyright>
    <managingEditor>sfritrav_2026@gmail.com (SfriTrav Team)</managingEditor>
    <webMaster>sfritrav_2026@gmail.com (SfriTrav Team)</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${base}/images/logo.png</url>
      <title>SfriTrav</title>
      <link>${base}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <category>Travel</category>
    <category>Kashmir</category>
    <category>Hajj Umrah</category>
    <category>Lifestyle</category>
    ${items}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(rss);
}
