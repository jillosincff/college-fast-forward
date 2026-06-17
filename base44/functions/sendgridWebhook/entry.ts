import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_EVENTS = new Set(['open', 'click', 'bounce', 'unsubscribe', 'delivered']);
const CAMPAIGN = 'parent_blast_june_2026';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const events = await req.json().catch(() => []);
    if (!Array.isArray(events)) {
      return Response.json({ received: 0 }, { status: 200 });
    }

    // Filter to only relevant event types
    const relevant = events.filter(e => ALLOWED_EVENTS.has(e.event));
    if (relevant.length === 0) {
      return Response.json({ received: 0 }, { status: 200 });
    }

    // Collect unique emails to look up parents in bulk
    const uniqueEmails = [...new Set(relevant.map(e => (e.email || '').toLowerCase()).filter(Boolean))];

    // Look up all parent users matching these emails
    const parentMap = {};
    for (const email of uniqueEmails) {
      try {
        const matches = await db.User.filter({ email, persona: 'parent' });
        if (matches && matches.length > 0) {
          parentMap[email] = matches[0].full_name || '';
        }
      } catch (_) {
        // skip lookup errors
      }
    }

    let processed = 0;

    for (const ev of relevant) {
      const email = (ev.email || '').toLowerCase();
      if (!email || !(email in parentMap)) continue;

      const record = {
        parent_email: email,
        parent_name: parentMap[email],
        event_type: ev.event,
        email_campaign: CAMPAIGN,
        timestamp: ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : new Date().toISOString(),
        sendgrid_message_id: ev.sg_message_id || '',
        ip_address: ev.ip || '',
        user_agent: ev.useragent || '',
      };

      if (ev.event === 'click' && ev.url) {
        record.clicked_url = ev.url;
      }

      await db.ParentEngagement.create(record);
      processed++;
    }

    return Response.json({ received: processed }, { status: 200 });

  } catch (err) {
    // Always return 200 to SendGrid so it doesn't retry
    console.error('sendgridWebhook error:', err.message);
    return Response.json({ received: 0, error: err.message }, { status: 200 });
  }
});