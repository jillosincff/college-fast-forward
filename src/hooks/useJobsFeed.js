import { useState, useEffect, useCallback } from 'react';
import { buildLiveJobsList } from '@/lib/jobsPipeline';
import { getCachedJobs, setCachedJobs, clearCachedJobs } from '@/lib/jobsCache';

// Shared job-feed loader for the Free + Pro home feeds.
//
// - Serves cached results instantly on remount (no spinner), then re-fetches.
// - Cache has a TTL (see jobsCache) so stale data expires and a real re-fetch
//   happens instead of showing the same jobs forever.
// - Surfaces isStale (backend served cached/timed-out results) and error
//   (fetch failed entirely) so the UI can tell the student + offer a refresh.
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

  const runFetch = useCallback(() => {
    if (!user) return Promise.resolve();
    return (async () => {
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
            role, industries, location, seeking: cg.seeking, chipText, maxJobs,
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
    clearCachedJobs();
    return runFetch();
  }, [runFetch]);

  return {
    jobsList, jobsLoading, shortMessage, lastUpdated, isStale, error, refresh,
    chipLabel: industries[0] || role || '', chipText, role, industries, location,
  };
}