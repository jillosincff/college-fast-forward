import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_NAME_TO_CODE = {
  'ohio state university': 'osu',
  'university of southern california': 'usc',
  'university of michigan': 'umich',
  'university of central florida': 'ucf',
  'university of delaware': 'udel',
  'university of georgia': 'uga',
  'penn state university': 'psu',
  'pennsylvania state university': 'psu',
  'university of maryland': 'umd',
  'tulane university': 'tulane',
  'florida atlantic university': 'fau',
  'florida state university': 'fsu',
  'university of kentucky': 'uky',
  'james madison university': 'jmu',
  'university of miami': 'miami',
  'university of texas at austin': 'utexas',
  'university of florida': 'ufl',
  'university of florida ': 'ufl', // trailing space
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    let updated = 0;
    let skipped = 0;
    let errors = [];
    const bySchool = {};

    for (const u of allUsers) {
      // Skip if school_code already set correctly
      if (u.school_code) { skipped++; continue; }

      // Derive school_code from school_name / school / university fields
      const rawSchool = (u.school_name || u.school || u.university || '').toLowerCase().trim();
      if (!rawSchool) { skipped++; continue; }

      const code = SCHOOL_NAME_TO_CODE[rawSchool];
      if (!code) { skipped++; continue; }

      try {
        await base44.asServiceRole.entities.User.update(u.id, { school_code: code });
        updated++;
        bySchool[code] = (bySchool[code] || 0) + 1;
      } catch (err) {
        errors.push({ id: u.id, email: u.email, error: err.message });
      }

      // Small delay to avoid rate limits
      if (updated % 20 === 0) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    return Response.json({ success: true, updated, skipped, errors: errors.slice(0, 20), by_school: bySchool });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});