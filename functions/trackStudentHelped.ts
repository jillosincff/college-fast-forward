import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Track when a parent successfully helps a student.
 * Call this when a match status changes to "connected" or when a student marks
 * their request as resolved and credits a parent.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parent_id, student_id, help_type } = await req.json();

    if (!parent_id) {
      return Response.json({ error: 'parent_id required' }, { status: 400 });
    }

    // Get parent's expertise profile
    const profiles = await base44.asServiceRole.entities.ParentExpertise.filter({
      parent_id: parent_id
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    
    // Increment students helped
    const studentsHelped = (profile.students_helped || 0) + 1;
    const studentsHelpedThisMonth = (profile.students_helped_this_month || 0) + 1;
    const totalConnections = (profile.total_connections || 0) + 1;

    // Update profile
    await base44.asServiceRole.entities.ParentExpertise.update(profile.id, {
      students_helped: studentsHelped,
      students_helped_this_month: studentsHelpedThisMonth,
      total_connections: totalConnections,
      last_active_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      students_helped: studentsHelped,
      students_helped_this_month: studentsHelpedThisMonth
    });

  } catch (error) {
    console.error('Track student helped error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});