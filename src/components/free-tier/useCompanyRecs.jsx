import { useState, useEffect, useCallback } from 'react';
import { getFreeTierCompanyRecs } from '@/functions/getFreeTierCompanyRecs';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

export function useCompanyRecs(user) {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRecs = useCallback(async () => {
    if (!user?.email) return;

    // Check in-memory cache stored on user object
    const cached = user?.company_recs_cache;
    const cacheKey = getCacheKey(user);
    if (
      cached &&
      cached.key === cacheKey &&
      cached.generated_at &&
      Date.now() - new Date(cached.generated_at).getTime() < CACHE_TTL_MS
    ) {
      setCompanies(cached.companies);
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
        // Retry once after 3 seconds
        await new Promise(r => setTimeout(r, 3000));
        result = await makeCall();
      }
      const data = result?.data || result;
      const list = data?.companies || [];
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