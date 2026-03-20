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

    const makeCall = () => Promise.race([
      getFreeTierCompanyRecs({ career_goals: user?.career_goals }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000)),
    ]);

    try {
      let result;
      try {
        result = await makeCall();
      } catch (firstErr) {
        await new Promise(r => setTimeout(r, 3000));
        result = await makeCall();
      }
      const data = result?.data || result;
      const list = data?.companies || [];

      memCache.data = list;
      memCache.key = cacheKey;
      memCache.externalAt = now;
      memCache.internalAt = now;

      setCompanies(list);
    } catch (e) {
      setError(true);
      setCompanies(null);
    } finally {
      setLoading(false);
    }
  }, [user?.email, getCacheKey(user)]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { companies, loading, error, refetch: fetchRecs };
}