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

    // ── 1. Update student EngagementEmail records by message-id match ──
    // SendGrid sg_message_id arrives as "BASE_ID.recvd-xxx.filter-yyy".
    // The BASE_ID (before the first dot) equals the X-Message-Id we stored at send time.
    const sentEmails = await db.EngagementEmail.filter({ status: 'sent' }, '-sent_at', 1000);
    const byMsgId = {};
    for (const e of sentEmails) {
      if (e.sendgrid_message_id) {
        const base = e.sendgrid_message_id.split('.')[0];
        byMsgId[e.sendgrid_message_id] = e;
        byMsgId[base] = e;
      }
    }

    let engagementOpened = 0;
    let engagementClicked = 0;
    for (const ev of relevant) {
      if (ev.event !== 'open' && ev.event !== 'click') continue;
      const rawId = ev.sg_message_id || '';
      const baseId = rawId.split('.')[0];
      const record = byMsgId[rawId] || byMsgId[baseId];
      if (!record) continue;

      const ts = ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : new Date().toISOString();
      const updates = {};
      if (ev.event === 'open' && !record.opened_at) { updates.opened_at = ts; engagementOpened++; }
      if (ev.event === 'click' && !record.clicked_at) { updates.clicked_at = ts; engagementClicked++; }
      if (Object.keys(updates).length > 0) {
        await db.EngagementEmail.update(record.id, updates);
        // Keep local copy in sync so a later event in the same batch sees it
        Object.assign(record, updates);
      }
    }

    // ── 2. Log every event to ParentEngagement (parent blast analytics) ──
    const uniqueEmails = [...new Set(relevant.map(e => e.email.toLowerCase()))];
    const nameMap = {};
    for (const email of uniqueEmails) {
      try {
        const matches = await db.User.filter({ email });
        if (matches?.length > 0) nameMap[email] = matches[0].full_name || '';
      } catch (_) {}
    }

    let logged = 0;
    for (const ev of relevant) {
      const email = ev.email.toLowerCase();
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
      logged++;
    }

    return Response.json({
      received: relevant.length,
      engagementOpened,
      engagementClicked,
      parentEngagementLogged: logged,
    }, { status: 200 });

  } catch (err) {
    console.error('sendgridWebhook error:', err.message);
    return Response.json({ received: 0, error: err.message }, { status: 200 });
  }
});