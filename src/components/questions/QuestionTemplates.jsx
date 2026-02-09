import React, { useState } from 'react';

const TEMPLATES = [
  {
    id: 'resume_review',
    icon: '📄',
    label: 'Resume Review',
    template: 'Can someone in [industry] review my resume? I\'m applying to [company/type] roles for summer 2026.',
    placeholders: { '[industry]': '', '[company/type]': '' }
  },
  {
    id: 'warm_intro',
    icon: '🤝',
    label: 'Warm Introduction',
    template: 'Who knows someone at [company]? I\'d love a warm introduction or a 15-minute informational call.',
    placeholders: { '[company]': '' }
  },
  {
    id: 'day_to_day',
    icon: '💬',
    label: 'Day-to-Day Insights',
    template: 'What\'s the day-to-day like in [industry/role]? I\'m deciding between [option A] and [option B] career paths.',
    placeholders: { '[industry/role]': '', '[option A]': '', '[option B]': '' }
  },
  {
    id: 'mock_interview',
    icon: '🎯',
    label: 'Mock Interview',
    template: 'Can someone do a mock interview with me? I have interviews coming up at [company].',
    placeholders: { '[company]': '' }
  },
  {
    id: 'salary_info',
    icon: '💰',
    label: 'Salary Info',
    template: 'What\'s a realistic salary for a [role] role in [city]? I want to know what to expect.',
    placeholders: { '[role]': '', '[city]': '' }
  }
];

export default function QuestionTemplates({ onSelectTemplate }) {
  const [expanded, setExpanded] = useState(false);

  const handleSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.template);
    }
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-semibold text-[#FA4616] hover:text-orange-700 flex items-center gap-1.5 mb-3"
      >
        <span>💡</span>
        {expanded ? 'Hide templates' : 'Not sure what to ask? Try a template'}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t)}
              className="text-left p-3 rounded-xl border-2 border-slate-200 hover:border-[#FA4616] hover:bg-orange-50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{t.icon}</span>
                <span className="font-semibold text-sm text-slate-800 group-hover:text-[#FA4616]">{t.label}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 italic">"{t.template}"</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}