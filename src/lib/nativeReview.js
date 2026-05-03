/**
 * Triggers the native iOS / Android in-app review prompt when running in the
 * Capacitor shell, otherwise no-ops on web. Designed to be safe to call even
 * before the Capacitor plugin is installed — falls back silently.
 *
 * Throttled per-user: at most one prompt every 60 days, since the OS will
 * silently rate-limit anyway and we want to fire it at the peak excitement
 * moment (right after the Act 2 send).
 */
const LAST_PROMPT_KEY = 'cff_last_review_prompt_at';
const COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

const isCapacitorNative = () => {
  try {
    const cap = typeof window !== 'undefined' && window.Capacitor;
    return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  } catch {
    return false;
  }
};

const cooledDown = () => {
  try {
    const last = parseInt(localStorage.getItem(LAST_PROMPT_KEY) || '0', 10);
    if (!last) return true;
    return Date.now() - last > COOLDOWN_MS;
  } catch {
    return true;
  }
};

const stamp = () => {
  try { localStorage.setItem(LAST_PROMPT_KEY, String(Date.now())); } catch { /* ok */ }
};

export async function requestAppStoreReview() {
  if (!cooledDown()) return false;

  if (!isCapacitorNative()) {
    // Web: no-op (we don't show a fake "rate us" modal in browser).
    if (typeof console !== 'undefined') {
      console.info('[review] skipped — not running in Capacitor');
    }
    return false;
  }

  try {
    // Capacitor plugins register themselves on `window.Capacitor.Plugins`.
    // We pull it from the global so the package can stay an optional native
    // dependency that's never bundled into the web build.
    const InAppReview = window?.Capacitor?.Plugins?.InAppReview;
    if (!InAppReview?.requestReview) {
      console.info('[review] plugin not installed yet');
      return false;
    }
    await InAppReview.requestReview();
    stamp();
    return true;
  } catch (e) {
    console.warn('[review] request failed:', e?.message);
    return false;
  }
}
