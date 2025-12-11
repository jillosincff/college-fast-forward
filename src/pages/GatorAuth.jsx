import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [isSettingUpRole, setIsSettingUpRole] = useState(false);

  useEffect(() => {
    if (isLoading || isSettingUpRole) return;

    // Not authenticated - redirect to Google
    if (!user) {
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // User is authenticated - handle role setup
    const handleAuthSuccess = async () => {
      console.log('✅ [GatorAuth] User authenticated');
      
      // Clear OAuth params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check for pending parent invite
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('🔄 [GatorAuth] Setting up parent role...');
        setIsSettingUpRole(true);
        
        try {
          await base44.auth.updateMe({ 
            persona: 'parent',
            roles: ['parent'],
            onboarding_completed: true,
            invite_code_used: pendingCode || 'direct'
          });
          
          console.log('✅ [GatorAuth] Parent role set, refreshing user...');
          await refreshUser();
          
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          
          console.log('✅ [GatorAuth] Navigating to ParentDashboard');
          window.location.hash = 'ParentDashboard';
        } catch (error) {
          console.error('❌ [GatorAuth] Failed to set parent role:', error);
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          window.location.hash = 'Dashboard';
        }
      } else {
        console.log('✅ [GatorAuth] Regular user, going to Dashboard');
        window.location.hash = 'Dashboard';
      }
    };

    handleAuthSuccess();
  }, [user, isLoading, isSettingUpRole, refreshUser]);

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