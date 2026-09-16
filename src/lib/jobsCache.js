// Sticky navigation cache for the dashboard job feed — ONLY for genuine live
// loads. Curated / BuiltIn-majority fallbacks are never written here, so
// leaving Home and returning re-scours for live jobs instead of sticky-serving
// the same prestige pack every time.
//
// Serves the last LIVE result instantly on remount (no spinner). Has a TTL so
// stale data expires and a real re-fetch happens. Mirrored to sessionStorage so
// leaving Home and returning in the SAME browser session hydrates immediately —
// but only if the last load was live. A fresh session, a manual Refresh, a
// goals/prefs change (different cacheKey), or a prior fallback load re-scours.
// See useJobsFeed for the loading-gating that consumes this.

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_PREFIX = 'cff_jobs_cache_';

// Retail floor / seasonal holiday roles never belong in the feed. Applied at
// cache-read so jobs cached before the pipeline filter was added are still
// stripped — without this, a stale session cache re-serves retail/seasonal
// roles until it expires or the student manually refreshes.
const RETAIL_OR_SEASONAL_RE = /\b(seasonal)\b|\b(retails?)\s+(sales|associate|associates|merchandiser|clerk|cashier|stocker|team\s+member)\b/i;
function stripRetailSeasonal(data) {
  if (!data || !Array.isArray(data.jobs)) return data;
  const cleaned = data.jobs.filter(j => !RETAIL_OR_SEASONAL_RE.test(j.job_title || ''));
  return cleaned.length === data.jobs.length ? data : { ...data, jobs: cleaned };
}

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
    return stripRetailSeasonal({ ..._cache, fetchedAt: _cacheAt });
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
      return stripRetailSeasonal({ ...s.data, fetchedAt: s.fetchedAt });
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

export function clearCachedJobs(key) {
  if (key) {
    // Clear just this goals key (manual Refresh) — leave other keys intact.
    if (_cacheKey === key) { _cache = null; _cacheKey = null; _cacheAt = 0; }
    sessionClear(key);
  } else {
    _cache = null;
    _cacheKey = null;
    _cacheAt = 0;
    sessionClear();
  }
}