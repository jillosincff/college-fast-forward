import { createClient } from 'npm:@base44/sdk@0.1.0';
import Stripe from 'npm:stripe';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20',
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

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const { data: users } = await base44.entities.User.filter({ stripe_customer_id: customerId });
                if (users && users.length > 0) {
                    const user = users[0];
                    await base44.entities.User.update(user.id, {
                        pro_subscription_status: subscription.status,
                        pro_subscription_id: subscription.id,
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});