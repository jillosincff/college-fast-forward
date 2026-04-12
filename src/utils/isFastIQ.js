/**
 * Shared FastIQ access check.
 * Use this instead of inline checks scattered across components.
 * 
 * TODO (after April 15): replace all inline isFastIQ computations with this util.
 * Known locations:
 *   - pages/MockInterview.jsx
 *   - pages/ResumeTailoring.jsx
 *   - pages/LinkedInReview.jsx
 *   - pages/FastIQ.jsx
 *   - pages/FastIQDashboard.jsx
 *   - components/free-tier/CompanyResearchChat.jsx
 *   - components/fastiq/FastIQCommandCenter.jsx
 *   - components/fasttrack/ParentFastIQView.jsx
 */
export const checkIsFastIQ = (user) => !!(
  user?.fastiq_setup_complete ||
  user?.subscription_status === 'active' ||
  user?.membership_tier === 'fastiq' ||
  user?.trial_status === 'active' ||
  user?.fastiq_trial_active === true ||
  user?.is_founding_member === true
);