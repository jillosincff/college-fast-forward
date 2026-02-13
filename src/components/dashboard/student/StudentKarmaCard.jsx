import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const TIER_CONFIG = {
  newcomer: { label: 'Newcomer', color: '#94a3b8', emoji: '🌱', next: 15 },
  contributor: { label: 'Contributor', color: '#3b82f6', emoji: '⭐', next: 50 },
  connector: { label: 'Connector', color: '#8b5cf6', emoji: '🔗', next: 150 },
  leader: { label: 'Leader', color: '#f59e0b', emoji: '🏆', next: 500 },
  legend: { label: 'Legend', color: '#ef4444', emoji: '🐊', next: null },
};

const TIER_ORDER = ['newcomer', 'contributor', 'connector', 'leader', 'legend'];

function getNextTierThreshold(level) {
  const idx = TIER_ORDER.indexOf(level);
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
  return TIER_CONFIG[TIER_ORDER[idx + 1]]?.next || TIER_CONFIG[TIER_ORDER[idx]]?.next;
}

function getCurrentTierThreshold(level) {
  const thresholds = { newcomer: 0, contributor: 15, connector: 50, leader: 150, legend: 500 };
  return thresholds[level] || 0;
}

const QUICK_ACTIONS = [
  { label: 'Answer a question', karma: '+5', action: 'Connections' },
  { label: 'Share salary data', karma: '+25', action: 'Connections' },
  { label: 'Invite a parent', karma: '+50', action: null },
];

export default function StudentKarmaCard({ user, onInviteParent }) {
  const [karmaData, setKarmaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKarma();
  }, [user?.id]);

  const loadKarma = async () => {
    if (!user?.id) return;
    try {
      const records = await base44.entities.StudentKarma.filter({ user_id: user.id });
      if (records.length > 0) {
        setKarmaData(records[0]);
      } else {
        // Use cached user data as fallback
        setKarmaData({
          total_karma: user.student_karma || 0,
          karma_level: user.student_karma_level || 'newcomer',
          this_month_karma: 0,
        });
      }
    } catch (e) {
      console.log('Could not load student karma:', e.message);
      setKarmaData({
        total_karma: user.student_karma || 0,
        karma_level: user.student_karma_level || 'newcomer',
        this_month_karma: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const total = karmaData?.total_karma || 0;
  const level = karmaData?.karma_level || 'newcomer';
  const config = TIER_CONFIG[level] || TIER_CONFIG.newcomer;
  const currentThreshold = getCurrentTierThreshold(level);
  const nextThreshold = getNextTierThreshold(level);
  const progressPercent = nextThreshold
    ? Math.min(100, ((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;
  const pointsToNext = nextThreshold ? nextThreshold - total : 0;

  return (
    <Card className="border-2 border-slate-100 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div
          className="px-5 py-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${config.color}dd 0%, ${config.color} 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.emoji}</div>
              <div>
                <div className="text-sm font-medium opacity-80">Your Gator Karma</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {total}
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">Level</div>
              <div className="font-bold text-lg">{config.label}</div>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="px-5 py-4">
          {nextThreshold ? (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">
                  Next: {TIER_CONFIG[TIER_ORDER[TIER_ORDER.indexOf(level) + 1]]?.emoji}{' '}
                  {TIER_CONFIG[TIER_ORDER[TIER_ORDER.indexOf(level) + 1]]?.label}
                </span>
                <span className="text-slate-500 font-semibold">
                  {pointsToNext} pts to go
                </span>
              </div>
              <Progress value={progressPercent} className="h-2.5" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{currentThreshold}</span>
                <span>{nextThreshold}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-600 font-semibold">🎉 Max level reached!</p>
              <p className="text-sm text-slate-400">You're a Gator Legend</p>
            </div>
          )}

          {/* Quick earn actions */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Quick ways to earn
            </p>
            {QUICK_ACTIONS.map((qa, i) => (
              <button
                key={i}
                onClick={() => {
                  if (qa.action === null && onInviteParent) {
                    onInviteParent();
                  } else if (qa.action) {
                    navigate(qa.action);
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {qa.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {qa.karma}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </button>
            ))}
          </div>

          {/* Monthly stat */}
          {(karmaData?.this_month_karma || 0) > 0 && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                +{karmaData.this_month_karma} karma this month
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}