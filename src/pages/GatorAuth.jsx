import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is not authenticated, redirect to Base44's built-in auth
    if (!isLoading && !user) {
      console.log('🔐 Redirecting to Base44 auth...');
      base44.auth.redirectToLogin(window.location.origin + '/#GatorRoleSelection');
    }
  }, [user, isLoading]);

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