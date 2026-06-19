import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { subscription_id, user_email } = await req.json();
    if (!subscription_id) return Response.json({ error: 'subscription_id required' }, { status: 400 });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message }, { status: res.status });

    // Update user record
    if (user_email) {
      const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
      if (users?.length) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_status: 'canceled',
          fastiq_active: false,
          is_fastiq: false,
        });
      }
    }

    return Response.json({ success: true, status: data.status, canceled_at: data.canceled_at });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});