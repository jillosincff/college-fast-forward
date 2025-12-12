import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // No user - trigger login
    if (!user) {
      if (!redirecting) {
        console.log('🔐 [GatorAuth] Redirecting to Google login...');
        setRedirecting(true);
        base44.auth.redirectToLogin(`${window.location.origin}/#Dashboard`);
      }
      return;
    }

    // User is authenticated - Layout will handle routing
    console.log('✅ [GatorAuth] Authenticated, Layout will handle routing');
    window.location.hash = 'LandingPage';
  }, [user, isLoading, redirecting]);

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