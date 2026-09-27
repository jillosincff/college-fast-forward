import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// CLIFF Pro prices — annual is the recommended gift (best value).
const PRO_PRICES = {
  pro_monthly: 'price_1TZyJ8873TV7WMcTiMisnPsg', // $19.96/month
  pro_annual: 'price_1U5EEH873TV7WMcTOOnQNksc',  // $149/year
};

// One-time Fall Semester Gift: $99, mode=payment, Pro through Dec 31.
const FALL_SEMESTER_GIFT_PRICE = 'price_1UKPSs873TV7WMcTAP9slOxu';

const APP_BASE = 'https://collegefastforward.com';
const normEmail = (e) => (e || '').trim().toLowerCase();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Public for fall_semester_gift (parent isn't logged in); required for the
    // existing subscription gift flow.
    const user = await base44.auth.me().catch(() => null);
    const body = await req.json();

    // ── Fall Semester Gift (one-time, public page) ──────────────────────
    if (body.plan === 'fall_semester_gift') {
      const parentName = (body.parentName || '').trim().slice(0, 120);
      const parentEmail = normEmail(body.parentEmail);
      const studentName = (body.studentName || '').trim().slice(0, 120);
      const studentEmail = normEmail(body.studentEmail);
      const utm = {
        utm_source: (body.utm_source || '').slice(0, 120),
        utm_medium: (body.utm_medium || '').slice(0, 120),
        utm_campaign: (body.utm_campaign || '').slice(0, 120),
        utm_content: (body.utm_content || '').slice(0, 120),
      };

      if (!parentName || !parentEmail || !studentName || !studentEmail) {
        return Response.json({ success: false, error: 'Please fill in all four fields.' }, { status: 400 });
      }
      if (!isEmail(parentEmail) || !isEmail(studentEmail)) {
        return Response.json({ success: false, error: 'Please enter valid email addresses.' }, { status: 400 });
      }
      if (parentEmail === studentEmail) {
        return Response.json({ success: false, error: "Parent and student emails can't be the same." }, { status: 400 });
      }

      // Basic rate limit: block a duplicate gift checkout started for the same
      // student email in the last 60 seconds (stops double-clicks + spam).
      try {
        const recent = await base44.asServiceRole.entities.PendingSemesterGift.filter({
          student_email: studentEmail,
          created_date: { $gte: new Date(Date.now() - 60 * 1000).toISOString() },
        });
        if (recent?.length) {
          return Response.json({ success: false, error: 'A checkout was just started for that student. Check your email for the link, or wait a minute and try again.' }, { status: 429 });
        }
      } catch (e) { console.error('[giftProCheckout] ratelimit lookup failed:', e?.message || e); }

      // Never double-charge: if the student already has active paid Pro, say so.
      let studentUser = null;
      try {
        const existing = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
        studentUser = existing?.[0] || null;
        if (studentUser && studentUser.subscription_status === 'active' && studentUser.stripe_subscription_id) {
          return Response.json({ success: false, already_pro: true, error: 'Good news — this student already has CLIFF Pro. No payment needed!' });
        }
      } catch (e) { console.error('[giftProCheckout] student lookup failed:', e?.message || e); }

      const meta = {
        offer: 'fall_semester_gift',
        plan: 'fall_semester_gift',
        parent_name: parentName,
        parent_email: parentEmail,
        student_name: studentName,
        gift_student_email: studentEmail,
        subscription_tier: 'cff',
        ...utm,
      };

      const form = new URLSearchParams({
        mode: 'payment',
        'line_items[0][price]': FALL_SEMESTER_GIFT_PRICE,
        'line_items[0][quantity]': '1',
        success_url: `${APP_BASE}/#/ForParents/thanks`,
        cancel_url: `${APP_BASE}/#/ForParents`,
        'metadata[offer]': meta.offer,
        'metadata[plan]': meta.plan,
        'metadata[parent_name]': meta.parent_name,
        'metadata[parent_email]': meta.parent_email,
        'metadata[student_name]': meta.student_name,
        'metadata[gift_student_email]': meta.gift_student_email,
        'metadata[subscription_tier]': meta.subscription_tier,
        'metadata[utm_source]': meta.utm_source,
        'metadata[utm_medium]': meta.utm_medium,
        'metadata[utm_campaign]': meta.utm_campaign,
        'metadata[utm_content]': meta.utm_content,
      });
      form.set('customer_email', parentEmail);
      form.append('payment_method_collection', 'always');

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const session = await stripeRes.json();
      if (session.error || !session.url) {
        const message = session.error?.message || 'Checkout could not be created. Please try again.';
        console.error('[giftProCheckout] Stripe error (fall_semester_gift):', message);
        return Response.json({ success: false, error: message }, { status: 502 });
      }

      // Log checkout_started (idempotent, keyed on the Stripe session id).
      try {
        const event_key = `checkout_started:${session.id}`;
        const prior = await base44.asServiceRole.entities.ConversionEvent
          .filter({ event_key }).catch((e) => { console.error('[giftProCheckout] checkout_started lookup failed:', e?.message || e); return []; });
        if (!prior?.length) {
          await base44.asServiceRole.entities.ConversionEvent.create({
            user_id: studentUser?.id || '',
            user_email: studentEmail,
            event_name: 'checkout_started',
            event_key,
            trigger: utm.utm_source || 'parent_gift',
            plan_at_event: 'free',
            metadata: { offer: 'fall_semester_gift', student_email: studentEmail, student_name: studentName, parent_email: parentEmail, parent_name: parentName, ...utm },
          }).catch((e) => console.error('[giftProCheckout] checkout_started write failed:', e?.message || e));
        }
      } catch (e) { console.error('[giftProCheckout] checkout_started block failed:', e?.message || e); }

      return Response.json({ success: true, url: session.url });
    }

    // ── Existing subscription gift flow (pro_annual / pro_monthly) ───────
    const { studentEmail: rawEmail, successUrl, cancelUrl, plan: rawPlan } = body;
    const studentEmail = normEmail(rawEmail);
    const plan = PRO_PRICES[rawPlan] ? rawPlan : 'pro_annual'; // default gift = annual (best value)

    if (!studentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      return Response.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (studentEmail === user.email?.toLowerCase()) {
      return Response.json({ success: false, error: "That's your own email — enter your student's email." }, { status: 400 });
    }

    // Never double-charge: if this student already has active Pro, say so.
    const existing = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
    const student = existing?.[0];
    if (student && student.subscription_status === 'active') {
      return Response.json({
        success: false,
        already_pro: true,
        error: 'Good news — this student already has CLIFF Pro. No payment needed!',
      });
    }

    const subBody = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': PRO_PRICES[plan],
      'line_items[0][quantity]': '1',
      success_url: successUrl || 'https://collegefastforward.com/#/ParentAllSet?gift=success',
      cancel_url: cancelUrl || 'https://collegefastforward.com/#/ParentAllSet',
      client_reference_id: user.id,
      customer_email: user.email,
      'metadata[user_id]': user.id,
      'metadata[user_email]': user.email,
      'metadata[plan]': plan,
      'metadata[subscription_tier]': 'cff',
      'metadata[gift_student_email]': studentEmail,
      'subscription_data[metadata][subscription_tier]': 'cff',
      'subscription_data[metadata][plan]': `${plan}_gift`,
      'subscription_data[metadata][gifted_by_parent_id]': user.id,
      'subscription_data[metadata][gift_student_email]': studentEmail,
    });
    subBody.append('payment_method_collection', 'always');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: subBody.toString(),
    });

    const session = await stripeRes.json();
    if (session.error || !session.url) {
      const message = session.error?.message || 'Checkout could not be created. Please try again.';
      console.error('[giftProCheckout] Stripe error:', message);
      return Response.json({ success: false, error: message }, { status: 502 });
    }

    // Log checkout_started (idempotent) — the gift conversion subject is the
    // student; fall back to the paying parent if the student has no account yet.
    const giftStudent = student || null;
    const evtUserId = giftStudent?.id || user.id;
    const evtUserEmail = giftStudent?.email || studentEmail;
    const event_key = `${evtUserId}:checkout_started`;
    try {
      const existingEvt = await base44.asServiceRole.entities.ConversionEvent
        .filter({ event_key }).catch((e) => { console.error('[giftProCheckout] checkout_started lookup failed:', e?.message || e); return []; });
      if (!existingEvt?.length) {
        await base44.asServiceRole.entities.ConversionEvent.create({
          user_id: evtUserId,
          user_email: evtUserEmail,
          event_name: 'checkout_started',
          event_key,
          trigger: 'parent_gift',
          plan_at_event: 'free',
          metadata: { student_email: studentEmail, gifted_by_parent_id: user.id, gifted_by_parent_email: user.email },
        }).catch((e) => console.error('[giftProCheckout] checkout_started write failed:', e?.message || e));
      }
    } catch (e) { console.error('[giftProCheckout] checkout_started block failed:', e?.message || e); }

    return Response.json({ success: true, url: session.url });
  } catch (e) {
    console.error('giftProCheckout error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}