/**
 * SfriTrav Main App
 * General-purpose news & blog site
 * Categories: health, travel, politics, entertainment, sports, tech,
 *   business, women-health, men-health, food, environment, fashion,
 *   mental-health, jobs, ayurveda, kids, global-news, india-news
 */
(function () {
  'use strict';

  /* ===== CONFIG ===== */
  const CFG = {
    formspree: 'https://formspree.io/f/xpqkzzak',
    siteURL: 'https://sfritrav.com',
    articlesPerPage: 8,
  };

  /* ===== CATEGORIES ===== */
  const CATEGORIES = {
    'health':          { label: 'Health & Lifestyle', color: 'health',        emoji: '💪' },
    'travel':          { label: 'Travel',              color: 'travel',        emoji: '✈️' },
    'politics':        { label: 'Politics',            color: 'politics',      emoji: '🏛️' },
    'entertainment':   { label: 'Entertainment',       color: 'entertainment', emoji: '🎬' },
    'sports':          { label: 'Sports',              color: 'sports',        emoji: '⚽' },
    'technology':      { label: 'Technology & Gadgets',color: 'tech',          emoji: '📱' },
    'business':        { label: 'Business & Finance',  color: 'business',      emoji: '📈' },
    'women-health':    { label: "Women's Health",      color: 'women',         emoji: '👩‍⚕️' },
    'men-health':      { label: "Men's Health",        color: 'men',           emoji: '👨‍⚕️' },
    'food':            { label: 'Food & Recipes',      color: 'food',          emoji: '🍽️' },
    'environment':     { label: 'Environment',         color: 'environment',   emoji: '🌿' },
    'fashion':         { label: 'Fashion & Beauty',    color: 'fashion',       emoji: '👗' },
    'mental-health':   { label: 'Mental Health',       color: 'mental-health', emoji: '🧠' },
    'jobs':            { label: 'Jobs in India',       color: 'jobs',          emoji: '💼' },
    'ayurveda':        { label: 'Ayurveda & Medicine', color: 'ayurveda',      emoji: '🌿' },
    'kids':            { label: 'Kids & Parenting',    color: 'kids',          emoji: '👶' },
    'global-news':     { label: 'Global News',         color: 'news',          emoji: '🌍' },
    'india-news':      { label: 'India News',          color: 'news',          emoji: '🇮🇳' },
  };

  /* ===== IMAGES ===== */
  const IMGS = {
    'health':        ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=75','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700&q=75','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=75'],
    'travel':        ['https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=700&q=75','https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=75','https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75'],
    'politics':      ['https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=75','https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=700&q=75'],
    'entertainment': ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=75','https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=700&q=75'],
    'sports':        ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=75','https://images.unsplash.com/photo-1540747913346-19212a4b443d?w=700&q=75','https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=75'],
    'technology':    ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75','https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=75'],
    'business':      ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=75','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=75'],
    'women-health':  ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=75','https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&q=75'],
    'men-health':    ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=75','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=75'],
    'food':          ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=75','https://images.unsplash.com/photo-1543353071-873f17a7a088?w=700&q=75','https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=700&q=75'],
    'environment':   ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75'],
    'fashion':       ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=75','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75'],
    'mental-health': ['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=700&q=75','https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75'],
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

  /* ===== SEED ARTICLES ===== */
  const SEED = [
    { id:'s01', slug:'10-morning-habits-transform-health-2025', category:'health', featured:true,
      title:'10 Morning Habits That Transform Your Health in 2025',
      excerpt:'Science-backed morning routines that top doctors, athletes, and wellness experts swear by — from cold exposure to the 5-minute journal.',
      readTime:'6 min', date:'2025-04-15', tags:['Morning Routine','Wellness','Habits','Health Tips'],
      body:`<p>Your mornings set the tone for everything. Research from the University of Toronto found that people who maintain consistent morning routines report 40% higher productivity and significantly better mental health scores.</p>
<h2>1. Hydrate Before Anything Else</h2>
<p>Drink 500ml of water within the first 10 minutes of waking. You've been fasting for 7-8 hours; your cells are dehydrated. Add a pinch of Himalayan salt and lemon for electrolytes.</p>
<h2>2. No Phone for the First 30 Minutes</h2>
<p>Checking your phone immediately floods your brain with cortisol (the stress hormone). Give your prefrontal cortex time to wake up before you expose it to emails, news, and social media.</p>
<h2>3. 5-Minute Sunlight Exposure</h2>
<p>Step outside within an hour of waking. Natural light resets your circadian rhythm, boosts serotonin, and improves sleep quality at night. This single habit can improve mood measurably within two weeks.</p>
<h2>4. Movement Before Meals</h2>
<p>Even a 10-minute walk or yoga session activates BDNF (brain-derived neurotrophic factor), which improves focus and memory for hours after.</p>
<h2>5. Cold Shower Finish</h2>
<p>The last 30-60 seconds of your shower on cold activates your sympathetic nervous system, burns brown fat, and has been shown in multiple studies to reduce depressive symptoms.</p>
<h2>6. Protein-First Breakfast</h2>
<p>Aim for 25-30g of protein at breakfast. This stabilises blood sugar, reduces afternoon cravings, and supports muscle maintenance regardless of age.</p>` },
    { id:'s02', slug:'best-budget-travel-destinations-india-2025', category:'travel', featured:true,
      title:'15 Best Budget Travel Destinations in India for 2025',
      excerpt:'Incredible places across India where ₹5,000 a day gets you luxury-level experiences — updated with 2025 prices, transport, and insider tips.',
      readTime:'9 min', date:'2025-04-14', tags:['Budget Travel','India','Backpacking','Travel Tips'],
      body:`<p>India remains one of the world's greatest value-for-money travel destinations. With thoughtful planning, ₹4,000–₹6,000 per day covers excellent accommodation, food, and activities across most of the country.</p>
<h2>1. Hampi, Karnataka — The Ruins Capital</h2>
<p>UNESCO-listed Hampi is a budget traveller's paradise. Guesthouses cost ₹400–₹1,200/night, meals at local dhabas run ₹80–₹200, and the surreal boulder landscape is free to explore. Rent a bicycle for ₹100/day and cover the entire site.</p>
<h2>2. Spiti Valley, Himachal Pradesh</h2>
<p>One of India's most remote and jaw-dropping destinations. The best time is June–September. Homestays cost ₹600–₹1,500 including meals. The Spiti river valley at 12,000 feet feels like you've landed on Mars.</p>
<h2>3. Varanasi, Uttar Pradesh</h2>
<p>The oldest living city on Earth. Budget guesthouses along the ghats from ₹500/night. Walk the 84 ghats at sunrise, attend the Ganga Aarti at dusk — both free. Boat rides cost ₹150–₹300.</p>
<h2>4. Pondicherry, Tamil Nadu</h2>
<p>French colonial architecture, clean beaches, and Auroville. Heritage hotels from ₹1,500/night. The French Quarter is walkable; rent a scooter for ₹350/day to explore the coast.</p>` },
    { id:'s03', slug:'india-election-budget-2025-analysis', category:'india-news',
      title:"India's Union Budget 2025: What It Means for the Common Man",
      excerpt:"A plain-language breakdown of Budget 2025's biggest announcements — tax changes, infrastructure spending, healthcare allocation, and what actually affects your wallet.",
      readTime:'7 min', date:'2025-04-13', tags:['Budget 2025','Indian Economy','Tax','Government'],
      body:`<p>The Union Budget 2025 presented by Finance Minister Nirmala Sitharaman carried several significant announcements. Here is what matters most for ordinary Indians.</p>
<h2>Income Tax Changes</h2>
<p>The new tax regime sees an expanded zero-tax slab up to ₹7 lakh, with revised slabs above that offering modest relief to the middle class. The standard deduction has been maintained at ₹50,000.</p>
<h2>Healthcare Budget</h2>
<p>The health sector allocation was increased to ₹98,311 crore — a 13% rise from the previous year. Ayushman Bharat expansion, new AIIMS institutions, and mental health infrastructure are the focus areas.</p>
<h2>Infrastructure Spend</h2>
<p>Capital expenditure outlay stands at ₹11.11 lakh crore, up 11.1%. This covers railway expansion, highway construction, and urban metro projects across 25 cities.</p>` },
    { id:'s04', slug:'ipl-2025-preview-teams-predictions', category:'sports',
      title:'IPL 2025: Team-by-Team Preview and Bold Predictions',
      excerpt:"Full squad analysis, key player battles, and our predictions for who lifts the IPL 2025 trophy — with stats, auction insights, and form analysis.",
      readTime:'10 min', date:'2025-04-12', tags:['IPL 2025','Cricket','T20','BCCI'],
      body:`<p>IPL 2025 promises to be the most competitive edition yet, with the auction reshuffling several squads dramatically. Here is our team-by-team breakdown.</p>
<h2>Mumbai Indians</h2>
<p>With Hardik Pandya back as captain, MI have rebuilt around a core of young Indian talent. The bowling attack, bolstered by Jasprit Bumrah and Gerald Coetzee, is arguably the best in the tournament.</p>
<h2>Chennai Super Kings</h2>
<p>MS Dhoni remains the heart of CSK. Ruturaj Gaikwad has matured into a world-class opening batter. Their biggest question mark is the pace department after releasing several key bowlers at auction.</p>
<h2>Royal Challengers Bangalore</h2>
<p>Virat Kohli and Faf du Plessis form the most dangerous opening pair in the competition. If their middle order can finally fire consistently, this could finally be RCB's year.</p>` },
    { id:'s05', slug:'skincare-routine-indian-women-2025', category:'women-health',
      title:'The Complete Skincare Routine for Indian Skin Tones: 2025 Guide',
      excerpt:'Dermatologist-approved skincare tailored for Indian skin — from the best SPF for brown skin to hyperpigmentation treatments that actually work.',
      readTime:'8 min', date:'2025-04-11', tags:['Skincare','Indian Skin','Dermatology','Beauty'],
      body:`<p>Indian skin has unique characteristics — higher melanin content, more proneness to hyperpigmentation, and the effects of tropical humidity and pollution. Generic Western skincare advice often misses the mark. Here is what actually works.</p>
<h2>Morning Routine (Non-Negotiable Steps)</h2>
<p><strong>Cleanser:</strong> Use a gentle, pH-balanced cleanser (around 5.5). Avoid anything with sodium lauryl sulphate if you have sensitive skin. Minimalist, Dot & Key, and Plum all make excellent options under ₹400.</p>
<p><strong>Vitamin C Serum:</strong> The single best investment for Indian skin. L-ascorbic acid at 10-15% concentration reduces hyperpigmentation, boosts collagen, and fights pollution damage. Apply before sunscreen.</p>
<p><strong>SPF — The Most Important Step:</strong> Indian skin is not immune to sun damage. Use SPF 50+ PA+++ every single day. Sunscreen prevents dark spots better than any treatment product. Best budget pick: Minimalist SPF 50 (₹299).</p>
<h2>Treating Hyperpigmentation</h2>
<p>The most effective ingredients for Indian skin are: Niacinamide (10%) for brightening, Alpha Arbutin for dark spots, and Azelaic Acid for post-acne marks. Avoid bleaching creams with mercury or steroids — they cause long-term damage.</p>` },
    { id:'s06', slug:'best-smartphones-under-20000-india-2025', category:'technology',
      title:'Best Smartphones Under ₹20,000 in India (April 2025)',
      excerpt:'Tested and ranked: the top smartphones under ₹20,000 in India right now — camera quality, battery life, gaming performance, and long-term value.',
      readTime:'8 min', date:'2025-04-10', tags:['Smartphones','Budget Phones','India','Tech Review'],
      body:`<p>The sub-₹20,000 segment in India is the most competitive in the world. In 2025, you can get a genuinely excellent smartphone with a great camera, all-day battery, and smooth performance at this price point.</p>
<h2>1. Redmi Note 14 Pro — Best Overall</h2>
<p>The Redmi Note 14 Pro offers a 200MP main camera, Snapdragon 7s Gen 3, 5,500mAh battery, and a premium glass build for around ₹19,499. The camera performance punches well above its weight class, and MIUI 15 has become significantly cleaner.</p>
<h2>2. Realme 13 Pro+ — Best Camera</h2>
<p>Sony LYT-600 main sensor with impressive low-light performance. The 80W charging fills a 5,000mAh battery in under 45 minutes. Available for ₹18,999.</p>
<h2>3. Samsung Galaxy M35 — Best for Long-Term Use</h2>
<p>Samsung's 4-year OS update promise is unmatched in this segment. Exynos 1380 chip, 6,000mAh battery, and a clean One UI experience. The best choice if you plan to use the phone for 3+ years.</p>` },
    { id:'s07', slug:'sensex-nifty-market-outlook-april-2025', category:'business',
      title:'Sensex & Nifty Outlook: What Experts Are Saying for Q2 2025',
      excerpt:"India's stock markets have been volatile. We break down the key drivers, expert forecasts, sectoral calls, and what retail investors should do right now.",
      readTime:'7 min', date:'2025-04-09', tags:['Sensex','Nifty','Stock Market','Investment','India'],
      body:`<p>After a turbulent Q1 2025, Indian equities are at a critical juncture. The Sensex has oscillated between 73,000 and 78,000 while FII outflows and global macro uncertainty have kept markets on edge.</p>
<h2>Key Drivers for Q2 2025</h2>
<p><strong>Global factors:</strong> US Federal Reserve rate decisions remain the single biggest external variable. Any hint of rate cuts will bring FII money back into emerging markets including India.</p>
<p><strong>Domestic earnings:</strong> Q4 FY25 earnings season starts in April. Expectations are cautious across IT and FMCG but optimistic for banking, infrastructure, and defence sectors.</p>
<p><strong>Monsoon forecast:</strong> IMD has predicted above-normal monsoon for 2025, which is broadly positive for rural consumption, FMCG, and agricultural stocks.</p>
<h2>Sectoral Calls</h2>
<p>Analysts at HDFC Securities and Kotak remain bullish on: <strong>Banking (PSU banks), Capex/Infrastructure, Defence, and Pharma</strong>. IT and consumer discretionary are being approached with caution due to global slowdown fears.</p>` },
    { id:'s08', slug:'ashwagandha-benefits-science-2025', category:'ayurveda',
      title:'Ashwagandha: What the 2025 Science Actually Says',
      excerpt:"Ashwagandha is everywhere. But does it work? We review 40+ clinical trials to tell you what it genuinely helps with — and what's pure marketing.",
      readTime:'7 min', date:'2025-04-08', tags:['Ashwagandha','Ayurveda','Supplements','Stress Relief'],
      body:`<p>Ashwagandha (Withania somnifera) has been used in Ayurvedic medicine for over 3,000 years. In the past five years it has exploded in the global wellness market. Let us look at what the clinical evidence actually shows.</p>
<h2>What It Genuinely Helps With</h2>
<p><strong>Stress and anxiety:</strong> This is the strongest evidence. Multiple double-blind, placebo-controlled trials show KSM-66 and Sensoril ashwagandha extracts significantly reduce cortisol levels and self-reported stress scores.</p>
<p><strong>Sleep quality:</strong> A 2021 study in Medicine found that 600mg daily for 8 weeks improved sleep quality, sleep onset latency, and morning alertness in adults with insomnia.</p>
<p><strong>Male fertility:</strong> Several studies show improvements in sperm count, motility, and testosterone levels in infertile men taking 5g root powder daily for 3 months.</p>
<p><strong>Strength and recovery:</strong> Modest but real improvements in resistance training outcomes. A 2015 study found 600mg/day over 8 weeks significantly increased muscle mass and strength vs placebo.</p>
<h2>What It Does NOT Do</h2>
<p>Claims around weight loss, cancer prevention, and dramatic cognitive enhancement are not supported by current evidence. Be sceptical of supplement brands making these claims.</p>` },
    { id:'s09', slug:'top-government-jobs-india-april-2025', category:'jobs',
      title:'Top 50 Government Job Openings in India — April 2025',
      excerpt:'UPSC, SSC, Railways, Banking, Defence: the biggest government job notifications in India this month with eligibility, dates, and how to apply.',
      readTime:'9 min', date:'2025-04-07', tags:['Sarkari Naukri','UPSC','SSC','Government Jobs'],
      body:`<p>April 2025 sees major recruitment notifications across several central and state government departments. Here are the most significant openings.</p>
<h2>UPSC Civil Services 2025</h2>
<p>The Union Public Service Commission has announced 1,056 vacancies for IAS, IPS, IFS, and other central services. Preliminary exam date: 25 May 2025. Last date to apply: 11 April 2025. Age limit: 21-32 years (relaxation for SC/ST/OBC).</p>
<h2>SSC CGL 2025</h2>
<p>Staff Selection Commission's Combined Graduate Level exam is open for approx. 17,727 posts. Eligibility: Any graduate. Application open till 30 April 2025. Tier 1 exam tentatively in June-July 2025.</p>
<h2>RRB NTPC 2025</h2>
<p>Railway Recruitment Board is hiring for 11,558 Non-Technical Popular Category posts. Apply at rrbapply.gov.in. Exam dates to be announced post application closure.</p>
<h2>SBI PO 2025</h2>
<p>State Bank of India Probationary Officer recruitment for 600 posts. Eligibility: Graduate with 60% marks. Age: 21-30 years. Prelim exam expected June 2025.</p>` },
    { id:'s10', slug:'climate-india-heatwave-2025', category:'environment',
      title:'India Heatwave 2025: Why This Summer Is Different and What to Do',
      excerpt:"IMD is predicting record temperatures across 12 Indian states. Climate scientists explain why this heatwave is structurally different — and how to protect yourself.",
      readTime:'6 min', date:'2025-04-06', tags:['Heatwave','Climate Change','India','Environment'],
      body:`<p>India is entering one of the most intense pre-monsoon seasons on record. The India Meteorological Department has issued red and orange alerts for Rajasthan, Maharashtra, Telangana, Andhra Pradesh, and Odisha, with temperatures projected to exceed 46°C in several districts.</p>
<h2>Why This Year Is Different</h2>
<p>A combination of factors is driving the 2025 heatwave. La Niña conditions are weakening, a strong western disturbance is blocking cooler northern winds, and the urban heat island effect in Indian cities has intensified significantly over the past decade.</p>
<h2>Health Risks</h2>
<p>Heat stroke kills. Symptoms include core body temperature above 40°C, confusion, loss of consciousness, and absence of sweating. If you see someone with these symptoms: move them to shade, pour cold water on them, and call emergency services immediately.</p>
<h2>Protecting Yourself</h2>
<ul><li>Stay indoors between 11am and 4pm when possible</li><li>Drink at least 3-4 litres of water daily; add ORS to one glass</li><li>Wear loose, light-coloured cotton clothing</li><li>Never leave children or pets in parked cars</li></ul>` },
    { id:'s11', slug:'mental-health-india-stigma-2025', category:'mental-health',
      title:"India's Mental Health Crisis: Why We Still Don't Talk About It",
      excerpt:'India has one of the highest rates of depression and anxiety in the world — yet 80% never seek help. Mental health experts on what needs to change.',
      readTime:'8 min', date:'2025-04-05', tags:['Mental Health','Depression','India','Therapy'],
      body:`<p>According to the National Mental Health Survey of India, 197 million Indians are living with a mental health condition. That is more than the entire population of Brazil. Yet only 20% of those who need care ever receive it.</p>
<h2>The Stigma Problem</h2>
<p>In Indian society, mental illness is still widely associated with weakness, possession, or family shame. A 2023 Lancet study found that 65% of Indians believe "mental problems can be solved through willpower alone." This belief directly prevents help-seeking.</p>
<h2>The Treatment Gap</h2>
<p>India has 0.3 psychiatrists per 100,000 people. The recommended minimum is 3 per 100,000. Rural areas are virtually without any mental health services.</p>
<h2>What Is Changing</h2>
<p>The 2022 National Tele Mental Health Programme (iCall, Vandrevala Foundation, NIMHANS helplines) has expanded digital access. Several state governments are training ASHA workers in mental health first aid. And among urban youth, the conversation is slowly shifting.</p>
<h2>Where to Get Help in India</h2>
<ul><li><strong>iCall:</strong> 9152987821</li><li><strong>Vandrevala Foundation:</strong> 1860-2662-345 (24/7)</li><li><strong>NIMHANS:</strong> 080-46110007</li></ul>` },
    { id:'s12', slug:'indian-street-food-guide-2025', category:'food',
      title:'India\'s 20 Greatest Street Foods: A City-by-City Guide',
      excerpt:'From Mumbai\'s vada pav to Kolkata\'s kathi rolls — the definitive guide to India\'s street food culture with addresses, prices, and what to order.',
      readTime:'10 min', date:'2025-04-04', tags:['Street Food','Indian Cuisine','Food Guide','Travel'],
      body:`<p>India's street food is a civilisational achievement. Each city has its own grammar — its own dominant flavours, techniques, and rituals. Here is the definitive tour.</p>
<h2>Mumbai: Vada Pav & Pav Bhaji</h2>
<p>The vada pav is Mumbai's soul food — a spiced potato fritter in a bread roll with chutneys. The best in the city: Ashok Vada Pav at Kirti College, Dadar (₹20). Pav Bhaji at Sardar, Tardeo — the original and still the best (₹120).</p>
<h2>Delhi: Chaat & Paranthas</h2>
<p>Paranthe Wali Gali in Old Delhi has been frying stuffed paranthas since the 1870s. Try the banana or rabdi versions. Natraj Dahi Bhalle at Chandni Chowk is the chaat benchmark.</p>
<h2>Kolkata: Kathi Rolls & Mishti Doi</h2>
<p>The kathi roll was invented in Kolkata — egg-coated paratha wrapped around seekh kebab. Nizam's restaurant on New Market Road is the original (1932). Follow with mishti doi from Balaram Mullick & Radharaman Mullick.</p>
<h2>Chennai: Idli, Dosa & Filter Coffee</h2>
<p>Saravana Bhavan remains the global standard-setter for South Indian breakfast. The paper dosa is the size of a small table. Filter coffee at ₹30 is non-negotiable.</p>` },
  ];

  /* ===== AI ARTICLES from localStorage ===== */
  function getAIArticles() {
    try { return JSON.parse(localStorage.getItem('sfritrav_articles') || '[]'); } catch { return []; }
  }

  function allArticles() {
    return [...getAIArticles(), ...SEED];
  }

  /* ===== EXPOSE GLOBAL ===== */
  window.SfriTrav = { allArticles, CATEGORIES, getImg, SEED };

  /* ===== HELPERS ===== */
  function catLabel(cat) { return CATEGORIES[cat]?.label || cat; }
  function catColor(cat) { return CATEGORIES[cat]?.color || 'news'; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }); }
  function slugify(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0,100); }

  /* ===== CARD HTML ===== */
  function cardHTML(a, imgIdx = 0) {
    return `<article class="card">
      <a href="/pages/article.html?slug=${a.slug}" class="card-img-wrap">
        <img class="card-img" src="${getImg(a.category, imgIdx)}" alt="${a.title}" loading="lazy" width="700" height="394">
      </a>
      <div class="card-body">
        <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
        <h3 class="card-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h3>
        <p class="card-excerpt">${a.excerpt}</p>
        <div class="card-meta"><time datetime="${a.date}">${fmtDate(a.date)}</time><span class="dot">·</span><span>${a.readTime} read</span></div>
      </div>
    </article>`;
  }

  function cardHHTML(a, imgIdx = 0) {
    return `<article class="card card-h">
      <a href="/pages/article.html?slug=${a.slug}" class="card-img-wrap">
        <img class="card-img" src="${getImg(a.category, imgIdx)}" alt="${a.title}" loading="lazy" width="130" height="100">
      </a>
      <div class="card-body">
        <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
        <h4 class="card-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h4>
        <div class="card-meta"><time datetime="${a.date}">${fmtDate(a.date)}</time></div>
      </div>
    </article>`;
  }

  /* ===== TRENDING from API ===== */
  async function loadTrending() {
    const el = document.getElementById('trendingItems');
    if (!el) return;
    try {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.trending && data.trending.length) {
        const doubled = [...data.trending, ...data.trending];
        el.innerHTML = doubled.map(t =>
          `<a href="/pages/search.html?q=${encodeURIComponent(t.title)}">`+
          `<span class="trend-hash">#</span>${t.title}</a><span class="ticker-sep">·</span>`
        ).join('');
      }
    } catch { /* keep default */ }
  }

  /* ===== HOMEPAGE RENDER ===== */
  function renderHomepage() {
    const articles = allArticles();
    const featured = articles.filter(a => a.featured);
    const rest = articles.filter(a => !a.featured);

    // Hero main
    const heroMain = document.getElementById('heroMain');
    if (heroMain && featured[0]) {
      const a = featured[0];
      heroMain.innerHTML = `
        <a href="/pages/article.html?slug=${a.slug}">
          <img class="hero-main-img" src="${getImg(a.category, 0)}" alt="${a.title}" loading="eager" width="800" height="450">
        </a>
        <div class="hero-main-body">
          <span class="tag ${catColor(a.category)}">${catLabel(a.category)}</span>
          <h2 class="hero-main-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></h2>
          <p class="hero-main-excerpt">${a.excerpt}</p>
          <div class="hero-meta"><time>${fmtDate(a.date)}</time><span class="dot">·</span><span>${a.readTime} read</span></div>
        </div>`;
    }

    // Hero stack
    const heroStack = document.getElementById('heroStack');
    if (heroStack) {
      const stackItems = [...featured.slice(1), ...rest].slice(0, 4);
      heroStack.innerHTML = stackItems.map((a,i) => `
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
      latestGrid.innerHTML = articles.slice(0, 8).map((a,i) => cardHTML(a, i)).join('');
    }

    // Numbered trending sidebar
    const trendingList = document.getElementById('trendingList');
    if (trendingList) {
      trendingList.innerHTML = `<div class="num-list">${articles.slice(0, 7).map((a,i) => `
        <div class="num-item">
          <span class="num-badge">${String(i+1).padStart(2,'0')}</span>
          <div>
            <div class="num-title"><a href="/pages/article.html?slug=${a.slug}">${a.title}</a></div>
            <div class="num-meta">${catLabel(a.category)} · ${fmtDate(a.date)}</div>
          </div>
        </div>`).join('')}</div>`;
    }

    // Category sections
    const FEATURED_CATS = ['health','sports','technology','food','women-health','business','environment','jobs'];
    FEATURED_CATS.forEach(cat => {
      const el = document.getElementById(`cat-${cat}`);
      if (!el) return;
      const catArticles = articles.filter(a => a.category === cat).slice(0, 3);
      if (catArticles.length === 0) return;
      el.innerHTML = catArticles.map((a,i) => cardHTML(a, i)).join('');
    });
  }

  /* ===== AUTO-GENERATE ARTICLES (client-side daily trigger) ===== */
  async function checkDailyGeneration() {
    const today = new Date().toISOString().split('T')[0];
    const lastGen = localStorage.getItem('sfritrav_last_gen');
    if (lastGen === today) return;

    // Try to trigger cron (no-op if no CRON_SECRET match, that's fine)
    // Client-side generation: call generate-article for 2 categories
    const cats = Object.keys(CATEGORIES).sort(() => Math.random() - 0.5).slice(0, 2);
    const stored = getAIArticles();

    for (const cat of cats) {
      try {
        const res = await fetch('/api/generate-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat, topic: `Trending ${CATEGORIES[cat].label} topics in India 2025` })
        });
        if (!res.ok) continue;
        const article = await res.json();
        if (article.title) {
          article.category = cat;
          article.date = new Date().toISOString().split('T')[0];
          article.aiGenerated = true;
          article.id = 'ai_' + Date.now() + '_' + cat;
          stored.unshift(article);
        }
      } catch { /* silently fail */ }
    }

    // Keep max 30 AI articles
    const trimmed = stored.slice(0, 30);
    try { localStorage.setItem('sfritrav_articles', JSON.stringify(trimmed)); } catch {}
    localStorage.setItem('sfritrav_last_gen', today);
  }

  /* ===== COMMON UI ===== */
  function initCommonUI() {
    // Header scroll
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

    // Hamburger
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    if (ham && nav) {
      ham.addEventListener('click', () => { nav.classList.toggle('open'); ham.setAttribute('aria-expanded', nav.classList.contains('open')); });
    }

    // Cookie consent
    const banner = document.getElementById('cookieBanner');
    if (banner && !localStorage.getItem('st_cookie')) {
      setTimeout(() => banner.classList.add('visible'), 2000);
      document.getElementById('cookieAccept')?.addEventListener('click', () => { localStorage.setItem('st_cookie', '1'); banner.classList.remove('visible'); });
      document.getElementById('cookieDecline')?.addEventListener('click', () => { localStorage.setItem('st_cookie', '0'); banner.classList.remove('visible'); });
    }

    // Footer year
    document.querySelectorAll('.footer-year').forEach(el => el.textContent = new Date().getFullYear());

    // Date bar
    const dateEl = document.getElementById('todayDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // Newsletter forms
    document.querySelectorAll('.nl-form').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.querySelector('[name="email"]').value.trim();
        const msg = form.querySelector('.nl-msg');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (msg) { msg.textContent = 'Please enter a valid email.'; msg.className = 'nl-msg error'; }
          return;
        }
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        try {
          const res = await fetch(CFG.formspree, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, _subject: 'SfriTrav Newsletter', source: location.pathname })
          });
          if (res.ok && msg) { msg.textContent = '✓ Subscribed! Welcome aboard.'; msg.className = 'nl-msg success'; form.reset(); }
          else if (msg) { msg.textContent = 'Something went wrong. Try again.'; msg.className = 'nl-msg error'; }
        } catch { if (msg) { msg.textContent = 'Network error. Try again.'; msg.className = 'nl-msg error'; } }
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
