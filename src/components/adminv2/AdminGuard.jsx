import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Owner-preview accounts that may view any admin dashboard (mirrors the
// OnboardingGuard bypass in App.jsx).
const OWNER_EMAILS = ['josinoff@gmail.com', 'losinoff@gmail.com'];

const isAuthorizedAdmin = (user) => {
  if (!user) return false;
  if (user.role === 'admin' || user.roles?.includes('admin')) return true;
  if (OWNER_EMAILS.includes(user.email?.toLowerCase())) return true;
  return false;
};

// Gate for internal admin dashboards.
//   - Unauthed → /GatorAuth (login). No public shell.
//   - Authed but not admin/owner → / (home).
//   - While mounted, forces <meta name="robots" content="noindex, nofollow">
//     overriding the global index,follow so the URL can never ship an
//     indexable shell even if it leaks. Restores the prior value on unmount.
export default function AdminGuard({ children }) {
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const prev = existing ? existing.getAttribute('content') : null;
    let meta = existing;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (!prev) {
        // Didn't exist before this guard — remove the tag we created,
        // but only if it still holds our value (don't clobber a later setter).
        if (meta && meta.getAttribute('content') === 'noindex, nofollow') {
          meta.parentNode?.removeChild(meta);
        }
      } else {
        meta?.setAttribute('content', prev);
      }
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/GatorAuth" replace />;
  if (!isAuthorizedAdmin(user)) return <Navigate to="/" replace />;

  return children;
}