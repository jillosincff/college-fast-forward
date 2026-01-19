import React from 'react';

const YEARS_EXPERIENCE = [
  { id: '0-5', label: '0-5 years' },
  { id: '5-10', label: '5-10 years' },
  { id: '10-20', label: '10-20 years' },
  { id: '20+', label: '20+ years' },
];

// Calculate profile completeness
const calculateCompleteness = (formData) => {
  let score = 0;
  if (formData.jobTitle?.trim()) score += 25;
  if (formData.company?.trim()) score += 20;
  if (formData.linkedinUrl?.trim()) score += 25;
  if (formData.bio?.trim() && formData.bio.length > 20) score += 20;
  if (formData.yearsExperience) score += 10;
  return score;
};

export default function ParentOnboardingStep1({ 
  formData, 
  onUpdate, 
  onNext,
  userName 
}) {
  const canProceed = formData.jobTitle?.trim();
  const completeness = calculateCompleteness(formData);

  // Missing items for profile strength
  const missingItems = [];
  if (!formData.linkedinUrl?.trim()) missingItems.push({ label: 'LinkedIn URL', points: 25 });
  if (!formData.bio?.trim() || formData.bio?.length < 20) missingItems.push({ label: 'Short bio', points: 20 });
  if (!formData.yearsExperience) missingItems.push({ label: 'Years of experience', points: 10 });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
          Help students find you
        </h2>
        <p className="text-slate-500">
          The more students know about you, the more likely they'll reach out.
        </p>
        <p className="text-sm text-blue-600 font-medium mt-1">
          ✨ Parents with complete profiles get 3x more messages
        </p>
      </div>

      {/* Profile Completeness Indicator */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Profile strength</span>
          <span className="text-sm font-bold text-slate-900">{completeness}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${completeness}%`,
              backgroundColor: completeness >= 80 ? '#16a34a' : completeness >= 50 ? '#0021A5' : '#f59e0b'
            }}
          />
        </div>
        {missingItems.length > 0 && completeness < 80 && (
          <p className="text-xs text-slate-500">
            Add {missingItems.slice(0, 2).map(i => i.label).join(' and ')} to boost your profile
          </p>
        )}
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
      </div>

      {/* LinkedIn URL - Prominent placement */}
      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          LinkedIn Profile <span className="font-normal text-blue-600">(recommended)</span>
        </label>
        <input
          type="url"
          value={formData.linkedinUrl || ''}
          onChange={(e) => onUpdate({ linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base bg-white
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
          💡 Students often check LinkedIn before reaching out
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          What's your job title? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.jobTitle || ''}
          onChange={(e) => onUpdate({ jobTitle: e.target.value })}
          placeholder="e.g., Marketing Director, Software Engineer, VP of Sales"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.company || ''}
          onChange={(e) => onUpdate({ company: e.target.value })}
          placeholder="e.g., Google, Deloitte, Johnson & Johnson"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors"
        />
        <p className="text-xs text-slate-400 mt-1">Helps students who want to work at your company find you</p>
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

      {/* Short Bio */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Short bio <span className="font-normal text-blue-600">(recommended)</span>
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => onUpdate({ bio: e.target.value.slice(0, 280) })}
          placeholder="Tell students a bit about yourself and how you can help...

e.g., &quot;15 years in brand marketing at CPG companies. Happy to review resumes and share what it's really like in the industry.&quot;"
          rows={3}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                   focus:border-[#0021A5] focus:outline-none transition-colors resize-none"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-blue-600">💡 Profiles with bios get 2x more messages</p>
          <p className="text-xs text-slate-400">{formData.bio?.length || 0}/280</p>
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