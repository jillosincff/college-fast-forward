import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_EVENTS = new Set(['open', 'click', 'bounce', 'unsubscribe', 'delivered', 'spam_report', 'group_unsubscribe']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const events = await req.json().catch(() => []);
    if (!Array.isArray(events)) {
      return Response.json({ received: 0 }, { status: 200 });
    }

    // Filter to only trackable event types
    const relevant = events.filter(e => e.email && ALLOWED_EVENTS.has(e.event));
    if (relevant.length === 0) {
      return Response.json({ received: 0 }, { status: 200 });
    }

    // Collect unique emails to try to look up parent names (best-effort, not required)
    const uniqueEmails = [...new Set(relevant.map(e => e.email.toLowerCase()))];
    const nameMap = {};
    for (const email of uniqueEmails) {
      try {
        const matches = await db.User.filter({ email });
        if (matches?.length > 0) nameMap[email] = matches[0].full_name || '';
      } catch (_) {}
    }

    let processed = 0;
    for (const ev of relevant) {
      const email = ev.email.toLowerCase();

      // Derive campaign from SendGrid categories or unique_args, fallback to 'unknown'
      const campaign =
        (ev.category && (Array.isArray(ev.category) ? ev.category[0] : ev.category)) ||
        ev.unique_args?.campaign ||
        ev['marketing_campaign_name'] ||
        'general';

      const record = {
        parent_email: email,
        parent_name: nameMap[email] || '',
        event_type: ev.event === 'group_unsubscribe' ? 'unsubscribe' : ev.event,
        email_campaign: campaign,
        timestamp: ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : new Date().toISOString(),
        sendgrid_message_id: ev.sg_message_id || '',
        ip_address: ev.ip || '',
        user_agent: ev.useragent || '',
      };

      if (ev.event === 'click' && ev.url) record.clicked_url = ev.url;

      await db.ParentEngagement.create(record);
      processed++;
    }

    return Response.json({ received: processed }, { status: 200 });

  } catch (err) {
    console.error('sendgridWebhook error:', err.message);
    return Response.json({ received: 0, error: err.message }, { status: 200 });
  }
});