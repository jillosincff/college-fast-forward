import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.21.0';

/**
 * Create a family record and optionally start Stripe checkout
 * 
 * This is called during signup after user authentication.
 * If user is in a paid tier, it creates a Stripe checkout session.
 * If user is in founding tier, it just creates the family record.
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { 
  apiVersion: '2024-11-20.acacia'
});

const FOUNDING_LIMIT = 1000;
const EARLY_ADOPTER_LIMIT = 5000;
const EARLY_ADOPTER_PRICE = 900;
const STANDARD_PRICE = 1900;
const STRIPE_PRICE_EARLY_ADOPTER = 'price_1SUJ2g873TV7WMcTBYvmzGYU';
const STRIPE_PRICE_STANDARD = 'price_1SUJ7I873TV7WMcT1plkAZpz';
const TRIAL_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { successUrl, cancelUrl, familyName } = await req.json();

    console.log('Creating family for user:', user.email);

    // STEP 1: Atomically increment family counter and get member number
    let memberNumber;
    
    const counters = await base44.asServiceRole.entities.GlobalCounter.filter({
      counter_name: 'family_count'
    });

    if (counters.length === 0) {
      // Initialize counter
      const allUsers = await base44.asServiceRole.entities.User.list();
      const initialCount = Math.max(700, Math.ceil(allUsers.length / 2));
      
      await base44.asServiceRole.entities.GlobalCounter.create({
        counter_name: 'family_count',
        counter_value: initialCount,
        last_updated: new Date().toISOString()
      });
      memberNumber = initialCount + 1;
    } else {
      // Increment existing counter
      const currentCount = counters[0].counter_value;
      memberNumber = currentCount + 1;
      
      await base44.asServiceRole.entities.GlobalCounter.update(counters[0].id, {
        counter_value: memberNumber,
        last_updated: new Date().toISOString()
      });
    }

    console.log('Assigned member number:', memberNumber);

    // STEP 2: Determine pricing tier
    let tier, lockedPrice, stripePriceId;
    
    if (memberNumber <= FOUNDING_LIMIT) {
      tier = 'founding';
      lockedPrice = 0;
      stripePriceId = null;
    } else if (memberNumber <= EARLY_ADOPTER_LIMIT) {
      tier = 'early_adopter';
      lockedPrice = EARLY_ADOPTER_PRICE;
      stripePriceId = STRIPE_PRICE_EARLY_ADOPTER;
    } else {
      tier = 'standard';
      lockedPrice = STANDARD_PRICE;
      stripePriceId = STRIPE_PRICE_STANDARD;
    }

    console.log('Pricing tier:', tier, 'Price:', lockedPrice);

    // STEP 3: Create Family record
    const family = await base44.asServiceRole.entities.Family.create({
      family_name: familyName || `${user.full_name?.split(' ')[1] || 'Gator'} Family`,
      member_number: memberNumber,
      price_tier: tier,
      locked_price_monthly: lockedPrice,
      primary_parent_id: user.persona === 'parent' ? user.id : null,
      parent_ids: user.persona === 'parent' ? [user.id] : [],
      student_ids: user.persona === 'gator' ? [user.id] : [],
      subscription_status: tier === 'founding' ? 'active' : 'none'
    });

    console.log('Created family:', family.id);

    // STEP 4: Update user with family info and pricing tier
    const userUpdate = {
      family_id: family.id,
      price_tier: tier,
      locked_price_monthly: lockedPrice,
      member_number: memberNumber,
      is_founding_member: tier === 'founding',
      is_founding_gator: tier === 'founding',
      founding_gator_number: tier === 'founding' ? memberNumber : null,
      signup_order: memberNumber
    };

    await base44.asServiceRole.entities.User.update(user.id, userUpdate);
    console.log('Updated user with family info');

    // STEP 5: If founding member, done! No payment needed.
    if (tier === 'founding') {
      return Response.json({
        success: true,
        requires_payment: false,
        family_id: family.id,
        member_number: memberNumber,
        tier,
        tier_display: '👑 FOUNDING MEMBER',
        price_display: 'FREE FOREVER',
        message: `Congratulations! You're Founding Member #${memberNumber}. Your access is FREE FOREVER!`
      });
    }

    // STEP 6: Create Stripe customer if needed
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          family_id: family.id,
          member_number: memberNumber.toString(),
          price_tier: tier
        }
      });
      customerId = customer.id;
      
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
      
      await base44.asServiceRole.entities.Family.update(family.id, {
        stripe_customer_id: customerId
      });
    }

    // STEP 7: Create Stripe Checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: stripePriceId,
        quantity: 1
      }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          family_id: family.id,
          member_number: memberNumber.toString(),
          price_tier: tier
        }
      },
      success_url: successUrl || `${req.headers.get('origin')}/#Dashboard?payment=success&family_id=${family.id}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/#GatorWelcome?payment=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        family_id: family.id,
        member_number: memberNumber.toString(),
        price_tier: tier
      }
    });

    console.log('Created checkout session:', session.id);

    return Response.json({
      success: true,
      requires_payment: true,
      checkout_url: session.url,
      session_id: session.id,
      family_id: family.id,
      member_number: memberNumber,
      tier,
      tier_display: tier === 'early_adopter' ? '⭐ EARLY ADOPTER' : '✓ MEMBER',
      price_display: `$${lockedPrice / 100}/month`,
      trial_days: TRIAL_DAYS,
      message: `You're Member #${memberNumber}. Start your 7-day free trial at $${lockedPrice / 100}/month (locked forever).`
    });

  } catch (error) {
    console.error('❌ Create family/checkout error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create family',
      details: error.type || 'unknown_error'
    }, { status: 500 });
  }
});