import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Users, MessageSquare, Zap, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';

// Parse match reasons to extract key stats
function parseMatchStats(reasons = []) {
  const stats = {
    isFastResponder: false,
    responseTime: null,
    studentsHelped: null,
    isSuperHelper: false,
    isRecentlyActive: false,
    isUrgentMatch: false,
    experience: null
  };
  
  for (const reason of reasons) {
    if (reason.includes('⚡') || reason.includes('Fast') || reason.toLowerCase().includes('responds within')) {
      stats.isFastResponder = true;
      if (reason.includes('hours')) stats.responseTime = 'hours';
      else if (reason.includes('24h')) stats.responseTime = '24h';
    }
    if (reason.includes('💨')) stats.responseTime = 'hours';
    if (reason.includes('Helped')) {
      const match = reason.match(/(\d+)\s*students/);
      if (match) stats.studentsHelped = parseInt(match[1]);
    }
    if (reason.includes('🌟') || reason.includes('Top-rated')) stats.isSuperHelper = true;
    if (reason.includes('Recently active')) stats.isRecentlyActive = true;
    if (reason.includes('🚨') || reason.includes('urgent')) stats.isUrgentMatch = true;
    if (reason.includes('years experience')) {
      const match = reason.match(/(\d+\+?)\s*years/);
      if (match) stats.experience = match[1];
    }
  }
  
  return stats;
}

function MatchCard({ match, user }) {
  const stats = parseMatchStats(match.match_reasons || []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-5 border-2 transition-all ${
        stats.isSuperHelper 
          ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-br from-white to-amber-50' 
          : 'border-slate-200 hover:border-blue-300'
      } hover:shadow-lg`}
    >
      {/* Super Helper Banner */}
      {stats.isSuperHelper && (
        <div className="mb-3 -mx-5 -mt-5 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold rounded-t-xl flex items-center gap-2">
          <Star className="w-4 h-4 fill-white" /> Top-Rated Helper
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="relative">
          <UserAvatar 
            user={{ full_name: match.parent_name, email: match.parent_email }}
            className="w-16 h-16 rounded-full flex-shrink-0"
            showFallback={true}
          />
          {stats.isRecentlyActive && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Recently active" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-lg">{match.parent_name || 'Gator Parent'}</h4>
          </div>
          <p className="text-sm text-slate-600">
            {match.parent_role || 'Professional'} {match.parent_company && `at ${match.parent_company}`}
          </p>
          
          {/* Badges row */}
          <div className="mt-2 flex flex-wrap gap-2">
            {/* Match percentage */}
            {match.match_percentage && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                🎯 {match.match_percentage}% match
              </span>
            )}
            
            {/* Fast Responder Badge */}
            {stats.isFastResponder && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                <Zap className="w-3 h-3" /> 
                {stats.responseTime === 'hours' ? 'Responds in hours' : 'Fast Responder'}
              </span>
            )}
            
            {/* Students Helped Badge */}
            {stats.studentsHelped && stats.studentsHelped >= 5 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> Helped {stats.studentsHelped}+ students
              </span>
            )}
            
            {/* Urgent Match Badge */}
            {stats.isUrgentMatch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
                🚨 Available for urgent help
              </span>
            )}
            
            {/* Experience Badge */}
            {stats.experience && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" /> {stats.experience} years exp
              </span>
            )}
          </div>

          {/* Match reasons */}
          {match.match_reasons && match.match_reasons.length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 mb-2">Why this is a great match:</p>
              <ul className="space-y-1">
                {match.match_reasons
                  .filter(r => !r.includes('🌟'))
                  .slice(0, 4)
                  .map((reason, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {reason}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => navigate(`MessageComposer?recipient=${match.parent_id}`)}
          className="flex-1 h-12 text-base font-semibold bg-[#FA4616] hover:bg-orange-600 text-white"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Message {match.parent_name?.split(' ')[0] || 'them'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`PublicProfile?id=${match.parent_id}`)}
          className="text-slate-600"
        >
          View Profile
        </Button>
      </div>
    </motion.div>
  );
}

export default function MyMatches() {
  const { user, isLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('LandingPage');
      return;
    }
    if (user) {
      loadMatches();
    }
  }, [user, isLoading]);

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      // Try multiple strategies to get matches
      let studentMatches = [];
      
      // Strategy 1: By student_email
      studentMatches = await base44.entities.Match.filter(
        { student_email: user.email },
        '-match_score',
        100
      );
      
      // Strategy 2: By student_id if no results
      if (!studentMatches || studentMatches.length === 0) {
        studentMatches = await base44.entities.Match.filter(
          { student_id: user.id },
          '-match_score',
          100
        );
      }
      
      // Filter to active matches only
      const activeMatches = (studentMatches || []).filter(m => 
        m.status === 'pending' || m.status === 'student_connected'
      );
      
      setMatches(activeMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (isLoading || loadingMatches) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  // Sort matches
  const sortedMatches = [...matches].sort((a, b) => {
    const aSuper = a.match_reasons?.some(r => r.includes('🌟')) ? 1 : 0;
    const bSuper = b.match_reasons?.some(r => r.includes('🌟')) ? 1 : 0;
    if (bSuper !== aSuper) return bSuper - aSuper;
    return (b.match_score || 0) - (a.match_score || 0);
  });

  // Filter matches
  const filteredMatches = sortedMatches.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'fast') {
      return m.match_reasons?.some(r => 
        r.includes('⚡') || r.includes('Fast') || r.includes('responds within hours') || r.includes('💨')
      );
    }
    if (filter === 'experienced') {
      return m.match_reasons?.some(r => r.includes('15') || r.includes('20+'));
    }
    return true;
  });

  const fastResponderCount = sortedMatches.filter(m => 
    m.match_reasons?.some(r => r.includes('⚡') || r.includes('💨'))
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 pb-8">
      {/* Header */}
      <div className="bg-[#0021A5] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('Dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Matches ({matches.length})</h1>
              <p className="text-white/80">Based on what you're looking for, these people can help.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Matches ({sortedMatches.length})
          </button>
          {fastResponderCount > 0 && (
            <button
              onClick={() => setFilter('fast')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'fast' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Zap className="w-3 h-3" /> Fast Responders ({fastResponderCount})
            </button>
          )}
          <button
            onClick={() => setFilter('experienced')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              filter === 'experienced' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Most Experienced
          </button>
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard match={match} user={user} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-slate-200">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No matches found</h3>
              <p className="text-slate-500 mb-4">
                {filter !== 'all' 
                  ? "Try adjusting your filter to see more matches."
                  : "Post a question to get matched with parents and alumni who can help!"}
              </p>
              {filter !== 'all' ? (
                <Button onClick={() => setFilter('all')} variant="outline">
                  Show All Matches
                </Button>
              ) : (
                <Button onClick={() => navigate('PostRequest')} className="bg-[#FA4616] hover:bg-orange-600">
                  Post a Question
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}