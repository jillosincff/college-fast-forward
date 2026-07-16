import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Inline Fantastic Jobs fetcher (avoids sub-function auth issues) ──────────
// TEST MODE: Set to true to bypass APIs and test fallback pool variety
const TEST_FALLBACK_ONLY = false;

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

// ── BuiltIn job scraper (BACKUP live source — no API key needed) ──────────
// BuiltIn serves full HTML with no Cloudflare challenge, and embeds the job list
// as JSON-LD ItemList ({name, url, description} per posting). We hit the relevant
// entry-level category page and parse that block — clean structured data, no
// fragile HTML scraping. Great for startup/tech roles when paid providers throttle.
const BUILTIN_CATEGORY = {
  marketing: 'marketing',
  sales: 'sales',
  finance: 'finance',
  data: 'data-analytics',
  analytics: 'data-analytics',
  design: 'design-ux',
  product: 'product',
  operations: 'operations',
  hr: 'hr-recruiting',
  engineering: 'dev-engineering',
  software: 'dev-engineering',
  developer: 'dev-engineering',
  project: 'project-mgmt',
};

// Map a free-text role to a BuiltIn job category slug (defaults to a broad search)
function builtInCategoryForRole(role) {
  const r = (role || '').toLowerCase();
  for (const [kw, slug] of Object.entries(BUILTIN_CATEGORY)) {
    if (r.includes(kw)) return slug;
  }
  return null;
}

async function fetchBuiltInJobs({ role, location, seeking, maxResults = 20 }) {
  console.log('[fetchBuiltInJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  try {
    // BuiltIn has clean entry-level category URLs. Interns use the /internships path.
    const category = builtInCategoryForRole(role);
    const level = seeking === 'internship' ? 'internships' : 'entry-level';
    const path = category ? `${level}/${category}` : level;
    const url = `https://builtin.com/jobs/${path}`;
    console.log('[fetchBuiltInJobs] URL:', url);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let html;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' },
        signal: controller.signal,
      });
      if (!res.ok) {
        console.error('[fetchBuiltInJobs] HTTP', res.status);
        return [];
      }
      html = await res.text();
    } finally {
      clearTimeout(timer);
    }

    // BuiltIn HTML-encodes the '+' in the script type attribute (ld&#x2B;json),
    // so normalize the tags before matching or the regex finds nothing.
    html = html.replace(/application\/ld&#x2B;json/g, 'application/ld+json');

    // Pull the JSON-LD blocks and find the ItemList of job postings.
    const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    let items = [];
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].replace(/&#x2B;/g, '+'));
        const graph = parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
        const list = graph.find(g => g['@type'] === 'ItemList');
        if (list?.itemListElement?.length) {
          items = list.itemListElement;
          break;
        }
      } catch { /* skip malformed block */ }
    }
    console.log('[fetchBuiltInJobs] Parsed %d ItemList entries', items.length);

    // On BuiltIn's /internships/* pages every listing is already an internship, so
    // skip the title-keyword intern filter there (titles often omit the word "intern").
    const onInternPage = level === 'internships';

    const results = [];
    for (const it of items) {
      const title = (it.name || '').trim();
      const jobUrl = it.url;
      if (!title || !jobUrl) continue;
      if (SENIOR_RE.test(title)) continue;
      if (!onInternPage) {
        const isIntern = INTERN_RE.test(title);
        if (seeking === 'internship' && !isIntern) continue;
        if (seeking === 'fulltime' && isIntern) continue;
      }

      // BuiltIn's ItemList carries title + description + url, but NOT the company
      // name (the URL slug is the job title, not the employer). Rather than show a
      // wrong company, label the employer as "Via BuiltIn" — the role + description
      // are accurate and that's what the feed leads with.
      results.push({
        name: 'Via BuiltIn',
        job_title: title,
        hiring_description: (it.description || `${title} — sourced from BuiltIn.`).slice(0, 600),
        job_url: jobUrl,
        location: location || '',
        posted_date: null,
        salary_range: null,
        source: 'builtin',
      });
      if (results.length >= maxResults) break;
    }

    console.log('[fetchBuiltInJobs] usable results:', results.length);
    return results;
  } catch (e) {
    console.error('[fetchBuiltInJobs] failed:', e.message);
    return [];
  }
}

