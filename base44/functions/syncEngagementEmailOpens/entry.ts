/**
 * Sync open/click data from SendGrid's Email Activity API
 * back into EngagementEmail records.
 *
 * SendGrid Email Activity API lets us query by message_id and get events.
 * Requires SENDGRID_API_KEY with "Email Activity" access.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
    if (!user || !isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Fetch sent EngagementEmails that have a sendgrid_message_id but no opened_at
    const allSent = await base44.asServiceRole.entities.EngagementEmail.filter(
      { status: 'sent' }, '-sent_at', 500
    );

    // Query SendGrid activity for opens/clicks
    // SendGrid Email Activity API: GET /v3/messages?limit=1000&query=...
    // We fetch recent activity and match by msg_id
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const query = encodeURIComponent(`last_event_time BETWEEN TIMESTAMP "${new Date(thirtyDaysAgo * 1000).toISOString()}" AND TIMESTAMP "${new Date().toISOString()}"`);

    const sgRes = await fetch(
      `https://api.sendgrid.com/v3/messages?limit=1000&query=${query}`,
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!sgRes.ok) {
      const err = await sgRes.text();
      return Response.json({ error: `SendGrid API error: ${err}` }, { status: 500 });
    }

    const sgData = await sgRes.json();
    const messages = sgData.messages || [];

    // Build lookup: msg_id → message data
    const sgByMsgId = {};
    for (const msg of messages) {
      if (msg.msg_id) {
        sgByMsgId[msg.msg_id] = msg;
        // Also index by base prefix
        const base = msg.msg_id.split('.')[0];
        sgByMsgId[base] = msg;
      }
    }

    let updated = 0;
    let checked = 0;

    for (const email of allSent) {
      if (!email.sendgrid_message_id) continue;
      checked++;

      const msgId = email.sendgrid_message_id;
      const baseId = msgId.split('.')[0];
      const sgMsg = sgByMsgId[msgId] || sgByMsgId[baseId];

      if (!sgMsg) continue;

      const updates = {};

      // Check opens
      if (!email.opened_at && sgMsg.opens_count > 0 && sgMsg.last_event_time) {
        updates.opened_at = new Date(sgMsg.last_event_time).toISOString();
      }

      // Check clicks
      if (!email.clicked_at && sgMsg.clicks_count > 0 && sgMsg.last_event_time) {
        updates.clicked_at = new Date(sgMsg.last_event_time).toISOString();
      }

      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.EngagementEmail.update(email.id, updates);
        updated++;
      }
    }

    return Response.json({
      success: true,
      totalSent: allSent.length,
      checked,
      updated,
      sendgridMessages: messages.length,
    });
  } catch (error) {
    console.error('syncEngagementEmailOpens error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});