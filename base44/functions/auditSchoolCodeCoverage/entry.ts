import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const personaKeys = ['student', 'alumni', 'parent', 'gator', 'no_persona'];
    const report = {};

    for (const key of personaKeys) {
      const group = key === 'no_persona'
        ? allUsers.filter(u => !u.persona)
        : allUsers.filter(u => u.persona === key);

      const withSchoolCode    = group.filter(u => !!u.school_code?.trim());
      const withoutSchoolCode = group.filter(u => !u.school_code?.trim());
      const withSchoolName    = withoutSchoolCode.filter(u => !!(u.school_name || u.school || u.university)?.trim());
      const withNothing       = withoutSchoolCode.filter(u => !(u.school_name || u.school || u.university)?.trim());

      report[key] = {
        total: group.length,
        with_school_code: withSchoolCode.length,
        missing_school_code: withoutSchoolCode.length,
        missing_but_has_school_name: withSchoolName.length,
        missing_and_has_nothing: withNothing.length,
      };
    }

    // Summary of all missing users (no sample truncation)
    const allMissing = allUsers
      .filter(u => !u.school_code?.trim())
      .map(u => ({
        email: u.email,
        persona: u.persona || null,
        school_code: u.school_code || null,
        school_name: u.school_name || null,
        school: u.school || null,
        university: u.university || null,
      }));

    return Response.json({
      grand_total: allUsers.length,
      total_with_school_code: allUsers.filter(u => !!u.school_code?.trim()).length,
      total_missing_school_code: allUsers.filter(u => !u.school_code?.trim()).length,
      by_persona: report,
      all_missing_users: allMissing,
    });
  } catch (e) {
    console.error('auditSchoolCodeCoverage error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});