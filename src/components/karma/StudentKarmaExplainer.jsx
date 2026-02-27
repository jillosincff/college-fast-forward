import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const DISMISSED_KEY = 'cff_student_karma_explainer_dismissed';

export default function StudentKarmaExplainer({ user }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return !!localStorage.getItem(DISMISSED_KEY); } catch { return false; }
  });
  const [expanded, setExpanded] = useState(false);

  const studentKarma = user?.student_karma || 0;

  useEffect(() => {
    if (studentKarma > 0) {
      setDismissed(true);
      return;
    }
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
      setExpanded(true);
    }
  }, [studentKarma]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
    setExpanded(false);
  };

  if (studentKarma > 0) return null;

  if (dismissed && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-200 transition group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition">How Karma Works for Students</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
      </button>
    );
  }

  return (
    <section
      className="relative rounded-2xl sm:rounded-3xl border-2 p-5 sm:p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFF5F2 100%)',
        borderColor: 'rgba(0, 33, 165, 0.25)',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/60 transition text-slate-400 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl flex-shrink-0">🎯</span>
        <div>
          <h3 className="font-bold text-lg text-slate-900">How Karma Works</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Every time you help someone on CFF, you earn Karma points.
            Your Karma rolls into your Family score — and your family's
            Karma boosts your visibility to professionals.
          </p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold text-slate-700 mb-2">Quick ways to earn karma:</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => { handleDismiss(); navigate('Connections?tab=questions'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Answer a peer's question</span>
            <span className="text-xs font-bold text-blue-600 whitespace-nowrap">+10 pts</span>
          </button>
          <button
            onClick={() => { handleDismiss(); navigate('Connections?tab=salaries'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-green-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Share salary data</span>
            <span className="text-xs font-bold text-green-600 whitespace-nowrap">+20 pts</span>
          </button>
          <button
            onClick={() => { handleDismiss(); navigate('PostOpportunity'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Post a job lead</span>
            <span className="text-xs font-bold text-purple-600 whitespace-nowrap">+10 pts</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        The more your family contributes, the higher your help requests appear when professionals browse students to help.
      </p>

      <button
        onClick={handleDismiss}
        className="w-full py-3 rounded-xl font-bold text-white text-base transition hover:scale-[1.02]"
        style={{ backgroundColor: '#0021A5', boxShadow: '0 4px 12px rgba(0, 33, 165, 0.3)' }}
      >
        Got It — Let's Go →
      </button>
    </section>
  );
}