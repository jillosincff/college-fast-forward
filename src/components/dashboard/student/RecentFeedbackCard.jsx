import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ATTR_LABELS = {
  came_prepared: 'Came prepared',
  asked_great_questions: 'Asked great questions',
  strong_communicator: 'Strong communicator',
  professional_demeanor: 'Professional demeanor',
  followed_up: 'Followed up',
  would_refer: "Would refer",
  would_hire: "Would hire",
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function RecentFeedbackCard({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    loadFeedback();
  }, [user?.email]);

  const loadFeedback = async () => {
    try {
      const all = await base44.entities.InteractionFeedback.filter(
        { student_email: user.email },
        '-created_date',
        10
      );
      // Only show visible feedback
      const visible = (all || []).filter(f => f.feedback_visible !== false);
      setFeedback(visible.slice(0, 5));
    } catch (e) {
      console.log('Feedback load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || feedback.length === 0) return null;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-900">Recent Feedback</h3>
        </div>

        <div className="space-y-4">
          {feedback.map((fb, i) => {
            const positiveAttrs = (fb.positive_attributes || []).filter(a => !['would_refer', 'would_hire'].includes(a));
            const hasOpenText = fb.open_feedback && fb.open_feedback.trim().length > 0;

            return (
              <div key={fb.id || i} className="border-l-2 border-blue-200 pl-4">
                {hasOpenText && (
                  <p className="text-slate-700 italic text-sm mb-1">"{fb.open_feedback}"</p>
                )}
                {positiveAttrs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {positiveAttrs.map((attr, j) => (
                      <Badge key={j} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {ATTR_LABELS[attr] || attr.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400">
                  — Professional{fb.reviewer_title ? ` in ${fb.reviewer_title}` : ''} | {timeAgo(fb.created_date)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}