/**
 * One-time admin utility: creates the "CLiFF Pro Monthly" product and price in Stripe.
 * Billed monthly at $21.67/month (~$4.99/week × 4.33 weeks).
 * Run once from the dashboard → functions → createStripeProMonthlyProduct.
 * Copy the returned price_id into createCheckoutSession.js PRICES.pro_monthly.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
    const headers = {
      Authorization: `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // 1. Create the product
    const productBody = new URLSearchParams({
      name: 'CLiFF Pro Monthly',
      description: 'CLiFF Career Agent — $4.99/week billed monthly. Includes full 14-day sprint plan, resume optimization, alumni network access, and unlimited outreach drafts.',
      'metadata[plan]': 'pro_monthly',
    });

    const productRes = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers,
      body: productBody.toString(),
    });
    const product = await productRes.json();

    if (product.error) {
      return Response.json({ success: false, step: 'create_product', error: product.error.message }, { status: 500 });
    }

    // 2. Create the price — $19.96/month (= $4.99/week × 4)
    // Stripe amounts are in cents. $19.96 = 1996 cents.
    const priceBody = new URLSearchParams({
      product: product.id,
      unit_amount: '1996',
      currency: 'usd',
      'recurring[interval]': 'month',
      nickname: 'Pro Monthly ($4.99/week)',
      'metadata[plan]': 'pro_monthly',
      'metadata[display_price]': '$4.99/week',
    });

    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers,
      body: priceBody.toString(),
    });
    const price = await priceRes.json();

    if (price.error) {
      return Response.json({ success: false, step: 'create_price', error: price.error.message, product_id: product.id }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Product and price created! Copy the price_id below into PRICES.pro_monthly in createCheckoutSession.js',
      product_id: product.id,
      price_id: price.id,
      amount: '$19.96/month ($4.99/week × 4)',
    });

  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});