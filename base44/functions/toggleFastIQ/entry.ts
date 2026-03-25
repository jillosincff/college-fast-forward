import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { user_id, enabled } = await req.json();
    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });
    if (typeof enabled !== 'boolean') return Response.json({ error: 'enabled must be true or false' }, { status: 400 });

    // Toggle FastIQ flag
    await base44.asServiceRole.entities.User.update(user_id, {
      is_fastiq: enabled,
      fastiq_setup_complete: enabled,
    });

    return Response.json({
      success: true,
      message: `FastIQ ${enabled ? 'enabled' : 'disabled'} for user ${user_id}.`,
      is_fastiq: enabled,
    });
  } catch (error) {
    console.error('toggleFastIQ error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});