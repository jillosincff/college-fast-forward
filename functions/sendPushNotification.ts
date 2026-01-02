import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      recipient_email, 
      title, 
      body, 
      type = 'general',
      action_url,
      metadata = {}
    } = await req.json();

    if (!recipient_email || !title || !body) {
      return Response.json({ 
        error: 'recipient_email, title, and body are required' 
      }, { status: 400 });
    }

    console.log(`📱 Sending push notification to ${recipient_email}`);

    // Get user's push subscriptions
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: recipient_email,
      is_active: true,
      notifications_paused: false
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscription for ${recipient_email}`);
      return Response.json({ 
        success: false, 
        reason: 'no_subscription' 
      });
    }

    // Check rate limit (max 10 pushes per week)
    const MAX_PUSHES_PER_WEEK = 10;
    const sub = subscriptions[0];
    const now = new Date();
    
    // Reset weekly count if needed
    if (sub.weekly_reset_date && new Date(sub.weekly_reset_date) < now) {
      await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
        weekly_push_count: 0,
        weekly_reset_date: getNextWeekDate()
      });
    } else if ((sub.weekly_push_count || 0) >= MAX_PUSHES_PER_WEEK) {
      console.log(`Rate limited for ${recipient_email}`);
      return Response.json({ 
        success: false, 
        reason: 'rate_limited' 
      });
    }

    // Send push to each subscription
    let sentCount = 0;
    for (const subscription of subscriptions) {
      try {
        await sendWebPush(subscription, {
          title,
          body,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          data: {
            url: action_url || '/#MyMessages',
            type,
            ...metadata
          },
          tag: `${type}-${Date.now()}`,
          requireInteraction: type === 'new_message' || type === 'new_answer'
        });
        sentCount++;

        // Update push stats
        await base44.asServiceRole.entities.PushSubscription.update(subscription.id, {
          weekly_push_count: (subscription.weekly_push_count || 0) + 1,
          last_push_sent: now.toISOString()
        });
      } catch (err) {
        console.error(`Failed to send push to endpoint:`, err.message);
        
        // Mark subscription as inactive if endpoint is gone
        if (err.message?.includes('410') || err.message?.includes('404')) {
          await base44.asServiceRole.entities.PushSubscription.update(subscription.id, {
            is_active: false
          });
        }
      }
    }

    // Also create in-app notification
    try {
      await base44.asServiceRole.entities.Notification.create({
        recipient_email,
        type,
        title,
        message: body,
        action_url: action_url || '/#MyMessages',
        action_label: type === 'new_message' ? 'View Message' : 'View',
        priority: 'normal',
        push_sent: sentCount > 0,
        metadata
      });
    } catch (e) {
      console.log('Could not create in-app notification:', e.message);
    }

    console.log(`✅ Push sent to ${sentCount} devices for ${recipient_email}`);
    return Response.json({ 
      success: true, 
      sent_count: sentCount 
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getNextWeekDate() {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now.toISOString();
}

async function sendWebPush(subscription, payload) {
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok && response.status !== 201) {
    throw new Error(`Push failed: ${response.status}`);
  }
}