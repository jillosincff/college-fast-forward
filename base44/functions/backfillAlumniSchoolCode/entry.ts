import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Same mapping as lib/schoolNames.js
const SCHOOL_NAMES = {
  'university of florida': 'uf',
  'university of southern california': 'usc',
  'ohio state university': 'osu',
  'university of central florida': 'ucf',
  'university of michigan': 'umich',
  'university of delaware': 'udel',
  'university of georgia': 'uga',
  'penn state university': 'psu',
  'tulane university': 'tulane',
  'university of maryland': 'umd',
  'florida atlantic university': 'fau',
  'florida state university': 'fsu',
  'james madison university': 'jmu',
  'university of miami': 'miami',
  'university of texas': 'utexas',
  'university of kentucky': 'uky',
};

function inferSchoolCode(user) {
  // Try school_name, school, university fields in order
  const candidates = [user.school_name, user.school, user.university].filter(Boolean);
  for (const name of candidates) {
    const code = SCHOOL_NAMES[name.toLowerCase().trim()];
    if (code) return code;
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

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default true

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const alumni = allUsers.filter(u => u.persona === 'alumni' && !u.school_code);

    const updates = [];
    const unresolvable = [];

    for (const u of alumni) {
      const code = inferSchoolCode(u);
      if (code) {
        updates.push({ id: u.id, email: u.email, school_name: u.school_name || u.school, school_code: code });
      } else {
        unresolvable.push({ id: u.id, email: u.email, school_name: u.school_name || u.school || u.university || null });
      }
    }

    if (dryRun) {
      return Response.json({
        mode: 'dry_run',
        total_alumni: alumni.length,
        will_update: updates.length,
        unresolvable: unresolvable.length,
        updates_preview: updates.slice(0, 10),
        unresolvable_preview: unresolvable.slice(0, 10),
      });
    }

    // Full update
    let updated = 0, failed = 0;
    const errors = [];
    for (const u of updates) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, { school_code: u.school_code });
        updated++;
      } catch (e) {
        failed++;
        errors.push({ email: u.email, error: e.message });
      }
    }

    return Response.json({
      mode: 'full_update',
      total_alumni_missing_school_code: alumni.length,
      updated,
      failed,
      unresolvable: unresolvable.length,
      unresolvable_list: unresolvable,
      errors,
    });

  } catch (e) {
    console.error('backfillAlumniSchoolCode error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});