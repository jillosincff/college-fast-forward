import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { Referral } from '@/entities/Referral';
import FoundingCircleApplyModal from './FoundingCircleApplyModal';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function AmbassadorPage({ 
  school, 
  nickname, 
  prefix, 
  primaryColor = "#0021A5", 
  accentColor = "#FA4616"
}) {
  const { user, isLoading } = useAuth();
  const [customCode, setCustomCode] = useState('');
  const [finalCode, setFinalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [existingReferral, setExistingReferral] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Check if user already has a referral code
  useEffect(() => {
    const checkExistingReferral = async () => {
      if (!user?.email) return;
      setCheckingExisting(true);
      try {
        const existing = await Referral.filter({ email: user.email });
        if (existing && existing.length > 0) {
          setExistingReferral(existing[0]);
          setFinalCode(existing[0].referral_code);
        }
      } catch (err) {
        console.error('Error checking existing referral:', err);
      } finally {
        setCheckingExisting(false);
      }
    };
    checkExistingReferral();
  }, [user?.email]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleSaveCode = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    const input = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (input.length < 3) {
      setError('Code must be at least 3 characters');
      return;
    }

    const code = `${prefix}-${input}`;
    setIsSubmitting(true);
    setError('');

    try {
      // Check if code already exists
      const existing = await Referral.filter({ referral_code: code });
      if (existing && existing.length > 0) {
        setError('Code already taken — try another!');
        setIsSubmitting(false);
        return;
      }

      // Create the referral linked to authenticated user
      const newReferral = await Referral.create({
        name: user.full_name || user.email,
        email: user.email,
        referral_code: code,
        school: school,
        role: 'ambassador',
        status: 'active'
      });

      // Mark user as campus ambassador to enable dashboard access
      await base44.auth.updateMe({
        is_campus_ambassador: true,
        ambassador_code: code
      });

      setExistingReferral(newReferral);
      setFinalCode(code);
    } catch (err) {
      console.error('Error creating referral:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('Dashboard')}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <h1 
          className="text-center text-4xl md:text-5xl font-bold mb-4"
          style={{ color: primaryColor }}
        >
          Earn Real Money Referring {nickname}
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Two ways to get paid — pick the one that fits you.
        </p>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Campus Ambassador Card */}
          <Card className="shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div 
              className="py-6 text-center"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #003399 100%)` }}
            >
              <h2 className="text-3xl font-bold text-white mb-1">
                Campus Ambassador
              </h2>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                Free & Open to All
              </p>
            </div>
            
            <CardContent className="p-8">
              <ul className="text-lg space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>$5 one-time bonus per signup</strong> (max $100 lifetime, 20 referrals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span><strong>15% monthly commission</strong> on each paid family</span>
                </li>
              </ul>

              <p className="text-center text-sm text-gray-500 mb-6">
                $5 bonus only during Free Phase (first 1,000 UF users)
              </p>

              {isLoading || checkingExisting ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : !user ? (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">Sign in to become a Campus Ambassador and get your referral code.</p>
                  <Button
                    onClick={handleLogin}
                    className="w-full h-14 text-lg font-bold text-white rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Get Started
                  </Button>
                </div>
              ) : !finalCode ? (
                <div className="text-center space-y-4">
                  <p className="text-lg">Choose your code:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {prefix}-
                    </span>
                    <Input
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="YOURNAME"
                      maxLength={12}
                      className="w-40 h-12 text-xl text-center font-bold"
                    />
                  </div>
                  <Button
                    onClick={handleSaveCode}
                    disabled={isSubmitting}
                    className="px-8 h-12 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      'Lock It In'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                  <p 
                    className="text-4xl font-black"
                    style={{ color: primaryColor }}
                  >
                    {finalCode}
                  </p>
                  <p className="text-lg text-gray-600">
                    🎉 Start sharing your code and earn!
                  </p>
                  <Button
                    onClick={() => navigate('AmbassadorDashboard')}
                    className="mt-4 w-full h-12 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    View Earnings Dashboard →
                  </Button>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-center mt-4 font-medium">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Founding Circle Card */}
          <Card className="shadow-xl overflow-hidden bg-gray-900">
            {/* Header Banner */}
            <div 
              className="py-6 text-center"
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}
            >
              <h2 
                className="text-3xl font-bold mb-1"
                style={{ color: accentColor }}
              >
                Founding Circle (Lead)
              </h2>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                Parents Only • Limited Spots • Apply Now
              </p>
            </div>
            
            <CardContent className="p-8">
              <ul className="text-lg space-y-3 mb-6 text-white">
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>$5 one-time bonus per signup</strong> (max $200 lifetime, 40 referrals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span><strong>25% monthly commission</strong> on each paid family</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔥</span>
                  <span><strong>5% override</strong> on your recruited ambassadors' earnings</span>
                </li>
              </ul>

              <p className="text-center text-sm text-gray-400 mb-6">
                $5 bonus only during Free Phase (first 1,000 UF users)
              </p>

              <Button
                onClick={() => setShowLeadModal(true)}
                className="w-full py-6 text-xl font-bold rounded-lg text-black"
                style={{ backgroundColor: accentColor }}
              >
                Apply to Lead →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <FoundingCircleApplyModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        school={school}
        accentColor={accentColor}
      />
    </div>
  );
}