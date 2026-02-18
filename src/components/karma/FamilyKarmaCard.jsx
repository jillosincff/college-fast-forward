import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

// Tier colors
const TIER_STYLES = {
  none: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: '📊', gradient: 'from-slate-100 to-slate-200', darkText: true },
  active: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '⭐', gradient: 'from-blue-500 to-blue-600' },
  engaged: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '⭐⭐', gradient: 'from-purple-500 to-purple-600' },
  priority: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '🌟', gradient: 'from-amber-500 to-orange-500' },
  champion: { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: '🏆', gradient: 'from-orange-500 to-red-500' }
};

const TIER_LABELS = {
  none: 'Getting Started',
  active: 'Active Family',
  engaged: 'Engaged Family',
  priority: 'Priority Family',
  champion: 'Champion Family'
};

export default function FamilyKarmaCard({ user, childName, viewMode = 'parent' }) {
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <div className="text-center">
          <p className="text-red-500 mb-3 text-sm">Unable to load karma data</p>
          <Button variant="outline" size="sm" onClick={loadKarmaData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const karma = karmaData?.total_karma || 0;
  const level = karmaData?.karma_level || 'none';
  const nextTier = karmaData?.next_level;
  const pointsToNext = nextTier?.points_remaining || 0;
  const progressPercent = nextTier?.points_needed > 0 ? ((nextTier.points_needed - pointsToNext) / nextTier.points_needed) * 100 : 100;
  const unlockedBenefits = karmaData?.unlocked_benefits || [];
  const lockedBenefits = karmaData?.locked_benefits || [];
  const recentKarma = karmaData?.recent_transactions || [];
  const linkedStudents = karmaData?.linked_students || [];
  const linkedStudentsText = karmaData?.linked_students_text || 'your students';
  const percentile = karmaData?.karma_percentile || 0;
  const familyContributions = karmaData?.family_contributions || [];

  const tierStyle = TIER_STYLES[level] || TIER_STYLES.none;
  const displayChildName = childName || linkedStudents[0]?.first_name || 'your student';

  // Determine if this is a parent or alumni helper
  const isParentUser = user?.persona === 'parent';

  // PARENT / ALUMNI HELPER VIEW
  if (viewMode === 'parent') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <span>{isParentUser ? '👨‍👩‍👧' : '⭐'}</span>
          {isParentUser ? 'Family Karma' : 'Karma'}
        </h2>
        
        {/* Karma Score + Progress */}
        <div className={`bg-gradient-to-r ${tierStyle.gradient} rounded-lg p-4 mb-4 ${tierStyle.darkText ? 'text-slate-700' : 'text-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold">{karma} pts</span>
            {nextTier?.name !== 'max' && (
              <span className={`text-sm font-semibold ${tierStyle.darkText ? 'text-slate-600' : 'text-white'}`}>→ {nextTier?.threshold} for {TIER_LABELS[nextTier?.name]}</span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          
          {pointsToNext > 0 && pointsToNext <= 100 && (
            <p className="text-sm mt-2 flex items-center gap-1 opacity-95">
              <span>🎯</span>
              {pointsToNext} more points to unlock {nextTier?.benefit} for {displayChildName}
            </p>
          )}
        </div>
        
        {/* Benefits */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {isParentUser ? `How your karma helps ${displayChildName}:` : 'How your karma helps students:'}
          </p>
          <div className="space-y-1">
            {unlockedBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
                <span>✅</span>
                {benefit.benefit}
              </div>
            ))}
            {lockedBenefits.slice(0, 2).map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                {benefit.benefit} (unlock at {benefit.threshold} pts)
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent karma */}
        {recentKarma.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Karma Earned:</p>
            <div className="space-y-2">
              {recentKarma.slice(0, 3).map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">+{event.points}</span>
                    <span className="text-gray-600">{event.description}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{formatTimeAgo(event.created_date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick actions */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <span>⚡</span>
            Quick ways to earn karma:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('Connections?tab=questions')}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
            >
              Answer Questions (+15)
            </button>
            <button
              onClick={() => navigate('Connections?tab=salaries')}
              className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium"
            >
              Add Salary Data (+25)
            </button>
            <button
              onClick={() => navigate('Connections?tab=interviews')}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium"
            >
              Share Interview Qs (+15)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is a student or alumni seeker
  const isAlumniSeekerView = user?.persona === 'alumni';

  // STUDENT / ALUMNI SEEKER VIEW
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <span>{isAlumniSeekerView ? '⭐' : '👨‍👩‍👧'}</span>
        {isAlumniSeekerView ? 'Your Karma' : "Your Family's Karma"}
      </h2>
      
      {/* Score + Percentile */}
      <div className={`bg-gradient-to-r ${tierStyle.gradient} rounded-lg p-4 mb-4 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold">{karma} pts</span>
          {percentile >= 50 && (
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              Top {100 - percentile}% 🎉
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.min((karma / 1000) * 100, 100)}%` }}
          />
        </div>
        
        <p className="text-sm opacity-90">
          {isAlumniSeekerView 
            ? `Your contributions put you ahead of ${percentile}% of users`
            : `Your family's activity puts you ahead of ${percentile}% of students`}
        </p>
      </div>
      
      {/* Benefits */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">What this means for you:</p>
        <div className="space-y-1">
          {unlockedBenefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
              <span>✅</span>
              {getStudentBenefitLabel(benefit.name)}
            </div>
          ))}
          {pointsToNext > 0 && pointsToNext <= 50 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Lock className="w-3.5 h-3.5" />
              {pointsToNext} pts away from {nextTier?.benefit}
            </div>
          )}
        </div>
      </div>
      
      {/* Family contributions */}
      {familyContributions.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Your family earned karma by:</p>
          <div className="space-y-2">
            {familyContributions.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {member.name?.charAt(0) || 'P'}
                  </div>
                  <span className="text-sm text-gray-600">
                    {member.relation} {member.karma_description}
                  </span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  +{member.karma_earned_this_month} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* CTA to share with family */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <span>💡</span>
          Want to boost your visibility?
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Your family can earn more karma by answering questions, sharing salary data, or submitting interview questions.
        </p>
        <button
          onClick={() => navigate('GatorParentInvite')}
          className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
        >
          Share Link with Family →
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getStudentBenefitLabel(tierName) {
  const labels = {
    active: '"Active Family" badge on your profile — parents notice you',
    engaged: 'You appear higher in match results',
    priority: 'Priority placement — you show up first',
    champion: 'Featured status — top visibility'
  };
  return labels[tierName] || '';
}