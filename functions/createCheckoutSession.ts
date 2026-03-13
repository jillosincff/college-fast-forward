import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Checkout — Family-First Billing
// ═══════════════════════════════════════════════════════════════
// The subscription is created on the FAMILY entity.
// One subscription covers all linked family members.
// Both parents and students can initiate checkout.
// ═══════════════════════════════════════════════════════════════

const PRICE_MAP = {
  cff_monthly:     'price_1SUJ2g873TV7WMcTBYvmzGYU',  // $9/month
  fastiq_monthly:  'price_1T7pOU873TV7WMcTbbBXguCb',  // $29/month
  fastiq_annual:   'price_1T7pQp873TV7WMcTdp7SsboC',  // $249/year
};

const TIER_MAP = {
  cff_monthly:    'cff',
  fastiq_monthly: 'fastiq',
  fastiq_annual:  'fastiq',
};

const TRIAL_DAYS = 7; // 7-day free trial

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl, metadata } = await req.json();

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

    // ── Resolve the user's Family entity ──
    let familyId = metadata?.family_id || '';
    if (!familyId) {
      // Try to find family by user ID (parent or student)
      const isParent = user.persona === 'parent' || user.roles?.includes('parent');

      if (isParent) {
        const families = await base44.asServiceRole.entities.Family.filter({ primary_parent_id: user.id });
        if (families.length > 0) {
          familyId = families[0].id;
        } else {
          // Check parent_ids array
          const allFamilies = await base44.asServiceRole.entities.Family.filter({});
          const match = allFamilies.find(f => f.parent_ids?.includes(user.id));
          if (match) familyId = match.id;
        }
      } else {
        // Student — check student_ids
        const allFamilies = await base44.asServiceRole.entities.Family.filter({});
        const match = allFamilies.find(f => f.student_ids?.includes(user.id));
        if (match) familyId = match.id;
      }

      // If user has family_id on their profile
      if (!familyId && user.family_id) {
        familyId = user.family_id;
      }

      console.log('Resolved family_id:', familyId || '(none)');
    }

    // ── Check if family already has an active subscription (prevent duplicate) ──
    if (familyId) {
      try {
        const family = await base44.asServiceRole.entities.Family.get(familyId);
        if (family.stripe_subscription_id && (family.subscription_status === 'active' || family.subscription_status === 'trialing')) {
          // Family already has active subscription — check if this is an upgrade
          const existingTier = family.subscription_tier;
          if (existingTier === subscriptionTier || (existingTier === 'fastiq' && subscriptionTier === 'cff')) {
            return Response.json({
              error: 'Your family already has an active subscription.',
              existing_tier: existingTier,
              existing_status: family.subscription_status,
            }, { status: 409 });
          }
          // If upgrading from cff to fastiq, use Stripe portal for upgrade
          console.log('Family upgrading from', existingTier, 'to', subscriptionTier);
        }
      } catch (e) {
        console.log('Could not check existing family subscription:', e.message);
      }
    }

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
        metadata: { user_id: user.id, app_user_email: user.email, family_id: familyId },
      });
      customerId = customer.id;

      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId,
      });

      // Also store on Family if we have one
      if (familyId) {
        try {
          await base44.asServiceRole.entities.Family.update(familyId, {
            stripe_customer_id: customerId,
          });
        } catch (e) {
          console.log('Could not update family with customer ID:', e.message);
        }
      }
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
          family_id: familyId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        subscription_tier: subscriptionTier,
        plan,
        family_id: familyId,
      },
    });

    console.log('Checkout session created:', session.id, 'plan:', plan, 'family:', familyId);
    return Response.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error.message, error.type, error.code);
    return Response.json({
      error: error.message || 'Failed to create checkout session',
      details: error.type || 'unknown_error',
    }, { status: 500 });
  }
});