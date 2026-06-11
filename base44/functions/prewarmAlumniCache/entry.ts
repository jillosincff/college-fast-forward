import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Nightly Alumni Cache Pre-Warm
 * Builds the alumni database proactively instead of waiting for students to search.
 *
 * Priority order:
 *   1. AlumniSearchMiss records (companies students searched and got zero results)
 *   2. Most-targeted companies from NetworkingPipeline + FollowedCompany that
 *      have no DiscoveredAlumni coverage yet for that school
 *
 * Runs up to MAX_SEARCHES Exa searches per run to control cost.
 * Admin-only — designed to run as a scheduled automation.
 */

const MAX_SEARCHES = 10;

function normCompany(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function schoolMatchesResult(result, userSchool, userSchoolCode) {
  const schoolLower = (userSchool || '').toLowerCase().trim();
  const codeLower = (userSchoolCode || '').toLowerCase().trim();
  if (!schoolLower && !codeLower) return false;

  const matchesString = (str) => {
    if (!str) return false;
    const lower = str.toLowerCase();
    if (schoolLower && lower.includes(schoolLower)) return true;
    if (codeLower.length >= 2 && new RegExp(`\\b${codeLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(str)) return true;
    return false;
  };

  const person = (result.entities || []).find(e => e.type === 'person');
  const eduHistory = person?.properties?.educationHistory || [];
  if (eduHistory.length > 0) {
    return eduHistory.some(e => matchesString(e.institution?.name));
  }
  const haystack = [result.title || '', result.text || '', ...(result.highlights || [])].join(' ');
  return matchesString(haystack);
}

async function searchAlumni(exaKey, schoolName, schoolCode, companyName) {
  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'x-api-key': exaKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `${schoolName} alumni at ${companyName}`,
      category: 'people',
      type: 'auto',
      numResults: 15,
      contents: { text: { maxCharacters: 400 } },
    }),
  });
  if (!res.ok) throw new Error(`Exa API returned ${res.status}`);
  const data = await res.json();

  const rawResults = (data.results || []).filter(r => /linkedin\.com\/in\/[^/?]+/.test(r.url || ''));
  const results = rawResults.filter(r => schoolMatchesResult(r, schoolName, schoolCode));

  return results.slice(0, 5).map(result => {
    const person = (result.entities || []).find(e => e.type === 'person');
    const props = person?.properties || {};
    const titleRaw = (result.title || '').replace(/^#+\s*/, '').trim();
    const urlSlugMatch = result.url?.match(/\/in\/([^/?]+)/);
    const name = props.name
      || (titleRaw && titleRaw.length > 2 ? titleRaw : null)
      || (urlSlugMatch ? urlSlugMatch[1].replace(/-\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'LinkedIn Professional');
    const currentWork = (props.workHistory || []).find(w => !w.dates?.to);
    const matchingEdu = (props.educationHistory || []).find(e => {
      const inst = (e.institution?.name || '').toLowerCase();
      return inst && (inst.includes(schoolName.toLowerCase()) || (schoolCode && new RegExp(`\\b${schoolCode.toLowerCase()}\\b`, 'i').test(e.institution.name)));
    });

    return {
      school_code: schoolCode,
      verified: false,
      role_title: currentWork?.title || null,
      match_score: 85,
      source_url: result.url || '',
      name,
      degree_info: matchingEdu ? [matchingEdu.degree, matchingEdu.institution?.name].filter(Boolean).join(', ') : '',
      company: companyName,
      location: 'Unknown',
      linkedin_url: result.url || '',
      description: 'Pre-seeded via nightly alumni cache warm-up',
    };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin' && !user?.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) {
      return Response.json({ error: 'EXA_API_KEY not configured' }, { status: 503 });
    }

    // ── Build candidate list: (company, school_code, school_name) ──────────

    // 1. Highest priority: known zero-result searches (most-searched first)
    const misses = await base44.asServiceRole.entities.AlumniSearchMiss.filter({ resolved: false }, '-search_count', 100);
    const candidates = [];
    const seen = new Set();
    for (const m of (misses || [])) {
      const key = `${m.school_code}::${normCompany(m.company)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ company: m.company, school_code: m.school_code, school_name: m.school_name || '', source: 'miss' });
    }

    // 2. Most-targeted companies from pipelines + followed companies
    const [pipelines, followed] = await Promise.all([
      base44.asServiceRole.entities.NetworkingPipeline.list('-created_date', 500),
      base44.asServiceRole.entities.FollowedCompany.list('-created_date', 500),
    ]);

    // Map student emails → school info (one bulk lookup)
    const emails = [...new Set([
      ...(pipelines || []).map(p => p.user_email),
      ...(followed || []).map(f => f.student_email),
    ].filter(Boolean))];
    const schoolByEmail = {};
    if (emails.length > 0) {
      const users = await base44.asServiceRole.entities.User.filter({ email: { $in: emails.slice(0, 200) } }, undefined, 200);
      for (const u of (users || [])) {
        const code = u.school_code || u.data?.school_code;
        const name = u.school_name || u.school || u.data?.school_name || u.data?.school;
        if (code) schoolByEmail[u.email] = { code, name: name || '' };
      }
    }

    // Count demand per (school, company)
    const demand = {};
    const addDemand = (company, email) => {
      const school = schoolByEmail[email];
      if (!company || !school) return;
      const key = `${school.code}::${normCompany(company)}`;
      if (!demand[key]) demand[key] = { company, school_code: school.code, school_name: school.name, count: 0 };
      demand[key].count++;
    };
    for (const p of (pipelines || [])) addDemand(p.company, p.user_email);
    for (const f of (followed || [])) addDemand(f.company_name, f.student_email);

    const demandList = Object.entries(demand)
      .filter(([key]) => !seen.has(key))
      .map(([, v]) => v)
      .sort((a, b) => b.count - a.count);
    for (const d of demandList) {
      candidates.push({ company: d.company, school_code: d.school_code, school_name: d.school_name, source: 'demand' });
    }

    // ── Filter out companies that already have alumni coverage ─────────────
    const coverageBySchool = {};
    const toSearch = [];
    for (const c of candidates) {
      if (toSearch.length >= MAX_SEARCHES) break;
      if (!c.school_name) continue; // can't run a verified search without the school name
      if (!coverageBySchool[c.school_code]) {
        coverageBySchool[c.school_code] = await base44.asServiceRole.entities.DiscoveredAlumni.filter({ school_code: c.school_code }, undefined, 500);
      }
      const clean = normCompany(c.company);
      const covered = (coverageBySchool[c.school_code] || []).some(a => {
        const ac = normCompany(a.company);
        return ac && (ac.includes(clean) || clean.includes(ac));
      });
      if (!covered) toSearch.push(c);
    }

    // ── Run the searches ────────────────────────────────────────────────────
    let seeded = 0;
    const results = [];
    for (const c of toSearch) {
      try {
        const alumni = await searchAlumni(EXA_API_KEY, c.school_name, c.school_code, c.company);
        if (alumni.length > 0) {
          await base44.asServiceRole.entities.DiscoveredAlumni.bulkCreate(alumni);
          seeded += alumni.length;
          // Resolve the miss record if there was one
          const missRecs = await base44.asServiceRole.entities.AlumniSearchMiss.filter({ school_code: c.school_code, company: c.company, resolved: false });
          for (const m of (missRecs || [])) {
            await base44.asServiceRole.entities.AlumniSearchMiss.update(m.id, { resolved: true });
          }
          results.push({ company: c.company, school: c.school_code, found: alumni.length, source: c.source });
        } else {
          results.push({ company: c.company, school: c.school_code, found: 0, source: c.source });
        }
        console.log(`[prewarmAlumniCache] ${c.company} (${c.school_code}): ${alumni.length} alumni`);
      } catch (e) {
        console.warn(`[prewarmAlumniCache] Search failed for ${c.company}: ${e.message}`);
      }
    }

    console.log(`[prewarmAlumniCache] Searched ${toSearch.length} companies, seeded ${seeded} alumni`);
    return Response.json({ success: true, searched: toSearch.length, alumni_seeded: seeded, results });

  } catch (error) {
    console.error('[prewarmAlumniCache] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});