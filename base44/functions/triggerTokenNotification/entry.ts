import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Fires an in-app notification to the referrer when their invited friend
 * completes the school-selection milestone (Screen 7).
 *
 * Expected POST body:
 * {
 *   referrerId: string,
 *   refereeFirstName: string,   // First name of the friend who just scanned
 *   refereeSchoolShort: string  // e.g. "UF", "Penn State"
 * }
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);

  const { referrerId, refereeFirstName, refereeSchoolShort } = await req.json();

  if (!referrerId) {
    return Response.json({ error: 'referrerId is required' }, { status: 400 });
  }

  const firstName = refereeFirstName || 'Your friend';
  const schoolShort = refereeSchoolShort || 'your school';

  const notificationBody = `${firstName} just completed their ${schoolShort} Network Scan! 🎁 1 bonus CLiFF token has been dropped into your account. Head back to your dashboard to unlock your next inside track route.`;

  // Create an in-app Notification record for the referrer
  await base44.asServiceRole.entities.Notification.create({
    user_id: referrerId,
    type: 'token_deposit',
    title: '🎁 You earned a referral token!',
    body: notificationBody,
    is_read: false,
    metadata: {
      trigger: 'referral_milestone',
      referee_first_name: firstName,
      referee_school: schoolShort,
    },
  });

  // Also log an analytics event for funnel tracking
  await base44.asServiceRole.entities.AnalyticsEvent.create({
    event_name: 'referral_token_notification_sent',
    user_id: referrerId,
    properties: {
      referee_first_name: firstName,
      referee_school: schoolShort,
    },
  });

  return Response.json({ success: true, message: 'Token notification delivered.' });
});