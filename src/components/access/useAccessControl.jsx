import { useMemo } from 'react';

const FOUNDING_GATOR_LIMIT = 1000;

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Access Control — Family-First Model
// ═══════════════════════════════════════════════════════════════
// Access check priority:
//   1. User's own subscription_tier / subscription_status
//   2. Family entity subscription (covers all linked members)
//   3. Founding member status (user OR family)
//
// Family entity is the source of truth for billing.
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a user is a founding member (free access to everything)
 */
export function isFoundingMember(user, family = null) {
  if (!user) return false;
  if (user.subscription_tier === 'free_founding') return true;
  if (user.is_founding_member === true) return true;
  if (user.is_founding_gator === true) return true;
  if (user.price_tier === 'founding') return true;
  if (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT) return true;
  // Check family
  if (family?.subscription_tier === 'free_founding') return true;
  if (family?.price_tier === 'founding' && family?.subscription_status === 'active') return true;
  return false;
}

/**
 * Check if user has FASTIQ access.
 * Accepts optional family parameter for family-level subscription check.
 * Returns: { hasAccess, reason, tier }
 */
export function checkFastIQAccess(user, family = null) {
  if (!user) return { hasAccess: false, reason: 'not_authenticated', tier: null };

  // Admins always have access
  if (user.roles?.includes('admin')) return { hasAccess: true, reason: 'admin', tier: 'admin' };

  // Parents always have access (they see the parent view)
  if (user.persona === 'parent' || user.roles?.includes('parent')) {
    return { hasAccess: true, reason: 'parent', tier: 'parent' };
  }

  // Founding members get everything free
  if (isFoundingMember(user, family)) {
    return { hasAccess: true, reason: 'founding_member', tier: 'free_founding' };
  }

  // ── Check user's own subscription ──
  const userTier = user.subscription_tier;
  const userStatus = user.subscription_status;
  const userActive = userStatus === 'active' || userStatus === 'trialing';

  if (userTier === 'fastiq' && userActive) {
    return { hasAccess: true, reason: 'fastiq_subscriber', tier: 'fastiq' };
  }

  // Canceled but still within billing period (user level)
  if (userTier === 'fastiq' && userStatus === 'canceled' && user.current_period_end) {
    const periodEnd = new Date(user.current_period_end);
    if (periodEnd > new Date()) {
      return { hasAccess: true, reason: 'canceled_active_period', tier: 'fastiq', periodEnd: user.current_period_end };
    }
  }

  // ── Check Family entity subscription (source of truth) ──
  if (family) {
    const famTier = family.subscription_tier;
    const famStatus = family.subscription_status;
    const famActive = famStatus === 'active' || famStatus === 'trialing';

    if (famTier === 'fastiq' && famActive) {
      return { hasAccess: true, reason: 'family_subscription', tier: 'fastiq', billingOwner: family.billing_owner_name };
    }

    // Family canceled but within period
    if (famTier === 'fastiq' && famStatus === 'canceled' && family.current_period_end) {
      const periodEnd = new Date(family.current_period_end);
      if (periodEnd > new Date()) {
        return { hasAccess: true, reason: 'family_canceled_active_period', tier: 'fastiq', periodEnd: family.current_period_end };
      }
    }

    // Family has CFF only
    if (famTier === 'cff' && famActive) {
      return { hasAccess: false, reason: 'family_cff_only', tier: 'cff' };
    }
  }

  // CFF-only subscriber (user level) — no FASTIQ
  if (userTier === 'cff' && userActive) {
    return { hasAccess: false, reason: 'cff_only', tier: 'cff' };
  }

  // No subscription
  return { hasAccess: false, reason: 'no_subscription', tier: null };
}

/**
 * Check if user has CFF access (directory, community, messaging, etc.)
 */
export function checkCFFAccess(user, family = null) {
  if (!user) return false;
  if (user.roles?.includes('admin')) return true;
  if (isFoundingMember(user, family)) return true;

  const status = user.subscription_status;
  const isActive = status === 'active' || status === 'trialing' || status === 'free_founding';
  if (isActive) return true;

  // Canceled but within period
  if (status === 'canceled' && user.current_period_end) {
    if (new Date(user.current_period_end) > new Date()) return true;
  }

  // Check family subscription
  if (family) {
    const famActive = family.subscription_status === 'active' || family.subscription_status === 'trialing';
    if (famActive) return true;
    if (family.subscription_status === 'canceled' && family.current_period_end) {
      if (new Date(family.current_period_end) > new Date()) return true;
    }
  }

  return false;
}

/**
 * Hook to determine user's access level and restrictions.
 * family: the user's Family entity record (fetched by the page).
 */
export function useAccessControl(user, family = null, totalUserCount = 0) {
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

    const fastiqAccess = checkFastIQAccess(user, family);
    const cffAccess = checkCFFAccess(user, family);
    const founding = isFoundingMember(user, family);

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
      subscriptionTier: user.subscription_tier || family?.subscription_tier || (founding ? 'free_founding' : null),
      subscriptionStatus: user.subscription_status || family?.subscription_status || (founding ? 'free_founding' : null),
      fastiqReason: fastiqAccess.reason,
      fastiqPeriodEnd: fastiqAccess.periodEnd,
      fastiqBillingOwner: fastiqAccess.billingOwner,
      isBillingOwner: !family?.billing_owner_id || family?.billing_owner_id === user.id,
      reason: user.persona === 'parent' ? 'parent' : user.roles?.includes('admin') ? 'admin' : founding ? 'founding_gator' : 'full_access',
    };
  }, [user, family, totalUserCount]);
}

/**
 * Non-hook version for use outside components
 */
export function checkFullAccess(user, family = null) {
  if (!user) return false;
  if (user.persona === 'parent') return true;
  if (user.roles?.includes('admin')) return true;
  if (isFoundingMember(user, family)) return true;

  const status = user.subscription_status;
  if (status === 'active' || status === 'trialing') return true;

  // Family subscription
  if (family) {
    const famStatus = family.subscription_status;
    if (famStatus === 'active' || famStatus === 'trialing') return true;
  }

  return false;
}

/**
 * Get user's tier display info
 */
export function getUserTierInfo(user, family = null) {
  if (!user) return null;

  if (isFoundingMember(user, family)) {
    return {
      tier: 'free_founding',
      memberNumber: user.member_number || user.founding_gator_number || user.signup_order || family?.member_number,
      priceDisplay: 'FREE FOREVER',
      badgeLabel: '👑 FOUNDING MEMBER',
      isFounder: true,
    };
  }

  // Check family tier first (source of truth), then user
  const tier = family?.subscription_tier || user.subscription_tier;
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