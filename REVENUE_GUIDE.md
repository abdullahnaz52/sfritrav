# SfriTrav Revenue Guide — Path to ₹30,000+/Month

## STEP 1: Activate AdSense (Do This First)
1. Go to https://adsense.google.com → Sign up with your Google account
2. Enter your site URL: https://sfritrav.com
3. Google will review your site (takes 1–14 days)
4. Once approved, go to AdSense → Ads → Ad Units → Create units
5. Copy your Publisher ID (looks like: ca-pub-1234567890123456)
6. Open `/public/js/ads.js` → line 9 → replace `ca-pub-XXXXXXXXXXXXXXXX` with your ID
7. Set `adsenseEnabled: true` on line 10
8. Replace SLOTS (lines 76-80) with your actual ad slot IDs from AdSense dashboard
9. Uncomment the AdSense script tag in index.html, article.html, and category.html head sections

## STEP 2: Amazon Associates (Instant Revenue)
1. Go to https://affiliate-program.amazon.in → Join Now
2. Enter site URL and describe it as "Indian news and lifestyle magazine"
3. Once approved, get your Tracking ID (e.g., sfritrav-21)
4. Open `/public/js/ads.js` → line 12 → replace `sfritrav-21` with your actual tag
5. Update all product URLs in AFFILIATE_PRODUCTS with real ASINs from Amazon
   - Go to any Amazon product → click "SiteStripe" bar at top → copy affiliate link
6. Affiliate boxes automatically appear in every article after the 3rd paragraph

## STEP 3: Google Search Console (Critical for SEO)
1. Go to https://search.google.com/search-console
2. Add property: https://sfritrav.com
3. Verify via HTML tag (add to index.html head) OR DNS record
4. Once verified, go to Sitemaps → Submit: https://sfritrav.com/sitemap.xml
5. Request indexing for your 5 most important articles manually
6. Check "Coverage" weekly — fix any crawl errors immediately

## STEP 4: High-Priority Content to Write/Publish (Manual — Google Will Rank These)
These topics have HIGH commercial intent = higher CPC = more earnings per visitor.
Write 800–1200 words each, with real information, not just AI:

Priority 1 (Finance — ₹80–₹200 CPC):
- "Best term life insurance India 2026"
- "How to file ITR online India 2026 — step by step"
- "NPS vs PPF vs mutual funds — which is better"
- "Home loan interest rates comparison India 2026"
- "Best savings account interest rates India 2026"

Priority 2 (Jobs — high volume):
- "UPSC 2026 notification — vacancies, eligibility, dates"
- "SSC CGL 2026 complete guide"
- "Top IT companies hiring freshers India 2026"

Priority 3 (Health — ₹60–₹150 CPC):
- "Best hospitals in [your city] — complete guide"
- "Diabetes diet plan India — what to eat and avoid"
- "Best multivitamin tablets India 2026"

## STEP 5: Social Media Distribution (Free Traffic)
Create these accounts TODAY if you haven't:
- Instagram: @sfritrav — post 3 article headlines daily as Stories
- Twitter/X: @sfritrav — post breaking news as tweets linking to site
- WhatsApp Channel — share daily digest to followers
- Telegram Channel — automated RSS-to-Telegram using IFTTT (free)
- Koo (Indian Twitter alternative) — very underutilised, easy ranking

## STEP 6: Add Taboola (After Reaching 1 Lakh Pageviews/Month)
1. Apply at https://www.taboola.com/publishers
2. They require minimum traffic — aim for 1 lakh monthly pageviews first
3. RPM: ₹25–₹60 for Indian traffic — runs alongside AdSense, doubles revenue
4. Implementation: one script tag in HTML

## STEP 7: Sponsored Content (After 6 Months)
Once you have 30,000+ monthly visitors:
- Email 5 small Indian D2C brands per week
- Offer a "Sponsored Review" article for ₹3,000–₹8,000
- Categories that pay: health supplements, fintech apps, EdTech, gadgets
- Always disclose "Sponsored Content" — Google policy + legal requirement

## Revenue Projection Tracker
| Month | Target Pageviews | AdSense | Affiliate | Sponsored | Total |
|-------|-----------------|---------|-----------|-----------|-------|
| 1-2   | 5,000           | ₹500    | ₹500      | ₹0        | ₹1,000 |
| 3-4   | 15,000          | ₹1,500  | ₹2,000    | ₹0        | ₹3,500 |
| 5-6   | 35,000          | ₹4,000  | ₹4,000    | ₹5,000    | ₹13,000 |
| 7-9   | 60,000          | ₹7,000  | ₹6,000    | ₹8,000    | ₹21,000 |
| 10-12 | 1,00,000        | ₹12,000 | ₹8,000    | ₹12,000   | ₹32,000 ✓ |

## AdSense Policy Rules — NEVER Violate These
- Never click your own ads (even once — account banned permanently)
- Never ask friends/family to click ads
- Never place ads on pages with no real content
- Never place more than 3 ads per page above the fold
- Gambling, adult, violence content = immediate ban
- All traffic must be organic/social — never buy traffic

## The One Number That Matters Most
**Your goal: 1,00,000 pageviews/month within 12 months.**
Everything else — AdSense RPM, affiliate conversions, sponsored rates —
improves automatically as traffic grows. Focus entirely on content quality
and distribution until you hit this number.
