import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const codeCounts = {};
    const schoolCounts = {};

    for (const u of users) {
      const code = u.school_code || 'NONE';
      codeCounts[code] = (codeCounts[code] || 0) + 1;

      const school = u.school || 'NONE';
      schoolCounts[school] = (schoolCounts[school] || 0) + 1;
    }

    return Response.json({
      total: users.length,
      school_code_breakdown: codeCounts,
      school_field_breakdown: schoolCounts,
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});