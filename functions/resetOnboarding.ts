import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for optional email parameter (admin only)
    let targetEmail = user.email;
    try {
      const body = await req.json();
      if (body.email && user.roles?.includes('admin')) {
        targetEmail = body.email;
      }
    } catch (e) {
      // No body or invalid JSON - use current user
    }

    // Find user by email
    const targetUser = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (!targetUser || targetUser.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset onboarding flags and clear profile data
    await base44.asServiceRole.entities.User.update(targetUser[0].id, {
      onboarding_completed: false,
      expertise_shared: false,
      welcome_shown: false,
      has_seen_dashboard: false,
      first_login: false,
      current_position: null,
      current_company: null,
      description_of_work: null,
      ways_to_help: [],
      linkedin_url: '',
      bio: '',
      job_title: '',
      industry: '',
      years_of_experience: null
    });

    return Response.json({ 
      success: true, 
      message: `Onboarding state reset for ${targetEmail}. Refresh to start over.`,
      email: targetEmail
    });
  } catch (error) {
    console.error('Reset onboarding error:', error);
    return Response.json({ 
      error: 'Failed to reset onboarding',
      details: error.message 
    }, { status: 500 });
  }
});