import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const tulaneUsers = allUsers.filter(u => u.school_code === 'tulane');

    const parents = tulaneUsers.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent')));
    const alumni = tulaneUsers.filter(u => u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni')));
    const students = tulaneUsers.filter(u => ['student', 'gator'].includes(u.persona) || (Array.isArray(u.roles) && (u.roles.includes('student') || u.roles.includes('gator'))));

    return Response.json({
      success: true,
      total: tulaneUsers.length,
      parents: {
        count: parents.length,
        expected: 4,
        match: parents.length === 4
      },
      alumni: {
        count: alumni.length,
        expected: 6,
        match: alumni.length === 6
      },
      students: students.length,
      parentSample: parents.slice(0, 3).map(u => ({ email: u.email, name: u.full_name, onboarding: u.onboarding_completed })),
      alumniSample: alumni.slice(0, 3).map(u => ({ email: u.email, name: u.full_name, onboarding: u.onboarding_completed }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});