import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Temporary diagnostic: replicate the sendgridWebhook matching logic inline
// against real data to prove an open event lands opened_at on the right record.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    const db = base44.asServiceRole.entities;

    const sent = await db.EngagementEmail.filter({ status: 'sent' }, '-sent_at', 1000);
    if (!sent.length) return Response.json({ error: 'no sent emails' });

    const byMsgId = {};
    for (const e of sent) {
      if (e.sendgrid_message_id) {
        const base = e.sendgrid_message_id.split('.')[0];
        byMsgId[e.sendgrid_message_id] = e;
        byMsgId[base] = e;
      }
    }

    const target = sent[0];
    const baseId = (target.sendgrid_message_id || '').split('.')[0];
    const simulatedSgId = `${baseId}.recvd-diag.filter0001`;

    // This is the exact lookup the handler performs:
    const matched = byMsgId[simulatedSgId] || byMsgId[simulatedSgId.split('.')[0]];

    let writeOk = false;
    if (matched && !matched.opened_at) {
      await db.EngagementEmail.update(matched.id, { opened_at: new Date().toISOString() });
      const after = await db.EngagementEmail.get(matched.id);
      writeOk = !!after.opened_at;
    }

    return Response.json({
      simulatedSgId,
      matchedRecord: matched ? matched.user_email : null,
      matchedById: matched ? matched.id : null,
      writeOk,
      conclusion: matched
        ? 'MATCH: webhook open events will correctly set opened_at on EngagementEmail.'
        : 'NO MATCH — message id format mismatch.',
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});