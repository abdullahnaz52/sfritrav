/**
 * SfriTrav.com — Main App v2.1
 * Fixes: dynamic dates (current year), all 18 categories seeded,
 *        AI badge removed, hamburger improved
 */
(function () {
  'use strict';

  /* ===== DYNAMIC DATES — always current year ===== */
  const NOW  = new Date();
  const CY   = NOW.getFullYear();            // current year e.g. 2026
  const CM   = String(NOW.getMonth() + 1).padStart(2, '0');
  // Helper: build a date string in current year
  function d(mmdd) { return `${CY}-${mmdd}`; }

  /* ===== CONFIG ===== */
  const CFG = {
    formspree: 'https://formspree.io/f/xpqkzzak',
    siteURL: 'https://sfritrav.com',
  };

  /* ===== CATEGORIES ===== */
  const CATEGORIES = {
    'health':        { label: 'Health & Lifestyle',    color: 'health',        emoji: '💪' },
    'travel':        { label: 'Travel',                color: 'travel',        emoji: '✈️' },
    'politics':      { label: 'Politics',              color: 'politics',      emoji: '🏛️' },
    'entertainment': { label: 'Entertainment',         color: 'entertainment', emoji: '🎬' },
    'sports':        { label: 'Sports',                color: 'sports',        emoji: '⚽' },
    'technology':    { label: 'Technology & Gadgets',  color: 'tech',          emoji: '📱' },
    'business':      { label: 'Business & Finance',    color: 'business',      emoji: '📈' },
    'women-health':  { label: "Women's Health",        color: 'women',         emoji: '👩' },
    'men-health':    { label: "Men's Health",          color: 'men',           emoji: '👨' },
    'food':          { label: 'Food & Recipes',        color: 'food',          emoji: '🍽️' },
    'environment':   { label: 'Environment',           color: 'environment',   emoji: '🌿' },
    'fashion':       { label: 'Fashion & Beauty',      color: 'fashion',       emoji: '👗' },
    'mental-health': { label: 'Mental Health',         color: 'mental-health', emoji: '🧠' },
    'jobs':          { label: 'Jobs in India',         color: 'jobs',          emoji: '💼' },
    'ayurveda':      { label: 'Ayurveda & Medicine',   color: 'ayurveda',      emoji: '🌱' },
    'kids':          { label: 'Kids & Parenting',      color: 'kids',          emoji: '👶' },
    'global-news':   { label: 'Global News',           color: 'news',          emoji: '🌍' },
    'india-news':    { label: 'India News',            color: 'news',          emoji: '🇮🇳' },
  };

  /* ===== IMAGES (per category) ===== */
  const IMGS = {
    'health':        ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=75','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700&q=75','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=75'],
    'travel':        ['https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=700&q=75','https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=75','https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75'],
    'politics':      ['https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=75','https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=700&q=75'],
    'entertainment': ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=75','https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=700&q=75'],
    'sports':        ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=75','https://images.unsplash.com/photo-1540747913346-19212a4b443d?w=700&q=75','https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=75'],
    'technology':    ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75','https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=75'],
    'business':      ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=75','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=75'],
    'women-health':  ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=75','https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&q=75'],
    'men-health':    ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=75','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=75'],
    'food':          ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=75','https://images.unsplash.com/photo-1543353071-873f17a7a088?w=700&q=75','https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=700&q=75'],
    'environment':   ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75'],
    'fashion':       ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=75','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75'],
    'mental-health': ['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=700&q=75','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=75'],
    'jobs':          ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=700&q=75','https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=700&q=75'],
    'ayurveda':      ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=700&q=75','https://images.unsplash.com/photo-1472396961693-142e6e269027?w=700&q=75'],
    'kids':          ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&q=75','https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=700&q=75'],
    'global-news':   ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=75','https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=75'],
    'india-news':    ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75','https://images.unsplash.com/photo-1532664189809-02133fee698d?w=700&q=75'],
  };
  function getImg(cat, idx = 0) {
    const imgs = IMGS[cat] || IMGS['global-news'];
    return imgs[idx % imgs.length];
  }

  /* ===== SEED ARTICLES — one per each of 18 categories, dates = current year ===== */
  const SEED = [
    /* HEALTH */
    { id:'s01', slug:'morning-habits-transform-health', category:'health', featured:true,
      title:'10 Morning Habits That Transform Your Health',
      excerpt:'Science-backed routines doctors and wellness experts swear by — from cold exposure to protein-first breakfasts and sunlight timing.',
      readTime:'6 min', date: d('04-15'),
      tags:['Morning Routine','Wellness','Habits','Health Tips'],
      body:`<p>Your mornings set the tone for everything. Research shows people with consistent morning routines report 40% higher productivity and significantly better mental health scores.</p>
<h2>1. Hydrate First Thing</h2>
<p>Drink 500ml of water within the first 10 minutes of waking. You've been fasting for 7–8 hours; your cells are dehydrated. Add a pinch of Himalayan salt and lemon for electrolytes.</p>
<h2>2. No Phone for 30 Minutes</h2>
<p>Checking your phone immediately floods your brain with cortisol. Give your prefrontal cortex time to wake up before emails and social media.</p>
<h2>3. 5 Minutes of Sunlight</h2>
<p>Step outside within an hour of waking. Natural light resets your circadian rhythm, boosts serotonin, and improves night-time sleep quality — measurably within two weeks.</p>
<h2>4. Move Before You Eat</h2>
<p>Even a 10-minute walk activates BDNF — a brain protein that improves focus and memory for hours after.</p>
<h2>5. Protein-First Breakfast</h2>
<p>Aim for 25–30g of protein at breakfast. This stabilises blood sugar, reduces cravings, and supports muscle maintenance at any age.</p>` },

    /* TRAVEL */
    { id:'s02', slug:'budget-travel-destinations-india', category:'travel', featured:true,
      title:'15 Best Budget Travel Destinations in India This Year',
      excerpt:'Incredible places across India where ₹5,000 a day gets you luxury-level experiences — with current prices, transport tips and insider advice.',
      readTime:'9 min', date: d('04-14'),
      tags:['Budget Travel','India','Backpacking','Travel Tips'],
      body:`<p>India remains one of the world's greatest value-for-money travel destinations. With thoughtful planning, ₹4,000–₹6,000 per day covers great accommodation, food, and experiences across most of the country.</p>
<h2>1. Hampi, Karnataka</h2>
<p>UNESCO-listed Hampi is a budget traveller's paradise. Guesthouses from ₹400–₹1,200/night, meals at local dhabas run ₹80–₹200, and the surreal boulder landscape is free to explore.</p>
<h2>2. Spiti Valley, Himachal Pradesh</h2>
<p>One of India's most remote and stunning destinations. Best June–September. Homestays from ₹600–₹1,500 including meals. At 12,000 feet, it feels like another planet.</p>
<h2>3. Varanasi, Uttar Pradesh</h2>
<p>The oldest living city on Earth. Guesthouses along the ghats from ₹500/night. The Ganga Aarti at dusk is free and unforgettable.</p>` },

    /* INDIA NEWS */
    { id:'s03', slug:'india-economic-outlook', category:'india-news',
      title:`India's Economy in ${CY}: Growth, Challenges and What's Next`,
      excerpt:"A plain-language breakdown of India's current economic position — GDP growth, inflation, job creation, and what it means for ordinary people.",
      readTime:'7 min', date: d('04-13'),
      tags:['Indian Economy','GDP','Inflation','Finance'],
      body:`<p>India remains one of the world's fastest-growing major economies. The latest data places annual GDP growth at approximately 6.5–7%, with strong performance in manufacturing, services and digital sectors.</p>
<h2>Key Growth Drivers</h2>
<p>Infrastructure investment continues at record levels. Capital expenditure by the central government is driving road, railway and urban development projects across all states. The Production Linked Incentive (PLI) scheme has attracted significant manufacturing investment in electronics, pharmaceuticals and textiles.</p>
<h2>Challenges</h2>
<p>Unemployment — particularly among youth — remains the most pressing concern. Rural wages have not kept pace with urban income growth. Inflation, while moderated from 2022 peaks, continues to pressure household budgets especially in food and fuel categories.</p>
<h2>What to Watch</h2>
<p>The monsoon forecast, Federal Reserve policy decisions, and the pace of private sector investment will be the three most important variables for India's economic trajectory over the next 12 months.</p>` },

    /* SPORTS */
    { id:'s04', slug:'india-cricket-season-preview', category:'sports',
      title:`India Cricket ${CY}: Season Preview, Key Matches and Player Watch`,
      excerpt:"Complete preview of India's international cricket schedule — Test series, ODI campaigns, key player battles and who makes the squad.",
      readTime:'8 min', date: d('04-12'),
      tags:['Cricket','India Cricket','Test Series','BCCI'],
      body:`<p>Indian cricket enters an exciting period with a packed international schedule and intense competition for squad places. Here is everything you need to know about the season ahead.</p>
<h2>International Schedule Highlights</h2>
<p>India faces a demanding schedule across all three formats. The upcoming Test series will be pivotal for ICC World Test Championship standings. The ODI cycle also intensifies as teams position themselves for the next marquee tournament.</p>
<h2>Key Player Watch</h2>
<p>Jasprit Bumrah's fitness and availability remains the most crucial factor for India's pace attack. In batting, the next generation of middle-order batters will be under intense scrutiny as selectors look to build post-transition squads.</p>
<h2>IPL Impact</h2>
<p>The IPL continues to shape careers and public perception. Performances in the T20 league directly influence international call-ups, making each season a high-stakes audition for national honours.</p>` },

    /* WOMEN-HEALTH */
    { id:'s05', slug:'skincare-routine-indian-skin', category:'women-health',
      title:'The Complete Skincare Routine for Indian Skin: Dermatologist Guide',
      excerpt:'Dermatologist-approved skincare tailored for Indian skin tones — the best SPF, hyperpigmentation treatments, and affordable product picks.',
      readTime:'8 min', date: d('04-11'),
      tags:['Skincare','Indian Skin','Dermatology','Beauty'],
      body:`<p>Indian skin has unique characteristics — higher melanin content, more proneness to hyperpigmentation, and the dual effects of tropical humidity and pollution. Generic skincare advice often misses the mark. Here is what actually works.</p>
<h2>The Non-Negotiable: Sunscreen Daily</h2>
<p>Indian skin is absolutely not immune to sun damage. UV exposure is the single biggest driver of hyperpigmentation and premature ageing on brown skin. Use SPF 50+ PA+++ every single morning, rain or shine. Budget pick: Minimalist SPF 50 (₹299).</p>
<h2>Vitamin C Serum</h2>
<p>L-ascorbic acid at 10–15% concentration reduces dark spots, boosts collagen, and fights pollution damage. Apply before sunscreen every morning. One of the best investments for Indian skin under ₹600.</p>
<h2>Treating Dark Spots</h2>
<p>Most effective ingredients: Niacinamide 10% for brightening, Alpha Arbutin for active spots, Azelaic Acid for post-acne marks. Avoid skin-lightening creams with mercury or steroids — they cause long-term irreversible damage.</p>` },

    /* TECHNOLOGY */
    { id:'s06', slug:'best-smartphones-india-budget', category:'technology',
      title:`Best Smartphones Under ₹20,000 in India (${CY} Edition)`,
      excerpt:'Tested and ranked: top phones under ₹20,000 right now — camera, battery, gaming performance and long-term value compared.',
      readTime:'8 min', date: d('04-10'),
      tags:['Smartphones','Budget Phones','India','Tech Review'],
      body:`<p>The sub-₹20,000 segment is the world's most competitive smartphone market. In ${CY} you can get a genuinely excellent phone with a great camera, all-day battery, and smooth performance at this price.</p>
<h2>Best Overall: Redmi Note 14 Pro</h2>
<p>200MP main camera, Snapdragon 7s Gen 3, 5,500mAh battery, and a premium glass build around ₹19,499. Camera performance punches well above its weight class.</p>
<h2>Best Camera: Realme 13 Pro+</h2>
<p>Sony LYT-600 main sensor with impressive low-light performance. 80W charging fills a 5,000mAh battery in under 45 minutes. Available around ₹18,999.</p>
<h2>Best Long-Term Value: Samsung Galaxy M35</h2>
<p>Samsung's 4-year OS update promise is unmatched in this segment. 6,000mAh battery, clean One UI experience. Best choice if you plan to use the phone 3+ years.</p>` },

    /* BUSINESS */
    { id:'s07', slug:'india-stock-market-outlook', category:'business',
      title:'Sensex & Nifty Outlook: Expert Forecasts and What Investors Should Do',
      excerpt:"India's stock markets in focus. Key drivers, sectoral calls, and what retail investors should know right now from top market analysts.",
      readTime:'7 min', date: d('04-09'),
      tags:['Sensex','Nifty','Stock Market','Investment','India'],
      body:`<p>Indian equities are navigating a complex environment of global uncertainty and strong domestic fundamentals. Here is what leading analysts are saying.</p>
<h2>Key Market Drivers</h2>
<p><strong>Global:</strong> US Federal Reserve rate policy remains the single biggest external variable. Any pivot toward rate cuts tends to bring FII money back into emerging markets including India. <strong>Domestic:</strong> Earnings season will be closely watched. Banking, infrastructure and defence sectors are expected to outperform.</p>
<h2>Sectors to Watch</h2>
<p>Analysts broadly favour PSU banks, capex-driven infrastructure plays, defence manufacturing, and select pharma names. IT and consumer discretionary remain cautious calls given global growth concerns.</p>
<h2>For Retail Investors</h2>
<p>Systematic Investment Plans (SIPs) in diversified equity funds remain the most reliable wealth-creation approach for long-term investors. Market timing is notoriously difficult even for professionals. Stay invested, stay diversified.</p>` },

    /* AYURVEDA */
    { id:'s08', slug:'ashwagandha-science-benefits', category:'ayurveda',
      title:'Ashwagandha: What the Science Actually Says',
      excerpt:"Ashwagandha is everywhere. But does it work? A review of 40+ clinical trials on what it genuinely helps with — and what's just marketing.",
      readTime:'7 min', date: d('04-08'),
      tags:['Ashwagandha','Ayurveda','Supplements','Stress Relief'],
      body:`<p>Ashwagandha (Withania somnifera) has been used in Ayurvedic medicine for 3,000+ years. In recent years it has exploded globally. Here is what clinical evidence actually shows.</p>
<h2>What It Genuinely Helps With</h2>
<p><strong>Stress and anxiety:</strong> The strongest evidence. Multiple double-blind trials show KSM-66 and Sensoril extracts significantly reduce cortisol and self-reported stress scores.</p>
<p><strong>Sleep quality:</strong> Studies show 600mg daily for 8 weeks improved sleep onset and quality in adults with insomnia.</p>
<p><strong>Male fertility:</strong> Several studies show improvements in sperm count, motility and testosterone in men taking 5g root powder daily for 3 months.</p>
<p><strong>Strength:</strong> Modest but real improvements in resistance training outcomes at 600mg/day over 8 weeks.</p>
<h2>What It Does NOT Do</h2>
<p>Claims around weight loss, cancer prevention and dramatic cognitive enhancement are not supported by current evidence. Be sceptical of brands making these claims.</p>` },

    /* JOBS */
    { id:'s09', slug:'government-jobs-india-latest', category:'jobs',
      title:`Top Government Job Openings in India — ${CY} Update`,
      excerpt:'UPSC, SSC, Railways, Banking, Defence: the biggest government recruitment notifications this season with eligibility, dates and how to apply.',
      readTime:'9 min', date: d('04-07'),
      tags:['Sarkari Naukri','UPSC','SSC','Government Jobs'],
      body:`<p>Government jobs in India remain among the most sought-after career paths, offering job security, pension benefits, and social status. Here are the most significant current openings.</p>
<h2>UPSC Civil Services</h2>
<p>The Union Public Service Commission's annual recruitment for IAS, IPS, IFS and other central services. Over 1,000 vacancies. Age limit 21–32 years. Check upsc.gov.in for current notification and exam dates.</p>
<h2>SSC CGL</h2>
<p>Staff Selection Commission's Combined Graduate Level exam covers thousands of posts across government departments. Eligibility: Any graduate. Check ssc.gov.in for the latest notification cycle.</p>
<h2>Railway Recruitment</h2>
<p>Indian Railways is one of the largest employers globally. RRB NTPC, Group D, and ALP notifications are released throughout the year. Check indianrailways.gov.in and regional RRB websites.</p>
<h2>Bank PO and Clerk</h2>
<p>IBPS conducts joint recruitment for public sector banks. SBI runs independent PO and clerk drives. Both offer excellent career prospects with structured promotion paths.</p>` },

    /* ENVIRONMENT */
    { id:'s10', slug:'india-climate-heatwave-guide', category:'environment',
      title:'India Heatwave Season: Why It Is Getting Worse and How to Stay Safe',
      excerpt:'Climate scientists explain why Indian summers are intensifying each year — and the practical steps every household should take to protect themselves.',
      readTime:'6 min', date: d('04-06'),
      tags:['Heatwave','Climate Change','India','Environment'],
      body:`<p>India's pre-monsoon season has intensified significantly over the past decade. The combination of climate change, urban heat island effects, and shifting weather patterns means extreme heat is now a public health emergency in multiple states each year.</p>
<h2>Why Summers Are Getting More Extreme</h2>
<p>Global warming has shifted India's average temperatures upward by approximately 0.7°C since 1900, with the bulk of that increase occurring since 1980. Urban expansion has compounded this — cities with large concrete footprints trap heat long after sundown.</p>
<h2>Health Risks of Extreme Heat</h2>
<p>Heat stroke — core body temperature above 40°C — can be fatal within hours. Warning signs: confusion, absence of sweating, rapid pulse, loss of consciousness. Treat as a medical emergency: move to shade, pour cold water on the person, call emergency services immediately.</p>
<h2>Protecting Your Household</h2>
<ul><li>Stay indoors between 11am and 4pm when possible</li><li>Drink 3–4 litres of water daily; add ORS to one glass</li><li>Wear loose, light-coloured cotton clothing outdoors</li><li>Never leave children, elderly, or pets in parked vehicles</li><li>Check on elderly neighbours daily during heat alerts</li></ul>` },

    /* MENTAL HEALTH */
    { id:'s11', slug:'mental-health-india-help-resources', category:'mental-health',
      title:"India's Mental Health Crisis: Understanding It and Where to Get Help",
      excerpt:'197 million Indians live with a mental health condition — yet 80% never seek help. What is changing, and what resources are available right now.',
      readTime:'8 min', date: d('04-05'),
      tags:['Mental Health','Depression','India','Therapy'],
      body:`<p>The National Mental Health Survey of India estimated that 197 million Indians live with a mental health condition. Yet only about 20% of those who need care ever receive it — one of the largest treatment gaps in the world.</p>
<h2>Why People Don't Seek Help</h2>
<p>Stigma remains the primary barrier. Mental illness is still widely associated in Indian culture with weakness or moral failing. This prevents people from acknowledging their own struggles and from seeking professional support. Financial cost and the severe shortage of mental health professionals — India has only 0.3 psychiatrists per 100,000 people — make access further difficult.</p>
<h2>What Is Getting Better</h2>
<p>The National Tele Mental Health Programme has dramatically expanded digital access. Awareness has grown substantially among urban youth. Several states are training community health workers in mental health first aid.</p>
<h2>Where to Get Help in India</h2>
<ul><li><strong>iCall (TISS):</strong> 9152987821 — Mon–Sat, 8am–10pm</li><li><strong>Vandrevala Foundation:</strong> 1860-2662-345 — 24/7, free</li><li><strong>NIMHANS Helpline:</strong> 080-46110007</li><li><strong>iCall Online Chat:</strong> icallhelpline.org</li></ul>` },

    /* FOOD */
    { id:'s12', slug:'indian-street-food-city-guide', category:'food',
      title:"India's Greatest Street Foods: The City-by-City Guide",
      excerpt:"From Mumbai's vada pav to Kolkata's kathi rolls — the definitive guide to India's street food culture with prices, addresses and what to order.",
      readTime:'10 min', date: d('04-04'),
      tags:['Street Food','Indian Cuisine','Food Guide','Travel'],
      body:`<p>India's street food culture is a civilisational achievement — centuries of culinary tradition distilled into food you can eat standing on a pavement for under ₹100. Each city speaks its own flavour language.</p>
<h2>Mumbai: Vada Pav & Pav Bhaji</h2>
<p>The vada pav is Mumbai's soul food — spiced potato fritter in a bread roll with multiple chutneys. Best version: Ashok Vada Pav at Kirti College, Dadar (₹20). Pav Bhaji: Sardar at Tardeo, the original since 1945.</p>
<h2>Delhi: Chaat & Paranthas</h2>
<p>Paranthe Wali Gali in Old Delhi has been frying stuffed paranthas since the 1870s. Natraj Dahi Bhalle at Chandni Chowk is the chaat benchmark — the queue tells you everything.</p>
<h2>Kolkata: Kathi Rolls & Mishti Doi</h2>
<p>The kathi roll was born in Kolkata — egg-coated flatbread wrapped around seekh kebab. Nizam's on New Market Road is the 1932 original. Follow with mishti doi from Balaram Mullick.</p>
<h2>Chennai: Idli, Dosa & Filter Coffee</h2>
<p>Saravana Bhavan remains the global standard-setter for South Indian breakfast. Filter coffee at ₹30 is the essential accompaniment. Non-negotiable.</p>` },

    /* POLITICS */
    { id:'s13', slug:'india-politics-key-issues', category:'politics',
      title:'The 5 Political Issues Shaping India Right Now',
      excerpt:`From state elections to economic policy debates — a factual, non-partisan breakdown of the key political questions dominating India in ${CY}.`,
      readTime:'7 min', date: d('04-03'),
      tags:['Indian Politics','Elections','Policy','Democracy'],
      body:`<p>India's political landscape in ${CY} is shaped by several significant issues that cut across party lines and affect millions of people. Here is a factual overview.</p>
<h2>1. Economic Inequality and Job Creation</h2>
<p>Unemployment — particularly among youth — is the top concern across virtually every survey of Indian voters. The government's job creation record and the private sector's capacity to absorb a growing workforce are central political flashpoints.</p>
<h2>2. Farmers' Concerns</h2>
<p>Agricultural policy — Minimum Support Prices, irrigation investment, input costs, and insurance schemes — remains politically sensitive in states where farming households represent large voting blocs.</p>
<h2>3. State Autonomy and Federal Relations</h2>
<p>The balance of fiscal and political power between the Centre and state governments is an ongoing constitutional tension, with debates around tax devolution, centrally sponsored schemes and gubernatorial appointments.</p>
<h2>4. Electoral Reforms</h2>
<p>The Election Commission's processes, electoral bond transparency, campaign finance regulations and voter list accuracy are subjects of active public debate and legal proceedings.</p>` },

    /* ENTERTAINMENT */
    { id:'s14', slug:'bollywood-ott-must-watch', category:'entertainment',
      title:'Best Bollywood Films and OTT Series to Watch This Month',
      excerpt:'Our curated guide to the best Indian content streaming right now — from blockbuster films to must-watch web series across Netflix, Prime and JioCinema.',
      readTime:'6 min', date: d('04-02'),
      tags:['Bollywood','OTT','Web Series','Netflix','Prime Video'],
      body:`<p>The Indian entertainment landscape has never been richer. With world-class production values, diverse stories, and wide streaming distribution, here is the best content to watch this month.</p>
<h2>At the Cinema</h2>
<p>Indian cinema continues to produce ambitious, large-scale entertainers that draw audiences of all ages. Both Hindi and South Indian industries are releasing major films with pan-India appeal. Check your local multiplex for current releases — BookMyShow and Paytm offer real-time listings and advance booking.</p>
<h2>On Netflix India</h2>
<p>Netflix's Indian original slate has matured significantly. Crime dramas, political thrillers, and documentary series have established the platform as a home for serious Indian storytelling alongside its international catalogue.</p>
<h2>On Amazon Prime Video</h2>
<p>Prime Video continues its investment in Indian originals, with several high-profile series earning critical acclaim. Regional language content — Malayalam, Tamil, Telugu — has been a particular strength.</p>
<h2>On JioCinema & Hotstar</h2>
<p>Live sports (IPL, football), reality formats, and value-priced subscription tiers make these platforms strong choices for sports fans and price-conscious viewers.</p>` },

    /* GLOBAL NEWS */
    { id:'s15', slug:'global-news-round-up', category:'global-news',
      title:'World in Brief: Key Global Stories You Need to Know',
      excerpt:'A clear, factual round-up of the major international stories making headlines — geopolitics, economy, climate and technology, explained simply.',
      readTime:'6 min', date: d('04-01'),
      tags:['World News','Geopolitics','Global Economy','International'],
      body:`<p>Here is a concise factual overview of the major international stories currently shaping global events.</p>
<h2>Geopolitics</h2>
<p>Ongoing conflicts in multiple regions continue to affect global energy markets, supply chains, and refugee movements. India's strategic positioning — as a major democracy with relationships across competing power blocs — gives it both unique influence and complex obligations in global forums.</p>
<h2>Global Economy</h2>
<p>Central banks across major economies are navigating the difficult balance between controlling inflation and sustaining growth. The US Federal Reserve's decisions on interest rates have ripple effects across every emerging market including India. Trade tensions and supply chain restructuring continue to redraw global commerce patterns.</p>
<h2>Climate and Environment</h2>
<p>Extreme weather events — from floods and cyclones to heatwaves and wildfires — are occurring with greater frequency and intensity globally. International climate negotiations continue, with debate over financing, emissions targets and technology transfer central to discussions.</p>` },

    /* MEN-HEALTH */
    { id:'s16', slug:'mens-health-guide-india', category:'men-health',
      title:"Men's Health in India: The Issues We Don't Talk About Enough",
      excerpt:"From heart disease risk to mental health struggles and preventive care — a practical health guide for Indian men at every age.",
      readTime:'8 min', date: d('03-30'),
      tags:["Men's Health","Heart Disease","Fitness","Preventive Health"],
      body:`<p>Indian men significantly underuse healthcare services compared to women, often until problems become severe. Here is a practical health guide covering the issues that matter most.</p>
<h2>Heart Disease: India's Biggest Killer</h2>
<p>Cardiovascular disease is the leading cause of death among Indian men, striking a decade earlier on average than in Western populations. Risk factors — high blood pressure, diabetes, smoking, stress, and sedentary work — are all highly prevalent. Get a full cardiac check including blood pressure, lipid profile, blood glucose and ECG after age 30.</p>
<h2>Mental Health and the "Strong Man" Problem</h2>
<p>India's male suicide rate is among the highest globally. Cultural pressure to appear strong prevents most men from acknowledging mental health struggles. Stress, financial pressure, relationship difficulties and loneliness are common — and all are treatable with the right support.</p>
<h2>Preventive Screenings Every Man Should Get</h2>
<ul><li>Blood pressure: Every year from age 25</li><li>Blood glucose (diabetes): Every 3 years from age 30, annually from 40</li><li>Lipid profile: Every 5 years from age 30</li><li>Eye examination: Every 2 years</li><li>Dental check: Every 6 months</li></ul>` },

    /* FASHION */
    { id:'s17', slug:'fashion-trends-india', category:'fashion',
      title:`Indian Fashion ${CY}: The Trends, the Designers and the Deals`,
      excerpt:'From ethnic fusion looks to sustainable fashion — the styles dominating Indian wardrobes this year and where to find them at every budget.',
      readTime:'7 min', date: d('03-28'),
      tags:['Indian Fashion','Style','Ethnic Wear','Sustainable Fashion'],
      body:`<p>Indian fashion in ${CY} is a compelling mix of traditional craft, contemporary silhouettes, and growing environmental consciousness. Here is what is trending and how to wear it.</p>
<h2>Ethnic Fusion: The Dominant Trend</h2>
<p>The blending of traditional Indian textiles and silhouettes with Western cuts continues to evolve. Kurta suits with cigarette trousers, sarees styled with contemporary blouses, and dhoti pants with structured shirts represent the most commercially successful end of this trend.</p>
<h2>Sustainable and Handloom Fabrics</h2>
<p>There is growing consumer interest in khadi, handloom cotton, and natural-dye fabrics — both for their environmental credentials and their support of traditional artisans. Government initiatives and new direct-to-consumer brands have made these fabrics more accessible and affordable.</p>
<h2>Beauty and Skincare Trends</h2>
<p>Skinimalism — a focus on minimal product use and visible skin health rather than heavy coverage — continues to grow. Ingredient-led skincare, SPF awareness, and scalp health are the biggest conversation areas in Indian beauty communities online.</p>` },

    /* KIDS */
    { id:'s18', slug:'parenting-tips-india', category:'kids',
      title:'Modern Parenting in India: Evidence-Based Tips for Raising Confident Kids',
      excerpt:'Child development experts share what actually works — from screen time management to building resilience and supporting learning at home.',
      readTime:'8 min', date: d('03-26'),
      tags:['Parenting','Child Development','Kids Health','Education'],
      body:`<p>Parenting in India today means navigating a complex mix of traditional values, modern pressures, and rapidly changing technology. Here is what child development research actually tells us about raising happy, capable children.</p>
<h2>Screen Time: The Realistic Guide</h2>
<p>No screen time under 18 months (except video calls). Limited, co-viewed content for 2–5 year olds. For school-age children, content quality matters far more than quantity. Educational apps, creative tools, and video calls with family are very different from passive entertainment. Set limits, but avoid making screens forbidden fruit — that creates the biggest problems.</p>
<h2>Building Resilience</h2>
<p>Children develop resilience not by being protected from all difficulty, but by experiencing manageable challenges and learning to overcome them with support. Let children fail small things. Resist the urge to immediately solve every problem. Ask "What do you think you could try?" rather than providing instant solutions.</p>
<h2>Supporting Learning at Home</h2>
<p>Reading aloud together — even after children can read independently — builds vocabulary and bonding. Conversations about the world, current events, science and culture develop critical thinking far more effectively than additional tuition classes.</p>` },

    /* HIGH-VALUE SEO — Best health insurance (highest CPC in India ~₹80–₹200/click) */
    { id:'seo01', slug:'best-health-insurance-india', category:'business', featured:false,
      title:`Best Health Insurance Plans in India ${CY}: Complete Buyer's Guide`,
      excerpt:'Compare the top 10 health insurance plans in India — coverage, premiums, claim settlement ratios and which one is best for your family.',
      readTime:'10 min', date: d('04-20'),
      tags:['Health Insurance','Insurance India','Mediclaim','Family Floater'],
      body:`<p>Health insurance is no longer optional in India. With treatment costs rising 12–15% annually, a single hospitalisation can wipe out years of savings. Choosing the right plan — and understanding what it actually covers — is one of the most important financial decisions you will make.</p>
<h2>How to Compare Health Insurance Plans</h2>
<p><strong>Claim Settlement Ratio (CSR):</strong> This is the percentage of claims an insurer settles. Look for insurers above 95%. Star Health (94.44%), Niva Bupa (91.6%), and HDFC ERGO (98.59%) are industry leaders.</p>
<p><strong>Network Hospitals:</strong> Cashless treatment is only available at network hospitals. Larger networks mean more choice. Aditya Birla Health has 10,000+ network hospitals; Star Health 14,000+.</p>
<p><strong>Sub-limits and Capping:</strong> Many cheap plans cap room rent at ₹3,000–₹5,000/day or limit specific treatments. Always read the fine print. A ₹5 lakh policy with heavy sub-limits is worth far less than it appears.</p>
<h2>Top Plans for Families (${CY})</h2>
<p><strong>Niva Bupa Reassure 2.0</strong> — No room rent capping, no disease-wise sub-limits, covers modern treatments including robotic surgery. Premium for family of 3 (₹5L cover): ~₹15,000–₹18,000/year.</p>
<p><strong>HDFC ERGO Optima Secure</strong> — Unique feature: doubles your sum insured after 2 claim-free years. Strong CSR. ₹5L family floater starts around ₹16,000/year.</p>
<p><strong>Star Family Health Optima</strong> — Best for senior family members. Covers pre-existing diseases after 1 year (others take 2–4 years). Auto-recharge of sum insured if exhausted.</p>
<p><strong>Care Supreme</strong> — Most affordable premium among premium plans. Covers global treatment for critical illness. Good for younger families.</p>
<h2>How Much Cover Do You Need?</h2>
<p>The minimum recommended cover in Indian metro cities is ₹10 lakh per person. ₹5 lakh sounds sufficient but a single cardiac event, cancer treatment or ICU stay commonly crosses ₹8–12 lakh today. For families with senior members, ₹15–25 lakh is advisable.</p>
<h2>Tax Benefit</h2>
<p>Premium paid for health insurance is deductible under Section 80D. Up to ₹25,000 for self/spouse/children; additional ₹25,000–₹50,000 for parents depending on their age. A ₹20,000/year premium saves ₹6,240 in tax for someone in the 30% bracket.</p>` },

    /* HIGH-VALUE SEO — Mutual funds (high CPC finance category) */
    { id:'seo02', slug:'best-mutual-funds-india-beginners', category:'business', featured:false,
      title:`Best Mutual Funds for Beginners in India ${CY}: Start With ₹500/Month`,
      excerpt:'The simplest, lowest-risk way to start investing in mutual funds in India — the exact funds to choose, how SIP works, and common mistakes to avoid.',
      readTime:'8 min', date: d('04-19'),
      tags:['Mutual Funds','SIP','Investing','Personal Finance India'],
      body:`<p>Mutual funds are the single best investment vehicle for most Indians who are not full-time stock market analysts. Here is a complete, jargon-free guide to getting started — even with ₹500 a month.</p>
<h2>What Is an SIP and Why Does It Work?</h2>
<p>A Systematic Investment Plan (SIP) lets you invest a fixed amount every month automatically. The magic is rupee-cost averaging — you buy more units when markets fall and fewer when they rise, smoothing out volatility over time. ₹5,000/month invested in a diversified equity fund for 15 years at 12% annual return grows to approximately ₹25 lakh.</p>
<h2>Best Funds to Start With in ${CY}</h2>
<p><strong>Nifty 50 Index Fund</strong> — Lowest cost option (~0.1% expense ratio). Tracks India's top 50 companies. Best for: beginners who want market returns without picking stocks. Options: UTI Nifty 50 Index Fund, HDFC Index Fund Nifty 50 Plan.</p>
<p><strong>Large Cap Fund</strong> — Actively managed, invests in India's largest companies. More stable than mid/small cap. Options: Mirae Asset Large Cap Fund, Axis Bluechip Fund.</p>
<p><strong>Flexi Cap Fund</strong> — Invests across large, mid and small cap. Best for long-term (7+ year) wealth creation. Options: Parag Parikh Flexi Cap Fund (also invests internationally — unique advantage), Kotak Flexi Cap.</p>
<h2>How to Start in 10 Minutes</h2>
<p>Download Zerodha Coin, Groww, or Paytm Money. Complete KYC with Aadhaar + PAN. Choose one fund. Set up a SIP for any date. Done. Your investments are managed by SEBI-registered professionals and protected by SEBI regulations.</p>
<h2>The One Mistake That Kills Returns</h2>
<p>Stopping your SIP when markets fall. This is the single most destructive thing investors do. Market falls are when SIPs buy the most units at the lowest prices — stopping then is like leaving a sale before shopping. Stay invested, stay consistent.</p>` },

    /* HIGH-VALUE SEO — Credit cards (very high CPC ~₹100–₹300) */
    { id:'seo03', slug:'best-credit-cards-india', category:'business', featured:false,
      title:`Best Credit Cards in India ${CY}: Top Picks for Rewards, Travel & Cashback`,
      excerpt:'Ranked and compared: the best credit cards in India right now — highest rewards, best cashback, top travel cards and no-fee options for every budget.',
      readTime:'9 min', date: d('04-18'),
      tags:['Credit Cards','Best Credit Card India','Cashback Card','Travel Card'],
      body:`<p>The right credit card in India can save you ₹15,000–₹50,000 per year through rewards, cashback and lounge access. The wrong one costs you interest at 36–42% annually. Here is exactly what to choose based on your spending pattern.</p>
<h2>Best Overall: HDFC Regalia Gold</h2>
<p>5X reward points on dining and international spends. 4 complimentary lounge visits per quarter (16/year). Annual fee ₹2,500 — waived on ₹4L annual spend. Best for: frequent travelers and high spenders.</p>
<h2>Best Cashback: Axis Bank Ace Credit Card</h2>
<p>5% cashback on bill payments via Google Pay. 4% on Swiggy, Zomato and Ola. 1.5% on everything else. Annual fee ₹499 (waived on ₹2L spend). Best for: everyday spenders who prefer cashback over points.</p>
<h2>Best No-Fee Card: SBI SimplyCLICK</h2>
<p>10X rewards on Amazon, BookMyShow, Cleartrip, Lenskart. Annual fee ₹499 but reversed if you spend ₹1L/year. Best for: online shoppers who want no-cost rewards.</p>
<h2>Best Premium: HDFC Infinia Metal</h2>
<p>By-invitation only. Unlimited lounge access worldwide. 5 reward points per ₹150. Golf privileges. Best for: those spending ₹8L+ annually who want maximum lifestyle benefits.</p>
<h2>How to Use Credit Cards Without Going Into Debt</h2>
<p>One rule: always pay the full statement balance every month. Never pay just the minimum due — the remaining balance attracts 3–3.5% per month (42% per year). Set up auto-pay for the full amount. Treat your credit card as a debit card that gives you rewards — not as borrowed money.</p>` },

    /* HIGH-VALUE SEO — Work from home jobs (high search volume India) */
    { id:'seo04', slug:'work-from-home-jobs-india', category:'jobs', featured:false,
      title:`Work From Home Jobs in India ${CY}: Real Opportunities That Pay Well`,
      excerpt:'Verified work-from-home opportunities in India right now — freelancing, remote jobs, side income options and how much they actually pay.',
      readTime:'8 min', date: d('04-17'),
      tags:['Work From Home','Remote Jobs India','Freelancing','Side Income'],
      body:`<p>The remote work revolution has permanently changed what is possible for Indian workers. Millions of jobs that once required a physical office now pay competitive salaries for home-based work. Here are the real opportunities — with actual income ranges.</p>
<h2>Highest-Paying Remote Skills in India ${CY}</h2>
<p><strong>Software Development:</strong> ₹6–₹30 LPA remotely. React, Python, Node.js developers are in constant demand from both Indian and international companies. Platforms: LinkedIn, Naukri, Toptal, Upwork.</p>
<p><strong>Digital Marketing:</strong> ₹3–₹15 LPA. SEO specialists, performance marketers and social media managers are hired 100% remotely by most agencies and startups. Certifications from Google and Meta are free and credible.</p>
<p><strong>Content Writing:</strong> ₹15,000–₹80,000/month. Indian writers are highly competitive on international platforms because English proficiency is high and rates are competitive globally. Platforms: Contently, Fiverr, ProBlogger.</p>
<p><strong>Data Entry and Virtual Assistance:</strong> ₹8,000–₹20,000/month for beginners. Entry-level remote work. Platforms: Fiverr, Freelancer, Internshala.</p>
<p><strong>Online Teaching and Tutoring:</strong> ₹20,000–₹1,00,000/month for subject experts. Vedantu, Unacademy, Chegg Tutors, Preply for language teaching.</p>
<h2>How to Get Your First Remote Job</h2>
<p>Update your LinkedIn profile completely — 80% of recruiters use it. Create a portfolio of 3–5 sample projects even if unpaid. Apply to 10 jobs daily minimum for the first month. Remote job searching is a numbers game; persistence beats talent in the early stage.</p>` },
  ];

  /* ===== AI articles from localStorage ===== */
  function getAIArticles() {
    try { return JSON.parse(localStorage.getItem('sfritrav_articles') || '[]'); } catch { return []; }
  }
  function allArticles() { return [...getAIArticles(), ...SEED]; }

  /* ===== GLOBALS ===== */
  window.SfriTrav = { allArticles, CATEGORIES, getImg, SEED };

  /* ===== HELPERS ===== */
  function catLabel(cat) { return CATEGORIES[cat]?.label || cat; }
  function catColor(cat) { return CATEGORIES[cat]?.color || 'news'; }
  function fmtDate(ds) {
    return new Date(ds).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
  }

  /* ===== CARD HTML ===== */
  function cardHTML(a, i = 0) {
    return `<article class="card">
      <a href="/pages/article.html?slug=${a.slug}" class="card-img-wrap">
        <img class="card-img" src="${getImg(a.category, i)}" alt="${a.title}" loading="lazy" width="700" height="394">
      </a>
      <div class="card-body">
        <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
        <h3 class="card-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h3>
        <p class="card-excerpt">${a.excerpt}</p>
        <div class="card-meta"><time datetime="${a.date}">${fmtDate(a.date)}</time><span class="dot">·</span><span>${a.readTime} read</span></div>
      </div>
    </article>`;
  }

  /* ===== LOAD TRENDING TOPICS ===== */
  async function loadTrending() {
    const el = document.getElementById('trendingItems');
    if (!el) return;
    try {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.trending && data.trending.length) {
        const items = [...data.trending, ...data.trending]; // doubled for seamless loop
        el.innerHTML = items.map(t =>
          `<a href="/pages/article.html?title=${encodeURIComponent(t.title)}&cat=${encodeURIComponent(t.category||'india-news')}&gen=1" data-cat="${t.category||'india-news'}"><span class="trend-hash">#</span>${t.title}</a><span class="ticker-sep">·</span>`
        ).join('');
      }
    } catch { /* keep defaults */ }
  }

  /* ===== HOMEPAGE RENDER ===== */
  function renderHomepage() {
    const articles = allArticles();
    const featured = articles.filter(a => a.featured);
    const rest     = articles.filter(a => !a.featured);

    // Hero main
    const heroMain = document.getElementById('heroMain');
    if (heroMain && featured[0]) {
      const a = featured[0];
      heroMain.innerHTML = `
        <a href="/pages/article.html?slug=${a.slug}">
          <img class="hero-main-img" src="${getImg(a.category,0)}" alt="${a.title}" loading="eager" width="800" height="450">
        </a>
        <div class="hero-main-body">
          <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
          <h2 class="hero-main-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h2>
          <p class="hero-main-excerpt">${a.excerpt}</p>
          <div class="hero-meta"><time>${fmtDate(a.date)}</time><span class="dot">·</span><span>${a.readTime} read</span></div>
        </div>`;
    }

    // Hero stack (4 side items)
    const heroStack = document.getElementById('heroStack');
    if (heroStack) {
      const items = [...featured.slice(1), ...rest].slice(0, 4);
      heroStack.innerHTML = items.map((a, i) => `
        <div class="hero-side-item">
          <img class="hero-side-img" src="${getImg(a.category, i)}" alt="${a.title}" loading="lazy">
          <div class="hero-side-body">
            <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
            <h3 class="hero-side-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h3>
            <div class="hero-side-meta">${fmtDate(a.date)}</div>
          </div>
        </div>`).join('');
    }

    // Latest grid
    const latestGrid = document.getElementById('latestGrid');
    if (latestGrid) {
      latestGrid.innerHTML = articles.slice(0, 8).map((a, i) => cardHTML(a, i)).join('');
    }

    // Most-read sidebar list
    const trendingList = document.getElementById('trendingList');
    if (trendingList) {
      trendingList.innerHTML = `<div class="num-list">${
        articles.slice(0, 7).map((a, i) => `
          <div class="num-item">
            <span class="num-badge">${String(i+1).padStart(2,'0')}</span>
            <div>
              <div class="num-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></div>
              <div class="num-meta">${catLabel(a.category)} · ${fmtDate(a.date)}</div>
            </div>
          </div>`).join('')
      }</div>`;
    }

    // Per-category sections on homepage
    ['health','sports','technology','food','women-health','business','environment','jobs',
     'politics','entertainment','global-news','men-health','fashion','mental-health','ayurveda','kids'
    ].forEach(cat => {
      const el = document.getElementById(`cat-${cat}`);
      if (!el) return;
      const list = articles.filter(a => a.category === cat).slice(0, 3);
      if (!list.length) return;
      el.innerHTML = list.map((a, i) => cardHTML(a, i)).join('');
    });
  }

  /* ===== DAILY AI GENERATION ===== */
  async function checkDailyGeneration() {
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('sfritrav_last_gen') === today) return;
    const cats = Object.keys(CATEGORIES).sort(() => Math.random() - 0.5).slice(0, 2);
    const stored = getAIArticles();
    for (const cat of cats) {
      try {
        const res = await fetch('/api/generate-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat, topic: `Trending ${CATEGORIES[cat].label} news ${CY}` })
        });
        if (!res.ok) continue;
        const article = await res.json();
        if (article && article.title) {
          stored.unshift({
            ...article,
            category: cat,
            date: today,
            id: 'ai_' + Date.now() + '_' + cat,
            aiGenerated: false  // suppress badge
          });
        }
      } catch { /* silent */ }
    }
    try { localStorage.setItem('sfritrav_articles', JSON.stringify(stored.slice(0, 30))); } catch {}
    localStorage.setItem('sfritrav_last_gen', today);
  }

  /* ===== COMMON UI ===== */
  function initCommonUI() {
    // Sticky header shadow
    const header = document.getElementById('siteHeader');
    if (header) {
      window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 50), { passive: true });
    }

    // Back to top
    const btt = document.getElementById('backTop');
    if (btt) {
      window.addEventListener('scroll', () => btt.classList.toggle('visible', scrollY > 400), { passive: true });
      btt.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // Hamburger — improved toggle
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    if (ham && nav) {
      ham.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        ham.classList.toggle('active', isOpen);
        ham.setAttribute('aria-expanded', isOpen);
        // Prevent body scroll when menu open
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      // Close on outside click
      document.addEventListener('click', e => {
        if (nav.classList.contains('open') && !nav.contains(e.target) && !ham.contains(e.target)) {
          nav.classList.remove('open');
          ham.classList.remove('active');
          ham.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
      // Close on nav link click
      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          ham.classList.remove('active');
          ham.setAttribute('aria-expanded','false');
          document.body.style.overflow = '';
        });
      });
      // Close button inside the nav
      const closeBtn = document.getElementById('navCloseBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          nav.classList.remove('open');
          ham.classList.remove('active');
          ham.setAttribute('aria-expanded','false');
          document.body.style.overflow = '';
        });
      }
    }

    // Cookie consent
    const banner = document.getElementById('cookieBanner');
    if (banner && !localStorage.getItem('st_cookie')) {
      setTimeout(() => banner.classList.add('visible'), 2500);
      document.getElementById('cookieAccept')?.addEventListener('click', () => {
        localStorage.setItem('st_cookie', '1'); banner.classList.remove('visible');
      });
      document.getElementById('cookieDecline')?.addEventListener('click', () => {
        localStorage.setItem('st_cookie', '0'); banner.classList.remove('visible');
      });
    }

    // Footer year + date bar
    document.querySelectorAll('.footer-year').forEach(el => el.textContent = CY);
    const dateEl = document.getElementById('todayDate');
    if (dateEl) dateEl.textContent = NOW.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // Newsletter forms
    document.querySelectorAll('.nl-form').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const emailEl = form.querySelector('[name="email"]');
        const msg = form.querySelector('.nl-msg');
        const email = emailEl?.value.trim() || '';
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (msg) { msg.textContent = 'Please enter a valid email.'; msg.className = 'nl-msg error'; }
          return;
        }
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        try {
          const res = await fetch(CFG.formspree, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, _subject: 'SfriTrav Newsletter', source: location.pathname })
          });
          if (res.ok) {
            if (msg) { msg.textContent = '✓ Subscribed! Welcome aboard.'; msg.className = 'nl-msg success'; }
            form.reset();
          } else {
            if (msg) { msg.textContent = 'Something went wrong. Try again.'; msg.className = 'nl-msg error'; }
          }
        } catch {
          if (msg) { msg.textContent = 'Network error. Try again.'; msg.className = 'nl-msg error'; }
        }
        if (btn) btn.disabled = false;
      });
    });
  }

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initCommonUI();
    if (document.getElementById('heroMain')) {
      renderHomepage();
      loadTrending();
      checkDailyGeneration();
    }
  });

})();
