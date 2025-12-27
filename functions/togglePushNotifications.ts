import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paused, pause_days } = await req.json();

    // Get user's subscriptions
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: user.email
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ 
        error: 'No push subscription found',
        message: 'Please enable notifications first'
      }, { status: 404 });
    }

    // Calculate pause until date if pausing
    let pauseUntil = null;
    if (paused && pause_days) {
      const now = new Date();
      now.setDate(now.getDate() + pause_days);
      pauseUntil = now.toISOString();
    }

    // Update all subscriptions
    for (const sub of subscriptions) {
      await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
        notifications_paused: paused,
        notifications_paused_until: pauseUntil
      });
    }

    // Update user preferences
    await base44.auth.updateMe({
      notifications_paused: paused,
      notifications_paused_until: pauseUntil
    });

    return Response.json({
      success: true,
      paused,
      paused_until: pauseUntil,
      message: paused 
        ? `Notifications paused${pause_days ? ` for ${pause_days} days` : ''}`
        : 'Notifications resumed'
    });

  } catch (error) {
    console.error('Error toggling push notifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});