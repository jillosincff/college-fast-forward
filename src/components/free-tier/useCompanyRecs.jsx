import { useState, useEffect, useCallback } from 'react';
import { getFreeTierCompanyRecs } from '@/functions/getFreeTierCompanyRecs';

const EXTERNAL_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const INTERNAL_TTL_MS = 60 * 60 * 1000;       // 1 hour

function getCacheKey(user) {
  const goals = user?.career_goals || {};
  return JSON.stringify({
    role: goals.role,
    industries: goals.industries,
    locations: goals.locations,
    sizePref: goals.company_size_preference,
    targets: goals.target_companies,
  });
}

// In-memory cache (survives re-renders, not page refresh)
const memCache = { data: null, externalAt: null, internalAt: null, key: null };

export function useCompanyRecs(user) {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRecs = useCallback(async () => {
    if (!user?.email) return;

    // Guard: verify function exists before calling
    if (typeof getFreeTierCompanyRecs !== 'function') {
      console.error('getFreeTierCompanyRecs not found — showing fallback');
      setError(true);
      setLoading(false);
      return;
    }

    const cacheKey = getCacheKey(user);
    const now = Date.now();
    const externalFresh = memCache.key === cacheKey && memCache.externalAt && (now - memCache.externalAt < EXTERNAL_TTL_MS);
    const internalFresh = memCache.key === cacheKey && memCache.internalAt && (now - memCache.internalAt < INTERNAL_TTL_MS);

    if (externalFresh && internalFresh && memCache.data) {
      setCompanies(memCache.data);
      return;
    }

    setLoading(true);
    setError(false);
    setCompanies(null);

    const QUERY_TIMEOUT = 15000;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
    );

    try {
      const result = await Promise.race([
        getFreeTierCompanyRecs({ career_goals: user?.career_goals }),
        timeoutPromise,
      ]);

      const data = result?.data || result;
      const list = data?.companies || [];

      if (list.length > 0) {
        memCache.data = list;
        memCache.key = cacheKey;
        memCache.externalAt = now;
        memCache.internalAt = now;
        setCompanies(list);
      } else {
        console.warn('Company recommendations returned empty list — showing fallback');
        setError(true);
        setCompanies(null);
      }
    } catch (err) {
      console.error('Company recommendations failed:', err.message);
      // Try one more time with a shorter window before giving up
      try {
        const retry = await Promise.race([
          getFreeTierCompanyRecs({ career_goals: user?.career_goals }),
          new Promise((_, r) => setTimeout(() => r(new Error('retry timeout')), 10000)),
        ]);
        const retryData = retry?.data || retry;
        const retryList = retryData?.companies || [];
        if (retryList.length > 0) {
          memCache.data = retryList;
          memCache.key = cacheKey;
          memCache.externalAt = now;
          memCache.internalAt = now;
          setCompanies(retryList);
        } else {
          setError(true);
          setCompanies(null);
        }
      } catch (retryErr) {
        console.error('Retry also failed:', retryErr.message);
        setError(true);
        setCompanies(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email, getCacheKey(user)]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { companies, loading, error, refetch: fetchRecs };
}