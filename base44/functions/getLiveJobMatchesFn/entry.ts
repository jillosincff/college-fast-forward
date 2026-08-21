import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getCuratedFallback } from '../../shared/curatedJobsV2.ts';

/**
 * Returns personalized job leads for a student.
 * Source of truth: OpenWeb Ninja JSearch API —
 * real, live job postings aggregated from Google for Jobs. No LLM-generated listings.
 * Cached 24h per user, busted when goals change.
 *
 * Roles covered by the curated fallback ladder: Sales, Finance, Marketing, Software,
 * Communications, Operations, Consulting, Healthcare, Data, Product/UX, HR, Education.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const JSEARCH_BASE = 'https://api.openwebninja.com/jsearch';

// Hard seniority blocklist — these NEVER belong in a student feed
const SENIOR_TITLE_RE = /\b(senior|sr\.?|lead|principal|director|manager|mgr|head|vp|vice president|chief|staff|supervisor|architect|executive|expert|experienced)\b|\b(ii|iii|iv|v)\b/i;
const INTERN_TITLE_RE = /\b(intern|internship|co-?op)\b/i;
// NOTE: "associate" is intentionally NOT in this set. It co-occurs with senior
// titles too often ("Associate Director", "Senior Associate", "Associate Product
// Manager") and was wrongly exempting those from the senior gate below. A plain
// "Marketing Associate" still passes because no senior word is present.
const ENTRY_TITLE_RE = /\b(junior|jr\.?|entry|graduate|trainee|new grad)\b/i;

// Max roles surfaced per company so a single big employer can't flood the feed
const MAX_PER_COMPANY = 2;

// Is this posting genuinely entry-level? Uses JSearch's structured experience data
// (most reliable), falling back to title keywords.
function isEntryLevel(job, title) {
  // A clearly-senior TITLE always disqualifies — even when structured experience
  // data says otherwise. (e.g. "Enterprise Product Marketing, GTM lead" carried
  // no_experience_required but is plainly a senior role.) Interns/explicit
  // entry titles are exempt from the senior gate.
  if (SENIOR_TITLE_RE.test(title) && !ENTRY_TITLE_RE.test(title) && !INTERN_TITLE_RE.test(title)) {
    return false;
  }
  const exp = job.job_required_experience;
  if (exp) {
    if (exp.no_experience_required === true) return true;
    const months = exp.required_experience_in_months;
    if (typeof months === 'number') return months <= 24; // <= 2 years = entry
  }
  return true;
}

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

// When the primary provider is down, try the BuiltIn scraper as a live backup.
// Returns a Response with fresh backup jobs, or null if the backup found nothing.
async function tryBuiltinBackup(base44, searchTerm, isRemote, seeking) {
  try {
    console.log('[getLiveJobMatchesFn] Primary down — trying BuiltIn backup scraper');
    // Service-role invoke: the user-scoped token gets 403 on function-to-function
    // calls. Caller has already verified auth, so the elevation is safe here.
    const res = await base44.asServiceRole.functions.invoke('scrapeBuiltinJobs', {
      query: searchTerm, remote: isRemote, seeking,
    });
    const companies = res?.data?.companies || [];
    if (companies.length > 0) {
      console.log(`[getLiveJobMatchesFn] BuiltIn backup returned ${companies.length} jobs`);
      return Response.json({ companies, from_cache: false, from_backup: true });
    }
  } catch (e) {
    console.error('[getLiveJobMatchesFn] BuiltIn backup failed:', e.message);
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    // Lightweight health-check: uptime monitors ping with GET (or HEAD) and no
    // auth. Answer 200 OK immediately so the monitor sees the endpoint is alive,
    // instead of a 405/401 from the authenticated job-fetch path below.
    if (req.method === 'GET' || req.method === 'HEAD') {
      return Response.json({ ok: true, status: 'healthy', service: 'getLiveJobMatchesFn' });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = Deno.env.get('OPENWEB_NINJA_API_KEY');
    if (!token) return Response.json({ error: 'OPENWEB_NINJA_API_KEY not set' }, { status: 500 });

    const { career_goals = {}, force_refresh = false } = await req.json().catch(() => ({}));

    const role = career_goals.role || user.career_goals?.target_roles?.[0] || '';
    const industries = career_goals.industries || user.career_goals?.target_industries || [];
    // ?? (not ||) so an explicit '' from the caller means "search anywhere" —
    // || treated '' as falsy and fell back to the user's saved location_preference,
    // re-searching the same market that already returned nothing.
    const location = career_goals.locations?.[0] ?? user.career_goals?.location_preference ?? '';
    const seeking = career_goals.seeking || user.career_goals?.seeking || 'both';

    if (!role && industries.length === 0) {
      return Response.json({ companies: [] });
    }

    // Cache key: hash of goals so stale cache is busted when goals change
    const goalKey = `v5-ninja|${seeking}|${role}|${industries.join(',')}|${location}`;
    const cached = user.job_leads_cache;
    const cachedAt = user.job_leads_cached_at;
    const cachedKey = user.job_leads_cache_key;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid = !force_refresh && cacheAge < CACHE_TTL_MS && cachedKey === goalKey && cached?.length > 0;

    if (cacheValid) {
      console.log(`[getLiveJobMatchesFn] Returning ${cached.length} cached leads (${Math.round(cacheAge / 60000)}m old)`);
      return Response.json({ companies: cached, from_cache: true });
    }

    // Clean the search term: strip qualifiers like "paid", "internship", "entry level"
    // that hurt keyword matching. The seniority gate below handles level filtering.
    const rawTerm = role || industries[0] || '';
    // Expand common abbreviations to full terms — JSearch (Google for Jobs) indexes
    // full-word titles. "HR in Miami" mostly returns senior "HR Manager/Director"
    // postings that the entry-level gate then strips; "Human Resources" surfaces the
    // assistant/coordinator roles that actually fit a student.
    const ABBR = { hr: 'Human Resources', pr: 'Public Relations', cs: 'Customer Service', ops: 'Operations', qa: 'Quality Assurance' };
    // Role synonyms — broadens narrow chips into the title variants JSearch actually
    // indexes, so "Communications" doesn't return 0 live postings. Applied AFTER
    // abbreviation expansion so the cleaned term is matched against these aliases.
    const ROLE_SYNONYMS: Record<string, string> = {
      communications: '"Communications" OR "Public Relations" OR PR OR Media OR Content OR "Social Media" OR "Communications Coordinator" OR "Communications Specialist"',
      'public relations': '"Public Relations" OR PR OR Communications OR Media OR "Media Relations"',
      pr: '"Public Relations" OR PR OR Communications OR Media OR "Media Relations"',
      healthcare: '"Healthcare" OR "Clinical Research Coordinator" OR "Research Technician" OR "Healthcare Analyst" OR "Clinical Operations" OR "Patient Care" OR "Medical Assistant"',
      consulting: '"Consulting" OR "Analyst" OR "Strategy" OR "Associate Consultant" OR "Business Analyst" OR "Management Consultant"',
      operations: '"Operations" OR "Operations Coordinator" OR "Operations Analyst" OR "Supply Chain" OR "Logistics Coordinator" OR "Operations Associate"',
      data: '"Data Analyst" OR "Data Scientist" OR "Analytics" OR "Quantitative Analyst" OR "Business Intelligence" OR "Data Associate"',
      product: '"Product Manager" OR "Product Analyst" OR "Product Design" OR "UX" OR "User Experience" OR "Associate Product Manager" OR "Product Coordinator"',
      hr: '"Human Resources" OR "HR Coordinator" OR "Recruiting Coordinator" OR "People Operations" OR "Talent Acquisition" OR "HR Analyst"',
      education: '"Education" OR "Teaching" OR "Admissions" OR "Program Coordinator" OR "Academic Coordinator" OR "Education Associate"',
      marketing: '"Marketing" OR "Marketing Coordinator" OR "Digital Marketing" OR "Content Marketing" OR "Brand Marketing" OR "Social Media Marketing"',
      // Role-keyword-driven, not sector. A bare "Finance" query returns any job
      // at a financial firm (Digital Marketing at Blackstone) and the chip gate
      // then empties the pool. Lead with the actual role titles a student qualifies
      // for so the on-chip pool is dense and fresh.
      finance: '"Investment Banking" OR "Financial Analyst" OR "Summer Analyst" OR "Investment Banking Analyst" OR "FP&A" OR "FP and A" OR "Credit Analyst" OR "Markets Analyst" OR "Wealth Management" OR "Risk Analyst" OR "Audit Associate" OR "Finance Associate"',
      sales: '"Sales" OR "Sales Development Representative" OR "Account Executive" OR "Business Development" OR "Sales Associate"',
      software: '"Software Engineer" OR "Software Developer" OR "Frontend Developer" OR "Backend Developer" OR "Full Stack Developer" OR "Associate Engineer"',
    };
    const searchTerm = rawTerm
      .replace(/\b(paid|unpaid|part[\s-]?time|full[\s-]?time|entry[\s-]?level|junior|jr)\b/gi, '')
      .replace(/\binternships?\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/\b(hr|pr|cs|ops|qa)\b/gi, (m) => ABBR[m.toLowerCase()] || m)
      .replace(/\s{2,}/g, ' ')
      .trim() || rawTerm;
    // If the cleaned term has a synonym expansion, use the broadened query so the
    // live provider returns real postings instead of zero hits on a niche chip.
    const synonymKey = searchTerm.toLowerCase();
    const queryRole = ROLE_SYNONYMS[synonymKey] || searchTerm;
    const isRemote = /remote/i.test(location);
    const locParts = (location && !isRemote) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
    const prefCity = locParts[0] || null;
    const prefState = locParts[1]?.toUpperCase().slice(0, 2) || null;

    console.log(`[getLiveJobMatchesFn] Fetching REAL jobs for: ${searchTerm} in ${location || 'anywhere'}`);

    // JSearch: free-text query combining role + location, recent postings only
    const queryStr = `${queryRole}${isRemote ? ' remote' : (prefCity ? ` in ${prefCity}` : '')}`.trim();
    const params = new URLSearchParams({
      query: queryStr,
      country: 'us',
      date_posted: 'week',
      num_pages: '4',
    });
    if (isRemote) params.set('work_from_home', 'true');

    // Hard timeout so a hanging upstream provider doesn't stall the student's request.
    // Fail fast (6s) ONLY when the cached leads are for THIS query (same goal key) —
    // a stale cache from a different role/city must never be served as a fallback
    // (that's how a Sales+Orlando student got served Finance+Nyc jobs on a timeout).
    // No matching cache = give the provider the full 15s to actually respond.
    const cacheMatches = cached?.length > 0 && cachedKey === goalKey;
    const timeoutMs = cacheMatches ? 6000 : 15000;
    let apiRes;
    {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        apiRes = await fetch(`${JSEARCH_BASE}/search?${params.toString()}`, {
          method: 'GET',
          headers: { 'x-api-key': token },
          signal: controller.signal,
        });
      } catch (e) {
        if (e.name === 'AbortError') {
          console.error(`[getLiveJobMatchesFn] Jobs API timed out (${timeoutMs / 1000}s)`);
          // Serve last cached leads immediately (even if >24h old) if we have any.
          if (cacheMatches) {
            console.log(`[getLiveJobMatchesFn] Timeout — serving ${cached.length} stale cached leads (same query)`);
            return Response.json({ companies: cached, from_cache: true, stale: true });
          }
          // Backup source: scrape BuiltIn directly
          const backup = await tryBuiltinBackup(base44, searchTerm, isRemote, seeking);
          if (backup) return backup;
          console.log(`[getLiveJobMatchesFn][EMPTY] role=${searchTerm} location=${location} query="${queryStr}" api_status=timeout raw_postings=0`);
          const curatedTO = getCuratedFallback(searchTerm, location);
          if (curatedTO.length) return Response.json({ companies: curatedTO, from_cache: false, curated: true });
          return Response.json({ error: 'The job provider is taking too long to respond. Please try again in a moment.', upstream_timeout: true }, { status: 503 });
        }
        throw e;
      } finally {
        clearTimeout(timeout);
      }
    }
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[getLiveJobMatchesFn] Jobs API error ${apiRes.status}: ${errText.slice(0, 300)}`);
      // Backup source: scrape BuiltIn directly
      const backup = await tryBuiltinBackup(base44, searchTerm, isRemote, seeking);
      if (backup) return backup;
      // Ride out the outage: serve last cached leads (even if >24h old) if we have any.
      if (cacheMatches) {
        console.log(`[getLiveJobMatchesFn] Upstream ${apiRes.status} — serving ${cached.length} stale cached leads (same query)`);
        return Response.json({ companies: cached, from_cache: true, stale: true });
      }
      // No cache to fall back on — serve curated jobs so the cycle still completes.
      console.log(`[getLiveJobMatchesFn][EMPTY] role=${searchTerm} location=${location} query="${queryStr}" api_status=${apiRes.status} raw_postings=0`);
      const curatedErr = getCuratedFallback(searchTerm, location);
      if (curatedErr.length) return Response.json({ companies: curatedErr, from_cache: false, curated: true });
      return Response.json({ error: 'The job provider is temporarily unavailable. Please try again shortly.', upstream_status: apiRes.status }, { status: 503 });
    }
    const payload = await apiRes.json();
    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    console.log(`[getLiveJobMatchesFn] Jobs API returned ${jobs.length} real postings`);

    // Shuffle so each refresh returns a different subset
    const jobList = [...jobs];
    for (let i = jobList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [jobList[i], jobList[j]] = [jobList[j], jobList[i]];
    }

    // Normalize a raw JSearch posting into our company-shape, applying the junk
    // filters (domain employer names, aggregator titles) and the location match
    // that are common to both the strict and relaxed passes. Returns null if the
    // posting fails these shared gates.
    const normalizeJob = (job) => {
      const org = job.employer_name?.trim();
      const title = job.job_title?.trim();
      const url = job.job_apply_link || job.apply_options?.[0]?.apply_link;
      if (!org || !title || !url) return null;
      if (/\.(com|net|org|io|app|co|dev|xyz)\b/i.test(org) || /https?:\/\//i.test(org)) return null;
      if (/^[a-z]+$/.test(org) && org.length > 7) return null;
      if (/\bjobs\b/i.test(title) || /\|/.test(title) || /apply (today|now)/i.test(title)) return null;
      const locText = [job.job_city, job.job_state].filter(Boolean).join(', ')
        || (job.job_is_remote ? 'Remote' : (job.job_country || ''));
      if (!jobMatchesLocation(locText, prefCity, prefState)) return null;
      const postedDate = job.job_posted_at_datetime_utc || null;
      const salary = (job.job_min_salary || job.job_max_salary)
        ? `$${job.job_min_salary || '?'} - $${job.job_max_salary || '?'} ${job.job_salary_period || ''}`.trim()
        : null;
      return {
        name: org,
        job_title: title,
        hiring_description: job.job_description?.trim() || `${org} is hiring for ${title}.`,
        hiring_signal: hiringSignalFromDate(postedDate),
        job_url: url,
        industry: industries[0] || '',
        location: locText || location || '',
        salary_range: salary,
        posted_date: postedDate,
        logo_url: job.employer_logo || null,
        has_web_result: true,
        verified_posting: true,
        _isIntern: INTERN_TITLE_RE.test(title),
        _title: title,
        _exp: job.job_required_experience,
      };
    };

    // Entry-level gate. Strict mode prefers JSearch's structured experience data
    // and falls back to title keywords — the default for the feed. Relaxed mode
    // (used only when the strict pool is empty) blocks just unmistakably senior
    // titles (director/vp/chief/head/principal/architect) and drops the structured
    // experience requirement so coordinator/assistant/analyst/specialist roles
    // that lack experience data still surface. The Magic Moment must show a role.
    // Hard seniority block — applied in EVERY mode (strict, relaxed, permissive).
    // A thin market widens by geography, never by seniority. "Sr Manager, Software
    // Development" is the wrong hero for a student even if it's the only posting.
    // Kept in sync with the full seniority list: senior, sr., lead, manager, mgr,
    // supervisor, staff, director, vp, chief, head, principal, architect, etc.
    const HARD_SENIOR_RE = /\b(senior|sr\.?|lead|manager|mgr|supervisor|staff|director|vp|vice president|chief|head|principal|architect|executive|expert|experienced)\b|\b(ii|iii|iv|v)\b/i;
    const passesEntry = (c, relaxed) => {
      if (c._isIntern) return true;
      if (relaxed) return !(HARD_SENIOR_RE.test(c._title) && !ENTRY_TITLE_RE.test(c._title));
      return isEntryLevel({ job_required_experience: c._exp }, c._title);
    };

    // mode: 'strict' (structured experience + senior-title gate), 'relaxed'
    // (hard-senior title gate only, drops structured-experience requirement),
    // 'permissive' (same hard-senior gate as relaxed — NEVER promotes a senior
    // title to fill a thin pool). A thin market widens by geography
    // (metro → state → remote), never by seniority. "Sr Manager, Software
    // Development" is the wrong hero for a college kid even if it's the only
    // posting in Austin.
    const buildPool = (mode) => {
      const orgCounts = new Map();
      const pool = [];
      for (const job of jobList) {
        const c = normalizeJob(job);
        if (!c) continue;
        if (seeking === 'internship' && !c._isIntern) continue;
        if (seeking === 'fulltime' && c._isIntern) continue;
        if (mode === 'strict' && !passesEntry(c, false)) continue;
        // Relaxed AND permissive both apply the hard-senior gate — no mode
        // ever lets a senior/director/manager/VP/principal/lead title through.
        if ((mode === 'relaxed' || mode === 'permissive') && !passesEntry(c, true)) continue;
        const orgKey = c.name.toLowerCase();
        const count = orgCounts.get(orgKey) || 0;
        if (count >= MAX_PER_COMPANY) continue;
        orgCounts.set(orgKey, count + 1);
        const { _isIntern, _title, _exp, ...company } = c;
        pool.push(company);
      }
      return pool;
    };

    let allCompanies = buildPool('strict');
    console.log(`[getLiveJobMatchesFn] Built pool of ${allCompanies.length} verified real jobs (strict)`);

    // Never dead-end the Magic Moment on an empty pool. If strict entry-level
    // filtering removed everything, run a relaxed pass; if that is also empty,
    // run a permissive pass so any real, location-matched posting still surfaces.
    if (allCompanies.length === 0) {
      allCompanies = buildPool('relaxed');
      console.log(`[getLiveJobMatchesFn] Relaxed entry pass: ${allCompanies.length} jobs`);
    }
    if (allCompanies.length === 0) {
      allCompanies = buildPool('permissive');
      console.log(`[getLiveJobMatchesFn] Permissive pass: ${allCompanies.length} jobs`);
    }

    // GUARANTEED FALLBACK — the first Magic Moment must never ship an empty
    // "couldn't find a job" screen. If every live pass returned nothing, log the
    // empty search for diagnosis and serve curated real jobs for the target role
    // + market so the cycle always completes.
    if (allCompanies.length === 0) {
      console.log(`[getLiveJobMatchesFn][EMPTY] role=${rawTerm} location=${location} query="${queryStr}" api_status=200 raw_postings=${jobs.length} strict_pool=0 relaxed_pool=0 permissive_pool=0`);
      const curated = getCuratedFallback(rawTerm, location);
      if (curated.length > 0) {
        allCompanies = curated;
        console.log(`[getLiveJobMatchesFn] Curated fallback served: ${curated.length} jobs for ${rawTerm} in ${location}`);
      }
    }

    // Cache the FULL pool so Load More can paginate without re-fetching.
    // Best-effort only — a cache-write failure (e.g. auth/permission hiccup) must
    // NEVER crash the request and turn a healthy job fetch into a 500.
    try {
      await base44.asServiceRole.entities.User.update(user.id, {
        job_leads_cache: allCompanies,
        job_leads_cached_at: new Date().toISOString(),
        job_leads_cache_key: goalKey,
      });
    } catch (cacheErr) {
      console.warn(`[getLiveJobMatchesFn] Cache write skipped: ${cacheErr.message}`);
    }

    return Response.json({ companies: allCompanies, from_cache: false });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});