/**
 * A simple, extensible analytics event tracker.
 * In a real-world scenario, this function would be expanded 
 * to send data to a service like Google Analytics, Mixpanel, or PostHog.
 */

// Sends events to Google Analytics 4 (gtag.js loaded in index.html).
function sendToAnalyticsService(eventName, payload) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  } else {
    // gtag not loaded yet (e.g. SSR / blocked) — fall back to console.
    console.log('[Analytics]', eventName, payload);
  }
}

/**
 * trackEvent
 * @param {string} eventName  — a short, semantic name for the event
 * @param {object} [properties] — any contextual key/value pairs
 */
export function trackEvent(eventName, properties = {}) {
  try {
    sendToAnalyticsService(eventName, properties);
  } catch (err) {
    // swallow errors so tracking never breaks your app
    console.error('Analytics error', err);
  }
}