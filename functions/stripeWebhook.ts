import { createClient } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

// Service-role client for webhook (no user auth available)
const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
  serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
});

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Stripe Webhook Handler
// ═══════════════════════════════════════════════════════════════
// Family entity is the SOURCE OF TRUTH for billing.
// One subscription per family covers all linked members.
// ═══════════════════════════════════════════════════════════════

async function findUserByCustomerId(customerId) {
  const users = await base44.entities.User.filter({ stripe_customer_id: customerId });
  return users?.length > 0 ? users[0] : null;
}

/**
 * Find the Family entity associated with a Stripe customer.
 * Checks: metadata family_id first, then Family.stripe_customer_id, then user.family_id.
 */
async function findFamily(familyId, customerId) {
  // 1. Direct family_id from metadata
  if (familyId) {
    try {
      const family = await base44.entities.Family.get(familyId);
      if (family) return family;
    } catch (e) {
      console.log('Family not found by ID:', familyId);
    }
  }
  // 2. By stripe_customer_id on Family
  if (customerId) {
    const families = await base44.entities.Family.filter({ stripe_customer_id: customerId });
    if (families?.length > 0) return families[0];
  }
  // 3. By billing user's family_id
  const user = await findUserByCustomerId(customerId);
  if (user?.family_id) {
    try {
      return await base44.entities.Family.get(user.family_id);
    } catch (e) {
      console.log('Family not found by user.family_id:', user.family_id);
    }
  }
  return null;
}

/**
 * Propagate subscription changes to ALL family members (parents + students).
 */
async function updateAllFamilyMembers(family, updates) {
  if (!family) return;
  const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
  for (const memberId of allMemberIds) {
    try {
      await base44.entities.User.update(memberId, updates);
    } catch (err) {
      console.error('Failed to update family member:', memberId, err.message);
    }
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Webhook received:', event.type);

    switch (event.type) {

      // ── CHECKOUT COMPLETED ──
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const subscriptionTier = session.metadata?.subscription_tier || 'cff';
        const familyId = session.metadata?.family_id;
        const billingUserEmail = session.metadata?.user_email;
        const billingUserId = session.metadata?.user_id;

        console.log('Checkout completed:', { subscriptionTier, customerId, familyId, billingUserEmail });

        // Update billing user
        const billingUser = await findUserByCustomerId(customerId);
        if (billingUser) {
          await base44.entities.User.update(billingUser.id, {
            stripe_subscription_id: subscriptionId,
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
          });
          console.log('Updated billing user:', billingUser.id, 'tier:', subscriptionTier);
        }

        // Update Family record (source of truth)
        const family = await findFamily(familyId, customerId);
        if (family) {
          await base44.entities.Family.update(family.id, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            billing_owner_id: billingUserId || billingUser?.id || '',
            billing_owner_email: billingUserEmail || billingUser?.email || '',
            billing_owner_name: billingUser?.full_name || '',
          });
          console.log('Updated family:', family.id, 'tier:', subscriptionTier);

          // Propagate to ALL family members
          await updateAllFamilyMembers(family, {
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
          });
        }
        break;
      }

      // ── SUBSCRIPTION CREATED / UPDATED ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionTier = subscription.metadata?.subscription_tier;
        const familyId = subscription.metadata?.family_id;
        const status = subscription.status; // active, trialing, past_due, canceled, etc.

        console.log('Subscription event:', event.type, { status, subscriptionTier, familyId });

        const billingUser = await findUserByCustomerId(customerId);

        // Build update payload
        const userUpdates = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
        };
        if (subscriptionTier) userUpdates.subscription_tier = subscriptionTier;
        if (subscription.trial_end) userUpdates.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
        if (subscription.current_period_end) userUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

        // Update billing user
        if (billingUser) {
          await base44.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user subscription:', billingUser.id, status);
        }

        // Update Family (source of truth)
        const family = await findFamily(familyId, customerId);
        if (family) {
          const familyUpdates = {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
          };
          if (subscriptionTier) familyUpdates.subscription_tier = subscriptionTier;
          if (subscription.trial_end) familyUpdates.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
          if (subscription.current_period_end) familyUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

          await base44.entities.Family.update(family.id, familyUpdates);
          console.log('Updated family subscription:', family.id, status, subscriptionTier);

          // Propagate to ALL family members (not just billing user)
          const memberUpdates = { subscription_status: status };
          if (subscriptionTier) memberUpdates.subscription_tier = subscriptionTier;
          await updateAllFamilyMembers(family, memberUpdates);
        }
        break;
      }

      // ── SUBSCRIPTION DELETED ──
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const customerId = deletedSub.customer;
        const familyId = deletedSub.metadata?.family_id;

        const billingUser = await findUserByCustomerId(customerId);

        // Don't cancel founding members
        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member || billingUser.price_tier === 'founding')) {
          console.log('Skipping cancellation for founding member:', billingUser.id);
          break;
        }

        // Update billing user
        if (billingUser) {
          await base44.entities.User.update(billingUser.id, { subscription_status: 'canceled' });
          console.log('Subscription canceled for billing user:', billingUser.id);
        }

        // Update Family and propagate to all members
        const family = await findFamily(familyId, customerId);
        if (family) {
          // Don't cancel if family is founding
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding') {
            console.log('Skipping cancellation for founding family:', family.id);
            break;
          }

          await base44.entities.Family.update(family.id, { subscription_status: 'canceled' });
          console.log('Family subscription canceled:', family.id);

          // Cancel all non-founding members
          const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
          for (const memberId of allMemberIds) {
            try {
              const member = await base44.entities.User.get(memberId);
              if (!member.is_founding_member && member.subscription_tier !== 'free_founding') {
                await base44.entities.User.update(memberId, { subscription_status: 'canceled' });
              }
            } catch (err) {
              console.error('Failed to cancel member:', memberId, err.message);
            }
          }
        }
        break;
      }

      // ── PAYMENT FAILED ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        const billingUser = await findUserByCustomerId(customerId);
        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member)) {
          console.log('Skipping payment_failed for founding member:', billingUser.id);
          break;
        }

        // Find family via subscription metadata or customer
        let familyId = null;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            familyId = sub.metadata?.family_id;
          } catch (e) {
            console.log('Could not retrieve subscription for family_id');
          }
        }

        if (billingUser) {
          await base44.entities.User.update(billingUser.id, { subscription_status: 'past_due' });
          console.log('Marked billing user as past_due:', billingUser.id);
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding') break;
          await base44.entities.Family.update(family.id, { subscription_status: 'past_due' });
          await updateAllFamilyMembers(family, { subscription_status: 'past_due' });
          console.log('Family marked past_due:', family.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});