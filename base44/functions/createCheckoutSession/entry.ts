import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRICES = {
  fastiq_monthly:          'price_1T7pOU873TV7WMcTbbBXguCb',  // $29/month
  fastiq_annual:           'price_1T7pQp873TV7WMcTdp7SsboC',  // $249/year
  fastiq_founding_monthly: 'price_1TFPPy873TV7WMcTSw0rKVfj',  // $14.50/month
  fastiq_founding_annual:  'price_1TFPQq873TV7WMcTaE82WeKy',  // $124.50/year
  career_archetype:        'price_1TFKl2873TV7WMcTTHDGZHk6',  // $49 one-time
};

const FOUNDING_OFFER_DEADLINE = new Date('2026-04-15T23:59:59');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { plan, successUrl, cancelUrl, user: clientUser } = await req.json();

    if (!clientUser?.id || !clientUser?.email) {
      return Response.json({ error: 'User context required' }, { status: 400 });
    }

    if (!PRICES[plan]) {
      return Response.json({ success: false, error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const isSubscription = plan !== 'career_archetype';
    const isFoundingPlan = plan.includes('founding');

    if (isFoundingPlan && new Date() > FOUNDING_OFFER_DEADLINE) {
      return Response.json({
        success: false,
        error: 'The founding member offer has expired.',
        offer_expired: true,
      }, { status: 400 });
    }

    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');

    const body = new URLSearchParams({
      mode: isSubscription ? 'subscription' : 'payment',
      'line_items[0][price]': PRICES[plan],
      'line_items[0][quantity]': '1',
      success_url: successUrl || 'https://collegefastforward.com/#Dashboard?upgrade=success',
      cancel_url: cancelUrl || 'https://collegefastforward.com/#Dashboard',
      client_reference_id: clientUser.id,
      'metadata[user_id]': clientUser.id,
      'metadata[user_email]': clientUser.email,
      'metadata[plan]': plan,
    });

    if (isSubscription) {
      body.append('subscription_data[trial_period_days]', '7');
      body.append('subscription_data[metadata][user_id]', clientUser.id);
      body.append('subscription_data[metadata][plan]', plan);
    }

    if (clientUser.email) {
      body.append('customer_email', clientUser.email);
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
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
    console.error('Checkout error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});