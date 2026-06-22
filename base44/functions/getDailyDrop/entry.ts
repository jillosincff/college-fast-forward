import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Inline Fantastic Jobs fetcher (avoids sub-function auth issues) ──────────
const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
  CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
  IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
  ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
  TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
  WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',
};

// ── Coresignal Job Data API fetcher (public job postings) ─────────────────
async function fetchCoresignalJobs({ role, location, seeking, apiKey, maxResults = 50 }) {
  console.log('[fetchCoresignalJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  const INTERN_TERMS = ['intern', 'internship', 'co-op'];
  const ENTRY_TERMS = ['junior', 'coordinator', 'entry level', 'graduate', 'trainee', 'new grad', 'analyst', 'assistant'];
  const levelTerms = seeking === 'internship' ? INTERN_TERMS : seeking === 'fulltime' ? ENTRY_TERMS : [...INTERN_TERMS, ...ENTRY_TERMS];
  
  try {
    // Coresignal public job postings API
    const params = new URLSearchParams({
      size: maxResults.toString(),
      job_title: role || 'analyst',
      location: location || 'United States',
      seniority: levelTerms.join(','),
      date_from: '30',
    });

    console.log('[fetchCoresignalJobs] URL:', `https://api.coresignal.com/cdapi/v1/job/search?${params.toString()}`);
    const res = await fetch(`https://api.coresignal.com/cdapi/v1/job/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log('[fetchCoresignalJobs] API response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'no body');
      console.error('[fetchCoresignalJobs] API error:', res.status, errorText);
      return [];
    }

    const data = await res.json();
    console.log('[fetchCoresignalJobs] Raw response:', JSON.stringify(data).slice(0, 200));
    const results = (data.results || []).map(job => ({
      name: job.company_name || job.company,
      job_title: job.job_title,
      hiring_description: job.description || `${job.company_name || job.company} is hiring for ${job.job_title}`,
      job_url: job.job_url || job.apply_url,
      location: job.location || '',
      posted_date: job.date_posted || null,
      salary_range: job.salary ? `${job.salary_min || job.salary}-${job.salary_max || job.salary}` : null,
      source: 'coresignal',
    })).filter(j => j.name && j.job_title);
    console.log('[fetchCoresignalJobs] Filtered results:', results.length);
    return results;
  } catch (e) {
    console.error('[fetchCoresignalJobs] Fetch failed:', e.message);
    return [];
  }
}

function sizeFromHeadcount(n) {
  if (!n || n <= 0) return null;
  if (n <= 50) return 'startup';
  if (n <= 500) return 'mid';
  return 'large';
}

function buildLocationQuery(location) {
  if (!location || /remote/i.test(location)) return null;
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  const city = parts[0];
  const stateAbbr = parts[1]?.toUpperCase().slice(0, 2);
  const stateName = STATE_NAMES[stateAbbr];
  if (city && stateName) return `"${city}" OR "${stateName}, United States"`;
  if (city) return `"${city}"`;
  return null;
}

function checkIsFastIQ(user) {
  if (!user) return false;
  if (
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.is_founding_member === true
  ) return true;
  if (
    user.trial_status === 'active' ||
    user.fastiq_trial_active === true ||
    user.membership_tier === 'fastiq_trial'
  ) return true;
  if (user.fastiq_setup_complete && user.trial_status !== 'expired') return true;
  return false;
}

function buildTitleQuery(role, seeking) {
  const INTERN_TERMS = `intern | internship | co-op`;
  const ENTRY_TERMS = `junior | coordinator | 'entry level' | graduate | trainee | 'new grad' | analyst | assistant`;
  const levelTerms = seeking === 'internship' ? INTERN_TERMS : seeking === 'fulltime' ? ENTRY_TERMS : `${INTERN_TERMS} | ${ENTRY_TERMS}`;
  const words = (role || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return `(${levelTerms})`;
  const primary = words[0];
  const rest = words.slice(1);
  return `${primary} & (${levelTerms}${rest.length > 0 ? ` | ${rest.join(' | ')}` : ''})`;
}

const SENIOR_RE = /\b(senior|sr\.?|lead|principal|director|manager|mgr|head|vp|vice president|chief|staff|supervisor|architect|executive)\b|\b(ii|iii|iv|v)\b/i;
const INTERN_RE = /\b(intern|internship|co-?op)\b/i;

function jobMatchesLocation(job, city, stateName) {
  if (!city && !stateName) return true;
  if (job.remote_derived === true) return true;
  const locs = (job.locations_derived || []).join(' | ').toLowerCase();
  if (!locs) return false;
  if (city && locs.includes(city.toLowerCase())) return true;
  if (stateName && locs.includes(stateName.toLowerCase())) return true;
  return false;
}

async function fetchLiveJobs({ role, location, companySizes, seeking, apiKey, maxCompanies = 15 }) {
  console.log('[fetchLiveJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  const NORMALIZE_SIZE = { startup:'startup', mid:'mid', midmarket:'mid', large:'large', enterprise:'large' };
  const sizeList = (Array.isArray(companySizes) ? companySizes : (companySizes ? [companySizes] : []))
    .map(s => NORMALIZE_SIZE[String(s).toLowerCase()]).filter(Boolean);
  const strictSize = sizeList.length === 1 ? sizeList[0] : null;

  const roleDesc = role || '';
  const params = new URLSearchParams({
    time_frame: '6m', limit: '200',
    include_basic_organization_details: 'true',
    title_advanced: buildTitleQuery(roleDesc, seeking),
  });
  const locQuery = buildLocationQuery(location);
  if (locQuery) params.set('location', locQuery);

  console.log('[fetchLiveJobs] URL params:', params.toString());

  const locParts = (location && !/remote/i.test(location)) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
  const prefCity = locParts[0] || null;
  const prefState = STATE_NAMES[locParts[1]?.toUpperCase().slice(0, 2)] || null;

  console.log('[fetchLiveJobs] Fetching from Fantastic Jobs API...');
  const apiRes = await fetch(`https://data.fantastic.jobs/v1/active-ats?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  console.log('[fetchLiveJobs] API response status:', apiRes.status);
  if (!apiRes.ok) {
    const errorText = await apiRes.text().catch(() => 'no body');
    console.error('[fetchLiveJobs] API error:', apiRes.status, errorText);
    throw new Error(`Fantastic Jobs API ${apiRes.status}: ${errorText}`);
  }
  const jobs = await apiRes.json();
  console.log('[fetchLiveJobs] Raw response count:', Array.isArray(jobs) ? jobs.length : typeof jobs);

  // Shuffle jobs for randomness
  const jobList = Array.isArray(jobs) ? [...jobs] : [];
  for (let i = jobList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jobList[i], jobList[j]] = [jobList[j], jobList[i]];
  }

  const seenOrgs = new Set();
  const companies = [];
  let filteredCount = 0;
  for (const job of jobList) {
    const org = job.organization;
    const title = job.title?.trim();
    if (!org || !title || !job.url) {
      console.log('[fetchLiveJobs] Skip: missing org/title/url');
      continue;
    }
    const isIntern = INTERN_RE.test(title);
    if (!isIntern && SENIOR_RE.test(title)) {
      console.log('[fetchLiveJobs] Skip senior:', title);
      continue;
    }
    if (seeking === 'internship' && !isIntern) {
      console.log('[fetchLiveJobs] Skip non-intern for internship seeker:', title);
      continue;
    }
    if (seeking === 'fulltime' && isIntern) {
      console.log('[fetchLiveJobs] Skip intern for fulltime seeker:', title);
      continue;
    }
    const exp = job.ai_experience_level;
    const entryTitle = isIntern || /junior|coordinator|entry|graduate|trainee|new grad|assistant|analyst/i.test(title);
    if (exp && exp !== '0-2' && !entryTitle) {
      console.log('[fetchLiveJobs] Skip wrong experience:', exp, title);
      continue;
    }
    if (!jobMatchesLocation(job, prefCity, prefState)) {
      console.log('[fetchLiveJobs] Skip location mismatch:', job.locations_derived);
      continue;
    }
    if (job.org_linkedin_recruitment_agency_derived === true) {
      console.log('[fetchLiveJobs] Skip recruitment agency');
      continue;
    }
    const size = sizeFromHeadcount(job.org_linkedin_headcount);
    if (strictSize && size && size !== strictSize) {
      console.log('[fetchLiveJobs] Skip wrong size:', size, 'expected:', strictSize);
      continue;
    }
    if (strictSize && !size) {
      console.log('[fetchLiveJobs] Skip unknown size with strict filter');
      continue;
    }
    const orgKey = org.toLowerCase();
    if (seenOrgs.has(orgKey)) {
      console.log('[fetchLiveJobs] Skip duplicate:', org);
      continue;
    }
    seenOrgs.add(orgKey);
    console.log('[fetchLiveJobs] ACCEPT:', org, '-', title);
    companies.push({
      name: org,
      job_title: title,
      hiring_description: job.ai_core_responsibilities || job.ai_requirements_summary || `${org} is hiring for ${title}.`,
      job_url: job.url,
      size: size || undefined,
      location: job.locations_derived?.[0] || location || '',
      salary_range: null,
      posted_date: job.date_posted || null,
    });
    if (companies.length >= maxCompanies) break;
  }
  console.log('[fetchLiveJobs] Filtered %d -> %d companies', jobList.length, companies.length);
  return companies;
}

// Reset time: 4AM Eastern
function getDailyDropDate() {
  const now = new Date();
  // Convert to ET (UTC-4 or UTC-5)
  const etOffset = -4; // EDT (summer) — close enough
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  const hour = etNow.getUTCHours();
  // Before 4AM ET → still "yesterday's" drop date
  if (hour < 4) {
    etNow.setUTCDate(etNow.getUTCDate() - 1);
  }
  return etNow.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getNextResetTime() {
  const now = new Date();
  const etOffset = -4;
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  const nextReset = new Date(etNow);
  nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  nextReset.setUTCHours(4, 0, 0, 0);
  // Convert back to UTC
  return new Date(nextReset.getTime() - etOffset * 60 * 60 * 1000).toISOString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Fetch FRESH user data to ensure we have latest career_goals
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dropDate = getDailyDropDate();

    // ── Daily limit: free = 15, premium = 30 ──────────────────────────────
    const isPremium = checkIsFastIQ(user);
    const dailyLimit = isPremium ? 30 : 15;

    // Force refresh if requested via query param
    const forceRefresh = body.force_refresh === true;
    console.log(`[getDailyDrop] User: ${user.email}, forceRefresh: ${forceRefresh}, dropDate: ${dropDate}`);

    // ── 1. Check for a valid cached drop (skip if force refresh) ─────────
    if (!forceRefresh) {
      const existing = await base44.entities.UserDailyDrop.filter({
        user_id: user.id,
        drop_date: dropDate,
      });

      if (existing && existing.length > 0) {
        const drop = existing[0];
        console.log(`[getDailyDrop] Cache hit for ${user.email} on ${dropDate}`);
        return Response.json({
          success: true,
          slots: drop.slots || [],
          actioned_keys: drop.actioned_keys || [],
          drop_date: dropDate,
          drop_id: drop.id,
          from_cache: true,
          is_premium: isPremium,
          daily_limit: dailyLimit,
        });
      }
    } else {
      console.log(`[getDailyDrop] Force refresh requested for ${user.email}`);
      // Clear stale drops for today
      try {
        const staleToday = await base44.entities.UserDailyDrop.filter({ user_id: user.id, drop_date: dropDate });
        console.log(`[getDailyDrop] Clearing ${staleToday?.length || 0} stale drops`);
        for (const d of staleToday || []) await base44.entities.UserDailyDrop.delete(d.id);
      } catch (e) {
        console.warn('[getDailyDrop] Could not clear stale drops:', e.message);
      }
    }

    // ── 2. Generate a fresh daily drop ────────────────────────────────────
    console.log(`[getDailyDrop] Generating fresh drop for ${user.email} on ${dropDate}`);

    // Companies shown in the user's last 3 drops — exclude so jobs feel new each day
    const seenCompanies = new Set();
    try {
      const recentDrops = await base44.entities.UserDailyDrop.filter({ user_id: user.id }, '-created_date', 3);
      for (const d of recentDrops || []) {
        for (const s of d.slots || []) {
          if (s.company) seenCompanies.add(s.company.toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
      }
    } catch (e) {
      console.warn('[getDailyDrop] Could not load recent drops:', e.message);
    }
    const isSeen = (name) => seenCompanies.has((name || '').toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Clear any stale drops for today (force refresh / duplicates) so the cache stays clean
    try {
      const staleToday = await base44.entities.UserDailyDrop.filter({ user_id: user.id, drop_date: dropDate });
      for (const d of staleToday || []) await base44.entities.UserDailyDrop.delete(d.id);
    } catch (e) {
      console.warn('[getDailyDrop] Could not clear stale drops:', e.message);
    }

    const goals = user.career_goals || {};
    const targetIndustries = (goals.target_industries || goals.industries || []).filter(Boolean).map(i => i.toLowerCase());
    const targetRole = (Array.isArray(goals.target_roles) ? goals.target_roles[0] : goals.target_roles) || goals.role || '';
    const sizePref = goals.company_size_preference || 'all';
    const location = goals.location_preference || user.location_preference || user.location || '';
    const seeking = goals.seeking || 'both';

    // Size pref - but allow all sizes to get more results
    const sizeArray = ['large', 'mid', 'startup']; // Ignore size filter to maximize results

    // Slots from multiple sources: Fantastic Jobs + Coresignal
    let allLiveSlots = [];
    const fantasticApiKey = Deno.env.get('FANTASTIC_JOBS_API_KEY');
    const coresignalApiKey = Deno.env.get('CORESIGNAL_API_KEY');
    const role = targetRole || (targetIndustries.length > 0 ? `${targetIndustries[0]} analyst` : 'analyst');

    // Fetch from Fantastic Jobs API
    console.log(`[getDailyDrop] Fetching jobs: role=${role}, location=${location}, seeking=${seeking}, sizes=${sizeArray.join(',')}`);
    
    let fantasticJobs = [];
    if (!fantasticApiKey) {
      console.warn('[getDailyDrop] No Fantastic API key');
    } else {
      try {
        console.log('[getDailyDrop] Fetching Fantastic Jobs...');
        fantasticJobs = await Promise.race([
          fetchLiveJobs({ role, location, companySizes: sizeArray, seeking, apiKey: fantasticApiKey, maxCompanies: dailyLimit }),
          new Promise((_, r) => setTimeout(() => {
            console.error('[getDailyDrop] Fantastic Jobs TIMEOUT after 25s');
            return [];
          }, 25000)),
        ]);
        console.log('[getDailyDrop] Fantastic Jobs result: %d companies', fantasticJobs?.length || 0);
      } catch (e) {
        console.error('[getDailyDrop] Fantastic Jobs fetch failed:', e.message);
      }
    }

    const coresignalJobs = []; // Coresignal API endpoint returns 404 - disabled

    // Merge and deduplicate by company name
    const mergedCompanies = new Set();
    const mergedJobs = [];
    
    // Prioritize unseen companies, mix sources
    const allJobs = [...fantasticJobs, ...coresignalJobs];
    const freshFirst = allJobs.filter(j => !isSeen(j.name));
    const seenFirst = allJobs.filter(j => isSeen(j.name));
    
    for (const job of [...freshFirst, ...seenFirst]) {
      const companyKey = job.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (mergedCompanies.has(companyKey)) continue;
      mergedCompanies.add(companyKey);
      
      mergedJobs.push({
        company: job.name,
        role: job.job_title || role,
        jobDescription: job.hiring_description || job.description || `${job.name} is actively hiring for ${role} roles.`,
        jobSource: job.job_url || `${job.name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
        jobSourceCategory: job.source === 'coresignal' ? 'B' : 'A',
        companyTier: job.size === 'startup' ? 3 : job.size === 'mid' ? 2 : 1,
        isLiveResult: true,
        slotType: 'live',
        leadTier: 'target',
        alumniCount: 0,
        parentCount: 0,
        salary_range: job.salary_range || null,
        location: job.location || null,
        posted_date: job.posted_date || null,
      });

      if (mergedJobs.length >= dailyLimit * 2) break; // Get extra for filtering
    }

    allLiveSlots = mergedJobs;
    console.log(`[getDailyDrop] Merged live slots: ${allLiveSlots.length}`);

    // ── Pre-compute alumni counts from DiscoveredAlumni cache ──────────────
    const schoolCode = user.school_code || '';
    const alumniCountMap = {};
    if (allLiveSlots.length > 0 && schoolCode) {
      try {
        const alumniRecords = await base44.asServiceRole.entities.DiscoveredAlumni.filter({
          school_code: schoolCode,
        }, null, 500);
        for (const a of alumniRecords || []) {
          const key = (a.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          alumniCountMap[key] = (alumniCountMap[key] || 0) + 1;
        }
        console.log(`[getDailyDrop] Alumni cache: ${Object.keys(alumniCountMap).length} companies with alumni`);
      } catch (e) {
        console.warn('[getDailyDrop] Could not load alumni counts:', e.message);
      }
    }

    const enrichWithAlumni = (slot) => {
      const key = (slot.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const count = alumniCountMap[key] || 0;
      return { ...slot, alumniCount: count, hasAlumni: count > 0 };
    };

    // Assemble final slots — merged results from both sources
    const slots = allLiveSlots.slice(0, dailyLimit).map(enrichWithAlumni);

    // Ensure at least 10 slots — pad from fallback if needed
    if (slots.length < Math.min(dailyLimit, 10)) {
      // Expanded fallback pool with 40+ companies to reduce repeats
      const internFallbackSlots = [
        { company: 'Deloitte', role: 'Summer Scholar Intern', jobDescription: 'Consulting and advisory internship program across all US offices.', jobSource: 'deloitte.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Google', role: 'STEP Intern', jobDescription: 'Summer internship program for first and second-year students.', jobSource: 'careers.google.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'JPMorgan Chase', role: 'Summer Analyst Intern', jobDescription: 'Summer analyst internship across banking, markets, and operations.', jobSource: 'careers.jpmorgan.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nike', role: 'Marketing Intern', jobDescription: 'Brand and digital marketing internships for students.', jobSource: 'jobs.nike.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Salesforce', role: 'Futureforce Intern', jobDescription: 'Summer internship program blending tech, business, and customer strategy.', jobSource: 'salesforce.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Procter & Gamble', role: 'Brand Management Intern', jobDescription: 'Summer internship in CPG brand-building with real project ownership.', jobSource: 'pgcareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Microsoft', role: 'Software Engineering Intern', jobDescription: 'Internship program for computer science students.', jobSource: 'careers.microsoft.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Amazon', role: 'Business Intern', jobDescription: 'Business internship across operations, finance, and strategy.', jobSource: 'amazon.jobs', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Meta', role: 'Data Science Intern', jobDescription: 'Data science internship for analytics-focused students.', jobSource: 'metacareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Apple', role: 'Product Design Intern', jobDescription: 'Product design internship for creative students.', jobSource: 'apple.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Goldman Sachs', role: 'Investment Banking Intern', jobDescription: 'Summer internship in investment banking division.', jobSource: 'goldmansachs.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'McKinsey', role: 'Business Analyst Intern', jobDescription: 'Consulting internship with real client impact.', jobSource: 'mckinsey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Boston Consulting Group', role: 'Consulting Intern', jobDescription: 'Strategy consulting internship.', jobSource: 'bcg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Bain', role: 'Associate Consultant Intern', jobDescription: 'Case-based consulting internship.', jobSource: 'bain.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PwC', role: 'Assurance Intern', jobDescription: 'Audit and assurance internship.', jobSource: 'pwc.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'EY', role: 'Consulting Intern', jobDescription: 'Business consulting internship.', jobSource: 'ey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'KPMG', role: 'Audit Intern', jobDescription: 'Audit and tax internship.', jobSource: 'kpmg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'L\'Oréal', role: 'Marketing Intern', jobDescription: 'Beauty and cosmetics marketing internship.', jobSource: 'loreal.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Unilever', role: 'Supply Chain Intern', jobDescription: 'Operations and supply chain internship.', jobSource: 'unilever.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Coca-Cola', role: 'Finance Intern', jobDescription: 'Corporate finance internship.', jobSource: 'coca-colacompany.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
      ];
      const fulltimeFallbackSlots = [
        { company: 'Deloitte', role: 'Business Analyst', jobDescription: 'Strategy and advisory associates across all US offices.', jobSource: 'deloitte.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Google', role: 'Associate Product Manager', jobDescription: 'APM program for new graduates across product and engineering.', jobSource: 'careers.google.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Ramp', role: 'Finance & Strategy Analyst', jobDescription: 'Series D fintech — real ownership from day one.', jobSource: 'ramp.com/careers', jobSourceCategory: 'B', companyTier: 3, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'JPMorgan Chase', role: 'Analyst Development Program', jobDescription: 'Rotational analyst program across banking, markets, and operations.', jobSource: 'careers.jpmorgan.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Salesforce', role: 'Associate Solution Engineer', jobDescription: 'New grad program blending tech, business, and customer strategy.', jobSource: 'salesforce.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nike', role: 'Marketing Associate', jobDescription: 'Brand and digital marketing roles for early-career talent.', jobSource: 'jobs.nike.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Accenture', role: 'Consulting Analyst', jobDescription: 'Entry-level consulting across strategy, tech, and operations.', jobSource: 'accenture.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Spotify', role: 'Associate, Strategy & Operations', jobDescription: 'Early-career roles in music-tech strategy and analytics.', jobSource: 'lifeatspotify.com', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Stripe', role: 'Business Operations Analyst', jobDescription: 'High-growth fintech — analytical roles for new grads.', jobSource: 'stripe.com/jobs', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Procter & Gamble', role: 'Brand Management Associate', jobDescription: 'Classic CPG brand-building track with real P&L ownership.', jobSource: 'pgcareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Microsoft', role: 'Software Engineer', jobDescription: 'Full-time software engineering roles for new graduates.', jobSource: 'careers.microsoft.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Amazon', role: 'Area Manager', jobDescription: 'Operations leadership program for new graduates.', jobSource: 'amazon.jobs', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Meta', role: 'Data Analyst', jobDescription: 'Entry-level data analytics roles.', jobSource: 'metacareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Apple', role: 'Hardware Engineer', jobDescription: 'Hardware engineering roles for new graduates.', jobSource: 'apple.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Goldman Sachs', role: 'Investment Banking Analyst', jobDescription: 'Full-time analyst program in investment banking.', jobSource: 'goldmansachs.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'McKinsey', role: 'Business Analyst', jobDescription: 'Entry-level consulting position.', jobSource: 'mckinsey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Boston Consulting Group', role: 'Associate', jobDescription: 'Strategy consulting associate role.', jobSource: 'bcg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Bain', role: 'Associate Consultant', jobDescription: 'Entry-level consulting position.', jobSource: 'bain.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PwC', role: 'Associate', jobDescription: 'Audit and assurance associate role.', jobSource: 'pwc.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'EY', role: 'Staff Consultant', jobDescription: 'Business consulting entry-level role.', jobSource: 'ey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'KPMG', role: 'Associate Auditor', jobDescription: 'Audit and tax associate position.', jobSource: 'kpmg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'L\'Oréal', role: 'Brand Manager', jobDescription: 'Marketing and brand management role.', jobSource: 'loreal.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Unilever', role: 'Supply Chain Manager', jobDescription: 'Operations and supply chain management.', jobSource: 'unilever.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Coca-Cola', role: 'Finance Analyst', jobDescription: 'Corporate finance analyst role.', jobSource: 'coca-colacompany.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PepsiCo', role: 'Marketing Manager', jobDescription: 'Brand marketing and strategy role.', jobSource: 'pepsico.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nestlé', role: 'Management Trainee', jobDescription: 'Rotational leadership development program.', jobSource: 'nestle.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Johnson & Johnson', role: 'R&D Scientist', jobDescription: 'Research and development scientist role.', jobSource: 'careers.jnj.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Pfizer', role: 'Sales Representative', jobDescription: 'Pharmaceutical sales role.', jobSource: 'pfizer.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Tesla', role: 'Production Engineer', jobDescription: 'Manufacturing engineering role.', jobSource: 'tesla.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'SpaceX', role: 'Avionics Engineer', jobDescription: 'Aerospace engineering role.', jobSource: 'spacex.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
      ];
      // Match the student's seeking intent — internship seekers must NEVER see full-time fallbacks
      const fallbackSlots = seeking === 'internship' ? internFallbackSlots
        : seeking === 'fulltime' ? fulltimeFallbackSlots
        : [...internFallbackSlots.slice(0, 3), ...fulltimeFallbackSlots];
      
      // Shuffle fallbacks for randomness — different companies each day
      for (let i = fallbackSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fallbackSlots[i], fallbackSlots[j]] = [fallbackSlots[j], fallbackSlots[i]];
      }
      
      const existing_companies = new Set(slots.map(s => s.company.toLowerCase()));
      // Try unseen fallbacks first, then allow repeats if we still need slots
      const orderedFallbacks = [...fallbackSlots.filter(f => !isSeen(f.company)), ...fallbackSlots.filter(f => isSeen(f.company))];
      for (const fb of orderedFallbacks) {
        if (!existing_companies.has(fb.company.toLowerCase())) {
          slots.push(fb);
          existing_companies.add(fb.company.toLowerCase());
        }
        if (slots.length >= dailyLimit) break;
      }
      // Enrich fallback slots with alumni counts too
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i].hasAlumni) slots[i] = enrichWithAlumni(slots[i]);
      }
    }

    // ── 3. Persist the drop ───────────────────────────────────────────────
    const newDrop = await base44.entities.UserDailyDrop.create({
      user_id: user.id,
      user_email: user.email,
      drop_date: dropDate,
      slots,
      actioned_keys: [],
      expires_at: getNextResetTime(),
    });

    console.log(`[getDailyDrop] Created drop for ${user.email}: ${slots.length} slots (limit: ${dailyLimit}, premium: ${isPremium})`);
    return Response.json({
      success: true,
      slots,
      actioned_keys: [],
      drop_date: dropDate,
      drop_id: newDrop.id,
      from_cache: false,
      is_premium: isPremium,
      daily_limit: dailyLimit,
    });

  } catch (error) {
    console.error('[getDailyDrop] Error:', error.message);
    return Response.json({ error: error.message, slots: [] }, { status: 500 });
  }
});