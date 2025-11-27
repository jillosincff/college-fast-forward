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
        
        // Find user by customer ID
        const users = await base44.entities.User.filter({ stripe_customer_id: customerId });
        if (users && users.length > 0) {
          const user = users[0];
          await base44.entities.User.update(user.id, {
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active'
          });
          console.log('Updated user subscription:', user.id);
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
                await base44.entities.User.update(gatorId, {
                  linked_parent_subscription_active: true,
                  messages_sent_this_month: 0, // Reset message count
                  messages_month_reset: new Date().toISOString().slice(0, 7)
                });
                console.log('Updated gator access:', gatorId);
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
          await base44.entities.User.update(user.id, {
            subscription_status: 'canceled'
          });
          console.log('Canceled user subscription:', user.id);
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