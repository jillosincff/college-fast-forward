/**
 * Latency-as-a-Feature utilities
 * Shared A/B variant assignment + churn tracking for the resume tailoring queue.
 */

// Three button copy variants for A/B testing
export const FAST_TRACK_VARIANTS = [
  { id: 'A', label: '⚡ Fast-Track This Resume →', sub: 'Get instant AI tailoring with Premium' },
  { id: 'B', label: '⚡ Get Instant Tailoring Now', sub: 'Skip the queue with Premium' },
  { id: 'C', label: '⚡ Upgrade for Instant Results', sub: 'Premium gets you results in under 60 seconds' },
];

/**
 * Deterministically pick a variant based on user email hash.
 * Same user always sees the same variant (consistent experience).
 */
export function getFastTrackVariant(userEmail) {
  if (!userEmail) return FAST_TRACK_VARIANTS[0];
  let hash = 0;
  for (let i = 0; i < userEmail.length; i++) {
    hash = ((hash << 5) - hash) + userEmail.charCodeAt(i);
    hash |= 0;
  }
  return FAST_TRACK_VARIANTS[Math.abs(hash) % FAST_TRACK_VARIANTS.length];
}

/**
 * Churn tracking — fire analytics events at key drop-off points.
 */
export function trackQueuedView(userEmail, variant) {
  try {
    base44Analytics('tailoring_queued_viewed', userEmail, { variant });
  } catch {}
}

export function trackQueuedUpgradeClick(userEmail, variant) {
  try {
    base44Analytics('tailoring_queued_upgrade_clicked', userEmail, { variant });
  } catch {}
}

export function trackQueuedBackOut(userEmail, variant) {
  try {
    base44Analytics('tailoring_queued_backed_out', userEmail, { variant });
  } catch {}
}

// Lazy import to avoid circular deps
function base44Analytics(eventName, userEmail, properties) {
  import('@/api/base44Client').then(({ base44 }) => {
    base44.analytics.track({ eventName, properties: { ...properties, user_email: userEmail } });
  }).catch(() => {});
}