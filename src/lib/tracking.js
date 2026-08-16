import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';

// ── Canonical CLIFF funnel tracking events (source of truth) ───────────────
// Section 7 of the Free→Paid conversion rebuild. Each event maps 1:1 to a
// trigger point in the funnel. Fire these via the named helpers, not raw track().
export const EVENTS = {
  UPGRADE_MODAL_VIEWED: 'upgrade_modal_viewed',       // Paywall / modal shown
  UPGRADE_CLICKED: 'upgrade_clicked',                 // User clicks Start CLIFF Pro
  PRO_ACTIVATED: 'pro_activated',                      // Student account upgraded
  PARENT_SEND_INITIATED: 'parent_send_initiated',      // User starts parent flow
  PARENT_SEND_COMPLETED: 'parent_send_completed',      // Email successfully sent
  PARENT_PAYMENT_COMPLETED: 'parent_payment_completed',// Parent successfully pays
  OUTREACH_COPIED: 'outreach_copied',                  // User copies the draft
  ONBOARDING_COMPLETED: 'onboarding_completed',         // Minimal onboarding finished
  MAGIC_MOMENT_STARTED: 'magic_moment_started',        // First cycle begins generating
  MAGIC_MOMENT_COMPLETED: 'magic_moment_completed',    // Full free cycle shown to user
};

// Fire one event across every sink: platform analytics (Base44), GA4, and the
// durable AnalyticsEvent table (admin-queryable, survives reloads). Never
// blocks UI — every sink is best-effort and swallows its own errors.
export async function track(eventName, properties = {}) {
  const props = properties || {};
  try { base44.analytics.track({ eventName, properties: props }); } catch (e) {}
  try { trackEvent(eventName, props); } catch (e) {}
  try { await base44.functions.invoke('logAnalyticsEvent', { event_name: eventName, properties: props }); } catch (e) {}
}

// ── Named helpers — call these at the trigger points ────────────────────────
export const trackUpgradeModalViewed   = (p = {}) => track(EVENTS.UPGRADE_MODAL_VIEWED, p);
export const trackUpgradeClicked        = (p = {}) => track(EVENTS.UPGRADE_CLICKED, p);
export const trackProActivated           = (p = {}) => track(EVENTS.PRO_ACTIVATED, p);
export const trackParentSendInitiated    = (p = {}) => track(EVENTS.PARENT_SEND_INITIATED, p);
export const trackParentSendCompleted    = (p = {}) => track(EVENTS.PARENT_SEND_COMPLETED, p);
export const trackParentPaymentCompleted = (p = {}) => track(EVENTS.PARENT_PAYMENT_COMPLETED, p);
export const trackOutreachCopied          = (p = {}) => track(EVENTS.OUTREACH_COPIED, p);
export const trackOnboardingCompleted     = (p = {}) => track(EVENTS.ONBOARDING_COMPLETED, p);
export const trackMagicMomentStarted      = (p = {}) => track(EVENTS.MAGIC_MOMENT_STARTED, p);
export const trackMagicMomentCompleted    = (p = {}) => track(EVENTS.MAGIC_MOMENT_COMPLETED, p);