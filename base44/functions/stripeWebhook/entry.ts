import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

import { secrets } from 'base44:runtime';

// HTML escape utility
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Fall Semester Gift: Pro through Dec 31 23:59 ET (America/New_York, EST).
const FALL_SEMESTER_ENDS_AT = '2026-12-31T23:59:00-05:00';

export default async function(req) {
  try {
    // Helpers close over this request's client, never a shared mutable client.
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    });

async function findUserByCustomerId(customerId) {
  const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
  return users?.length > 0 ? users[0] : null;
}

async function findStudentByGiftSubscriptionId(subscriptionId) {
  let users = await base44.asServiceRole.entities.User.filter({ fastiq_gift_subscription_id: subscriptionId });
  if (!users?.length) {
    users = await base44.asServiceRole.entities.User.filter({ pro_gift_subscription_id: subscriptionId });
  }
  return users?.length > 0 ? users[0] : null;
}

async function revokeGiftedStudentAccess(subscriptionId) {
  const student = await findStudentByGiftSubscriptionId(subscriptionId);
  if (!student) return;
  await base44.asServiceRole.entities.User.update(student.id, {
    subscription_status: 'canceled',
    membership_tier: 'free',
    fastiq_active: false,
    is_fastiq: false,
    fastiq_setup_complete: false,
    trial_status: 'expired',
    fastiq_trial_active: false,
    // Clear stale gift fields so re-gifting works cleanly
    fastiq_gifted_by_user_id: null,
    fastiq_gift_subscription_id: null,
    pro_gift_subscription_id: null,
  });
  await downgradeAccessPlanToFree(student);
  console.log('[stripeWebhook] Gifted FastIQ revoked for student:', student.id, 'sub:', subscriptionId);
}

// ── UserAccessPlan upsert — the canonical record admin reports and
// useAccessPlan.js read. The webhook used to only update User fields, so a
// paid student still showed "zero Pro" in access plans and hit free locks.
// Best-effort by design: a plan-write failure must never fail the webhook
// after the User fields were already updated.
async function upsertProAccessPlan(user, { source = 'billing_provider', periodEnd = null, periodEndIso = null } = {}) {
  if (!user?.id) return;
  try {
    const endIso = periodEndIso || (periodEnd ? new Date(periodEnd * 1000).toISOString() : null);
    const fields = {
      plan: 'pro',
      access_state: 'pro_active',
      access_source: source === 'parent_gift' ? 'billing_provider' : source,
      ...(endIso ? { paid_period_ends_at: endIso } : {}),
    };
    const existing = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
    if (existing?.length > 0) {
      await base44.asServiceRole.entities.UserAccessPlan.update(existing[0].id, fields);
    } else {
      await base44.asServiceRole.entities.UserAccessPlan.create({
        user_id: user.id,
        user_email: user.email,
        ...fields,
      });
    }
    console.log('[stripeWebhook] UserAccessPlan set to pro_active:', user.email, 'source:', source);
  } catch (e) {
    console.error('[stripeWebhook] UserAccessPlan upsert failed for', user.email, e.message);
  }
}

// Drop a user's UserAccessPlan back to free (cancel) / past_due. Never throws.
async function downgradeAccessPlanToFree(user, accessState = 'free') {
  if (!user?.id) return;
  try {
    const existing = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
    if (!existing?.length) return;
    await base44.asServiceRole.entities.UserAccessPlan.update(existing[0].id, {
      plan: 'free',
      access_state: accessState,
      access_source: 'billing_provider',
    });
    console.log('[stripeWebhook] UserAccessPlan downgraded:', user.email, '→', accessState);
  } catch (e) {
    console.error('[stripeWebhook] UserAccessPlan downgrade failed for', user.email, e.message);
  }
}

