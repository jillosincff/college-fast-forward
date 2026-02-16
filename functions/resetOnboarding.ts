import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let targetEmail = user.email;
    let mode = 'full';
    try {
      const body = await req.json();
      if (body.email && user.role === 'admin') {
        targetEmail = body.email;
      }
      if (body.mode) mode = body.mode;
    } catch (e) {
      // No body or invalid JSON - use current user
    }

    // Find user by email
    const targetUsers = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = targetUsers[0].id;

    if (mode === 'fix') {
      // Minimal fix - just reset onboarding state flags
      await base44.asServiceRole.entities.User.update(targetUserId, {
        onboarding_completed: false,
        pledge_taken: false,
        first_question_shown: false,
      });
    } else {
      // Full reset - clear everything
      await base44.asServiceRole.entities.User.update(targetUserId, {
        onboarding_completed: false,
        pledge_taken: false,
        first_question_shown: false,
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
    }

    return Response.json({ 
      success: true, 
      message: `Onboarding state reset (mode=${mode}) for ${targetEmail}. Refresh to start over.`,
      email: targetEmail,
      mode
    });
  } catch (error) {
    console.error('Reset onboarding error:', error);
    return Response.json({ 
      error: 'Failed to reset onboarding',
      details: error.message 
    }, { status: 500 });
  }
});