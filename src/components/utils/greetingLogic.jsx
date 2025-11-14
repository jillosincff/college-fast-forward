// Bulletproof greeting logic with cookie + DB + freshness checks
import { getFirstName } from './nameUtils';

// Helper to get cookie value
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper to clear cookie
const clearCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// Bulletproof first-time detection
export const isFirstTimeVisit = (user) => {
  if (!user) return false;

  // Priority 1: Cookie override (most reliable for immediate post-signup)
  const isCookieNew = getCookie('cff_new_user') === '1';
  if (isCookieNew) {
    // Clear cookie so only the very first load uses it
    clearCookie('cff_new_user');
    return true;
  }

  // Priority 2: DB flag
  const hasSeen = Boolean(user.has_seen_dashboard);
  if (!hasSeen) {
    return true;
  }

  // Priority 3: Recently created fallback (within 5 minutes)
  if (user.created_date) {
    const recentlyCreated = Date.now() - new Date(user.created_date).getTime() < 5 * 60 * 1000;
    if (recentlyCreated) {
      return true;
    }
  }

  return false;
};

// Generate greeting with debug logging
export const getGreeting = (user) => {
  // Gracefully handle null or undefined user object
  if (!user) {
    return {
      greeting: 'Welcome',
      firstName: 'Gator',
      isFirstTime: false,
    };
  }

  // Use the robust getFirstName utility
  const firstName = getFirstName(user);
  const isFirstTime = isFirstTimeVisit(user);

  return {
    greeting: isFirstTime ? 'Welcome' : 'Welcome back',
    firstName,
    isFirstTime
  };
};