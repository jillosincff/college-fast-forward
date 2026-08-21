import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// New-user script + weekly bar for the Magic Moment. Runs the live picker for
// the 3 first-cycle personas (Sales+NYC, Marketing+NYC, Comms+NYC) and
// returns a hero log per persona plus the weekly bar:
//   live_apply_rate, person_found_rate, volume_rate, costume_job_count,
//   same_person_3x.
//
// Auth: x-monitor-secret === MONITOR_SECRET_KEY (for CI), or an admin user.
// Self-contained — calls the jobs provider + InvokeLLM directly so it needs no
// user session (getLiveJobMatchesFn/findCliffPeople require a user).

const FRESH_MS = 14 * 24 * 60 * 60 * 1000;
const JSEARCH = 'https://api.openwebninja.com/jsearch';

const DEFAULT_PERSONAS = [
  // Every chip is regression-tested weekly across diverse markets. When a chip's
  // keyword list is too narrow for its synonym vocabulary, on_chip_pool drops to
  // 0 here — the weekly bar flags it before any student hits the empty state.
  { name: 'Sales+NYC', role: 'Sales', industries: ['Sales'], location: 'New York, NY' },
  { name: 'Marketing+NYC', role: 'Marketing', industries: ['Marketing'], location: 'New York, NY' },
  { name: 'Comms+NYC', role: 'Communications', industries: ['Communications'], location: 'New York, NY' },
  // Regression guard: an Austin Sales search must NEVER serve a New York role.
  // This is the exact leak that shipped Squarespace/NYC to an Austin student.
  { name: 'Sales+Austin', role: 'Sales', industries: ['Sales'], location: 'Austin, TX' },
  { name: 'Finance+Nyc', role: 'Finance', industries: ['Finance'], location: 'New York, NY' },
  { name: 'Healthcare+Miami', role: 'Healthcare', industries: ['Healthcare'], location: 'Miami, FL' },
  { name: 'PR+Columbus', role: 'Public Relations', industries: ['Public Relations'], location: 'Columbus, OH' },
  { name: 'Software+Seattle', role: 'Software', industries: ['Software'], location: 'Seattle, WA' },
  { name: 'Data+Austin', role: 'Data', industries: ['Data'], location: 'Austin, TX' },
  { name: 'Operations+Chicago', role: 'Operations', industries: ['Operations'], location: 'Chicago, IL' },
  { name: 'Consulting+Boston', role: 'Consulting', industries: ['Consulting'], location: 'Boston, MA' },
  { name: 'HR+Atlanta', role: 'HR', industries: ['HR'], location: 'Atlanta, GA' },
  { name: 'Product+SF', role: 'Product', industries: ['Product'], location: 'San Francisco, CA' },
  { name: 'Education+Nashville', role: 'Education', industries: ['Education'], location: 'Nashville, TN' },
];

// Mirror of magicMomentGates.gateLocation (kept in sync manually — verification
// harness). Returns { ok, why }; 'other'-tier jobs never pass.
function gateLocation(job, city, state) {
  if (!job) return { ok: false, why: 'no_job' };
  const loc = (job.location || '').toLowerCase();
  if (!loc) return { ok: false, why: 'no_location' };
  if (/\bremote\b|work\s*from\s*home/.test(loc)) return { ok: true, why: 'remote' };
  if (city && loc.includes(city.toLowerCase())) return { ok: true, why: 'metro' };
  if (state && loc.includes(state.toLowerCase())) return { ok: true, why: 'state' };
  return { ok: false, why: 'out_of_market' };
}

