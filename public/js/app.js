/**
 * SfriTrav Main Application
 * - Auto-fetches trending topics via RSS/news APIs
 * - AI-generates 3 articles/day using Claude API (via Vercel serverless)
 * - Renders articles with caching
 * - Newsletter via Formspree
 * - Cookie consent (GDPR)
 * - Full UI interactions
 */
(function () {
  'use strict';

  /* ===== CONFIG ===== */
  const CFG = {
    formspree: 'https://formspree.io/f/xpqkzzak',
    contactEmail: 'sfritrav_2026@gmail.com',
    siteURL: 'https://sfritrav.com',
    articlesPerDay: 3,
    maxArticles: 30,
    cacheTTL: 3600000, // 1 hour
    categories: ['kashmir', 'hajj-umrah', 'lifestyle', 'perfumes', 'india-travel'],
    // Rotating cover images (Unsplash topics)
    imageSets: {
      kashmir: ['https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=80', 'https://images.unsplash.com/photo-1598090894937-9a0e2e66f4e0?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
      'hajj-umrah': ['https://images.unsplash.com/photo-1597474671882-98b0b8e5c0a4?w=800&q=80', 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80', 'https://images.unsplash.com/photo-1580427874238-6f2b6f10db5c?w=800&q=80'],
      lifestyle: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80', 'https://images.unsplash.com/photo-1519121785383-3229633bb75b?w=800&q=80'],
      perfumes: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80'],
      'india-travel': ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', 'https://images.unsplash.com/photo-1532664189809-02133fee698d?w=800&q=80', 'https://images.unsplash.com/photo-1519903124442-39a52d28fa87?w=800&q=80'],
    }
  };

  /* ===== ARTICLE DATA STORE ===== */
  // Curated seed articles (pre-written, SEO-optimised)
  const SEED_ARTICLES = [
    {
      id: 'a001', slug: 'dal-lake-houseboat-guide-2025', category: 'kashmir',
      title: 'Dal Lake Houseboat Experience: The Complete 2025 Guide', 
      excerpt: 'Everything you need to know about staying on a traditional shikara-accessed houseboat on the serene Dal Lake in Srinagar — from choosing the right houseboat to what to expect on your first morning.',
      readTime: '7 min', date: '2025-01-15', featured: true,
      tags: ['Dal Lake', 'Houseboat', 'Srinagar', 'Kashmir', 'Budget Travel'],
      body: `<p>Dal Lake, often called the "Jewel in the Crown of Kashmir," is one of India's most iconic travel experiences. Staying on a houseboat here is a rite of passage for any serious traveller.</p>
<h2>Choosing the Right Houseboat</h2>
<p>There are three main categories: budget (₹1,500–₹3,000/night), mid-range (₹3,000–₹8,000), and luxury (₹8,000+). Most houseboats are family-run, offering authentic Kashmiri hospitality. Look for JKTDC (Jammu & Kashmir Tourism Development Corporation) certified houseboats for verified quality.</p>
<h2>What to Expect</h2>
<p>Your day on Dal Lake begins with the famous floating vegetable market at dawn — an 800-year-old tradition. As your shikara glides between lotus flowers, vendors in wooden boats bring fresh vegetables, flowers, and breakfast items directly to your houseboat. It's a scene that makes time stand still.</p>
<blockquote>"Dal Lake at sunrise, with the Zabarwan mountains reflected in its still waters, is among the world's most meditative experiences." — Traveller's Journal</blockquote>
<h2>Getting There</h2>
<p>Srinagar Airport connects to Delhi, Mumbai, and other major cities. From the airport, take a taxi (~45 min, ₹600–₹900) to the Dal Lake ghat. Your houseboat owner will arrange a shikara pickup.</p>
<h2>Best Time to Visit</h2>
<p>April–June and September–October offer ideal weather (15°C–25°C). Winter (December–February) is magical with snow but cold. Summer bookings fill up fast — reserve 2–3 months in advance.</p>
<h2>Pro Tips</h2>
<ul><li>Negotiate shikara rides in advance (₹300–₹600/hour)</li><li>Try the wazwan feast — a 36-course Kashmiri banquet</li><li>Carry warm layers even in summer — nights get cold</li><li>Use JKTDC helpline 0194-2452690 for certified operators</li></ul>`
    },
    {
      id: 'a002', slug: 'nusuk-app-hajj-guide', category: 'hajj-umrah',
      title: 'How to Use the Nusuk App for Hajj 2025: Step-by-Step Guide',
      excerpt: 'The Saudi Ministry of Hajj and Umrah\'s official Nusuk platform is now mandatory for pilgrims. Here\'s everything you need to register, book, and manage your Hajj journey digitally.',
      readTime: '9 min', date: '2025-01-14',
      tags: ['Nusuk', 'Hajj 2025', 'Digital Hajj', 'Saudi Arabia', 'Pilgrimage'],
      body: `<p>The Nusuk platform (nusuk.sa) has revolutionized how pilgrims plan and execute their Hajj journey. From visa applications to ritual tracking, everything is now on one digital platform.</p>
<h2>Creating Your Nusuk Account</h2>
<p>Visit nusuk.sa or download the Nusuk app. Register with your passport number, email, and phone. You'll receive an OTP verification. Complete your profile with your nationality, Mahram information (for women), and health status.</p>
<h2>Applying for Hajj Package</h2>
<p>Navigate to "Hajj Services" → "Book Hajj Package." You'll see approved packages by your country's quota. Indian pilgrims should check the Haj Committee of India tie-ups. Packages range from economy to VIP, including accommodation, transport, and meals.</p>
<h2>Key Features</h2>
<ul><li><strong>Smart Card:</strong> Your digital Hajj ID — carry it everywhere</li><li><strong>Ritual Guide:</strong> Step-by-step guidance for Tawaf, Sa'i, and more</li><li><strong>Emergency Services:</strong> One-tap distress button with GPS</li><li><strong>Lost & Found:</strong> Report or locate missing pilgrims</li><li><strong>Prayer Times:</strong> Location-based with Masjid al-Haram integration</li></ul>
<h2>For Indian Pilgrims</h2>
<p>Coordinate with the <a href="https://hajcommittee.gov.in" rel="noopener">Haj Committee of India</a> for quota allocations. Private tour operators must be listed on Nusuk for their packages to be valid.</p>`
    },
    {
      id: 'a003', slug: 'best-attars-for-hajj', category: 'perfumes',
      title: 'Best Attars (Ittars) to Carry for Hajj & Umrah: 2025 Guide',
      excerpt: 'The Prophet (ﷺ) loved fragrance. Carrying the right non-alcoholic attar on your pilgrimage elevates your spiritual experience. Here are the finest options from Madinah and beyond.',
      readTime: '6 min', date: '2025-01-13',
      tags: ['Attar', 'Ittar', 'Hajj Perfume', 'Non-alcoholic', 'Islamic Fragrance'],
      body: `<p>Fragrance and spirituality are deeply intertwined in Islamic tradition. The Prophet Muhammad (ﷺ) said: "The best of your worldly assets is fragrance." For Hajj and Umrah, alcohol-free attars are preferred, as alcohol is prohibited in Ihram.</p>
<h2>What is Attar (Ittar)?</h2>
<p>Attar is a natural perfume oil derived from botanical sources through hydro or steam distillation, often over a base of sandalwood oil. It's 100% alcohol-free and highly concentrated — a single drop can last 8–12 hours.</p>
<h2>Top Attars for Pilgrims</h2>
<h3>1. Oud Al Madinah</h3>
<p>The most popular choice. Deep, woody, sacred — this is the scent of Madinah's markets. Available at the Nabulsi stores near Masjid-e-Nabawi.</p>
<h3>2. Musk Tahir (Pure Musk)</h3>
<p>Light, clean, heavenly. Perfect for Ihram when strong fragrances are restricted (apply before entering Ihram state).</p>
<h3>3. Rose of Taif</h3>
<p>From the city of Ta'if — known for its historic rose gardens. Floral, uplifting, and distinctly Arabian.</p>
<h3>4. Black Seed (Habatus Sauda) Blend</h3>
<p>Earthy and therapeutic. Widely available at the Bin Laden Pharmacy and herbal shops in Makkah.</p>
<h2>Where to Buy</h2>
<p>The best attars are found in the old souks of Makkah and Madinah. Online, <a href="https://safarooh.shop" rel="noopener">SafarOoh Shop</a> carries authenticated non-alcoholic attars shipped to India.</p>
<h2>Important Note on Ihram</h2>
<p>Once in Ihram, you cannot apply new fragrance. Apply your attar BEFORE donning Ihram garments. The lingering scent is permissible.</p>`
    },
    {
      id: 'a004', slug: 'gulmarg-skiing-guide', category: 'kashmir',
      title: 'Gulmarg Skiing: Asia\'s Best Ski Resort on a Budget',
      excerpt: 'Gulmarg is now firmly on the global ski map — with the world\'s highest gondola and incredible powder snow. Here\'s how to plan your ski trip from scratch.',
      readTime: '8 min', date: '2025-01-12',
      tags: ['Gulmarg', 'Skiing', 'Kashmir Winter', 'Gondola', 'Snow Sports'],
      body: `<p>At 2,650 metres above sea level, Gulmarg (meaning "Meadow of Flowers") transforms into a white wonderland from December through March. The Gulmarg Gondola — the world's highest operational cable car at 3,980m — gives skiers access to Himalayan runs that rival anything in the Alps.</p>
<h2>Getting to Gulmarg</h2>
<p>Gulmarg is 56km from Srinagar. Shared taxis (₹300–₹400) or private cabs (₹1,500–₹2,000) run regularly. The road is generally well-maintained even in winter, though snowfall can cause occasional delays.</p>
<h2>The Gondola</h2>
<p>Phase 1 (2,600m to 3,100m): ₹900 return. Phase 2 (3,100m to 3,980m): ₹1,600 additional. Buy tickets early morning to avoid queues; online booking is available via the J&K Cable Car Corporation website.</p>
<h2>Ski Rental & Lessons</h2>
<p>Full ski gear rental: ₹800–₹1,200/day. Ski instructors: ₹1,500–₹2,500/half-day. For beginners, stick to the Phase 1 bowl — it has gentler slopes and ESA-certified instructors.</p>
<h2>Where to Stay</h2>
<p>Budget: Hotel Yemberzal (₹2,000–₹3,500/night). Mid-range: Hotel Highlands Park (₹5,000–₹8,000). Luxury: The Khyber Himalayan Resort (₹18,000–₹40,000) — absolutely magnificent with direct slope access.</p>`
    },
    {
      id: 'a005', slug: 'umrah-on-budget-indians', category: 'hajj-umrah',
      title: 'Umrah on a Budget: Complete Guide for Indian Pilgrims 2025',
      excerpt: 'Performing Umrah doesn\'t have to cost a fortune. With careful planning, Indians can complete this blessed journey for ₹60,000–₹90,000 all-inclusive. Here\'s exactly how.',
      readTime: '11 min', date: '2025-01-11',
      tags: ['Budget Umrah', 'Umrah India', 'Cheap Umrah', 'Umrah Tips', 'Pilgrimage Planning'],
      body: `<p>For millions of Indian Muslims, Umrah is a deeply personal spiritual aspiration. The good news: you don't need to wait for Hajj's high costs. With smart planning, Umrah is remarkably affordable.</p>
<h2>Estimated Budget (Per Person)</h2>
<ul><li>Visa fees: ₹5,000–₹8,000</li><li>Return airfare (India–Jeddah): ₹18,000–₹35,000</li><li>Hotel in Makkah (7 nights): ₹15,000–₹25,000</li><li>Hotel in Madinah (4 nights): ₹8,000–₹15,000</li><li>Transport + food: ₹10,000–₹15,000</li><li><strong>Total: ₹56,000–₹98,000</strong></li></ul>
<h2>Getting the Best Airfare</h2>
<p>Book 3–4 months in advance. IndiGo, Air India, and Saudi Airlines offer competitive prices from Mumbai, Delhi, Hyderabad, and Chennai. Avoid Ramadan and school holiday seasons for lower fares.</p>
<h2>Using SafarArRooh & Nusuk</h2>
<p><a href="https://safararrooh.com" rel="noopener">SafarArRooh</a> connects Indian pilgrims with certified tour operators. All packages on their platform are Nusuk-verified, ensuring your Umrah visa is properly processed.</p>
<h2>Accommodation Hacks</h2>
<p>Hotels within 500m of Masjid al-Haram command premium prices. Consider staying in Aziziyah (3km away) — free shuttle buses run 24/7 and you can save 40–60% on accommodation.</p>`
    },
    {
      id: 'a006', slug: 'kashmiri-cuisine-guide', category: 'lifestyle',
      title: 'Kashmiri Cuisine: 15 Dishes You Must Try on Your Visit',
      excerpt: 'From the elaborate Wazwan feast to street-side Noon Chai, Kashmiri food is a world unto itself. Our food editor picks the 15 essential dishes for every visitor.',
      readTime: '7 min', date: '2025-01-10',
      tags: ['Kashmiri Food', 'Wazwan', 'Cuisine', 'Travel Food', 'Srinagar Restaurants'],
      body: `<p>Kashmir's cuisine is a reflection of its landscape — rich, layered, and steeped in centuries of Persian, Central Asian, and Mughal influences. Here are the essential dishes.</p>
<h2>The Wazwan (Royal Feast)</h2>
<p>The centrepiece of Kashmiri culture: a multi-course meat feast cooked by a trained Waza (chef). Rogan Josh, Gushtaba, Tabak Maaz, and Yakhni are the pillars. Book a wazwan at Ahdoos Hotel in Srinagar for the authentic experience (₹1,800–₹2,500 pp).</p>
<h2>Noon Chai (Pink Tea)</h2>
<p>Don't let the bubblegum-pink colour fool you — this salty, cardamom-infused tea made with gunpowder tea and baking soda is genuinely addictive. Available at every street corner, ₹20–₹50/glass.</p>
<h2>Dum Aloo Kashmiri</h2>
<p>Baby potatoes slow-cooked in a fiery yoghurt-based gravy with fennel and dried ginger. Distinctly different from its Punjabi cousin.</p>
<h2>Where to Eat in Srinagar</h2>
<ul><li>Mughal Darbar (Residency Road) — best Wazwan</li><li>Shamyana Hotel — legendary Kashmiri breakfast</li><li>Lhasa Restaurant — for Ladakhi-Kashmiri fusion</li><li>Chai Jaai — best Noon Chai and girda bread</li></ul>`
    },
    {
      id: 'a007', slug: 'luxury-arabic-perfumes-india', category: 'perfumes',
      title: 'Top 10 Arabic Luxury Perfumes Available in India (2025)',
      excerpt: 'From Rasasi to Swiss Arabian, Arabic perfumery has taken India by storm. These 10 bottles are worth every rupee — and you can find them online without the Makkah trip.',
      readTime: '6 min', date: '2025-01-09',
      tags: ['Arabic Perfume', 'Oud', 'Rasasi', 'Swiss Arabian', 'Luxury Fragrance'],
      body: `<p>The global fragrance market has witnessed an Arabian revolution. Indian consumers are increasingly drawn to the rich, long-lasting, and deeply cultural nature of Arabic perfumery.</p>
<h2>1. Rasasi Hawas (Men) — ₹3,800</h2>
<p>A modern aquatic-woody powerhouse that regularly tops "best value" fragrance lists globally. Performance is extraordinary.</p>
<h2>2. Swiss Arabian Shaghaf Oud Ahmar — ₹6,500</h2>
<p>For oud lovers: dark, smoky, rose-inflected. This is the smell of Madinah's old souk in a bottle.</p>
<h2>3. Lattafa Oud For Glory — ₹2,200</h2>
<p>Budget king. Creamy, sweet, and shockingly long-lasting. A crowd-pleaser.</p>
<h2>4. Ajmal Deja Vu White — ₹4,100</h2>
<p>A white floral masterpiece from one of India-UAE's most storied attar houses.</p>
<h2>5. Naseem Banafsaj (Violet) — ₹1,800</h2>
<p>Fresh, unisex, and ultra-long-lasting. Perfect for office and daily wear.</p>
<h2>Where to Buy Authentic Arabic Perfumes in India</h2>
<p><a href="https://safarooh.shop" rel="noopener">SafarOoh Shop</a> sources directly from Saudi and UAE manufacturers, guaranteeing authenticity. Shipping across India in 3–5 days.</p>`
    },
    {
      id: 'a008', slug: 'varanasi-travel-guide', category: 'india-travel',
      title: 'Varanasi in 72 Hours: The Ultimate Spiritual Travel Guide',
      excerpt: 'The world\'s oldest living city overwhelms the senses — in the best way possible. Here\'s how to experience Varanasi deeply in just three days.',
      readTime: '9 min', date: '2025-01-08',
      tags: ['Varanasi', 'Banaras', 'India Travel', 'Ganges', 'Spiritual Travel'],
      body: `<p>Varanasi — also known as Kashi, Banaras, or the City of Light — is perhaps the most profoundly human city on earth. It confronts you with life, death, and transcendence simultaneously.</p>
<h2>Day 1: The Ghats at Dawn</h2>
<p>Wake at 4:30am. Take a boat (₹300–₹500) for the sunrise Ganga Aarti at Dashashwamedh Ghat. Watch priests perform elaborate fire rituals as the Ganges glows orange in the first light. Continue to Manikarnika Ghat — the eternal cremation ghat where fires have burned continuously for 3,500 years.</p>
<h2>Day 2: The Old City</h2>
<p>Get intentionally lost in the lanes of Vishwanath Gali. Visit Kashi Vishwanath Temple (arrive early, long queues). Stop for chai at Blue Lassi Shop (since 1925). Take a cooking class at Aum Restaurant.</p>
<h2>Day 3: Beyond the Ghats</h2>
<p>Day trip to Sarnath (10km, ₹400 auto round trip) — where the Buddha gave his first sermon. The Dhamek Stupa and museum are extraordinary.</p>
<h2>Getting There & Accommodation</h2>
<p>Varanasi has good train connectivity (New Delhi–Varanasi: 12 hrs, ₹800–₹3,500). Stay near Assi Ghat for a quieter but authentic experience. Hotel rates: ₹800–₹15,000 depending on category.</p>`
    },
    {
      id: 'a009', slug: 'pahalgam-betaab-valley', category: 'kashmir',
      title: 'Pahalgam & Betaab Valley: A Complete Travel Guide',
      excerpt: 'Once a shepherd\'s village, Pahalgam is now Kashmir\'s adventure capital — and Betaab Valley is its crown jewel. Trekking, camping, and Bollywood history await.',
      readTime: '8 min', date: '2025-01-07',
      tags: ['Pahalgam', 'Betaab Valley', 'Kashmir Trekking', 'Baisaran Meadows'],
      body: `<p>Pahalgam sits at the confluence of the Lidder River and Sheshnag streams, 96km from Srinagar at an altitude of 2,130m. It's simultaneously Kashmir's most loved and most cinematic destination — over 300 Bollywood films have been shot here.</p>
<h2>Betaab Valley</h2>
<p>Named after the 1983 film "Betaab" (starring Sunny Deol and Amrita Singh), this valley 15km from Pahalgam is a riot of wildflowers, crystal streams, and dramatic peaks. Entry fee: ₹100. Best visited May–September.</p>
<h2>Baisaran (Mini Switzerland)</h2>
<p>Accessible only on horseback or foot (horses: ₹400–₹600 one-way), Baisaran meadow sits above the treeline with panoramic Himalayan views. Start early — crowds thin out by mid-morning.</p>
<h2>Amarnath Yatra Base</h2>
<p>Pahalgam is one of two base camps for the sacred Amarnath Yatra pilgrimage. Registration is through the <a href="https://shriamarnathjishrine.com" rel="noopener">Shri Amarnath Shrine Board</a>. The traditional Pahalgam route is 36km over 3–4 days and is considered the more scenic path.</p>`
    },
  ];

  /* ===== ARTICLE GENERATOR (Auto-generates fresh articles daily via AI) ===== */
  const TOPIC_PROMPTS = [
    { category: 'kashmir', topics: ['Kashmir Valley spring tulips', 'Srinagar Old City Heritage Walk', 'Kashmir Apple Orchards tourism', 'Lolab Valley hidden gem Kashmir', 'Sonamarg winter trek', 'Kashmir carpet weaving heritage', 'Wullar Lake birdwatching'] },
    { category: 'hajj-umrah', topics: ['Umrah visa process 2025', 'Masjid al-Nabawi visit tips', 'Ihram rules explained simply', 'Zamzam water benefits science', 'Mina tent city Hajj experience', 'Women umrah without mahram 2025', 'Nusuk platform new features'] },
    { category: 'lifestyle', topics: ['Islamic minimalist home decor', 'Kashmiri Pashm shawl guide', 'Wazwan feast traditions', 'Henna design trends 2025', 'Modest fashion summer 2025', 'Arabic coffee culture dallah'] },
    { category: 'perfumes', topics: ['Rose of Taif perfume making', 'Best oud perfumes under 5000 rupees', 'Musk fragrances Islamic perspective', 'Arabian perfume history', 'Attar vs EDP which lasts longer', 'Amber fragrance guide'] },
    { category: 'india-travel', topics: ['Ladakh road trip guide', 'Kerala backwaters budget trip', 'Rajasthan heritage forts', 'Meghalaya living root bridges', 'Andaman snorkeling guide', 'Coorg coffee plantations'] },
  ];

  /* ===== LOCAL ARTICLE STORAGE ===== */
  let allArticles = [...SEED_ARTICLES];
  let currentPage = 0;
  const PAGE_SIZE = 6;
  let currentFilter = 'latest';

  /* ===== UTILITIES ===== */
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getCategoryColor(cat) {
    const map = { kashmir: 'cat-kashmir', 'hajj-umrah': 'cat-hajj', lifestyle: 'cat-lifestyle', perfumes: 'cat-perfume', 'india-travel': 'cat-india' };
    return map[cat] || '';
  }

  function getCategoryLabel(cat) {
    const map = { kashmir: '🏔️ Kashmir', 'hajj-umrah': '🕋 Hajj & Umrah', lifestyle: '✨ Lifestyle', perfumes: '🌹 Perfumes', 'india-travel': '🇮🇳 India Travel', food: '🍽️ Food' };
    return map[cat] || cat;
  }

  function getImage(cat, idx = 0) {
    const imgs = CFG.imageSets[cat] || CFG.imageSets.lifestyle;
    return imgs[idx % imgs.length];
  }

  function genId() {
    return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ===== AI ARTICLE GENERATION (calls Vercel serverless function) ===== */
  async function generateAIArticles() {
    // Check if already generated today
    const cacheKey = 'ai_articles_' + new Date().toDateString();
    const cached = await ArticleCache.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      allArticles = [...SEED_ARTICLES, ...parsed];
      return parsed;
    }

    try {
      // Pick 3 random topics (one per article)
      const picks = [];
      const usedCats = new Set();
      while (picks.length < CFG.articlesPerDay) {
        const catData = TOPIC_PROMPTS[Math.floor(Math.random() * TOPIC_PROMPTS.length)];
        if (usedCats.has(catData.category)) continue;
        usedCats.add(catData.category);
        const topic = catData.topics[Math.floor(Math.random() * catData.topics.length)];
        picks.push({ category: catData.category, topic });
      }

      const generated = [];
      for (const pick of picks) {
        const article = await callGenerateAPI(pick.category, pick.topic);
        if (article) generated.push(article);
      }

      if (generated.length) {
        await ArticleCache.set(cacheKey, JSON.stringify(generated));
        await ArticleCache.cacheArticles(generated);
        allArticles = [...generated, ...SEED_ARTICLES];
      }
      return generated;
    } catch (err) {
      console.warn('[AI] Generation failed, using seed articles:', err.message);
      return [];
    }
  }

  async function callGenerateAPI(category, topic) {
    // Call our Vercel serverless function
    const resp = await fetch('/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, topic })
    });
    if (!resp.ok) throw new Error('API ' + resp.status);
    const data = await resp.json();
    return {
      id: genId(),
      slug: data.slug || slugify(data.title || topic),
      category,
      title: Security.sanitizeText(data.title || topic),
      excerpt: Security.sanitizeText(data.excerpt || ''),
      readTime: data.readTime || '6 min',
      date: new Date().toISOString().split('T')[0],
      body: data.body || '',
      tags: data.tags || [topic, category],
      aiGenerated: true,
    };
  }

  /* ===== RENDER FUNCTIONS ===== */
  function renderArticleCard(article) {
    const el = document.createElement('article');
    el.className = 'article-card';
    el.innerHTML = `
      <div class="article-card-img-wrap">
        <img class="article-card-img" data-src="${Security.sanitizeURL(getImage(article.category))}" src="${Security.sanitizeURL(getImage(article.category))}" alt="${Security.sanitizeHTML(article.title)}" loading="lazy" width="400" height="225">
      </div>
      <div class="article-card-body">
        <div class="article-card-cat">
          <span class="category-tag ${getCategoryColor(article.category)}">${getCategoryLabel(article.category)}</span>
        </div>
        <h3 class="article-card-title">
          <a href="/pages/article.html?slug=${encodeURIComponent(article.slug)}">${Security.sanitizeHTML(article.title)}</a>
        </h3>
        <p class="article-card-excerpt">${Security.sanitizeHTML(article.excerpt)}</p>
        <div class="article-card-meta">
          <span>${formatDate(article.date)}</span>
          <span>·</span>
          <span>${article.readTime} read</span>
          ${article.aiGenerated ? '<span class="ai-badge">🤖 AI-written</span>' : ''}
        </div>
      </div>`;
    return el;
  }

  function renderHero(article) {
    const img = document.getElementById('hero-img');
    const cat = document.getElementById('hero-cat');
    const title = document.getElementById('hero-title');
    const excerpt = document.getElementById('hero-excerpt');
    const date = document.getElementById('hero-date');
    const link = document.getElementById('hero-link');
    if (!img) return;
    img.src = getImage(article.category, 0);
    img.alt = article.title;
    img.parentElement.classList.remove('skeleton');
    if (cat) { cat.textContent = getCategoryLabel(article.category); cat.className = `category-tag ${getCategoryColor(article.category)}`; }
    if (title) title.textContent = article.title;
    if (excerpt) excerpt.textContent = article.excerpt;
    if (date) date.textContent = formatDate(article.date);
    if (link) link.href = `/pages/article.html?slug=${article.slug}`;
  }

  function renderSidebarArticles(articles) {
    const container = document.getElementById('sidebar-articles');
    if (!container) return;
    container.innerHTML = '';
    articles.slice(1, 4).forEach(a => {
      const el = document.createElement('article');
      el.className = 'sidebar-article';
      el.innerHTML = `
        <img class="sidebar-article-img" src="${getImage(a.category, 1)}" alt="${Security.sanitizeHTML(a.title)}" loading="lazy" width="80" height="60">
        <div class="sidebar-article-body">
          <span class="sidebar-article-cat">${getCategoryLabel(a.category)}</span>
          <h4 class="sidebar-article-title"><a href="/pages/article.html?slug=${encodeURIComponent(a.slug)}">${Security.sanitizeHTML(a.title)}</a></h4>
          <span class="sidebar-article-date">${formatDate(a.date)}</span>
        </div>`;
      container.appendChild(el);
    });
  }

  function renderArticlesGrid(articles, containerId) {
    const container = document.getElementById(containerId || 'articles-grid');
    if (!container) return;
    container.innerHTML = '';
    articles.forEach(a => container.appendChild(renderArticleCard(a)));
    if (window._reinitLazy) window._reinitLazy();
  }

  function updateCategoryCounts() {
    const counts = {};
    allArticles.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    Object.entries(counts).forEach(([cat, n]) => {
      const el = document.getElementById('cnt-' + cat.replace('-umrah', '').replace('india-travel', 'india'));
      if (el) el.textContent = n;
    });
  }

  /* ===== TICKER ===== */
  function updateTicker() {
    const el = document.getElementById('ticker-content');
    if (!el) return;
    const items = allArticles.slice(0, 6).map(a => `📍 ${a.title}`).join('   |   ');
    el.innerHTML = `<span>${items}</span>`;
  }

  /* ===== LOAD MORE ===== */
  function initLoadMore() {
    const btn = document.getElementById('load-more');
    if (!btn) return;
    btn.addEventListener('click', () => {
      currentPage++;
      const start = currentPage * PAGE_SIZE;
      const filtered = getFilteredArticles().slice(start, start + PAGE_SIZE);
      const container = document.getElementById('articles-grid');
      if (!container) return;
      filtered.forEach(a => container.appendChild(renderArticleCard(a)));
      if (window._reinitLazy) window._reinitLazy();
      if (start + PAGE_SIZE >= getFilteredArticles().length) {
        btn.textContent = 'No More Articles';
        btn.disabled = true;
      }
    });
  }

  function getFilteredArticles() {
    if (currentFilter === 'latest') return [...allArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (currentFilter === 'trending') return [...allArticles].sort(() => Math.random() - 0.5);
    return allArticles.filter(a => a.category === currentFilter || a.category.includes(currentFilter));
  }

  /* ===== SORT BUTTONS ===== */
  function initSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.sort;
        currentPage = 0;
        renderArticlesGrid(getFilteredArticles().slice(0, PAGE_SIZE));
      });
    });
  }

  /* ===== HEADER ===== */
  function initHeader() {
    // Date
    const dateEl = document.getElementById('header-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Footer year
    const fyear = document.getElementById('footer-year');
    if (fyear) fyear.textContent = new Date().getFullYear();

    // Hamburger
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('main-nav');
    if (ham && nav) {
      ham.addEventListener('click', () => {
        const open = ham.classList.toggle('open');
        nav.classList.toggle('open');
        ham.setAttribute('aria-expanded', open);
      });
    }

    // Dropdown mobile toggle
    document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
      link.addEventListener('click', e => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          link.closest('.has-dropdown').classList.toggle('open');
        }
      });
    });

    // Search
    const stoggle = document.getElementById('search-toggle');
    const sbar = document.getElementById('search-bar');
    const sinput = document.getElementById('search-input');
    if (stoggle && sbar) {
      stoggle.addEventListener('click', () => {
        const open = sbar.classList.toggle('open');
        sbar.setAttribute('aria-hidden', !open);
        stoggle.setAttribute('aria-expanded', open);
        if (open && sinput) sinput.focus();
      });
    }

    // Sticky scroll
    const header = document.getElementById('site-header');
    if (header) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > lastScroll && y > 200) header.style.transform = 'translateY(-100%)';
        else header.style.transform = '';
        lastScroll = y;
      }, { passive: true });
    }

    // Back to top
    const btt = document.getElementById('back-top');
    if (btt) {
      window.addEventListener('scroll', () => {
        btt.hidden = window.scrollY < 500;
      }, { passive: true });
      btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  /* ===== COOKIE CONSENT ===== */
  function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const accepted = localStorage.getItem('sfritrav_cookie_consent');
    if (accepted) return;

    // Show banner after 1.5s
    setTimeout(() => banner.classList.add('visible'), 1500);

    document.getElementById('cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('sfritrav_cookie_consent', 'accepted');
      localStorage.setItem('sfritrav_cookie_ts', Date.now());
      banner.classList.remove('visible');
      // Enable analytics here
    });

    document.getElementById('cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem('sfritrav_cookie_consent', 'declined');
      banner.classList.remove('visible');
    });
  }

  /* ===== NEWSLETTER FORMS ===== */
  function initForms() {
    // Sidebar newsletter
    const nlForm = document.getElementById('newsletter-form');
    if (nlForm) {
      nlForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validateNewsletterForm(nlForm)) return;
        if (!Security.checkHoneypot(nlForm)) return;
        if (!Security.checkRateLimit('newsletter', 3, 300000)) {
          showFormError(nlForm, 'Too many attempts. Please wait.');
          return;
        }
        const btn = document.getElementById('nl-submit');
        if (btn) { btn.textContent = 'Subscribing...'; btn.disabled = true; }
        await submitToFormspree(nlForm, {
          _subject: 'New Newsletter Subscriber – SfriTrav',
          name: Security.sanitizeText(document.getElementById('nl-name')?.value || ''),
          email: Security.sanitizeText(document.getElementById('nl-email')?.value || ''),
          source: 'sidebar_newsletter',
        });
        const success = document.getElementById('nl-success');
        if (success) { success.hidden = false; nlForm.reset(); }
        if (btn) { btn.textContent = 'Subscribe Free →'; btn.disabled = false; }
      });
    }

    // CTA newsletter
    const ctaForm = document.getElementById('newsletter-cta-form');
    if (ctaForm) {
      ctaForm.addEventListener('submit', async e => {
        e.preventDefault();
        const emailEl = document.getElementById('cta-email');
        const errEl = document.getElementById('cta-email-err');
        if (!emailEl || !Security.validateEmail(emailEl.value)) {
          if (errEl) errEl.textContent = 'Please enter a valid email address.';
          return;
        }
        if (errEl) errEl.textContent = '';
        const btn = ctaForm.querySelector('button[type=submit]');
        if (btn) { btn.textContent = '✓ Subscribed!'; btn.disabled = true; }
        await submitToFormspree(ctaForm, {
          _subject: 'New CTA Newsletter Subscriber – SfriTrav',
          email: Security.sanitizeText(emailEl.value),
          source: 'cta_newsletter',
        });
        emailEl.value = '';
      });
    }
  }

  function validateNewsletterForm(form) {
    let valid = true;
    const name = document.getElementById('nl-name');
    const email = document.getElementById('nl-email');
    const nameErr = document.getElementById('nl-name-err');
    const emailErr = document.getElementById('nl-email-err');
    if (name && !Security.validateName(name.value)) {
      if (nameErr) nameErr.textContent = 'Enter a valid name (2–60 letters).';
      name.classList.add('invalid'); valid = false;
    } else {
      if (nameErr) nameErr.textContent = '';
      if (name) name.classList.remove('invalid');
    }
    if (email && !Security.validateEmail(email.value)) {
      if (emailErr) emailErr.textContent = 'Enter a valid email address.';
      email.classList.add('invalid'); valid = false;
    } else {
      if (emailErr) emailErr.textContent = '';
      if (email) email.classList.remove('invalid');
    }
    return valid;
  }

  async function submitToFormspree(form, data) {
    try {
      const resp = await fetch(CFG.formspree, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      return resp.ok;
    } catch { return false; }
  }

  /* ===== AUTO CRON (client-side daily refresh) ===== */
  function initCron() {
    // Check every hour if new articles needed
    const checkAndRefresh = async () => {
      const lastGen = localStorage.getItem('sfritrav_last_gen');
      const now = Date.now();
      if (!lastGen || now - parseInt(lastGen) > CFG.cacheTTL) {
        await generateAIArticles();
        localStorage.setItem('sfritrav_last_gen', now);
        renderAll();
      }
    };
    setInterval(checkAndRefresh, 30 * 60 * 1000); // Check every 30 mins
  }

  /* ===== RENDER ALL ===== */
  function renderAll() {
    if (!allArticles.length) return;
    const sorted = [...allArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderHero(sorted[0]);
    renderSidebarArticles(sorted);
    renderArticlesGrid(sorted.slice(0, PAGE_SIZE));
    renderArticlesGrid(sorted.filter(a => a.category === 'kashmir').slice(0, 3), 'kashmir-grid');
    renderArticlesGrid(sorted.filter(a => a.category === 'hajj-umrah').slice(0, 3), 'hajj-grid');
    renderArticlesGrid(sorted.filter(a => ['lifestyle', 'perfumes'].includes(a.category)).slice(0, 4), 'lifestyle-grid');
    updateCategoryCounts();
    updateTicker();
  }

  /* ===== INIT ===== */
  async function init() {
    initHeader();
    initCookieConsent();
    initLoadMore();
    initSortButtons();
    initForms();

    // Store articles in global for article page access
    window._sfritravArticles = allArticles;

    // Try to load cached articles first for instant render
    const cached = await ArticleCache.getArticles();
    if (cached.length) {
      allArticles = [...cached.filter(a => a.aiGenerated), ...SEED_ARTICLES];
    }
    renderAll();

    // Then try to generate fresh AI articles
    initCron();
    generateAIArticles().then(() => renderAll());

    // Save seed articles to cache
    ArticleCache.cacheArticles(SEED_ARTICLES);
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose for article page
  window.SfriTrav = { getArticleBySlug: slug => allArticles.find(a => a.slug === slug), allArticles: () => allArticles };
})();
