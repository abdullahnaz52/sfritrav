# SfriTrav.com — Production Blog Website

**Kashmir Travel · Hajj & Umrah · Perfumes · Lifestyle · India Travel**

> Auto-generates 3 AI articles daily from trending topics. Fully optimized: SEO, security, caching, AdSense-ready.

---

## 🗂️ Project Structure

```
sfritrav/
├── index.html                  # Homepage
├── disclaimer.html             # Disclaimer page
├── privacy-policy.html         # GDPR-compliant privacy policy
├── terms.html                  # Terms of service
├── robots.txt                  # SEO robots directives
├── sw.js                       # Service Worker (offline + caching)
├── vercel.json                 # Vercel config: cron, headers, rewrites
├── package.json                # Node.js project config
├── .env.example                # Environment variable template
├── .gitignore
│
├── pages/
│   ├── article.html            # Dynamic article page
│   ├── category.html           # Category listing page
│   ├── search.html             # Site search
│   ├── about.html              # About us page
│   └── contact.html            # Contact + form (Formspree)
│
├── public/
│   ├── css/style.css           # Full responsive stylesheet
│   └── js/
│       ├── app.js              # Main app: articles, UI, CRON trigger
│       ├── cache.js            # IndexedDB cache, lazy loading, batch
│       └── security.js         # XSS, rate limit, CSRF, honeypot
│
└── api/
    ├── generate-article.js     # POST: AI article via Claude API
    ├── cron-generate.js        # Vercel Cron: daily 3 articles @ 6AM IST
    ├── trending.js             # GET: trending topics from RSS feeds
    ├── sitemap.js              # GET /sitemap.xml
    └── rss-feed.js             # GET /feed.xml
```

---

## 🚀 Deployment — Step by Step

### Step 1: Create GitHub Repository

```bash
# In the sfritrav/ directory:
git init
git add .
git commit -m "Initial commit: SfriTrav production blog"
git remote add origin https://github.com/YOUR_USERNAME/sfritrav.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. **Framework Preset:** Other (static site)
4. **Root Directory:** `./` (default)
5. **Build Command:** *(leave empty)*
6. **Output Directory:** *(leave empty)*
7. Click **Deploy**

### Step 3: Set Environment Variables

In Vercel Dashboard → Your Project → **Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | Free from [console.groq.com](https://console.groq.com) |
| `CRON_SECRET` | Random 64-char string | `openssl rand -hex 32` |
| `ARTICLE_GEN_SECRET` | Random 64-char string | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://sfritrav.com` | Your domain |

> 💡 To generate secrets: Run `openssl rand -hex 32` in terminal, or use [randomkeygen.com](https://randomkeygen.com)

### Step 4: Add Custom Domain

1. Vercel Dashboard → Your Project → **Settings → Domains**
2. Add `sfritrav.com` and `www.sfritrav.com`
3. Update your domain's DNS:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. SSL is automatic (Let's Encrypt via Vercel)

### Step 5: Verify Cron Job

The cron job runs daily at **00:30 UTC (6:00 AM IST)**. To verify:
1. Vercel Dashboard → Your Project → **Cron Jobs** tab
2. You should see `/api/cron-generate` listed with the schedule

To test manually:
```bash
curl -X GET "https://sfritrav.com/api/cron-generate" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📧 Formspree Setup

1. Go to [formspree.io](https://formspree.io) → log in
2. Find your form ID: `xpqkzzak`
3. In form settings, enable email notifications to `sfritrav_2026@gmail.com`
4. Optionally enable spam protection (reCAPTCHA)

The newsletter and contact forms are already configured to submit to:
`https://formspree.io/f/xpqkzzak`

---

## 💰 Google AdSense Setup

1. Apply at [adsense.google.com](https://adsense.google.com)
2. Get your Publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`
3. In `index.html`, uncomment and update the AdSense script:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
```
4. Also update the CSP in `vercel.json` to include your publisher ID
5. Ad units are pre-placed throughout the site

> **AdSense Approval Checklist:**
> - ✅ Privacy Policy page
> - ✅ Terms of Service page
> - ✅ Disclaimer page
> - ✅ About Us page
> - ✅ Contact page
> - ✅ Original, quality content (9 seed articles)
> - ✅ Mobile responsive
> - ✅ Fast loading
> - ✅ GDPR cookie consent

---

## 🔍 SEO Setup

### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → `https://sfritrav.com`
3. Verify via HTML tag (add to `<head>` in `index.html`)
4. Submit sitemap: `https://sfritrav.com/sitemap.xml`

### Google Analytics
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID: `G-XXXXXXXXXX`
3. Uncomment GA script in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_ID"></script>
```

---

## 🖼️ Required Images (Add Before Launch)

Place these in `/images/`:
- `logo.png` — 144×144px, transparent background, white logo on dark (for dark header)
- `logo-dark.png` — 144×144px for light backgrounds  
- `og-cover.jpg` — 1200×630px, social share cover image
- `favicon.ico` — 32×32px favicon
- `favicon-192.png` — 192×192px for PWA
- `favicon-512.png` — 512×512px for PWA

Free logo creation: [Canva.com](https://canva.com) or [LogoMakr.com](https://logomakr.com)

---

## ⚙️ How the Auto-Article System Works

```
Daily at 6:00 AM IST
        ↓
/api/cron-generate (authenticated by CRON_SECRET)
        ↓
Fetches /api/trending
  → Scrapes Google Trends RSS (India)
  → Times of India Travel RSS
  → Kashmir Observer RSS
  → Fragrantica RSS (perfumes)
  → Fallback: curated topic rotation
        ↓
Picks 3 categories (randomized daily)
        ↓
For each category:
  → POST /api/generate-article {category, topic}
  → Calls Claude Haiku API
  → Returns {title, excerpt, tags, body, slug}
  → Article stored in localStorage (client) via app.js
        ↓
Articles appear on homepage on next visitor load
```

> **Cost:** Groq API is **completely free** for this usage. Free tier allows 14,400 requests/day and 30 requests/minute — generating 3 articles/day uses less than 0.02% of the daily limit.

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| XSS Protection | `security.js` sanitizes all DOM output; CSP headers |
| CSRF | Token-based validation on all form submissions |
| Rate Limiting | Per-IP rate limiting in all API routes |
| DDoS Mitigation | Vercel Edge Network + rate limiting |
| SQL Injection | No database; pure static + serverless (no SQL) |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` header |
| HTTPS | Enforced via HSTS header + Vercel SSL |
| Honeypot | Hidden fields in all forms trap bots |
| API Auth | Cron + article generation endpoints require secrets |

---

## 📱 Performance

- **Lighthouse Score Target:** 95+ (Performance, SEO, Accessibility)
- Service Worker: Cache-first for static, network-first for API
- IndexedDB: 1-hour TTL article cache
- Images: Lazy-loaded via IntersectionObserver
- CSS: `content-visibility: auto` for off-screen sections
- Fonts: System font stack (no Google Fonts load penalty)
- JS: Deferred, no blocking scripts

---

## 🛠️ Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Run locally
vercel dev

# Site available at http://localhost:3000
```

---

## 📞 Support

- Email: sfritrav_2026@gmail.com
- Contact form: sfritrav.com/pages/contact.html
- Partners: [SafarArRooh](https://safararrooh.com) · [Nusuk](https://nusuk.sa) · [SafarOoh Shop](https://safarooh.shop)

---

*Built with ❤️ in Kashmir, India. Deployed on Vercel.*
