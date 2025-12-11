import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    
    // Wait for auth to finish loading
    if (isLoading) {
      console.log('⏳ [GatorAuth] Waiting for auth...');
      return;
    }

    // Still no user after loading - redirect to login
    if (!user) {
      console.log('🔐 [GatorAuth] No user, redirecting to login');
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // User authenticated - process once
    const handleAuthSuccess = async () => {
      console.log('✅ [GatorAuth] User authenticated:', user.email);
      setProcessed(true);
      
      // Clear OAuth params from URL
      const cleanHash = window.location.hash.split('?')[0];
      window.history.replaceState({}, document.title, window.location.pathname + cleanHash);
      
      // Check for pending parent invite
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('🔄 [GatorAuth] Setting up parent role...');
        
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
          
          console.log('✅ [GatorAuth] Navigating to ParentDashboard');
          window.location.hash = 'ParentDashboard';
        } catch (error) {
          console.error('❌ [GatorAuth] Error:', error);
          window.location.hash = 'Dashboard';
        }
      } else {
        console.log('✅ [GatorAuth] Going to Dashboard');
        window.location.hash = 'Dashboard';
      }
    };

    handleAuthSuccess();
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