// ── Fall Semester Gift: one-time $99 checkout → activate student Pro ─────
// Runs inside checkout.session.completed for offer=fall_semester_gift. Never
// touches the subscription/founding/family logic — the caller breaks after.
async function handleFallSemesterGift(session, event) {
  const studentEmail = session.metadata?.gift_student_email?.trim().toLowerCase() || '';
  const studentName = session.metadata?.student_name || '';
  const parentName = session.metadata?.parent_name || '';
  const parentEmail = session.metadata?.parent_email || '';
  const utm = {
    utm_source: session.metadata?.utm_source || '',
    utm_medium: session.metadata?.utm_medium || '',
    utm_campaign: session.metadata?.utm_campaign || '',
    utm_content: session.metadata?.utm_content || '',
  };
  const amountCents = session.amount_total ?? 9900;
  const paymentIntentId = session.payment_intent || '';
  const customerId = session.customer || '';
  const evtKey = `gift_semester_paid:${event.id}`;

  if (!studentEmail) {
    console.error('[stripeWebhook] fall_semester_gift missing gift_student_email', event.id);
    return;
  }

  const studentMatches = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
  const student = studentMatches?.[0] || null;

  if (student) {
    try {
      await base44.asServiceRole.entities.User.update(student.id, {
        subscription_status: 'active',
        subscription_tier: 'cff',
        membership_tier: 'cff',
        fastiq_active: true,
        is_fastiq: true,
        gifted_by_parent_email: parentEmail,
        linked_parent_name: parentName?.split(' ')[0] || 'Your parent',
      });
    } catch (e) { console.error('[stripeWebhook] semester gift user update failed:', studentEmail, e.message); }
    await upsertProAccessPlan(student, { source: 'parent_gift_semester', periodEndIso: FALL_SEMESTER_ENDS_AT });

    try {
      const first = student.full_name?.split(' ')[0] || 'there';
      const parentFirst = parentName?.split(' ')[0] || 'Your parent';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: student.email,
        subject: `${parentFirst} just got you CLIFF Pro for the fall 🎁`,
        body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:32px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">🎁 A GIFT FROM ${escapeHtml(parentFirst.toUpperCase())}</p>
    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;">CLIFF Pro is now yours, ${escapeHtml(first)}!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">Your parent got you the Fall semester. Pro is on through December 31.</p>
  </div>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:20px;margin:16px 0;">
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ The openings worth your time (Best Moves)</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ A resume tailored to each job in minutes</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Follow-up reminders with the message drafted</p>
    <p style="font-size:14px;color:#4c1d95;margin:0;">✓ Mock interview practice + one tracker for every application</p>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://collegefastforward.com/#/FreeTierDashboard" style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;">Open My Dashboard</a>
  </div>
</div>`,
      });
    } catch (e) { console.error('[stripeWebhook] semester gift student email failed:', e.message); }
  } else {
    // Student not registered yet — record the pending gift + send an invite.
    try {
      await base44.asServiceRole.entities.PendingSemesterGift.create({
        student_email: studentEmail,
        student_name: studentName,
        parent_name: parentName,
        parent_email: parentEmail,
        stripe_payment_intent_id: paymentIntentId,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: customerId,
        amount_cents: amountCents,
        expires_at: FALL_SEMESTER_ENDS_AT,
        status: 'pending',
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        offer: 'fall_semester_gift',
      });
    } catch (e) { console.error('[stripeWebhook] PendingSemesterGift create failed:', studentEmail, e.message); }

    try {
      const parentFirst = parentName?.split(' ')[0] || 'Your parent';
      const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: studentEmail }] }],
          from: { email: 'team@collegefastforward.com', name: 'College Fast Forward' },
          subject: `${parentFirst} got you CLIFF Pro for the fall — claim it 🎁`,
          content: [{ type: 'text/html', value: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">${escapeHtml(parentFirst)} got you CLIFF Pro for the fall 🎁</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Your parent got you CLIFF Pro for the Fall semester. Pro is paid for and waiting — just sign up with this email address and it activates instantly, through December 31.</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">CLIFF picks the jobs worth your time, tailors your resume to each one, drafts your follow-ups, and runs interview practice.</p>
  <a href="https://collegefastforward.com/#/GatorAuth" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Claim My CLIFF Pro →</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">The College Fast Forward Team</p>
</div>` }],
        }),
      });
    } catch (e) { console.error('[stripeWebhook] semester gift invite email failed:', e.message); }
  }

  // Parent confirmation email.
  if (parentEmail) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: parentEmail,
        subject: `You just gave ${studentName || studentEmail} CLIFF Pro for the fall 💜`,
        body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Your gift is on its way</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Hi ${escapeHtml(parentName?.split(' ')[0] || 'there')},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">You gave <strong>${escapeHtml(studentName || studentEmail)}</strong> CLIFF Pro for the Fall semester. You paid $99 once — not a subscription. ${student ? "It's active on their account now, and we've emailed them the good news." : "The moment they sign up with that email, Pro activates — we've sent them an invite."}</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Pro is on through December 31, then it simply ends. No renewal, nothing to cancel.</p>
  <p style="font-size:13px;color:#94a3b8;margin-top:24px;">Full refund within 14 days if they don't use it — just reply to this email.<br>The College Fast Forward Team</p>
