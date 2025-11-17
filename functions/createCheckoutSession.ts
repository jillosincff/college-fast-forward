import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
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

    const { priceId, successUrl, cancelUrl } = await req.json();

    console.log('Checkout request:', { priceId, userId: user.id, email: user.email });

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

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email
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