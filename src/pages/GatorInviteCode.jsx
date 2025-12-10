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
    
    // Store that user selected student role
    sessionStorage.setItem('pending_role_selection', 'gator');
    
    trackEvent('gator_continue_to_auth');
    navigate('GatorAuth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              🔒 Enter Your Invite Code
            </h1>
            <p className="text-slate-600">
              Join the exclusive Gator career network
            </p>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invite Code
              </label>
              <Input
                type="text"
                placeholder="ENTER CODE"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                className="h-12 text-center text-lg font-semibold tracking-wider uppercase"
                maxLength={20}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Don't have an invite code?{' '}
                <button
                  onClick={handleRequestInvite}
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                >
                  Request one here
                </button>
              </p>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={!inviteCode.trim() || isVerifying}
              className="w-full h-12 text-base font-semibold"
              style={{ backgroundColor: role === 'gator' ? '#0021A5' : '#FA4616' }}
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Role Selection
          </button>
        </CardContent>
      </Card>
    </div>
  );
}