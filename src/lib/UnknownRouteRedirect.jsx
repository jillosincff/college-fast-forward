import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageNotFound from './PageNotFound';

// Known marketing section anchors on the landing page. Direct links like
// /pricing, /stats, /#pricing should land on the landing page (and scroll to
// the section if it exists) rather than throwing a full-page 404.
const SECTION_ANCHORS = ['pricing', 'stats', 'how-it-works', 'stories', 'faq', 'features'];

export default function UnknownRouteRedirect() {
  const location = useLocation();

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  const slug = location.pathname.replace(/^\//, '').toLowerCase();

  // After redirecting home, scroll to a matching section if the slug maps to one.
  useEffect(() => {
    if (SECTION_ANCHORS.includes(slug)) {
      // Defer to let the landing page render its sections first.
      const t = setTimeout(() => {
        const el = document.getElementById(slug);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [slug]);

  // Admins still get the real 404 (with the "implement this page" hint).
  if (isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin') {
    return <PageNotFound />;
  }

  // Signed-in users without a persona must go to GatorAuth → QuickOnboarding,
  // never the marketing landing. A stale deep link (old bookmark, dead page)
  // used to bounce them to "/" and restart the GatorAuth/landing loop.
  if (isFetched && authData?.isAuthenticated && authData?.user && !authData.user.persona?.trim()) {
    return <Navigate to="/GatorAuth" replace />;
  }

  // Everyone else: send to the landing page instead of a dead end.
  return <Navigate to="/" replace />;
}