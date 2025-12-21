import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const familyGroupId = user.family_group_id;
    
    if (!familyGroupId) {
      // User not in a family - return default state
      return Response.json({
        success: true,
        family_group_id: null,
        total_karma: 0,
        karma_level: 'bronze',
        boost_multiplier: 0,
        user_karma: user.karma_earned || 0,
        recent_transactions: [],
        next_level: {
          name: 'silver',
          points_needed: 50,
          points_remaining: 50
        }
      });
    }
    
    // Get family karma
    const karmaRecords = await base44.asServiceRole.entities.FamilyKarma.filter({
      family_group_id: familyGroupId
    });
    
    let familyKarma = {
      total_karma: 0,
      karma_level: 'bronze',
      boost_multiplier: 0
    };
    
    if (karmaRecords.length > 0) {
      familyKarma = karmaRecords[0];
    }
    
    // Get recent transactions
    const transactions = await base44.asServiceRole.entities.KarmaTransaction.filter(
      { family_group_id: familyGroupId },
      '-created_date',
      10
    );
    
    // Calculate next level
    const currentKarma = familyKarma.total_karma || 0;
    let nextLevel = null;
    
    if (currentKarma < 50) {
      nextLevel = { name: 'silver', points_needed: 50, points_remaining: 50 - currentKarma };
    } else if (currentKarma < 150) {
      nextLevel = { name: 'gold', points_needed: 150, points_remaining: 150 - currentKarma };
    } else if (currentKarma < 300) {
      nextLevel = { name: 'platinum', points_needed: 300, points_remaining: 300 - currentKarma };
    } else {
      nextLevel = { name: 'max', points_needed: 0, points_remaining: 0 };
    }
    
    return Response.json({
      success: true,
      family_group_id: familyGroupId,
      total_karma: familyKarma.total_karma,
      karma_level: familyKarma.karma_level,
      boost_multiplier: familyKarma.boost_multiplier,
      user_karma: user.karma_earned || 0,
      recent_transactions: transactions,
      next_level: nextLevel
    });
    
  } catch (error) {
    console.error('getFamilyKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});