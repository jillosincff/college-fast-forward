import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

export default function SkippedPledgeQuestionBanner({ user }) {
  const [question, setQuestion] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const skippedId = localStorage.getItem('skipped_pledge_question_id');
    if (!skippedId || !user?.pledge_taken) return;

    // Only show once per session
    if (sessionStorage.getItem('skipped_pledge_banner_dismissed')) return;

    async function load() {
      try {
        const questions = await base44.entities.JobRequest.filter(
          { status: 'active' },
          '-created_date',
          200
        );
        const found = questions.find(q => q.id === skippedId);
        if (found) setQuestion(found);
      } catch {
        // Silently fail
      }
    }
    load();
  }, [user?.pledge_taken]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('skipped_pledge_banner_dismissed', 'true');
    localStorage.removeItem('skipped_pledge_question_id');
  };

  const handleAnswer = () => {
    if (question) {
      navigate(`QuestionDetail?id=${question.id}&type=job`);
    } else {
      navigate('Connections');
    }
    handleDismiss();
  };

  if (dismissed || !question) return null;

  const studentName = question.poster_name
    ? (question.poster_name.includes(',')
        ? question.poster_name.split(',')[1]?.trim().split(' ')[0]
        : question.poster_name.split(' ')[0])
    : 'A student';

  const preview = (question.description || question.title || question.role || '').slice(0, 80);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 px-4 sm:px-6 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-xl flex-shrink-0 mt-0.5">🤝</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              You pledged to help. Here's your first chance:
            </p>
            <p className="text-sm text-slate-600 truncate">
              <strong>{studentName}:</strong> "{preview}{preview.length >= 80 ? '...' : ''}"
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAnswer}
            className="text-sm font-bold text-white bg-[#0021A5] hover:bg-[#001a8a] px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Answer Now →
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
    </div>
  );
}