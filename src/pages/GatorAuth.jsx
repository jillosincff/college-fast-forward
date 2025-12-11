import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [processing, setProcessing] = React.useState(false);

  useEffect(() => {
    console.log('🔄 [GatorAuth] State:', { 
      hasUser: !!user, 
      isLoading,
      processing,
      pendingRole: sessionStorage.getItem('pending_invite_role')
    });

    // Wait for auth to complete
    if (isLoading) {
      console.log('⏳ [GatorAuth] Waiting for auth...');
      return;
    }

    // Not authenticated - redirect to Google OAuth
    if (!user) {
      console.log('🔐 [GatorAuth] Redirecting to Google OAuth...');
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // Authenticated - handle parent setup or navigate
    if (user && !processing) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Setting up parent account...');
        setProcessing(true);
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: true,
          invite_code_used: pendingCode || 'direct'
        })
        .then(() => {
          console.log('✅ [GatorAuth] Parent role set successfully');
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          window.location.href = '/#ParentDashboard';
        })
        .catch(error => {
          console.error('❌ Failed to set parent role:', error);
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          window.location.href = '/#ParentDashboard';
        });
      } else {
        console.log('✅ [GatorAuth] No pending role, going to role selection');
        window.location.href = '/#GatorRoleSelection';
      }
    }
  }, [user, isLoading, processing]);

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