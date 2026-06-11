import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'cff_parent_companies';
let inflight = null;

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Shared, cached list of companies where school-network parents work.
// hasParentAt(company) does a normalized containment match.
export default function useParentCompanies() {
  const [companies, setCompanies] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (companies) return;
    if (!inflight) {
      inflight = base44.functions.invoke('getParentCompanies', {})
        .then(res => (res?.data || res)?.companies || [])
        .catch(() => [])
        .finally(() => { inflight = null; });
    }
    let mounted = true;
    inflight?.then(result => {
      if (mounted) {
        setCompanies(result);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch {}
      }
    });
    return () => { mounted = false; };
  }, [companies]);

  const hasParentAt = (companyName) => {
    if (!companies || !companyName) return false;
    const target = norm(companyName);
    if (!target) return false;
    return companies.some(c => {
      const n = norm(c.company_name);
      return n && (n === target || n.includes(target) || target.includes(n));
    });
  };

  return { companies, hasParentAt };
}