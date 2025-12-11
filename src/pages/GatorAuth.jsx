import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // Authenticated - clear params and go to Dashboard
    if (user) {
      console.log('✅ [GatorAuth] Authenticated, navigating to Dashboard');
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.hash = 'Dashboard';
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center max-w-md px-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold mb-2">
          {user ? 'Setting up your account...' : 'Redirecting to Google...'}
        </p>
        <p className="text-white/80 text-sm">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;