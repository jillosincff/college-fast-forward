// Module-level cache for the dashboard job feed.
//
// Serves the last result instantly on remount (no spinner) while a silent
// background re-fetch updates the list. Has a TTL so stale data expires and a
// real re-fetch happens — without it, a backend timeout left students looking
// at the same jobs indefinitely with no indication anything was wrong.

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

let _cache = null;
let _cacheKey = null;
let _cacheAt = 0;

export function getCachedJobs(key) {
  if (_cacheKey === key && _cache && (Date.now() - _cacheAt) < CACHE_TTL_MS) {
    return { ..._cache, fetchedAt: _cacheAt };
  }
  // Expired or mismatched — drop it so the next read is an honest miss.
  if (_cacheKey === key) { _cache = null; _cacheKey = null; _cacheAt = 0; }
  return null;
}

export function setCachedJobs(key, data) {
  _cacheKey = key;
  _cache = data;
  _cacheAt = Date.now();
}

export function clearCachedJobs() {
  _cache = null;
  _cacheKey = null;
  _cacheAt = 0;
}