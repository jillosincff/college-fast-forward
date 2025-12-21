import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Users, TrendingUp, Download, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReferrals() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [backfilling, setBackfilling] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('admin'))) {
      navigate('Dashboard');
    }
  }, [user, isLoading]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getReferralStats', {});
      if (response.data?.success) {
        setStats(response.data.stats);
        setTopReferrers(response.data.topReferrers || []);
        setRecentReferrals(response.data.recentReferrals || []);
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const response = await base44.functions.invoke('backfillReferralCodes', {});
      if (response.data?.success) {
        alert(`Backfill complete! Updated ${response.data.updated} users.`);
        loadData();
      } else {
        alert('Backfill failed: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Backfill failed:', err);
      alert('Backfill failed: ' + err.message);
    } finally {
      setBackfilling(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['New User Email', 'New User Name', 'Code Used', 'Referred By Email', 'Referred By Name', 'Date'];
    const rows = recentReferrals.map(r => [
      r.newUserEmail,
      r.newUserName,
      r.codeUsed,
      r.referredBy?.email || '',
      r.referredBy?.name || '',
      r.date ? format(new Date(r.date), 'yyyy-MM-dd HH:mm') : ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReferrals = recentReferrals.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.newUserName?.toLowerCase().includes(term) ||
      r.newUserEmail?.toLowerCase().includes(term) ||
      r.codeUsed?.toLowerCase().includes(term) ||
      r.referredBy?.name?.toLowerCase().includes(term)
    );
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('AdminDashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Gift className="w-8 h-8 text-orange-500" />
                Referral Tracking
              </h1>
              <p className="text-slate-600 mt-1">Track who's referring whom</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleBackfill} disabled={backfilling}>
              {backfilling ? 'Generating...' : 'Generate Missing Codes'}
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                  <p className="text-slate-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.usersWithCodeUsed || 0}</p>
                  <p className="text-slate-600">Used Referral Code</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.conversionRate || 0}%</p>
                  <p className="text-slate-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">🏆 Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No referrals yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Their Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700"># Referrals</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Most Recent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReferrers.map((referrer, idx) => (
                      <tr key={referrer.code} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{referrer.referrer?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{referrer.referrer?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">{referrer.code}</code>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                            {referrer.referralCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {referrer.mostRecent ? format(new Date(referrer.mostRecent), 'MMM d, yyyy') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">📋 Recent Referrals</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
                className="pl-10 w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredReferrals.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                {searchTerm ? 'No matching referrals found' : 'No referrals yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">New User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Code Used</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Referred By</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral, idx) => (
                      <tr key={`${referral.newUserId}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{referral.newUserName || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{referral.newUserEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">{referral.codeUsed}</code>
                        </td>
                        <td className="py-3 px-4">
                          {referral.referredBy ? (
                            <div>
                              <p className="font-medium text-slate-900">{referral.referredBy.name}</p>
                              <p className="text-xs text-slate-500">{referral.referredBy.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unknown code owner</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {referral.date ? format(new Date(referral.date), 'MMM d, yyyy h:mm a') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}