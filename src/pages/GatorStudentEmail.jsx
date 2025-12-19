import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, GraduationCap, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GatorStudentEmail() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  const handleContinue = () => {
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }

    const isUFL = email.toLowerCase().endsWith('@ufl.edu');
    
    // Store info in localStorage (survives OAuth redirects)
    localStorage.setItem('pending_invite_role', 'gator');
    localStorage.setItem('pending_student_email', email.trim());
    
    if (referralCode.trim()) {
      localStorage.setItem('pending_referral_code', referralCode.trim().toUpperCase());
    }
    
    console.log('🎓 [GatorStudentEmail] UFL student:', isUFL, 'email:', email);
    console.log('🎟️ [GatorStudentEmail] Referral code:', referralCode || 'none');
    
    // Redirect to Google OAuth - callback to GatorAuth
    const callbackUrl = `${window.location.origin}/#GatorAuth`;
    base44.auth.redirectToLogin(callbackUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 mx-auto mb-6 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Welcome, Gator! 🐊
            </h1>
            <p className="text-slate-600">
              Enter your email to get started
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Email
              </label>
              <Input
                type="email"
                placeholder="yourname@ufl.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              />
              <p className="text-xs text-slate-500 mt-2">
                ✅ @ufl.edu students get instant access (no invite code needed)
              </p>
            </div>

            {/* Optional Referral Code */}
            {!showReferral ? (
              <button
                onClick={() => setShowReferral(true)}
                className="w-full p-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all text-sm text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Have a referral code? (Optional)
              </button>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="GATOR-XXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="h-12 text-base font-mono tracking-wider"
                  maxLength={20}
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Give credit to whoever invited you
                </p>
              </div>
            )}

            <Button
              onClick={handleContinue}
              disabled={!email.trim()}
              className="w-full h-14 text-base font-semibold"
              style={{ backgroundColor: '#0021A5' }}
            >
              Continue with Google
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-slate-500 mt-4">
              You'll sign in with Google on the next page
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

GatorStudentEmail.isPublic = true;