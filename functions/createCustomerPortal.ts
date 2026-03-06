import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// ═══════════════════════════════════════════════════════════════
// Customer Portal — Only the billing owner can access
// ═══════════════════════════════════════════════════════════════
// If the current user IS the billing owner → open Stripe portal
// If they're a family member but NOT the owner → return info about who manages billing
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { return_url } = await req.json();

    // If user has their own stripe_customer_id, they might be the billing owner
    if (user.stripe_customer_id) {
      // Verify this user is actually the billing owner by checking the Family entity
      let isBillingOwner = true;

      // Find user's family
      const allFamilies = await base44.asServiceRole.entities.Family.filter({});
      const family = allFamilies.find(f =>
        f.parent_ids?.includes(user.id) || f.student_ids?.includes(user.id) || f.primary_parent_id === user.id
      );

      if (family && family.billing_owner_id && family.billing_owner_id !== user.id) {
        // Someone else is the billing owner
        isBillingOwner = false;
      }

      if (isBillingOwner) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripe_customer_id,
          return_url: return_url || `${req.headers.get('origin')}/#Dashboard`,
        });
        return Response.json({ url: portalSession.url });
      } else {
        return Response.json({
          error: 'not_billing_owner',
          billing_owner_name: family.billing_owner_name || 'a family member',
          billing_owner_email: family.billing_owner_email || '',
          message: `Your subscription is managed by ${family.billing_owner_name || 'a family member'}. Only the billing owner can manage the subscription.`,
        }, { status: 403 });
      }
    }

    // No stripe_customer_id — check if family has one managed by someone else
    const allFamilies = await base44.asServiceRole.entities.Family.filter({});
    const family = allFamilies.find(f =>
      f.parent_ids?.includes(user.id) || f.student_ids?.includes(user.id)
    );

    if (family?.stripe_customer_id && family.billing_owner_id && family.billing_owner_id !== user.id) {
      return Response.json({
        error: 'not_billing_owner',
        billing_owner_name: family.billing_owner_name || 'a family member',
        billing_owner_email: family.billing_owner_email || '',
        message: `Your family's subscription is managed by ${family.billing_owner_name || 'a family member'}.`,
      }, { status: 403 });
    }

    return Response.json({ error: 'No billing account found' }, { status: 400 });
  } catch (error) {
    console.error('Customer portal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});