import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const CATEGORIES = [
  { id: 'networking', label: 'Networking & Outreach', icon: '🤝' },
  { id: 'career_path', label: 'Career Path Exploration', icon: '🧭' },
  { id: 'first_job', label: 'First Job Advice', icon: '💼' },
  { id: 'industry', label: 'Industry-Specific', icon: '🏢' },
];

const INSPIRATION = {
  networking: [
    "How do you reach out to someone you've never met without it feeling weird or desperate?",
    "What's the best way to ask someone for a coffee chat when you have no connection to them?",
    "How do you follow up after sending a message that got no reply?",
  ],
  career_path: [
    "Does anyone work in [field] who'd be willing to tell me what a normal Tuesday actually looks like?",
    "How did you figure out what you actually wanted to do — and how long did it take?",
    "What's the difference between [role A] and [role B] in terms of day-to-day work?",
  ],
  first_job: [
    "What do you wish someone had told you before you started your first real job?",
    "What's one thing that surprised you about working that nobody talks about in college?",
    "How do you handle it when you don't know what you're doing at a new job?",
  ],
  industry: [
    "Does anyone have connections at companies in [industry] who might be open to a quick call?",
    "What skills actually matter in [field] that you don't learn in school?",
    "Is [certification/skill] actually worth getting for someone trying to break into [industry]?",
  ],
};

const PLACEHOLDERS = {
  networking: "e.g. How do you reach out to someone you've never met without it feeling awkward?",
  career_path: "e.g. Does anyone work in [field] and would be willing to tell me what a normal day actually looks like?",
  first_job: "e.g. What do you wish someone had told you before your first real job?",
  industry: "e.g. Does anyone have connections at companies that work in [space] who might be open to a quick call?",
};

export default function AskFirstQuestion({ question, onQuestionChange, category, onCategoryChange, context, onContextChange, location, onLocationChange, timeline, onTimelineChange }) {
  // Real-time feedback
  const isStatement = question.length > 10 && !question.trim().endsWith('?');
  const isQuestion = question.trim().endsWith('?');

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">💬</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Ask your first question</h1>
        <p className="text-slate-600 text-sm">
          Parents and alumni in this network will answer from real experience. The more specific you are, the better the answer.
        </p>
      </div>

      {/* Category selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          What kind of help do you need? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              data-chip="true"
              onClick={() => onCategoryChange(cat.id)}
              className={`chip-btn px-4 py-2.5 rounded-xl font-medium transition-all border-2 text-sm inline-flex items-center gap-2 ${
                category === cat.id
                  ? 'bg-orange-50 border-[#E85D20] text-[#E85D20] shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inspiration chips + Question field (only after category selected) */}
      {category && (
        <div className="space-y-5">
          {/* Inspiration chips */}
          <div>
            <p className="text-xs text-slate-500 mb-3">
              💡 Here are some questions that get great responses. Tap one to use it as a starting point:
            </p>
            <div className="flex flex-col gap-2">
              {INSPIRATION[category]?.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  data-chip="true"
                  onClick={() => onQuestionChange(chip)}
                  className="text-left text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-[#E85D20] hover:text-[#E85D20] hover:bg-orange-50/50 transition-all leading-relaxed"
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>

          {/* Question textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={e => { if (e.target.value.length <= 300) onQuestionChange(e.target.value); }}
              placeholder={PLACEHOLDERS[category] || 'What do you need help with?'}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base resize-none focus:border-[#E85D20] focus:outline-none transition-colors"
              maxLength={300}
            />
            <div className="flex justify-between items-center mt-1.5">
              {/* Real-time feedback */}
              <div>
                {isStatement && question.length > 10 && (
                  <p className="text-xs text-[#E85D20] italic animate-fade-in-up">
                    💡 Try phrasing this as a question — it gets 3x more responses.
                  </p>
                )}
                {isQuestion && question.length > 10 && (
                  <p className="text-xs text-green-600">
                    ✓ Great — that's a question people can actually answer.
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-400">{question.length} / 300</span>
            </div>
          </div>

          {/* Context (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              A little more context <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={e => { if (e.target.value.length <= 200) onContextChange(e.target.value); }}
              placeholder="Your year, major, what you've already tried, what you're hoping to get out of an answer..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base resize-none focus:border-[#0021A5] focus:outline-none transition-colors"
              maxLength={200}
            />
          </div>

          {/* Location + Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Where? <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => onLocationChange(e.target.value)}
                placeholder="e.g. Miami, Remote, Anywhere"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                When? <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <select
                value={timeline}
                onChange={e => onTimelineChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none bg-white"
              >
                <option value="">Not sure yet</option>
                <option value="summer">Summer 2026</option>
                <option value="next_semester">Fall 2026</option>
                <option value="this_semester">Spring 2027</option>
                <option value="immediate">Anytime</option>
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📄</span>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-700">This will be posted</strong> to the community feed where parents & alumni can see it.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✏️</span>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-700">You can edit anytime</strong> from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}