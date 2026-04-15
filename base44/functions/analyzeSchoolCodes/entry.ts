import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    // Fix 1: Anyone with school_name 'University of Florida' but no school_code
    const ufByName = users.filter(u => 
      u.school_name?.toLowerCase().includes('university of florida') && 
      !u.school_code
    );

    // Fix 2: Anyone with school_code 'ufl' but no school_name
    const ufByCode = users.filter(u => 
      u.school_code === 'ufl' && !u.school_name
    );

    // Fix 3: The unknown users with UF signals
    const ufUnknown = users.filter(u =>
      !u.school_code && !u.school_name && (
        u.email?.toLowerCase().includes('@ufl.edu') ||
        u.invite_code_used?.toUpperCase?.().includes('UF') ||
        u.invite_code_used?.toUpperCase?.().includes('GATOR')
      )
    );

    // Total unknown with no UF signal
    const unknownNoSignal = users.filter(u => 
      !u.school_code && !u.school_name && 
      !u.email?.includes('@ufl.edu') && 
      !u.invite_code_used?.toUpperCase?.().includes('UF') &&
      !u.invite_code_used?.toUpperCase?.().includes('GATOR')
    );

    console.log('=== SCHOOL CODE ANALYSIS ===');
    console.log('UF by name (need school_code):', ufByName.length);
    console.log('UF by code (need school_name):', ufByCode.length);
    console.log('UF unknown (need both):', ufUnknown.length);
    console.log('Total unknown with no UF signal:', unknownNoSignal.length);

    return Response.json({
      success: true,
      analysis: {
        ufByNameCount: ufByName.length,
        ufByCodeCount: ufByCode.length,
        ufUnknownCount: ufUnknown.length,
        unknownNoSignalCount: unknownNoSignal.length,
        totalUsers: users.length,
        totalWithSchoolCode: users.filter(u => u.school_code).length,
        totalWithSchoolName: users.filter(u => u.school_name).length,
        totalUnknown: users.filter(u => !u.school_code && !u.school_name).length,
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});