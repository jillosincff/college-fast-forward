import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRICES = {
  pro_monthly: 'price_1TZyJ8873TV7WMcTiMisnPsg',  // $19.96/month ($4.99/week × 4)
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { plan, successUrl, cancelUrl, user: clientUser } = await req.json();

    if (!clientUser?.id || !clientUser?.email) {
      return Response.json({ error: 'User context required' }, { status: 400 });
    }

    // Ownership check — prevent one user from creating a checkout for another
    if (
      clientUser.id !== currentUser.id &&
      clientUser.email?.toLowerCase() !== currentUser.email?.toLowerCase()
    ) {
      console.error('[Security] Checkout ownership mismatch', { clientUserId: clientUser.id, currentUserId: currentUser.id });
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!PRICES[plan]) {
      return Response.json({ success: false, error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const isSubscription = true;

    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');

    const body = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': PRICES[plan],
      'line_items[0][quantity]': '1',
      success_url: successUrl || 'https://collegefastforward.com/#Dashboard?upgrade=success',
      cancel_url: cancelUrl || 'https://collegefastforward.com/#Dashboard',
      client_reference_id: clientUser.id,
      'metadata[user_id]': clientUser.id,
      'metadata[user_email]': clientUser.email,
      'metadata[plan]': plan,
      'metadata[subscription_tier]': 'cff',
    });

    // Hard paywall — no trial, charge immediately at signup.
    body.append('payment_method_collection', 'always');
    body.append('subscription_data[metadata][user_id]', clientUser.id);
    body.append('subscription_data[metadata][plan]', plan);
    body.append('subscription_data[metadata][subscription_tier]', 'cff');
    if (clientUser.family_id) {
      body.append('subscription_data[metadata][family_id]', clientUser.family_id);
      body.append('metadata[family_id]', clientUser.family_id);
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