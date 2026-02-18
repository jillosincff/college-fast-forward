import React from 'react';

const INTENTS = [
  {
    id: 'help_students',
    emoji: '🤝',
    title: "I want to help students",
    description: "Use your professional experience to answer questions, make introductions, and help UF students succeed."
  },
  {
    id: 'seeking_help',
    emoji: '🔍',
    title: "I'm looking for career opportunities",
    description: "Get matched with parents and alumni who can help you with introductions, career advice, and job search."
  }
];

export default function AlumniIntentStep({ selectedIntent, onSelect, onNext, onBack }) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
          What brings you to CFF?
        </h2>
        <p className="text-slate-500">
          This helps us tailor your experience.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          {INTENTS.map(intent => (
            <button
              key={intent.id}
              type="button"
              onClick={() => onSelect(intent.id)}
              className={`
                w-full flex items-start gap-4 px-5 py-5 rounded-xl text-left
                transition-all duration-200 border-2
                ${selectedIntent === intent.id
                  ? 'bg-blue-50 border-[#0021A5] ring-1 ring-[#0021A5]/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >
              <span className="text-3xl mt-0.5">{intent.emoji}</span>
              <div className="flex-1">
                <span className={`font-bold text-lg block ${
                  selectedIntent === intent.id ? 'text-[#0021A5]' : 'text-slate-800'
                }`}>
                  {intent.title}
                </span>
                <span className="text-sm text-slate-500 mt-1 block leading-relaxed">
                  {intent.description}
                </span>
              </div>
              {selectedIntent === intent.id && (
                <span className="text-[#0021A5] font-bold text-lg mt-1">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            disabled={!selectedIntent}
            className={`
              flex-1 py-4 rounded-xl font-bold text-lg transition-all
              ${selectedIntent
                ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </>
  );
}