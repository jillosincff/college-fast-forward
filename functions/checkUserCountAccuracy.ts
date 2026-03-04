import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get counter from GlobalSettings
    const settings = await base44.asServiceRole.entities.GlobalSettings.filter({
      setting_key: 'total_users_count'
    });
    const counterValue = settings.length > 0 ? settings[0].value : 570;
    
    // Get actual user count
    const allUsers = await base44.asServiceRole.entities.User.list();
    const actualCount = allUsers.length;
    
    // Calculate founding spots
    const spotsLeftByCounter = Math.max(0, 1000 - counterValue);
    const spotsLeftActual = Math.max(0, 1000 - actualCount);
    
    return Response.json({
      counter_value: counterValue,
      actual_user_count: actualCount,
      difference: actualCount - counterValue,
      spots_left_by_counter: spotsLeftByCounter,
      spots_left_actual: spotsLeftActual,
      is_accurate: counterValue === actualCount
    });
    
  } catch (error) {
    console.error('Check accuracy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});