import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Filter to last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSignups = allUsers
      .filter(u => new Date(u.created_date) > yesterday)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return Response.json({
      success: true,
      count: recentSignups.length,
      users: recentSignups.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        persona: u.persona,
        roles: u.roles,
        is_founding_gator: u.is_founding_gator,
        founding_gator_number: u.founding_gator_number,
        created_date: u.created_date
      }))
    });

  } catch (error) {
    console.error('Get recent signups error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});