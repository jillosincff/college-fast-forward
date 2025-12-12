import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, DollarSign, Users, TrendingUp, Copy, Share2,
  Loader2, UserPlus, CreditCard, RefreshCw, AlertCircle,
  ChevronRight, Calendar, CheckCircle, Clock, ArrowUpRight
} from 'lucide-react';
import { getAmbassadorEarnings } from '@/functions/getAmbassadorEarnings';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';

export default function AmbassadorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadEarnings();
      
      // Auto-refresh every 30 seconds for real-time updates
      const interval = setInterval(() => {
        loadEarnings(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadEarnings = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
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
      setRefreshing(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    });
  };

  const handleShareLink = (code) => {
    const shareUrl = `${window.location.origin}/#GatorAuth?ref=${code}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share this link to earn commissions"
    });
  };

  const handleRequestPayout = () => {
    toast({
      title: "Payout request submitted",
      description: "Our team will process your payout within 5-7 business days"
    });
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-slate-600 mb-4">Please sign in to view your ambassador dashboard</p>
            <Button onClick={() => navigate('LandingPage')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => loadEarnings()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {data?.isFoundingCircleLeader ? 'Founding Circle Leader' : 'Campus Ambassador'} Dashboard
                </h1>
                <p className="text-slate-600">Real-time earnings and performance tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => loadEarnings(true)}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {data?.isFoundingCircleLeader && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                <p className="font-semibold">
                  Founding Circle Leader • Phase {data.currentPhase}
                  {data.currentPhase === 1 
                    ? ` - $5/signup ($200 cap) + 15% commission`
                    : ` - ${data.earnings.monthlyCommission.rate}% + 5% 2nd-level (no cap, no signup bonus)`
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Earnings Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-2">Total Lifetime Earnings</p>
                <p className="text-5xl font-bold mb-4">{formatCurrency(data?.earnings.total)}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-blue-100 text-xs">This Month</p>
                    <p className="text-2xl font-semibold">{formatCurrency(data?.earnings.monthlyCommission.amount)}</p>
                  </div>
                  <div className="h-12 w-px bg-blue-400" />
                  <div>
                    <p className="text-blue-100 text-xs">All-Time Bonuses</p>
                    <p className="text-2xl font-semibold">{formatCurrency(data?.earnings.signupBonus.amount)}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button
                  onClick={handleRequestPayout}
                  disabled={data?.earnings.total < 50}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
                {data?.earnings.total < 50 && (
                  <p className="text-blue-100 text-xs mt-2">Minimum: $50</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-500" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{data?.stats.totalSignups}</p>
              <p className="text-sm text-slate-600">Total Referrals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-xs font-medium text-green-600">
                  {data?.stats.qualifiedSignups > 0 ? Math.round((data?.stats.qualifiedSignups / data?.stats.totalSignups) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{data?.stats.qualifiedSignups}</p>
              <p className="text-sm text-slate-600">Qualified Signups</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-8 h-8 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">
                  {data?.stats.conversionRate}%
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{data?.stats.paidConversions}</p>
              <p className="text-sm text-slate-600">Paid Conversions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <span className="text-xs font-medium text-orange-600">Monthly</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(data?.earnings.monthlyCommission.amount)}</p>
              <p className="text-sm text-slate-600">Recurring Income</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Earnings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signup Bonuses */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Signup Bonuses</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(data?.earnings.signupBonus.amount)}
                  </span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• {data?.earnings.signupBonus.count} qualified × ${data?.earnings.signupBonus.perSignup}</p>
                  {data?.earnings.signupBonus.pendingProfiles > 0 && (
                    <p className="text-amber-600">• {data?.earnings.signupBonus.pendingProfiles} pending completion</p>
                  )}
                  {data?.earnings.signupBonus.cap && (
                    <p>• Cap: {formatCurrency(data?.earnings.signupBonus.cap)} {data?.earnings.signupBonus.capped && '(reached)'}</p>
                  )}
                </div>
              </div>

              {/* Monthly Commission */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Monthly Commission</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    {formatCurrency(data?.earnings.monthlyCommission.amount)}
                  </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• {data?.earnings.monthlyCommission.rate}% from {data?.earnings.monthlyCommission.paidUsersCount} paid members</p>
                  {data?.isFoundingCircleLeader && data?.currentPhase === 2 && data?.earnings.monthlyCommission.secondLevelAmount > 0 && (
                    <p>• 5% 2nd-level: {formatCurrency(data?.earnings.monthlyCommission.secondLevelAmount)}</p>
                  )}
                  <p className="text-blue-600">• Recurring every month</p>
                </div>
              </div>

              {/* Phase Progress */}
              {data?.stats.freePhaseActive && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">Free Phase Progress</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {data?.stats.spotsLeftInFreePhase} spots left • Phase 2 unlocks at 1,001 users
                  </p>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((1000 - data?.stats.spotsLeftInFreePhase) / 1000) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Codes & Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Your Referral Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.referralCodes?.map((ref, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-lg font-mono font-bold text-slate-900">{ref.code}</code>
                    <Badge variant="secondary">{ref.signups || 0} signups</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopyCode(ref.code)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </Button>
                    <Button
                      onClick={() => handleShareLink(ref.code)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 How to Share</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your link on social media</li>
                  <li>• Add it to your email signature</li>
                  <li>• Send to prospective UF students</li>
                  <li>• Post in UF Facebook groups</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Breakdown Table */}
        {data?.earnings.monthlyCommission.breakdown?.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly Commission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.earnings.monthlyCommission.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.level === 2 ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.tier} • ${item.monthlyPrice}/mo
                          {item.level === 2 && ` • via ${item.referredBy}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(item.commission)}/mo</p>
                      <p className="text-xs text-slate-500">
                        {item.level === 2 ? '5% (2nd-level)' : `${data.earnings.monthlyCommission.rate}%`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Timeline */}
        {data?.recentActivity?.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.isPaid 
                        ? 'bg-green-100' 
                        : activity.profileComplete 
                          ? 'bg-blue-100' 
                          : 'bg-amber-100'
                    }`}>
                      {activity.isPaid ? (
                        <CreditCard className="w-5 h-5 text-green-600" />
                      ) : activity.profileComplete ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activity.name}</p>
                      <p className="text-sm text-slate-600">
                        {activity.isPaid 
                          ? `Upgraded to ${activity.tier}` 
                          : activity.profileComplete 
                            ? 'Completed profile'
                            : 'Signed up • Pending profile completion'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{formatDate(activity.date)}</p>
                      {activity.inFreePhaseBucket && (
                        <Badge variant="secondary" className="text-xs mt-1">Free Phase</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}