import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, DollarSign, Copy, Check, ExternalLink, 
  TrendingUp, Trophy, Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Referral } from '@/entities/Referral';
import { navigate } from '@/components/utils/navigation';

export default function CampusAmbassadorWidget() {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [user?.email]);

  const loadReferralData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const referrals = await Referral.filter({ email: user.email });
      if (referrals && referrals.length > 0) {
        // Aggregate all referral codes for this user
        const totalSignups = referrals.reduce((sum, r) => sum + (r.signups_count || 0), 0);
        const totalEarnings = referrals.reduce((sum, r) => sum + (r.earnings_total || 0), 0);
        
        setReferralData({
          codes: referrals.map(r => r.referral_code),
          primaryCode: referrals[0].referral_code,
          school: referrals[0].school,
          totalSignups,
          totalEarnings,
          role: referrals[0].role
        });
      }
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralData?.primaryCode) return;
    const link = `${window.location.origin}/#LandingPage?ref=${referralData.primaryCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't render if user is a founding circle lead (they have their own widget)
  if (user?.is_founding_circle_lead) return null;

  // Don't render if not an ambassador
  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (!referralData) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-lg">Campus Ambassador</span>
          </div>
          <Badge className="bg-blue-100 text-blue-700">
            {referralData.school}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500">Total Signups</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{referralData.totalSignups}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${referralData.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm">
              {referralData.primaryCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyReferralLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Earnings Info */}
        <div className="bg-blue-100/50 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">💰 Earn $5 per completed profile signup!</p>
          <p className="text-xs text-blue-600">
            Share your link and earn when friends complete their profile.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate('AmbassadorDashboard')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Earnings Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('AmbassadorLeaderboard')}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}