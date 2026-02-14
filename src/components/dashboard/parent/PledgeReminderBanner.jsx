import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

export default function PledgeReminderBanner({ user }) {
  const [show, setShow] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    if (!user?.pledge_taken) {
      setShow(false);
      return;
    }

    // Check if dismissed this week
    const dismissedAt = localStorage.getItem('pledge_reminder_dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const daysSince = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setShow(false);
        return;
      }
    }

    // Check if user answered a question this week
    async function checkActivity() {
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const answers = await base44.entities.Answer.filter(
          { answerer_email: user.email },
          '-created_date',
          1
        );

        const answeredThisWeek = answers.length > 0 && new Date(answers[0].created_date) > oneWeekAgo;

        if (answeredThisWeek) {
          setShow(false);
          return;
        }

        // Get count of waiting questions
        const questions = await base44.entities.HelpRequest.filter(
          { status: 'active' },
          '-created_date',
          50
        );
        setWaitingCount(questions.length);
        setShow(true);
      } catch {
        setShow(false);
      }
    }

    checkActivity();
  }, [user?.email, user?.pledge_taken]);

  const handleDismiss = () => {
    localStorage.setItem('pledge_reminder_dismissed', new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl border border-blue-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">🤝</span>
        <p className="text-sm text-slate-700 min-w-0">
          <strong>You pledged to help.</strong>{' '}
          {waitingCount > 0
            ? `${waitingCount} students could use your expertise this week.`
            : 'Students could use your expertise this week.'}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('Connections')}
          className="text-sm font-semibold text-[#0021A5] hover:underline whitespace-nowrap"
        >
          Help Now →
        </button>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}