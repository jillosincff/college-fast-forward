import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
  const parents = allUsers.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent')));

  const noProfile = parents.filter(u => !u.onboarding_completed);
  const hasProfile = parents.filter(u => u.onboarding_completed);

  // School breakdown for incomplete parents
  const schoolCounts = {};
  for (const u of noProfile) {
    const school = u.school_name || u.school || u.school_code || 'unknown';
    schoolCounts[school] = (schoolCounts[school] || 0) + 1;
  }
  const schoolBreakdown = Object.entries(schoolCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([school, count]) => ({ school, count }));

  return Response.json({
    total_parents: parents.length,
    completed_onboarding: hasProfile.length,
    no_profile: noProfile.length,
    school_breakdown: schoolBreakdown,
    no_profile_list: noProfile.map(u => ({
      email: u.email,
      full_name: u.full_name,
      created_date: u.created_date,
      school: u.school_name || u.school || u.school_code || 'unknown',
    })),
  });
});