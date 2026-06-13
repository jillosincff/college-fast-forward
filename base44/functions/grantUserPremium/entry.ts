import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id } = await req.json();

    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });

    await base44.asServiceRole.entities.User.update(user_id, {
      subscription_status: 'active',
      membership_tier: 'fastiq',
      fastiq_active: true,
      is_fastiq: true,
      fastiq_setup_complete: true,
      subscription_tier: 'fastiq',
      trial_status: 'active',
      fastiq_trial_active: true,
    });

    return Response.json({ success: true, message: `Premium granted to user ${user_id}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});