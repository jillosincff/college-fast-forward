import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get current counter
    const settings = await base44.asServiceRole.entities.GlobalSettings.filter({
      setting_key: 'total_users_count'
    });

    const currentCount = settings.length > 0 ? settings[0].value : 570;
    const spotsLeft = Math.max(0, 1000 - currentCount);

    return Response.json({
      success: true,
      total_users: currentCount,
      spots_left: spotsLeft,
      founding_limit: 1000,
      founding_active: currentCount <= 1000
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