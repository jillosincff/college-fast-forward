import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Filter for USC users
    const uscUsers = allUsers.filter(u => {
      const code = u.school_code?.toLowerCase() || '';
      const name = u.school_name?.toLowerCase() || '';
      const school = u.school?.toLowerCase() || '';
      return code === 'usc' || name.includes('south carolina') || school.includes('south carolina');
    });

    // Break down by persona
    const parents = uscUsers.filter(u => u.persona === 'parent' || u.roles?.includes('parent'));
    const alumni = uscUsers.filter(u => u.persona === 'alumni' || u.roles?.includes('alumni'));
    const students = uscUsers.filter(u => ['student', 'gator'].includes(u.persona) || u.roles?.includes('student') || u.roles?.includes('gator'));

    // Check for missing data
    const missingPersona = uscUsers.filter(u => !u.persona || (Array.isArray(u.roles) && u.roles.length === 0));
    const missingSchoolCode = uscUsers.filter(u => !u.school_code);

    return Response.json({
      total: uscUsers.length,
      byPersona: {
        parents: parents.length,
        alumni: alumni.length,
        students: students.length,
      },
      dataQuality: {
        missingPersona: missingPersona.length,
        missingSchoolCode: missingSchoolCode.length,
      },
      samples: {
        parentSample: parents.slice(0, 3).map(u => ({ email: u.email, fullName: u.full_name, persona: u.persona, schoolCode: u.school_code })),
        alumniSample: alumni.slice(0, 3).map(u => ({ email: u.email, fullName: u.full_name, persona: u.persona, schoolCode: u.school_code })),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});