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

            {/* Continue with Google Button */}
            <Button
              onClick={() => {
                if (referralCode.trim()) {
                  sessionStorage.setItem('pending_referral_code', referralCode.trim());
                  console.log('🎟️ [GatorInviteCode] Storing referral code:', referralCode.trim());
                }
                sessionStorage.setItem('pending_invite_role', 'gator');
                console.log('🔐 [GatorInviteCode] Starting OAuth with role=gator');
                base44.auth.redirectToLogin(window.location.origin);
              }}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#F2A900', color: '#000' }}
            >
              Continue with Google
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}