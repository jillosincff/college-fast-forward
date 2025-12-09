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
    // If user is already authenticated, redirect to role selection
    if (user && !isLoading) {
      console.log('✅ User already authenticated, redirecting to role selection');
      navigate('GatorRoleSelection');
    }
  }, [user, isLoading]);

  const handleGoogleAuth = () => {
    console.log('🔐 Initiating Google auth...');
    trackEvent('auth_google_clicked');
    base44.auth.redirectToLogin(window.location.origin + '/#GatorRoleSelection');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
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
            <Button
              onClick={handleGoogleAuth}
              className="w-full h-14 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm flex items-center justify-center gap-3 font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

GatorAuth.isPublic = true;