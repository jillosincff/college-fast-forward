import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const LEVEL_COLORS = {
  bronze: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  silver: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' },
  gold: { bg: '#FEF9C3', text: '#854D0E', border: '#EAB308' },
  platinum: { bg: '#E0E7FF', text: '#4338CA', border: '#6366F1' }
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

  useEffect(() => {
    loadKarmaData();
  }, [user?.id]);

  const loadKarmaData = async () => {
    try {
      const response = await base44.functions.invoke('getFamilyKarma', {});
      if (response?.data?.success) {
        setKarmaData(response.data);
      }
    } catch (err) {
      console.log('Failed to load karma:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="karma-widget loading">
        <div className="skeleton-shimmer" />
        <style jsx>{`
          .karma-widget.loading {
            background: white;
            border-radius: 16px;
            padding: 20px;
            height: 120px;
          }
          .skeleton-shimmer {
            height: 100%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!karmaData || !karmaData.family_group_id) {
    // No family group - show CTA
    return (
      <div className="karma-widget no-family">
        <div className="no-family-content">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h4>Family Karma</h4>
          <p>Connect with your family to earn karma and boost your student's questions!</p>
        </div>
        <style jsx>{`
          .karma-widget.no-family {
            background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
            border: 2px dashed #C4B5FD;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
          }
          .no-family-content h4 {
            font-size: 18px;
            font-weight: 700;
            color: #5B21B6;
            margin: 12px 0 8px;
          }
          .no-family-content p {
            font-size: 14px;
            color: #7C3AED;
            margin: 0;
          }
        `}</style>
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