import { Clock, Sparkles } from 'lucide-react';

export default function EmptyMatchesState({ onSetGoals, hasGoals = true }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-b from-gray-50 to-white">
      <div className="w-14 h-14 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-4">
        <Clock className="w-7 h-7 text-purple-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900">No new roles right now</h3>
      <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
        New matches posted every 24 hours — check back soon!
        {!hasGoals && ' Set your career goals to get personalized picks faster.'}
      </p>
      {!hasGoals && (
        <button
          onClick={onSetGoals}
          className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
          style={{ minHeight: 'auto' }}
        >
          <Sparkles className="w-3.5 h-3.5" /> Set Career Goals
        </button>
      )}
    </div>
  );
}