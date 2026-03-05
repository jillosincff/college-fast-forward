import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { 
  apiVersion: '2024-11-20.acacia'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl, metadata } = await req.json();

    console.log('Checkout request:', { priceId, userId: user.id, email: user.email, metadata });

    if (!priceId || !successUrl || !cancelUrl) {
      return Response.json({ 
        error: 'Missing required fields: priceId, successUrl, cancelUrl' 
      }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (customerId) {
      // Verify customer exists in Stripe
      try {
        await stripe.customers.retrieve(customerId);
        console.log('Using existing customer:', customerId);
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
      console.log('Creating new Stripe customer for:', user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          app_user_email: user.email
        }
      });
      customerId = customer.id;
      console.log('Created customer:', customerId);
      
      // Update user with Stripe customer ID
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    // Determine subscription type from metadata
    const subscriptionType = metadata?.subscriptionType || 'parent_paid';
    
    // Map custom/virtual price IDs to actual Stripe prices
    let actualPriceId = priceId;
    if (priceId === 'price_student_self_pay_9') {
      // Use the $9/month CFF-only price for student self-pay
      actualPriceId = 'price_1SUJ2g873TV7WMcTBYvmzGYU';
    }
    // FASTIQ $29/month → standard Stripe price
    // price_1SUJ7I873TV7WMcT1plkAZpz is the $29/month FASTIQ price
    // price_fastiq_annual_249 → annual FASTIQ price (create in Stripe dashboard)
    // For annual, look up or use your annual price ID from Stripe
    if (priceId === 'price_fastiq_annual_249') {
      // TODO: Replace with actual Stripe annual price ID once created
      actualPriceId = 'price_fastiq_annual_249';
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        subscription_type: subscriptionType
      }
    });

    console.log('Checkout session created:', session.id);
    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe checkout error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    });
    
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.type || 'unknown_error'
    }, { status: 500 });
  }
});