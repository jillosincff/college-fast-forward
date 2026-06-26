// Public health-check endpoint for an external uptime monitor.
// Auth is via a shared MONITOR_SECRET_KEY (header x-monitor-secret or body.secret),
// NOT user auth — so the monitor can ping without logging in.
// Pings the live OpenWeb Ninja JSearch API directly (same source getLiveJobMatchesFn uses)
// to confirm the job pipeline is alive and returning real postings.
const JSEARCH_BASE = 'https://api.openwebninja.com/jsearch';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-monitor-secret, Authorization',
};

Deno.serve(async (req) => {
  try {
    // CORS preflight — answer OPTIONS before anything else so cross-origin
    // monitors don't get a 405 from the gateway.
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Bare liveness ping (HEAD) — answer 200 without touching the secret or the API.
    if (req.method === 'HEAD') {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    const expected = Deno.env.get('MONITOR_SECRET_KEY');
    if (!expected) {
      return Response.json({ status: 'fail', error: 'MONITOR_SECRET_KEY not set' }, { status: 500, headers: CORS_HEADERS });
    }

    // Accept the secret from header, query param (?secret=), or JSON body —
    // so the monitor passes whether it uses GET or POST.
    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const secret = req.headers.get('x-monitor-secret') || url.searchParams.get('secret') || body?.secret;
    if (secret !== expected) {
      return Response.json({ status: 'fail', error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const token = Deno.env.get('OPENWEB_NINJA_API_KEY');
    if (!token) {
      return Response.json({ status: 'fail', error: 'OPENWEB_NINJA_API_KEY not set' }, { status: 500, headers: CORS_HEADERS });
    }

    const params = new URLSearchParams({
      query: 'software engineer intern',
      country: 'us',
      date_posted: 'week',
      num_pages: '1',
    });

    // Probe the upstream job provider with a hard timeout so a hanging API
    // can't stall the health check. A degraded/unreachable third-party provider
    // is reported as `degraded` (HTTP 200) — NOT a 500 — so it doesn't page us
    // as if OUR service were down. Only an unexpected internal failure 500s.
    const start = Date.now();
    let apiRes, payload, upstreamError = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        apiRes = await fetch(`${JSEARCH_BASE}/search?${params.toString()}`, {
          method: 'GET',
          headers: { 'x-api-key': token },
          signal: controller.signal,
        });
        payload = await apiRes.json().catch(() => ({}));
      } finally {
        clearTimeout(timeout);
      }
    } catch (e) {
      upstreamError = e.name === 'AbortError' ? 'Upstream job API timed out (8s)' : `Upstream job API unreachable: ${e.message}`;
    }
    const elapsed = Date.now() - start;

    // Upstream never answered (network error / timeout) — provider outage, not ours.
    if (!apiRes) {
      return Response.json({
        status: 'degraded',
        upstream: 'openweb_ninja_jsearch',
        error: upstreamError,
        elapsed_ms: elapsed,
      }, { headers: CORS_HEADERS });
    }

    // Upstream answered but with an error status (e.g. 429 rate limit, 5xx) — provider issue.
    if (!apiRes.ok) {
      return Response.json({
        status: 'degraded',
        upstream: 'openweb_ninja_jsearch',
        upstream_status: apiRes.status,
        error: `Upstream job API returned ${apiRes.status}`,
        elapsed_ms: elapsed,
      }, { headers: CORS_HEADERS });
    }

    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    const companies = jobs
      .filter((j) => j.employer_name && j.job_title)
      .slice(0, 5)
      .map((j) => ({ name: j.employer_name, job_title: j.job_title }));

    const passed =
      companies.length >= 1 &&
      !!companies[0]?.name &&
      !!companies[0]?.job_title &&
      elapsed < 8000;

    return Response.json({
      status: passed ? 'pass' : 'degraded',
      elapsed_ms: elapsed,
      companies_count: companies.length,
      companies,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return Response.json({ status: 'fail', error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
});