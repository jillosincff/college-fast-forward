import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ success: false, reason: 'Not authenticated' }, { status: 401 });
    }

    const { utm_source, utm_campaign, page } = await req.json().catch(() => ({}));

    if (!utm_source) {
      return Response.json({ success: false, reason: 'No utm_source' });
    }

    const now = new Date().toISOString();

    // Find recent email logs for this user matching the utm_source
    const recentLogs = await base44.asServiceRole.entities.EmailLog.filter(
      { user_email: user.email },
      '-sent_at',
      10
    );

    // Map utm_source to email_type
    const sourceToType = {
      'daily_digest': 'daily_match_digest',
      'reengagement': 'reengagement_7d',
      'answer_notification': 'answer_notification',
      'weekly_digest': 'weekly_parent_digest',
      'fastiq_unanswered_trigger': 'fastiq_unanswered_trigger',
    };
    const matchType = sourceToType[utm_source];

    // Find the most recent matching email log and update it
    let updated = false;
    for (const log of (recentLogs || [])) {
      const typeMatch = matchType ? log.email_type === matchType : true;
      const notYetClicked = !log.clicked;
      if (typeMatch && notYetClicked) {
        await base44.asServiceRole.entities.EmailLog.update(log.id, {
          clicked: true,
          clicked_at: now,
          utm_source: utm_source,
          utm_campaign: utm_campaign || '',
          status: 'clicked'
        });
        updated = true;
        break;
      }
    }

    return Response.json({ success: true, updated, utm_source, user_email: user.email });
  } catch (error) {
    console.error('trackEmailClick error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});