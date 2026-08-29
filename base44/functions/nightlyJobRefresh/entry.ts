import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Nightly cache-bust: clears every student's job_leads_cache before they wake
// up, so the first dashboard visit each day forces a fresh live JSearch fetch
// instead of serving yesterday's cached jobs. Runs before the 4:30 AM overnight
// prep so that run also sees fresh jobs when it picks an opportunity to tailor.
//
// The User entity blocks bulkUpdate/updateMany (platform restriction), so we
// clear caches via parallel individual update calls in small concurrency chunks.

const BATCH = 500;
const CONCURRENCY = 20;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let caller;
    try { caller = await base44.auth.me(); } catch { caller = null; }
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // List users and filter to students client-side — User.filter by persona
    // can be unreliable, and list() always works.
    const users = await svc.entities.User.list('-created_date', BATCH);
    const students = (users || []).filter(u => u.persona === 'student');

    if (students.length === 0) {
      console.log('[nightlyJobRefresh] No students found');
      return Response.json({ success: true, cleared: 0, date: new Date().toISOString() });
    }

    let cleared = 0;
    let failed = 0;

    // Process in concurrency chunks — User entity blocks bulk operations (405),
    // so we use parallel individual updates instead.
    for (let i = 0; i < students.length; i += CONCURRENCY) {
      const chunk = students.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map(u => svc.entities.User.update(u.id, {
          job_leads_cache: [],
          job_leads_cached_at: null,
          job_leads_cache_key: null,
        }))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') cleared++;
        else {
          failed++;
          console.warn(`[nightlyJobRefresh] Update failed: ${r.reason?.message || r.reason}`);
        }
      }
    }

    console.log(`[nightlyJobRefresh] Cleared job cache for ${cleared} students (${failed} failed)`);
    return Response.json({ success: true, cleared, failed, total: students.length, date: new Date().toISOString() });
  } catch (error) {
    const msg = error?.message ? String(error.message) : String(error);
    console.error('[nightlyJobRefresh] Error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}