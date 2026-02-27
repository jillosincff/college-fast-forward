import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

// NEW tier colors matching spec
const TIER_STYLES = {
  none: { 
    gradient: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)',
    label: 'Getting Started',
    icon: '📊'
  },
  active: { 
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    label: 'Active Family',
    icon: '⭐'
  },
  engaged: { 
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    label: 'Engaged Family',
    icon: '⭐⭐'
  },
  priority: { 
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    label: 'Priority Family',
    icon: '🌟'
  },
  champion: { 
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    label: 'Champion Family',
    icon: '🏆'
  }
};

// NEW tier thresholds matching spec
const TIER_THRESHOLDS = {
  none: { min: 0, max: 100 },
  active: { min: 100, max: 300 },
  engaged: { min: 300, max: 500 },
  priority: { min: 500, max: 1000 },
  champion: { min: 1000, max: Infinity }
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

  const rawLevel = karmaData?.karma_level || 'none';
  const level = rawLevel || 'none';
  const tierStyle = TIER_STYLES[level] || TIER_STYLES.none;
  const totalKarma = karmaData?.total_karma || 0;
  const nextLevel = karmaData?.next_level;
  const boostMultiplier = karmaData?.boost_multiplier || 0;
  const threshold = TIER_THRESHOLDS[level] || TIER_THRESHOLDS.none;
  
  // Check for expiring boost
  const boostExpiresAt = karmaData?.boost_expires_at ? new Date(karmaData.boost_expires_at) : null;
  const now = new Date();
  const hoursUntilExpiry = boostExpiresAt ? Math.max(0, Math.floor((boostExpiresAt - now) / (1000 * 60 * 60))) : null;
  const isBoostExpiringSoon = hoursUntilExpiry !== null && hoursUntilExpiry > 0 && hoursUntilExpiry <= 12;
  
  // Multi-student support
  const linkedStudents = karmaData?.linked_students || [];
  const linkedStudentsText = karmaData?.linked_students_text || 'your students';
  const studentCount = karmaData?.linked_students_count || 0;
  const unlockedBenefits = karmaData?.unlocked_benefits || [];
  const lockedBenefits = karmaData?.locked_benefits || [];
  
  // Calculate progress to next level
  let progressPercent = 100;
  let pointsToNext = 0;
  if (nextLevel && nextLevel.name !== 'max' && nextLevel.points_needed > 0) {
    const pointsEarned = nextLevel.points_needed - nextLevel.points_remaining;
    progressPercent = Math.min(100, (pointsEarned / nextLevel.points_needed) * 100);
    pointsToNext = nextLevel.points_remaining;
  }

  // Compact badge view
  if (compact) {
    if (level === 'none' || totalKarma < 100) return null;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}
      >
        <span>{tierStyle.icon}</span>
        <span>{tierStyle.label}</span>
      </span>
    );
  }

  // No family group yet
  if (!karmaData || !karmaData.family_group_id) {
    return (
      <div 
        className="rounded-2xl p-6 shadow-xl relative overflow-hidden text-white"
        style={{ background: TIER_STYLES.none.gradient }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-white" />
              Family Karma
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/15 backdrop-blur rounded-xl p-5 flex flex-col justify-center">
              <div className="text-5xl font-bold mb-1 text-center text-white">0</div>
              <div className="text-sm font-semibold text-center mb-3 text-white/90">Karma Points</div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1 text-white/80">
                  <span>Progress to Active</span>
                  <span>0/100</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur rounded-xl p-4">
              <h4 className="font-bold text-xs mb-2 text-white">Ways to Earn Points:</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                  <span className="text-white">💬 Answer a question</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+15</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                  <span className="text-white">💰 Share salary data</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+25</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                  <span className="text-white">🎤 Share interview Qs</span>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+15</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/20">
                <p className="text-[11px] text-white font-semibold text-center">
                  📌 Your karma boosts your student's visibility to other helpers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur border border-white/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔗</span>
              <span className="font-bold text-sm text-white">Connect with your student!</span>
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

  // Full widget with family data
  return (
    <div 
      className="rounded-2xl p-6 shadow-xl relative overflow-hidden text-white"
      style={{ background: tierStyle.gradient }}
    >
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-white" />
            Family Karma
          </h3>
          <span className="text-sm font-bold bg-white/25 backdrop-blur px-3 py-1 rounded-full text-white">
            {tierStyle.icon} {tierStyle.label.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/15 backdrop-blur rounded-xl p-5 flex flex-col justify-center">
            <div className="text-5xl font-bold mb-1 text-center text-white">{totalKarma}</div>
            <div className="text-sm font-semibold text-center mb-3 text-white/90">Karma Points</div>
            
            {boostMultiplier > 0 && (
              <div className="flex justify-center mb-3">
                <span className="bg-white/25 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white">
                  ⚡ +{boostMultiplier} Boost Active
                </span>
              </div>
            )}
            
            {nextLevel && nextLevel.name !== 'max' ? (
              <div>
                <div className="flex justify-between text-xs mb-1 text-white/80">
                  <span>Progress to {nextLevel.name.charAt(0).toUpperCase() + nextLevel.name.slice(1)}</span>
                  <span>{totalKarma}/{nextLevel.threshold}</span>
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

          <div className="bg-white/15 backdrop-blur rounded-xl p-4">
            <h4 className="font-bold text-xs mb-2 text-white">Ways to Earn Points:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">💬 Answer a question</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+15</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">💰 Share salary data</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+25</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-2 py-1.5">
                <span className="text-white">✅ Best answer</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold text-white">+25</span>
              </div>
            </div>
            
            {karmaData.recent_transactions?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <h4 className="font-bold text-xs mb-1.5 text-white">Recent:</h4>
                {karmaData.recent_transactions.slice(0, 2).map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs mb-1">
                    <span className="truncate text-white">{tx.description}</span>
                    <span className="bg-white/25 px-2 py-0.5 rounded-full font-bold ml-2 text-white">+{tx.points}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Boost status */}
            {isBoostExpiringSoon ? (
              <div className="mt-3 pt-2 border-t border-white/20">
                <p className="text-[11px] text-white font-bold text-center animate-pulse">
                  ⚠️ {linkedStudentsText}'s boost expires in {hoursUntilExpiry}h — answer a question to extend!
                </p>
              </div>
            ) : boostMultiplier > 0 && studentCount > 0 ? (
              <div className="mt-3 pt-2 border-t border-white/20">
                <p className="text-[11px] text-white font-bold text-center">
                  ⚡ Family Karma Active — boosting {linkedStudentsText}'s requests!
                </p>
              </div>
            ) : (
              <div className="mt-3 pt-2 border-t border-white/20">
                <p className="text-[11px] text-white font-semibold text-center">
                  📌 Your karma boosts your student's visibility to other helpers.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('Connections?tab=questions')}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          >
            Answer Questions
          </button>
          <button
            onClick={() => navigate('Connections?tab=salaries')}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          >
            Add Salary Data
          </button>
          <button
            onClick={() => navigate('Connections?tab=interviews')}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          >
            Share Interview Qs
          </button>
        </div>
      </div>
    </div>
  );
}