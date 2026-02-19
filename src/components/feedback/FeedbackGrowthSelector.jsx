import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const GROWTH_OPTIONS = [
  { value: 'seemed_unprepared', label: 'Seemed unprepared' },
  { value: 'needs_communication_help', label: 'Could use help with communication' },
  { value: 'no_follow_up', label: "Didn't follow up after the conversation" },
  { value: 'needs_resume_help', label: 'Could use resume or interview help' },
  { value: 'didnt_show_up', label: "Didn't show up" },
];

export default function FeedbackGrowthSelector({ selected, onChange }) {
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
        <p className="text-sm font-semibold text-slate-700">Anything this student could work on?</p>
        <p className="text-xs text-slate-400 mt-0.5">
          This is private and only helps CFF provide better support. The student will never see this. Skip if you prefer.
        </p>
      </div>
      <div className="space-y-2.5">
        {GROWTH_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}