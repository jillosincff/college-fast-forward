import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Anti-spam rate limiter for emails.
 * Rules:
 *   1. Max 1 email/day per user
 *   2. Max 3 emails/week per user
 *   3. Max 3 total nudge/re-engage emails ever per user
 *   4. Respect unsubscribe preferences (checked separately by callers)
 *   5. Cancel pending nudges when user takes action (checked by nudge function)
 *   6. Check EmailLog before every send
 *
 * Call with { userEmail, emailType } — returns { allowed, reason }
 */

const NUDGE_REENGAGE_TYPES = [
  'nudge_24h', 'nudge_48h',
  'reengagement_7d', 'reengagement_21d', 'reengagement_45d'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, emailType } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all recent email logs for this user (last 7 days max)
    const recentLogs = await base44.asServiceRole.entities.EmailLog.filter(
      { user_email: userEmail },
      '-sent_at',
      50
    );

    // Rule 1: Max 1 email/day
    const todayEmails = recentLogs.filter(l => l.sent_at && l.sent_at >= oneDayAgo);
    if (todayEmails.length >= 1) {
      return Response.json({
        allowed: false,
        reason: `Already sent ${todayEmails.length} email(s) today (max 1/day)`,
        todayCount: todayEmails.length
      });
    }

    // Rule 2: Max 3 emails/week
    const weekEmails = recentLogs.filter(l => l.sent_at && l.sent_at >= oneWeekAgo);
    if (weekEmails.length >= 3) {
      return Response.json({
        allowed: false,
        reason: `Already sent ${weekEmails.length} email(s) this week (max 3/week)`,
        weekCount: weekEmails.length
      });
    }

    // Rule 3: Max 3 total nudge/re-engage emails ever
    if (NUDGE_REENGAGE_TYPES.includes(emailType)) {
      const allNudgeReengage = recentLogs.filter(l => NUDGE_REENGAGE_TYPES.includes(l.email_type));
      // We only fetched last 50, so also do a broader check
      const allLogs = await base44.asServiceRole.entities.EmailLog.filter(
        { user_email: userEmail },
        '-sent_at',
        200
      );
      const totalNudgeReengage = allLogs.filter(l => NUDGE_REENGAGE_TYPES.includes(l.email_type));
      if (totalNudgeReengage.length >= 3) {
        return Response.json({
          allowed: false,
          reason: `Already sent ${totalNudgeReengage.length} nudge/re-engage emails (max 3 ever)`,
          totalNudgeReengage: totalNudgeReengage.length
        });
      }
    }

    return Response.json({
      allowed: true,
      todayCount: todayEmails.length,
      weekCount: weekEmails.length
    });

  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow sending (fail open) so we don't block legitimate emails
    return Response.json({ allowed: true, error: error.message });
  }
});