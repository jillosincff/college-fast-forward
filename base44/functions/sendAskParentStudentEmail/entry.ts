import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// One-time student email: "Want your parents to cover CLIFF Pro this fall?"
// with a button to #/AskParent (utm_source=student_email).
//
// BUILD ONLY — do NOT send until the owner says go. With { send: false } (or no
// body) this returns the recipient count + a preview and sends nothing. With
// { send: true } it sends to every eligible student via SendGrid.
//
// Recipients: students who are NOT founding_gator, NOT paying, and NOT
// unsubscribed (EmailPreference.all_emails === false). Includes an unsubscribe
// link.

const APP_BASE = 'https://collegefastforward.com';
const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    const { send } = await req.json().catch(() => ({}));

    const [users, prefs] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 10000).catch(() => []),
      base44.asServiceRole.entities.EmailPreference.list('-created_date', 10000).catch(() => []),
    ]);

    const unsub = new Set();
    for (const p of (prefs || [])) {
      const em = (p.user_email || '').toLowerCase().trim();
      if (em && p.all_emails === false) unsub.add(em);
    }
    const isStudent = (u) => ['student', 'gator'].includes(u.persona);
    const recipients = (users || []).filter((u) =>
      isStudent(u) &&
      u.membership_tier !== 'founding_gator' &&
      u.subscription_status !== 'active' &&
      !u.fastiq_active &&
      !u.is_fastiq &&
      !unsub.has((u.email || '').toLowerCase().trim()) &&
      !!u.email
    );

    const subject = 'Want your parents to cover CLIFF Pro this fall?';
    const buildBody = (first, askLink, unsubLink) => `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <p style="font-size:16px;line-height:1.65;color:#475569;margin:0 0 16px;">Hey ${escapeHtml(first)},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin:0 0 16px;">Pro is where CLIFF does the heavy lifting: it picks the jobs worth your time, tailors your resume to each one, drafts your follow-ups, and runs interview practice. This fall, your parent can give you the whole semester for $99, one time, through December 31. Tap below and we'll send them a quick note with everything they need. You don't have to explain a thing.</p>
  <div style="text-align:center;margin:28px 0;">
    <a href="${escapeHtml(askLink)}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Ask a parent</a>
  </div>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">— CLIFF, from College Fast Forward</p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:24px;"><a href="${escapeHtml(unsubLink)}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a></p>
</div>`;

    if (!send) {
      const sample = recipients.slice(0, 3).map((u) => ({
        email: u.email,
        first: u.full_name?.split(' ')[0] || 'there',
      }));
      const previewFirst = sample[0]?.first || 'there';
      const previewLink = `${APP_BASE}/#/AskParent?utm_source=student_email`;
      const previewUnsub = `${APP_BASE}/#/Unsubscribe?email=${encodeURIComponent(recipients[0]?.email || 'preview@example.com')}`;
      return Response.json({
        sent: false,
        recipientCount: recipients.length,
        sample,
        subject,
        body: buildBody(previewFirst, previewLink, previewUnsub),
      });
    }

    // SEND
    let sentCount = 0;
    const errors = [];
    for (const u of recipients) {
      try {
        const first = u.full_name?.split(' ')[0] || 'there';
        const askLink = `${APP_BASE}/#/AskParent?utm_source=student_email`;
        const unsubLink = `${APP_BASE}/#/Unsubscribe?email=${encodeURIComponent(u.email)}`;
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${secrets.get('SENDGRID_API_KEY')}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: u.email }] }],
            from: { email: 'team@collegefastforward.com', name: 'CLIFF, from College Fast Forward' },
            subject,
            content: [{ type: 'text/html', value: buildBody(first, askLink, unsubLink) }],
          }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          console.error('[sendAskParentStudentEmail] send failed:', u.email, res.status, t);
          errors.push({ email: u.email, status: res.status });
        } else {
          sentCount++;
        }
      } catch (e) {
        console.error('[sendAskParentStudentEmail] error:', u.email, e.message);
        errors.push({ email: u.email, error: e.message });
      }
    }

    // Log the send as one summary conversion event (idempotent on run date).
    try {
      const today = new Date().toISOString().slice(0, 10);
      const event_key = `ask_parent_student_email_sent:${today}`;
      const prior = await base44.asServiceRole.entities.ConversionEvent.filter({ event_key }).catch(() => []);
      if (!prior?.length) {
        await base44.asServiceRole.entities.ConversionEvent.create({
          user_id: caller.id,
          user_email: caller.email,
          event_name: 'ask_parent_sent',
          event_key,
          trigger: 'student_email',
          plan_at_event: 'free',
          metadata: { batch: 'student_email', sent_count: sentCount, recipient_count: recipients.length },
        }).catch((e) => console.error('[sendAskParentStudentEmail] summary log failed:', e.message));
      }
    } catch (e) { console.error('[sendAskParentStudentEmail] summary block failed:', e.message); }

    return Response.json({ sent: true, sentCount, recipientCount: recipients.length, errors: errors.slice(0, 50) });
  } catch (e) {
    console.error('sendAskParentStudentEmail error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}