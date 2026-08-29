import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Nightly cache-bust: clears every student's job_leads_cache before they wake
// up, so the first dashboard visit each day forces a fresh live JSearch fetch
// instead of serving yesterday's cached jobs. Runs before the 4:30 AM overnight
// prep so that run also sees fresh jobs when it picks an opportunity to tailor.
//
// This is the active half of the freshness guarantee — the passive half is the
// 48h staleness ceiling in getLiveJobMatchesFn that prevents serving very old
// cache on a JSearch timeout.

const BATCH = 500;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let caller;
    try { caller = await base44.auth.me(); } catch { caller = null; }
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    const students = await svc.entities.User.filter(
      { persona: 'student' }, '-created_date', BATCH
    ).catch(() => []);

    let cleared = 0;
    if (students && students.length > 0) {
      const updates = students.map(u => ({
        id: u.id,
        job_leads_cache: [],
        job_leads_cached_at: null,
        job_leads_cache_key: null,
      }));
      await svc.entities.User.bulkUpdate(updates);
      cleared = updates.length;
    }

    console.log(`[nightlyJobRefresh] Cleared job cache for ${cleared} students`);
    return Response.json({ success: true, cleared, date: new Date().toISOString() });
  } catch (error) {
    const msg = JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
    console.error('[nightlyJobRefresh] Error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}