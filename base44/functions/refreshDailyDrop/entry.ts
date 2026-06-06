import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete existing daily drop for today
    const existing = await base44.entities.UserDailyDrop.filter({
      user_id: user.id,
    });

    if (existing && existing.length > 0) {
      await base44.entities.UserDailyDrop.delete(existing[0].id);
      console.log(`[refreshDailyDrop] Cleared cached drop for ${user.email}`);
    }

    return Response.json({ success: true, message: 'Daily drop refreshed' });

  } catch (error) {
    console.error('[refreshDailyDrop] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});