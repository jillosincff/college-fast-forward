import { createClient } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.21.0';

const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
  serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
});

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Get customer and subscription info
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const subscriptionType = session.metadata?.subscription_type || 'parent_paid';
        const familyId = session.metadata?.family_id;
        const priceTier = session.metadata?.price_tier;
        const memberNumber = session.metadata?.member_number;
        
        // Update Family record if exists
        if (familyId) {
          try {
            await base44.entities.Family.update(familyId, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active'
            });
            console.log('Updated family subscription:', familyId);
          } catch (familyError) {
            console.error('Failed to update family:', familyError);
          }
        }
        
        // Find user by customer ID
        const users = await base44.entities.User.filter({ stripe_customer_id: customerId });
        if (users && users.length > 0) {
          const user = users[0];
          
          // Update user with subscription info and tier
          const userUpdate = {
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_type: subscriptionType,
            messages_sent_today: 0,
            messages_day_reset: null
          };
          
          // Set tier info if from tiered signup
          if (priceTier) {
            userUpdate.price_tier = priceTier;
          }
          if (memberNumber) {
            userUpdate.member_number = parseInt(memberNumber, 10);
          }
          
          await base44.entities.User.update(user.id, userUpdate);
          console.log('Updated user subscription:', user.id, 'tier:', priceTier);
          
          // Update all family members if family exists
          if (familyId) {
            try {
              const family = await base44.entities.Family.get(familyId);
              const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
              
              for (const memberId of allMemberIds) {
                if (memberId !== user.id) {
                  await base44.entities.User.update(memberId, {
                    subscription_status: 'active',
                    price_tier: priceTier,
                    member_number: parseInt(memberNumber, 10),
                    has_active_parent_subscription: true,
                    linked_parent_subscription_active: true
                  });
                  console.log('Updated family member subscription:', memberId);
                }
              }
            } catch (familyMemberError) {
              console.error('Failed to update family members:', familyMemberError);
            }
          }
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const subCustomerId = subscription.customer;
        
        const subUsers = await base44.entities.User.filter({ stripe_customer_id: subCustomerId });
        if (subUsers && subUsers.length > 0) {
          const user = subUsers[0];
          await base44.entities.User.update(user.id, {
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status
          });
          console.log('Updated user subscription status:', user.id, subscription.status);

          // If parent subscription is now active, update linked gators
          if (subscription.status === 'active' && user.persona === 'parent' && user.linked_gator_ids?.length > 0) {
            console.log('Parent subscription active, updating linked gators:', user.linked_gator_ids);
            for (const gatorId of user.linked_gator_ids) {
              try {
                const gator = await base44.entities.User.get(gatorId);
                
                // If student was self-paying, refund their last payment
                if (gator.subscription_status === 'active' && gator.subscription_type === 'student_self_pay' && gator.stripe_subscription_id) {
                  console.log('Student was self-paying, canceling and refunding:', gatorId);
                  try {
                    // Cancel the student's subscription
                    await stripe.subscriptions.cancel(gator.stripe_subscription_id);
                    
                    // Get the latest invoice and refund it
                    const invoices = await stripe.invoices.list({
                      subscription: gator.stripe_subscription_id,
                      limit: 1
                    });
                    if (invoices.data.length > 0 && invoices.data[0].payment_intent) {
                      await stripe.refunds.create({
                        payment_intent: invoices.data[0].payment_intent
                      });
                      console.log('Refunded student last payment:', gatorId);
                    }
                  } catch (refundError) {
                    console.error('Failed to refund student:', gatorId, refundError);
                  }
                }
                
                await base44.entities.User.update(gatorId, {
                  has_active_parent_subscription: true,
                  linked_parent_subscription_active: true,
                  subscription_type: 'parent_paid',
                  messages_sent_today: 0,
                  messages_day_reset: null
                });
                console.log('Updated gator access:', gatorId);

                // Grant "Supported Family" badge
                const existingBadges = await base44.entities.UserBadge.filter({
                  user_id: gatorId,
                  badge_type: 'supported_family'
                });

                if (existingBadges.length === 0) {
                  await base44.entities.UserBadge.create({
                    user_id: gatorId,
                    badge_type: 'supported_family',
                    badge_name: 'Supported Family',
                    badge_description: 'Your family invested in your success',
                    badge_icon: '💝',
                    earned_at: new Date().toISOString(),
                    granted_by_parent_email: user.email,
                    metadata: { parent_id: user.id, subscription_id: subscription.id }
                  });
                  console.log('Granted "Supported Family" badge to:', gatorId);
                }
              } catch (gatorError) {
                console.error('Failed to update gator:', gatorId, gatorError);
              }
            }
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        const delCustomerId = deletedSub.customer;
        
        const delUsers = await base44.entities.User.filter({ stripe_customer_id: delCustomerId });
        if (delUsers && delUsers.length > 0) {
          const user = delUsers[0];
          
          // Don't cancel if founding member (they're free forever)
          if (user.price_tier === 'founding' || user.is_founding_member) {
            console.log('Skipping cancellation for founding member:', user.id);
            break;
          }
          
          await base44.entities.User.update(user.id, {
            subscription_status: 'canceled'
          });
          console.log('Canceled user subscription:', user.id);

          // Update Family record
          if (user.family_id) {
            try {
              await base44.entities.Family.update(user.family_id, {
                subscription_status: 'canceled'
              });
              
              // Update all family members
              const family = await base44.entities.Family.get(user.family_id);
              const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
              
              for (const memberId of allMemberIds) {
                const member = await base44.entities.User.get(memberId);
                // Don't downgrade founding members
                if (!member.is_founding_member && member.price_tier !== 'founding') {
                  await base44.entities.User.update(memberId, {
                    subscription_status: 'canceled',
                    linked_parent_subscription_active: false
                  });
                  console.log('Updated family member subscription to canceled:', memberId);
                }
              }
            } catch (familyError) {
              console.error('Failed to update family:', familyError);
            }
          }

          // Legacy: If parent subscription canceled, update linked gators
          if (user.persona === 'parent' && user.linked_gator_ids?.length > 0) {
            console.log('Parent subscription canceled, updating linked gators:', user.linked_gator_ids);
            for (const gatorId of user.linked_gator_ids) {
              try {
                const gator = await base44.entities.User.get(gatorId);
                // Don't downgrade founding members
                if (!gator.is_founding_member && gator.price_tier !== 'founding' && !gator.is_founding_gator) {
                  await base44.entities.User.update(gatorId, {
                    linked_parent_subscription_active: false
                  });
                  console.log('Removed VIP access from gator:', gatorId);
                }
              } catch (gatorError) {
                console.error('Failed to update gator:', gatorId, gatorError);
              }
            }
          }
        }
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        const failedCustomerId = failedInvoice.customer;
        
        const failedUsers = await base44.entities.User.filter({ stripe_customer_id: failedCustomerId });
        if (failedUsers && failedUsers.length > 0) {
          const user = failedUsers[0];
          
          // Don't mark as past_due if founding member
          if (user.price_tier === 'founding' || user.is_founding_member) {
            console.log('Skipping payment_failed for founding member:', user.id);
            break;
          }
          
          await base44.entities.User.update(user.id, {
            subscription_status: 'past_due'
          });
          console.log('Marked user subscription as past_due:', user.id);
          
          // Update Family record
          if (user.family_id) {
            try {
              await base44.entities.Family.update(user.family_id, {
                subscription_status: 'past_due'
              });
            } catch (familyError) {
              console.error('Failed to update family:', familyError);
            }
          }
          
          // TODO: Send payment failed email with 7-day grace period warning
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});