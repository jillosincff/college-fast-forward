import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// CLIFF Pro prices — annual is the recommended gift (best value).
const PRO_PRICES = {
  pro_monthly: 'price_1TZyJ8873TV7WMcTiMisnPsg', // $19.96/month
  pro_annual: 'price_1U5EEH873TV7WMcTOOnQNksc',  // $149/year
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentEmail: rawEmail, successUrl, cancelUrl, plan: rawPlan } = await req.json();
    const studentEmail = rawEmail?.trim().toLowerCase();
    const plan = PRO_PRICES[rawPlan] ? rawPlan : 'pro_annual'; // default gift = annual (best value)

    if (!studentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      return Response.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
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

    const body = new URLSearchParams({
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
    body.append('payment_method_collection', 'always');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const session = await stripeRes.json();
    if (session.error) {
      return Response.json({ success: false, error: session.error.message }, { status: 500 });
    }

    return Response.json({ success: true, url: session.url });
  } catch (e) {
    console.error('giftProCheckout error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}