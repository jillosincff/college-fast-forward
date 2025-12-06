import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, Users, TrendingUp, Crown, 
  Loader2, UserPlus, CreditCard, RefreshCw,
  ChevronRight, Calendar, AlertCircle
} from 'lucide-react';
import { getAmbassadorEarnings } from '@/functions/getAmbassadorEarnings';

export default function AmbassadorPaymentDashboard({ open, onOpenChange, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadEarnings();
    }
  }, [open]);

  const loadEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAmbassadorEarnings();
      if (response.data?.success) {
        setData(response.data);
      } else {
        setError(response.data?.error || 'Failed to load earnings');
      }
    } catch (err) {
      console.error('Error loading earnings:', err);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-orange-500" />
            Founding Circle Earnings
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={loadEarnings} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Total Earnings Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Total Earnings</p>
              <p className="text-4xl font-bold">{formatCurrency(data.earnings.total)}</p>
              <p className="text-sm opacity-75 mt-2">
                Lifetime earnings from all referral activity
              </p>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Signup Bonuses */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Signup Bonuses</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(data.earnings.signupBonus.amount)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {data.earnings.signupBonus.count} eligible × ${data.earnings.signupBonus.perSignup}
                  </p>
                  {data.earnings.signupBonus.isFreePhaseActive && data.earnings.signupBonus.pendingProfiles > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {data.earnings.signupBonus.pendingProfiles} pending profile completion
                    </p>
                  )}
                  {!data.earnings.signupBonus.isFreePhaseActive && (
                    <p className="text-xs text-amber-600 mt-1">
                      Free Phase ended - no new $5 bonuses
                    </p>
                  )}
                  {data.earnings.signupBonus.capped && (
                    <Badge className="mt-2 bg-green-200 text-green-800 text-xs">
                      Cap reached (${data.earnings.signupBonus.cap})
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Commission */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Monthly Commission</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(data.earnings.monthlyCommission.amount)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {data.earnings.monthlyCommission.rate}% from {data.earnings.monthlyCommission.paidUsersCount} paid users
                  </p>
                </CardContent>
              </Card>

              {/* Free Phase Status */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Free Phase</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {data.stats.freePhaseActive ? 'Active' : 'Ended'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {data.stats.freePhaseActive 
                      ? `${data.stats.spotsLeftInFreePhase} spots left for $5 bonuses`
                      : 'Now earning 15% commission on paid users'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Performance Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.stats.totalSignups}</p>
                    <p className="text-xs text-slate-500">Total Signups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{data.stats.qualifiedSignups}</p>
                    <p className="text-xs text-slate-500">Complete Profiles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.stats.paidConversions}</p>
                    <p className="text-xs text-slate-500">Paid Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.stats.conversionRate}%</p>
                    <p className="text-xs text-slate-500">Conversion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.stats.teamSize}</p>
                    <p className="text-xs text-slate-500">Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Breakdown */}
            {data.earnings.monthlyCommission.breakdown && data.earnings.monthlyCommission.breakdown.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Monthly Commission Breakdown
                  </h4>
                  <div className="space-y-2">
                    {data.earnings.monthlyCommission.breakdown.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.tier} • ${item.monthlyPrice}/mo</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-700">{formatCurrency(item.commission)}/mo</p>
                          <p className="text-xs text-blue-600">15% commission</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {data.recentActivity.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {data.recentActivity.map((activity, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.isPaid ? 'bg-green-100' : activity.profileComplete ? 'bg-blue-100' : 'bg-amber-100'
                          }`}>
                            {activity.isPaid ? (
                              <CreditCard className="w-4 h-4 text-green-600" />
                            ) : (
                              <UserPlus className={`w-4 h-4 ${activity.profileComplete ? 'text-blue-500' : 'text-amber-500'}`} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{activity.name}</p>
                            <p className="text-xs text-slate-500">
                              {activity.isPaid 
                                ? `Paid • ${activity.tier || 'Subscriber'}` 
                                : activity.profileComplete 
                                  ? 'Profile complete • Eligible for bonus'
                                  : 'Profile incomplete • Pending'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(activity.date)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payout Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">How Campus Ambassador Payouts Work</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>$5 Signup Bonuses (Free Phase Only):</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-blue-700">
                    <li>• $5 for every completed signup before UF hits 1,000 users</li>
                    <li>• Max $100 lifetime (20 signups)</li>
                    <li>• Requires full profile: Name, Grad Year + Major, Help Request</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <strong>15% Monthly Commission (After 1,000):</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-blue-700">
                    <li>• $1.35/mo per $9 subscriber (15% of $9)</li>
                    <li>• $2.85/mo per $19 subscriber (15% of $19)</li>
                    <li>• Paid forever as long as they stay subscribed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}