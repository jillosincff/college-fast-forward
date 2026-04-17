import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// The canonical set of schools we officially support
const KNOWN_CODES = new Set([
  'uf', 'usc', 'osu', 'ucf', 'umich', 'udel', 'uga', 'psu',
  'tulane', 'umd', 'fau', 'fsu', 'jmu', 'miami', 'utexas', 'uky',
]);

// Same reverse map used in deriveSchoolCode — everything that resolves to a known code
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
  'uf': 'uf', 'ufl': 'uf', 'usc': 'usc', 'osu': 'osu', 'ucf': 'ucf',
  'umich': 'umich', 'udel': 'udel', 'uga': 'uga', 'psu': 'psu',
  'tulane': 'tulane', 'umd': 'umd', 'fau': 'fau', 'fsu': 'fsu',
  'jmu': 'jmu', 'miami': 'miami', 'utexas': 'utexas', 'ut austin': 'utexas',
  'uky': 'uky', 'uk': 'uky',
};

function isKnownSchool(user) {
  // If they already have a valid school_code, they're known
  if (user.school_code && KNOWN_CODES.has(user.school_code.toLowerCase().trim())) return true;
  // Try to derive from name fields
  const candidates = [user.school_name, user.school, user.university].filter(Boolean);
  for (const raw of candidates) {
    const n = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    if (NAME_TO_CODE[n]) return true;
  }
  return false;
}

function getBestSchoolValue(user) {
  return (user.school_name || user.school || user.university || '').trim().replace(/\s+/g, ' ');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const unmapped = [];
    const noSchoolData = [];

    for (const u of allUsers) {
      const schoolValue = getBestSchoolValue(u);
      if (!schoolValue) {
        noSchoolData.push({ email: u.email, persona: u.persona || null });
        continue;
      }
      if (!isKnownSchool(u)) {
        unmapped.push({
          school: schoolValue,
          persona: u.persona || null,
          school_code_on_record: u.school_code || null,
        });
      }
    }

    // Aggregate by school name
    const schoolCounts = {};
    for (const u of unmapped) {
      const key = u.school;
      if (!schoolCounts[key]) {
        schoolCounts[key] = { school: key, count: 0, personas: {}, has_code_on_record: false };
      }
      schoolCounts[key].count++;
      schoolCounts[key].personas[u.persona || 'no_persona'] = (schoolCounts[key].personas[u.persona || 'no_persona'] || 0) + 1;
      if (u.school_code_on_record) schoolCounts[key].has_code_on_record = true;
    }

    const ranked = Object.values(schoolCounts).sort((a, b) => b.count - a.count);

    return Response.json({
      summary: {
        total_users: allUsers.length,
        users_at_known_schools: allUsers.length - unmapped.length - noSchoolData.length,
        users_at_unmapped_schools: unmapped.length,
        users_with_no_school_data: noSchoolData.length,
        distinct_unmapped_schools: ranked.length,
      },
      unmapped_schools_ranked: ranked,
    });

  } catch (e) {
    console.error('auditUnmappedSchools error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});