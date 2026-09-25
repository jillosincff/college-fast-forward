// Public health-check endpoint for an external uptime monitor.
// Auth is via a shared MONITOR_SECRET_KEY (header x-monitor-secret or body.secret),
// NOT user auth — so the monitor can ping without logging in.
// Pings the live OpenWeb Ninja JSearch API directly (same source getLiveJobMatchesFn uses)
// to confirm the job pipeline is alive and returning real postings.
//
// Every check is persisted to MonitorLog, the rolling MonitorState is updated,
// and admins are emailed when the status transitions (pass <-> degraded/fail) —
// so a failed check is never silently lost, even if the external monitor itself
// hiccups on the way in.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const JSEARCH_BASE = 'https://api.openwebninja.com/jsearch';
const MONITOR_NAME = 'jobs_api';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-monitor-secret, Authorization',
};

Deno.serve(async (req) => {
  try {
    // CORS preflight — answer before anything else so cross-origin monitors
    // don't get a 405 from the gateway.
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

    // Build the verdict once; the same object goes to the monitor and to the log.
    let result;
    if (!apiRes) {
      result = {
        status: 'degraded',
        upstream: 'openweb_ninja_jsearch',
        error: upstreamError,
        elapsed_ms: elapsed,
        companies_count: 0,
        companies: [],
      };
    } else if (!apiRes.ok) {
      result = {
        status: 'degraded',
        upstream: 'openweb_ninja_jsearch',
        upstream_status: apiRes.status,
        error: `Upstream job API returned ${apiRes.status}`,
        elapsed_ms: elapsed,
        companies_count: 0,
        companies: [],
      };
    } else {
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
      result = {
        status: passed ? 'pass' : 'degraded',
        elapsed_ms: elapsed,
        companies_count: companies.length,
        companies,
      };
    }

    // Persist the check + update rolling state + alert on transitions.
    // Wrapped so a logging failure NEVER changes the monitor's response —
    // the verdict above is what the monitor sees.
    try {
      const base44 = createClientFromRequest(req);
      await persistAndAlert(base44, result);
    } catch (e) {
      console.error('monitorHealthCheck persist/alert error:', e?.message || e);
    }

    return Response.json(result, { headers: CORS_HEADERS });
  } catch (err) {
    return Response.json({ status: 'fail', error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
});

// Append a MonitorLog row, upsert the singleton MonitorState, and email admins
// when the status transitions (pass <-> degraded). A pass result resets the
// consecutive-failure counter; any non-pass increments it.
async function persistAndAlert(base44, result) {
  const db = base44.asServiceRole.entities;
  const now = new Date().toISOString();

  await db.MonitorLog.create({
    monitor_name: MONITOR_NAME,
    checked_at: now,
    status: result.status,
    source: 'external_monitor',
    upstream: result.upstream || 'openweb_ninja_jsearch',
    upstream_status: result.upstream_status ?? null,
    error: result.error || '',
    elapsed_ms: result.elapsed_ms ?? 0,
    companies_count: result.companies_count ?? 0,
    sample_companies: (result.companies || []).map((c) => c.name).filter(Boolean),
  });

  const existing = await db.MonitorState.filter({ monitor_name: MONITOR_NAME }, '-last_check_at', 1);
  const prev = existing[0];
  const prevStatus = prev?.status || 'pass';
  const statusChanged = prevStatus !== result.status;
  const consecutive = result.status === 'pass' ? 0 : (prev?.consecutive_failures || 0) + 1;

  if (prev) {
    await db.MonitorState.update(prev.id, {
      status: result.status,
      last_check_at: now,
      previous_status: statusChanged ? prevStatus : prev.previous_status,
      last_status_change_at: statusChanged ? now : prev.last_status_change_at,
      consecutive_failures: consecutive,
      last_error: result.status === 'pass' ? '' : (result.error || prev.last_error || ''),
    });
  } else {
    await db.MonitorState.create({
      monitor_name: MONITOR_NAME,
      status: result.status,
      last_check_at: now,
      last_status_change_at: now,
      previous_status: 'pass',
      consecutive_failures: consecutive,
      last_error: result.status === 'pass' ? '' : (result.error || ''),
    });
  }

  if (statusChanged) {
    await sendStatusAlert(base44, result, prevStatus, now);
    const st = await db.MonitorState.filter({ monitor_name: MONITOR_NAME }, '-last_check_at', 1);
    if (st[0]) await db.MonitorState.update(st[0].id, { last_alert_sent_at: now });
  }
}

async function sendStatusAlert(base44, result, prevStatus, now) {
  const db = base44.asServiceRole.entities;
  const admins = await db.User.filter({ role: 'admin' }, '-created_date', 5);
  if (!admins.length) return;
  const appBase = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
  const subject = result.status === 'pass'
    ? `[CFF] Jobs API recovered (${prevStatus} -> pass)`
    : `[CFF] Jobs API health changed (${prevStatus} -> ${result.status})`;
  const lines = [
    `CFF Jobs API health check status changed at ${now}.`,
    ``,
    `Previous status: ${prevStatus}`,
    `Current status:  ${result.status}`,
    ``,
  ];
  if (result.error) lines.push(`Error: ${result.error}`);
  if (result.upstream_status) lines.push(`Upstream HTTP status: ${result.upstream_status}`);
  lines.push(`Elapsed: ${result.elapsed_ms} ms`);
  lines.push(`Live postings returned: ${result.companies_count}`);
  lines.push(``);
  lines.push(`Monitor endpoint: ${appBase}/functions/monitorHealthCheck`);
  const text = lines.join('\n');
  for (const a of admins) {
    if (!a.email) continue;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject, body: text });
    } catch (e) {
      console.error('monitorHealthCheck alert send failed for', a.email, e?.message || e);
    }
  }
}