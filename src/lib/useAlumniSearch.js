import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Onboarding-specific alumni search hook. Hits the same exaService backend
 * as AlumniSearch.jsx but without the FastIQ tier gating, since the whole
 * point of Act 2 is letting free users feel the core value once.
 *
 * The free-tier "alumni_search_used" flag IS still flipped here so the user
 * can't repeat the search later for free — that's the trade-off they accepted
 * by burning their quota during the aha moment.
 */
export function useAlumniSearch({ user, schoolName }) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  const search = useCallback(async (query) => {
    const q = (query || '').trim();
    if (!q || !schoolName) return [];

    setLastQuery(q);
    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const res = await base44.functions.invoke('exaService', {
        action: 'searchAlumni',
        query: q,
        universityName: schoolName,
        maxResults: 5,
        isFastIQ: false,
      });
      const profiles = res?.data?.profiles || [];
      setResults(profiles);

      // Mark the free-tier search as used (mirrors AlumniSearch.jsx behavior).
      if (user?.email && !user?.alumni_search_used) {
        try { localStorage.setItem('alumni_search_used', 'true'); } catch { /* ok */ }
        base44.auth.updateMe({
          alumni_search_used: true,
          has_searched_alumni: true,
        }).catch(() => {});
      }
      return profiles;
    } catch (e) {
      console.error('Onboarding alumni search failed:', e);
      setError(e?.message || 'Search failed');
      return [];
    } finally {
      setSearching(false);
    }
  }, [user?.email, user?.alumni_search_used, schoolName]);

  const generateDraft = useCallback(async (alum, extras = {}) => {
    if (!alum) return '';
    try {
      const res = await base44.functions.invoke('generateOutreachDraft', {
        studentName: extras.studentName || user?.full_name || 'Student',
        major: extras.major || user?.major || user?.career_goals?.major || '',
        targetRole: extras.targetRole || (user?.career_goals?.target_roles || [])[0] || alum.headline || '',
        graduationYear: extras.graduationYear || user?.career_goals?.graduation_year || '',
        school: schoolName,
        alumniName: alum.full_name,
        alumniTitle: alum.headline,
        alumniCompany: alum.company || '',
      });
      return res?.data?.message || res?.message || '';
    } catch (e) {
      console.error('Outreach draft generation failed:', e);
      return '';
    }
  }, [user?.full_name, user?.major, user?.career_goals, schoolName]);

  return { results, searching, error, lastQuery, search, generateDraft };
}
