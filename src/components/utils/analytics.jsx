
/**
 * A simple, extensible analytics event tracker.
 * In a real-world scenario, this function would be expanded 
 * to send data to a service like Google Analytics, Mixpanel, or PostHog.
 */

// Stub for any analytics library (GA, Mixpanel, etc.)
function sendToAnalyticsService(eventName, payload) {
  // e.g. for Google Analytics via gtag:
  // window.gtag('event', eventName, payload);

  // e.g. for Mixpanel:
  // mixpanel.track(eventName, payload);

  // For now, fallback to console so you can verify it fires:
  console.log('[Analytics]', eventName, payload);
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
