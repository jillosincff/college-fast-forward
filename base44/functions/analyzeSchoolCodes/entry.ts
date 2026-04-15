import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Use a timeout wrapper
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Get all users with pagination
      const users = await base44.asServiceRole.entities.User.list();

      clearTimeout(timeoutId);

      // Fix 1: Anyone with school_name 'University of Florida' but no school_code
      const ufByName = (users || []).filter(u => 
        u.school_name?.toLowerCase().includes('university of florida') && 
        !u.school_code
      );

      // Fix 2: Anyone with school_code 'ufl' but no school_name
      const ufByCode = (users || []).filter(u => 
        u.school_code === 'ufl' && !u.school_name
      );

      // Fix 3: The unknown users with UF signals
      const ufUnknown = (users || []).filter(u =>
        !u.school_code && !u.school_name && (
          u.email?.toLowerCase?.().includes('@ufl.edu') ||
          u.invite_code_used?.toUpperCase?.().includes('UF') ||
          u.invite_code_used?.toUpperCase?.().includes('GATOR')
        )
      );

      console.log('Analysis complete');
      return Response.json({
        success: true,
        analysis: {
          ufByNameCount: ufByName.length,
          ufByCodeCount: ufByCode.length,
          ufUnknownCount: ufUnknown.length,
          totalUsers: (users || []).length,
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return Response.json({ error: 'Request timed out after 15s' }, { status: 408 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
});