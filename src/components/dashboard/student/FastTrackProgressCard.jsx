import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckSquare, Square, Lightbulb, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIER_DISPLAY = {
  just_getting_started: { label: 'Just Getting Started', stars: '⭐', color: 'text-slate-600' },
  building_momentum: { label: 'Building Momentum', stars: '⭐⭐', color: 'text-blue-600' },
  rising: { label: 'Rising', stars: '⭐⭐⭐', color: 'text-purple-600' },
  fast_tracked: { label: 'Fast Tracked', stars: '🏆', color: 'text-orange-600' },
};

const THRESHOLDS = {
  rising: { completed_interactions: 3, positive_feedback: 2, reliability_score: 80, follow_up_rate: 60 },
  fast_tracked: { completed_interactions: 6, positive_feedback: 5, reliability_score: 90, follow_up_rate: 80, would_refer_count: 2, weekly_activity_streak: 4 },
};

function getTip(profile, nextTier) {
  const t = THRESHOLDS[nextTier] || THRESHOLDS.fast_tracked;
  const gaps = [];
  if ((profile.follow_up_rate || 0) < (t.follow_up_rate || 60)) gaps.push({ metric: 'follow_up_rate', tip: 'Follow up within 24 hours after every conversation to boost your follow-up rate.' });
  if ((profile.reliability_score || 0) < (t.reliability_score || 80)) gaps.push({ metric: 'reliability_score', tip: "Show up to every scheduled conversation. If you can't make it, cancel in advance." });
  if ((profile.positive_feedback || 0) < (t.positive_feedback || 2)) gaps.push({ metric: 'positive_feedback', tip: 'Come prepared with questions and be professional — mentors notice the effort.' });
  if ((profile.completed_interactions || 0) < (t.completed_interactions || 3)) gaps.push({ metric: 'completed_interactions', tip: 'Schedule more conversations with professionals in your target industry.' });
  if ((profile.would_refer_count || 0) < (t.would_refer_count || 0)) gaps.push({ metric: 'would_refer_count', tip: 'Make a strong impression — professionals who\'d refer you are a huge signal.' });
  if ((profile.weekly_activity_streak || 0) < (t.weekly_activity_streak || 0)) gaps.push({ metric: 'streak', tip: 'Stay consistent — have at least one conversation every two weeks to build your streak.' });
  return gaps.length > 0 ? gaps[0].tip : "You're doing great — keep building your network!";
}

export default function FastTrackProgressCard({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    loadProfile();
  }, [user?.email]);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.FastTrackProfile.filter({ user_email: user.email });
      setProfile(profiles?.[0] || null);
    } catch (e) {
      console.log('FastTrackProfile load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!profile) return null;

  const tier = profile.current_tier || 'just_getting_started';
  const tierInfo = TIER_DISPLAY[tier] || TIER_DISPLAY.just_getting_started;
  const nextTier = tier === 'fast_tracked' ? null : tier === 'rising' ? 'fast_tracked' : tier === 'building_momentum' ? 'rising' : 'building_momentum';
  const thresholds = nextTier ? THRESHOLDS[nextTier] || THRESHOLDS.rising : null;

  const progressMax = thresholds?.completed_interactions || 6;
  const progressCurrent = Math.min(profile.completed_interactions || 0, progressMax);
  const progressPct = Math.round((progressCurrent / progressMax) * 100);

  const requirements = thresholds ? [
    { label: `${thresholds.completed_interactions}+ interactions`, current: profile.completed_interactions || 0, target: thresholds.completed_interactions, unit: `/${thresholds.completed_interactions}` },
    { label: `${thresholds.positive_feedback}+ positive feedback`, current: profile.positive_feedback || 0, target: thresholds.positive_feedback, unit: `/${thresholds.positive_feedback}` },
    { label: `${thresholds.reliability_score}%+ reliability`, current: profile.reliability_score || 0, target: thresholds.reliability_score, unit: '%', isPercent: true },
    { label: `${thresholds.follow_up_rate}%+ follow-up rate`, current: profile.follow_up_rate || 0, target: thresholds.follow_up_rate, unit: '%', isPercent: true },
    ...(thresholds.would_refer_count ? [{ label: `${thresholds.would_refer_count}+ "would refer"`, current: profile.would_refer_count || 0, target: thresholds.would_refer_count, unit: `/${thresholds.would_refer_count}` }] : []),
    ...(thresholds.weekly_activity_streak ? [{ label: `${thresholds.weekly_activity_streak}+ interaction streak`, current: profile.weekly_activity_streak || 0, target: thresholds.weekly_activity_streak, unit: `/${thresholds.weekly_activity_streak}` }] : []),
  ] : [];

  const tip = nextTier ? getTip(profile, nextTier) : null;
  const nextTierLabel = nextTier ? TIER_DISPLAY[nextTier]?.label : null;

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/50 shadow-lg overflow-hidden">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-slate-900">Your FASTIQ Progress</h3>
        </div>

        {/* Current Tier */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">{tierInfo.stars}</span>
          <div>
            <p className={`text-lg font-bold ${tierInfo.color}`}>{tierInfo.label}</p>
            {tier === 'fast_tracked' && <p className="text-sm text-green-600 font-medium">🎉 You've reached the highest tier!</p>}
          </div>
        </div>

        {/* Progress Bar */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{progressCurrent}/{progressMax} interactions</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Requirements Checklist */}
        {nextTier && requirements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">What you need for {nextTierLabel}:</p>
            <div className="space-y-1.5">
              {requirements.map((req, i) => {
                const met = req.isPercent ? req.current >= req.target : req.current >= req.target;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {met ? (
                      <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={met ? 'text-green-700' : 'text-slate-600'}>
                      {req.label}
                    </span>
                    <span className={`ml-auto text-xs font-mono ${met ? 'text-green-600' : 'text-slate-400'}`}>
                      {req.isPercent ? `${req.current}%` : `${req.current}${req.unit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contextual Tip */}
        {tip && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}