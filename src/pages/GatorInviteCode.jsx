import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function GatorInviteCode() {
  const { user, refreshUser } = useAuth();
  const { role } = useParams();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('GatorAuth');
    }
  }, [user]);

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsVerifying(true);
    setError('');
    trackEvent('invite_code_submitted', { role });

    try {
      const response = await base44.functions.invoke('verifyInviteCode', {
        code: inviteCode.toUpperCase().trim()
      });

      if (response.data.success) {
        toast({
          title: "Welcome to the Gator Network! 🐊",
          description: "Your invite code has been verified."
        });
        
        await refreshUser();
        navigate('GatorWelcome', { role });
      } else {
        setError(response.data.message || 'Invalid invite code');
      }
    } catch (err) {
      console.error('Invite verification failed:', err);
      setError('Invalid or expired invite code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestInvite = () => {
    trackEvent('request_invite_from_code_page');
    navigate('RequestInvite');
  };

  const handleBack = () => {
    navigate('GatorRoleSelection');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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