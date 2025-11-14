import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Gift, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getPricingTier } from '@/functions/getPricingTier';
import { navigate } from '@/components/utils/navigation';

export default function MembershipStatusCard() {
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadPricingData = async () => {
      try {
        const { data } = await getPricingTier();
        setPricingData(data);
      } catch (error) {
        console.error('Failed to load pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPricingData();
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pricingData) return null;

  // **STUDENTS GET SPECIAL "ALWAYS FREE" CARD**
  if (pricingData.isStudent) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-blue-50 border-2 border-orange-200 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🎓</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Student Access - FREE Forever! 🧡💙
              </h3>
              <p className="text-slate-600 mb-3">
                As a UF student, you get unlimited free access to all features. Focus on getting hired, not paying!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  ✅ Always Free
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  🎯 Full Access
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                  🔥 All Features
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => navigate('Opportunities')}
                className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white font-bold shadow-lg"
              >
                Find Jobs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // **FOUNDING GATORS (Parents who joined early)**
  if (pricingData.isFounding) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                👑 Founding Gator - Free Forever!
              </h3>
              <p className="text-slate-600 mb-2">
                Thank you for being one of the first 1,000 members! Your membership is <strong>free for life</strong>.
              </p>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                #️⃣ Founder #{pricingData.userPosition}
              </span>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl font-bold text-slate-900">$0</div>
              <div className="text-sm text-slate-600">forever</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // **EARNED FREE MEMBERSHIP (through invites)**
  if (pricingData.hasLifetimeMembership) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                🎉 Free Lifetime Membership Unlocked!
              </h3>
              <p className="text-slate-600 mb-2">
                You invited {pricingData.successfulInvites} people and earned <strong>free access forever</strong>!
              </p>
              <div className="flex gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  ✅ {pricingData.points} points earned
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  🎯 {pricingData.successfulInvites} successful invites
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl font-bold text-green-600">$0</div>
              <div className="text-sm text-slate-600">forever</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // **PAID TIER (Early Adopter or Standard) - Show progress to free**
  const progressPercent = (pricingData.points / 2000) * 100;
  const isEarlyAdopter = pricingData.isEarlyAdopter;

  return (
    <Card className={`border-2 shadow-lg ${
      isEarlyAdopter 
        ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200' 
        : 'bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200'
    }`}>
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isEarlyAdopter ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {pricingData.tierName}
                </h3>
                <p className="text-sm text-slate-600">
                  {isEarlyAdopter ? 'Thank you for joining early!' : 'Welcome to the Gator network'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">${pricingData.price}</div>
              <div className="text-xs text-slate-600">per month</div>
            </div>
          </div>

          {/* Progress to Free */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Gift className="w-4 h-4 text-green-600" />
                Progress to Free Membership
              </span>
              <span className="font-bold text-green-600">
                {pricingData.points} / 2,000 points
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-slate-600">
              💡 {pricingData.message}
            </p>
          </div>

          {/* Invite Stats */}
          <div className="flex gap-4 p-3 bg-white/60 rounded-lg">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pricingData.successfulInvites}
              </div>
              <div className="text-xs text-slate-600">Successful Invites</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-green-600">
                {pricingData.invitesNeeded}
              </div>
              <div className="text-xs text-slate-600">More Needed</div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => {
              const inviteButton = document.querySelector('[data-invite-modal-trigger]');
              if (inviteButton) inviteButton.click();
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite & Earn Points
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}