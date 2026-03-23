import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MAX_PUSHES_PER_WEEK = 3;
const MAX_MATCHES_TO_NOTIFY = 10;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This can be called by service role (from other functions)
    const { request_id, request_data } = await req.json();

    if (!request_id && !request_data) {
      return Response.json({ error: 'request_id or request_data is required' }, { status: 400 });
    }

    // Get request details
    let request = request_data;
    if (request_id && !request) {
      request = await base44.asServiceRole.entities.JobRequest.get(request_id);
    }

    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Build matching criteria
    const matchTerms = [
      request.target_industry?.toLowerCase(),
      request.role?.toLowerCase(),
      request.target_company?.toLowerCase()
    ].filter(Boolean);

    // Get all parents/alumni with push enabled
    const parentUsers = await base44.asServiceRole.entities.User.filter({
      push_notifications_enabled: true
    });

    // Filter to parents/alumni only
    const eligibleUsers = parentUsers.filter(u => 
      u.persona === 'parent' || u.persona === 'alumni' || 
      u.roles?.includes('parent') || u.roles?.includes('alumni')
    );

    // Score and match users
    const scoredUsers = [];
    for (const user of eligibleUsers) {
      let score = 0;
      const reasons = [];

      // Industry match
      if (user.industry && matchTerms.some(t => user.industry.toLowerCase().includes(t))) {
        score += 30;
        reasons.push('industry');
      }
      if (user.industries?.some(ind => matchTerms.some(t => ind.toLowerCase().includes(t)))) {
        score += 20;
        reasons.push('industries');
      }

      // Company match
      if (user.current_company && request.target_company && 
          user.current_company.toLowerCase().includes(request.target_company.toLowerCase())) {
        score += 40;
        reasons.push('company');
      }

      // Expertise match
      if (user.expertise_areas?.length > 0) {
        const expertiseText = user.expertise_areas.join(' ').toLowerCase();
        if (matchTerms.some(t => expertiseText.includes(t))) {
          score += 20;
          reasons.push('expertise');
        }
      }

      // Role/position match
      if (user.current_position && matchTerms.some(t => user.current_position.toLowerCase().includes(t))) {
        score += 25;
        reasons.push('role');
      }

      if (score > 0) {
        scoredUsers.push({ user, score, reasons });
      }
    }

    // Sort by score and take top matches
    scoredUsers.sort((a, b) => b.score - a.score);
    const topMatches = scoredUsers.slice(0, MAX_MATCHES_TO_NOTIFY);

    // Build notification content
    const requestSummary = buildRequestSummary(request);
    const notificationTitle = "🆘 Student needs your help!";
    const notificationBody = requestSummary + " — tap to respond";
    const deepLink = `/#QuestionDetail?id=${request.id}&action=help`;

    // Send push to each matched user
    const results = [];
    for (const { user, score, reasons } of topMatches) {
      try {
        // Check rate limit
        const canSend = await checkRateLimit(base44, user.email);
        if (!canSend) {
          results.push({ email: user.email, status: 'rate_limited' });
          continue;
        }

        // Get user's push subscriptions
        const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
          user_email: user.email,
          is_active: true,
          notifications_paused: false
        });

        if (!subscriptions || subscriptions.length === 0) {
          results.push({ email: user.email, status: 'no_subscription' });
          continue;
        }

        // Send push to each subscription
        for (const sub of subscriptions) {
          await sendWebPush(sub, {
            title: notificationTitle,
            body: notificationBody,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
              url: deepLink,
              request_id: request.id,
              type: 'student_request_match'
            },
            tag: `request-${request.id}`,
            requireInteraction: true
          });

          // Update push count
          await updatePushCount(base44, sub.id);
        }

        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: user.email,
          type: 'student_request_match',
          title: notificationTitle,
          message: notificationBody,
          action_url: deepLink,
          action_label: 'Help Student',
          priority: 'high',
          push_sent: true,
          metadata: {
            request_id: request.id,
            match_score: score,
            match_reasons: reasons
          }
        });

        results.push({ email: user.email, status: 'sent', score });
      } catch (err) {
        console.error(`Failed to send push to ${user.email}:`, err);
        results.push({ email: user.email, status: 'error', error: err.message });
      }
    }

    return Response.json({
      success: true,
      notified_count: results.filter(r => r.status === 'sent').length,
      total_matches: topMatches.length,
      results
    });

  } catch (error) {
    console.error('Error sending student request push:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildRequestSummary(request) {
  const parts = [];
  
  // Add job type context
  const jobTypeEmoji = {
    'internship': '🎓',
    'full_time': '💼',
    'part_time': '⏰',
    'contract': '📋'
  };
  
  const emoji = jobTypeEmoji[request.job_type] || '🔥';
  
  if (request.role) {
    parts.push(request.role);
  }
  if (request.target_industry) {
    parts.push(request.target_industry);
  }
  if (request.location_city) {
    parts.push(`in ${request.location_city}`);
  }
  
  if (parts.length === 0 && request.description) {
    return emoji + ' ' + request.description.substring(0, 55) + (request.description.length > 55 ? '...' : '');
  }
  
  const summary = parts.join(' ') || 'Career advice needed';
  return emoji + ' ' + summary;
}

async function checkRateLimit(base44, userEmail) {
  const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
    user_email: userEmail
  });

  if (!subscriptions || subscriptions.length === 0) return false;

  const sub = subscriptions[0];
  
  // Check if paused
  if (sub.notifications_paused) {
    if (sub.notifications_paused_until && new Date(sub.notifications_paused_until) > new Date()) {
      return false;
    }
  }

  // Check weekly limit
  const now = new Date();
  if (sub.weekly_reset_date && new Date(sub.weekly_reset_date) < now) {
    // Reset weekly count
    await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
      weekly_push_count: 0,
      weekly_reset_date: getNextWeekDate()
    });
    return true;
  }

  return (sub.weekly_push_count || 0) < MAX_PUSHES_PER_WEEK;
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
  // Web Push API call
  // Note: In production, you'd use web-push library with VAPID keys
  // For now, we'll use the Notification API on client side via service worker
  
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