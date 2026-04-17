import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Same alias/canonical maps as backfillAlumniSchoolCode
const NAME_TO_CODE = {
  'university of florida': 'uf', 'university of southern california': 'usc',
  'ohio state university': 'osu', 'ohio state': 'osu',
  'university of central florida': 'ucf', 'university of michigan': 'umich',
  'university of delaware': 'udel', 'university of georgia': 'uga',
  'penn state university': 'psu', 'pennsylvania state university': 'psu', 'penn state': 'psu',
  'tulane university': 'tulane', 'university of maryland': 'umd',
  'florida atlantic university': 'fau', 'florida state university': 'fsu',
  'james madison university': 'jmu', 'university of miami': 'miami',
  'university of texas': 'utexas', 'university of texas at austin': 'utexas',
  'university of kentucky': 'uky',
};
const ALIAS_TO_CODE = {
  'uf': 'uf', 'ufl': 'uf', 'usc': 'usc', 'osu': 'osu', 'ucf': 'ucf',
  'umich': 'umich', 'udel': 'udel', 'uga': 'uga', 'psu': 'psu',
  'tulane': 'tulane', 'umd': 'umd', 'fau': 'fau', 'fsu': 'fsu',
  'jmu': 'jmu', 'miami': 'miami', 'utexas': 'utexas', 'ut austin': 'utexas',
  'uky': 'uky', 'uk': 'uky',
};

function resolveSchoolCode(user) {
  const candidates = [user.school_name, user.school, user.university].filter(Boolean);
  for (const raw of candidates) {
    const n = raw.toLowerCase().trim();
    if (NAME_TO_CODE[n]) return { code: NAME_TO_CODE[n], via: 'canonical' };
    if (ALIAS_TO_CODE[n]) return { code: ALIAS_TO_CODE[n], via: 'alias' };
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const missing = allUsers.filter(u => !u.school_code?.trim());

    const catA = [], catB = [], catC = [];
    for (const u of missing) {
      const hasData = !!(u.school_name || u.school || u.university)?.trim();
      if (!hasData) {
        catC.push({ email: u.email, persona: u.persona || null, created_date: u.created_date });
        continue;
      }
      const raw = [u.school_name, u.school, u.university].filter(Boolean)[0];
      const result = resolveSchoolCode(u);
      if (!result) {
        catA.push({ email: u.email, persona: u.persona || null, raw_school_value: raw, resolved_code: null, action: 'UNRESOLVABLE' });
      } else if (result.via === 'canonical') {
        catB.push({ email: u.email, persona: u.persona || null, raw_school_value: raw, resolved_code: result.code, action: 'SAFE_TO_BACKFILL' });
      } else {
        catA.push({ email: u.email, persona: u.persona || null, raw_school_value: raw, resolved_code: result.code, action: 'ALIAS_MATCH_NEEDS_CONFIRMATION' });
      }
    }

    return Response.json({ catA, catB, catC });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});