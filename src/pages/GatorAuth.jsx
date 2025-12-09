import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [authAttempted, setAuthAttempted] = React.useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log('✅ [GatorAuth] User authenticated, navigating to role selection');
        navigate('GatorRoleSelection');
      } else if (!authAttempted) {
        console.log('🔐 [GatorAuth] Redirecting to Base44 login...');
        setAuthAttempted(true);
        const callbackUrl = `${window.location.origin}/#GatorRoleSelection`;
        console.log('📍 [GatorAuth] Callback URL:', callbackUrl);
        base44.auth.redirectToLogin(callbackUrl);
      }
    }
  }, [user, isLoading, authAttempted]);

  // Show loading spinner while checking auth or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Redirecting to login...</p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;