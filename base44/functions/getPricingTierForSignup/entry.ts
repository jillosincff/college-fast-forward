import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Get the pricing tier for a new signup based on current family count
 * 
 * Tiers:
 * - Founding (1-1000): FREE FOREVER
 * - Early Adopter (1001-5000): $9/month FOREVER
 * - Standard (5001+): $29/month
 */

const FOUNDING_LIMIT = 1000;
const EARLY_ADOPTER_LIMIT = 5000;
const EARLY_ADOPTER_PRICE = 900; // cents
const STANDARD_PRICE = 2900; // cents

// Stripe Price IDs (from Stripe dashboard)
const STRIPE_PRICE_EARLY_ADOPTER = 'price_1SUJ2g873TV7WMcTBYvmzGYU'; // $9/month
const STRIPE_PRICE_STANDARD = 'price_1SUJ7I873TV7WMcT1plkAZpz'; // $29/month

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get current family count from GlobalCounter
    let familyCount = 0;
    
    try {
      const counters = await base44.asServiceRole.entities.GlobalCounter.filter({
        counter_name: 'family_count'
      });
      
      if (counters.length > 0) {
        familyCount = counters[0].counter_value || 0;
      } else {
        // Initialize counter based on existing families
        const existingFamilies = await base44.asServiceRole.entities.Family.list();
        familyCount = existingFamilies.length;
        
        // Also count existing users without families (legacy)
        const allUsers = await base44.asServiceRole.entities.User.list();
        const usersWithoutFamily = allUsers.filter(u => !u.family_id);
        
        // Estimate family count as max of Family entities or unique family_group_ids
        const uniqueFamilyGroups = new Set(allUsers.map(u => u.family_group_id).filter(Boolean));
        familyCount = Math.max(familyCount, uniqueFamilyGroups.size, Math.ceil(allUsers.length / 2));
        
        await base44.asServiceRole.entities.GlobalCounter.create({
          counter_name: 'family_count',
          counter_value: familyCount,
          last_updated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error getting family count:', error);
      // Fallback: estimate from users
      const allUsers = await base44.asServiceRole.entities.User.list();
      familyCount = Math.ceil(allUsers.length / 2);
    }

    // Calculate next member number
    const nextMemberNumber = familyCount + 1;

    // Determine tier based on member number
    let tier, lockedPrice, stripePriceId, requiresPayment;
    
    if (nextMemberNumber <= FOUNDING_LIMIT) {
      tier = 'founding';
      lockedPrice = 0;
      stripePriceId = null;
      requiresPayment = false;
    } else if (nextMemberNumber <= EARLY_ADOPTER_LIMIT) {
      tier = 'early_adopter';
      lockedPrice = EARLY_ADOPTER_PRICE;
      stripePriceId = STRIPE_PRICE_EARLY_ADOPTER;
      requiresPayment = true;
    } else {
      tier = 'standard';
      lockedPrice = STANDARD_PRICE;
      stripePriceId = STRIPE_PRICE_STANDARD;
      requiresPayment = true;
    }

    // Calculate spots remaining at current price
    let spotsRemaining;
    if (tier === 'founding') {
      spotsRemaining = FOUNDING_LIMIT - familyCount;
    } else if (tier === 'early_adopter') {
      spotsRemaining = EARLY_ADOPTER_LIMIT - familyCount;
    } else {
      spotsRemaining = null; // Unlimited at standard
    }

    return Response.json({
      success: true,
      current_family_count: familyCount,
      next_member_number: nextMemberNumber,
      tier,
      tier_display: tier === 'founding' ? 'Founding Member' : tier === 'early_adopter' ? 'Early Adopter' : 'Member',
      locked_price_monthly: lockedPrice,
      locked_price_display: lockedPrice === 0 ? 'FREE FOREVER' : `$${lockedPrice / 100}/month`,
      stripe_price_id: stripePriceId,
      requires_payment: requiresPayment,
      spots_remaining: spotsRemaining,
      next_tier: tier === 'founding' ? 'early_adopter' : tier === 'early_adopter' ? 'standard' : null,
      next_tier_price: tier === 'founding' ? '$9/month' : tier === 'early_adopter' ? '$29/month' : null,
      
      // Messaging for UI
      urgency_message: tier === 'founding' 
        ? `🔥 Only ${spotsRemaining} FREE Founding Spots Left!`
        : tier === 'early_adopter'
        ? `⚡ ${spotsRemaining} spots left at $9/month!`
        : `Join ${familyCount}+ Gator Families`,
      badge_type: tier === 'founding' ? '👑 FOUNDING MEMBER' : tier === 'early_adopter' ? '⭐ EARLY ADOPTER' : '✓ MEMBER'
    });

  } catch (error) {
    console.error('❌ Get pricing tier error:', error);
    return Response.json({ 
      error: error.message || 'Failed to get pricing tier',
      // Fallback to founding tier on error
      tier: 'founding',
      requires_payment: false,
      locked_price_monthly: 0
    }, { status: 500 });
  }
});