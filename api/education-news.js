/**
 * /api/education-news.js
 * Real-time education, exam, result, admit card & academic news for India
 * Fetches from official portals + RSS + structured portal data
 * No API key required. Cached 10 minutes.
 */

// ── Education & Exam RSS Feeds ──────────────────────────────────────────────
const FEEDS = [
  { url: 'https://www.careers360.com/rss/news/exams.xml',               src: 'Careers360',     type: 'exam',    w: 4 },
  { url: 'https://www.shiksha.com/rss/news.xml',                        src: 'Shiksha',        type: 'exam',    w: 3 },
  { url: 'https://www.jagranjosh.com/rss/current-affairs.xml',          src: 'Jagran Josh',    type: 'general', w: 3 },
  { url: 'https://www.jagranjosh.com/rss/government-jobs.xml',          src: 'Jagran Josh',    type: 'result',  w: 3 },
  { url: 'https://sarkariresult.com/feed/',                             src: 'SarkariResult',  type: 'result',  w: 4 },
  { url: 'https://www.fresherslive.com/rss.xml',                        src: 'FreshersLive',   type: 'exam',    w: 3 },
  { url: 'https://www.indiaresults.com/rss/',                           src: 'IndiaResults',   type: 'result',  w: 3 },
  { url: 'https://www.examresults.net/rss/',                            src: 'ExamResults',    type: 'result',  w: 3 },
  { url: 'https://feeds.feedburner.com/NdtvEducation',                  src: 'NDTV Education', type: 'general', w: 3 },
  { url: 'https://timesofindia.indiatimes.com/rss/feed/Education.cms',  src: 'TOI Education',  type: 'general', w: 3 },
  { url: 'https://www.thehindu.com/education/feeder/default.rss',       src: 'The Hindu Edu',  type: 'general', w: 3 },
  { url: 'https://indianexpress.com/section/education/feed/',           src: 'Indian Express', type: 'general', w: 3 },
  { url: 'https://www.aglasem.com/feed/',                               src: 'AglaSem',        type: 'exam',    w: 4 },
  { url: 'https://www.successcds.net/rss.xml',                         src: 'SuccessCDS',     type: 'exam',    w: 3 },
  { url: 'https://www.sarkariexam.com/feed/',                          src: 'SarkariExam',    type: 'exam',    w: 4 },
];

