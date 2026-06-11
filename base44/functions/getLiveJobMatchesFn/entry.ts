import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Returns personalized job leads for a student.
 * Source of truth: Fantastic.jobs ATS API (real, live job postings scraped
 * hourly from 200k+ company career pages). No LLM-generated listings.
 * Cached 24h per user, busted when goals change.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

// Map LinkedIn headcount to our size tiers
function sizeFromHeadcount(headcount) {
  if (!headcount || headcount <= 0) return null;
  if (headcount <= 50) return 'startup';
  if (headcount <= 500) return 'mid';
  return 'large';
}

// "New York, NY" → location query the API understands (city OR full-name state)
function buildLocationQuery(location) {
  if (!location) return null;
  if (/remote/i.test(location)) return null;
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  const city = parts[0];
  const stateAbbr = parts[1]?.toUpperCase().slice(0, 2);
  const stateName = STATE_NAMES[stateAbbr];
  if (city && stateName) return `"${city}" OR "${stateName}, United States"`;
  if (city) return `"${city}"`;
  return null;
}

// Boolean title query: role keyword AND (entry-level terms OR remaining role words)
function buildTitleQuery(role) {
  const ENTRY_TERMS = `intern:* | junior | associate | coordinator | 'entry level' | graduate | trainee | 'new grad'`;
  const words = (role || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return `(${ENTRY_TERMS})`;
  const primary = words[0];
  const rest = words.slice(1);
  const restClause = rest.length > 0 ? ` | ${rest.join(' | ')}` : '';
  return `${primary} & (${ENTRY_TERMS}${restClause})`;
}

function hiringSignalFromDate(datePosted) {
  if (!datePosted) return 'warm';
  const ageDays = (Date.now() - new Date(datePosted).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 2) return 'hot';
  if (ageDays <= 5) return 'warm';
  return 'cool';
}

function formatSalary(job) {
  const min = job.ai_salary_min_value;
  const max = job.ai_salary_max_value;
  const single = job.ai_salary_value;
  const unit = job.ai_salary_unit_text;
  const fmt = (v) => unit === 'HOUR' ? `$${v}/hr` : `$${Math.round(v / 1000)}K`;
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (single) return fmt(single);
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('FANTASTIC_JOBS_API_KEY');
    if (!apiKey) return Response.json({ error: 'FANTASTIC_JOBS_API_KEY not set' }, { status: 500 });

    const { career_goals = {}, force_refresh = false } = await req.json().catch(() => ({}));

    const role = career_goals.role
      || user.career_goals?.target_roles?.[0]
      || '';
    const industries = career_goals.industries
      || user.career_goals?.target_industries
      || [];
    const location = career_goals.locations?.[0]
      || user.career_goals?.location_preference
      || '';
    const companySizes = career_goals.company_size_preference
      || user.career_goals?.company_size_preference
      || [];

    if (!role && industries.length === 0) {
      return Response.json({ companies: [] });
    }

    // Normalize caller terminology (enterprise/large, midmarket/mid) and accept string or array
    const NORMALIZE_SIZE = { startup: 'startup', mid: 'mid', midmarket: 'mid', large: 'large', enterprise: 'large' };
    const sizeList = (Array.isArray(companySizes) ? companySizes : (companySizes ? [companySizes] : []))
      .map(s => NORMALIZE_SIZE[String(s).toLowerCase()])
      .filter(Boolean);
    const strictSize = sizeList.length === 1 ? sizeList[0] : null;

    // Cache key: hash of goals so stale cache is busted when goals change
    const goalKey = `v2|${role}|${industries.join(',')}|${location}|${companySizes}`;
    const cached = user.job_leads_cache;
    const cachedAt = user.job_leads_cached_at;
    const cachedKey = user.job_leads_cache_key;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid = !force_refresh && cacheAge < CACHE_TTL_MS && cachedKey === goalKey && cached?.length > 0;

    if (cacheValid) {
      console.log(`[getLiveJobMatchesFn] Returning ${cached.length} cached leads (${Math.round(cacheAge / 60000)}m old)`);
      return Response.json({ companies: cached, from_cache: true });
    }

    const roleDesc = role || industries[0] || '';
    console.log(`[getLiveJobMatchesFn] Fetching REAL jobs for: ${roleDesc} in ${location || 'anywhere'}`);

    // Build Fantastic.jobs query — real ATS postings from the last 7 days
    const titleQuery = buildTitleQuery(roleDesc);
    const locQuery = buildLocationQuery(location);

    // Try direct API first, fall back to RapidAPI (key works on one or the other)
    let apiRes;
    {
      const params = new URLSearchParams({
        time_frame: '7d',
        limit: '100',
        include_basic_organization_details: 'true',
        title_advanced: titleQuery,
      });
      if (locQuery) params.set('location', locQuery);
      apiRes = await fetch(`https://data.fantastic.jobs/v1/active-ats?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
    }
    if (apiRes.status === 401 || apiRes.status === 403) {
      console.log('[getLiveJobMatchesFn] Direct API auth failed, trying RapidAPI hosts...');
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
        advanced_title_filter: titleQuery,
        include_ai: 'true',
      });
      if (locQuery) params.set('location_filter', locQuery);

      const RAPID_HOSTS = [
        { host: 'active-jobs-db.p.rapidapi.com', path: '/active-ats-7d' },
        { host: 'internships-api.p.rapidapi.com', path: '/active-jb-7d' },
        { host: 'linkedin-job-search-api.p.rapidapi.com', path: '/active-jb-7d' },
      ];
      for (const { host, path } of RAPID_HOSTS) {
        apiRes = await fetch(`https://${host}${path}?${params.toString()}`, {
          headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': host },
        });
        console.log(`[getLiveJobMatchesFn] RapidAPI ${host} → ${apiRes.status}`);
        if (apiRes.ok || apiRes.status === 429) break;
      }
    }
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[getLiveJobMatchesFn] Jobs API error ${apiRes.status}: ${errText.slice(0, 300)}`);
      throw new Error(`Jobs API returned ${apiRes.status}`);
    }
    const jobs = await apiRes.json();
    console.log(`[getLiveJobMatchesFn] API returned ${Array.isArray(jobs) ? jobs.length : 0} real postings`);

    // Filter + normalize. One job per company, max 8.
    const seenOrgs = new Set();
    const companies = [];

    for (const job of (Array.isArray(jobs) ? jobs : [])) {
      const org = job.organization;
      const title = job.title?.trim();
      if (!org || !title || !job.url) continue;

      // Entry-level guard: AI-tagged experience or entry-ish title
      const exp = job.ai_experience_level;
      const entryTitle = /intern|junior|associate|coordinator|entry|graduate|trainee|new grad|assistant/i.test(title);
      if (exp && exp !== '0-2' && !entryTitle) {
        continue;
      }

      // Skip recruitment agencies — students want the actual employer
      if (job.org_linkedin_recruitment_agency_derived === true) continue;

      // Strict company-size enforcement using real LinkedIn headcount
      const size = sizeFromHeadcount(job.org_linkedin_headcount);
      if (strictSize && size && size !== strictSize) {
        console.log(`🚫 [getLiveJobMatchesFn] REJECTED (size): ${org} is "${size}" (${job.org_linkedin_headcount} employees), wants "${strictSize}"`);
        continue;
      }
      if (strictSize && !size) {
        console.log(`🚫 [getLiveJobMatchesFn] REJECTED (unknown size): ${org}, wants "${strictSize}"`);
        continue;
      }

      // Dedupe by company
      const orgKey = org.toLowerCase();
      if (seenOrgs.has(orgKey)) continue;
      seenOrgs.add(orgKey);

      const description = job.ai_core_responsibilities
        || job.ai_requirements_summary
        || `${org} is hiring for ${title}.`;

      companies.push({
        name: org,
        job_title: title,
        hiring_description: description,
        hiring_signal: hiringSignalFromDate(job.date_posted),
        job_url: job.url,
        industry: job.org_linkedin_industry || job.ai_taxonomies_a?.[0] || industries[0] || '',
        size: size || undefined,
        location: job.locations_derived?.[0] || location || '',
        salary_range: formatSalary(job),
        posted_date: job.date_posted || null,
        logo_url: job.org_logo_permalink || null,
        has_web_result: true,
        verified_posting: true,
      });

      if (companies.length >= 8) break;
    }

    console.log(`[getLiveJobMatchesFn] Returning ${companies.length} verified real jobs`);

    // Cache results on user record
    await base44.asServiceRole.entities.User.update(user.id, {
      job_leads_cache: companies,
      job_leads_cached_at: new Date().toISOString(),
      job_leads_cache_key: goalKey,
    });

    return Response.json({ companies, from_cache: false });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});