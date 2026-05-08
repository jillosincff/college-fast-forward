/**
 * SendGrid Engagement Webhook
 *
 * Receives open/click events from SendGrid and updates the matching
 * EngagementEmail record with opened_at / clicked_at timestamps.
 *
 * Set this URL in SendGrid: Dashboard → Settings → Mail Settings → Event Webhook
 * URL: https://<your-app>/api/functions/sendgridEngagementWebhook
 * Events to enable: Open, Click
 *
 * SendGrid sends batched arrays of events as POST with JSON body.
 * Each event has: { event, sg_message_id, timestamp, ... }
 * sg_message_id format: "BASE_MESSAGE_ID.FILTER_ID" — we match on the prefix before the first dot.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const events = await req.json().catch(() => []);
    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ ok: true, processed: 0 });
    }

    // Load recent sent emails to match against (last 500)
    const sentEmails = await base44.asServiceRole.entities.EngagementEmail.filter(
      { status: 'sent' }, '-sent_at', 500
    );

    // Build lookup: base message id → email record
    const byMsgId = {};
    for (const e of sentEmails) {
      if (e.sendgrid_message_id) {
        // Store by full id and also by base prefix (before first dot)
        const base = e.sendgrid_message_id.split('.')[0];
        byMsgId[e.sendgrid_message_id] = e;
        byMsgId[base] = e;
      }
    }

    let opened = 0;
    let clicked = 0;

    for (const ev of events) {
      const eventType = ev.event;
      if (!['open', 'click'].includes(eventType)) continue;

      // sg_message_id can be "BASE_ID.FILTER_ID" — try both
      const rawId = ev.sg_message_id || '';
      const baseId = rawId.split('.')[0];
      const record = byMsgId[rawId] || byMsgId[baseId];
      if (!record) continue;

      const ts = ev.timestamp ? new Date(ev.timestamp * 1000).toISOString() : new Date().toISOString();

      const updates = {};
      if (eventType === 'open' && !record.opened_at) {
        updates.opened_at = ts;
        opened++;
      }
      if (eventType === 'click' && !record.clicked_at) {
        updates.clicked_at = ts;
        clicked++;
      }

      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.EngagementEmail.update(record.id, updates);
      }
    }

    return Response.json({ ok: true, processed: events.length, opened, clicked });
  } catch (error) {
    console.error('sendgridEngagementWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});