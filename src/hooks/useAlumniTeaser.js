import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'cff_alumni_teaser';
let inflight = null;

// Shared fetch for the dashboard alumni teaser + network pulse stats.
// Cached in sessionStorage; deduped across components.
export default function useAlumniTeaser() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (data) return;
    if (!inflight) {
      inflight = base44.functions.invoke('getDashboardAlumniTeaser', {})
        .then(res => res?.data || res)
        .catch(() => null)
        .finally(() => { inflight = null; });
    }
    let mounted = true;
    inflight?.then(result => {
      if (mounted && result) {
        setData(result);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch {}
      }
    });
    return () => { mounted = false; };
  }, [data]);

  return data;
}