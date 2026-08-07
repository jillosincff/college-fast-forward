import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Redeems a CLIFF Pro gift a parent purchased BEFORE the student signed up.
// Called (fire-and-forget) when a non-Pro student loads their dashboard.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.subscription_status === 'active') {
      return Response.json({ redeemed: false });
    }

    const email = user.email?.trim().toLowerCase();
    if (!email) return Response.json({ redeemed: false });

    const parents = await base44.asServiceRole.entities.User.filter({ pending_pro_gift_email: email });
    const parent = parents?.[0];
    if (!parent) return Response.json({ redeemed: false });

    const parentFirst = parent.full_name?.split(' ')[0] || 'Your parent';

    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_status: 'active',
      subscription_tier: 'cff',
      membership_tier: 'cff',
      fastiq_active: true,
      is_fastiq: true,
      gifted_by_parent_email: parent.email,
      linked_parent_name: parentFirst,
      pro_gift_subscription_id: parent.pending_pro_gift_subscription_id || '',
    });

    // Clear the pending gift so it can't be redeemed twice
    await base44.asServiceRole.entities.User.update(parent.id, {
      pending_pro_gift_email: null,
      pending_pro_gift_subscription_id: null,
    });

    console.log('Pending Pro gift redeemed:', email, 'from parent:', parent.email);
    return Response.json({ redeemed: true, parentName: parentFirst });
  } catch (e) {
    console.error('redeemPendingProGift error:', e.message);
    return Response.json({ redeemed: false, error: e.message }, { status: 500 });
  }
}