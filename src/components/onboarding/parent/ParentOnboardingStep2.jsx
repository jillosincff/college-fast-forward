import React from 'react';

const INDUSTRIES = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'consulting', label: 'Consulting', emoji: '📊' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'marketing', label: 'Marketing', emoji: '📱' },
  { id: 'engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'law', label: 'Law', emoji: '⚖️' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { id: 'nonprofit', label: 'Nonprofit', emoji: '❤️' },
  { id: 'government', label: 'Government', emoji: '🏛️' },
  { id: 'media', label: 'Media/Entertainment', emoji: '🎬' },
  { id: 'startups', label: 'Startups', emoji: '🚀' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

const WAYS_TO_HELP = [
  { id: 'career_guidance', label: 'Career guidance', emoji: '💼', description: 'Help students figure out their path' },
  { id: 'jobs_referrals', label: 'Job referrals', emoji: '🔍', description: 'Share openings or refer candidates' },
  { id: 'resume_interviews', label: 'Resume & interview help', emoji: '📄', description: 'Review resumes, do mock interviews' },
  { id: 'industry_insights', label: 'Industry insights', emoji: '🏢', description: "Share what your field is really like" },
  { id: 'introductions', label: 'Introductions', emoji: '🤝', description: 'Connect students to your network' },
  { id: 'grad_school', label: 'Grad school advice', emoji: '🎓', description: 'Help with grad school decisions' },
];

export default function ParentOnboardingStep2({ 
  formData, 
  onUpdate, 
  onNext,
  onBack 
}) {
  const toggleIndustry = (id) => {
    const current = formData.industries || [];
    if (current.includes(id)) {
      onUpdate({ industries: current.filter(i => i !== id) });
    } else if (current.length < 3) {
      onUpdate({ industries: [...current, id] });
    }
  };

  const toggleHelp = (id) => {
    const current = formData.waysToHelp || [];
    if (current.includes(id)) {
      onUpdate({ waysToHelp: current.filter(i => i !== id) });
    } else {
      onUpdate({ waysToHelp: [...current, id] });
    }
  };

  const canProceed = (formData.industries?.length >= 1) && (formData.waysToHelp?.length >= 1);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
          What's your background?
        </h2>
        <p className="text-slate-500">
          This helps us match you with students who can benefit from your experience.
        </p>
      </div>

      {/* Industries */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Your industry <span className="text-red-500">*</span>
          <span className="font-normal text-slate-400 ml-1">(select 1-3)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map(ind => {
            const isSelected = (formData.industries || []).includes(ind.id);
            const isDisabled = !isSelected && (formData.industries || []).length >= 3;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => toggleIndustry(ind.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm
                  transition-all duration-200 border-2
                  ${isSelected
                    ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                    : isDisabled
                    ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <span>{ind.emoji}</span>
                <span className="font-medium">{ind.label}</span>
                {isSelected && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
        {(formData.industries || []).length === 0 && (
          <p className="text-xs text-amber-600 mt-2">Please select at least one industry</p>
        )}
      </div>

      {/* Ways to Help */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Ways you can help <span className="text-red-500">*</span>
          <span className="font-normal text-slate-400 ml-1">(select at least 1)</span>
        </label>
        <div className="space-y-2">
          {WAYS_TO_HELP.map(help => {
            const isSelected = (formData.waysToHelp || []).includes(help.id);
            return (
              <button
                key={help.id}
                type="button"
                onClick={() => toggleHelp(help.id)}
                className={`
                  w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 border-2
                  ${isSelected
                    ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <span className="text-xl">{help.emoji}</span>
                <div className="flex-1">
                  <span className="font-medium block">{help.label}</span>
                  <span className="text-sm text-slate-500">{help.description}</span>
                </div>
                {isSelected && <span className="text-[#0021A5] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
        {(formData.waysToHelp || []).length === 0 && (
          <p className="text-xs text-amber-600 mt-2">Please select at least one way you can help</p>
        )}
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
          disabled={!canProceed}
          className={`
            flex-1 py-4 rounded-xl font-bold text-lg transition-all
            ${canProceed
              ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          Almost done! →
        </button>
      </div>
    </div>
  );
}