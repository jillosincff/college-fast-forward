import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all EngagementEmail records from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const allEmails = await base44.asServiceRole.entities.EngagementEmail.list();
    const todaysEmails = allEmails.filter(e => {
      const created = new Date(e.created_date);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    });

    // Breakdown by status and workflow
    const breakdown = {
      pending_approval: todaysEmails.filter(e => e.status === 'pending_approval').length,
      approved: todaysEmails.filter(e => e.status === 'approved').length,
      sent: todaysEmails.filter(e => e.status === 'sent').length,
      failed: todaysEmails.filter(e => e.status === 'failed').length,
      skipped: todaysEmails.filter(e => e.status === 'skipped').length,
      rejected: todaysEmails.filter(e => e.status === 'rejected').length,
    };

    // Breakdown by workflow/routing
    const byRoute = {
      onboarding: todaysEmails.filter(e => e.workflow === 'onboarding').length,
      trial_activation: todaysEmails.filter(e => e.workflow === 'trial_activation').length,
      trial_expired: todaysEmails.filter(e => e.workflow === 'trial_expired').length,
      reengagement: todaysEmails.filter(e => e.workflow === 'reengagement').length,
    };

    const totalQueued = breakdown.pending_approval + breakdown.approved;
    const totalSkipped = breakdown.skipped;

    // Format message
    const message = `📊 **Engagement Agent Report — ${today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}**

**Queue Summary:**
• Queued (pending + approved): ${totalQueued}
• Skipped: ${totalSkipped}

**By Status:**
• Pending Approval: ${breakdown.pending_approval}
• Approved: ${breakdown.approved}
• Sent: ${breakdown.sent}
• Failed: ${breakdown.failed}
• Skipped: ${breakdown.skipped}
• Rejected: ${breakdown.rejected}

**By Route:**
• Onboarding: ${byRoute.onboarding}
• Trial Activation: ${byRoute.trial_activation}
• Trial Expired: ${byRoute.trial_expired}
• Reengagement: ${byRoute.reengagement}`;

    // Send to Telegram
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      return Response.json({ error: 'Missing Telegram credentials' }, { status: 500 });
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: 500 });
    }

    return Response.json({
      success: true,
      totalQueued,
      totalSkipped,
      breakdown,
      byRoute,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});