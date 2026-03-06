import { useMemo } from 'react';

const FOUNDING_GATOR_LIMIT = 1000;

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Access Control
// ═══════════════════════════════════════════════════════════════
// Tiers:
//   free_founding — All access (CFF + FASTIQ) free forever
//   cff           — CFF only ($9/mo). No FASTIQ.
//   fastiq        — CFF + FASTIQ ($29/mo or $249/yr)
//   null/none     — No subscription, needs to sign up
//
// Founding members are NOT gated. The gating logic is built
// but not enforced until we flip the switch.
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a user is a founding member (free access to everything)
 */
export function isFoundingMember(user) {
  if (!user) return false;
  if (user.subscription_tier === 'free_founding') return true;
  if (user.is_founding_member === true) return true;
  if (user.is_founding_gator === true) return true;
  if (user.price_tier === 'founding') return true;
  if (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT) return true;
  return false;
}

/**
 * Check if user has FASTIQ access
 * Returns: { hasAccess, reason, tier }
 */
export function checkFastIQAccess(user) {
  if (!user) return { hasAccess: false, reason: 'not_authenticated', tier: null };

  // Admins always have access
  if (user.roles?.includes('admin')) return { hasAccess: true, reason: 'admin', tier: 'admin' };

  // Parents always have access (they see the parent view)
  if (user.persona === 'parent' || user.roles?.includes('parent')) {
    return { hasAccess: true, reason: 'parent', tier: 'parent' };
  }

  // Founding members get everything free
  if (isFoundingMember(user)) {
    return { hasAccess: true, reason: 'founding_member', tier: 'free_founding' };
  }

  // Active FASTIQ subscription
  const tier = user.subscription_tier;
  const status = user.subscription_status;
  const isActive = status === 'active' || status === 'trialing';

  if (tier === 'fastiq' && isActive) {
    return { hasAccess: true, reason: 'fastiq_subscriber', tier: 'fastiq' };
  }

  // CFF-only subscriber — no FASTIQ
  if (tier === 'cff' && isActive) {
    return { hasAccess: false, reason: 'cff_only', tier: 'cff' };
  }

  // Canceled but still within billing period
  if (tier === 'fastiq' && status === 'canceled' && user.current_period_end) {
    const periodEnd = new Date(user.current_period_end);
    if (periodEnd > new Date()) {
      return { hasAccess: true, reason: 'canceled_active_period', tier: 'fastiq', periodEnd: user.current_period_end };
    }
  }

  // Parent paid for FASTIQ
  if (user.linked_parent_subscription_active === true || user.has_active_parent_subscription === true) {
    return { hasAccess: true, reason: 'parent_paid', tier: 'fastiq' };
  }

  // No subscription
  return { hasAccess: false, reason: 'no_subscription', tier: null };
}

/**
 * Check if user has CFF access (directory, community, messaging, etc.)
 */
export function checkCFFAccess(user) {
  if (!user) return false;
  if (user.roles?.includes('admin')) return true;
  if (isFoundingMember(user)) return true;

  const status = user.subscription_status;
  const isActive = status === 'active' || status === 'trialing' || status === 'free_founding';

  if (isActive) return true;

  // Canceled but within period
  if (status === 'canceled' && user.current_period_end) {
    return new Date(user.current_period_end) > new Date();
  }

  // Legacy: parent subscription
  if (user.linked_parent_subscription_active === true) return true;
  if (user.has_active_parent_subscription === true) return true;

  return false;
}

/**
 * Hook to determine user's access level and restrictions
 */
export function useAccessControl(user, linkedParent = null, totalUserCount = 0) {
  return useMemo(() => {
    if (!user) {
      return {
        hasFullAccess: false,
        hasFastIQAccess: false,
        hasCFFAccess: false,
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
        subscriptionTier: null,
        subscriptionStatus: null,
        reason: 'not_authenticated',
      };
    }

    const fastiqAccess = checkFastIQAccess(user);
    const cffAccess = checkCFFAccess(user);
    const founding = isFoundingMember(user);

    // Currently: everyone gets full access (founding members era)
    // When we flip the switch, cffAccess and fastiqAccess will gate features
    return {
      hasFullAccess: true,        // ← flip to: cffAccess
      hasFastIQAccess: true,      // ← flip to: fastiqAccess.hasAccess
      hasCFFAccess: true,         // ← flip to: cffAccess
      isPremium: true,
      isFoundingGator: founding,
      isLimitedMode: false,
      canSendMessages: true,
      messagesRemaining: Infinity,
      messageLimit: Infinity,
      canApplyToOpportunities: true,
      canSaveOpportunities: true,
      canMessageInDirectory: true,
      canSeeFullContactInfo: true,
      isFeatured: founding,
      hasLinkedParent: !!user.linked_parent_id || !!user.parent_email,
      subscriptionTier: user.subscription_tier || (founding ? 'free_founding' : null),
      subscriptionStatus: user.subscription_status || (founding ? 'free_founding' : null),
      fastiqReason: fastiqAccess.reason,
      fastiqPeriodEnd: fastiqAccess.periodEnd,
      reason: user.persona === 'parent' ? 'parent' : user.roles?.includes('admin') ? 'admin' : founding ? 'founding_gator' : 'full_access',
    };
  }, [user, linkedParent, totalUserCount]);
}

/**
 * Non-hook version for use outside components
 */
export function checkFullAccess(user, linkedParent = null) {
  if (!user) return false;
  if (user.persona === 'parent') return true;
  if (user.roles?.includes('admin')) return true;
  if (isFoundingMember(user)) return true;

  const status = user.subscription_status;
  if (status === 'active' || status === 'trialing') return true;

  if (linkedParent?.subscription_status === 'active') return true;
  if (user.linked_parent_subscription_active === true) return true;
  if (user.has_active_parent_subscription === true) return true;

  return false;
}

/**
 * Get user's tier display info
 */
export function getUserTierInfo(user) {
  if (!user) return null;

  if (isFoundingMember(user)) {
    return {
      tier: 'free_founding',
      memberNumber: user.member_number || user.founding_gator_number || user.signup_order,
      priceDisplay: 'FREE FOREVER',
      badgeLabel: '👑 FOUNDING MEMBER',
      isFounder: true,
    };
  }

  const tier = user.subscription_tier;
  if (tier === 'fastiq') {
    return {
      tier: 'fastiq',
      priceDisplay: '$29/month',
      badgeLabel: '⚡ CFF + FASTIQ',
      isFounder: false,
    };
  }
  if (tier === 'cff') {
    return {
      tier: 'cff',
      priceDisplay: '$9/month',
      badgeLabel: '✓ CFF Member',
      isFounder: false,
    };
  }

  return {
    tier: null,
    priceDisplay: 'No plan',
    badgeLabel: 'Free',
    isFounder: false,
  };
}

export function hasLinkedParent(user) {
  if (!user) return false;
  return !!user.linked_parent_id || !!user.parent_email;
}

export const ACCESS_CONSTANTS = {
  FOUNDING_GATOR_LIMIT,
};