import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

/**
 * Create a family record and optionally start Stripe checkout.
 * Called during signup after user authentication.
 *
 * Pricing model:
 *   Founding members (first ~1000): FREE — subscription_tier = "free_founding"
 *   Post-founding: Must choose CFF ($9/mo) or CFF+FASTIQ ($29/mo or $249/yr)
 *   Trial: 7-day free trial on all paid plans
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

const FOUNDING_LIMIT = 1000;

// Stripe Price IDs — update these with your actual IDs
const STRIPE_PRICES = {
  cff_monthly:    'price_1SUJ2g873TV7WMcTBYvmzGYU',  // $9/month
  fastiq_monthly: 'price_1T7pOU873TV7WMcTbbBXguCb',  // $29/month
  fastiq_annual:  'price_1T7pQp873TV7WMcTdp7SsboC',     // $249/year
};

const TRIAL_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { successUrl, cancelUrl, familyName, plan } = await req.json();
    // plan: 'cff_monthly' | 'fastiq_monthly' | 'fastiq_annual' (only used for post-founding)

    console.log('Creating family for user:', user.email);

    // ── STEP 1: Get member number ──
    let memberNumber;
    const counters = await base44.asServiceRole.entities.GlobalCounter.filter({
      counter_name: 'family_count',
    });

    if (counters.length === 0) {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const initialCount = Math.max(700, Math.ceil(allUsers.length / 2));
      await base44.asServiceRole.entities.GlobalCounter.create({
        counter_name: 'family_count',
        counter_value: initialCount,
        last_updated: new Date().toISOString(),
      });
      memberNumber = initialCount + 1;
    } else {
      memberNumber = counters[0].counter_value + 1;
      await base44.asServiceRole.entities.GlobalCounter.update(counters[0].id, {
        counter_value: memberNumber,
        last_updated: new Date().toISOString(),
      });
    }

    console.log('Assigned member number:', memberNumber);

    // ── STEP 2: Determine tier ──
    const isFounder = memberNumber <= FOUNDING_LIMIT;

    // ── STEP 3: Create Family record ──
    const family = await base44.asServiceRole.entities.Family.create({
      family_name: familyName || `${user.full_name?.split(' ')[1] || 'Gator'} Family`,
      member_number: memberNumber,
      price_tier: isFounder ? 'founding' : 'paid',
      locked_price_monthly: 0,
      primary_parent_id: user.persona === 'parent' ? user.id : null,
      parent_ids: user.persona === 'parent' ? [user.id] : [],
      student_ids: user.persona === 'gator' ? [user.id] : [],
      subscription_status: isFounder ? 'active' : 'none',
    });

    console.log('Created family:', family.id);

    // ── STEP 4: Update user ──
    const userUpdate = {
      family_id: family.id,
      price_tier: isFounder ? 'founding' : 'paid',
      member_number: memberNumber,
      is_founding_member: isFounder,
      is_founding_gator: isFounder,
      founding_gator_number: isFounder ? memberNumber : null,
      signup_order: memberNumber,
      subscription_tier: isFounder ? 'free_founding' : null,
      subscription_status: isFounder ? 'free_founding' : 'none',
    };
    await base44.asServiceRole.entities.User.update(user.id, userUpdate);

    // ── STEP 5: Founding → done, no payment ──
    if (isFounder) {
      return Response.json({
        success: true,
        requires_payment: false,
        family_id: family.id,
        member_number: memberNumber,
        tier: 'founding',
        subscription_tier: 'free_founding',
        tier_display: '👑 FOUNDING MEMBER',
        price_display: 'FREE — Everything included',
        message: `Congratulations! You're Founding Member #${memberNumber}. CFF + FASTIQ are FREE for you!`,
      });
    }

    // ── STEP 6: Post-founding → Stripe checkout ──
    // If no plan specified, return without checkout (user will pick a plan on the pricing page)
    if (!plan || !STRIPE_PRICES[plan]) {
      return Response.json({
        success: true,
        requires_payment: true,
        needs_plan_selection: true,
        family_id: family.id,
        member_number: memberNumber,
        message: 'Family created. Please select a plan to continue.',
      });
    }

    const stripePriceId = STRIPE_PRICES[plan];
    const subscriptionTier = plan.startsWith('fastiq') ? 'fastiq' : 'cff';

    // Create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id, family_id: family.id, member_number: memberNumber.toString() },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
      await base44.asServiceRole.entities.Family.update(family.id, { stripe_customer_id: customerId });
    }

    // Create checkout session with 7-day trial
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
          family_id: family.id,
          member_number: memberNumber.toString(),
        },
      },
      success_url: successUrl || `${req.headers.get('origin')}/#Dashboard?payment=success&family_id=${family.id}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/#FastIQ?payment=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        subscription_tier: subscriptionTier,
        plan,
        family_id: family.id,
        member_number: memberNumber.toString(),
      },
    });

    console.log('Created checkout session:', session.id, 'plan:', plan);

    const priceLabel = plan === 'cff_monthly' ? '$9/month' : plan === 'fastiq_annual' ? '$249/year' : '$29/month';

    return Response.json({
      success: true,
      requires_payment: true,
      checkout_url: session.url,
      session_id: session.id,
      family_id: family.id,
      member_number: memberNumber,
      subscription_tier: subscriptionTier,
      trial_days: TRIAL_DAYS,
      price_display: priceLabel,
      message: `Start your 7-day free trial at ${priceLabel}.`,
    });
  } catch (error) {
    console.error('❌ Create family/checkout error:', error);
    return Response.json({
      error: error.message || 'Failed to create family',
      details: error.type || 'unknown_error',
    }, { status: 500 });
  }
});