import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
  const parents = allUsers.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent')));

  // Show ALL distinct school field values across ALL parents (raw, unmerged)
  const rawSchoolValues = {};
  for (const u of parents) {
    const raw = JSON.stringify({
      school_name: u.school_name || null,
      school: u.school || null,
      school_code: u.school_code || null,
      university: u.university || null,
    });
    rawSchoolValues[raw] = (rawSchoolValues[raw] || 0) + 1;
  }

  // Find anything that looks like South Carolina / USC
  const scUsers = parents.filter(u => {
    const fields = [u.school_name, u.school, u.school_code, u.university].join(' ').toLowerCase();
    return fields.includes('carolina') || fields.includes('usc') || fields.includes('south carolina');
  });

  return Response.json({
    total_parents: parents.length,
    sc_related_count: scUsers.length,
    sc_users_sample: scUsers.slice(0, 10).map(u => ({
      email: u.email,
      full_name: u.full_name,
      school_name: u.school_name,
      school: u.school,
      school_code: u.school_code,
      university: u.university,
      onboarding_completed: u.onboarding_completed,
      visible_in_directory: u.visible_in_directory,
    })),
    all_raw_school_combos: Object.entries(rawSchoolValues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([combo, count]) => ({ combo: JSON.parse(combo), count })),
  });
});