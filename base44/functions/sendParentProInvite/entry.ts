import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Student-initiated "Send to a parent": the student (current user) enters their
// parent's email. We create a Stripe checkout the PARENT pays at, with the gift
// attributed to THIS student, then email the parent the link. When the parent
// pays, the existing stripeWebhook activates the student's Pro (gift_student_email).

// CLIFF Pro prices — annual is the recommended gift (best value).
const PRO_PRICES = {
  pro_monthly: 'price_1TZyJ8873TV7WMcTiMisnPsg', // $19.96/month
  pro_annual: 'price_1U5EEH873TV7WMcTOOnQNksc',  // $149/year
};

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { parentEmail: rawEmail, note, plan: rawPlan } = await req.json();
    const parentEmail = rawEmail?.trim().toLowerCase();
    const plan = PRO_PRICES[rawPlan] ? rawPlan : 'pro_annual'; // default gift = annual (best value)
    const priceText = plan === 'pro_annual' ? '$149/year (~$12.42/month)' : '$19.96/month';
    if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      return Response.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (parentEmail === user.email?.toLowerCase()) {
      return Response.json({ success: false, error: "That's your own email — enter a parent's email." }, { status: 400 });
    }

    const studentFirst = user.full_name?.split(' ')[0] || 'your student';

    const body = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': PRO_PRICES[plan],
      'line_items[0][quantity]': '1',
      success_url: 'https://collegefastforward.com/#/ParentAllSet?gift=success',
      cancel_url: 'https://collegefastforward.com/#/ParentAllSet',
      client_reference_id: user.id,
      customer_email: parentEmail,
      'metadata[gift_student_email]': user.email,
      'metadata[student_name]': user.full_name || '',
      'metadata[parent_invite]': 'true',
      'metadata[plan]': plan,
      'subscription_data[metadata][gift_student_email]': user.email,
      'subscription_data[metadata][gifted_by_parent_invite]': 'true',
      'subscription_data[metadata][plan]': `${plan}_gift`,
    });
    body.append('payment_method_collection', 'always');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const session = await stripeRes.json();
    if (session.error) return Response.json({ success: false, error: session.error.message }, { status: 500 });
    const checkoutUrl = session.url;

    // Email the parent (likely not a registered app user) the payment link.
    // If the email fails, NEVER return success — the student would see a false
    // "Sent!" screen. Return an error the paywall displays instead.
    try {
      const sendRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secrets.get('SENDGRID_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: parentEmail }] }],
          from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
          subject: `${studentFirst} asked you to help with CLIFF Pro`,
          content: [{ type: 'text/html', value: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:23px;font-weight:800;margin-bottom:14px;color:#0f172a;">${escapeHtml(studentFirst)} asked you to help with CLIFF Pro</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Hi,</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">${escapeHtml(studentFirst)} is using CLIFF to find internships and jobs. They just finished their free cycle and asked you to unlock CLIFF Pro so CLIFF can keep working for them — finding roles, tailoring their resume, surfacing connections, and following up.</p>
  ${note ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:14px 16px;margin:16px 0;"><p style="font-size:13px;color:#6d28d9;font-weight:700;margin:0 0 4px;">A note from ${escapeHtml(studentFirst)}:</p><p style="font-size:15px;color:#0f172a;margin:0;line-height:1.5;">${escapeHtml(note)}</p></div>` : ''}
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">It's ${priceText} and you can cancel anytime. Your payment activates their account immediately.</p>
  <a href="${escapeHtml(checkoutUrl)}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Unlock ${escapeHtml(studentFirst)}'s CLIFF Pro →</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">Warmly,<br><strong>Jill Osinoff</strong><br>Founder, College Fast Forward</p>
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

    return Response.json({ success: true, url: checkoutUrl });
  } catch (e) {
    console.error('[sendParentProInvite] error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}