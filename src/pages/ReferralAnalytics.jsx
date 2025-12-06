import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Award, Loader2, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function ReferralAnalytics() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.roles?.includes('admin')) {
      navigate('Dashboard');
      return;
    }

    loadAnalytics();
  }, [user, authLoading]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getReferralAnalytics');
      if (response.data.success) {
        setAnalytics(response.data);
      } else {
        setError(response.data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const { topReferrers, signupTrend, summary } = analytics;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('AdminDashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Referral Analytics</h1>
          <p className="text-gray-600 mt-2">Track ambassador performance and signup trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Signups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalSignups}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Ambassadors</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.activeAmbassadors}</p>
                </div>
                <Users className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">${summary.totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Referrals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalReferrals}</p>
                </div>
                <Award className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signup Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Signups Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {signupTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0021A5" 
                    strokeWidth={2}
                    name="Signups"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No signup data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referring Ambassadors</CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Signups</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReferrers.map((referrer, index) => (
                      <tr key={referrer.email} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{referrer.name}</p>
                            <p className="text-sm text-gray-500">{referrer.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {referrer.referral_code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            referrer.role === 'lead' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {referrer.role === 'lead' ? 'Founding Circle' : 'Ambassador'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-lg font-bold text-gray-900">{referrer.signups_count}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-lg font-bold text-green-600">
                            ${referrer.earnings_total.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No referrers yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}