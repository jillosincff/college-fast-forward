import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 8 deleted users from analytics logs with their trial end dates
    const usersToRestore = [
      {
        email: 'karenbuxton@comcast.net',
        full_name: 'Karen Buxton',
        persona: 'student',
        school_name: 'College of Charleston',
        trial_start_date: '2026-04-19T14:54:53.732Z',
        trial_end_date: '2026-04-26T14:54:53.732Z',
      },
      {
        email: 'mschaefer1129@yahoo.com',
        full_name: 'M Schaefer',
        persona: 'parent',
        school_name: 'University of Florida',
        trial_start_date: '2026-04-17T12:29:38.598Z',
        trial_end_date: '2026-04-24T12:29:38.598Z',
      },
      {
        email: 'lexiestant@gmail.com',
        full_name: 'Lexie Stant',
        persona: 'student',
        school_name: 'University Of Florida',
        trial_start_date: '2026-04-16T20:23:42.679Z',
        trial_end_date: '2026-04-23T20:23:42.679Z',
      },
      {
        email: 'jacksonwhitcomb@ufl.edu',
        full_name: 'Jackson Whitcomb',
        persona: 'student',
        school_name: 'University of Florida',
        trial_start_date: '2026-04-16T20:52:28.393Z',
        trial_end_date: '2026-04-23T20:52:28.393Z',
      },
      {
        email: 'brendanschaefer15@gmail.com',
        full_name: 'Brendan Schaefer',
        persona: 'student',
        school_name: 'University of Florida',
        trial_start_date: '2026-04-16T23:15:46.483Z',
        trial_end_date: '2026-04-23T23:15:46.483Z',
      },
      {
        email: 'mossrex@ufl.edu',
        full_name: 'Moss Rex',
        persona: 'gator',
        school_name: 'University of Florida',
        trial_start_date: '2026-04-15T23:44:27.654Z',
        trial_end_date: '2026-04-22T23:44:27.654Z',
      },
      {
        email: 'ankes@umich.edu',
        full_name: 'Ankes',
        persona: 'student',
        school_name: 'University of Michigan',
        trial_start_date: '2026-04-16T00:00:00Z',
        trial_end_date: '2026-04-23T00:00:00Z',
      },
      {
        email: 'callista.seago@gmail.com',
        full_name: 'Callista Seago',
        persona: 'student',
        school_name: 'Unknown',
        trial_start_date: '2026-04-16T00:00:00Z',
        trial_end_date: '2026-04-23T00:00:00Z',
      },
    ];

    const results = { created: 0, errors: [] };

    for (const userData of usersToRestore) {
      try {
        const newUser = await base44.asServiceRole.entities.User.create({
          email: userData.email,
          full_name: userData.full_name,
          persona: userData.persona,
          school_name: userData.school_name,
          trial_status: 'active',
          trial_start_date: userData.trial_start_date,
          trial_end_date: '2026-05-04T00:00:00Z',
          subscription_status: 'free',
          fastiq_trial_active: true,
          membership_tier: 'free',
          onboarding_completed: true,
          role: 'user',
        });

        results.created++;
      } catch (e) {
        results.errors.push({ email: userData.email, error: e.message });
      }
    }

    return Response.json({
      success: true,
      ...results,
      message: `Recreated ${results.created} expired trial user(s).`,
    });
  } catch (error) {
    console.error('[recreateExpiredTrialUsers] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});