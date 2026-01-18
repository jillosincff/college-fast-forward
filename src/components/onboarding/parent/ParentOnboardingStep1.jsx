import React from 'react';

const YEARS_EXPERIENCE = [
  { id: '0-5', label: '0-5 years' },
  { id: '5-10', label: '5-10 years' },
  { id: '10-20', label: '10-20 years' },
  { id: '20+', label: '20+ years' },
];

export default function ParentOnboardingStep1({ 
  formData, 
  onUpdate, 
  onNext,
  userName 
}) {
  const canProceed = formData.jobTitle?.trim();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
          Tell us about yourself
        </h2>
        <p className="text-slate-500">
          So we can match you with students who need your expertise.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Which Gator are you here for? <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.studentName || ''}
          onChange={(e) => onUpdate({ studentName: e.target.value })}
          placeholder="Your student's name"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
        <p className="text-xs text-slate-400 mt-1">We'll use this to personalize your experience</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          What's your job title? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.jobTitle || ''}
          onChange={(e) => onUpdate({ jobTitle: e.target.value })}
          placeholder="e.g., VP of Marketing, Software Engineer, Attorney"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Where do you work? <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.company || ''}
          onChange={(e) => onUpdate({ company: e.target.value })}
          placeholder="Company name"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Years of experience <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {YEARS_EXPERIENCE.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdate({ yearsExperience: opt.id })}
              className={`
                px-4 py-3 rounded-xl text-sm font-medium transition-all border-2
                ${formData.yearsExperience === opt.id
                  ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all
          ${canProceed
            ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }
        `}
      >
        Continue →
      </button>

      {!canProceed && (
        <p className="text-xs text-amber-600 text-center">Please enter your job title to continue</p>
      )}
    </div>
  );
}