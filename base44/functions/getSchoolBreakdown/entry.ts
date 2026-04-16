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
    const allUsers = await base44.asServiceRole.entities.User.list();

    const schoolDisplayNames = {
      'ufl': 'University of Florida',
      'fsu': 'Florida State University',
      'usf': 'University of South Florida',
      'ucf': 'University of Central Florida',
      'um': 'University of Miami',
      'fiu': 'Florida International University',
    };

    // Group by school — prefer university field (most accurate), fall back to school_code
    const schoolMap = {};
    (allUsers || []).forEach(u => {
      // Use `university` as the most reliable field (set during onboarding from user input)
      // Fall back to school_code display name, then school_name, then unknown
      let rawSchool;
      if (u.university && u.university.trim()) {
        rawSchool = u.university.trim();
      } else if (u.school_code) {
        rawSchool = schoolDisplayNames[u.school_code] || u.school_code;
      } else if (u.school_name && u.school_name.trim()) {
        rawSchool = u.school_name.trim();
      } else {
        rawSchool = 'Unknown';
      }
      const school = schoolDisplayNames[rawSchool] || rawSchool;
      if (!schoolMap[school]) {
        schoolMap[school] = { count: 0, personas: { gator: 0, student: 0, parent: 0, alumni: 0, unknown: 0 } };
      }
      schoolMap[school].count++;
      
      const persona = u.persona || 'unknown';
      if (schoolMap[school].personas[persona] !== undefined) {
        schoolMap[school].personas[persona]++;
      } else {
        schoolMap[school].personas.unknown++;
      }
    });

    // Convert to sorted array
    const breakdown = Object.entries(schoolMap)
      .map(([school, data]) => ({
        school,
        ...data
      }))
      .sort((a, b) => b.count - a.count);

    return Response.json({
      success: true,
      data: breakdown,
      total: allUsers?.length || 0,
      schoolCount: breakdown.length
    });
  } catch (error) {
    console.error('School breakdown error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});