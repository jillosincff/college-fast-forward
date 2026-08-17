import { Sparkles } from 'lucide-react';

export default function EmptyMatchesState({ onSetGoals, hasGoals = true }) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500 leading-relaxed">
        No new roles right now — CLIFF refreshes matches every 24 hours.
        {!hasGoals && ' Set your career goals to get personalized picks faster.'}
      </p>
      {!hasGoals && (
        <button
          onClick={onSetGoals}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
          style={{ minHeight: 'auto' }}
        >
          <Sparkles className="w-3.5 h-3.5" /> Set Career Goals
        </button>
      )}
    </div>
  );
}