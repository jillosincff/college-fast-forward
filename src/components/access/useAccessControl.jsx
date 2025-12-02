import { useMemo } from 'react';

const FOUNDING_GATOR_LIMIT = 1000;
const FREE_DAILY_MESSAGE_LIMIT = 3;
const PREMIUM_PRICE = 9; // $9/month

/**
 * Get current day key in ET timezone for daily message reset
 */
function getCurrentDayET() {
  const now = new Date();
  // Convert to Eastern Time
  const etOptions = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
  const etDate = new Intl.DateTimeFormat('en-US', etOptions).format(now);
  return etDate; // MM/DD/YYYY format
}

/**
 * Hook to determine user's access level and restrictions
 * @param {Object} user - The current user object
 * @param {Object} linkedParent - Optional: the user's linked parent (if fetched separately)
 * @returns {Object} Access control info
 */
export function useAccessControl(user, linkedParent = null) {
  return useMemo(() => {
    if (!user) {
      return {
        hasFullAccess: false,
        isPremium: false,
        isFoundingGator: false,
        isLimitedMode: true,
        canSendMessages: false,
        messagesRemaining: 0,
        messageLimit: FREE_DAILY_MESSAGE_LIMIT,
        canAccessTalentSpotlight: false,
        canApplyToOpportunities: false,
        canSaveOpportunities: false,
        canMessageInDirectory: false,
        canSeeFullContactInfo: false,
        isFeatured: false,
        hasLinkedParent: false,
        reason: 'not_authenticated'
      };
    }

    // Parents always have full access
    if (user.persona === 'parent') {
      return {
        hasFullAccess: true,
        isPremium: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageInDirectory: true,
        canSeeFullContactInfo: true,
        isFeatured: false,
        hasLinkedParent: false,
        reason: 'parent'
      };
    }

    // Admins always have full access
    if (user.roles?.includes('admin')) {
      return {
        hasFullAccess: true,
        isPremium: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageInDirectory: true,
        canSeeFullContactInfo: true,
        isFeatured: false,
        hasLinkedParent: false,
        reason: 'admin'
      };
    }

    // Check if Founding Gator (first 1,000 users)
    const isFoundingGator = user.is_founding_gator === true || 
                           (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT);

    if (isFoundingGator) {
      return {
        hasFullAccess: true,
        isPremium: true,
        isFoundingGator: true,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageInDirectory: true,
        canSeeFullContactInfo: true,
        isFeatured: true,
        hasLinkedParent: !!user.linked_parent_id || !!user.parent_email,
        reason: 'founding_gator'
      };
    }

    // Check if student has their own premium subscription (self-pay)
    const hasSelfPaidPremium = user.subscription_status === 'active' && 
                               user.subscription_type === 'student_self_pay';

    if (hasSelfPaidPremium) {
      return {
        hasFullAccess: true,
        isPremium: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageInDirectory: true,
        canSeeFullContactInfo: true,
        isFeatured: true,
        hasLinkedParent: !!user.linked_parent_id || !!user.parent_email,
        reason: 'student_self_pay'
      };
    }

    // Check if linked parent has active subscription
    const hasLinkedParent = !!user.linked_parent_id || !!user.parent_email;
    const parentSubscriptionActive = linkedParent?.subscription_status === 'active' ||
                                    user.linked_parent_subscription_active === true ||
                                    user.has_active_parent_subscription === true;

    if (parentSubscriptionActive) {
      return {
        hasFullAccess: true,
        isPremium: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        messageLimit: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageInDirectory: true,
        canSeeFullContactInfo: true,
        isFeatured: true,
        hasLinkedParent: true,
        reason: 'parent_subscription'
      };
    }

    // FREE TIER - calculate remaining messages for today (resets midnight ET)
    const currentDayET = getCurrentDayET();
    const messagesSentToday = user.messages_day_reset === currentDayET 
      ? (user.messages_sent_today || 0) 
      : 0;
    const messagesRemaining = Math.max(0, FREE_DAILY_MESSAGE_LIMIT - messagesSentToday);

    return {
      hasFullAccess: false,
      isPremium: false,
      isFoundingGator: false,
      isLimitedMode: true,
      canSendMessages: messagesRemaining > 0,
      messagesRemaining,
      messageLimit: FREE_DAILY_MESSAGE_LIMIT,
      canAccessTalentSpotlight: false,
      canApplyToOpportunities: true, // Free users can still apply
      canSaveOpportunities: true, // Free users can save
      canMessageInDirectory: messagesRemaining > 0,
      canSeeFullContactInfo: false, // Free users can't see parent email/LinkedIn
      isFeatured: false,
      hasLinkedParent,
      reason: 'free_tier'
    };
  }, [user, linkedParent]);
}

/**
 * Check if a user has full/premium access (non-hook version for use outside components)
 */
export function checkFullAccess(user, linkedParent = null) {
  if (!user) return false;
  if (user.persona === 'parent') return true;
  if (user.roles?.includes('admin')) return true;
  if (user.is_founding_gator === true) return true;
  if (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT) return true;
  if (user.subscription_status === 'active' && user.subscription_type === 'student_self_pay') return true;
  if (linkedParent?.subscription_status === 'active') return true;
  if (user.linked_parent_subscription_active === true) return true;
  if (user.has_active_parent_subscription === true) return true;
  return false;
}

/**
 * Check if user has a linked parent account
 */
export function hasLinkedParent(user) {
  if (!user) return false;
  return !!user.linked_parent_id || !!user.parent_email;
}

/**
 * Get current day in ET timezone
 */
export function getCurrentDayET() {
  const now = new Date();
  const etOptions = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Intl.DateTimeFormat('en-US', etOptions).format(now);
}

export const ACCESS_CONSTANTS = {
  FOUNDING_GATOR_LIMIT,
  FREE_DAILY_MESSAGE_LIMIT,
  PREMIUM_PRICE
};