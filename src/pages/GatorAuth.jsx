import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import SSOAuthButton from '@/components/auth/SSOAuthButton';
import { trackEvent } from '@/components/utils/analytics';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to role selection
    if (user && !isLoading) {
      navigate('GatorRoleSelection');
    }
  }, [user, isLoading]);

  const handleGoogleAuth = () => {
    trackEvent('auth_google_clicked');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated, don't render the auth page
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
              alt="College Fast Forward"
              className="h-24 mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to College Fast Forward
            </h1>
            <p className="text-slate-600">Sign in to continue</p>
          </div>

          <div className="space-y-3">
            <SSOAuthButton
              provider="google"
              onSuccess={handleGoogleAuth}
              redirectUrl={window.location.origin + '/#GatorRoleSelection'}
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

GatorAuth.isPublic = true;