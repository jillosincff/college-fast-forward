import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { createPageUrl } from '@/utils';

export default function ProtectedRoute() {
  const { user, isLoading, setIntendedPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!user) {
    setIntendedPath(location.pathname);
    return <Navigate to="/" replace />;
  }

  if (!user.role) {
    return <Navigate to={createPageUrl("WelcomeRole")} replace />;
  }

  if (!user.onboarding_completed) {
    setIntendedPath(location.pathname);
    return <Navigate to={createPageUrl("Onboarding")} replace />;
  }

  return <Outlet />;
}