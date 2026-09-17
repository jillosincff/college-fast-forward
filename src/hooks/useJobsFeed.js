import { useState, useEffect, useCallback, useRef } from 'react';
import { buildLiveJobsList } from '@/lib/jobsPipeline';
import { getCachedJobs, setCachedJobs, clearCachedJobs } from '@/lib/jobsCache';

// Shared job-feed loader for the Free + Pro home feeds. Two clocks:
//
// 1) Navigation (leave Home → return, same session): serves the fresh session
//    cache instantly — SAME roles, NO spinner, NO silent re-fetch that swaps them.
// 2) Refresh / new day / prefs change: clears the goals-key cache and runs a
//    real live fetch (spinner + scouring copy OK), excluding the jobs already
//    on screen so the set is genuinely different.
// - Cache has a TTL (see jobsCache) so stale data expires → a real re-fetch.
// - Surfaces isStale / mostlyFallback (stale or mostly BuiltIn fallback) and
//   error so the UI can tell the student + offer a refresh.
// - Re-runs when the user's goal cacheKey changes.
export function useJobsFeed({ user, maxJobs = 10 }) {
  const cg = user?.career_goals || {};
  const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
  const industries = cg.target_industries || [];
  const location = cg.location_preference || '';
  const seeking = cg.seeking || '';
  const cacheKey = `${role}|${industries.join(',')}|${location}|${seeking}`;

  const _chipSeen = new Set();
  const chipParts = [role, ...(industries || [])].filter(p => {
    const k = (p || '').toLowerCase().trim();
    if (!k || _chipSeen.has(k)) return false;
    _chipSeen.add(k); return true;
  });
  const chipText = chipParts.join(' ').trim();

  const cached = getCachedJobs(cacheKey);
  const [jobsList, setJobsList] = useState(cached?.jobs || []);
  const [jobsLoading, setJobsLoading] = useState(!cached);
  const [shortMessage, setShortMessage] = useState(cached?.shortMessage || '');
  const [lastUpdated, setLastUpdated] = useState(cached?.fetchedAt || null);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState(false);
  const [mostlyFallback, setMostlyFallback] = useState(false);
  const jobsRef = useRef([]);
  jobsRef.current = jobsList;
  // Only the latest in-flight fetch may apply its results, and a navigation
  // fetch that arrives while another fetch is already running is skipped —
  // together these stop a late-arriving curated/empty result from overwriting
  // fresher live jobs (the "new roles then reverted" race).
  const genRef = useRef(0);
  const inFlightRef = useRef(false);

  const runFetch = useCallback((excludeKeys) => {
    if (!user) return Promise.resolve();
    // Navigation with a fresh, NON-EMPTY live cache: serve it, no fetch, no
    // swap. (Curated fallbacks are never cached, so this only short-circuits
    // genuine live sets.) An empty cache is treated as a miss so a stuck-blank
    // feed always re-scours for the backup instead of staying empty.
    const navCached = !excludeKeys && getCachedJobs(cacheKey);
    if (navCached && (navCached.jobs || []).length > 0) { setJobsLoading(false); return Promise.resolve(); }
    // A navigation fetch that arrives while another fetch is already running is
    // skipped — the in-flight fetch will populate the cache and the next render
    // serves it. A manual Refresh (excludeKeys) always proceeds and supersedes.
    if (!excludeKeys && inFlightRef.current) return Promise.resolve();
    const gen = ++genRef.current;
    inFlightRef.current = true;
    return (async () => {
      try {
        // We're past the short-circuit, so a real fetch is running. Show the
        // spinner whenever there's nothing to render yet — including a STUCK
        // EMPTY cache from a prior failed load. (The old `!getCachedJobs`
        // guard skipped the spinner when an empty cache existed, so the feed
        // sat blank with no spinner for ~15s while JSearch timed out and the
        // curated backup loaded — read by users as "no jobs".)
        const haveJobs = (jobsRef.current || []).length > 0;
        if (!haveJobs) setJobsLoading(true);
        setError(false);

        // JSearch (the upstream job provider) has intermittent ~6s timeouts. When
        // that happens the backend serves its last cached results with stale=true
        // so the feed stays responsive. Those timeouts are transient — a single
        // retry usually succeeds — so retry once before settling on "cached".
        let result = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            result = await buildLiveJobsList({
              role, industries, location, seeking: cg.seeking, chipText, maxJobs, excludeKeys,
            });
            if (!result.stale && !result.fromCache) break; // genuinely fresh — done
          } catch (e) {
            result = null;
          }
          if (attempt < 2) await new Promise(r => setTimeout(r, 1200));
        }

        // Exclusion (Refresh) can empty the pool when the live supply is thin or
        // JSearch is down — the only available jobs were the ones we just excluded.
        // Fall back to a non-excluded fetch so the feed isn't blank; diversity only
        // wins when there's genuine supply.
        if (result && excludeKeys && result.jobs.length === 0) {
          try {
            result = await buildLiveJobsList({
              role, industries, location, seeking: cg.seeking, chipText, maxJobs,
            });
          } catch (e) { /* keep prior (empty) result */ }
        }

        // A newer fetch (e.g. a Refresh that superseded this one) started after
        // this one — drop these results so they can't overwrite the fresher set.
        if (gen !== genRef.current) { setJobsLoading(false); return; }

        if (result) {
          setJobsList(result.jobs);
          setShortMessage(result.shortMessage);
          setIsStale(!!result.stale || !!result.fromCache);
          setMostlyFallback(!!result.mostlyFallback);
          setLastUpdated(Date.now());
          // Only a genuine, NON-EMPTY live load gets a sticky navigation cache.
          // Curated / BuiltIn-majority fallbacks are NOT cached (so leaving Home
          // and returning re-scours for live jobs). An EMPTY result must NEVER be
          // cached — otherwise the empty set becomes the sticky cache, the next
          // navigation short-circuits on it, and the dashboard stays blank for
          // the whole TTL even though the backup (curated / BuiltIn) would have
          // populated on a fresh fetch.
          if (!result.mostlyFallback && result.jobs.length > 0) {
            setCachedJobs(cacheKey, { jobs: result.jobs, shortMessage: result.shortMessage });
          }
        } else {
          // Keep whatever jobs we already have so the feed isn't blank — but flag
          // the failure so the UI can show "couldn't refresh" + a retry.
          setError(true);
        }
        setJobsLoading(false);
      } finally {
        if (gen === genRef.current) inFlightRef.current = false;
      }
    })();
  }, [user, cacheKey]);

  useEffect(() => { runFetch(); }, [runFetch]);

  const refresh = useCallback(() => {
    clearCachedJobs(cacheKey);
    // Exclude the jobs already on screen so a manual refresh returns a
    // genuinely different set instead of reshuffling the same roles.
    const excludeKeys = jobsRef.current
      .map(j => ((j.name || '') + '|' + (j.job_title || '')).toLowerCase())
      .filter(Boolean);
    return runFetch(excludeKeys);
  }, [runFetch, cacheKey]);

  return {
    jobsList, jobsLoading, shortMessage, lastUpdated, isStale, error, mostlyFallback, refresh,
    chipLabel: industries[0] || role || '', chipText, role, industries, location,
  };
}