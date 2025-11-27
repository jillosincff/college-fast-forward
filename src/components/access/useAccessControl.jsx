import { useMemo } from 'react';

const FOUNDING_GATOR_LIMIT = 1000;
const LIMITED_MODE_MESSAGE_LIMIT = 5;

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
        isFoundingGator: false,
        isLimitedMode: true,
        canSendMessages: false,
        messagesRemaining: 0,
        canAccessTalentSpotlight: false,
        canApplyToOpportunities: false,
        canSaveOpportunities: false,
        canMessageInDirectory: false,
        reason: 'not_authenticated'
      };
    }

    // Parents always have full access
    if (user.persona === 'parent') {
      return {
        hasFullAccess: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageFromDirectory: true,
        reason: 'parent'
      };
    }

    // Admins always have full access
    if (user.roles?.includes('admin')) {
      return {
        hasFullAccess: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageFromDirectory: true,
        reason: 'admin'
      };
    }

    // Check if Founding Gator (first 1,000 users)
    const isFoundingGator = user.is_founding_gator === true || 
                           (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT);

    if (isFoundingGator) {
      return {
        hasFullAccess: true,
        isFoundingGator: true,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageFromDirectory: true,
        reason: 'founding_gator'
      };
    }

    // Check if linked parent has active subscription
    const parentSubscriptionActive = linkedParent?.subscription_status === 'active' ||
                                    user.linked_parent_subscription_active === true;

    if (parentSubscriptionActive) {
      return {
        hasFullAccess: true,
        isFoundingGator: false,
        isLimitedMode: false,
        canSendMessages: true,
        messagesRemaining: Infinity,
        canAccessTalentSpotlight: true,
        canApplyToOpportunities: true,
        canSaveOpportunities: true,
        canMessageFromDirectory: true,
        reason: 'parent_subscription'
      };
    }

    // LIMITED MODE - calculate remaining messages
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const messagesSentThisMonth = user.messages_month_reset === currentMonth 
      ? (user.messages_sent_this_month || 0) 
      : 0;
    const messagesRemaining = Math.max(0, LIMITED_MODE_MESSAGE_LIMIT - messagesSentThisMonth);

    return {
      hasFullAccess: false,
      isFoundingGator: false,
      isLimitedMode: true,
      canSendMessages: messagesRemaining > 0,
      messagesRemaining,
      messageLimit: LIMITED_MODE_MESSAGE_LIMIT,
      canAccessTalentSpotlight: false,
      canApplyToOpportunities: true, // View only - can see but not apply via intro
      canSaveOpportunities: true, // Allow saving - localStorage based
      canMessageFromDirectory: false, // Hide "Message" button in directory
      reason: 'limited_mode'
    };
  }, [user, linkedParent]);
}

/**
 * Check if a user has full access (non-hook version for use outside components)
 */
export function checkFullAccess(user, linkedParent = null) {
  if (!user) return false;
  if (user.persona === 'parent') return true;
  if (user.roles?.includes('admin')) return true;
  if (user.is_founding_gator === true) return true;
  if (user.signup_order && user.signup_order <= FOUNDING_GATOR_LIMIT) return true;
  if (linkedParent?.subscription_status === 'active') return true;
  if (user.linked_parent_subscription_active === true) return true;
  return false;
}

export const ACCESS_CONSTANTS = {
  FOUNDING_GATOR_LIMIT,
  LIMITED_MODE_MESSAGE_LIMIT
};