// ── Official Portal Directory ───────────────────────────────────────────────
// This is static structured data returned alongside live RSS
// URLs are official government / authorised portals
const PORTALS = {
  national: [
    { name: 'UPSC — Civil Services',          url: 'https://upsc.gov.in',                         type: 'exam',        desc: 'Notification, admit card, results for IAS/IPS/IFS' },
    { name: 'SSC — Combined Graduate Level',  url: 'https://ssc.gov.in',                          type: 'exam',        desc: 'CGL, CHSL, MTS, CPO, JE notifications & results' },
    { name: 'IBPS — Bank Exams',              url: 'https://ibps.in',                             type: 'bank',        desc: 'PO, Clerk, SO, RRB — admit cards, results, scores' },
    { name: 'SBI Recruitment',                url: 'https://sbi.co.in/careers',                   type: 'bank',        desc: 'SBI PO, Clerk, SO official notifications' },
    { name: 'RBI Grade B',                    url: 'https://opportunities.rbi.org.in',            type: 'bank',        desc: 'RBI Officer, Assistant, Grade B exam portal' },
    { name: 'NTA — NEET / JEE / CUET',       url: 'https://nta.ac.in',                           type: 'medical',     desc: 'NEET UG/PG, JEE Main/Advanced, CUET, NET admit cards' },
    { name: 'NDA — National Defence Academy', url: 'https://upsc.gov.in/examinations/nda-na',    type: 'defence',     desc: 'NDA I & II notification, admit card, result via UPSC' },
    { name: 'CDS — Combined Defence Services',url: 'https://upsc.gov.in/examinations/cds',       type: 'defence',     desc: 'IMA, INA, AFA, OTA entries — UPSC CDS portal' },
    { name: 'AFCAT — Air Force',              url: 'https://afcat.cdac.in',                       type: 'defence',     desc: 'Air Force Common Admission Test — Flying & Ground Duty' },
    { name: 'SSB Interview Guide',            url: 'https://ssbcrack.com',                        type: 'defence',     desc: 'SSB preparation, PPDT, GD, lecturette, conference tips' },
    { name: 'UGC NET / SET',                  url: 'https://ugcnet.nta.nic.in',                   type: 'academic',    desc: 'University Grants Commission NET for JRF & Lectureship' },
    { name: 'GATE — Engineering PG',          url: 'https://gate.iitd.ac.in',                     type: 'academic',    desc: 'Graduate Aptitude Test in Engineering — GATE 2026' },
    { name: 'CAT — IIM Admissions',          url: 'https://iimcat.ac.in',                        type: 'academic',    desc: 'Common Admission Test for IIM MBA admissions' },
    { name: 'CLAT — Law Entrance',            url: 'https://consortiumofnlus.ac.in',              type: 'academic',    desc: 'Common Law Admission Test for NLUs' },
    { name: 'NEET PG — Medical PG',          url: 'https://natboard.edu.in',                     type: 'medical',     desc: 'National Board of Examinations — NEET PG, FNB, FMGE' },
    { name: 'AIAPGET — Ayurveda PG',         url: 'https://aiapget.nta.nic.in',                  type: 'medical',     desc: 'All India Ayush PG Entrance Test — AYUSH Ministry' },
    { name: 'Railway NTPC / Group D',         url: 'https://rrbcdg.gov.in',                       type: 'exam',        desc: 'RRB NTPC, Group D, ALP, JE — All zone boards' },
    { name: 'DSSB Delhi',                     url: 'https://dsssb.delhi.gov.in',                  type: 'exam',        desc: 'Delhi Subordinate Services Selection Board' },
    { name: 'ESIC — Medical/Para-medical',    url: 'https://esic.gov.in/careers',                 type: 'medical',     desc: 'ESIC UDC, MTS, IMO, Stenographer notifications' },
    { name: 'NABARD Development Assistant',   url: 'https://nabard.org/careers',                  type: 'bank',        desc: 'NABARD Grade A/B, Office Attendant, DA exams' },
  ],
  state: [
    { name: 'JKPSC — J&K PSC',               url: 'https://jkpsc.nic.in',                        state: 'J&K',        type: 'psc',     desc: 'KAS, Combined Competitive, Allied Services, Medical' },
    { name: 'JKSSB — J&K Services Board',     url: 'https://jkssb.nic.in',                        state: 'J&K',        type: 'psc',     desc: 'J&K Sub-Inspector, Finance Accounts, Class IV posts' },
    { name: 'JKBOSE — Board Results',         url: 'https://jkbose.nic.in',                       state: 'J&K',        type: 'result',  desc: 'Class 10 & 12 (Annual/Biannual) results, date sheets' },
    { name: 'BOPEE — Medical Entrance J&K',   url: 'https://jkbopee.gov.in',                      state: 'J&K',        type: 'medical', desc: 'MBBS, BDS, BAMS, Nursing, Pharmacy counselling' },
    { name: 'UPSSSC — UP SSC',                url: 'https://upsssc.gov.in',                       state: 'UP',         type: 'psc',     desc: 'PET, Lekhpal, Lower Subordinate, Junior Engineer' },
    { name: 'UPPSC — UP PSC',                 url: 'https://uppsc.up.nic.in',                     state: 'UP',         type: 'psc',     desc: 'PCS, RO/ARO, ACF, RFO, Staff Nurse notifications' },
    { name: 'UP Board Results',               url: 'https://upmsp.edu.in',                        state: 'UP',         type: 'result',  desc: 'UP Madhyamik Shiksha Parishad — Class 10 & 12' },
    { name: 'MPSC — Maharashtra PSC',         url: 'https://mpsc.gov.in',                         state: 'Maharashtra',type: 'psc',     desc: 'State Services, Police Sub-Inspector, Forest Service' },
    { name: 'Maharashtra HSC/SSC Board',      url: 'https://msbshse.co.in',                       state: 'Maharashtra',type: 'result',  desc: 'Class 10 (SSC) and Class 12 (HSC) results & timetable' },
    { name: 'RPSC — Rajasthan PSC',           url: 'https://rpsc.rajasthan.gov.in',               state: 'Rajasthan',  type: 'psc',     desc: 'RAS, 1st/2nd Grade Teacher, SI, AEN notifications' },
    { name: 'RSMSSB — Rajasthan SSSB',        url: 'https://rsmssb.rajasthan.gov.in',             state: 'Rajasthan',  type: 'psc',     desc: 'Patwari, Lab Assistant, Gram Sevak, JEN exams' },
    { name: 'RSOS — Rajasthan Board Results', url: 'https://rajresults.nic.in',                   state: 'Rajasthan',  type: 'result',  desc: 'Rajasthan Board 10th/12th results, supplementary' },
    { name: 'HPSC — Haryana PSC',             url: 'https://hpsc.gov.in',                         state: 'Haryana',    type: 'psc',     desc: 'HCS, AEO, ADPO, Medical Officer, SDM notifications' },
    { name: 'HSSC — Haryana SSC',             url: 'https://hssc.gov.in',                         state: 'Haryana',    type: 'psc',     desc: 'Group C & D posts, Constable, Clerk, Canal Patwari' },
    { name: 'HBSE/BSEH — Haryana Board',      url: 'https://bseh.org.in',                         state: 'Haryana',    type: 'result',  desc: 'Class 10 & 12 board results, re-evaluation, date sheet' },
    { name: 'PPSC — Punjab PSC',              url: 'https://ppsc.gov.in',                         state: 'Punjab',     type: 'psc',     desc: 'PCS, AE, Tehsildar, Medical Officer notifications' },
    { name: 'PSSSB — Punjab SSSB',            url: 'https://sssb.punjab.gov.in',                  state: 'Punjab',     type: 'psc',     desc: 'Clerk, Sub Inspector, Revenue Patwari, Lineman posts' },
    { name: 'PSEB — Punjab Board',            url: 'https://pseb.ac.in',                          state: 'Punjab',     type: 'result',  desc: 'Punjab School Education Board — 10th & 12th results' },
    { name: 'HIMACHAL HPPSC',                 url: 'https://hppsc.hp.gov.in',                     state: 'HP',         type: 'psc',     desc: 'Allied Services, Medical Officer, Tehsildar exams' },
    { name: 'HPBOSE — HP Board',              url: 'https://hpbose.org',                          state: 'HP',         type: 'result',  desc: 'Himachal Pradesh Board 10th & 12th results, date sheet' },
    { name: 'UKPSC — Uttarakhand PSC',        url: 'https://psc.uk.gov.in',                       state: 'Uttarakhand',type: 'psc',     desc: 'State Services, Forest Guard, SI notifications' },
    { name: 'BPSC — Bihar PSC',               url: 'https://bpsc.bih.nic.in',                     state: 'Bihar',      type: 'psc',     desc: 'BPSC 70th CCE, TRE 3.0, CDPO, AAO notifications' },
    { name: 'BSEB — Bihar Board',             url: 'https://biharboardonline.bihar.gov.in',       state: 'Bihar',      type: 'result',  desc: 'Bihar Matric/Inter results, compartmental exams' },
    { name: 'JPSC — Jharkhand PSC',           url: 'https://jpsc.gov.in',                         state: 'Jharkhand',  type: 'psc',     desc: 'Combined Civil Services, Judicial Services, SI exams' },
    { name: 'JSSC — Jharkhand SSC',           url: 'https://jssc.nic.in',                         state: 'Jharkhand',  type: 'psc',     desc: 'CGL, CTTCE, Excise Constable, Inter-level exams' },
    { name: 'CGPSC — Chhattisgarh PSC',       url: 'https://psc.cg.gov.in',                       state: 'CG',         type: 'psc',     desc: 'State Services, Forest, Medical Officer notifications' },
    { name: 'MPPSC — MP PSC',                 url: 'https://mppsc.mp.gov.in',                     state: 'MP',         type: 'psc',     desc: 'State Services, Forest Service, Medical Officer' },
    { name: 'MPBSE — MP Board',               url: 'https://mpbse.nic.in',                        state: 'MP',         type: 'result',  desc: 'MP Board 10th & 12th results, supplementary exam' },
    { name: 'GPSC — Gujarat PSC',             url: 'https://gpsc.gujarat.gov.in',                 state: 'Gujarat',    type: 'psc',     desc: 'Class 1 & 2 services, DYSO, Mamlatdar notifications' },
    { name: 'GSEB — Gujarat Board',           url: 'https://gseb.org',                            state: 'Gujarat',    type: 'result',  desc: 'Gujarat SSC/HSC results, supplementary, timetable' },
    { name: 'KPSC — Karnataka PSC',           url: 'https://kpsc.kar.nic.in',                     state: 'Karnataka',  type: 'psc',     desc: 'KAS, FDA, SDA, AEN, Medical Officer notifications' },
    { name: 'KSEAB — Karnataka Board',        url: 'https://kseab.karnataka.gov.in',              state: 'Karnataka',  type: 'result',  desc: 'SSLC & PUC I/II results, date sheet, supplementary' },
    { name: 'TSPSC — Telangana PSC',          url: 'https://tspsc.gov.in',                        state: 'Telangana',  type: 'psc',     desc: 'Group I/II/III, SI, AEE, Medical Officer exams' },
    { name: 'APPSC — AP PSC',                 url: 'https://psc.ap.gov.in',                       state: 'AP',         type: 'psc',     desc: 'Group I/II/III, AEE, APPSC notifications & results' },
    { name: 'TNPSC — Tamil Nadu PSC',         url: 'https://tnpsc.gov.in',                        state: 'TN',         type: 'psc',     desc: 'Group I/II/IIA/IV, CCSE, Combined Sub-Services' },
    { name: 'KEAM — Kerala Engineering',      url: 'https://cee.kerala.gov.in',                   state: 'Kerala',     type: 'medical', desc: 'Kerala Engineering, Architecture, Medical entrance' },
    { name: 'WBPSC — West Bengal PSC',        url: 'https://psc.wb.gov.in',                       state: 'WB',         type: 'psc',     desc: 'WBCS, Food SI, Sub-Inspector, Audit Service' },
    { name: 'WBBSE/WBCHSE — WB Boards',      url: 'https://wbresults.nic.in',                    state: 'WB',         type: 'result',  desc: 'Madhyamik & Higher Secondary results portal' },
    { name: 'OPSC — Odisha PSC',             url: 'https://opsc.gov.in',                         state: 'Odisha',     type: 'psc',     desc: 'OAS, OFS, Medical Officer, Allied Services' },
    { name: 'APSC — Assam PSC',              url: 'https://apsc.nic.in',                         state: 'Assam',      type: 'psc',     desc: 'ACS, APS, Forest, Medical Officer notifications' },
    { name: 'APDCL / ASSEB — Assam',         url: 'https://sebaonline.org',                      state: 'Assam',      type: 'result',  desc: 'HSLC & HS result portal — Assam Board' },
    { name: 'UKSSSC — Uttarakhand SSSB',     url: 'https://sssc.uk.gov.in',                      state: 'Uttarakhand',type: 'psc',     desc: 'Group C posts, Forest Guard, Patwari, Lekhpal' },
    { name: 'GOA PSC',                        url: 'https://gpsc.goa.gov.in',                     state: 'Goa',        type: 'psc',     desc: 'Goa Civil Services, Tax Inspector, PI notifications' },
    { name: 'MANIPUR PSC',                    url: 'https://manipurpsc.gov.in',                   state: 'Manipur',    type: 'psc',     desc: 'Manipur Civil Services, Forest, Medical notifications' },
    { name: 'NAGALAND PSC',                   url: 'https://npsc.nagaland.gov.in',                state: 'Nagaland',   type: 'psc',     desc: 'Civil Services, Forest, Judicial Services' },
  ],
  results: [
    { name: 'IndiaResults.com',               url: 'https://www.indiaresults.com',                type: 'result',  desc: 'All state board & university results — one portal' },
    { name: 'ExamResults.net',                url: 'https://www.examresults.net',                 type: 'result',  desc: 'Board results for all states — 10th, 12th, UG, PG' },
    { name: 'India.gov.in — Results',         url: 'https://www.india.gov.in/spotlight/results', type: 'result',  desc: 'Official India portal result announcements' },
    { name: 'CBSE — Class 10 & 12',          url: 'https://cbse.gov.in/results',                 type: 'result',  desc: 'CBSE Board Results, CTET, NET results' },
    { name: 'ICSE — Class 10 & 12',          url: 'https://cisce.org',                           type: 'result',  desc: 'ICSE ISC results, date sheet, compartmental' },
    { name: 'DigiLocker — Marksheets',        url: 'https://www.digilocker.gov.in',               type: 'result',  desc: 'Download official certificates, marksheets digitally' },
    { name: 'NIC Results Portal',             url: 'https://results.nic.in',                      type: 'result',  desc: 'National Informatics Centre — board result gateway' },
  ],
  tenders_notices: [
    { name: 'GeM — Govt e-Marketplace',       url: 'https://gem.gov.in',                          type: 'tender',  desc: 'Government procurement tenders, bids, notices' },
    { name: 'CPPP — Central Public Portal',   url: 'https://eprocure.gov.in/cppp',                type: 'tender',  desc: 'Central public procurement — all Ministries' },
    { name: 'NIC Tenders',                    url: 'https://tenderwizard.gov.in',                 type: 'tender',  desc: 'State & Central Govt tenders — all categories' },
    { name: 'Education Ministry Circulars',   url: 'https://education.gov.in/notifications',      type: 'notice',  desc: 'MoE notices, circulars, policy updates' },
    { name: 'UGC Notices & Circulars',        url: 'https://ugc.gov.in/notice.aspx',              type: 'notice',  desc: 'University Grants Commission — institutions, faculty' },
    { name: 'AICTE Notifications',            url: 'https://aicte-india.org/notifications',       type: 'notice',  desc: 'Technical education notices, approvals, circulars' },
    { name: 'NAAC — Accreditation',           url: 'https://naac.gov.in',                         type: 'notice',  desc: 'College & university accreditation grades & circulars' },
  ],
  scholarship: [
    { name: 'NSP — National Scholarship',     url: 'https://scholarships.gov.in',                 type: 'scholarship', desc: 'Pre/Post Matric, Merit, Minority, Disability scholarships' },
    { name: 'PM Yasasvi Scholarship',         url: 'https://yet.nta.ac.in',                       type: 'scholarship', desc: 'PM Young Achievers Scholarship for OBC/EBC/DNT students' },
    { name: 'AICTE PG Scholarship',           url: 'https://www.aicte-india.org/bureaus/pms',     type: 'scholarship', desc: 'GATE/GPAT qualified PG students scholarship' },
    { name: 'INSPIRE Scholarship (DST)',      url: 'https://online-inspire.gov.in',               type: 'scholarship', desc: 'Scholarship for Higher Education in natural sciences' },
  ],
};

