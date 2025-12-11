import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    // Don't do anything while loading
    if (isLoading) {
      console.log('⏳ [GatorAuth] Loading auth state...');
      return;
    }

    // No user yet - wait for OAuth or redirect to login
    if (!user) {
      // Check if we have OAuth params in URL
      const hashParts = window.location.hash.split('?');
      const hashParams = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : null;
      const hasAccessToken = hashParams && (hashParams.has('access_token') || hashParams.has('token'));
      
      if (hasAccessToken) {
        // OAuth callback with token - SDK is processing, wait longer
        console.log('🔄 [GatorAuth] OAuth token detected, SDK still processing...');
        return;
      }
      
      // No token and no user - redirect to login
      console.log('🔐 [GatorAuth] No auth, redirecting to login');
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // User authenticated successfully!
    const handleSuccess = async () => {
      console.log('✅ [GatorAuth] Auth successful:', user.email);
      setProcessed(true);
      
      // Clear OAuth params
      window.history.replaceState({}, document.title, window.location.pathname + '#GatorAuth');
      
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('🔄 [GatorAuth] Setting parent role...');
        
        try {
          await base44.auth.updateMe({ 
            persona: 'parent',
            roles: ['parent'],
            onboarding_completed: true,
            invite_code_used: pendingCode || 'direct'
          });
          
          await refreshUser();
          
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          
          console.log('✅ [GatorAuth] Going to ParentDashboard');
          setTimeout(() => window.location.hash = 'ParentDashboard', 100);
        } catch (error) {
          console.error('❌ [GatorAuth] Error:', error);
          setTimeout(() => window.location.hash = 'Dashboard', 100);
        }
      } else {
        console.log('✅ [GatorAuth] Going to Dashboard');
        setTimeout(() => window.location.hash = 'Dashboard', 100);
      }
    };

    handleSuccess();
  }, [user, isLoading, refreshUser, processed]);

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