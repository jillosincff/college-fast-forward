import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

    const payload = {
      enabled: true,
      url: 'https://collegefastforward.base44.app/functions/sendgridWebhook',
      open: true,
      click: true,
      bounce: true,
      unsubscribe: true,
      delivered: false,
      spam_report: true,
      group_unsubscribe: true,
      group_resubscribe: false,
      deferred: false,
      dropped: false,
    };

    const res = await fetch('https://api.sendgrid.com/v3/user/webhooks/event/settings', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    return Response.json({ status: res.status, ok: res.ok, body });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});