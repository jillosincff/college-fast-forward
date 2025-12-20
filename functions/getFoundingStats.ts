import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const FOUNDING_LIMIT = 1000;
const EARLY_ADOPTER_LIMIT = 5000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ALWAYS get real user count from database
    const allUsers = await base44.asServiceRole.entities.User.list();
    const actualUserCount = allUsers.length;
    
    // Update GlobalCounter to stay in sync with actual users
    try {
      const counters = await base44.asServiceRole.entities.GlobalCounter.filter({
        counter_name: 'family_count'
      });
      
      if (counters.length > 0) {
        // Only update if different (avoid unnecessary writes)
        if (counters[0].counter_value !== actualUserCount) {
          await base44.asServiceRole.entities.GlobalCounter.update(counters[0].id, {
            counter_value: actualUserCount,
            last_updated: new Date().toISOString()
          });
          console.log(`📊 Synced GlobalCounter: ${counters[0].counter_value} → ${actualUserCount}`);
        }
      } else {
        // Create counter if it doesn't exist
        await base44.asServiceRole.entities.GlobalCounter.create({
          counter_name: 'family_count',
          counter_value: actualUserCount,
          last_updated: new Date().toISOString()
        });
        console.log(`📊 Created GlobalCounter with value: ${actualUserCount}`);
      }
    } catch (syncError) {
      console.error('Failed to sync GlobalCounter:', syncError);
    }
    
    // Use actual user count for all calculations
    const familyCount = actualUserCount;

    // Determine current tier
    let currentTier, spotsLeft, nextTierPrice;
    
    if (familyCount < FOUNDING_LIMIT) {
      currentTier = 'founding';
      spotsLeft = Math.max(0, FOUNDING_LIMIT - familyCount);
      nextTierPrice = '$9/month';
    } else if (familyCount < EARLY_ADOPTER_LIMIT) {
      currentTier = 'early_adopter';
      spotsLeft = Math.max(0, EARLY_ADOPTER_LIMIT - familyCount);
      nextTierPrice = '$19/month';
    } else {
      currentTier = 'standard';
      spotsLeft = null;
      nextTierPrice = null;
    }

    return Response.json({
      success: true,
      total_users: familyCount, // For backwards compatibility
      total_families: familyCount,
      spots_left: spotsLeft,
      founding_limit: FOUNDING_LIMIT,
      early_adopter_limit: EARLY_ADOPTER_LIMIT,
      founding_active: familyCount < FOUNDING_LIMIT,
      current_tier: currentTier,
      next_tier_price: nextTierPrice,
      // Pricing info
      current_price: currentTier === 'founding' ? 'FREE' : currentTier === 'early_adopter' ? '$9/month' : '$19/month',
      urgency_message: currentTier === 'founding' 
        ? `🔥 Only ${spotsLeft} FREE Founding Spots Left!`
        : currentTier === 'early_adopter'
        ? `⚡ ${spotsLeft} spots left at $9/month!`
        : `Join ${familyCount}+ Gator Families`
    });

  } catch (error) {
    console.error('❌ Get founding stats error:', error);
    return Response.json({ 
      error: error.message || 'Failed to get founding stats',
      success: true,
      total_users: 700,
      spots_left: 300,
      founding_limit: FOUNDING_LIMIT,
      founding_active: true,
      current_tier: 'founding'
    }, { status: 500 });
  }
});