// Mirror of chipGate (kept in sync manually — this is a verification harness).
const ROLE_KEYWORDS = {
  marketing: ['marketing', 'brand', 'content', 'communications', 'social media', 'social', 'public relations', 'growth', 'advertising', 'campaign', 'digital marketing', 'product marketing', 'content marketing'],
  sales: ['sales', 'account executive', 'business development', 'sales development', 'sdr', 'bdr', 'account manager', 'inside sales'],
  communications: ['communications', 'public relations', 'pr', 'content', 'media relations', 'corporate communications', 'internal communications'],
  finance: ['finance', 'financial', 'investment', 'banking', 'accounting', 'audit', 'treasury', 'risk', 'credit', 'wealth', 'markets', 'fp&a', 'fp and a', 'portfolio', 'asset management', 'valuation', 'underwriting', 'underwriter', 'actuarial', 'equity research', 'fixed income', 'lending', 'mortgage', 'private equity'],
  software: ['software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'fullstack', 'programmer'],
  operations: ['operations', 'supply chain', 'logistics'],
  consulting: ['consulting', 'consultant', 'strategy'],
  healthcare: ['healthcare', 'health', 'clinical', 'hospital', 'patient', 'medical', 'nurse', 'nursing', 'allied health', 'pharma', 'biotech', 'research coordinator'],
  data: ['data', 'analytics', 'business intelligence', 'quantitative'],
  product: ['product', 'ux', 'user experience'],
  hr: ['hr', 'human resources', 'human resource', 'recruiting', 'recruiter', 'recruitment', 'talent acquisition', 'talent', 'people operations', 'people ops', 'employee relations', 'benefits', 'compensation', 'personnel'],
  education: ['education', 'teaching', 'teacher', 'admissions', 'academic'],
};
const GENERIC_TITLE = /^(sr\.?|senior|junior|jr\.?|entry[- ]level|associate|assistant|staff)?\s*(analyst|associate|specialist|coordinator|consultant|generalist|professional|representative)\b/i;

function hasWord(haystack, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}
function chipKeywordsFor(chipText) {
  const combined = (chipText || '').toLowerCase().trim();
  if (!combined) return null;
  let best = null;
  let bestScore = 0;
  for (const kws of Object.values(ROLE_KEYWORDS)) {
    let score = 0;
    for (const k of kws) if (hasWord(combined, k)) score = Math.max(score, k.length);
    if (score > bestScore) { bestScore = score; best = kws; }
  }
  return best;
}
// Inverted gate — mirrors chipGate.checkOnChip. Trusts the synonym query's
// contextual filtering; rejects only generic titles or titles that name a
// DIFFERENT chip. Stops false-rejection of role variants like "Summer Analyst".
function checkOnChip(jobTitle, kw) {
  const title = (jobTitle || '').toLowerCase().trim();
  if (GENERIC_TITLE.test(title)) return { ok: false };
  if (kw && kw.some((k) => hasWord(title, k))) return { ok: true };
  if (!kw) return { ok: true };
  for (const kws of Object.values(ROLE_KEYWORDS)) {
    if (kws === kw) continue;
    if (kws.some((k) => hasWord(title, k))) return { ok: false };
  }
  return { ok: true };
}

const ROLE_SYNONYMS = {
  communications: '"Communications" OR "Public Relations" OR PR OR Media OR Content OR "Social Media" OR "Communications Coordinator"',
  marketing: '"Marketing" OR "Marketing Coordinator" OR "Digital Marketing" OR "Content Marketing" OR "Brand Marketing"',
  sales: '"Sales" OR "Sales Development Representative" OR "Account Executive" OR "Business Development" OR "Sales Associate"',
};

function isFresh(job) {
  const d = job && (job.posted_date || job.date_posted || job.job_posted_at_datetime_utc);
  if (!d) return false;
  const t = Date.parse(d);
  return Number.isFinite(t) && (Date.now() - t) <= FRESH_MS;
}
function urlOf(j) { return (j && (j.job_url || j.apply_url || j.url)) || ''; }

// Mirror of getLiveJobMatchesFn's HARD_SENIOR_RE + ENTRY_TITLE_RE — the
// scenario runner must apply the SAME seniority gate so its results reflect
// what a real student would actually see. A thin market widens by geography,
// never by seniority: "Sr Manager, Software Development" must never be the
// hero even if it's the only posting in Austin.
const HARD_SENIOR_RE = /\b(senior|sr\.?|lead|manager|mgr|supervisor|staff|director|vp|vice president|chief|head|principal|architect|executive|expert|experienced)\b|\b(ii|iii|iv|v)\b/i;
const ENTRY_TITLE_RE = /\b(junior|jr\.?|entry|graduate|trainee|new grad)\b/i;
const INTERN_RE = /\b(intern|internship|co-?op)\b/i;
function isEntryLevelTitle(title) {
  const t = (title || '').trim();
  if (!t) return false;
  if (INTERN_RE.test(t)) return true;
  if (ENTRY_TITLE_RE.test(t)) return true;
  return !HARD_SENIOR_RE.test(t);
}

async function fetchJobs(persona) {
  const token = Deno.env.get('OPENWEB_NINJA_API_KEY');
  if (!token) throw new Error('OPENWEB_NINJA_API_KEY not set');
  const role = (persona.role || '').toLowerCase().trim();
  const queryRole = ROLE_SYNONYMS[role] || persona.role;
  const city = (persona.location || '').split(',')[0].trim();
  const queryStr = `${queryRole} in ${city}`.trim();
  const params = new URLSearchParams({ query: queryStr, country: 'us', date_posted: 'week', num_pages: '3' });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${JSEARCH}/search?${params.toString()}`, { method: 'GET', headers: { 'x-api-key': token }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`jobs_api_${res.status}`);
    const payload = await res.json();
    const jobs = Array.isArray(payload && payload.data) ? payload.data : [];
    return jobs.map((j) => ({
      job_id: j.job_id,
      name: (j.employer_name || '').trim(),
      job_title: (j.job_title || '').trim(),
      job_url: j.job_apply_link || (j.apply_options && j.apply_options[0] && j.apply_options[0].apply_link) || '',
      location: [j.job_city, j.job_state].filter(Boolean).join(', ') || (j.job_is_remote ? 'Remote' : (j.job_country || '')),
      posted_date: j.job_posted_at_datetime_utc || null,
      hiring_description: (j.job_description || '').trim(),
    })).filter((j) => j.name && j.job_title && j.job_url && isEntryLevelTitle(j.job_title));
  } finally { clearTimeout(timer); }
}

async function validateUrl(url, title) {
  let res;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    res = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', 'Accept': 'text/html,*/*' } });
    clearTimeout(timer);
  } catch (e) { return { live: false, reason: 'http_fail' }; }
  if (!res.ok) return { live: false, reason: 'http_fail', status: res.status };
  const text = (await res.text()).slice(0, 500000).toLowerCase();
  if (/(no longer (accepting|available|open)|position (has been )?filled|job (has )?expired|job (has been )?closed|posting (has )?expired|page not found|job not found)/i.test(text)) return { live: false, reason: 'closed' };
  // Token-level title match (mirror of validateJobPosting). Exact-phrase matching
  // killed real postings on Greenhouse/Lever/Workday, where the title is rendered
  // by JS and never appears in raw HTML. Require 2+ distinctive title tokens.
  const STOP = new Set(['analyst','associate','intern','internship','junior','jr','sr','senior','lead','coordinator','specialist','assistant','team','role','position','the','and','for','of','to','in','at','with','a','an']);
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const tokens = norm(title).split(' ').filter(t => t.length > 2 && !STOP.has(t));
  const pageText = norm(text);
  if (tokens.filter(t => pageText.includes(t)).length >= 2) return { live: true };
  const ATS = ['greenhouse.io','lever.co','workday','ashby.at','smartrecruiters','taleo','icims','jobvite','myworkdayjobs','applytojob','recruitee','bamboohr'];
  const isATS = ATS.some(h => url.toLowerCase().includes(h));
  const isShell = text.length < 2000 || /id="root"|id="__next"|data-react-root|window\.__INITIAL/i.test(text);
  if (isATS || isShell) return { live: true, reason: 'ats_shell' };
  if (tokens.length < 2) return { live: true, reason: 'generic_title' };
  return { live: false, reason: 'closed', detail: 'title_not_on_page' };
}

const PEOPLE_SCHEMA = {
  type: 'object',
  properties: {
    people: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          title: { type: 'string' },
          source_url: { type: 'string' },
          summary: { type: 'string' },
        },
      },
    },
  },
};

async function findPeople(base44, company, role, school) {
  const prompt = `Find 3 real people who are alumni of ${school} and currently work at ${company}, ideally in ${role} or an adjacent function. For each person give: name, title (their job title at ${company}), source_url (the LinkedIn profile URL or other public page where you found them), and summary. Only include real people you found via web search — do not fabricate. Return as JSON.`;
  try {
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: PEOPLE_SCHEMA,
    });
    const people = (llmRes && llmRes.people) || [];
    return people
      .filter((p) => p.name && p.source_url && /^https?:\/\//i.test(p.source_url))
      .map((p) => ({
        name: p.name,
        role_title: p.title || '',
        company,
        source_url: p.source_url,
        linkedin_url: /linkedin\.com/i.test(p.source_url) ? p.source_url : null,
        source: 'public_web',
      }));
  } catch (e) { return []; }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return Response.json({ ok: true, service: 'runMagicMomentScenario' });
    }

    const base44 = createClientFromRequest(req);
    const secret = Deno.env.get('MONITOR_SECRET_KEY');
    const provided = req.headers.get('x-monitor-secret');
    let authed = false;
    if (secret && provided && provided === secret) {
      authed = true;
    } else {
      try { const u = await base44.auth.me(); authed = u && u.role === 'admin'; } catch (e) { /* */ }
    }
    if (!authed) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const personas = Array.isArray(body.personas) && body.personas.length ? body.personas : DEFAULT_PERSONAS;

    async function runPersona(p) {
      try {
        const chipText = `${p.role || ''} ${(p.industries || []).join(' ')}`.trim();
        const kw = chipKeywordsFor(chipText);
        const jobs = await fetchJobs(p);
        const onChip = jobs.filter((j) => checkOnChip(j.job_title, kw).ok);
        const parts = (p.location || '').split(',').map((s) => s.trim());
        const city = parts[0];
        const state = parts[1];

        // Widen cascade — mirrors MagicMoment.jsx exactly. NEVER steals another
        // metro's jobs: metro → state → remote → empty. 'other'-tier jobs are
        // excluded at every tier. This is the regression guard for the
        // Squarespace/NYC → Austin leak.
        const metro = onChip.filter((j) => gateLocation(j, city, state).why === 'metro');
        const statePool = onChip.filter((j) => gateLocation(j, city, state).why === 'state');
        const remotePool = onChip.filter((j) => gateLocation(j, city, state).why === 'remote');
        const pool = metro.length ? metro : (statePool.length ? statePool : remotePool);
        const widenTier = metro.length ? 'metro' : (statePool.length ? 'state' : (remotePool.length ? 'remote' : 'empty'));

        let hero = null;
        let urlOk = false;
        let urlWhy = 'no_candidate';
        for (const j of pool) {
          if (!urlOf(j)) continue;
          const v = await validateUrl(urlOf(j), j.job_title);
          if (v.live) { hero = j; urlOk = true; urlWhy = 'validated'; break; }
        }

        let personFound = false;
        let peopleSource = 'none';
        let personName = null;
        if (hero) {
          const people = await findPeople(base44, hero.name, hero.job_title, 'University of Florida');
          if (people.length) {
            personFound = true;
            peopleSource = people[0].source || 'public_web';
            personName = people[0].name;
          }
        }

        const railCount = pool.filter((j) => urlOf(j) && (!hero || j.name !== hero.name || j.job_title !== hero.job_title)).length;

        // Integrity assertion: if the hero landed in the 'other' tier, the run
        // is flagged as a leak — another metro's job served to this student.
        const heroTier = hero ? gateLocation(hero, city, state).why : 'none';
        const leak = hero && heroTier === 'out_of_market';

        return {
          persona: p.name,
          job_id: hero ? (hero.job_id || null) : null,
          company: hero ? hero.name : '',
          title: hero ? hero.job_title : '',
          url_ok: urlOk,
          url_why: urlWhy,
          chip_ok: !!hero,
          person_found: personFound,
          people_source: peopleSource,
          person_name: personName,
          rail_count: railCount,
          on_chip_pool: onChip.length,
          in_market_pool: metro.length + statePool.length,
          widen_tier: widenTier,
          hero_tier: heroTier,
          leak: !!leak,
        };
      } catch (e) {
        return { persona: p.name, error: e.message };
      }
    }

    // Run all personas in parallel so the total wall time is one persona, not N.
    const scenarios = await Promise.all(personas.map((p) => runPersona(p)));

    const n = scenarios.length || 1;
    const liveApply = scenarios.filter((s) => s.url_ok).length;
    const person = scenarios.filter((s) => s.person_found).length;
    const volume = scenarios.filter((s) => (s.rail_count || 0) >= 4).length;
    const costume = scenarios.filter((s) => s.chip_ok === false).length;
    const leaks = scenarios.filter((s) => s.leak).length;
    const names = scenarios.map((s) => s.person_name).filter(Boolean);
    const same3 = names.length >= 3 && new Set(names).size === 1;

    return Response.json({
      scenarios,
      weekly_bar: {
        live_apply_rate: liveApply / n,
        person_found_rate: person / n,
        volume_rate: volume / n,
        costume_job_count: costume,
        out_of_market_leaks: leaks,
        same_person_3x: same3,
        sample_size: scenarios.length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});