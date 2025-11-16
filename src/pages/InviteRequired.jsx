import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, Sparkles, ArrowRight, Lock, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { verifyInviteCode } from '@/functions/verifyInviteCode';
import { base44 } from '@/api/base44Client';

export default function InviteRequired() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    // Check for pending invite code in session storage
    const pendingCode = sessionStorage.getItem('pending_invite_code');
    if (pendingCode) {
      setInviteCode(pendingCode);
    }
  }, []);

  const handleVerifyAndSetRole = async () => {
    if (!inviteCode.trim()) {
      setErrorMessage('Please enter your invite code');
      return;
    }

    if (!selectedRole) {
      setErrorMessage('Please select if you\'re a Gator or a Parent');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      console.log('Verifying invite code...');
      
      const result = await verifyInviteCode({
        code: inviteCode.trim()
      });

      if (!result.data.success) {
        setErrorMessage(result.data.error || 'Invalid invite code');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Invite verified successfully!');
      
      // Update user with selected role
      await User.updateMyUserData({
        roles: [selectedRole],
        persona: selectedRole,
        onboarding_completed: false,
        profile_completion_score: 10,
        gator_points: 50 // Award 50 points for joining
      });

      // Show success message
      const description = result.data.is_community_invite && result.data.group_name
        ? `Welcome to ${result.data.group_name}! 🎉 +50 points!`
        : `Invited by ${result.data.inviter_name}. 🎉 +50 points!`;

      toast({
        title: selectedRole === 'gator' ? "Welcome Gator! 🐊" : "Welcome! 🧡",
        description,
      });

      // Clear session storage
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_type');
      sessionStorage.removeItem('pending_inviter_name');

      await refreshUser();
      
      // Navigate to appropriate onboarding
      if (selectedRole === 'gator') {
        navigate('StudentOnboarding');
      } else {
        navigate('Onboarding');
      }
    } catch (error) {
      console.error('Failed to verify invite:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUFStudentSignIn = () => {
    // Redirect to Google OAuth - UF students will be auto-verified
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            🔒 Invite-Only Gator Network
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            College Fast Forward is invite-only. Enter your code to unlock access.
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-semibold">
              Alumni = Gators = FREE
            </span>
          </div>
        </div>

        <Card className="bg-white border-2 border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-6">
              {/* Invite Code Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setErrorMessage('');
                  }}
                  placeholder="e.g., UFPARENTS or XFG23H7K"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all uppercase tracking-wider text-center text-lg font-mono"
                  maxLength={15}
                />
                <p className="text-xs text-slate-500 mt-1 text-center">
                  For alumni & parents without @ufl.edu emails
                </p>
              </div>

              {/* Role Selection - Only show after code is entered */}
              {inviteCode.trim().length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    I am a...
                  </label>
                  
                  <button
                    onClick={() => setSelectedRole('gator')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedRole === 'gator'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🐊</span>
                      <div className="text-left flex-grow">
                        <p className="font-bold text-slate-900">Gator (Student or Alum)</p>
                        <p className="text-sm text-slate-600">Forever free — find jobs & get hired</p>
                      </div>
                      {selectedRole === 'gator' && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedRole('parent')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedRole === 'parent'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🧡</span>
                      <div className="text-left flex-grow">
                        <p className="font-bold text-slate-900">Gator Parent</p>
                        <p className="text-sm text-slate-600">Help Gators get hired — open your network</p>
                      </div>
                      {selectedRole === 'parent' && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}

              <Button
                onClick={handleVerifyAndSetRole}
                disabled={isSubmitting || !inviteCode.trim() || !selectedRole}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white py-3 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Unlocking Access...
                  </>
                ) : (
                  <>
                    Unlock Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* UF Student Callout - Only show if parent is NOT selected */}
        {selectedRole !== 'parent' && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-slate-500 font-medium">
                — OR —
              </p>
            </div>

            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-none mb-4">
              <div className="p-5">
                <div className="flex items-start gap-3 text-white">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-bold text-base mb-1">
                      🎓 Current UF Student?
                    </p>
                    <p className="text-sm text-blue-100 mb-3">
                      Students with <strong>@ufl.edu</strong> emails don't need an invite code — just sign in with Google!
                    </p>
                    <Button
                      onClick={handleUFStudentSignIn}
                      className="bg-white hover:bg-blue-50 text-blue-700 font-bold w-full"
                    >
                      Sign In with UF Email
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* IMPORTANT WARNING BANNER */}
            <Card className="bg-yellow-50 border-2 border-yellow-400 mb-6">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-bold text-sm text-yellow-900 mb-2">
                      ⚠️ IMPORTANT: You MUST Click "Continue with Google"
                    </p>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>✅ <strong>DO:</strong> Click "Continue with Google" on the next page</li>
                      <li>❌ <strong>DON'T:</strong> Use email/password fields (they require verification)</li>
                      <li>💡 Google sign-in works instantly for @ufl.edu emails</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-slate-200 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                How It Works
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-lg">1.</span>
                <div>
                  <strong>Current UF students (@ufl.edu):</strong> Click the button above, then click "Continue with Google" on the next page
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold text-lg">2.</span>
                <div>
                  <strong>Alumni & Parents:</strong> Enter your invite code and choose your role
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-lg">3.</span>
                <div>
                  <strong>Earn +50 points</strong> and unlock the platform
                </div>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                💡 <strong>Once you join,</strong> you can invite others and earn +100 points per invite!
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200">
          <div className="p-6 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Don't have an invite code?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('RequestInvite')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Request Admin Invite
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Join the invite-only Gator network 🐊🧡💙
          </p>
        </div>
      </div>
    </div>
  );
}

InviteRequired.isPublic = true;