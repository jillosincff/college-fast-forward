import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

const PRICES = {
  monthly: 'price_1T7pOU873TV7WMcTbbBXguCb', // $29/month
  annual:  'price_1T7pQp873TV7WMcTdp7SsboC', // $249/year
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── 402 guard: parent MUST have a Stripe customer with a card on file ──
    if (!user.stripe_customer_id) {
      return Response.json({
        success: false,
        reason: 'credit_card_required',
        error: 'Please add a payment method before gifting FastIQ.',
      }, { status: 402 });
    }

    // Verify the Stripe customer actually has a default payment method
    let stripeCustomer;
    try {
      stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id, {
        expand: ['default_source', 'invoice_settings.default_payment_method'],
      });
    } catch (e) {
      return Response.json({
        success: false,
        reason: 'credit_card_required',
        error: 'Could not verify payment method. Please add a card first.',
      }, { status: 402 });
    }

    const hasCard = !!(
      stripeCustomer?.invoice_settings?.default_payment_method ||
      stripeCustomer?.default_source
    );
    if (!hasCard) {
      return Response.json({
        success: false,
        reason: 'credit_card_required',
        error: 'Please add a payment method before gifting FastIQ.',
      }, { status: 402 });
    }

    const { studentId, studentEmail: rawEmail, plan = 'monthly' } = await req.json();
    const studentEmail = rawEmail?.trim().toLowerCase() || null;

    if (!studentId && !studentEmail) {
      return Response.json({ error: 'Either studentId or studentEmail is required' }, { status: 400 });
    }

    const priceId = PRICES[plan];
    if (!priceId) {
      return Response.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const parentName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Your parent';

    // ── Find student ──
    let student = null;
    if (studentId) {
      try { student = await base44.asServiceRole.entities.User.get(studentId); } catch (e) { student = null; }
      if (student && user.school_code && student.school_code !== user.school_code) {
        return Response.json({ error: 'Student not found at your school' }, { status: 403 });
      }
    } else if (studentEmail) {
      const results = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
      student = results?.[0] || null;
    }

    // Track student email on parent record
    const targetEmail = studentEmail || student?.email;
    if (targetEmail) {
      const currentEmails = user.student_emails || [];
      if (!currentEmails.includes(targetEmail)) {
        await base44.asServiceRole.entities.User.update(user.id, {
          student_emails: [...currentEmails, targetEmail],
        });
      }
    }

    // ── Student already has FastIQ ──
    const alreadyActive = student && !!(
      student.fastiq_setup_complete ||
      student.subscription_status === 'active' ||
      student.membership_tier === 'fastiq' ||
      student.trial_status === 'active' ||
      student.fastiq_trial_active === true
    );
    if (alreadyActive) {
      return Response.json({
        success: true,
        status: 'already_active',
        message: `${student.first_name || student.full_name?.split(' ')[0] || 'Your student'} already has FastIQ access!`,
      });
    }

    // ── Create Stripe subscription on PARENT's customer with 5-day trial ──
    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: priceId }],
      trial_period_days: 5,
      metadata: {
        subscription_tier: 'fastiq',
        plan: `fastiq_gift_${plan}`,
        gifted_by_parent_id: user.id,
        gifted_to_student_email: targetEmail || '',
        gifted_to_student_id: student?.id || '',
      },
    });

    // ── Activate student if they're already on CFF ──
    if (student) {
      await base44.asServiceRole.entities.User.update(student.id, {
        subscription_status: 'active',
        membership_tier: 'fastiq',
        fastiq_active: true,
        is_fastiq: true,
        fastiq_setup_complete: true,
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        trial_status: 'active',
        fastiq_trial_active: true,
        fastiq_gifted_by_user_id: user.id,
        fastiq_gift_subscription_id: subscription.id,
        gifted_by_parent_email: user.email,
        linked_parent_name: parentName,
      });

      base44.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail: student.email,
        studentFirstName: student.first_name || student.full_name?.split(' ')[0] || 'there',
        parentFirstName: user.first_name || user.full_name?.split(' ')[0] || 'Your parent',
        trialDays: 5,
      }).catch(e => console.error('Gift email failed:', e.message));

      base44.functions.invoke('logAnalyticsEvent', {
        event_name: 'fastiq_gifted',
        properties: {
          gifted_by: user.id,
          gifted_to: student.id,
          school_code: user.school_code || '',
          plan,
          subscription_id: subscription.id,
          method: studentId ? 'name_search' : 'email_lookup',
        },
      }).catch(() => {});

      return Response.json({
        success: true,
        status: 'activated',
        studentName: student.first_name || student.full_name?.split(' ')[0] || 'Your student',
      });
    }

    // ── Student not on CFF yet — store pending gift with subscription ID ──
    if (targetEmail) {
      const currentPending = user.pending_fastiq_gift_emails || [];
      const pendingGifts = user.pending_fastiq_gifts || {};
      if (!currentPending.includes(targetEmail)) {
        await base44.asServiceRole.entities.User.update(user.id, {
          pending_fastiq_gift_emails: [...currentPending, targetEmail],
          pending_fastiq_gifts: { ...pendingGifts, [targetEmail]: subscription.id },
        });
      }

      base44.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail: targetEmail,
        studentFirstName: 'there',
        parentFirstName: user.first_name || user.full_name?.split(' ')[0] || 'Your parent',
        trialDays: 5,
      }).catch(e => console.error('Pending gift email failed:', e.message));

      return Response.json({
        success: true,
        status: 'pending',
        message: `We've sent an invite to ${targetEmail}. Their trial will activate when they sign up.`,
      });
    }

    return Response.json({ success: false, error: 'Student not found. Please try their email address instead.' }, { status: 404 });

  } catch (e) {
    console.error('giftFastIQToStudent error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});