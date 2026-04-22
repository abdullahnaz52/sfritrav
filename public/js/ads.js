/**
 * SfriTrav Monetization Manager
 * Handles AdSense, Affiliate, and Native ad injection
 * Replace ADSENSE_CLIENT with your pub-XXXXXXXX ID when approved
 */

window.SfriAds = (function() {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────────────
  const CFG = {
    adsenseClient : 'ca-pub-XXXXXXXXXXXXXXXX', // ← replace after approval
    adsenseEnabled: false,                      // ← set true after AdSense approval
    affiliateTag  : 'sfritrav-21',             // ← your Amazon Associates tag
    flipkartAffId : 'sfritrav',                // ← your Flipkart affiliate ID
  };

  // ── AFFILIATE PRODUCT DATABASE ─────────────────────────────────
  // High-converting products by category — update with real ASINs from Amazon
  const AFFILIATE_PRODUCTS = {
    'health': [
      { title:'Boldfit Protein Shaker Bottle', price:'₹349', img:'https://images-na.ssl-images-amazon.com/images/I/61Ry7GdqaXL._SL160_.jpg', url:'https://www.amazon.in/dp/B07MX5ZLNM?tag='+CFG.affiliateTag, badge:'Best Seller' },
      { title:'Saffola Active Refined Oil 5L', price:'₹699', img:'https://images-na.ssl-images-amazon.com/images/I/71UjxCBbxKL._SL160_.jpg', url:'https://www.amazon.in/dp/B07G4W3HV4?tag='+CFG.affiliateTag, badge:'₹100 off' },
      { title:'Himalaya Ashwagandha Tablets', price:'₹199', img:'https://images-na.ssl-images-amazon.com/images/I/71QxV4JNCCL._SL160_.jpg', url:'https://www.amazon.in/dp/B00YWBKFUI?tag='+CFG.affiliateTag, badge:'Top Rated' },
    ],
    'technology': [
      { title:'boAt Rockerz 255 Pro+', price:'₹999', img:'https://images-na.ssl-images-amazon.com/images/I/61IuHMlcevL._SL160_.jpg', url:'https://www.amazon.in/dp/B09NZRLCVF?tag='+CFG.affiliateTag, badge:'Best Seller' },
      { title:'Redmi 13C 5G 128GB', price:'₹10,999', img:'https://images-na.ssl-images-amazon.com/images/I/61xpEEiAfzL._SL160_.jpg', url:'https://www.amazon.in/dp/B0CQ59NJZF?tag='+CFG.affiliateTag, badge:'Top Pick' },
      { title:'Ant Esports MK1000 Keyboard', price:'₹1,499', img:'https://images-na.ssl-images-amazon.com/images/I/71nJ7HEp0mL._SL160_.jpg', url:'https://www.amazon.in/dp/B08BZKMSF9?tag='+CFG.affiliateTag, badge:'Hot Deal' },
    ],
    'food': [
      { title:'Tata Sampann Chana Dal 1kg', price:'₹119', img:'https://images-na.ssl-images-amazon.com/images/I/81yH8EXLXNL._SL160_.jpg', url:'https://www.amazon.in/dp/B07WFBG7RQ?tag='+CFG.affiliateTag, badge:'Pantry Deal' },
      { title:'Presto! Garbage Bags 120pcs', price:'₹249', img:'https://images-na.ssl-images-amazon.com/images/I/71YrTQFRLdL._SL160_.jpg', url:'https://www.amazon.in/dp/B01N1EEVKU?tag='+CFG.affiliateTag, badge:'Value Pack' },
      { title:'Prestige Iris Plus Induction', price:'₹2,299', img:'https://images-na.ssl-images-amazon.com/images/I/61mopS6jAFL._SL160_.jpg', url:'https://www.amazon.in/dp/B082VCTQLM?tag='+CFG.affiliateTag, badge:'Top Rated' },
    ],
    'travel': [
      { title:'Skybags Bingo 55cm Backpack', price:'₹1,499', img:'https://images-na.ssl-images-amazon.com/images/I/51lI0e6HWEL._SL160_.jpg', url:'https://www.amazon.in/dp/B07BKVHQVS?tag='+CFG.affiliateTag, badge:'Travel Pick' },
      { title:'Nasher Miles Cabin Luggage', price:'₹2,799', img:'https://images-na.ssl-images-amazon.com/images/I/71IH3eVwU5L._SL160_.jpg', url:'https://www.amazon.in/dp/B08R9BPPG3?tag='+CFG.affiliateTag, badge:'Best Seller' },
    ],
    'fashion': [
      { title:'Fastrack Analog Watch Men', price:'₹1,295', img:'https://images-na.ssl-images-amazon.com/images/I/71x5gT7i4OL._SL160_.jpg', url:'https://www.amazon.in/dp/B00QLXUMFU?tag='+CFG.affiliateTag, badge:'Trending' },
      { title:'Libas Women Kurta Set', price:'₹699', img:'https://images-na.ssl-images-amazon.com/images/I/81ggPnzMWFL._SL160_.jpg', url:'https://www.amazon.in/dp/B08XPZ9BJ4?tag='+CFG.affiliateTag, badge:'New Arrival' },
    ],
    'women-health': [
      { title:'Himalaya Herbals Face Wash', price:'₹175', img:'https://images-na.ssl-images-amazon.com/images/I/71YHFt4kBzL._SL160_.jpg', url:'https://www.amazon.in/dp/B00CMF0JZS?tag='+CFG.affiliateTag, badge:'Best Seller' },
      { title:'Minimalist SPF 50 Sunscreen', price:'₹299', img:'https://images-na.ssl-images-amazon.com/images/I/61F2dlkY3ML._SL160_.jpg', url:'https://www.amazon.in/dp/B09NRWWDB2?tag='+CFG.affiliateTag, badge:'Top Rated' },
    ],
    'business': [
      { title:'Rich Dad Poor Dad (Hindi)', price:'₹199', img:'https://images-na.ssl-images-amazon.com/images/I/81BE7eeKzAL._SL160_.jpg', url:'https://www.amazon.in/dp/B07P7BQKZ7?tag='+CFG.affiliateTag, badge:'Finance Pick' },
      { title:'The Intelligent Investor', price:'₹399', img:'https://images-na.ssl-images-amazon.com/images/I/71wHi7hPGXL._SL160_.jpg', url:'https://www.amazon.in/dp/0062312685?tag='+CFG.affiliateTag, badge:'Must Read' },
    ],
    'jobs': [
      { title:'UPSC IAS Prelims 27 Years Papers', price:'₹349', img:'https://images-na.ssl-images-amazon.com/images/I/81P6RFBYUBL._SL160_.jpg', url:'https://www.amazon.in/dp/9389718961?tag='+CFG.affiliateTag, badge:'UPSC 2026' },
      { title:'SSC CGL Complete Study Guide', price:'₹499', img:'https://images-na.ssl-images-amazon.com/images/I/71K0AQGL1FL._SL160_.jpg', url:'https://www.amazon.in/dp/938974895X?tag='+CFG.affiliateTag, badge:'Top Rated' },
    ],
    'ayurveda': [
      { title:'Dabur Chyawanprash 2kg', price:'₹499', img:'https://images-na.ssl-images-amazon.com/images/I/51nSuLkFKJL._SL160_.jpg', url:'https://www.amazon.in/dp/B00PRXV3NW?tag='+CFG.affiliateTag, badge:'Best Seller' },
      { title:'Patanjali Ashwagandha Powder', price:'₹129', img:'https://images-na.ssl-images-amazon.com/images/I/71R6RB3QGFL._SL160_.jpg', url:'https://www.amazon.in/dp/B01FFOWH3Y?tag='+CFG.affiliateTag, badge:'Patanjali' },
    ],
    'default': [
      { title:'Amazon Pay Later — 0% Interest', price:'Get ₹500 Cashback', img:'', url:'https://www.amazon.in/dp/B08CF3B7N1?tag='+CFG.affiliateTag, badge:'Amazon Offer', isPromo:true },
    ]
  };

  // ── ADSENSE UNIT BUILDER ────────────────────────────────────────
  function adUnit(slot, size='auto', style='') {
    if (!CFG.adsenseEnabled) {
      return `<div class="ad-placeholder" data-slot="${slot}">
        <span class="ad-label">Advertisement</span>
      </div>`;
    }
    return `<ins class="adsbygoogle" style="display:block;${style}"
      data-ad-client="${CFG.adsenseClient}"
      data-ad-slot="${slot}"
      data-ad-format="${size}"
      data-full-width-responsive="true"></ins>
    <script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script>`;
  }

  // ── AD SLOT IDs (replace with real ones from AdSense dashboard) ─
  const SLOTS = {
    leaderboard : '1234567890',  // 728×90 — top/bottom of page
    rectangle   : '0987654321',  // 300×250 — sidebar / in-article
    inArticle   : '1122334455',  // In-article native
    mobile      : '5544332211',  // 320×100 mobile banner
  };

  // ── AFFILIATE PRODUCT BOX HTML ──────────────────────────────────
  function affiliateBox(category) {
    const products = AFFILIATE_PRODUCTS[category] || AFFILIATE_PRODUCTS['default'];
    if (!products || !products.length) return '';
    return `<div class="affiliate-box">
      <div class="affiliate-box-header">
        <span class="affiliate-box-icon">🛒</span>
        <span class="affiliate-box-title">Recommended Products</span>
        <span class="affiliate-box-note">Affiliate links — we may earn a commission</span>
      </div>
      <div class="affiliate-grid">
        ${products.map(p => `
          <a href="${p.url}" class="affiliate-item" target="_blank" rel="noopener sponsored">
            ${p.img ? `<img src="${p.img}" alt="${p.title}" class="affiliate-img" onerror="this.style.display='none'">` : '<div class="affiliate-img-placeholder">🛍️</div>'}
            <div class="affiliate-info">
              ${p.badge ? `<span class="affiliate-badge">${p.badge}</span>` : ''}
              <div class="affiliate-item-title">${p.title}</div>
              <div class="affiliate-price">${p.price}</div>
              <div class="affiliate-cta">View on Amazon →</div>
            </div>
          </a>`).join('')}
      </div>
    </div>`;
  }

  // ── INJECT ADS INTO ARTICLE PAGE ───────────────────────────────
  function injectArticleAds(category) {
    const body = document.getElementById('articleBody');
    if (!body) return;

    // 1. In-article ad after 2nd paragraph
    const paras = body.querySelectorAll('p');
    if (paras.length >= 2) {
      const adDiv = document.createElement('div');
      adDiv.className = 'in-article-ad';
      adDiv.innerHTML = adUnit(SLOTS.inArticle, 'fluid', 'margin:1.5rem 0;');
      paras[1].after(adDiv);
    }

    // 2. Affiliate box after 3rd paragraph or at end
    const affDiv = document.createElement('div');
    affDiv.innerHTML = affiliateBox(category);
    if (paras.length >= 3) {
      paras[2].after(affDiv.firstChild);
    } else {
      body.appendChild(affDiv.firstChild);
    }

    // 3. Rectangle ad at end of article body
    const endAd = document.createElement('div');
    endAd.className = 'end-article-ad';
    endAd.innerHTML = adUnit(SLOTS.rectangle, 'rectangle', 'margin:2rem auto;max-width:336px;');
    body.appendChild(endAd);
  }

  // ── INJECT ADS INTO HOMEPAGE ────────────────────────────────────
  function injectHomepageAds() {
    // Replace the static ad placeholder divs
    document.querySelectorAll('[data-ad-zone]').forEach(el => {
      const zone = el.dataset.adZone;
      if (zone === 'leaderboard') el.innerHTML = adUnit(SLOTS.leaderboard, 'auto', 'min-height:90px;');
      if (zone === 'sidebar')     el.innerHTML = adUnit(SLOTS.rectangle, 'rectangle', 'min-height:250px;');
      if (zone === 'mid')         el.innerHTML = adUnit(SLOTS.leaderboard, 'auto', 'min-height:90px;');
    });
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  return { injectArticleAds, injectHomepageAds, affiliateBox, adUnit, SLOTS, CFG };
})();
