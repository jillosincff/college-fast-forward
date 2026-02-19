import React from 'react';

const POSITIVE_OPTIONS = [
  { value: 'came_prepared', label: 'Came prepared', icon: '✓' },
  { value: 'asked_great_questions', label: 'Asked great questions', icon: '✓' },
  { value: 'strong_communicator', label: 'Strong communicator', icon: '✓' },
  { value: 'professional_demeanor', label: 'Professional demeanor', icon: '✓' },
  { value: 'followed_up', label: 'Followed up afterward', icon: '✓' },
  { value: 'would_refer', label: "I'd refer them to a colleague", icon: '✓' },
  { value: 'would_hire', label: "I'd hire them", icon: '✓' },
];

export default function FeedbackChipSelector({ selected, onChange }) {
  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">What stood out?</p>
        <p className="text-xs text-slate-400 mt-0.5">Select all that apply</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {POSITIVE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium
                border-2 transition-all duration-150 min-h-0
                ${isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <span className={`text-xs ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                {opt.icon}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}