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
  SOFT_WALL_VIEWED: 'soft_wall_viewed',                 // Soft wall shown after free cycle exhausted
  SOFT_WALL_UPGRADE_CLICKED: 'soft_wall_upgrade_clicked', // User clicked upgrade from a soft wall
};

// localStorage marker for the moment the free Magic Moment finished — lets every
// downstream conversion event carry time-since-magic-moment for funnel timing analysis.
const MM_TS_KEY = 'cff_magic_moment_completed_at';
export function markMagicMomentCompleted() {
  try { localStorage.setItem(MM_TS_KEY, Date.now().toString()); } catch (e) {}
}
export function getMagicMomentCompletedAt() {
  try { const v = localStorage.getItem(MM_TS_KEY); return v ? Number(v) : null; } catch (e) { return null; }
}
export function timeSinceMagicMomentMs() {
  const t = getMagicMomentCompletedAt();
  return t ? Date.now() - t : null;
}

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
// Conversion-step helpers auto-attach time_since_magic_moment_ms so the funnel
// timing (Magic Moment complete → upgrade view → click) is measurable across reloads.
const withMm = (props) => ({ ...props, time_since_magic_moment_ms: timeSinceMagicMomentMs() });

export const trackUpgradeModalViewed   = (p = {}) => track(EVENTS.UPGRADE_MODAL_VIEWED, withMm(p));
export const trackUpgradeClicked        = (p = {}) => track(EVENTS.UPGRADE_CLICKED, withMm(p));
export const trackProActivated           = (p = {}) => track(EVENTS.PRO_ACTIVATED, p);
export const trackParentSendInitiated    = (p = {}) => track(EVENTS.PARENT_SEND_INITIATED, withMm(p));
export const trackParentSendCompleted    = (p = {}) => track(EVENTS.PARENT_SEND_COMPLETED, p);
export const trackParentPaymentCompleted = (p = {}) => track(EVENTS.PARENT_PAYMENT_COMPLETED, p);
export const trackOutreachCopied          = (p = {}) => track(EVENTS.OUTREACH_COPIED, p);
export const trackOnboardingCompleted     = (p = {}) => track(EVENTS.ONBOARDING_COMPLETED, p);
export const trackMagicMomentStarted      = (p = {}) => track(EVENTS.MAGIC_MOMENT_STARTED, p);
export const trackMagicMomentCompleted    = (p = {}) => track(EVENTS.MAGIC_MOMENT_COMPLETED, p);
export const trackSoftWallViewed          = (p = {}) => track(EVENTS.SOFT_WALL_VIEWED, withMm(p));
export const trackSoftWallUpgradeClicked  = (p = {}) => track(EVENTS.SOFT_WALL_UPGRADE_CLICKED, withMm(p));