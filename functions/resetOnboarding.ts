import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset onboarding flags
    await base44.asServiceRole.entities.User.update(user.id, {
      onboarding_completed: false,
      expertise_shared: false,
      welcome_shown: false,
      has_seen_dashboard: false,
      first_login: false
    });

    return Response.json({ 
      success: true, 
      message: 'Onboarding state reset successfully. Refresh the page to start over.' 
    });
  } catch (error) {
    console.error('Reset onboarding error:', error);
    return Response.json({ 
      error: 'Failed to reset onboarding',
      details: error.message 
    }, { status: 500 });
  }
});