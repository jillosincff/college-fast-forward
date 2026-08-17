// Shared helpers for the Magic Moment test matrix.

// Base44 backend functions are invoked through the app's SDK, but they are also
// reachable over HTTP at {APP_BASE_URL}/api/functions/{name} when authenticated
// (the storageState cookie/token is sent automatically by Playwright's request
// context). This lets API tests assert response shape without a browser page.
export function base44Endpoint() {
  const base = (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/api/functions`;
}

// The app initializes the Base44 SDK on the window once a page loads. Specs can
// call backend functions from inside the browser via this helper, which mirrors
// how the app itself invokes them (so the response shape matches production).
export async function invokeInPage(page, functionName, payload) {
  return page.evaluate(
    ({ fn, payload }) => window.base44.functions.invoke(fn, payload).then((r) => r?.data ?? r),
    { fn: functionName, payload },
  );
}