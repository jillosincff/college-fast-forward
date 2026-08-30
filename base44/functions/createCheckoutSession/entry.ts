import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRICES = {
  pro_monthly: 'price_1TZyJ8873TV7WMcTiMisnPsg',  // $19.96/month ($4.99/week × 4)
  pro_annual: 'price_1U5EEH873TV7WMcTOOnQNksc',   // $149/year (~$12.42/mo) — best value
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { plan, successUrl, cancelUrl, user: clientUser, returnTo, source } = await req.json();

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
    
    // Default to monthly for backward compatibility; annual is selectable on the paywall.
    if (!plan || !PRICES[plan]) {
      plan = 'pro_monthly';
    }

    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET) {
      console.error('[createCheckoutSession] STRIPE_SECRET_KEY is not set — cannot create Stripe session');
      return Response.json({ success: false, error: 'Payment is not configured. Please contact support.' }, { status: 500 });
    }

    // Post-pay landing: use the configured app URL (APP_BASE_URL) so the redirect
    // always works regardless of which domain the user started on.
    const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://college-fast-forward-fce23588.base44.app';
    let successUrlFinal = successUrl || `${APP_URL}/#/ProActivated?upgrade=success`;
    if (!successUrl) {
      if (returnTo) successUrlFinal += `&return_to=${encodeURIComponent(returnTo)}`;
      if (source) successUrlFinal += `&source=${encodeURIComponent(source)}`;
    }
    const cancelUrlFinal = cancelUrl || `${APP_URL}/#/FreeTierDashboard`;

    const body = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': PRICES[plan],
      'line_items[0][quantity]': '1',
      success_url: successUrlFinal,
      cancel_url: cancelUrlFinal,
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
      console.error('[createCheckoutSession] Stripe error:', session.error.message, session.error.code || '', session.error.type || '');
      return Response.json({ success: false, error: session.error.message }, { status: 500 });
    }

    // Log checkout_started to ConversionEvent (idempotent — one per user)
    const event_key = `${clientUser.id}:checkout_started`;
    const existingEvt = await base44.asServiceRole.entities.ConversionEvent
      .filter({ event_key }).catch(() => []);
    if (existingEvt?.length === 0) {
      await base44.asServiceRole.entities.ConversionEvent.create({
        user_id: clientUser.id,
        user_email: clientUser.email,
        event_name: 'checkout_started',
        event_key,
        trigger: source || null,
        plan_at_event: 'free',
      }).catch(() => {});
    }

    return Response.json({ success: true, url: session.url });

  } catch (e) {
    console.error('Checkout error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});