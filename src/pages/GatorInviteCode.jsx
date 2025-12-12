import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { Lock, ArrowRight, Info } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

export default function GatorInviteCode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);

  const handleContinue = () => {
    // Store referral code if provided
    if (referralCode.trim()) {
      sessionStorage.setItem('pending_referral_code', referralCode.trim());
    }
    
    // Store that user selected gator role (matches parent flow naming)
    sessionStorage.setItem('pending_invite_role', 'gator');
    
    trackEvent('gator_continue_to_auth');
    navigate('GatorAuth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-white p-4">
      <div className="w-full max-w-lg">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center shadow-2xl">
            <Lock className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            UF Gator Network
          </h1>
          <p className="text-lg text-slate-600">
            Where Gators connect for careers
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-8 md:p-10">
            {/* Sign in section */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Sign in with your <span className="font-bold">@ufl.edu</span> email
              </h2>
              <p className="text-sm text-slate-600">
                Your data is secure. We only use this to verify you're a UF student.
              </p>
            </div>

            {/* Google Auth Button */}
            <div className="mb-6">
              <Button
                onClick={() => {
                  // Store referral code if provided
                  if (referralCode.trim()) {
                    sessionStorage.setItem('pending_referral_code', referralCode.trim());
                  }
                  sessionStorage.setItem('pending_invite_role', 'gator');
                  base44.auth.redirectToLogin(window.location.origin + '/');
                }}
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 text-base font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Referral code section */}
            <div className="text-center mb-6">
              <button
                onClick={() => setShowReferralInput(!showReferralInput)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-base">Have a referral code?</span>
                <Info className="w-4 h-4" />
              </button>
            </div>

            {showReferralInput && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder="Enter referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="h-12 text-center text-base"
                  maxLength={20}
                />
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#F2A900', color: '#000' }}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}