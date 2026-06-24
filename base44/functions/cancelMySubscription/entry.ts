import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Self-service cancellation for the logged-in billing owner.
// Cancels at period end so the member keeps access until their paid period expires.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return Response.json({ error: 'Billing is not configured.' }, { status: 500 });

    // Resolve the subscription. Family-level subscription takes precedence.
    let subscriptionId = null;
    let family = null;

    if (user.family_id) {
      const fams = await base44.asServiceRole.entities.Family.filter({ id: user.family_id });
      family = fams?.[0] || null;
    }

    // Only the billing owner can cancel a family subscription.
    if (family && family.billing_owner_id && family.billing_owner_id !== user.id) {
      return Response.json({
        error: 'not_billing_owner',
        message: `Your subscription is managed by ${family.billing_owner_name || 'a family member'}. Please contact them to cancel.`,
      }, { status: 403 });
    }

    if (family?.stripe_subscription_id) {
      subscriptionId = family.stripe_subscription_id;
    }

    // Fall back to looking up the active subscription via the user's Stripe customer.
    if (!subscriptionId && user.stripe_customer_id) {
      const listRes = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${user.stripe_customer_id}&status=active&limit=1`,
        { headers: { 'Authorization': `Bearer ${stripeKey}` } }
      );
      const listData = await listRes.json();
      if (listRes.ok && listData.data?.length) {
        subscriptionId = listData.data[0].id;
      }
    }

    if (!subscriptionId) {
      return Response.json({
        error: 'no_subscription',
        message: "We couldn't find an active subscription to cancel. Please contact support.",
      }, { status: 404 });
    }

    // Cancel at period end — member keeps access until the paid period ends.
    const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ cancel_at_period_end: 'true' }),
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data.error?.message || 'Stripe cancellation failed.' }, { status: res.status });
    }

    // Mark the cancellation on the family record (status stays active until period end via webhook).
    if (family) {
      await base44.asServiceRole.entities.Family.update(family.id, {
        cancel_at_period_end: true,
      });
    }

    const accessUntil = data.current_period_end
      ? new Date(data.current_period_end * 1000).toISOString()
      : null;

    return Response.json({ success: true, cancel_at_period_end: true, access_until: accessUntil });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});