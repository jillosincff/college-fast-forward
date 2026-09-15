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

  const runFetch = useCallback((excludeKeys) => {
    if (!user) return Promise.resolve();
    return (async () => {
      // Navigation remount with a fresh session cache: serve the SAME roles —
      // no silent re-fetch that could swap them. Only a manual Refresh
      // (excludeKeys), an expired cache, or a goals change triggers a real fetch.
      if (!excludeKeys && getCachedJobs(cacheKey)) { setJobsLoading(false); return; }
      if (!getCachedJobs(cacheKey)) setJobsLoading(true);
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

      if (result) {
        setJobsList(result.jobs);
        setShortMessage(result.shortMessage);
        setIsStale(!!result.stale || !!result.fromCache);
        setMostlyFallback(!!result.mostlyFallback);
        setLastUpdated(Date.now());
        setCachedJobs(cacheKey, { jobs: result.jobs, shortMessage: result.shortMessage });
      } else {
        // Keep whatever jobs we already have so the feed isn't blank — but flag
        // the failure so the UI can show "couldn't refresh" + a retry.
        setError(true);
      }
      setJobsLoading(false);
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