// ── Coresignal Base Jobs API fetcher (BACKUP live source) ─────────────────
// Real 2-step flow: POST /search/filter → array of job IDs, then
// GET /collect/{id} for each (capped, in parallel). Used when the primary
// (OpenWeb Ninja) is throttled/timing out, so students still get LIVE jobs
// instead of curated filler.
async function fetchCoresignalJobs({ role, location, seeking, apiKey, maxResults = 20 }) {
  console.log('[fetchCoresignalJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  const BASE = 'https://api.coresignal.com/cdapi/v2/job_base';
  const headers = { 'apikey': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' };

  try {
    // ── Step 1: search for matching job IDs ──
    const levelTerms = seeking === 'internship'
      ? '(intern) OR (internship)'
      : seeking === 'fulltime'
        ? '(junior) OR (entry level) OR (graduate) OR (associate) OR (coordinator)'
        : '(intern) OR (junior) OR (entry level) OR (graduate) OR (associate)';
    const baseRole = (role || 'analyst').trim();
    const titleFilter = `(${baseRole}) AND (${levelTerms})`;

    // Last 30 days only, active postings, US.
    const createdGte = new Date(Date.now() - 30 * 86400000)
      .toISOString().replace('T', ' ').slice(0, 19);
    const filterBody = {
      title: titleFilter,
      country: 'United States',
      application_active: true,
      created_at_gte: createdGte,
    };
    if (location && !/remote/i.test(location)) filterBody.location = location.split(',')[0].trim();

    const searchRes = await fetch(`${BASE}/search/filter`, {
      method: 'POST', headers, body: JSON.stringify(filterBody),
    });
    console.log('[fetchCoresignalJobs] search status:', searchRes.status);
    if (!searchRes.ok) {
      console.error('[fetchCoresignalJobs] search error:', searchRes.status, (await searchRes.text().catch(() => '')).slice(0, 200));
      return [];
    }
    const ids = await searchRes.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      console.log('[fetchCoresignalJobs] no matching IDs');
      return [];
    }

    // ── Step 2: collect full records for the first N IDs (parallel) ──
    const pickIds = ids.slice(0, maxResults);
    console.log('[fetchCoresignalJobs] collecting %d of %d IDs', pickIds.length, ids.length);
    const records = await Promise.all(pickIds.map(async (id) => {
      try {
        const r = await fetch(`${BASE}/collect/${id}`, { headers });
        if (!r.ok) return null;
        return await r.json();
      } catch { return null; }
    }));

    const results = records
      .filter(Boolean)
      .map(job => {
        const company = job.company_name || job.company;
        const title = job.title;
        const url = job.url || job.external_url || job.application_url;
        if (!company || !title || !url) return null;
        if (SENIOR_RE.test(title)) return null;
        const isIntern = INTERN_RE.test(title);
        if (seeking === 'internship' && !isIntern) return null;
        if (seeking === 'fulltime' && isIntern) return null;
        return {
          name: company,
          job_title: title,
          hiring_description: (job.description || `${company} is hiring for ${title}`).slice(0, 600),
          job_url: url,
          location: job.location || location || '',
          posted_date: job.created || job.last_updated || null,
          salary_range: null,
          source: 'coresignal',
        };
      })
      .filter(Boolean);

    console.log('[fetchCoresignalJobs] usable results:', results.length);
    return results;
  } catch (e) {
    console.error('[fetchCoresignalJobs] failed:', e.message);
    return [];
  }
}

// ── OpenWeb Ninja (Real-Time Jobs / JSearch) fetcher — PRIMARY live source ──
// Maps to the same normalized shape ({ name, job_title, hiring_description, ... })
// the downstream merge step consumes, so slotType:"live" rendering stays intact.
async function fetchOpenWebNinjaJobs({ role, location, seeking, apiKey, maxResults = 50 }) {
  console.log('[fetchOpenWebNinjaJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  try {
    // Build an entry-level-targeted query string.
    const levelTerms =
      seeking === 'internship' ? 'intern'
      : seeking === 'fulltime' ? 'entry level'
      : 'entry level OR intern';
    const baseRole = (role || 'analyst').trim();
    const locPart = (location && !/remote/i.test(location)) ? ` in ${location}` : '';
    const query = `${baseRole} ${levelTerms}${locPart}`.trim();

    const params = new URLSearchParams({
      query,
      num_pages: '2',
      date_posted: 'month',
      country: 'us',
    });
    if (seeking === 'internship') params.set('employment_types', 'INTERN');
    else if (seeking === 'fulltime') params.set('employment_types', 'FULLTIME');

    const url = `https://api.openwebninja.com/jsearch/search-v2?${params.toString()}`;
    console.log('[fetchOpenWebNinjaJobs] URL:', url);

    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
    });
    console.log('[fetchOpenWebNinjaJobs] API status:', res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'no body');
      console.error('[fetchOpenWebNinjaJobs] API error:', res.status, errorText.slice(0, 200));
      return [];
    }

    const data = await res.json();
    // search-v2 returns { data: { jobs: [...] } }; older /search returns { data: [...] }
    const list = Array.isArray(data.data) ? data.data : (data.data?.jobs || data.jobs || []);
    console.log('[fetchOpenWebNinjaJobs] Raw count:', Array.isArray(list) ? list.length : 0);

    const preFilter = (Array.isArray(list) ? list : [])
      .filter(job => {
        const title = (job.job_title || '').trim();
        const org = job.employer_name || job.company_name;
        if (!org || !title) return false;
        // Skip senior roles
        if (SENIOR_RE.test(title)) return false;
        // QUALITY FILTER: drop low-signal staffing/aggregator publishers & employers
        if (isLowSignalLiveJob(job)) return false;
        // Match internship/fulltime intent
        const isIntern = INTERN_RE.test(title) || /intern/i.test(job.job_employment_type || '');
        if (seeking === 'internship' && !isIntern) return false;
        if (seeking === 'fulltime' && isIntern) return false;
        return true;
      });

    // Sort highest-quality (direct-employer / direct-apply) listings to the TOP
    // BEFORE the slice, so the first jobs a free-tier student sees feel premium.
    preFilter.sort((a, b) => liveJobQualityScore(b) - liveJobQualityScore(a));
    console.log('[fetchOpenWebNinjaJobs] After quality filter: %d jobs (sorted by direct-employer signal)', preFilter.length);

    const filtered = preFilter
      .slice(0, maxResults)
      .map(job => {
        const city = job.job_city || '';
        const state = job.job_state || '';
        const loc = [city, state].filter(Boolean).join(', ') || (job.job_is_remote ? 'Remote' : (location || ''));
        const salary = (job.job_min_salary && job.job_max_salary)
          ? `$${Math.round(job.job_min_salary / 1000)}K-$${Math.round(job.job_max_salary / 1000)}K`
          : null;
        return {
          name: job.employer_name || job.company_name,
          job_title: job.job_title,
          hiring_description: (job.job_description || `${job.employer_name || job.company_name} is hiring for ${job.job_title}`).slice(0, 600),
          job_url: job.job_apply_link || job.job_google_link || null,
          location: loc,
          posted_date: job.job_posted_at_datetime_utc || null,
          salary_range: salary,
          source: 'openwebninja',
        };
      })
      .filter(j => j.name && j.job_title && j.job_url);

    console.log('[fetchOpenWebNinjaJobs] Filtered to %d jobs', filtered.length);
    return filtered;
  } catch (e) {
    console.error('[fetchOpenWebNinjaJobs] Error:', e.message);
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

// ── Quality filter for live (OpenWeb Ninja) results ──────────────────────────
// First impression matters: a generic staffing/aggregator post at the top of a
// new student's feed reads as "cheap Indeed scraper" and kills trust. We blacklist
// low-signal publishers/employers and sort direct-employer listings to the top.
const LOW_SIGNAL_RE = /\b(staffing|recruiting|recruitment|recruiter|talent\s*(acquisition|solutions|group)|consulting\s*group|placement|headhunt|temp(orary)?\s*agency|workforce|employment\s*agency|hire|hiring\s*(agency|partners)|jobot|aerotek|robert\s*half|adecco|randstad|kelly\s*services|manpower|insight\s*global|teksystems|cybercoders|apex\s*systems|beacon\s*hill|lhh|gpac|actalent|motion\s*recruitment|ledgent|addison\s*group|the\s*judge\s*group|lega\s*nova|ff\s*inc)\b/i;

function isLowSignalLiveJob(job) {
  const publisher = job.job_publisher || '';
  const employer = job.employer_name || job.company_name || '';
  if (LOW_SIGNAL_RE.test(publisher) || LOW_SIGNAL_RE.test(employer)) return true;
  return false;
}

// Direct-employer listings (employer site / direct-apply) get priority. Aggregator
// publishers (LinkedIn, Indeed, ZipRecruiter, etc.) score lower even when allowed.
const AGGREGATOR_PUBLISHER_RE = /\b(linkedin|indeed|ziprecruiter|glassdoor|monster|simplyhired|learn4good|jobleads|whatjobs|adzuna|talent\.com|builtin|usnlx|nlx|google\s*jobs)\b/i;

function liveJobQualityScore(job) {
  let score = 0;
  // Strongest signal: the API marks this as a direct-apply listing.
  if (job.job_apply_is_direct === true) score += 3;
  // Publisher is the employer itself (e.g. "Nike Careers") rather than an aggregator.
  const publisher = job.job_publisher || '';
  if (publisher && !AGGREGATOR_PUBLISHER_RE.test(publisher)) score += 2;
  // Has a real logo + employer website → looks like an established brand.
  if (job.employer_logo) score += 1;
  if (job.employer_website) score += 1;
  return score;
}

function jobMatchesLocation(job, city, stateName) {
  if (!city && !stateName) return true;
  if (job.remote_derived === true) return true;
  const locs = (job.locations_derived || []).join(' | ').toLowerCase();
  if (!locs) return false;
  if (city && locs.includes(city.toLowerCase())) return true;
  if (stateName && locs.includes(stateName.toLowerCase())) return true;
  return false;
}

// ── Fantastic Jobs with MODIFIED + FRESH endpoints (hourly refresh) ──────────
async function fetchFreshJobs({ role, location, seeking, apiKey, maxResults = 50 }) {
  console.log('[fetchFreshJobs] START - role:', role, 'location:', location, 'seeking:', seeking);
  
  try {
    // BROADENED: Use 7-day window instead of 24h, then filter client-side for freshness
    // Also broaden role query to get more results
    const params = new URLSearchParams({
      time_frame: '7d',  // 7 days for more variety
      limit: '200',  // Get more results to filter from
      include_basic_organization_details: 'true',
      title_advanced: buildTitleQuery(role, seeking),
    });
    
    // BROADENED: Make location optional - if no results, retry without location filter
    const locQuery = buildLocationQuery(location);
    if (locQuery) params.set('location', locQuery);
    
    const url = `https://data.fantastic.jobs/v1/active-ats?${params.toString()}`;
    console.log('[fetchFreshJobs] URL:', url);
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    console.log('[fetchFreshJobs] API status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'no body');
      console.error('[fetchFreshJobs] API error:', res.status, errorText);
      return [];
    }
    
    const jobs = await res.json();
    console.log('[fetchFreshJobs] Raw count:', Array.isArray(jobs) ? jobs.length : 0);
    
    // Filter and normalize - CLIENT-SIDE filtering for better control
    const locParts = (location && !/remote/i.test(location)) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
    const prefCity = locParts[0] || null;
    const prefState = STATE_NAMES[locParts[1]?.toUpperCase().slice(0, 2)] || null;
    
    const filtered = (Array.isArray(jobs) ? jobs : [])
      .filter(job => {
        const title = job.title?.trim();
        const org = job.organization;
        if (!org || !title || !job.url) return false;
        // Skip senior
        if (SENIOR_RE.test(title)) return false;
        // Skip agency
        if (job.org_linkedin_recruitment_agency_derived === true) return false;
        // Match internship/fulltime
        const isIntern = INTERN_RE.test(title);
        if (seeking === 'internship' && !isIntern) return false;
        if (seeking === 'fulltime' && isIntern) return false;
        // Check location (more lenient - allow remote)
        if (!jobMatchesLocation(job, prefCity, prefState)) return false;
        return true;
      })
      .slice(0, maxResults)
      .map(job => ({
        name: job.organization,
        job_title: job.title,
        hiring_description: job.ai_core_responsibilities || job.ai_requirements_summary || `${job.organization} is hiring for ${job.title}`,
        job_url: job.url,
        location: job.locations_derived?.[0] || location || '',
        posted_date: job.date_posted || null,
        salary_range: null,
        source: 'fantastic',
      }));
    
    console.log('[fetchFreshJobs] Filtered to %d jobs', filtered.length);
    return filtered;
  } catch (e) {
    console.error('[fetchFreshJobs] Error:', e.message);
    return [];
  }
}

// ── Fantastic Jobs MODIFIED endpoint (for updated/reposted jobs) ──────────
async function fetchModifiedJobs({ role, location, seeking, apiKey, maxResults = 30 }) {
  console.log('[fetchModifiedJobs] START - role:', role, 'location:', location);
  
  try {
    // Modified jobs endpoint - captures jobs that were updated/reposted
    const params = new URLSearchParams({
      limit: '100',
      include_basic_organization_details: 'true',
      title_advanced: buildTitleQuery(role, seeking),
    });
    
    const locQuery = buildLocationQuery(location);
    if (locQuery) params.set('location', locQuery);
    
    const url = `https://data.fantastic.jobs/v1/modified-ats?${params.toString()}`;
    console.log('[fetchModifiedJobs] URL:', url);
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (!res.ok) {
      console.warn('[fetchModifiedJobs] API returned', res.status, '- skipping modified jobs');
      return [];
    }
    
    const jobs = await res.json();
    console.log('[fetchModifiedJobs] Raw count:', Array.isArray(jobs) ? jobs.length : 0);
    
    // Same filtering logic as fresh jobs
    const locParts = (location && !/remote/i.test(location)) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
    const prefCity = locParts[0] || null;
    const prefState = STATE_NAMES[locParts[1]?.toUpperCase().slice(0, 2)] || null;
    
    const filtered = (Array.isArray(jobs) ? jobs : [])
      .filter(job => {
        const title = job.title?.trim();
        const org = job.organization;
        if (!org || !title || !job.url) return false;
        if (SENIOR_RE.test(title)) return false;
        if (job.org_linkedin_recruitment_agency_derived === true) return false;
        const isIntern = INTERN_RE.test(title);
        if (seeking === 'internship' && !isIntern) return false;
        if (seeking === 'fulltime' && isIntern) return false;
        if (!jobMatchesLocation(job, prefCity, prefState)) return false;
        return true;
      })
      .slice(0, maxResults)
      .map(job => ({
        name: job.organization,
        job_title: job.title,
        hiring_description: job.ai_core_responsibilities || job.ai_requirements_summary || `${job.organization} is hiring for ${job.title}`,
        job_url: job.url,
        location: job.locations_derived?.[0] || location || '',
        posted_date: job.date_posted || null,
        salary_range: null,
        source: 'fantastic_modified',
      }));
    
    console.log('[fetchModifiedJobs] Filtered to %d jobs', filtered.length);
    return filtered;
  } catch (e) {
    console.error('[fetchModifiedJobs] Error:', e.message);
    return [];
  }
}

// ── Fantastic Jobs BACKFILL endpoint (6-month historical for variety seeding) ──────────
async function fetchBackfillJobs({ role, location, seeking, apiKey, maxResults = 50 }) {
  console.log('[fetchBackfillJobs] START - seeding variety from 6-month backfill');
  
  try {
    // Backfill endpoint - 6 months of historical data for initial seeding
    const params = new URLSearchParams({
      limit: '200',
      include_basic_organization_details: 'true',
      title_advanced: buildTitleQuery(role, seeking),
      // No time_frame = uses full 6-month backfill
    });
    
    const locQuery = buildLocationQuery(location);
    if (locQuery) params.set('location', locQuery);
    
    const url = `https://data.fantastic.jobs/v1/active-ats?${params.toString()}`;
    console.log('[fetchBackfillJobs] URL:', url);
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (!res.ok) {
      console.warn('[fetchBackfillJobs] API returned', res.status);
      return [];
    }
    
    const jobs = await res.json();
    console.log('[fetchBackfillJobs] Raw count:', Array.isArray(jobs) ? jobs.length : 0);
    
    // Filter for relatively recent (last 30 days) but not in daily drop
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const locParts = (location && !/remote/i.test(location)) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
    const prefCity = locParts[0] || null;
    const prefState = STATE_NAMES[locParts[1]?.toUpperCase().slice(0, 2)] || null;
    
    const filtered = (Array.isArray(jobs) ? jobs : [])
      .filter(job => {
        const title = job.title?.trim();
        const org = job.organization;
        if (!org || !title || !job.url) return false;
        if (SENIOR_RE.test(title)) return false;
        if (job.org_linkedin_recruitment_agency_derived === true) return false;
        const isIntern = INTERN_RE.test(title);
        if (seeking === 'internship' && !isIntern) return false;
        if (seeking === 'fulltime' && isIntern) return false;
        // Check if posted within last 30 days
        const postedDate = job.date_posted ? new Date(job.date_posted) : null;
        if (postedDate && postedDate < thirtyDaysAgo) return false;
        if (!jobMatchesLocation(job, prefCity, prefState)) return false;
        return true;
      })
      .slice(0, maxResults)
      .map(job => ({
        name: job.organization,
        job_title: job.title,
        hiring_description: job.ai_core_responsibilities || job.ai_requirements_summary || `${job.organization} is hiring for ${job.title}`,
        job_url: job.url,
        location: job.locations_derived?.[0] || location || '',
        posted_date: job.date_posted || null,
        salary_range: null,
        source: 'fantastic_backfill',
      }));
    
    console.log('[fetchBackfillJobs] Filtered to %d jobs (last 30 days)', filtered.length);
    return filtered;
  } catch (e) {
    console.error('[fetchBackfillJobs] Error:', e.message);
    return [];
  }
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

    // ── Daily limit: free = 5 (matches UI copy + preserves scarcity), premium = 30 ──
    const isPremium = checkIsFastIQ(user);
    const dailyLimit = isPremium ? 30 : 5;

    // ALWAYS force refresh - no caching
    console.log(`[getDailyDrop] User: ${user.email}, dropDate: ${dropDate}`);

    // Clear ALL existing drops for today (no cache)
    try {
      const existing = await base44.entities.UserDailyDrop.filter({ user_id: user.id, drop_date: dropDate });
      console.log(`[getDailyDrop] Clearing ${existing?.length || 0} existing drops for ${dropDate}`);
      for (const d of existing || []) await base44.entities.UserDailyDrop.delete(d.id);
    } catch (e) {
      console.warn('[getDailyDrop] Could not clear existing drops:', e.message);
    }

    // ── 2. Generate a fresh daily drop ────────────────────────────────────
    console.log(`[getDailyDrop] Generating fresh drop for ${user.email} on ${dropDate}`);

    // Track ALL companies shown to user in last 14 days for deduplication
    const seenCompanies = new Map(); // companyKey -> last seen timestamp (curated cooldown)
    const seenPairs = new Set(); // companyKey|roleKey (live-job repeat guard)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    try {
      const recentDrops = await base44.entities.UserDailyDrop.filter({ user_id: user.id }, '-created_date', 100);
      for (const d of recentDrops || []) {
        const dropDate = new Date(d.drop_date);
        if (dropDate < fourteenDaysAgo) continue; // Skip drops older than 14 days
        
        for (const s of d.slots || []) {
          const companyKey = (s.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          // Track company-level cooldown (14 days) - regardless of role
          if (!seenCompanies.has(companyKey)) {
            seenCompanies.set(companyKey, dropDate.getTime());
          }
          // Track exact company+role pairs — live jobs are only "recycled" if the
          // SAME posting repeats; a new role at a seen company is still fresh.
          seenPairs.add(companyKey + '|' + (s.role || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
      }
      console.log('[getDailyDrop] Dedup: %d companies blocked in last 14 days', seenCompanies.size);
    } catch (e) {
      console.warn('[getDailyDrop] Could not load recent drops for dedup:', e.message);
    }
    
    // Check if company is in cooldown (seen in last 14 days) - STRICT company-level dedup
    const isCompanyInCooldown = (company) => {
      const companyKey = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return seenCompanies.has(companyKey);
    };

    const goals = user.career_goals || {};
    const targetIndustries = (goals.target_industries || goals.industries || []).filter(Boolean).map(i => i.toLowerCase());
    const targetRole = (Array.isArray(goals.target_roles) ? goals.target_roles[0] : goals.target_roles) || goals.role || '';
    const sizePref = goals.company_size_preference || 'all';
    // Structured work-location preferences drive RETRIEVAL, not just post-filtering
    const structuredLoc = (Array.isArray(user.preferred_locations) && user.preferred_locations[0])
      ? (user.preferred_locations[0].display_label || user.preferred_locations[0].city || '')
      : '';
    const remotePref = user.remote_preference || '';
    const location = structuredLoc
      || (['required', 'preferred'].includes(remotePref) ? 'Remote' : '')
      || goals.location_preference || user.location_preference || user.location || '';
    const seeking = goals.seeking || 'both';

    // Size pref - but allow all sizes to get more results
    const sizeArray = ['large', 'mid', 'startup']; // Ignore size filter to maximize results

    // TEST MODE: Set to true to bypass ALL APIs and use ONLY fallback pool (for testing variety)
    const TEST_FALLBACK_ONLY = false;
    
    // Live job slots. PRIMARY source is now OpenWeb Ninja (Fantastic Jobs deprecated).
    let allLiveSlots = [];
    const openWebNinjaApiKey = Deno.env.get('OPENWEB_NINJA_API_KEY');
    // Fantastic Jobs is deprecated — quota-exhausted, serving only fallback. Set
    // USE_FANTASTIC_JOBS=true to re-enable the legacy fresh/modified/backfill fetches.
    const USE_FANTASTIC_JOBS = false;
    const fantasticApiKey = Deno.env.get('FANTASTIC_JOBS_API_KEY');
    
    // Always search the student's ACTUAL target role — rotating to generic terms
    // ('marketing', 'coordinator') produced irrelevant results most days.
    const role = targetRole || (targetIndustries.length > 0 ? `${targetIndustries[0]} analyst` : 'analyst');

    console.log(`[getDailyDrop] Fetching jobs: role=${role}, location=${location}, seeking=${seeking}`);
    
    let freshJobs = [];
    let modifiedJobs = [];
    let backfillJobs = [];
    
    if (!TEST_FALLBACK_ONLY) {
      // SPEED: run OpenWeb Ninja (primary) and BuiltIn (backup) IN PARALLEL with
      // tighter timeouts. The old serial flow waited up to 25s on the primary and
      // THEN up to 14s on the backup — worst case ~39s. Now worst case is ~12s.
      const withTimeout = (p, ms, label) => Promise.race([
        p.catch((e) => { console.error(`[getDailyDrop] ${label} failed:`, e.message); return []; }),
        new Promise((resolve) => setTimeout(() => {
          console.error(`[getDailyDrop] ${label} TIMEOUT after ${ms}ms`);
          resolve([]);
        }, ms)),
      ]);

      if (!openWebNinjaApiKey) {
        console.warn('[getDailyDrop] No OpenWeb Ninja API key — falling back to curated pool');
      }
      console.log('[getDailyDrop] Fetching LIVE jobs (OpenWeb Ninja + BuiltIn in parallel)...');
      const [ownJobs, builtInJobs] = await Promise.all([
        openWebNinjaApiKey
          ? withTimeout(fetchOpenWebNinjaJobs({ role, location, seeking, apiKey: openWebNinjaApiKey, maxResults: dailyLimit * 4 }), 12000, 'OpenWeb Ninja')
          : Promise.resolve([]),
        withTimeout(fetchBuiltInJobs({ role, location, seeking, maxResults: dailyLimit }), 10000, 'BuiltIn'),
      ]);
      freshJobs = ownJobs || [];
      console.log('[getDailyDrop] OpenWeb Ninja result: %d companies, BuiltIn: %d', freshJobs.length, builtInJobs?.length || 0);

      // BACKUP LIVE SOURCE #1: reuse the student's cached live-jobs pool from the
      // Target Matches feed (getLiveJobMatchesFn) — real verified postings that
      // were already fetched and cached in the last 24h. Zero API cost, instant.
      if (freshJobs.length < dailyLimit && Array.isArray(user.job_leads_cache) && user.job_leads_cache.length > 0) {
        // FRESHNESS GUARD: never serve pool jobs older than 30 days (undated allowed —
        // the pool itself is refreshed every 24h so undated entries are recent fetches).
        const thirtyDaysAgoMs = Date.now() - 30 * 86400000;
        const poolJobs = user.job_leads_cache
          .filter(c => !c.posted_date || new Date(c.posted_date).getTime() >= thirtyDaysAgoMs)
          .map(c => ({
            name: c.name,
            job_title: c.job_title,
            hiring_description: (c.hiring_description || `${c.name} is hiring for ${c.job_title}`).slice(0, 600),
            job_url: c.job_url,
            location: c.location || '',
            posted_date: c.posted_date || null,
            salary_range: c.salary_range || null,
            source: 'jsearch_pool',
          }))
          .filter(j => j.name && j.job_title && j.job_url);
        console.log('[getDailyDrop] Sparse (%d) — adding %d live jobs from Target Matches pool', freshJobs.length, poolJobs.length);
        freshJobs = freshJobs.concat(poolJobs);
      }

      // FINAL LIVE BACKUP: BuiltIn results were already fetched in parallel above —
      // append them only when the feed is still sparse (zero extra wait).
      if (freshJobs.length < dailyLimit && builtInJobs?.length) {
        console.log('[getDailyDrop] Still sparse (%d) — appending %d BuiltIn jobs', freshJobs.length, builtInJobs.length);
        freshJobs = freshJobs.concat(builtInJobs);
      }

      // DEPRECATED: legacy Fantastic Jobs fetches (fresh/modified/backfill).
      // Gated off behind USE_FANTASTIC_JOBS — quota-exhausted, served only fallback.
      if (USE_FANTASTIC_JOBS && fantasticApiKey) {
        try {
          freshJobs = freshJobs.concat(await fetchFreshJobs({ role, location, seeking, apiKey: fantasticApiKey, maxResults: dailyLimit * 2 }));
          modifiedJobs = await fetchModifiedJobs({ role, location, seeking, apiKey: fantasticApiKey, maxResults: dailyLimit });
          backfillJobs = await fetchBackfillJobs({ role, location, seeking, apiKey: fantasticApiKey, maxResults: dailyLimit * 2 });
        } catch (e) {
          console.error('[getDailyDrop] Legacy Fantastic Jobs fetch failed:', e.message);
        }
      }

      console.log('[getDailyDrop] Live source: OpenWeb Ninja (primary), Fantastic Jobs %s, + curated fallback pool', USE_FANTASTIC_JOBS ? 'ENABLED' : 'deprecated');
    } else {
      console.log('[getDailyDrop] TEST MODE: Bypassing APIs, using fallback pool only');
    }

    // FALLBACK-HEAVY MODE: if APIs return < 60% of daily limit, aggressively use fallback pool
    const MINIMUM_LIVE_RATIO = 0.6; // At least 60% from live APIs, rest from fallback
    
    // Merge ALL sources: FRESH + MODIFIED + BACKFILL (dedup by COMPANY ONLY)
    const mergedCompanies = new Set();
    const mergedJobs = [];
    
    // Combine all API sources
    const allJobs = [
      ...(freshJobs || []),
      ...(modifiedJobs || []),
      ...(backfillJobs || []),
    ];
    
    // Live-job repeat guard: block only exact company+role pairs already shown
    // in the last 14 days. A new role at a previously-seen company is still fresh —
    // the company-only cooldown was starving the live feed.
    // HARD SEEKING FILTER: internship seekers NEVER see full-time jobs, and
    // full-time seekers NEVER see internships. Not a ranking nudge — a hard cut.
    const isInternJob = (j) =>
      /\bintern(ship)?s?\b|\bco[- ]?op\b/.test(((j.job_title || '') + ' ' + (j.employment_type || '')).toLowerCase());

    const eligibleJobs = allJobs.filter(j => {
      if (seeking === 'internship' && !isInternJob(j)) return false;
      if (seeking === 'fulltime' && isInternJob(j)) return false;
      const ck = (j.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const rk = (j.job_title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return !seenPairs.has(ck + '|' + rk);
    });
    
    console.log('[getDailyDrop] All sources: fresh=%d, modified=%d, backfill=%d, total=%d, eligible=%d', 
      freshJobs?.length || 0, modifiedJobs?.length || 0, backfillJobs?.length || 0, allJobs.length, eligibleJobs.length);
    
    // ── FIT SCORING: rank every eligible job against the student's actual goals ──
    // A student who sees 12 irrelevant jobs never comes back. Every job gets a
    // relevance score; jobs with ZERO connection to their target role are cut,
    // and the rest are ranked best-fit-first.
    const STOPWORDS = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'in', 'for', 'to', 'entry', 'level']);
    const roleWords = [...new Set(
      (targetRole + ' ' + targetIndustries.join(' '))
        .toLowerCase().split(/[^a-z0-9]+/)
        .filter(w => w.length >= 3 && !STOPWORDS.has(w))
    )];
    const locCity = (location || '').toLowerCase().split(',')[0].trim();
    const nowMs = Date.now();

    const scoreJob = (j) => {
      const title = (j.job_title || '').toLowerCase();
      const desc = (j.hiring_description || j.description || '').toLowerCase();
      let score = 0;
      let roleHits = 0;
      for (const w of roleWords) {
        if (title.includes(w)) { score += 30; roleHits++; }
        else if (desc.includes(w)) { score += 8; roleHits++; }
      }
      // Location fit: their city or remote
      const jl = (j.location || '').toLowerCase();
      if (locCity && (jl.includes(locCity) || jl.includes('remote') || title.includes('remote'))) score += 15;
      // Recency: fresher postings rank higher
      if (j.posted_date) {
        const ageDays = (nowMs - new Date(j.posted_date).getTime()) / 86400000;
        if (ageDays >= 0 && ageDays <= 7) score += 15;
        else if (ageDays <= 14) score += 8;
      }
      if (j.salary_range) score += 3;
      return { score, roleHits };
    };

    const scored = eligibleJobs.map(j => ({ job: j, ...scoreJob(j) }));
    // QUALITY BAR: cut jobs with no connection to the student's target role at all —
    // unless that leaves fewer than 5, in which case top up with the best of the rest.
    let relevant = scored.filter(s => roleWords.length === 0 || s.roleHits > 0);
    if (relevant.length < 5) {
      const rest = scored.filter(s => !relevant.includes(s)).sort((a, b) => b.score - a.score);
      relevant = relevant.concat(rest.slice(0, 5 - relevant.length));
    }
    relevant.sort((a, b) => b.score - a.score);
    console.log('[getDailyDrop] Fit scoring: %d eligible → %d passed relevance bar (roleWords: %s)',
      eligibleJobs.length, relevant.length, roleWords.join(','));

    // ── SHARED LOCATION INTELLIGENCE: strict constraints filter here, preferences
    // re-rank here. One service, same rules as every other CLIFF surface. ──
    try {
      const jobsForLoc = relevant.map((s, i) => ({ key: String(i), location: s.job.location || '', title: s.job.job_title || '' }));
      if (jobsForLoc.length) {
        const locRes = await base44.functions.invoke('locationIntelligence', { jobs: jobsForLoc, log_context: 'daily_drop' });
        const byKey = {};
        for (const ev of (locRes?.data?.evaluations || locRes?.evaluations || [])) byKey[ev.key] = ev;
        relevant.forEach((s, i) => { s.loc = byKey[String(i)] || null; });
        // Never surface hard violations — unless dropping them would empty the feed
        const kept = relevant.filter(s => !s.loc?.hard_constraint_violation);
        if (kept.length >= 3 || kept.length === relevant.length) relevant = kept;
        relevant.sort((a, b) =>
          (b.score + (b.loc?.ranking_adjustment || 0) * 10) - (a.score + (a.loc?.ranking_adjustment || 0) * 10));
        console.log('[getDailyDrop] Location intelligence: %d kept of %d', relevant.length, jobsForLoc.length);
      }
    } catch (e) {
      console.warn('[getDailyDrop] locationIntelligence unavailable:', e.message);
    }

    for (const item of relevant) {
      const job = item.job;
      const companyKey = job.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (mergedCompanies.has(companyKey)) continue;
      mergedCompanies.add(companyKey);
      
      mergedJobs.push({
        company: job.name,
        role: job.job_title || role,
        jobDescription: job.hiring_description || job.description || `${job.name} is actively hiring for ${role} roles.`,
        jobSource: job.job_url || `${job.name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
        jobSourceCategory: job.source === 'fantastic_modified' ? 'A' : 'A',
        companyTier: 1,
        isLiveResult: true,
        slotType: 'live',
        leadTier: 'target',
        alumniCount: 0,
        parentCount: 0,
        salary_range: job.salary_range || null,
        location: job.location || null,
        posted_date: job.posted_date || null,
        location_match: item.loc?.location_match || 'unknown',
        location_note: item.loc?.display_explanation || '',
      });

      if (mergedJobs.length >= dailyLimit * 2) break;
    }

    allLiveSlots = mergedJobs;
    const minLiveNeeded = Math.floor(dailyLimit * MINIMUM_LIVE_RATIO);
    const needsMoreFromFallback = allLiveSlots.length < minLiveNeeded;
    console.log('[getDailyDrop] Live slots: %d, dailyLimit: %d, minLiveNeeded: %d, FALLBACK_HEAVY: %s', allLiveSlots.length, dailyLimit, minLiveNeeded, needsMoreFromFallback);

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
    let slots = allLiveSlots.slice(0, dailyLimit).map(enrichWithAlumni);

    // LIVE-FIRST POLICY: live jobs are the norm. Curated filler is a LAST RESORT,
    // used ONLY when every live source returned nothing — and even then capped at 5
    // cards. A shorter feed of real postings beats a padded feed of generic cards.
    if (slots.length === 0) {
      console.log('[getDailyDrop] ZERO live jobs from all sources — using curated last-resort pool (max 5)');
      // MASSIVELY expanded fallback pool with 150+ companies across industries
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
        // Tech startups & mid-size
        { company: 'Ramp', role: 'Finance Intern', jobDescription: 'Fintech finance internship.', jobSource: 'ramp.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Plaid', role: 'Engineering Intern', jobDescription: 'Financial API engineering internship.', jobSource: 'plaid.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Robinhood', role: 'Product Intern', jobDescription: 'Investment app product internship.', jobSource: 'robinhood.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Coinbase', role: 'Crypto Intern', jobDescription: 'Cryptocurrency platform internship.', jobSource: 'coinbase.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Instacart', role: 'Operations Intern', jobDescription: 'Grocery delivery operations internship.', jobSource: 'instacart.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'DoorDash', role: 'Logistics Intern', jobDescription: 'Food delivery logistics internship.', jobSource: 'doordash.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Shopify', role: 'Commerce Intern', jobDescription: 'E-commerce platform internship.', jobSource: 'shopify.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Square', role: 'Payments Intern', jobDescription: 'Payment processing internship.', jobSource: 'squareup.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Affirm', role: 'Data Intern', jobDescription: 'Buy-now-pay-later data internship.', jobSource: 'affirm.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Chime', role: 'Banking Intern', jobDescription: 'Digital banking internship.', jobSource: 'chime.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Notion', role: 'Product Design Intern', jobDescription: 'Productivity app design internship.', jobSource: 'notion.so/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Figma', role: 'Design Intern', jobDescription: 'Design tool product internship.', jobSource: 'figma.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Canva', role: 'Marketing Intern', jobDescription: 'Design platform marketing internship.', jobSource: 'canva.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Dropbox', role: 'Cloud Intern', jobDescription: 'Cloud storage engineering internship.', jobSource: 'dropbox.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Box', role: 'Enterprise Intern', jobDescription: 'Enterprise cloud internship.', jobSource: 'box.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Slack', role: 'Communications Intern', jobDescription: 'Workplace communications internship.', jobSource: 'slack.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Zoom', role: 'Video Engineering Intern', jobDescription: 'Video communications engineering internship.', jobSource: 'zoom.us/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Twilio', role: 'API Intern', jobDescription: 'Communications API internship.', jobSource: 'twilio.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'MongoDB', role: 'Database Intern', jobDescription: 'Database technology internship.', jobSource: 'mongodb.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Snowflake', role: 'Data Engineering Intern', jobDescription: 'Cloud data platform internship.', jobSource: 'snowflake.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Databricks', role: 'Analytics Intern', jobDescription: 'Data analytics platform internship.', jobSource: 'databricks.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Palantir', role: 'Software Intern', jobDescription: 'Big data software internship.', jobSource: 'palantir.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Additional finance
        { company: 'Charles Schwab', role: 'Investment Intern', jobDescription: 'Brokerage services internship.', jobSource: 'careers.schwab.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Fidelity Investments', role: 'Wealth Intern', jobDescription: 'Wealth management internship.', jobSource: 'fidelity.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'T. Rowe Price', role: 'Asset Management Intern', jobDescription: 'Asset management internship.', jobSource: 'troweprice.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Capital One', role: 'Tech Intern', jobDescription: 'Banking technology internship.', jobSource: 'capitalone.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'American Express', role: 'Finance Intern', jobDescription: 'Financial services internship.', jobSource: 'americanexpress.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Visa', role: 'Payments Intern', jobDescription: 'Payment technology internship.', jobSource: 'visa.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Mastercard', role: 'Product Intern', jobDescription: 'Payment solutions product internship.', jobSource: 'mastercard.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Additional healthcare
        { company: 'UnitedHealth Group', role: 'Healthcare Intern', jobDescription: 'Health insurance internship.', jobSource: 'unitedhealthgroup.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Anthem', role: 'Data Intern', jobDescription: 'Healthcare data internship.', jobSource: 'anthem.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Cigna', role: 'Operations Intern', jobDescription: 'Health services operations internship.', jobSource: 'cigna.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Humana', role: 'Marketing Intern', jobDescription: 'Healthcare marketing internship.', jobSource: 'humana.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'CVS Health', role: 'Retail Intern', jobDescription: 'Healthcare retail internship.', jobSource: 'jobs.cvshealth.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Walgreens', role: 'Pharmacy Intern', jobDescription: 'Pharmacy operations internship.', jobSource: 'walgreens.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Additional retail
        { company: 'Home Depot', role: 'Supply Chain Intern', jobDescription: 'Home improvement retail internship.', jobSource: 'homedepot.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Lowe\'s', role: 'Merchandising Intern', jobDescription: 'Home improvement merchandising internship.', jobSource: 'lowes.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Best Buy', role: 'Technology Intern', jobDescription: 'Electronics retail technology internship.', jobSource: 'bestbuy.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Macy\'s', role: 'Fashion Intern', jobDescription: 'Department store fashion internship.', jobSource: 'macysinc.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nordstrom', role: 'Retail Intern', jobDescription: 'Luxury retail internship.', jobSource: 'nordstrom.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Additional industrial
        { company: 'Caterpillar', role: 'Engineering Intern', jobDescription: 'Heavy machinery engineering internship.', jobSource: 'caterpillar.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Deere & Company', role: 'Agriculture Intern', jobDescription: 'Agricultural equipment internship.', jobSource: 'deere.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Ford', role: 'Automotive Intern', jobDescription: 'Automotive engineering internship.', jobSource: 'corporate.ford.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'General Motors', role: 'Manufacturing Intern', jobDescription: 'Automotive manufacturing internship.', jobSource: 'careers.gm.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Rivian', role: 'EV Intern', jobDescription: 'Electric vehicle engineering internship.', jobSource: 'rivian.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Lucid Motors', role: 'Design Intern', jobDescription: 'Luxury EV design internship.', jobSource: 'lucidmotors.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
      ];
      const fulltimeFallbackSlots = [
        // Tech
        { company: 'Google', role: 'Associate Product Manager', jobDescription: 'APM program for new graduates across product and engineering.', jobSource: 'careers.google.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Microsoft', role: 'Software Engineer', jobDescription: 'Full-time software engineering roles for new graduates.', jobSource: 'careers.microsoft.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Apple', role: 'Hardware Engineer', jobDescription: 'Hardware engineering roles for new graduates.', jobSource: 'apple.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Meta', role: 'Data Analyst', jobDescription: 'Entry-level data analytics roles.', jobSource: 'metacareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Amazon', role: 'Area Manager', jobDescription: 'Operations leadership program for new graduates.', jobSource: 'amazon.jobs', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Salesforce', role: 'Associate Solution Engineer', jobDescription: 'New grad program blending tech, business, and customer strategy.', jobSource: 'salesforce.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Adobe', role: 'Product Manager', jobDescription: 'Product management role for tech-savvy graduates.', jobSource: 'adobe.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Oracle', role: 'Cloud Engineer', jobDescription: 'Cloud infrastructure engineering role.', jobSource: 'oracle.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'IBM', role: 'Research Scientist', jobDescription: 'AI and research position.', jobSource: 'ibm.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Intel', role: 'Hardware Engineer', jobDescription: 'Semiconductor and hardware engineering role.', jobSource: 'intel.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nvidia', role: 'GPU Engineer', jobDescription: 'GPU and AI computing role.', jobSource: 'nvidia.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Cisco', role: 'Network Engineer', jobDescription: 'Networking and infrastructure role.', jobSource: 'cisco.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Dell', role: 'Technology Analyst', jobDescription: 'Technology and business role.', jobSource: 'dell.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'HP', role: 'Product Designer', jobDescription: 'Product design and engineering role.', jobSource: 'hp.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Snap Inc', role: 'Software Engineer', jobDescription: 'Social media tech role.', jobSource: 'snap.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Pinterest', role: 'Data Scientist', jobDescription: 'Data and analytics role.', jobSource: 'pinterest.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'LinkedIn', role: 'Product Manager', jobDescription: 'Professional network product role.', jobSource: 'linkedin.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Uber', role: 'Operations Manager', jobDescription: 'Ride-sharing operations role.', jobSource: 'uber.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Lyft', role: 'Marketing Manager', jobDescription: 'Transportation marketing role.', jobSource: 'lyft.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Airbnb', role: 'Community Manager', jobDescription: 'Hospitality and community role.', jobSource: 'airbnb.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Stripe', role: 'Business Operations Analyst', jobDescription: 'High-growth fintech — analytical roles for new grads.', jobSource: 'stripe.com/jobs', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Square', role: 'Product Manager', jobDescription: 'Payments product role.', jobSource: 'squareup.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PayPal', role: 'Engineer', jobDescription: 'Digital payments engineering role.', jobSource: 'paypal.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Zoom', role: 'Software Engineer', jobDescription: 'Video communications software role.', jobSource: 'zoom.us/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Consulting
        { company: 'Deloitte', role: 'Business Analyst', jobDescription: 'Strategy and advisory associates across all US offices.', jobSource: 'deloitte.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'McKinsey', role: 'Business Analyst', jobDescription: 'Entry-level consulting position.', jobSource: 'mckinsey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Boston Consulting Group', role: 'Associate', jobDescription: 'Strategy consulting associate role.', jobSource: 'bcg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Bain', role: 'Associate Consultant', jobDescription: 'Entry-level consulting position.', jobSource: 'bain.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Accenture', role: 'Consulting Analyst', jobDescription: 'Entry-level consulting across strategy, tech, and operations.', jobSource: 'accenture.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PwC', role: 'Associate', jobDescription: 'Audit and assurance associate role.', jobSource: 'pwc.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'EY', role: 'Staff Consultant', jobDescription: 'Business consulting entry-level role.', jobSource: 'ey.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'KPMG', role: 'Associate Auditor', jobDescription: 'Audit and tax associate position.', jobSource: 'kpmg.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Oliver Wyman', role: 'Consultant', jobDescription: 'Strategy consulting role.', jobSource: 'oliverwyman.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'A.T. Kearney', role: 'Business Analyst', jobDescription: 'Management consulting role.', jobSource: 'kearney.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Finance
        { company: 'Goldman Sachs', role: 'Investment Banking Analyst', jobDescription: 'Full-time analyst program in investment banking.', jobSource: 'goldmansachs.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'JPMorgan Chase', role: 'Analyst Development Program', jobDescription: 'Rotational analyst program across banking, markets, and operations.', jobSource: 'careers.jpmorgan.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Morgan Stanley', role: 'Wealth Management Analyst', jobDescription: 'Wealth management analyst role.', jobSource: 'morganstanley.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Bank of America', role: 'Investment Banking Analyst', jobDescription: 'Investment banking analyst role.', jobSource: 'bankofamerica.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Citigroup', role: 'Markets Analyst', jobDescription: 'Capital markets analyst role.', jobSource: 'citi.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Wells Fargo', role: 'Finance Analyst', jobDescription: 'Corporate finance analyst role.', jobSource: 'wellsfargo.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'BlackRock', role: 'Investment Management Analyst', jobDescription: 'Asset management analyst role.', jobSource: 'blackrock.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Vanguard', role: 'Investment Analyst', jobDescription: 'Investment analyst role.', jobSource: 'vanguard.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Fidelity', role: 'Financial Analyst', jobDescription: 'Financial services analyst role.', jobSource: 'fidelity.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'State Street', role: 'Investment Analyst', jobDescription: 'Investment services analyst role.', jobSource: 'statestreet.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // CPG/Retail
        { company: 'Procter & Gamble', role: 'Brand Management Associate', jobDescription: 'Classic CPG brand-building track with real P&L ownership.', jobSource: 'pgcareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Unilever', role: 'Supply Chain Manager', jobDescription: 'Operations and supply chain management.', jobSource: 'unilever.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Coca-Cola', role: 'Finance Analyst', jobDescription: 'Corporate finance analyst role.', jobSource: 'coca-colacompany.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'PepsiCo', role: 'Marketing Manager', jobDescription: 'Brand marketing and strategy role.', jobSource: 'pepsico.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nestlé', role: 'Management Trainee', jobDescription: 'Rotational leadership development program.', jobSource: 'nestle.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Johnson & Johnson', role: 'R&D Scientist', jobDescription: 'Research and development scientist role.', jobSource: 'careers.jnj.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'L\'Oréal', role: 'Brand Manager', jobDescription: 'Marketing and brand management role.', jobSource: 'loreal.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nike', role: 'Marketing Associate', jobDescription: 'Brand and digital marketing roles for early-career talent.', jobSource: 'jobs.nike.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Adidas', role: 'Product Manager', jobDescription: 'Sportswear product role.', jobSource: 'adidas.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Target', role: 'Merchandising Manager', jobDescription: 'Retail merchandising role.', jobSource: 'target.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Walmart', role: 'Operations Manager', jobDescription: 'Retail operations role.', jobSource: 'walmart.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Costco', role: 'Business Manager', jobDescription: 'Warehouse retail business role.', jobSource: 'costco.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Healthcare/Pharma
        { company: 'Pfizer', role: 'Sales Representative', jobDescription: 'Pharmaceutical sales role.', jobSource: 'pfizer.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Merck', role: 'Clinical Researcher', jobDescription: 'Clinical research role.', jobSource: 'merck.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'AbbVie', role: 'Marketing Manager', jobDescription: 'Pharma marketing role.', jobSource: 'abbvie.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Roche', role: 'Diagnostics Manager', jobDescription: 'Medical diagnostics role.', jobSource: 'roche.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Novartis', role: 'Data Scientist', jobDescription: 'Healthcare data science role.', jobSource: 'novartis.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Media/Entertainment
        { company: 'Disney', role: 'Marketing Manager', jobDescription: 'Entertainment marketing role.', jobSource: 'jobs.disneycareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Netflix', role: 'Content Manager', jobDescription: 'Streaming content role.', jobSource: 'jobs.netflix.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Warner Bros', role: 'Production Manager', jobDescription: 'Film production role.', jobSource: 'warnerbros.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'NBCUniversal', role: 'Media Manager', jobDescription: 'Broadcasting media role.', jobSource: 'nbcunicareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Spotify', role: 'Associate, Strategy & Operations', jobDescription: 'Early-career roles in music-tech strategy and analytics.', jobSource: 'lifeatspotify.com', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        // Energy/Industrial
        { company: 'Tesla', role: 'Production Engineer', jobDescription: 'Manufacturing engineering role.', jobSource: 'tesla.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'SpaceX', role: 'Avionics Engineer', jobDescription: 'Aerospace engineering role.', jobSource: 'spacex.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Boeing', role: 'Engineer', jobDescription: 'Aerospace engineering role.', jobSource: 'boeing.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Lockheed Martin', role: 'Systems Engineer', jobDescription: 'Defense systems engineering role.', jobSource: 'lockheedmartin.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'General Electric', role: 'Technology Analyst', jobDescription: 'Industrial technology role.', jobSource: 'ge.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Siemens', role: 'Automation Engineer', jobDescription: 'Industrial automation role.', jobSource: 'siemens.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: '3M', role: 'Innovation Manager', jobDescription: 'Product innovation role.', jobSource: '3m.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Honeywell', role: 'Engineer', jobDescription: 'Aerospace and building tech role.', jobSource: 'honeywell.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Ramp', role: 'Finance & Strategy Analyst', jobDescription: 'Series D fintech — real ownership from day one.', jobSource: 'ramp.com/careers', jobSourceCategory: 'B', companyTier: 3, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Rivian', role: 'EV Engineer', jobDescription: 'Electric vehicle engineering role.', jobSource: 'rivian.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Lucid Motors', role: 'Designer', jobDescription: 'Luxury EV design role.', jobSource: 'lucidmotors.com/careers', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
      ];
      // Match the student's seeking intent — internship seekers must NEVER see full-time fallbacks
      const fallbackSlots = seeking === 'internship' ? internFallbackSlots
        : seeking === 'fulltime' ? fulltimeFallbackSlots
        : [...internFallbackSlots.slice(0, 3), ...fulltimeFallbackSlots];
      
      // AGGRESSIVE shuffle using crypto-random for true randomness each day
      const shuffled = [...fallbackSlots];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Last resort only: cap at 5 curated cards regardless of tier
      const targetSlots = Math.min(dailyLimit, 5);
      
      // Filter out companies already in slots or in 14-day cooldown
      const existingCompanyKeys = new Set(slots.map(s => s.company.toLowerCase().replace(/[^a-z0-9]/g, '')));
      for (const fb of shuffled) {
        const fbCompanyKey = fb.company.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Skip if company already in slots OR in 14-day cooldown
        if (existingCompanyKeys.has(fbCompanyKey) || isCompanyInCooldown(fb.company)) continue;
        
        slots.push(fb);
        existingCompanyKeys.add(fbCompanyKey);
        if (slots.length >= targetSlots) break;
      }

      // SAFETY NET: the feed must NEVER be empty. For active daily users (or a
      // heavily-tested account), the 14-day cooldown can eventually block the entire
      // fallback pool. If we're still short of a minimally-populated feed, relax the
      // cooldown and fill from the pool so the student always sees roles.
      const MIN_SLOTS = Math.min(dailyLimit, 5);
      if (slots.length < MIN_SLOTS) {
        console.log('[getDailyDrop] SAFETY NET: only %d slots after cooldown — relaxing cooldown to refill', slots.length);
        for (const fb of shuffled) {
          const fbCompanyKey = fb.company.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (existingCompanyKeys.has(fbCompanyKey)) continue; // still avoid duplicates within this drop
          slots.push(fb);
          existingCompanyKeys.add(fbCompanyKey);
          if (slots.length >= MIN_SLOTS) break;
        }
      }
      
      console.log('[getDailyDrop] Added %d fallback slots (cooldown-filtered, target: %d)', slots.length - (slots.filter(s => !s.isLiveResult).length), targetSlots);
      
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