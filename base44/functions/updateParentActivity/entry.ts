import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Update parent's last active timestamp.
 * Call this on dashboard load or other parent activity.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent's expertise profile
    const profiles = await base44.asServiceRole.entities.ParentExpertise.filter({
      parent_id: user.id
    });

    if (!profiles || profiles.length === 0) {
      // Not a parent, or profile not created yet - just return success
      return Response.json({ success: true, message: 'No parent profile found' });
    }

    const profile = profiles[0];

    // Update last active timestamp
    await base44.asServiceRole.entities.ParentExpertise.update(profile.id, {
      last_active_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      last_active_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update parent activity error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});