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
  const NORMALIZE_SIZE = { startup:'startup', mid:'mid', midmarket:'mid', large:'large', enterprise:'large' };
  const sizeList = (Array.isArray(companySizes) ? companySizes : (companySizes ? [companySizes] : []))
    .map(s => NORMALIZE_SIZE[String(s).toLowerCase()]).filter(Boolean);
  const strictSize = sizeList.length === 1 ? sizeList[0] : null;

  const roleDesc = role || '';
  const params = new URLSearchParams({
    time_frame: '7d', limit: '100',
    include_basic_organization_details: 'true',
    title_advanced: buildTitleQuery(roleDesc, seeking),
  });
  const locQuery = buildLocationQuery(location);
  if (locQuery) params.set('location', locQuery);

  const locParts = (location && !/remote/i.test(location)) ? location.split(',').map(p => p.trim()).filter(Boolean) : [];
  const prefCity = locParts[0] || null;
  const prefState = STATE_NAMES[locParts[1]?.toUpperCase().slice(0, 2)] || null;

  const apiRes = await fetch(`https://data.fantastic.jobs/v1/active-ats?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!apiRes.ok) throw new Error(`Fantastic Jobs API ${apiRes.status}`);
  const jobs = await apiRes.json();
  console.log(`[getDailyDrop] Fantastic Jobs returned ${Array.isArray(jobs) ? jobs.length : 0} raw postings`);

  const seenOrgs = new Set();
  const companies = [];
  for (const job of (Array.isArray(jobs) ? jobs : [])) {
    const org = job.organization;
    const title = job.title?.trim();
    if (!org || !title || !job.url) continue;
    const isIntern = INTERN_RE.test(title);
    if (!isIntern && SENIOR_RE.test(title)) continue;
    if (seeking === 'internship' && !isIntern) continue;
    if (seeking === 'fulltime' && isIntern) continue;
    const exp = job.ai_experience_level;
    const entryTitle = isIntern || /junior|coordinator|entry|graduate|trainee|new grad|assistant|analyst/i.test(title);
    if (exp && exp !== '0-2' && !entryTitle) continue;
    if (!jobMatchesLocation(job, prefCity, prefState)) continue;
    if (job.org_linkedin_recruitment_agency_derived === true) continue;
    const size = sizeFromHeadcount(job.org_linkedin_headcount);
    if (strictSize && size && size !== strictSize) continue;
    if (strictSize && !size) continue;
    const orgKey = org.toLowerCase();
    if (seenOrgs.has(orgKey)) continue;
    seenOrgs.add(orgKey);
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

    // Strict size pref → only the chosen tier is searched. 'all' = no constraint.
    const sizeMap = {
      startup: ['startup'],
      midmarket: ['mid'],
      mid: ['mid'],
      enterprise: ['large'],
      large: ['large'],
    };
    const sizeArray = sizeMap[sizePref] || ['large', 'mid', 'startup'];

    // Slots 1–5: Live results directly from Fantastic Jobs API
    let liveSlots = [];
    const apiKey = Deno.env.get('FANTASTIC_JOBS_API_KEY');
    if (apiKey && (targetRole || targetIndustries.length > 0)) {
      try {
        const role = targetRole || `${targetIndustries[0]} analyst`;
        const companies = await Promise.race([
          fetchLiveJobs({ role, location, companySizes: sizeArray, seeking, apiKey, maxCompanies: dailyLimit }),
          new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 25000)),
        ]);
        const freshFirst = [...companies.filter(c => !isSeen(c.name)), ...companies.filter(c => isSeen(c.name))];
        liveSlots = freshFirst.map(c => ({
          company: c.name,
          role: c.job_title || role,
          jobDescription: c.hiring_description || `${c.name} is actively hiring for ${role} roles.`,
          jobSource: c.job_url || `${c.name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
          jobSourceCategory: 'A',
          companyTier: c.size === 'startup' ? 3 : c.size === 'mid' ? 2 : 1,
          isLiveResult: true,
          slotType: 'live',
          leadTier: 'target',
          alumniCount: 0,
          parentCount: 0,
          salary_range: c.salary_range || null,
          location: c.location || null,
          posted_date: c.posted_date || null,
        }));
        console.log(`[getDailyDrop] Live slots: ${liveSlots.length}`);
      } catch (e) {
        console.warn('[getDailyDrop] Live fetch failed:', e.message);
      }
    }

    // ── Pre-compute alumni counts from DiscoveredAlumni cache ──────────────
    const schoolCode = user.school_code || '';
    const alumniCountMap = {};
    if (liveSlots.length > 0 && schoolCode) {
      try {
        const companyNames = liveSlots.map(s => s.company);
        // Fetch alumni records for these companies in one call
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

    // Assemble final slots — live results first, no curated sub-function needed
    const slots = liveSlots.slice(0, dailyLimit).map(enrichWithAlumni);

    // Ensure at least 10 slots — pad from fallback if needed
    if (slots.length < Math.min(dailyLimit, 10)) {
      const internFallbackSlots = [
        { company: 'Deloitte', role: 'Summer Scholar Intern', jobDescription: 'Consulting and advisory internship program across all US offices.', jobSource: 'deloitte.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Google', role: 'STEP Intern', jobDescription: 'Summer internship program for first and second-year students.', jobSource: 'careers.google.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'JPMorgan Chase', role: 'Summer Analyst Intern', jobDescription: 'Summer analyst internship across banking, markets, and operations.', jobSource: 'careers.jpmorgan.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nike', role: 'Marketing Intern', jobDescription: 'Brand and digital marketing internships for students.', jobSource: 'jobs.nike.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Salesforce', role: 'Futureforce Intern', jobDescription: 'Summer internship program blending tech, business, and customer strategy.', jobSource: 'salesforce.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Procter & Gamble', role: 'Brand Management Intern', jobDescription: 'Summer internship in CPG brand-building with real project ownership.', jobSource: 'pgcareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
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
      ];
      // Match the student's seeking intent — internship seekers must NEVER see full-time fallbacks
      const fallbackSlots = seeking === 'internship' ? internFallbackSlots
        : seeking === 'fulltime' ? fulltimeFallbackSlots
        : [...internFallbackSlots.slice(0, 3), ...fulltimeFallbackSlots];
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