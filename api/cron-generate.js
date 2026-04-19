/**
 * /api/cron-generate.js
 * Daily at 00:30 UTC (6:00 AM IST) — generates 3 articles across random categories
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfritrav.com';

const ALL_CATEGORIES = [
  'health','travel','politics','entertainment','sports','technology',
  'business','women-health','men-health','food','environment','fashion',
  'mental-health','jobs','ayurveda','kids','global-news','india-news'
];

const TOPICS = {
  'health':        ['10 Signs Your Diet Is Damaging Your Health','How Much Sleep Do Adults Actually Need','Diabetes Prevention: Lifestyle Changes That Work','Best Exercises for People Who Sit All Day','Understanding Blood Pressure Numbers'],
  'travel':        ['Weekend Getaways from Mumbai Under ₹5,000','Best Hill Stations in India for Monsoon','How to Plan a Solo Trip in India','Cheapest International Destinations for Indians in 2025','North East India: The Complete Travel Guide'],
  'politics':      ['Understanding India State Elections 2025','How Parliament Works: A Plain Language Guide','India Foreign Policy: Key Relationships in 2025','What the Opposition Alliance Means for India'],
  'entertainment': ['Most Anticipated Bollywood Films of 2025','Best OTT Web Series to Watch This Month','How Streaming Changed Indian Cinema','Top Indian Albums of 2025 So Far'],
  'sports':        ['IPL 2025 Best Performers Mid-Season Review','Neeraj Chopra: The Making of a Champion','Kabaddi Pro League 2025 Season Preview','How to Get Your Child Into Sports in India'],
  'technology':    ['Best Apps for Personal Finance in India 2025','How AI Is Changing Jobs in India','5G Rollout in India: Where Are We Now','Cheapest Internet Plans in India 2025'],
  'business':      ['How to Start a Small Business in India 2025','Best Mutual Funds for Beginners India 2025','Understanding GST Returns for Small Business','Gold vs Fixed Deposit: Which Is Better in 2025'],
  'women-health':  ['PCOS: Symptoms, Causes and Natural Management','Best Iron-Rich Foods for Indian Women','Understanding Perimenopause: What Every Woman Should Know','Skincare Routine for Indian Climate'],
  'men-health':    ['How to Increase Testosterone Naturally','Hair Loss in Indian Men: Causes and Solutions','Heart Health for Men Over 35','The Indian Man\'s Guide to Better Sleep'],
  'food':          ['Healthy Indian Breakfast Ideas Under 15 Minutes','Best Street Foods in Bangalore','How to Make Perfect Biryani at Home','Superfoods Available in Every Indian Kitchen'],
  'environment':   ['How to Reduce Plastic Use in Indian Households','Air Quality Index in Indian Cities: What to Do','Water Conservation Tips for Indian Homes','India\'s Best National Parks to Visit in 2025'],
  'fashion':       ['Saree Draping Styles: A Modern Guide','Best Indian Fashion Designers to Know in 2025','How to Build a Capsule Wardrobe on a Budget','Ethnic Wear Trends for Festive Season 2025'],
  'mental-health': ['How to Manage Work Stress in India','Signs You Need to See a Therapist','Free Mental Health Resources Available in India','Social Media and Teen Mental Health: What Parents Need to Know'],
  'jobs':          ['UPSC 2025 Preparation Strategy','Top Private Sector Jobs in India April 2025','How to Write a Resume That Gets Noticed in India','Work From Home Jobs Hiring in India Right Now'],
  'ayurveda':      ['Triphala: Benefits, Dosage and Side Effects','Ayurvedic Morning Rituals for Better Health','Tulsi: The Queen of Herbs and How to Use It','Ayurveda for Stress: Herbs and Practices That Work'],
  'kids':          ['How Much Screen Time Is Too Much for Children','Best Educational Apps for Kids in India 2025','Raising Confident Children: Evidence-Based Tips','School Nutrition: What Indian Kids Should Be Eating'],
  'global-news':   ['Global Economy Outlook 2025: Key Risks and Opportunities','Climate Negotiations: What India Agreed To','AI Regulation Around the World: Where Things Stand','US-India Relations in 2025: Trade, Tech and Defence'],
  'india-news':    ['India GDP Growth: Latest Data and Forecasts','Rupee vs Dollar: What Drives the Exchange Rate','Infrastructure India 2025: Projects Completed and Planned','India Digital Economy: Facts and Figures 2025'],
};

function pickCategories(n = 3) {
  return [...ALL_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, n);
}
function pickTopic(cat, used) {
  const opts = TOPICS[cat] || ['Latest trends in ' + cat];
  let t = opts[Math.floor(Math.random() * opts.length)];
  let tries = 0;
  while (used.has(t) && tries++ < 5) t = opts[Math.floor(Math.random() * opts.length)];
  used.add(t); return t;
}
async function getTrending() {
  try {
    const r = await fetch(`${SITE_URL}/api/trending`, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const d = await r.json();
    return d.trending?.length ? d.trending : null;
  } catch { return null; }
}

export default async function handler(req, res) {
  const auth = req.headers['authorization'];
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });

  const today = new Date().toISOString().split('T')[0];
  const trending = await getTrending();
  const categories = pickCategories(3);
  const used = new Set(); const results = []; const errors = [];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    let topic = pickTopic(cat, used);
    if (trending) {
      const match = trending.find(t => t.category === cat && !used.has(t.title));
      if (match) { topic = match.title; used.add(topic); }
    }

    try {
      const r = await fetch(`${SITE_URL}/api/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-article-secret': process.env.ARTICLE_GEN_SECRET || '' },
        body: JSON.stringify({ category: cat, topic }),
        signal: AbortSignal.timeout(50000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const a = await r.json();
      results.push({ category: cat, topic, slug: a.slug, title: a.title });
      console.log(`[cron] ✓ [${cat}] "${a.title}"`);
    } catch (err) {
      errors.push({ category: cat, topic, error: err.message });
      console.error(`[cron] ✗ [${cat}]:`, err.message);
    }
    if (i < categories.length - 1) await new Promise(r => setTimeout(r, 2000));
  }

  return res.status(200).json({ date: today, success: results.length, failed: errors.length, results, errors });
}