</div>`,
      });
    } catch (e) { console.error('[stripeWebhook] semester gift parent receipt failed:', e.message); }
  }

  // ConversionEvent gift_semester_paid (idempotent on Stripe event id).
  try {
    const prior = await base44.asServiceRole.entities.ConversionEvent.filter({ event_key: evtKey });
    if (!prior?.length) {
      await base44.asServiceRole.entities.ConversionEvent.create({
        user_id: student?.id || '',
        user_email: studentEmail,
        event_name: 'gift_semester_paid',
        event_key: evtKey,
        trigger: utm.utm_source || 'parent_gift',
        plan_at_event: 'fall_semester_gift',
        metadata: { amount_cents: amountCents, parent_email: parentEmail, parent_name: parentName, student_name: studentName, stripe_customer_id: customerId, stripe_payment_intent_id: paymentIntentId, ...utm },
      });
    }
  } catch (e) { console.error('[stripeWebhook] gift_semester_paid log failed:', e.message); }

  base44.asServiceRole.entities.AnalyticsEvent.create({
    event_name: 'gift_semester_paid',
    user_id: student?.id || '',
    user_email: studentEmail,
    properties: { parent_email: parentEmail, student_registered: !!student, amount_cents: amountCents, ...utm },
  }).catch((e) => console.error('[stripeWebhook] event log failed:', e.message));
}

// ── Fall Semester Gift refund → downgrade + mark pending + log ──────────
async function handleFallSemesterRefund(charge, event) {
  const studentEmail = charge.metadata?.gift_student_email?.trim().toLowerCase() || '';
  if (!studentEmail) {
    console.error('[stripeWebhook] fall_semester refund missing gift_student_email', event.id);
    return;
  }
  const studentMatches = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
  const student = studentMatches?.[0] || null;

  // Downgrade unless the student now has an active PAID subscription.
  let hasActivePaidSub = false;
  if (student) {
    try {
      const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: student.id });
      hasActivePaidSub = (plans || []).some((p) => p.access_state === 'pro_active' && p.access_source === 'billing_provider');
    } catch (e) { console.error('[stripeWebhook] refund access-plan lookup failed:', e.message); }
  }
  if (student && !hasActivePaidSub) {
    try {
      await base44.asServiceRole.entities.User.update(student.id, {
        subscription_status: 'canceled',
        membership_tier: 'free',
        fastiq_active: false,
        is_fastiq: false,
      });
    } catch (e) { console.error('[stripeWebhook] refund user downgrade failed:', e.message); }
    await downgradeAccessPlanToFree(student, 'free');
  }

  // Mark any PendingSemesterGift for this student as refunded.
  try {
    const pendings = await base44.asServiceRole.entities.PendingSemesterGift.filter({ student_email: studentEmail });
    for (const p of (pendings || [])) {
      if (p.status === 'refunded') continue;
      await base44.asServiceRole.entities.PendingSemesterGift.update(p.id, {
        status: 'refunded', refunded_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('[stripeWebhook] refund pending mark failed:', e.message); }

  // ConversionEvent gift_semester_refunded (idempotent on Stripe event id).
  const evtKey = `gift_semester_refunded:${event.id}`;
  try {
    const prior = await base44.asServiceRole.entities.ConversionEvent.filter({ event_key: evtKey });
    if (!prior?.length) {
      await base44.asServiceRole.entities.ConversionEvent.create({
        user_id: student?.id || '',
        user_email: studentEmail,
        event_name: 'gift_semester_refunded',
        event_key: evtKey,
        trigger: 'refund',
        plan_at_event: 'fall_semester_gift',
        metadata: { stripe_charge_id: charge.id, stripe_payment_intent_id: charge.payment_intent || '' },
      });
    }
  } catch (e) { console.error('[stripeWebhook] gift_semester_refunded log failed:', e.message); }

  base44.asServiceRole.entities.AnalyticsEvent.create({
    event_name: 'gift_semester_refunded',
    user_id: student?.id || '',
    user_email: studentEmail,
    properties: { stripe_charge_id: charge.id },
  }).catch((e) => console.error('[stripeWebhook] event log failed:', e.message));
}

// ── Subscription lifecycle logging (idempotent ConversionEvents) ──
// Each lifecycle event is keyed on the Stripe event id (retry-safe), except
// subscription_cancel_scheduled which is keyed per-subscription so it logs
// once when cancel_at_period_end flips true (not on every subsequent update).
function detectPlan(meta, sub) {
  if (meta?.plan) return meta.plan;
  try {
    const interval = sub?.items?.[0]?.price?.recurring?.interval;
    if (interval === 'year') return 'pro_annual';
  } catch {}
  return 'pro_monthly';
}
function detectSource(meta, giftEmail) {
  if (giftEmail || meta?.gift_student_email) return 'gift';
  if (meta?.gifted_by_parent_invite || meta?.gifted_by_parent_id) return 'parent_invite';
  return 'self';
}
async function logConversionEvent(eventKey, { user, email, eventName, plan, amountCents, customerId, subscriptionId, source }) {
  try {
    const existing = await base44.asServiceRole.entities.ConversionEvent.filter({ event_key: eventKey });
    if (existing && existing.length > 0) {
      console.log('[stripeWebhook] ConversionEvent already logged:', eventName, eventKey);
      return;
    }
    await base44.asServiceRole.entities.ConversionEvent.create({
      user_id: user?.id || '',
      user_email: email || user?.email || '',
      event_name: eventName,
      event_key: eventKey,
      trigger: source,
      plan_at_event: plan || '',
      metadata: {
        amount_cents: amountCents ?? null,
        stripe_customer_id: customerId || '',
        stripe_subscription_id: subscriptionId || '',
        source,
        plan: plan || '',
      },
    });
    console.log('[stripeWebhook] ConversionEvent logged:', eventName, eventKey);
  } catch (e) {
    console.error('[stripeWebhook] ConversionEvent log failed:', eventName, e.message);
  }
}

async function findBillingUser(customerId, userId, userEmail) {
  if (customerId) {
    const user = await findUserByCustomerId(customerId);
    if (user) return user;
  }
  if (userId) {
    try {
      const user = await base44.asServiceRole.entities.User.get(userId);
      if (user) return user;
    } catch (e) {
      console.log('User not found by metadata user_id:', userId);
    }
  }
  if (userEmail) {
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users?.length > 0) return users[0];
  }
  console.error('[stripeWebhook] CRITICAL: Could not find billing user. customerId:', customerId, 'userId:', userId, 'email:', userEmail);
  return null;
}

async function findFamily(familyId, customerId) {
  if (familyId) {
    try {
      const family = await base44.asServiceRole.entities.Family.get(familyId);
      if (family) return family;
    } catch (e) {
      console.log('Family not found by ID:', familyId);
    }
  }
  if (customerId) {
    const families = await base44.asServiceRole.entities.Family.filter({ stripe_customer_id: customerId });
    if (families?.length > 0) return families[0];
  }
  const user = await findUserByCustomerId(customerId);
  if (user?.family_id) {
    try {
      return await base44.asServiceRole.entities.Family.get(user.family_id);
    } catch (e) {
      console.log('Family not found by user.family_id:', user.family_id);
    }
  }
  return null;
}

async function updateAllFamilyMembers(family, updates) {
  if (!family) return;
  const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
  for (const memberId of allMemberIds) {
    try {
      await base44.asServiceRole.entities.User.update(memberId, updates);
    } catch (err) {
      console.error('Failed to update family member:', memberId, err.message);
    }
  }
}

async function getLinkedStudentEmails(billingUser, family) {
  const emails = [];
  if (billingUser?.student_emails?.length) {
    emails.push(...billingUser.student_emails);
  }
  if (family?.student_ids?.length) {
    for (const sid of family.student_ids) {
      try {
        const student = await base44.asServiceRole.entities.User.get(sid);
        if (student?.email && !emails.includes(student.email)) {
          emails.push(student.email);
        }
      } catch (e) {}
    }
  }
  return emails;
}

async function sendStudentActivationEmails(billingUser, family) {
  const studentEmails = await getLinkedStudentEmails(billingUser, family);
  const parentName = billingUser?.full_name?.split(' ')[0] || 'Your parent';

  for (const email of studentEmails) {
    try {
      let studentFirstName = 'there';
      try {
        const students = await base44.asServiceRole.entities.User.filter({ email });
        if (students?.length > 0) studentFirstName = students[0].full_name?.split(' ')[0] || 'there';
      } catch (e) {}

      await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail: email,
        studentFirstName,
        parentFirstName: parentName,
        trialDays: 5,
      });
      console.log('[stripeWebhook] Rich FastIQ gift email sent to student:', email);
    } catch (emailError) {
      console.error('[stripeWebhook] Student email failed:', { email, error: emailError.message });
    }
  }
}

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET')?.trim();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook received:', event.type);

    switch (event.type) {

      // CHECKOUT COMPLETED
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const subscriptionTier = session.metadata?.subscription_tier || 'cff';
        const familyId = session.metadata?.family_id;
        const billingUserEmail = session.metadata?.user_email;
        const billingUserId = session.metadata?.user_id;
        const isFoundingMember = session.metadata?.is_founding_member === 'true';
        const plan = session.metadata?.plan;
        // Parent gift purchase: Pro goes to the STUDENT, not the buyer
        const giftStudentEmail = session.metadata?.gift_student_email?.trim().toLowerCase() || null;

        console.log('Checkout completed:', { subscriptionTier, customerId, familyId, billingUserEmail, isFoundingMember, plan });

        // ── Fall Semester Gift (one-time, mode=payment) — handle & break ──
        if (session.metadata?.offer === 'fall_semester_gift') {
          await handleFallSemesterGift(session, event);
          break;
        }

        const billingUser = await findBillingUser(customerId, billingUserId, billingUserEmail);
        if (billingUser) {
          // Any completed paid checkout = premium access. checkIsFastIQ /
          // entitlements read these User fields, so keep them consistent for
          // CLIFF Pro too (old code left membership_tier untouched for cff).
          const isFoundingTier = billingUser.membership_tier === 'founding_gator' || isFoundingMember;
          const userUpdates = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
            fastiq_active: true,
            is_fastiq: true,
            membership_tier: subscriptionTier === 'fastiq'
              ? 'fastiq'
              : (isFoundingTier ? billingUser.membership_tier : 'cff'),
          };

          if (isFoundingMember) {
            userUpdates.founding_offer_redeemed = true;
            userUpdates.founding_offer_redeemed_at = new Date().toISOString();
            userUpdates.founding_member_plan = plan;
          }

          await base44.asServiceRole.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user:', billingUser.id, 'tier:', subscriptionTier, 'founding:', isFoundingMember);

          // Self-pay: the paying student's access plan flips to Pro here.
          // Parent gifts upsert the STUDENT's plan in the gift branch below,
          // never the parent's.
          if (!giftStudentEmail) {
            await upsertProAccessPlan(billingUser, { source: 'billing_provider' });
          }

          base44.asServiceRole.entities.AnalyticsEvent.create({
            event_name: 'subscription_activated',
            user_id: billingUser.id,
            user_email: billingUser.email,
            school_code: billingUser.school_name || billingUser.school || '',
            properties: { plan: plan || subscriptionTier, is_founding: isFoundingMember, persona: billingUser.persona || '' },
          }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
          // Canonical conversion event — student self-pay activation.
          if (!giftStudentEmail) {
            base44.asServiceRole.entities.AnalyticsEvent.create({
              event_name: 'pro_activated',
              user_id: billingUser.id,
              user_email: billingUser.email,
              school_code: billingUser.school_name || billingUser.school || '',
              properties: { plan: plan || subscriptionTier, source: 'self_pay' },
            }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
            // ConversionEvent (admin funnel source of truth)
            const evtKey = `${billingUser.id}:pro_activated`;
            await base44.asServiceRole.entities.ConversionEvent.create({
              user_id: billingUser.id,
              user_email: billingUser.email,
              event_name: 'pro_activated',
              event_key: evtKey,
              trigger: 'self_pay',
              school_code: billingUser.school_name || billingUser.school || '',
              plan_at_event: plan || subscriptionTier,
            }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
          }

          // Lifecycle: subscription_activated (checkout, mode=subscription) — idempotent on Stripe event id
          if (session.mode === 'subscription') {
            await logConversionEvent(`subscription_activated:${subscriptionId}`, {
              user: billingUser,
              email: billingUser?.email,
              eventName: 'subscription_activated',
              plan: plan || detectPlan(session.metadata, null),
              amountCents: session.amount_total ?? null,
              customerId,
              subscriptionId,
              source: detectSource(session.metadata, giftStudentEmail),
            });
          }

          if (isFoundingMember) {
            try {
              await stripe.customers.update(customerId, {
                metadata: {
                  founding_offer_redeemed: 'true',
                  founding_offer_redeemed_at: new Date().toISOString(),
                },
              });
            } catch (e) {
              console.log('Could not update Stripe customer metadata:', e.message);
            }
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          const familyUpdates = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            billing_owner_id: billingUserId || billingUser?.id || '',
            billing_owner_email: billingUserEmail || billingUser?.email || '',
            billing_owner_name: billingUser?.full_name || '',
          };
          if (isFoundingMember) {
            familyUpdates.is_founding_subscriber = true;
            familyUpdates.founding_plan = 'fastiq_founding_annual';
          }

          await base44.asServiceRole.entities.Family.update(family.id, familyUpdates);
          console.log('Updated family:', family.id, 'tier:', subscriptionTier);

          const memberUpdates = {
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            fastiq_active: subscriptionTier === 'fastiq',
            is_fastiq: subscriptionTier === 'fastiq',
          };
          if (subscriptionTier === 'fastiq') {
            memberUpdates.membership_tier = 'fastiq';
          }
          await updateAllFamilyMembers(family, memberUpdates);
        }

        // Send confirmation email to the buyer (gifts get their own receipt below)
        if (billingUser?.email && !giftStudentEmail) {
          const userName = billingUser.full_name?.split(' ')[0] || 'there';
          const isFoundingEmail = isFoundingMember;
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: `Welcome to CLIFF Pro${isFoundingEmail ? ' — Founding Member' : ''}! 🎉`,
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:32px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">✨ CLIFF PRO ACTIVATED</p>
    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;">You're in, ${escapeHtml(userName)}!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">CLIFF is now working for you around the clock.</p>
  </div>
  <p style="font-size:15px;color:#0f172a;line-height:1.6;">Here's what just unlocked for you:</p>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:20px;margin:16px 0;">
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited CLIFF-powered applications</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited resume, interview &amp; company prep</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited outreach &amp; follow-ups</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Warm-connection searches at any company</p>
    <p style="font-size:14px;color:#4c1d95;margin:0;">✓ Proactive background work — CLIFF preps while you sleep</p>
  </div>
  ${isFoundingEmail ? '<div style="background:#f5f3ff;border:1px solid #c4b5fd;border-radius:14px;padding:16px 20px;margin:16px 0;"><p style="font-size:13px;color:#6d28d9;font-weight:700;margin:0 0 4px;">FOUNDING MEMBER</p><p style="font-size:13px;color:#475569;margin:0;">You locked in 50% off forever. Your rate never goes up.</p></div>' : ''}
  <div style="text-align:center;margin:32px 0;">
    <a href="https://collegefastforward.com/#/FreeTierDashboard" style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;">Go to My Dashboard</a>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;">Questions? Reply to this email — we're real people.</p>
</div>`,
            });
            console.log('[stripeWebhook] Confirmation email sent to:', billingUser.email);
          } catch (emailError) {
            console.error('[stripeWebhook] Confirmation email failed:', emailError.message);
          }
        }

        // Send activation emails to non-parent FastIQ buyers with family-linked students
        // Parent buyers are handled by the gifting loop below to avoid duplicate emails
        if (subscriptionTier === 'fastiq' && billingUser && billingUser.persona !== 'parent') {
          await sendStudentActivationEmails(billingUser, family);
        }

        // Parent-gifted FastIQ: activate student account + send gift email
        if (subscriptionTier === 'fastiq' && billingUser?.persona === 'parent') {
          const studentEmailsToGift = [
            ...(billingUser.student_emails || []),
            billingUser.pending_student_invite_email,
          ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

          for (const studentEmail of studentEmailsToGift) {
            try {
              const studentMatches = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
              const student = studentMatches?.[0];

              if (student) {
                if (student.stripe_customer_id && student.subscription_status === 'active' && !student.fastiq_trial_active) {
                  console.log('[stripeWebhook] Student already has paid FastIQ - skipping gift:', studentEmail);
                  continue;
                }

                await base44.asServiceRole.entities.User.update(student.id, {
                  subscription_status: 'active',
                  membership_tier: 'fastiq',
                  fastiq_active: true,
                  is_fastiq: true,
                  fastiq_setup_complete: true,
                  gifted_by_parent_email: billingUser.email,
                  linked_parent_name: billingUser.full_name?.split(' ')[0] || 'Your parent',
                  trial_start_date: new Date().toISOString(),
                  trial_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                  trial_status: 'active',
                  fastiq_trial_active: true,
                });

                await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
                  studentEmail: student.email,
                  studentFirstName: student.full_name?.split(' ')[0] || 'there',
                  parentFirstName: billingUser.full_name?.split(' ')[0] || 'Your parent',
                  trialDays: 5,
                }).catch(e => console.error('[stripeWebhook] Student gift email failed:', e.message));

                console.log('[stripeWebhook] FastIQ gifted to student:', studentEmail);
              } else {
                const existingPending = billingUser.pending_fastiq_gift_emails || [];
                const updatedPending = existingPending.includes(studentEmail)
                  ? existingPending
                  : [...existingPending, studentEmail];
                await base44.asServiceRole.entities.User.update(billingUser.id, {
                  pending_fastiq_gift_emails: updatedPending,
                });
                console.log('[stripeWebhook] Student not yet signed up - gift pending:', studentEmail);
              }
            } catch (giftErr) {
              console.error('[stripeWebhook] Parent gift FastIQ error for', studentEmail, ':', giftErr.message);
            }
          }
        }

        // ── CLIFF Pro gift: parent bought Pro for a specific student email ──
        if (giftStudentEmail) {
          try {
            const parentFirst = billingUser?.full_name?.split(' ')[0] || 'Your parent';
            const studentMatches = await base44.asServiceRole.entities.User.filter({ email: giftStudentEmail });
            const giftStudent = studentMatches?.[0];

            if (giftStudent) {
              // Student is registered — activate Pro immediately
              await base44.asServiceRole.entities.User.update(giftStudent.id, {
                subscription_status: 'active',
                subscription_tier: 'cff',
                membership_tier: 'cff',
                fastiq_active: true,
                is_fastiq: true,
                gifted_by_parent_email: billingUser?.email || '',
                linked_parent_name: parentFirst,
                pro_gift_subscription_id: subscriptionId,
              });
              await upsertProAccessPlan(giftStudent, { source: 'parent_gift', periodEnd: session.current_period_end });
              console.log('[stripeWebhook] CLIFF Pro gifted to student:', giftStudentEmail);
              // Canonical conversion events — parent paid + student upgraded.
              base44.asServiceRole.entities.AnalyticsEvent.create({
                event_name: 'parent_payment_completed',
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                properties: { parent_email: billingUser?.email || '', source: 'parent_invite', plan: plan || 'pro_monthly' },
              }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
              // ConversionEvent (admin funnel source of truth)
              const parentPayEvtKey = `${giftStudent.id}:parent_payment_completed`;
              await base44.asServiceRole.entities.ConversionEvent.create({
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                event_name: 'parent_payment_completed',
                event_key: parentPayEvtKey,
                trigger: 'parent_gift',
                school_code: giftStudent.school_name || giftStudent.school || '',
                plan_at_event: plan || 'pro_monthly',
              }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
              base44.asServiceRole.entities.AnalyticsEvent.create({
                event_name: 'pro_activated',
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                properties: { source: 'parent_gift', plan: plan || 'pro_monthly' },
              }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
              // ConversionEvent (admin funnel source of truth)
              const giftEvtKey = `${giftStudent.id}:pro_activated`;
              await base44.asServiceRole.entities.ConversionEvent.create({
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                event_name: 'pro_activated',
                event_key: giftEvtKey,
                trigger: 'parent_gift',
                school_code: giftStudent.school_name || giftStudent.school || '',
                plan_at_event: plan || 'pro_monthly',
              }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));

              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: giftStudent.email,
                  subject: `${parentFirst} just got you CLIFF Pro 🎁`,
                  body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:32px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">🎁 A GIFT FROM ${escapeHtml(parentFirst.toUpperCase())}</p>
    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;">CLIFF Pro is now yours, ${escapeHtml(giftStudent.full_name?.split(' ')[0] || 'there')}!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">${escapeHtml(parentFirst)} just upgraded your account. CLIFF now works for you around the clock.</p>
  </div>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:20px;margin:16px 0;">
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited CLIFF-powered applications</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited resume, interview &amp; company prep</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited outreach &amp; follow-ups</p>
    <p style="font-size:14px;color:#4c1d95;margin:0;">✓ Proactive background work — CLIFF preps while you sleep</p>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://collegefastforward.com/#/FreeTierDashboard" style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;">Open My Dashboard</a>
  </div>
</div>`,
                });
              } catch (e) { console.error('[stripeWebhook] Student Pro gift email failed:', e.message); }
            } else {
              // Student hasn't signed up yet — store the pending gift on the parent
              if (billingUser) {
                await base44.asServiceRole.entities.User.update(billingUser.id, {
                  pending_pro_gift_email: giftStudentEmail,
                  pending_pro_gift_subscription_id: subscriptionId,
                });
              }
              console.log('[stripeWebhook] Pro gift pending — student not signed up yet:', giftStudentEmail);

              // Invite email via SendGrid (recipient isn't a registered app user yet)
              try {
                const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
                await fetch('https://api.sendgrid.com/v3/mail/send', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    personalizations: [{ to: [{ email: giftStudentEmail }] }],
                    from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
                    subject: `${parentFirst} got you CLIFF Pro — claim it 🎁`,
                    content: [{ type: 'text/html', value: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">${escapeHtml(parentFirst)} just bought you CLIFF Pro 🎁</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">CLIFF is an AI career agent that finds internships and jobs for you, tailors your resume for each one, preps you for interviews, and follows up — automatically.</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Your Pro access is paid for and waiting. Just sign up with this email address and it activates instantly.</p>
  <a href="https://collegefastforward.com/#/GatorAuth" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Claim My CLIFF Pro →</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">Warmly,<br><strong>Jill Osinoff</strong><br>Founder, College Fast Forward</p>
</div>` }],
                  }),
                });
              } catch (e) { console.error('[stripeWebhook] Pending gift invite email failed:', e.message); }
            }

            // Receipt email to the parent
            if (billingUser?.email) {
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: billingUser.email,
                  subject: `You just gave ${giftStudentEmail} a real edge 💜`,
                  body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Your gift is on its way</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Hi ${escapeHtml(parentFirst)},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">You've gifted <strong>CLIFF Pro</strong> to <strong>${escapeHtml(giftStudentEmail)}</strong>. ${giftStudent ? "It's active on their account right now, and we've emailed them the good news." : "The moment they sign up with that email, Pro activates automatically — we've sent them an invite."}</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">CLIFF will now find opportunities, tailor their resume, prep them for interviews, and follow up on applications — around the clock. You'll be billed $19.96/month; cancel anytime.</p>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">Thank you for investing in their search.<br>The College Fast Forward Team</p>
</div>`,
                });
              } catch (e) { console.error('[stripeWebhook] Parent gift receipt email failed:', e.message); }
            }

            base44.asServiceRole.entities.AnalyticsEvent.create({
              event_name: 'pro_gift_purchased',
              user_id: billingUser?.id || '',
              user_email: billingUser?.email || '',
              properties: { student_email: giftStudentEmail, student_registered: !!giftStudent },
            }).catch(e => console.error('[stripeWebhook] event log failed:', e.message));
          } catch (proGiftErr) {
            console.error('[stripeWebhook] CLIFF Pro gift error:', proGiftErr.message);
          }
        }

        break;
      }

      // SUBSCRIPTION CREATED / UPDATED
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionTier = subscription.metadata?.subscription_tier;
        const familyId = subscription.metadata?.family_id;
        const status = subscription.status;
        const subGiftEmail = subscription.metadata?.gift_student_email?.trim().toLowerCase() || null;

        console.log('Subscription event:', event.type, { status, subscriptionTier, familyId });

        const billingUser = await findUserByCustomerId(customerId);

        const isActiveSub = (status === 'active' || status === 'trialing');
        const userUpdates = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          // Any active paid subscription = premium access, regardless of tier name
          fastiq_active: isActiveSub,
          is_fastiq: isActiveSub,
        };
        if (subscriptionTier) userUpdates.subscription_tier = subscriptionTier;
        if (subscription.trial_end) userUpdates.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
        if (subscription.current_period_end) userUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

        if (isActiveSub) {
          userUpdates.membership_tier = subscriptionTier || billingUser?.membership_tier || 'cff';
        } else if (subscriptionTier === 'fastiq') {
          userUpdates.membership_tier = (status === 'active' || status === 'trialing') ? 'fastiq' : billingUser?.membership_tier;
        }

        if (status === 'past_due' || status === 'canceled') {
          userUpdates.trial_status = 'expired';
          userUpdates.fastiq_trial_active = false;
          if (status === 'canceled') {
            userUpdates.subscription_status = 'canceled';
            userUpdates.fastiq_active = false;
            userUpdates.membership_tier = 'free';
          }
          // Revoke gifted student access if this is a parent-gifted subscription
          // (sendParentProInvite sets gifted_by_parent_invite / gift_student_email)
          if (subscription.metadata?.gifted_by_parent_id || subscription.metadata?.gifted_by_parent_invite || subGiftEmail) {
            await revokeGiftedStudentAccess(subscription.id);
          }
          if (billingUser) {
            await downgradeAccessPlanToFree(billingUser, status === 'canceled' ? 'free' : 'payment_past_due');
          }
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user subscription:', billingUser.id, status);
        }

        // Active/trialing subscription → keep UserAccessPlan pro_active in sync
        if (isActiveSub && (billingUser || subGiftEmail)) {
          if (subGiftEmail) {
            // Gifted subscription — the STUDENT holds the access, not the parent
            try {
              const giftMatches = await base44.asServiceRole.entities.User.filter({ email: subGiftEmail });
              if (giftMatches?.length > 0) {
                await upsertProAccessPlan(giftMatches[0], { source: 'parent_gift', periodEnd: subscription.current_period_end });
              }
            } catch (e) {}
          } else {
            await upsertProAccessPlan(billingUser, { source: 'billing_provider', periodEnd: subscription.current_period_end });
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          const familyUpdates = {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
          };
          if (subscriptionTier) familyUpdates.subscription_tier = subscriptionTier;
          if (subscription.trial_end) familyUpdates.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
          if (subscription.current_period_end) familyUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

          await base44.asServiceRole.entities.Family.update(family.id, familyUpdates);
          console.log('Updated family subscription:', family.id, status, subscriptionTier);

          const memberUpdates = { subscription_status: status };
          if (subscriptionTier) memberUpdates.subscription_tier = subscriptionTier;
          if (subscriptionTier === 'fastiq') {
            memberUpdates.fastiq_active = (status === 'active' || status === 'trialing');
          }
          await updateAllFamilyMembers(family, memberUpdates);
        }

        // Lifecycle logging (idempotent on Stripe event id)
        if (event.type === 'customer.subscription.created') {
          await logConversionEvent(`subscription_activated:${subscription.id}`, {
            user: billingUser,
            email: billingUser?.email,
            eventName: 'subscription_activated',
            plan: detectPlan(subscription.metadata, subscription),
            amountCents: subscription.items?.[0]?.price?.unit_amount ?? null,
            customerId,
            subscriptionId: subscription.id,
            source: detectSource(subscription.metadata, subGiftEmail),
          });
        }
        if (event.type === 'customer.subscription.updated' && subscription.cancel_at_period_end === true && subscription.status !== 'canceled') {
          // Stable per-subscription key so this logs once when cancel is scheduled, not on every later update
          await logConversionEvent(`subscription_cancel_scheduled:${subscription.id}`, {
            user: billingUser,
            email: billingUser?.email,
            eventName: 'subscription_cancel_scheduled',
            plan: detectPlan(subscription.metadata, subscription),
            amountCents: subscription.items?.[0]?.price?.unit_amount ?? null,
            customerId,
            subscriptionId: subscription.id,
            source: detectSource(subscription.metadata, subGiftEmail),
          });
        }
        break;
      }

      // SUBSCRIPTION DELETED
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const customerId = deletedSub.customer;
        const familyId = deletedSub.metadata?.family_id;

        // Lifecycle: subscription_canceled — idempotent on Stripe event id
        {
          const canceledUser = await findUserByCustomerId(customerId);
          await logConversionEvent(event.id, {
            user: canceledUser,
            email: canceledUser?.email,
            eventName: 'subscription_canceled',
            plan: detectPlan(deletedSub.metadata, deletedSub),
            amountCents: deletedSub.items?.[0]?.price?.unit_amount ?? null,
            customerId,
            subscriptionId: deletedSub.id,
            source: detectSource(deletedSub.metadata, deletedSub.metadata?.gift_student_email),
          });
        }

        // Handle gifted subscription cancellation — revoke student access
        // (sendParentProInvite sets gifted_by_parent_invite / gift_student_email — check all)
        if (deletedSub.metadata?.gifted_by_parent_id || deletedSub.metadata?.gifted_by_parent_invite || deletedSub.metadata?.gift_student_email) {
          await revokeGiftedStudentAccess(deletedSub.id);
        }

        const billingUser = await findUserByCustomerId(customerId);

        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member || billingUser.price_tier === 'founding' || billingUser.membership_tier === 'founding_gator')) {
          console.log('Skipping cancellation for founding member:', billingUser.id);
          break;
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
          await downgradeAccessPlanToFree(billingUser);
          console.log('Subscription canceled for billing user:', billingUser.id);

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: 'Your CLIFF Pro subscription has been canceled',
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Your CLIFF Pro subscription has been canceled</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Hi ${escapeHtml(billingUser.full_name?.split(' ')[0] || 'there')},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Your CLIFF Pro subscription has been canceled. The account will revert to the free tier — CLIFF stops working in the background, and unlimited applications, outreach, and prep are paused.</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">If this was a mistake, you can reactivate anytime from your dashboard.</p>
  <a href="https://collegefastforward.com/#/FreeTierDashboard" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Go to Dashboard</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">The College Fast Forward Team</p>
</div>`,
            });
            console.log('[stripeWebhook] Cancellation email sent:', billingUser.email);
          } catch (emailError) {
            console.error('[stripeWebhook] Cancellation email failed:', emailError.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          // Guard founding families from cancellation (check all possible flags)
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding' || family.is_founding_subscriber) {
            console.log('Skipping cancellation for founding family:', family.id);
            break;
          }

          await base44.asServiceRole.entities.Family.update(family.id, { subscription_status: 'canceled' });
          console.log('Family subscription canceled:', family.id);

          await updateAllFamilyMembers(family, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
        }
        break;
      }

      // PAYMENT FAILED
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        const attemptCount = invoice.attempt_count || 1;

        const billingUser = await findUserByCustomerId(customerId);
        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member)) {
          console.log('Skipping payment_failed for founding member:', billingUser.id);
          break;
        }

        let familyId = null;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            familyId = sub.metadata?.family_id;
          } catch (e) {
            console.log('Could not retrieve subscription for family_id');
          }
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, {
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString(),
            payment_failure_count: attemptCount,
          });
          console.log('Marked billing user as past_due:', billingUser.id, 'attempt:', attemptCount);

          // Lifecycle: payment_failed — idempotent on Stripe event id
          await logConversionEvent(event.id, {
            user: billingUser,
            email: billingUser?.email,
            eventName: 'payment_failed',
            plan: detectPlan(invoice.metadata, null),
            amountCents: invoice.amount_due ?? null,
            customerId,
            subscriptionId,
            source: detectSource(invoice.metadata, invoice.metadata?.gift_student_email),
          });

          const isDay3 = attemptCount >= 2;
          const urgency = isDay3 ? 'Your access will be deactivated soon' : 'Please update your payment method';

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: `Action required: Payment failed for CLIFF Pro — ${urgency}`,
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Payment failed</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Hi ${escapeHtml(billingUser.full_name?.split(' ')[0] || 'there')},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">We couldn't process your payment for CLIFF Pro. ${isDay3 ? "Access will be deactivated within 24 hours unless payment is resolved." : "Please update your payment method to keep CLIFF Pro active."}</p>
  <a href="https://collegefastforward.com/#/FreeTierDashboard" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Update Payment</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">The College Fast Forward Team</p>
