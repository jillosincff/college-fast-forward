import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const { user_id, full_name } = await req.json();

    if (!user_id || !full_name) return Response.json({ error: 'user_id and full_name required' }, { status: 400 });

    // Callers may only rename their own account — admins may rename anyone.
    if (caller.id !== user_id && caller.role !== 'admin') {
      return Response.json({ error: 'Not allowed' }, { status: 403 });
    }

    await base44.asServiceRole.entities.User.update(user_id, { full_name });

    return Response.json({ success: true, message: `Name updated to: ${full_name}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});