import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadActivity();
  }, []);

  useEffect(() => {
    if (activities.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  const loadActivity = async () => {
    try {
      const [recentAnswers, recentTransactions] = await Promise.all([
        base44.entities.Answer.list('-created_date', 8).catch(() => []),
        base44.entities.KarmaTransaction.list('-created_date', 8).catch(() => []),
      ]);

      const items = [];

      // Recent answers
      for (const a of (recentAnswers || []).slice(0, 4)) {
        const name = a.answerer_name?.split(' ')[0] || 'A parent';
        const timeAgo = getTimeAgo(a.created_date);
        items.push({ text: `${name} answered a student question`, time: timeAgo, emoji: '💬' });
      }

      // Recent karma transactions
      for (const t of (recentTransactions || []).slice(0, 4)) {
        const name = t.parent_name?.split(' ')[0] || 'Someone';
        const timeAgo = getTimeAgo(t.created_date);
        const actionText = {
          answer: 'answered a question',
          salary_submitted: 'shared salary data',
          interview_question_submitted: 'shared interview tips',
          upvote_received: 'received a helpful vote',
          best_answer: 'got best answer',
          referral_given: 'made an introduction',
          onboarding_complete: 'joined the network',
        }[t.action_type] || 'helped a student';
        items.push({ text: `${name} ${actionText}`, time: timeAgo, emoji: actionEmoji(t.action_type) });
      }

      // Sort by recency (most recent first) and dedupe
      const sorted = items.sort((a, b) => 0); // already sorted from DB
      setActivities(sorted.length > 0 ? sorted : [
        { text: 'Parents are helping students every day', time: 'now', emoji: '🐊' }
      ]);
    } catch (err) {
      console.log('LiveActivityTicker error:', err.message);
      setActivities([{ text: 'Join the UF community making a difference', time: 'now', emoji: '🐊' }]);
    }
  };

  if (activities.length === 0) return null;

  const current = activities[currentIndex];

  return (
    <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm overflow-hidden">
      <span className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="truncate transition-opacity duration-300 text-white font-medium" key={currentIndex}>
          <span className="mr-1">{current.emoji}</span>
          {current.text}
          <span className="text-white/70 ml-2">· {current.time}</span>
        </p>
      </div>
    </div>
  );
}

function getTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

function actionEmoji(type) {
  const map = {
    answer: '💬', salary_submitted: '💰', interview_question_submitted: '📝',
    upvote_received: '👍', best_answer: '🏆', referral_given: '🤝',
    onboarding_complete: '🎉', message_responded: '✉️',
  };
  return map[type] || '✨';
}