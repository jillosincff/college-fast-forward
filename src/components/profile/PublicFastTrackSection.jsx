import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const ATTR_LABELS = {
  came_prepared: 'Came prepared',
  asked_great_questions: 'Great questions',
  strong_communicator: 'Strong communicator',
  professional_demeanor: 'Professional',
  followed_up: 'Follows up',
  would_refer: 'Would refer',
  would_hire: 'Would hire',
};

export default function PublicFastTrackSection({ profileUserId, profileEmail }) {
  const [badges, setBadges] = useState([]);
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [topAttrs, setTopAttrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileUserId && !profileEmail) return;
    loadData();
  }, [profileUserId, profileEmail]);

  const loadData = async () => {
    try {
      const [badgeResult, profileResult, feedbackResult] = await Promise.all([
        profileUserId ? base44.entities.UserBadge.filter({ user_id: profileUserId }) : Promise.resolve([]),
        profileEmail ? base44.entities.FastTrackProfile.filter({ user_email: profileEmail }) : Promise.resolve([]),
        profileEmail ? base44.entities.InteractionFeedback.filter({ student_email: profileEmail }, '-created_date', 50) : Promise.resolve([]),
      ]);

      setBadges(badgeResult || []);
      setProfile(profileResult?.[0] || null);

      const visibleFb = (feedbackResult || []).filter(f => f.feedback_visible !== false);
      setFeedback(visibleFb);

      // Count attribute frequency
      const attrCounts = {};
      visibleFb.forEach(f => {
        (f.positive_attributes || []).forEach(a => {
          attrCounts[a] = (attrCounts[a] || 0) + 1;
        });
      });
      const sorted = Object.entries(attrCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      setTopAttrs(sorted.map(([attr]) => attr));
    } catch (e) {
      console.log('PublicFastTrackSection load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const hasFastTracked = badges.some(b => b.badge_type === 'fast_tracked');
  const hasRisingStar = badges.some(b => b.badge_type === 'rising_star');
  const completedCount = profile?.completed_interactions || 0;
  const wouldReferCount = profile?.would_refer_count || 0;

  // Only show if student has at least 1 completed interaction or a badge
  if (completedCount === 0 && !hasFastTracked && !hasRisingStar) return null;

  // Best quotes (anonymized, visible only)
  const quotes = feedback
    .filter(f => f.open_feedback && f.open_feedback.trim().length > 15)
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          ⚡ Professional Network Activity
        </h2>

        {/* Badges */}
        {(hasFastTracked || hasRisingStar) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hasFastTracked && (
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm px-3 py-1">
                🏆 Fast Tracked
              </Badge>
            )}
            {hasRisingStar && !hasFastTracked && (
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm px-3 py-1">
                ⭐ Rising Star
              </Badge>
            )}
          </div>
        )}

        {/* Stats summary */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
          {completedCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-900">{completedCount}</span> professional conversation{completedCount !== 1 ? 's' : ''}
            </span>
          )}
          {wouldReferCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-900">{wouldReferCount}</span> professional{wouldReferCount !== 1 ? 's' : ''} would refer
            </span>
          )}
        </div>

        {/* Top Attributes */}
        {topAttrs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Top attributes from professionals:</p>
            <div className="flex flex-wrap gap-1.5">
              {topAttrs.map((attr, i) => (
                <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {ATTR_LABELS[attr] || attr.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <div key={i} className="border-l-2 border-blue-200 pl-3">
                <p className="text-sm text-slate-700 italic">"{q.open_feedback}"</p>
                <p className="text-xs text-slate-400 mt-1">
                  — Professional{q.reviewer_title ? ` in ${q.reviewer_title}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}