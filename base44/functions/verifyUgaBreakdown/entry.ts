import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const ugaUsers = allUsers.filter(u => u.school_code === 'uga');

    const parents = ugaUsers.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent')));
    const alumni = ugaUsers.filter(u => u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni')));
    const students = ugaUsers.filter(u => ['student', 'gator'].includes(u.persona) || (Array.isArray(u.roles) && (u.roles.includes('student') || u.roles.includes('gator'))));

    return Response.json({
      success: true,
      total: ugaUsers.length,
      parents: {
        count: parents.length,
        expected: 24,
        match: parents.length === 24
      },
      alumni: {
        count: alumni.length,
        expected: 2,
        match: alumni.length === 2
      },
      students: students.length,
      parentSample: parents.slice(0, 3).map(u => ({ email: u.email, name: u.full_name, onboarding: u.onboarding_completed })),
      alumniSample: alumni.slice(0, 3).map(u => ({ email: u.email, name: u.full_name, onboarding: u.onboarding_completed }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});