</div>`,
            });
            console.log('[stripeWebhook] Payment failed email sent:', billingUser.email, 'attempt:', attemptCount);
          } catch (emailError) {
            console.error('[stripeWebhook] Payment failed email error:', emailError.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding' || family.is_founding_subscriber) break;
          await base44.asServiceRole.entities.Family.update(family.id, { subscription_status: 'past_due' });
          await updateAllFamilyMembers(family, { subscription_status: 'past_due' });
          console.log('Family marked past_due:', family.id);
        }
        break;
      }

      // INVOICE PAID — renewal
      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        if (invoice.billing_reason === 'subscription_cycle') {
          const billingUser = await findUserByCustomerId(customerId);
          // Lifecycle: subscription_renewed — idempotent on Stripe event id
          await logConversionEvent(event.id, {
            user: billingUser,
            email: billingUser?.email,
            eventName: 'subscription_renewed',
            plan: detectPlan(invoice.metadata, null),
            amountCents: invoice.amount_paid ?? invoice.total ?? null,
            customerId,
            subscriptionId,
            source: detectSource(invoice.metadata, invoice.metadata?.gift_student_email),
          });
        }
        break;
      }

      // CHARGE REFUNDED — Fall Semester Gift refund
      case 'charge.refunded': {
        const charge = event.data.object;
        if (charge.metadata?.offer === 'fall_semester_gift') {
          await handleFallSemesterRefund(charge, event);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}