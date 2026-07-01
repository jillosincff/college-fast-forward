import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public teaser endpoint for the landing page. Returns NO names / PII —
// only company + generic role for blurred "warm match" preview cards.
const SCHOOL_MAP = [
  { code: 'UF', names: ['uf', 'university of florida', 'florida', 'gators'] },
  { code: 'USC', names: ['usc', 'south carolina', 'university of south carolina', 'gamecocks'] },
  { code: 'UCF', names: ['ucf', 'central florida', 'university of central florida'] },
  { code: 'TULANE', names: ['tulane', 'tulane university'] },
  { code: 'OSU', names: ['osu', 'ohio state', 'the ohio state university', 'buckeyes'] },
  { code: 'UDEL', names: ['udel', 'delaware', 'university of delaware'] },
  { code: 'UMICH', names: ['umich', 'michigan', 'university of michigan', 'wolverines'] },
  { code: 'UGA', names: ['uga', 'georgia', 'university of georgia', 'bulldogs'] },
  { code: 'PSU', names: ['psu', 'penn state', 'pennsylvania state university'] },
  { code: 'UMD', names: ['umd', 'maryland', 'university of maryland', 'terps'] },
  { code: 'FAU', names: ['fau', 'florida atlantic'] },
  { code: 'FSU', names: ['fsu', 'florida state', 'seminoles'] },
  { code: 'JMU', names: ['jmu', 'james madison'] },
  { code: 'UKY', names: ['uky', 'kentucky', 'university of kentucky'] },
  { code: 'MIAMI', names: ['miami', 'university of miami', 'umiami'] },
];

function resolveSchoolCode(input) {
  const q = String(input || '').toLowerCase().trim();
  if (!q) return null;
  // Exact code match first
  const direct = SCHOOL_MAP.find(s => s.code.toLowerCase() === q);
  if (direct) return direct.code;
  // Name contains match
  const byName = SCHOOL_MAP.find(s => s.names.some(n => q === n || q.includes(n) || n.includes(q)));
  return byName ? byName.code : null;
}

function cleanRole(role) {
  const r = String(role || '').trim();
  if (!r || r.length > 60 || /^professional$/i.test(r) || /^n\/?a$/i.test(r)) return null;
  return r;
}

function cleanCompany(company) {
  const c = String(company || '').trim();
  if (!c || /^n\/?a$/i.test(c) || c.length > 50) return null;
  // Skip low-signal entries so the teaser always shows credible employers
  if (/college fast forward|self.?employed|self employed|freelance|photographer|retired|stay.?at.?home|n\/a/i.test(c)) return null;
  return c;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { school } = await req.json().catch(() => ({}));
    const schoolCode = resolveSchoolCode(school);

    if (!schoolCode) {
      // Demand signal: log which schools visitors search that we don't cover yet
      base44.asServiceRole.entities.AnalyticsEvent.create({
        event_name: 'teaser_school_miss',
        user_id: 'anonymous_visitor',
        properties: { school_query: String(school || '').slice(0, 100), reason: 'unrecognized_school' },
      }).catch(() => {});
      return Response.json({ found: false, count: 0 });
    }

    const profiles = await base44.asServiceRole.entities.ParentNetworkProfile.filter(
      { school_code: schoolCode, is_active: true }, '-created_date', 200
    );

    if (profiles.length === 0) {
      // Recognized school but no network yet — highest-value recruiting signal
      base44.asServiceRole.entities.AnalyticsEvent.create({
        event_name: 'teaser_school_miss',
        user_id: 'anonymous_visitor',
        school_code: schoolCode,
        properties: { school_query: String(school || '').slice(0, 100), reason: 'no_network' },
      }).catch(() => {});
    }

    // Build up to 3 anonymized preview matches with real companies
    const seen = new Set();
    const matches = [];
    for (const p of profiles) {
      const company = cleanCompany(p.company_name);
      if (!company || seen.has(company.toLowerCase())) continue;
      seen.add(company.toLowerCase());
      matches.push({
        company,
        role: cleanRole(p.role_title) || 'Professional connector',
        persona: p.persona === 'alumni' ? 'Alum' : 'Parent',
      });
      if (matches.length >= 3) break;
    }

    return Response.json({
      found: true,
      school_code: schoolCode,
      count: profiles.length,
      matches,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});