import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const currentUser = await base44.auth.me();

  if (!currentUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (currentUser.role !== 'admin' && !currentUser.is_admin) {
    return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const { user_id } = await req.json();

  await base44.asServiceRole.entities.User.update(user_id, {
    subscription_status: 'active',
    membership_tier: 'fastiq',
    fastiq_active: true,
    is_fastiq: true,
    fastiq_setup_complete: true,
    subscription_tier: 'fastiq',
  });

  return Response.json({ success: true });
});