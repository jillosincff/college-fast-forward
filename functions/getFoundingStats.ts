import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get actual user count from database
    const allUsers = await base44.asServiceRole.entities.User.list();
    const actualCount = allUsers.length;
    const spotsLeft = Math.max(0, 1000 - actualCount);

    return Response.json({
      success: true,
      total_users: actualCount,
      spots_left: spotsLeft,
      founding_limit: 1000,
      founding_active: actualCount <= 1000
    });

  } catch (error) {
    console.error('❌ Get founding stats error:', error);
    return Response.json({ 
      error: error.message || 'Failed to get founding stats',
      total_users: 570,
      spots_left: 430,
      founding_limit: 1000
    }, { status: 500 });
  }
});