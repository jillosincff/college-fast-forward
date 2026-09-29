import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Student-initiated "Ask a parent": the student (current user) enters their
// parent's email. We email the parent a link to the public #/ForParents page,
// pre-filled with the student's name/email and utm_source=ask_parent. The
// parent pays $99 one time on that page; the webhook activates the student's
// Pro for the school year. No Stripe checkout is created here anymore.

const APP_BASE = 'https://collegefastforward.com';

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { parentEmail: rawEmail, note } = await req.json();
    const parentEmail = (rawEmail || '').trim().toLowerCase();
    if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      return Response.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (parentEmail === (user.email || '').toLowerCase()) {
      return Response.json({ success: false, error: "That's your own email — enter a parent's email." }, { status: 400 });
    }

    const studentFirst = user.full_name?.split(' ')[0] || 'your student';
    const studentEmail = (user.email || '').toLowerCase();
    const studentName = user.full_name || '';
    const link = `${APP_BASE}/#/ForParents?student_name=${encodeURIComponent(studentName)}&student_email=${encodeURIComponent(studentEmail)}&utm_source=ask_parent`;

    // Email the parent (likely not a registered app user) the gift link.
    // If the email fails, NEVER return success — the student would see a false
    // "Sent!" screen.
    try {
      const sendRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secrets.get('SENDGRID_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: parentEmail }] }],
          from: { email: 'team@collegefastforward.com', name: 'College Fast Forward' },
          subject: `${studentFirst} asked you for help with their job search`,
          content: [{ type: 'text/html', value: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:23px;font-weight:800;margin-bottom:14px;color:#0f172a;">${escapeHtml(studentFirst)} asked you for help with their job search</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Hi,</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Give them CLIFF through August 2027 for $99. You pay once, and it ends August 31, 2027. If your student doesn't use it, you get a full refund within 14 days.</p>
  ${note ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:14px 16px;margin:16px 0;"><p style="font-size:13px;color:#6d28d9;font-weight:700;margin:0 0 4px;">A note from ${escapeHtml(studentFirst)}:</p><p style="font-size:15px;color:#0f172a;margin:0;line-height:1.5;">${escapeHtml(note)}</p></div>` : ''}
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Tap below to give ${escapeHtml(studentFirst)} CLIFF through August 2027.</p>
  <a href="${escapeHtml(link)}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Give them CLIFF — $99</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:24px;">Full refund within 14 days if they don't use it.</p>
  <p style="font-size:13px;color:#94a3b8;margin-top:24px;">The College Fast Forward Team</p>
</div>` }],
        }),
      });
      if (!sendRes.ok) {
        const sendErr = await sendRes.text().catch(() => '');
        console.error('[sendParentProInvite] parent email failed:', sendRes.status, sendErr);
        return Response.json({ success: false, error: "We couldn't send that email right now — please try again in a moment." }, { status: 502 });
      }
    } catch (e) {
      console.error('[sendParentProInvite] parent email failed:', e.message);
      return Response.json({ success: false, error: "We couldn't send that email right now — please try again in a moment." }, { status: 502 });
    }

    // Log ask_parent_sent (idempotent on student + parent email).
    try {
      const event_key = `${user.id}:ask_parent_sent:${parentEmail}`;
      const prior = await base44.asServiceRole.entities.ConversionEvent
        .filter({ event_key }).catch((e) => { console.error('[sendParentProInvite] lookup failed:', e?.message || e); return []; });
      if (!prior?.length) {
        await base44.asServiceRole.entities.ConversionEvent.create({
          user_id: user.id,
          user_email: user.email,
          event_name: 'ask_parent_sent',
          event_key,
          trigger: 'ask_parent',
          plan_at_event: 'free',
          metadata: { parent_email: parentEmail, student_name: studentName, utm_source: 'ask_parent' },
        }).catch((e) => console.error('[sendParentProInvite] event log failed:', e.message));
      }
    } catch (e) { console.error('[sendParentProInvite] event log block failed:', e.message); }

    return Response.json({ success: true });
  } catch (e) {
    console.error('sendParentProInvite error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}