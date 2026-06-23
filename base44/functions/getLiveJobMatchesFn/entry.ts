import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Returns personalized job leads for a student.
 * Source of truth: Apify Indeed Jobs Scraper (misceres/indeed-scraper) —
 * real, live Indeed postings. No LLM-generated listings.
 * Cached 24h per user, busted when goals change.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const APIFY_ACTOR = 'misceres~indeed-scraper';

// Hard seniority blocklist — these NEVER belong in a student feed
const SENIOR_TITLE_RE = /\b(senior|sr\.?|lead|principal|director|manager|mgr|head|vp|vice president|chief|staff|supervisor|architect|executive)\b|\b(ii|iii|iv|v)\b/i;
const INTERN_TITLE_RE = /\b(intern|internship|co-?op)\b/i;
const ENTRY_TITLE_RE = /\b(junior|jr\.?|coordinator|entry|graduate|trainee|new grad|assistant|analyst|associate)\b/i;

function hiringSignalFromDate(datePosted) {
  if (!datePosted) return 'warm';
  const ageDays = (Date.now() - new Date(datePosted).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 2) return 'hot';
  if (ageDays <= 5) return 'warm';
  return 'cool';
}

// Does the Indeed location string match the student's preference?
function jobMatchesLocation(locText, city, stateAbbr) {
  if (!city && !stateAbbr) return true;
  if (!locText) return false;
  const l = locText.toLowerCase();
  if (/remote/.test(l)) return true;
  if (city && l.includes(city.toLowerCase())) return true;
  if (stateAbbr && new RegExp(`\\b${stateAbbr.toLowerCase()}\\b`).test(l)) return true;
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = Deno.env.get('APIFY_API_KEY');
    if (!token) return Response.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });

    const { career_goals = {}, force_refresh = false } = await req.json().catch(() => ({}));

    const role = career_goals.role || user.career_goals?.target_roles?.[0] || '';
    const industries = career_goals.industries || user.career_goals?.target_industries || [];
    const location = career_goals.locations?.[0] || user.career_goals?.location_preference || '';
    const seeking = career_goals.seeking || user.career_goals?.seeking || 'both';

    if (!role && industries.length === 0) {
      return Response.json({ companies: [] });
    }

    // Cache key: hash of goals so stale cache is busted when goals change
    const goalKey = `v4-apify|${seeking}|${role}|${industries.join(',')}|${location}`;
    const cached = user.job_leads_cache;
    const cachedAt = user.job_leads_cached_at;
    const cachedKey = user.job_leads_cache_key;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid = !force_refresh && cacheAge < CACHE_TTL_MS && cachedKey === goalKey && cached?.length > 0;

    if (cacheValid) {
      console.log(`[getLiveJobMatchesFn] Returning ${cached.length} cached leads (${Math.round(cacheAge / 60000)}m old)`);
      return Response.json({ companies: cached, from_cache: true });
    }

    const searchTerm = role || industries[0] || '';
    const isRemote = /remote/i.test(location);
    const locParts = (location && !isRemote) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
    const prefCity = locParts[0] || null;
    const prefState = locParts[1]?.toUpperCase().slice(0, 2) || null;

    console.log(`[getLiveJobMatchesFn] Fetching REAL Indeed jobs for: ${searchTerm} in ${location || 'anywhere'}`);

    const input = {
      position: searchTerm,
      country: 'US',
      location: isRemote ? 'Remote' : (prefCity || ''),
      maxItems: 100,
      parseCompanyDetails: false,
      followApplyRedirects: false,
    };

    const apiRes = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[getLiveJobMatchesFn] Apify error ${apiRes.status}: ${errText.slice(0, 300)}`);
      throw new Error(`Jobs API returned ${apiRes.status}`);
    }
    const jobs = await apiRes.json();
    console.log(`[getLiveJobMatchesFn] Apify returned ${Array.isArray(jobs) ? jobs.length : 0} real postings`);

    // Shuffle so each refresh returns a different subset
    const jobList = Array.isArray(jobs) ? [...jobs] : [];
    for (let i = jobList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [jobList[i], jobList[j]] = [jobList[j], jobList[i]];
    }

    // Filter + normalize into a pool (one per company)
    const seenOrgs = new Set();
    const allCompanies = [];

    for (const job of jobList) {
      const org = job.company?.trim();
      const title = job.positionName?.trim();
      const url = job.url || job.externalApplyLink;
      if (!org || !title || !url) continue;
      if (job.isExpired === true) continue;

      const isInternTitle = INTERN_TITLE_RE.test(title);

      // Seniority gate (interns always allowed)
      if (!isInternTitle && SENIOR_TITLE_RE.test(title)) continue;
      if (seeking === 'internship' && !isInternTitle) continue;
      if (seeking === 'fulltime' && isInternTitle) continue;

      // Entry-level gate — must look junior/entry OR be an internship
      if (!isInternTitle && !ENTRY_TITLE_RE.test(title)) continue;

      if (!jobMatchesLocation(job.location, prefCity, prefState)) continue;

      const orgKey = org.toLowerCase();
      if (seenOrgs.has(orgKey)) continue;
      seenOrgs.add(orgKey);

      const description = job.description?.trim() || `${org} is hiring for ${title}.`;

      allCompanies.push({
        name: org,
        job_title: title,
        hiring_description: description,
        hiring_signal: hiringSignalFromDate(job.postingDateParsed),
        job_url: url,
        industry: industries[0] || '',
        location: job.location || location || '',
        salary_range: job.salary || null,
        posted_date: job.postingDateParsed || null,
        logo_url: null,
        has_web_result: true,
        verified_posting: true,
      });
    }

    console.log(`[getLiveJobMatchesFn] Built pool of ${allCompanies.length} verified real jobs`);

    // Cache the FULL pool so Load More can paginate without re-fetching
    await base44.asServiceRole.entities.User.update(user.id, {
      job_leads_cache: allCompanies,
      job_leads_cached_at: new Date().toISOString(),
      job_leads_cache_key: goalKey,
    });

    return Response.json({ companies: allCompanies, from_cache: false });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});