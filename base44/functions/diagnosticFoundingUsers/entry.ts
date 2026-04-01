import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.entities.User.filter({});

    console.log('Total users:', allUsers.length);
    console.log('Sample user fields:', JSON.stringify(allUsers[0], null, 2));

    const byTier = {};
    allUsers.forEach(u => {
      const tier = u.subscription_tier || 'none';
      byTier[tier] = (byTier[tier] || 0) + 1;
    });

    console.log('Breakdown by subscription_tier:', byTier);

    // Additional breakdown
    const byFoundingStatus = {
      is_founding_member_true: allUsers.filter(u => u.is_founding_member === true).length,
      is_founding_member_false: allUsers.filter(u => u.is_founding_member === false).length,
      is_founding_member_none: allUsers.filter(u => !u.hasOwnProperty('is_founding_member')).length,
    };
    console.log('Breakdown by is_founding_member:', byFoundingStatus);

    const byPriceTier = {};
    allUsers.forEach(u => {
      const tier = u.price_tier || 'none';
      byPriceTier[tier] = (byPriceTier[tier] || 0) + 1;
    });
    console.log('Breakdown by price_tier:', byPriceTier);

    return Response.json({
      success: true,
      totalUsers: allUsers.length,
      subscriptionTierBreakdown: byTier,
      foundingMemberBreakdown: byFoundingStatus,
      priceTierBreakdown: byPriceTier,
      sampleUser: allUsers[0],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});