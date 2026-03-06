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
// Handles: checkout.session.completed, subscription lifecycle, invoice failures
// Subscription tiers: free_founding | cff | fastiq
// ═══════════════════════════════════════════════════════════════

async function findUserByCustomerId(customerId) {
  const users = await base44.entities.User.filter({ stripe_customer_id: customerId });
  return users?.length > 0 ? users[0] : null;
}

async function updateFamilyMembers(familyId, updates) {
  if (!familyId) return;
  try {
    const family = await base44.entities.Family.get(familyId);
    const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
    for (const memberId of allMemberIds) {
      await base44.entities.User.update(memberId, updates);
    }
  } catch (err) {
    console.error('Failed to update family members:', err);
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

        console.log('Checkout completed:', { subscriptionTier, customerId, familyId });

        // Update user
        const user = await findUserByCustomerId(customerId);
        if (user) {
          await base44.entities.User.update(user.id, {
            stripe_subscription_id: subscriptionId,
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
          });
          console.log('Updated user:', user.id, 'tier:', subscriptionTier);
        }

        // Update Family record
        if (familyId) {
          try {
            await base44.entities.Family.update(familyId, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
            });
          } catch (err) {
            console.error('Failed to update family:', err);
          }

          // Update all family members
          await updateFamilyMembers(familyId, {
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
        const status = subscription.status; // active, trialing, past_due, canceled, etc.

        const user = await findUserByCustomerId(customerId);
        if (!user) break;

        const updates = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
        };

        // Update tier if present in metadata
        if (subscriptionTier) {
          updates.subscription_tier = subscriptionTier;
        }

        // Track trial end and period end
        if (subscription.trial_end) {
          updates.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
        }
        if (subscription.current_period_end) {
          updates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        await base44.entities.User.update(user.id, updates);
        console.log('Subscription updated:', user.id, status, subscriptionTier);

        // If parent subscription is active, update linked gators
        if (status === 'active' && user.persona === 'parent' && user.linked_gator_ids?.length > 0) {
          for (const gatorId of user.linked_gator_ids) {
            try {
              await base44.entities.User.update(gatorId, {
                subscription_status: 'active',
                subscription_tier: subscriptionTier || user.subscription_tier,
                has_active_parent_subscription: true,
                linked_parent_subscription_active: true,
              });
            } catch (err) {
              console.error('Failed to update gator:', gatorId, err);
            }
          }
        }
        break;
      }

      // ── SUBSCRIPTION DELETED (canceled at period end or immediately) ──
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const customerId = deletedSub.customer;

        const user = await findUserByCustomerId(customerId);
        if (!user) break;

        // Don't cancel founding members
        if (user.subscription_tier === 'free_founding' || user.is_founding_member || user.price_tier === 'founding') {
          console.log('Skipping cancellation for founding member:', user.id);
          break;
        }

        await base44.entities.User.update(user.id, {
          subscription_status: 'canceled',
        });
        console.log('Subscription canceled:', user.id);

        // Update Family
        if (user.family_id) {
          try {
            await base44.entities.Family.update(user.family_id, { subscription_status: 'canceled' });
          } catch (err) {
            console.error('Failed to update family:', err);
          }
        }

        // Update linked gators
        if (user.persona === 'parent' && user.linked_gator_ids?.length > 0) {
          for (const gatorId of user.linked_gator_ids) {
            try {
              const gator = await base44.entities.User.get(gatorId);
              if (!gator.is_founding_member && gator.subscription_tier !== 'free_founding') {
                await base44.entities.User.update(gatorId, {
                  linked_parent_subscription_active: false,
                });
              }
            } catch (err) {
              console.error('Failed to update gator:', gatorId, err);
            }
          }
        }
        break;
      }

      // ── PAYMENT FAILED ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const user = await findUserByCustomerId(customerId);
        if (!user) break;

        // Don't mark founding members as past_due
        if (user.subscription_tier === 'free_founding' || user.is_founding_member) {
          console.log('Skipping payment_failed for founding member:', user.id);
          break;
        }

        await base44.entities.User.update(user.id, { subscription_status: 'past_due' });
        console.log('Marked as past_due:', user.id);

        if (user.family_id) {
          try {
            await base44.entities.Family.update(user.family_id, { subscription_status: 'past_due' });
          } catch (err) {
            console.error('Failed to update family:', err);
          }
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