import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Medal, Crown, Users, DollarSign, 
  TrendingUp, Loader2, RefreshCw, Star, Flame
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAmbassadorLeaderboard } from '@/functions/getAmbassadorLeaderboard';

export default function AmbassadorLeaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAmbassadorLeaderboard();
      if (response.data?.success) {
        setData(response.data);
      } else {
        setError(response.data?.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>;
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
    return 'bg-white border-slate-100';
  };

  const LeaderboardRow = ({ entry, type, isCurrentUser }) => (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        isCurrentUser 
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
          : getRankBgColor(entry.rank)
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center">
          {getRankIcon(entry.rank)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{entry.name}</p>
            {entry.isFoundingCircleLead && (
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Lead
              </Badge>
            )}
            {isCurrentUser && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">You</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{entry.school}</p>
        </div>
      </div>
      <div className="text-right">
        {type === 'signups' ? (
          <>
            <p className="text-xl font-bold text-slate-900">{entry.signups}</p>
            <p className="text-xs text-slate-500">signups</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-green-600">${entry.earnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500">earned</p>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={loadLeaderboard} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Flame className="w-4 h-4" />
            Ambassador Program
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Leaderboard
          </h1>
          <p className="text-slate-600">
            Top performers in the College Fast Forward ambassador network
          </p>
        </div>

        {/* User's Ranking Card */}
        {data?.userRanking && (
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Your Ranking</p>
                    <p className="text-xl font-bold text-slate-900">
                      {data.userRanking.stats.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      #{data.userRanking.rankBySignups}
                    </p>
                    <p className="text-xs text-slate-500">by signups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      #{data.userRanking.rankByEarnings}
                    </p>
                    <p className="text-xs text-slate-500">by earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {data.userRanking.stats.signups}
                    </p>
                    <p className="text-xs text-slate-500">signups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${data.userRanking.stats.earnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">earned</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Founding Circle Leaders Section */}
        {data?.leaderboards?.foundingCircleLeads?.length > 0 && (
          <Card className="mb-8 border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Founding Circle Leaders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {data.leaderboards.foundingCircleLeads.slice(0, 5).map((entry) => (
                  <LeaderboardRow 
                    key={entry.email}
                    entry={entry}
                    type="signups"
                    isCurrentUser={entry.email === user?.email}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Leaderboard Tabs */}
        <Tabs defaultValue="signups" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top by Signups
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Top by Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signups">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Most Signups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {data?.leaderboards?.bySignups?.length > 0 ? (
                  <div className="space-y-3">
                    {data.leaderboards.bySignups.map((entry) => (
                      <LeaderboardRow 
                        key={entry.email}
                        entry={entry}
                        type="signups"
                        isCurrentUser={entry.email === user?.email}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    No ambassadors yet. Be the first!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Highest Earners
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {data?.leaderboards?.byEarnings?.length > 0 ? (
                  <div className="space-y-3">
                    {data.leaderboards.byEarnings.map((entry) => (
                      <LeaderboardRow 
                        key={entry.email}
                        entry={entry}
                        type="earnings"
                        isCurrentUser={entry.email === user?.email}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    No earnings recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>{data?.totalAmbassadors || 0} ambassadors in the network</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadLeaderboard}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}