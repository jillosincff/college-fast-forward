import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch only users missing school_code
    const usersWithoutCode = await base44.asServiceRole.entities.User.filter(
      { school_code: { $exists: false } },
      '-created_date',
      10000
    ) || [];

    const ufByNameCount = usersWithoutCode.filter(u => 
      u.school_name?.toLowerCase().includes('university of florida')
    ).length;

    const ufUnknownCount = usersWithoutCode.filter(u =>
      !u.school_name && (
        u.email?.toLowerCase?.().includes('@ufl.edu') ||
        u.invite_code_used?.toUpperCase?.().includes('UF') ||
        u.invite_code_used?.toUpperCase?.().includes('GATOR')
      )
    ).length;

    // Fetch users with school_code=ufl but no school_name
    const ufByCodeOnly = await base44.asServiceRole.entities.User.filter(
      { school_code: 'ufl', school_name: { $exists: false } },
      '-created_date',
      10000
    ) || [];

    return Response.json({
      success: true,
      analysis: {
        ufByNameCount,
        ufByCodeCount: ufByCodeOnly.length,
        ufUnknownCount,
        totalMissingCode: usersWithoutCode.length,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});