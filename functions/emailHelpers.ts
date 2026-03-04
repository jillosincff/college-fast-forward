import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Centralized email helper functions — called by all email functions via:
//   base44.functions.invoke('emailHelpers', { action: 'canSendEmail', ... })

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, userEmail, userId, emailType } = await req.json();

    if (action === 'canSendEmail') {
      // ── Anti-spam: max 1/day, max 3/week, check preferences ──
      if (!userEmail) {
        return Response.json({ canSend: false, reason: 'No email provided' });
      }

      // Check email preferences
      const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: userEmail });
      const pref = prefs?.[0];

      if (pref?.all_emails === false) {
        return Response.json({ canSend: false, reason: 'Unsubscribed from all emails' });
      }

      // Map email type to preference field
      const prefMap = {
        welcome: 'welcome_email',
        new_answer: 'answer_notifications',
        nudge_24h: 'nudge_emails',
        nudge_48h: 'nudge_emails',
        thank_you: 'thank_you_notifications',
        daily_match_digest: 'daily_digest',
        weekly_digest: 'weekly_digest',
        parent_joined: 'parent_joined_notifications',
        reengagement_7d: 'reengagement_emails',
        reengagement_21d: 'reengagement_emails',
        reengagement_45d: 'reengagement_emails',
        feedback_request: 'answer_notifications',
      };

      const prefField = prefMap[emailType];
      if (prefField && pref?.[prefField] === false) {
        return Response.json({ canSend: false, reason: `Unsubscribed from ${emailType}` });
      }

      // Check rate limits: max 1/day, max 3/week
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const recentLogs = await base44.asServiceRole.entities.EmailLog.filter(
        { user_email: userEmail }, '-sent_at', 50
      );

      const todayCount = recentLogs.filter(l => l.sent_at >= oneDayAgo).length;
      const weekCount = recentLogs.filter(l => l.sent_at >= oneWeekAgo).length;

      if (todayCount >= 1) {
        return Response.json({ canSend: false, reason: `Daily limit reached (${todayCount} today)` });
      }
      if (weekCount >= 3) {
        return Response.json({ canSend: false, reason: `Weekly limit reached (${weekCount} this week)` });
      }

      return Response.json({ canSend: true });
    }

    if (action === 'logEmail') {
      // ── Log email send to EmailLog ──
      const { subject, metadata } = await req.json().catch(() => ({}));
      await base44.asServiceRole.entities.EmailLog.create({
        user_id: userId || '',
        user_email: userEmail,
        email_type: emailType,
        subject: subject || '',
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: metadata || {}
      });
      return Response.json({ success: true });
    }

    if (action === 'findMatchedQuestion') {
      // ── Find a matched unanswered question for a parent/alumni ──
      const { userIndustries } = await req.json().catch(() => ({}));
      const [helpReqs, jobReqs] = await Promise.all([
        base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 20),
        base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 20),
      ]);
      const unanswered = [...helpReqs, ...jobReqs].filter(q => (q.answer_count || 0) === 0);
      const industries = (userIndustries || []).map(i => i.toLowerCase());

      // Try industry match first
      let matched = null;
      if (industries.length > 0) {
        matched = unanswered.find(q => {
          const qi = (q.industry || q.target_industry || '').toLowerCase();
          return industries.some(i => qi.includes(i) || i.includes(qi));
        });
      }
      // Fallback: any unanswered question
      if (!matched) matched = unanswered[0] || null;

      return Response.json({ question: matched });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('emailHelpers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});