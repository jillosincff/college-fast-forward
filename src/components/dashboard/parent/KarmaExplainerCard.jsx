import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { X } from 'lucide-react';

const DISMISSED_KEY = 'cff_karma_explainer_dismissed';

export default function KarmaExplainerCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section className="relative rounded-2xl sm:rounded-3xl border-2 p-5 sm:p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F0F4FF 0%, #FFF5F2 100%)',
        borderColor: 'rgba(0, 33, 165, 0.25)'
      }}
    >
      {/* Close button */}
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
          <h3 className="font-bold text-lg text-slate-900">How Family Karma Works</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Every time you help a student — answering questions, sharing salary data,
            or making introductions — your family earns karma points. The more karma
            you earn, the more visible your student becomes in match results.
          </p>
        </div>
      </div>

      {/* Quick ways to earn */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-slate-700 mb-2">Quick ways to earn karma:</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => { handleDismiss(); navigate('Connections?tab=questions'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Answer student questions</span>
            <span className="text-xs font-bold text-blue-600 whitespace-nowrap">+15 pts</span>
          </button>
          <button
            onClick={() => { handleDismiss(); navigate('Connections?tab=salaries'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-green-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Add salary data</span>
            <span className="text-xs font-bold text-green-600 whitespace-nowrap">+25 pts</span>
          </button>
          <button
            onClick={() => { handleDismiss(); navigate('Connections?tab=interviews'); }}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm transition text-left"
          >
            <span className="text-sm text-slate-700">Share interview questions</span>
            <span className="text-xs font-bold text-purple-600 whitespace-nowrap">+15 pts</span>
          </button>
        </div>
      </div>

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