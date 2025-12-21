import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const LEVEL_COLORS = {
  bronze: { bg: '#FEF3C7', text: 'white', border: '#8B7355', gradient: 'linear-gradient(135deg, #8B7355 0%, #6B5A44 100%)' },
  silver: { bg: '#F3F4F6', text: '#1F2937', border: '#B8B8B8', gradient: 'linear-gradient(135deg, #E8E8E8 0%, #B8B8B8 100%)' },
  gold: { bg: '#FEF9C3', text: '#1F2937', border: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
  platinum: { bg: '#E0E7FF', text: 'white', border: '#6366F1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
};

const LEVEL_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
};

export default function FamilyKarmaWidget({ user, compact = false }) {
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
    // No family group - show starter widget with 0 karma
    const level = 'bronze';
    const colors = LEVEL_COLORS[level];
    
    return (
      <div 
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background: colors.gradient }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Family Karma
          </h3>
          <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
            {LEVEL_ICONS[level]} BRONZE
          </span>
        </div>

        {/* Big Number */}
        <div className="text-center py-4 bg-white/15 rounded-xl mb-4">
          <div className="text-5xl font-bold">0</div>
          <div className="text-sm opacity-90">Karma Points</div>
        </div>

        {/* CTA */}
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔗</span>
            <span className="font-bold">Connect with your Gator!</span>
          </div>
          <p className="text-sm opacity-90">
            Link your student account to start earning karma and boost their questions in the feed!
          </p>
        </div>

        {/* Ways to Earn */}
        <div className="bg-white/15 rounded-xl p-4">
          <h4 className="font-bold text-sm mb-3">Ways to Earn Karma:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>💬 Answer a question</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+10</span>
            </div>
            <div className="flex justify-between items-center">
              <span>⬆️ Get an upvote</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>✅ Best answer selected</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+50</span>
            </div>
            <div className="flex justify-between items-center">
              <span>👥 Refer a parent</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+25</span>
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
  
  // Calculate progress to next level
  let progressPercent = 100;
  if (nextLevel && nextLevel.name !== 'max' && nextLevel.points_needed > 0) {
    const pointsEarned = nextLevel.points_needed - nextLevel.points_remaining;
    progressPercent = Math.min(100, (pointsEarned / nextLevel.points_needed) * 100);
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
      className="rounded-2xl p-6 text-white shadow-lg"
      style={{ background: colors.gradient }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Family Karma
        </h3>
        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          {icon} {level.toUpperCase()}
        </span>
      </div>

      {/* Big Number */}
      <div className="text-center py-5 bg-white/15 rounded-xl mb-4">
        <div className="text-5xl font-bold mb-1">{totalKarma}</div>
        <div className="text-sm opacity-90">Karma Points</div>
      </div>

      {/* Boost Badge */}
      <div className="bg-white/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-white/30 px-2 py-0.5 rounded-md text-sm font-bold">
            ⚡ +{boostMultiplier} Boost
          </span>
        </div>
        <p className="text-sm opacity-90">
          {boostMultiplier === 0 
            ? "Earn karma to boost your student's questions in the feed!"
            : `Your student's questions appear ${boostMultiplier}x higher in the feed!`
          }
        </p>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && nextLevel.name !== 'max' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2 opacity-90">
            <span>Next: {nextLevel.name.charAt(0).toUpperCase() + nextLevel.name.slice(1)}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs opacity-75 mt-1">
            {nextLevel.points_remaining} points to go!
          </p>
        </div>
      )}

      {nextLevel && nextLevel.name === 'max' && (
        <div className="bg-white/20 rounded-xl p-3 mb-4 text-center">
          <span className="text-lg">🎉</span>
          <span className="font-bold ml-2">MAX LEVEL REACHED!</span>
        </div>
      )}

      {/* Recent Activity */}
      {karmaData.recent_transactions?.length > 0 && (
        <div className="bg-white/15 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-sm mb-3 opacity-90">Recent Activity</h4>
          <div className="space-y-2">
            {karmaData.recent_transactions.slice(0, 3).map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="opacity-90">{getActivityLabel(tx.action_type)}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+{tx.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ways to Earn */}
      <div className="bg-white/15 rounded-xl p-4">
        <h4 className="font-bold text-sm mb-3 opacity-90">Ways to Earn Karma:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>💬 Answer a question</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+10</span>
          </div>
          <div className="flex justify-between items-center">
            <span>⬆️ Get an upvote</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+5</span>
          </div>
          <div className="flex justify-between items-center">
            <span>✅ Best answer selected</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+50</span>
          </div>
          <div className="flex justify-between items-center">
            <span>👥 Refer a parent</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">+25</span>
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