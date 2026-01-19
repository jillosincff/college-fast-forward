import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { 
      settings_id,
      enabled,
      day1_threshold,
      day2_threshold,
      day3_threshold,
      stop_threshold,
      max_emails_per_day
    } = await req.json();
    
    if (!settings_id) {
      return Response.json({ error: 'settings_id is required' }, { status: 400 });
    }
    
    // Get current settings
    const currentSettings = await base44.asServiceRole.entities.ReengagementSettings.filter({});
    const existing = currentSettings.find(s => s.id === settings_id);
    
    if (!existing) {
      return Response.json({ error: 'Settings not found' }, { status: 404 });
    }
    
    // Build update object
    const updateData = {};
    
    if (typeof enabled === 'boolean') {
      updateData.enabled = enabled;
      if (enabled && !existing.enabled) {
        // Just being enabled
        updateData.enabled_at = new Date().toISOString();
        updateData.enabled_by = user.email;
      }
    }
    
    if (typeof day1_threshold === 'number') updateData.day1_threshold = day1_threshold;
    if (typeof day2_threshold === 'number') updateData.day2_threshold = day2_threshold;
    if (typeof day3_threshold === 'number') updateData.day3_threshold = day3_threshold;
    if (typeof stop_threshold === 'number') updateData.stop_threshold = stop_threshold;
    if (typeof max_emails_per_day === 'number') updateData.max_emails_per_day = max_emails_per_day;
    
    // Update settings
    await base44.asServiceRole.entities.ReengagementSettings.update(settings_id, updateData);
    
    console.log(`Updated reengagement settings by ${user.email}:`, updateData);
    
    return Response.json({
      success: true,
      message: enabled ? 'Re-engagement emails enabled' : 'Settings updated',
      settings_id,
      updated: updateData
    });
    
  } catch (error) {
    console.error('Update reengagement settings error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});