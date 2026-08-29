// Simple module-level cache for the dashboard job feed.
//
// When a student navigates away from the dashboard and comes back, the feed
// component unmounts and remounts — its local useState resets and the
// "Finding your next move…" spinner fires again even though the backend
// already returned identical data (24h server cache). This cache serves the
// last result instantly on remount (no spinner) and lets a silent background
// re-fetch update the list if anything changed.

let _cache = null;
let _cacheKey = null;

export function getCachedJobs(key) {
  if (_cacheKey === key && _cache) return _cache;
  return null;
}

export function setCachedJobs(key, data) {
  _cacheKey = key;
  _cache = data;
}