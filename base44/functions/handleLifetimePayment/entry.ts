import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Verify payment session with Stripe
    const stripe = (await import('npm:stripe@14.21.0')).default(Deno.env.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ 
        error: 'Payment not completed',
        status: session.payment_status 
      }, { status: 400 });
    }

    // Grant lifetime family membership
    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_tier: 'lifetime_family',
      subscription_status: 'lifetime',
      stripe_customer_id: session.customer
    });

    // If user has family members (parents/students), grant them access too
    if (user.family_group_id) {
      const familyMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: user.family_group_id
      });

      const updatePromises = familyMembers
        .filter(member => member.id !== user.id)
        .map(member => 
          base44.asServiceRole.entities.User.update(member.id, {
            subscription_tier: 'lifetime_family',
            subscription_status: 'lifetime'
          })
        );

      await Promise.all(updatePromises);
    }

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_id: user.id,
      type: 'lifetime_membership',
      title: '🎉 Welcome to Lifetime Family!',
      message: 'You and your family now have unlimited access forever. Thank you for supporting the Gator network!',
      link: '/#Dashboard',
      is_read: false
    });

    return Response.json({ 
      success: true,
      message: 'Lifetime family membership activated!'
    });

  } catch (error) {
    console.error('Lifetime payment processing error:', error);
    return Response.json({ 
      error: 'Failed to process lifetime payment',
      details: error.message 
    }, { status: 500 });
  }
});