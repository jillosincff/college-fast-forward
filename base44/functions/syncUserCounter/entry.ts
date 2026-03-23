import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get actual user count
    const allUsers = await base44.asServiceRole.entities.User.list();
    const actualCount = allUsers.length;
    
    // Update counter to match
    const settings = await base44.asServiceRole.entities.GlobalSettings.filter({
      setting_key: 'total_users_count'
    });
    
    if (settings.length > 0) {
      await base44.asServiceRole.entities.GlobalSettings.update(settings[0].id, {
        value: actualCount
      });
    } else {
      await base44.asServiceRole.entities.GlobalSettings.create({
        setting_key: 'total_users_count',
        value: actualCount
      });
    }
    
    return Response.json({
      success: true,
      synced_to: actualCount,
      message: `Counter synced to ${actualCount} users`
    });
    
  } catch (error) {
    console.error('Sync counter error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});