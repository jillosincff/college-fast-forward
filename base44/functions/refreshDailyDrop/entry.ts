import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Must match getDailyDrop's reset logic (4AM ET)
function getDailyDropDate() {
  const now = new Date();
  const etOffset = -4;
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  if (etNow.getUTCHours() < 4) {
    etNow.setUTCDate(etNow.getUTCDate() - 1);
  }
  return etNow.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete ALL of today's drops so the next getDailyDrop call regenerates.
    // Older drops are kept on purpose — they power the "don't repeat companies" memory.
    const dropDate = getDailyDropDate();
    const todays = await base44.entities.UserDailyDrop.filter({
      user_id: user.id,
      drop_date: dropDate,
    });

    for (const drop of todays || []) {
      await base44.entities.UserDailyDrop.delete(drop.id);
    }
    console.log(`[refreshDailyDrop] Cleared ${todays?.length || 0} drop(s) for ${user.email} on ${dropDate}`);

    return Response.json({ success: true, message: 'Daily drop refreshed' });

  } catch (error) {
    console.error('[refreshDailyDrop] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});