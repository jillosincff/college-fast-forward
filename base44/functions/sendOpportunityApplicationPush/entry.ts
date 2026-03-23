import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      opportunity_id, 
      applicant_id,
      applicant_name,
      opportunity_title,
      company_name 
    } = await req.json();

    if (!opportunity_id || !applicant_id) {
      return Response.json({ 
        error: 'opportunity_id and applicant_id are required' 
      }, { status: 400 });
    }

    // Get the opportunity to find the poster
    const opportunity = await base44.asServiceRole.entities.Opportunity.get(opportunity_id);
    if (!opportunity) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const posterEmail = opportunity.created_by;
    if (!posterEmail) {
      return Response.json({ error: 'No poster email found' }, { status: 400 });
    }

    // Get poster's push subscription
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: posterEmail,
      is_active: true,
      notifications_paused: false
    });

    // Check rate limit
    const canSend = await checkRateLimit(base44, posterEmail);
    
    const title = opportunity_title || opportunity.title || 'your opportunity';
    const company = company_name || opportunity.org_name || '';
    const studentName = applicant_name || 'A student';

    const notificationTitle = "🎉 New application!";
    const notificationBody = `${studentName} applied to ${title}${company ? ` at ${company}` : ''} — tap to connect`;
    const deepLink = `/#MyApplications?opportunity_id=${opportunity_id}&action=intro`;

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: posterEmail,
      type: 'opportunity_application',
      title: notificationTitle,
      message: notificationBody,
      action_url: deepLink,
      action_label: 'Review Application',
      priority: 'high',
      push_sent: subscriptions && subscriptions.length > 0 && canSend,
      metadata: {
        opportunity_id,
        applicant_id,
        applicant_name: studentName
      }
    });

    // Send push if subscribed and within rate limit
    if (subscriptions && subscriptions.length > 0 && canSend) {
      for (const sub of subscriptions) {
        try {
          await sendWebPush(sub, {
            title: notificationTitle,
            body: notificationBody,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
              url: deepLink,
              opportunity_id,
              applicant_id,
              type: 'opportunity_application'
            },
            tag: `application-${opportunity_id}-${applicant_id}`,
            requireInteraction: true
          });

          // Update push count
          await updatePushCount(base44, sub.id);
        } catch (pushErr) {
          console.error('Push send failed:', pushErr);
        }
      }
    }

    return Response.json({
      success: true,
      notification_sent: true,
      push_sent: subscriptions && subscriptions.length > 0 && canSend
    });

  } catch (error) {
    console.error('Error sending opportunity application push:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkRateLimit(base44, userEmail) {
  const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
    user_email: userEmail
  });

  if (!subscriptions || subscriptions.length === 0) return false;

  const sub = subscriptions[0];
  
  if (sub.notifications_paused) {
    if (sub.notifications_paused_until && new Date(sub.notifications_paused_until) > new Date()) {
      return false;
    }
  }

  const now = new Date();
  if (sub.weekly_reset_date && new Date(sub.weekly_reset_date) < now) {
    await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
      weekly_push_count: 0,
      weekly_reset_date: getNextWeekDate()
    });
    return true;
  }

  return (sub.weekly_push_count || 0) < 3;
}

async function updatePushCount(base44, subscriptionId) {
  const sub = await base44.asServiceRole.entities.PushSubscription.get(subscriptionId);
  await base44.asServiceRole.entities.PushSubscription.update(subscriptionId, {
    weekly_push_count: (sub.weekly_push_count || 0) + 1,
    last_push_sent: new Date().toISOString()
  });
}

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