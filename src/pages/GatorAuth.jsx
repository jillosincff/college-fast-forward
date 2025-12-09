import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If not loading and no user, redirect to Base44 auth
    if (!isLoading && !user) {
      console.log('🔐 Redirecting to Base44 auth...');
      base44.auth.redirectToLogin(window.location.origin + '/#GatorRoleSelection');
    }
  }, [user, isLoading]);

  // Show loading spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

GatorAuth.isPublic = true;