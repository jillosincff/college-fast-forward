import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const LEVEL_COLORS = {
  bronze: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', gradient: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)' },
  silver: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' },
  gold: { bg: '#FEF9C3', text: '#854D0E', border: '#EAB308', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
  platinum: { bg: '#E0E7FF', text: '#4338CA', border: '#6366F1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
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
  
  // Calculate progress to next level
  let progressPercent = 100;
  if (nextLevel && nextLevel.points_needed > 0) {
    const currentInLevel = totalKarma - (nextLevel.points_needed - nextLevel.points_remaining - totalKarma);
    progressPercent = Math.min(100, ((nextLevel.points_needed - nextLevel.points_remaining) / nextLevel.points_needed) * 100);
  }

  if (compact) {
    return (
      <div className="karma-compact" style={{ background: colors.bg, borderColor: colors.border }}>
        <span className="karma-icon">{icon}</span>
        <span className="karma-value" style={{ color: colors.text }}>{totalKarma}</span>
        <span className="karma-label">karma</span>
        <style jsx>{`
          .karma-compact {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            border: 2px solid;
            font-size: 14px;
          }
          .karma-icon { font-size: 16px; }
          .karma-value { font-weight: 700; }
          .karma-label { color: #6B7280; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="karma-widget" style={{ borderColor: colors.border }}>
      {/* Header */}
      <div className="karma-header">
        <div className="karma-badge" style={{ background: colors.bg }}>
          <span className="badge-icon">{icon}</span>
          <span className="badge-level" style={{ color: colors.text }}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>
        <div className="karma-total">
          <span className="total-value">{totalKarma}</span>
          <span className="total-label">Family Karma</span>
        </div>
      </div>

      {/* Boost indicator */}
      {karmaData.boost_multiplier > 0 && (
        <div className="boost-indicator">
          <TrendingUp className="w-4 h-4" />
          <span>+{karmaData.boost_multiplier} boost active on student questions!</span>
        </div>
      )}

      {/* Progress to next level */}
      {nextLevel && nextLevel.name !== 'max' && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Progress to {nextLevel.name.charAt(0).toUpperCase() + nextLevel.name.slice(1)}</span>
            <span>{nextLevel.points_remaining} karma to go</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Recent activity */}
      {karmaData.recent_transactions?.length > 0 && (
        <div className="recent-activity">
          <h5>Recent Karma</h5>
          {karmaData.recent_transactions.slice(0, 3).map((tx, idx) => (
            <div key={idx} className="activity-item">
              <span className="activity-points">+{tx.points}</span>
              <span className="activity-desc">{tx.description || tx.action_type}</span>
            </div>
          ))}
        </div>
      )}

      {/* How to earn */}
      <div className="earn-tips">
        <h5>Earn More Karma</h5>
        <div className="tip-item">
          <span className="tip-points">+10</span>
          <span>Answer a question</span>
        </div>
        <div className="tip-item">
          <span className="tip-points">+5</span>
          <span>Get an upvote</span>
        </div>
        <div className="tip-item">
          <span className="tip-points">+50</span>
          <span>Best answer selected</span>
        </div>
        <div className="tip-item">
          <span className="tip-points">+25</span>
          <span>Refer a parent</span>
        </div>
      </div>

      <style jsx>{`
        .karma-widget {
          background: white;
          border: 2px solid;
          border-radius: 16px;
          padding: 20px;
        }

        .karma-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .karma-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 24px;
        }

        .badge-icon {
          font-size: 20px;
        }

        .badge-level {
          font-size: 16px;
          font-weight: 700;
        }

        .karma-total {
          text-align: right;
        }

        .total-value {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          display: block;
          line-height: 1;
        }

        .total-label {
          font-size: 12px;
          color: #6B7280;
        }

        .boost-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, #ECFDF5 0%, #D1FAE5 100%);
          color: #047857;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .progress-section {
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 6px;
        }

        .recent-activity {
          border-top: 1px solid #F3F4F6;
          padding-top: 16px;
          margin-bottom: 16px;
        }

        .recent-activity h5, .earn-tips h5 {
          font-size: 12px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          margin: 0 0 10px 0;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .activity-points {
          color: #10B981;
          font-weight: 700;
        }

        .activity-desc {
          color: #6B7280;
        }

        .earn-tips {
          border-top: 1px solid #F3F4F6;
          padding-top: 16px;
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .tip-points {
          background: #F0FDF4;
          color: #15803D;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
        }

        @media (max-width: 640px) {
          .karma-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .karma-total {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}