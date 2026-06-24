// Public health-check endpoint for an external uptime monitor.
// Auth is via a shared MONITOR_SECRET_KEY (header x-monitor-secret or body.secret),
// NOT user auth — so the monitor can ping without logging in.
// Pings the live OpenWeb Ninja JSearch API directly (same source getLiveJobMatchesFn uses)
// to confirm the job pipeline is alive and returning real postings.
const JSEARCH_BASE = 'https://api.openwebninja.com/jsearch';

Deno.serve(async (req) => {
  try {
    // Bare liveness ping (HEAD) — answer 200 without touching the secret or the API.
    if (req.method === 'HEAD') {
      return new Response(null, { status: 200 });
    }

    const expected = Deno.env.get('MONITOR_SECRET_KEY');
    if (!expected) {
      return Response.json({ status: 'fail', error: 'MONITOR_SECRET_KEY not set' }, { status: 500 });
    }

    // Accept the secret from header, query param (?secret=), or JSON body —
    // so the monitor passes whether it uses GET or POST.
    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const secret = req.headers.get('x-monitor-secret') || url.searchParams.get('secret') || body?.secret;
    if (secret !== expected) {
      return Response.json({ status: 'fail', error: 'Unauthorized' }, { status: 401 });
    }

    const token = Deno.env.get('OPENWEB_NINJA_API_KEY');
    if (!token) {
      return Response.json({ status: 'fail', error: 'OPENWEB_NINJA_API_KEY not set' }, { status: 500 });
    }

    const params = new URLSearchParams({
      query: 'software engineer intern',
      country: 'us',
      date_posted: 'week',
      num_pages: '1',
    });

    const start = Date.now();
    const apiRes = await fetch(`${JSEARCH_BASE}/search?${params.toString()}`, {
      method: 'GET',
      headers: { 'x-api-key': token },
    });
    const payload = await apiRes.json().catch(() => ({}));
    const elapsed = Date.now() - start;

    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    const companies = jobs
      .filter((j) => j.employer_name && j.job_title)
      .slice(0, 5)
      .map((j) => ({ name: j.employer_name, job_title: j.job_title }));

    const passed =
      apiRes.ok &&
      companies.length >= 1 &&
      !!companies[0]?.name &&
      !!companies[0]?.job_title &&
      elapsed < 20000;

    return Response.json({
      status: passed ? 'pass' : 'fail',
      elapsed_ms: elapsed,
      companies_count: companies.length,
      companies,
    });
  } catch (err) {
    return Response.json({ status: 'fail', error: err.message }, { status: 500 });
  }
});