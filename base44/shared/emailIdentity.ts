/**
 * Shared recipient-identity helpers for outbound-email functions.
 *
 * Kept separate from emailGuards.ts (which owns the auth/trust boundary) —
 * these are presentation/link helpers used when building email bodies.
 */

/** First name for greetings, with a safe fallback. */
export function firstNameOf(fullName, fallback = 'there') {
  return String(fullName || '').trim().split(' ')[0] || fallback;
}

/**
 * Opaque unsubscribe token consumed by the Unsubscribe page / handleUnsubscribe.
 * Format must stay stable — existing links in already-sent mail depend on it.
 */
export function makeUnsubToken(userId, email) {
  return btoa(`${userId}:${email}`).replace(/=/g, '');
}

/** Full unsubscribe URL for a given app base. */
export function unsubUrl(appBase, userId, email) {
  return `${appBase}/#/Unsubscribe?token=${makeUnsubToken(userId, email)}`;
}