import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && !user.is_admin) {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // Parse request body
    let targetEmail = user.email;
    let mode = 'full';
    let bodyData = {};
    try {
      bodyData = await req.json();
      if (bodyData.email) {
        targetEmail = bodyData.email;
      }
      if (bodyData.mode) mode = bodyData.mode;
    } catch (e) {
      // No body or invalid JSON - use current user
    }

    // Find user by email
    const targetUsers = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = targetUsers[0].id;

    if (mode === 'complete') {
      // Mark onboarding as done - for users stuck in onboarding loop
      await base44.asServiceRole.entities.User.update(targetUserId, {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        pledge_taken: true,
        first_question_shown: true,
      });
    } else if (mode === 'set') {
      const ALLOWED_FIELDS = [
        'persona', 'onboarding_completed', 'school_code',
        'school_name', 'ways_to_help', 'industry',
        'graduation_year', 'major',
      ];

      const fieldsToSet = bodyData.fields || {};
      const safeFields = Object.fromEntries(
        Object.entries(fieldsToSet).filter(([key]) => ALLOWED_FIELDS.includes(key))
      );

      if (Object.keys(safeFields).length === 0) {
        return Response.json({ error: 'No valid fields to set' }, { status: 400 });
      }

      await base44.asServiceRole.entities.User.update(targetUserId, safeFields);
    } else if (mode === 'fix') {
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