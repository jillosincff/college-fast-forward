import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.stripe_customer_id) {
      return Response.json({ error: 'No billing account found' }, { status: 400 });
    }

    const { return_url } = await req.json();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: return_url || `${req.headers.get('origin')}/#Dashboard`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error('Customer portal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});