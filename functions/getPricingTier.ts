import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Determines the user's pricing tier based on their join date and points.
 * 
 * PRICING STRUCTURE (NO STRIPE COLLECTION YET - INFORMATIONAL ONLY):
 * ===================================================================
 * 
 * STUDENTS: 
 * - 100% FREE forever (no exceptions)
 * 
 * PARENTS:
 * - Users #1-1,000: $0/month (Founding Gators 👑) - FREE FOREVER
 * - Users #1,001-4,999: $9/month (Early Adopters) - FUTURE BILLING
 * - Users #5,000+: $19/month (Standard) - FUTURE BILLING
 * 
 * POINTS SYSTEM (Referral Rewards):
 * - 100 points per successful invite
 * - 2,000 points (20 invites) = FREE lifetime membership for parents
 * 
 * NOTE: Stripe checkout is NOT active yet. This function only 
 * determines and displays pricing tiers. Actual payment collection
 * will be added later when ready to monetize.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // **STUDENTS ARE ALWAYS FREE**
    if (user.persona === 'gator' || user.roles?.includes('gator')) {
      return Response.json({
        success: true,
        tier: 'free',
        price: 0,
        tierName: 'Student (Free Forever)',
        isFounding: false,
        isEarlyAdopter: false,
        isStudent: true,
        hasLifetimeMembership: true, // Students always have "lifetime" free access
        points: user.points || 0,
        pointsToFree: 0, // Students don't need points
        successfulInvites: user.successful_invites || 0,
        invitesNeeded: 0, // Students don't need invites to get free access
        message: '🎓 Students always get free access!'
      });
    }

    // For parents, check if they have lifetime membership from points
    if (user.has_lifetime_membership === true) {
      return Response.json({
        success: true,
        tier: 'earned_free',
        price: 0,
        tierName: 'Earned Free Membership 🎉',
        isFounding: false,
        isEarlyAdopter: false,
        isStudent: false,
        hasLifetimeMembership: true,
        points: user.points || 0,
        pointsToFree: 0,
        successfulInvites: user.successful_invites || 0,
        invitesNeeded: 0,
        message: '🎉 You earned free lifetime membership through invites!'
      });
    }

    // Get all users sorted by creation date to determine position
    // This determines if they're in the first 1,000 (Founding), 1,001-4,999 (Early Adopter), or 5,000+ (Standard)
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 10000);
    
    // Find user's position (1-indexed)
    const userPosition = allUsers.findIndex(u => u.id === user.id) + 1;
    
    if (userPosition === 0) {
      // User not found in list, treat as new user (standard pricing)
      const currentPoints = user.points || 0;
      const pointsNeeded = Math.max(0, 2000 - currentPoints);
      const invitesNeeded = Math.ceil(pointsNeeded / 100);
      
      return Response.json({
        success: true,
        tier: 'standard',
        price: 19,
        tierName: 'Standard',
        isFounding: false,
        isEarlyAdopter: false,
        isStudent: false,
        hasLifetimeMembership: false,
        points: currentPoints,
        pointsToFree: pointsNeeded,
        successfulInvites: user.successful_invites || 0,
        invitesNeeded: invitesNeeded,
        message: `Invite ${invitesNeeded} more ${invitesNeeded === 1 ? 'person' : 'people'} to unlock free membership!`
      });
    }

    // Determine tier based on position (CRITICAL LOGIC - DO NOT MODIFY WITHOUT UPDATING PRICING PAGE)
    let tier, price, tierName, isFounding, isEarlyAdopter;
    
    if (userPosition <= 1000) {
      // First 1,000 users = Founding Gators (FREE FOREVER)
      tier = 'founding';
      price = 0;
      tierName = 'Founding Gator 👑';
      isFounding = true;
      isEarlyAdopter = false;
    } else if (userPosition <= 4999) {
      // Users 1,001-4,999 = Early Adopters ($9/month when billing starts)
      tier = 'early_adopter';
      price = 9;
      tierName = 'Early Adopter';
      isFounding = false;
      isEarlyAdopter = true;
    } else {
      // Users 5,000+ = Standard ($19/month when billing starts)
      tier = 'standard';
      price = 19;
      tierName = 'Standard';
      isFounding = false;
      isEarlyAdopter = false;
    }

    // Calculate points progress (parents can still earn free membership via invites)
    const currentPoints = user.points || 0;
    const pointsNeeded = Math.max(0, 2000 - currentPoints);
    const invitesNeeded = Math.ceil(pointsNeeded / 100);

    return Response.json({
      success: true,
      tier,
      price,
      tierName,
      isFounding,
      isEarlyAdopter,
      isStudent: false,
      hasLifetimeMembership: false,
      points: currentPoints,
      pointsToFree: pointsNeeded,
      successfulInvites: user.successful_invites || 0,
      invitesNeeded: invitesNeeded,
      userPosition, // Their position in signup order
      message: invitesNeeded > 0 
        ? `Invite ${invitesNeeded} more ${invitesNeeded === 1 ? 'person' : 'people'} to unlock free membership!`
        : 'You\'re close to free membership!'
    });

  } catch (error) {
    console.error('Error in getPricingTier:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to get pricing tier',
      details: error.message 
    }, { status: 500 });
  }
});