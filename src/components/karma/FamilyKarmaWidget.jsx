import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const LEVEL_COLORS = {
  bronze: { bg: '#E8EDFF', text: 'white', border: '#0021A5', gradient: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)' },
  silver: { bg: '#F3F4F6', text: '#1F2937', border: '#B8B8B8', gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' },
  gold: { bg: '#FEF9C3', text: '#1F2937', border: '#FFD700', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  platinum: { bg: '#E0E7FF', text: 'white', border: '#6366F1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
};

const LEVEL_THRESHOLDS = {
  bronze: { min: 0, max: 50 },
  silver: { min: 50, max: 150 },
  gold: { min: 150, max: 500 },
  platinum: { min: 500, max: Infinity }
};

const LEVEL_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
};

export default function FamilyKarmaWidget({ user, compact = false, onSearchStudent, onInviteStudent }) {
  const [karmaData, setKarmaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadKarmaData();
  }, [user?.id]);

  const loadKarmaData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('getFamilyKarma', {});
      console.log('Karma response:', response?.data);
      if (response?.data?.success) {
        setKarmaData(response.data);
      } else {
        setError('Failed to load karma data');
      }
    } catch (err) {
      console.log('Failed to load karma:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
        <div className="text-center">
          <p className="text-red-500 mb-3">Unable to load karma data</p>
          <Button variant="outline" size="sm" onClick={loadKarmaData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!karmaData || !karmaData.family_group_id) {
    // No family group - show starter widget with connect CTA (COMPACT LAYOUT)
    const level = 'bronze';
    const colors = LEVEL_COLORS[level];
    const threshold = LEVEL_THRESHOLDS[level];
    
    return (
      <div 
        className="rounded-2xl p-6 shadow-xl relative overflow-hidden text-white"
        style={{ background: colors.gradient }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-white" />
              Family Karma
            </h3>
            <span className="text-sm font-bold bg-white/25 backdrop-blur px-3 py-1 rounded-full text-white">
              {LEVEL_ICONS[level]} BRONZE
            </span>
          </div>

          {/* COMPACT: Two-column layout - Points LEFT, Ways to Earn RIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Left: Karma Points */}
            <div className="bg-white/15 backdrop-blur rounded-xl p-5 flex flex-col justify-center">
              <div className="text-5xl font-bold mb-1 text-center text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>0</div>
              <div className="text-sm font-semibold text-center mb-3 text-white/90">Karma Points</div>
              
              {/* Progress to Silver */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1 text-white/80">
                  <span>Progress to Silver</span>
                  <span>0/{threshold.max}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Right: Ways to Earn */}
            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <h4 className="font-bold text-xs mb-2 text-white/90">Ways to Earn:</h4>
              <div className="space-y-1.5 text-xs text-white/95">
                <div className="flex justify-between items-center">
                  <span>💬 Answer a question</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>⬆️ Get an upvote</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✅ Best answer selected</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>👥 Refer a parent</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connect CTA - More Compact */}
          <div className="bg-white/20 backdrop-blur border border-white/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔗</span>
              <span className="font-bold text-sm text-white">Connect with your Gator!</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={onSearchStudent}
                size="sm"
                className="flex-1 bg-white/30 hover:bg-white/40 text-white border border-white/40 font-bold text-xs"
              >
                Search & Link Student
              </Button>
              <Button 
                onClick={onInviteStudent}
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent hover:bg-white/20 text-white border border-white/40 font-bold text-xs"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const level = karmaData.karma_level || 'bronze';
  const colors = LEVEL_COLORS[level];
  const icon = LEVEL_ICONS[level];
  const totalKarma = karmaData.total_karma || 0;
  const nextLevel = karmaData.next_level;
  const boostMultiplier = karmaData.boost_multiplier || 0;
  const threshold = LEVEL_THRESHOLDS[level];
  
  // Calculate progress to next level
  let progressPercent = 100;
  let pointsToNext = 0;
  if (nextLevel && nextLevel.name !== 'max' && nextLevel.points_needed > 0) {
    const pointsEarned = nextLevel.points_needed - nextLevel.points_remaining;
    progressPercent = Math.min(100, (pointsEarned / nextLevel.points_needed) * 100);
    pointsToNext = nextLevel.points_remaining;
  }

  if (compact) {
    return (
      <div 
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm"
        style={{ background: colors.bg, borderColor: colors.border }}
      >
        <span>{icon}</span>
        <span className="font-bold" style={{ color: colors.text }}>{totalKarma}</span>
        <span className="text-slate-500">karma</span>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl p-6 shadow-xl relative overflow-hidden text-white"
      style={{ background: colors.gradient }}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-white" />
            Family Karma
          </h3>
          <span className="text-sm font-bold bg-white/25 backdrop-blur px-3 py-1 rounded-full text-white">
            {icon} {level.toUpperCase()}
          </span>
        </div>

        {/* COMPACT: Two-column layout - Points LEFT, Ways to Earn RIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Left: Karma Points + Progress */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-5 flex flex-col justify-center">
            <div className="text-5xl font-bold mb-1 text-center text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{totalKarma}</div>
            <div className="text-sm font-semibold text-center mb-3 text-white/90">Karma Points</div>
            
            {/* Boost Badge - Inline */}
            <div className="flex justify-center mb-3">
              <span className="bg-white/25 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white">
                ⚡ +{boostMultiplier} Boost
              </span>
            </div>
            
            {/* Progress to Next Level */}
            {nextLevel && nextLevel.name !== 'max' ? (
              <div>
                <div className="flex justify-between text-xs mb-1 text-white/80">
                  <span>Progress to {nextLevel.name.charAt(0).toUpperCase() + nextLevel.name.slice(1)}</span>
                  <span>{totalKarma}/{threshold.max}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs mt-1 text-center text-white/75">{pointsToNext} points to go!</p>
              </div>
            ) : (
              <div className="text-center text-xs text-white">
                <span>🎉</span> <span className="font-bold">MAX LEVEL!</span>
              </div>
            )}
          </div>

          {/* Right: Ways to Earn */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-4">
            <h4 className="font-bold text-xs mb-2 text-white/90">Ways to Earn:</h4>
            <div className="space-y-1.5 text-xs text-white/95">
              <div className="flex justify-between items-center">
                <span>💬 Answer a question</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+10</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⬆️ Get an upvote</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✅ Best answer selected</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+50</span>
              </div>
              <div className="flex justify-between items-center">
                <span>👥 Refer a parent</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+25</span>
              </div>
            </div>
            
            {/* Recent Activity - Compact */}
            {karmaData.recent_transactions?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <h4 className="font-bold text-xs mb-1.5 text-white/90">Recent:</h4>
                {karmaData.recent_transactions.slice(0, 2).map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs mb-1 text-white/90">
                    <span className="truncate">{getActivityLabel(tx.action_type)}</span>
                    <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold ml-2 text-white">+{tx.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getActivityLabel(actionType) {
  const labels = {
    'answer': '💬 Answered question',
    'upvote_received': '⬆️ Answer upvoted',
    'best_answer': '✅ Best answer',
    'referral': '👥 Referred parent'
  };
  return labels[actionType] || actionType;
}