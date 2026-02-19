import React from 'react';

const IMPRESSION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', desc: 'exceeded expectations', icon: '⭐' },
  { value: 'great', label: 'Great', desc: 'solid conversation', icon: '👍' },
  { value: 'good', label: 'Good', desc: 'on the right track', icon: '👌' },
  { value: 'still_warming_up', label: 'Still warming up', desc: 'could benefit from support', icon: '🌱' },
];

export default function FeedbackImpressionSelector({ selected, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">How would you describe the conversation?</p>
      <div className="space-y-2">
        {IMPRESSION_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
                border-2 transition-all duration-150 min-h-0
                ${isSelected
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <span className="text-xl">{opt.icon}</span>
              <div>
                <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                <span className="text-slate-400 text-sm"> — {opt.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}