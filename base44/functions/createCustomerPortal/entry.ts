import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { customerId, returnUrl } = await req.json();

  if (!customerId) {
    return Response.json({ success: false, error: 'No Stripe customer ID found. Please contact support.' }, { status: 400 });
  }

  const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: returnUrl || 'https://collegefastforward.com/#FreeTierDashboard',
    }),
  });

  const session = await response.json();

  if (session.error) {
    console.error('Portal session error:', session.error);
    return Response.json({ success: false, error: session.error.message }, { status: 400 });
  }

  return Response.json({ success: true, url: session.url });
});