// ── RSS Parser ──────────────────────────────────────────────────────────────
function extractItems(xml) {
  const re = /<item[\s>]([\s\S]*?)<\/item>/gi;
  const items = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const getTag = (tag) => {
      const r2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m2 = r2.exec(b);
      return m2 ? m2[1].replace(/\<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim() : '';
    };
    const title = getTag('title');
    const link  = getTag('link') || getTag('guid') || '';
    const pubDate = getTag('pubDate') || getTag('dc:date') || '';
    const desc  = getTag('description').substring(0, 200) || '';
    if (title && title.length > 10 && title.length < 250) {
      items.push({ title, link: link.startsWith('http') ? link : '', pubDate, desc });
    }
  }
  return items;
}

async function fetchFeed(feed) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(feed.url, {
      signal:  ctrl.signal,
      headers: { 'User-Agent': 'SfriTrav/2.0 EduBot', Accept: 'application/rss+xml,text/xml,*/*' }
    });
    clearTimeout(timer);
    if (!r.ok) return [];
    const xml   = await r.text();
    const items = extractItems(xml).slice(0, 8);
    return items.map(i => ({ ...i, src: feed.src, type: feed.type, w: feed.w }));
  } catch { clearTimeout(timer); return []; }
}

// ── Cache ───────────────────────────────────────────────────────────────────
let _cache = null, _cacheAt = 0;
const TTL = 10 * 60 * 1000; // 10 minutes

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
  if (req.method !== 'GET') return res.status(405).end();

  // Return cached
  if (_cache && Date.now() - _cacheAt < TTL) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  let all = [];
  for (const r of results) if (r.status === 'fulfilled') all.push(...r.value);

  // Deduplicate
  const seen = new Set();
  const unique = all.filter(i => {
    const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Sort by weight, take top 50
  unique.sort((a, b) => b.w - a.w);
  const news = unique.slice(0, 50);

  const result = {
    news,
    portals: PORTALS,
    fetchedAt: new Date().toISOString(),
    count: news.length
  };

  _cache = result;
  _cacheAt = Date.now();
  return res.status(200).json(result);
}
