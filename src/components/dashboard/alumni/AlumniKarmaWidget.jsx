import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LEVEL_COLORS = {
  bronze: { gradient: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)' },
  silver: { gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' },
  gold: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  platinum: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
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

export default function AlumniKarmaWidget({ user, compact = false }) {
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
      if (response?.data?.success) {
        setKarmaData(response.data);
      } else {
        // Use user's direct karma if no family karma
        setKarmaData({
          total_karma: user?.karma_points || user?.karma_earned || 0,
          karma_level: 'bronze'
        });
      }
    } catch (err) {
      console.log('Failed to load karma:', err);
      // Fallback to user's direct karma
      setKarmaData({
        total_karma: user?.karma_points || user?.karma_earned || 0,
        karma_level: 'bronze'
      });
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

  const totalKarma = karmaData?.total_karma || user?.karma_points || user?.karma_earned || 0;
  const level = totalKarma >= 500 ? 'platinum' : totalKarma >= 150 ? 'gold' : totalKarma >= 50 ? 'silver' : 'bronze';
  const colors = LEVEL_COLORS[level];
  const icon = LEVEL_ICONS[level];
  const threshold = LEVEL_THRESHOLDS[level];
  
  // Calculate progress to next level
  const nextLevel = level === 'bronze' ? 'silver' : level === 'silver' ? 'gold' : level === 'gold' ? 'platinum' : null;
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel].min : threshold.max;
  const progressPercent = nextLevel ? Math.min(100, ((totalKarma - threshold.min) / (nextThreshold - threshold.min)) * 100) : 100;
  const pointsToNext = nextLevel ? Math.max(0, nextThreshold - totalKarma) : 0;

  if (compact) {
    return (
      <div 
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white"
        style={{ background: colors.gradient }}
      >
        <span>{icon}</span>
        <span className="font-bold">{totalKarma}</span>
        <span className="opacity-80">karma</span>
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
            Your Karma
          </h3>
          <span className="text-sm font-bold bg-white/25 backdrop-blur px-3 py-1 rounded-full text-white">
            {icon} {level.toUpperCase()}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Left: Karma Points */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-5 flex flex-col justify-center">
            <div className="text-5xl font-bold mb-1 text-center text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{totalKarma}</div>
            <div className="text-sm font-semibold text-center mb-3 text-white/90">Karma Points</div>
            
            {/* Progress to Next Level */}
            {nextLevel ? (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1 text-white/80">
                  <span>Progress to {nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}</span>
                  <span>{totalKarma}/{nextThreshold}</span>
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

          {/* Right: Ways to Earn Points */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-4">
            <h4 className="font-bold text-xs mb-2 text-white">Ways to Earn Points:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">💬 Answer a student question</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+10</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">⬆️ Get upvoted by community</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+5</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">✅ Marked "Best" by student</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+50</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/20">
              <p className="text-[11px] text-white font-semibold text-center">
                📌 Higher karma = more visibility for YOUR career requests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}