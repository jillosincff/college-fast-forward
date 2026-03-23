import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys, device_type = 'web' } = await req.json();

    if (!endpoint) {
      return Response.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: user.email,
      endpoint: endpoint
    });

    if (existing && existing.length > 0) {
      // Update existing subscription
      await base44.asServiceRole.entities.PushSubscription.update(existing[0].id, {
        keys,
        is_active: true,
        notifications_paused: false
      });

      return Response.json({
        success: true,
        subscription_id: existing[0].id,
        message: 'Subscription updated'
      });
    }

    // Create new subscription
    const subscription = await base44.asServiceRole.entities.PushSubscription.create({
      user_email: user.email,
      endpoint,
      keys,
      device_type,
      is_active: true,
      notifications_paused: false,
      weekly_push_count: 0,
      weekly_reset_date: getNextWeekDate()
    });

    return Response.json({
      success: true,
      subscription_id: subscription.id,
      message: 'Subscription created'
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getNextWeekDate() {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now.toISOString();
}