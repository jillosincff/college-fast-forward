// Module-level + sessionStorage cache for the dashboard job feed.
//
// Serves the last result instantly on remount (no spinner) while a silent
// background re-fetch updates the list. Has a TTL so stale data expires and a
// real re-fetch happens — without it, a backend timeout left students looking
// at the same jobs indefinitely with no indication anything was wrong.
//
// The cache is mirrored to sessionStorage so leaving Home and returning in the
// SAME browser session hydrates immediately — no "scouring…" spinner. Only a
// fresh session, a manual Refresh, or a goals/prefs change (different cacheKey)
// re-scours. See useJobsFeed for the loading-gating that consumes this.

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_PREFIX = 'cff_jobs_cache_';

let _cache = null;
let _cacheKey = null;
let _cacheAt = 0;

function sessionRead(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch { return null; }
}

function sessionWrite(key, data) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(data));
  } catch { /* quota / private mode — silently fall back to memory only */ }
}

function sessionClear(key) {
  try {
    if (key) {
      sessionStorage.removeItem(SESSION_PREFIX + key);
    } else {
      // Clear every cached key for this app (used by Refresh).
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(SESSION_PREFIX)) toRemove.push(k);
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch { /* ignore */ }
}

export function getCachedJobs(key) {
  // 1) Module memory first — fastest, survives in-app navigation without remount.
  if (_cacheKey === key && _cache && (Date.now() - _cacheAt) < CACHE_TTL_MS) {
    return { ..._cache, fetchedAt: _cacheAt };
  }
  // 2) sessionStorage — survives full remount/reload within the same tab session.
  // This is what stops the "scouring…" spinner from reappearing when the student
  // leaves Home and comes back.
  if (_cacheKey !== key) {
    const s = sessionRead(key);
    if (s && s.data && (Date.now() - (s.fetchedAt || 0)) < CACHE_TTL_MS) {
      // Hydrate module memory so subsequent reads stay fast.
      _cacheKey = key;
      _cache = s.data;
      _cacheAt = s.fetchedAt;
      return { ...s.data, fetchedAt: s.fetchedAt };
    }
  }
  // Expired or mismatched — drop it so the next read is an honest miss.
  if (_cacheKey === key) { _cache = null; _cacheKey = null; _cacheAt = 0; }
  return null;
}

export function setCachedJobs(key, data) {
  _cacheKey = key;
  _cache = data;
  _cacheAt = Date.now();
  sessionWrite(key, { data, fetchedAt: _cacheAt });
}

export function clearCachedJobs() {
  _cache = null;
  _cacheKey = null;
  _cacheAt = 0;
  sessionClear();
}