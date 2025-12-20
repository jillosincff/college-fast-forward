import { useMemo } from 'react';

const FOUNDING_GATOR_LIMIT = 1000;
const EARLY_ADOPTER_THRESHOLD = 5000;
const PREMIUM_PRICE_EARLY = 9;
const PREMIUM_PRICE_STANDARD = 19;
const PREMIUM_ACTIVATION_THRESHOLD = 1000;
const LIFETIME_DEAL_START = 451;
const LIFETIME_DEAL_END = 2000;
const LIFETIME_DEAL_PRICE = 149;

// Cache for user count to avoid repeated API calls
let cachedUserCount = null;
let cacheExpiry = 0;

/**
 * Get total user count (cached for 5 minutes)
 */
export async function getTotalUserCount() {
  const now = Date.now();
  if (cachedUserCount !== null && now < cacheExpiry) {
    return cachedUserCount;
  }
  
  try {
    const { getUserCount } = await import('@/functions/getUserCount');
    const result = await getUserCount({});
    cachedUserCount = result?.data?.count || 0;
    cacheExpiry = now + 5 * 60 * 1000; // Cache for 5 minutes
    return cachedUserCount;
  } catch (error) {
    console.error('Failed to get user count:', error);
    return cachedUserCount || 0;
  }
}

/**
 * Check if premium features should be active (1,000+ users)
 */
export function isPremiumActive(userCount) {
  return userCount >= PREMIUM_ACTIVATION_THRESHOLD;
}



/**
 * Hook to determine user's access level and restrictions
 * @param {Object} user - The current user object
 * @param {Object} linkedParent - Optional: the user's linked parent (if fetched separately)
 * @param {number} totalUserCount - Optional: current total user count for premium activation check
 * @returns {Object} Access control info
 */
export function useAccessControl(user, linkedParent = null, totalUserCount = 0) {
  return useMemo(() => {
    if (!user) {
      return {
        hasFullAccess: false,
        isPremium: false,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: false,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canApplyToOpportunities: false,
        canSaveOpportunities: false,
        canMessageInDirectory: false,
        canSeeFullContactInfo: false,
        isFeatured: false,
        hasLinkedParent: false,
        premiumActivated: false,
        reason: 'not_authenticated'
      };
    }

    // Everyone gets full access - no freemium limits
    const premiumActivated = isPremiumActive(totalUserCount);
    const isFoundingGator = user.is_founding_gator === true || (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT);

    // Everyone gets full access - no limits
    return {
      hasFullAccess: true,
      isPremium: true,
      isFoundingGator,
      isLimitedMode: false,
      canSendMessages: true,
      messagesRemaining: Infinity,
      messageLimit: Infinity,
      canApplyToOpportunities: true,
      canSaveOpportunities: true,
      canMessageInDirectory: true,
      canSeeFullContactInfo: true,
      isFeatured: isFoundingGator,
      hasLinkedParent: !!user.linked_parent_id || !!user.parent_email,
      premiumActivated,
      reason: user.persona === 'parent' ? 'parent' : user.roles?.includes('admin') ? 'admin' : isFoundingGator ? 'founding_gator' : 'full_access'
    };
  }, [user, linkedParent, totalUserCount]);
}

/**
 * Check if a user has full/premium access (non-hook version for use outside components)
 */
export function checkFullAccess(user, linkedParent = null) {
  if (!user) return false;
  if (user.persona === 'parent') return true;
  if (user.roles?.includes('admin')) return true;
  
  // Founding members always have access
  if (user.is_founding_member === true) return true;
  if (user.is_founding_gator === true) return true;
  if (user.price_tier === 'founding') return true;
  if (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT) return true;
  
  // Active subscription (any tier)
  if (user.subscription_status === 'active') return true;
  if (user.subscription_status === 'trialing') return true;
  
  // Legacy fields
  if (linkedParent?.subscription_status === 'active') return true;
  if (user.linked_parent_subscription_active === true) return true;
  if (user.has_active_parent_subscription === true) return true;
  
  return false;
}

/**
 * Get user's pricing tier info
 */
export function getUserTierInfo(user) {
  if (!user) return null;
  
  const tier = user.price_tier || (user.is_founding_member || user.is_founding_gator ? 'founding' : null);
  const memberNumber = user.member_number || user.founding_gator_number || user.signup_order;
  
  if (!tier) return null;
  
  return {
    tier,
    memberNumber,
    priceDisplay: tier === 'founding' ? 'FREE FOREVER' : tier === 'early_adopter' ? '$9/month' : '$19/month',
    badgeLabel: tier === 'founding' ? '👑 FOUNDING MEMBER' : tier === 'early_adopter' ? '⭐ EARLY ADOPTER' : '✓ MEMBER',
    isFounder: tier === 'founding'
  };
}

/**
 * Check if user has a linked parent account
 */
export function hasLinkedParent(user) {
  if (!user) return false;
  return !!user.linked_parent_id || !!user.parent_email;
}



/**
 * Get current premium price based on total user count
 */
export function getCurrentPremiumPrice(userCount) {
  if (userCount >= EARLY_ADOPTER_THRESHOLD) {
    return PREMIUM_PRICE_STANDARD; // $19
  }
  return PREMIUM_PRICE_EARLY; // $9
}

/**
 * Get pricing tier info based on user count
 */
export function getPricingTierInfo(userCount) {
  const foundingSpotsLeft = Math.max(0, FOUNDING_GATOR_LIMIT - userCount);
  
  if (userCount < FOUNDING_GATOR_LIMIT) {
    return {
      phase: 'founding',
      currentPrice: 0,
      spotsLeft: foundingSpotsLeft,
      nextPhase: 'early_adopter',
      nextPrice: PREMIUM_PRICE_EARLY
    };
  }
  
  if (userCount < EARLY_ADOPTER_THRESHOLD) {
    return {
      phase: 'early_adopter',
      currentPrice: PREMIUM_PRICE_EARLY,
      spotsLeft: EARLY_ADOPTER_THRESHOLD - userCount,
      nextPhase: 'standard',
      nextPrice: PREMIUM_PRICE_STANDARD
    };
  }
  
  return {
    phase: 'standard',
    currentPrice: PREMIUM_PRICE_STANDARD,
    spotsLeft: null,
    nextPhase: null,
    nextPrice: null
  };
}

/**
 * Check if lifetime deal is available for a given user count
 */
export function isLifetimeDealAvailable(userCount) {
  return userCount >= LIFETIME_DEAL_START && userCount < LIFETIME_DEAL_END;
}

export const ACCESS_CONSTANTS = {
  FOUNDING_GATOR_LIMIT,
  PREMIUM_PRICE_EARLY,
  PREMIUM_PRICE_STANDARD,
  EARLY_ADOPTER_THRESHOLD,
  PREMIUM_ACTIVATION_THRESHOLD,
  LIFETIME_DEAL_START,
  LIFETIME_DEAL_END,
  LIFETIME_DEAL_PRICE
};