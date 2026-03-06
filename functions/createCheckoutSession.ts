import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Pricing Model
// ═══════════════════════════════════════════════════════════════
// Tier 1 — CFF Membership:      $9/month
// Tier 2 — CFF + FASTIQ:        $29/month  OR  $249/year (save 28%)
// Both tiers include a 7-day free trial
// ═══════════════════════════════════════════════════════════════

// IMPORTANT: Update these with your actual Stripe Price IDs
// You need 3 prices in Stripe:
//   1. "CFF Membership" product → $9/month recurring
//   2. "CFF + FASTIQ" product  → $29/month recurring
//   3. "CFF + FASTIQ" product  → $249/year recurring
const PRICE_MAP = {
  cff_monthly:     'price_1SUJ2g873TV7WMcTBYvmzGYU',  // $9/month
  fastiq_monthly:  'price_1T7pOU873TV7WMcTbbBXguCb',  // $29/month
  fastiq_annual:   'price_1T7pQp873TV7WMcTdp7SsboC',     // $249/year
};

const TIER_MAP = {
  cff_monthly:    'cff',
  fastiq_monthly: 'fastiq',
  fastiq_annual:  'fastiq',
};

const TRIAL_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl, metadata } = await req.json();

    // plan must be one of: cff_monthly, fastiq_monthly, fastiq_annual
    const stripePriceId = PRICE_MAP[plan];
    if (!stripePriceId) {
      return Response.json({
        error: `Invalid plan: ${plan}. Must be one of: ${Object.keys(PRICE_MAP).join(', ')}`,
      }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return Response.json({ error: 'Missing successUrl or cancelUrl' }, { status: 400 });
    }

    const subscriptionTier = TIER_MAP[plan];
    console.log('Checkout request:', { plan, subscriptionTier, userId: user.id, email: user.email });

    // ── Get or create Stripe Customer ──
    let customerId = user.stripe_customer_id;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        if (error.code === 'resource_missing') {
          console.log('Stored customer ID invalid, creating new customer');
          customerId = null;
        } else {
          throw error;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id, app_user_email: user.email },
      });
      customerId = customer.id;

      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId,
      });
    }

    // ── Create Checkout Session ──
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          subscription_tier: subscriptionTier,
          plan,
          family_id: metadata?.family_id || '',
          ...(metadata || {}),
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        subscription_tier: subscriptionTier,
        plan,
        family_id: metadata?.family_id || '',
      },
    });

    console.log('Checkout session created:', session.id, 'plan:', plan);
    return Response.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error.message, error.type, error.code);
    return Response.json({
      error: error.message || 'Failed to create checkout session',
      details: error.type || 'unknown_error',
    }, { status: 500 });
  }
});