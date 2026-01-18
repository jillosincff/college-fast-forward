import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

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

export default function IndustrySelector({ 
  value = [], 
  onChange, 
  otherText = '',
  onOtherTextChange,
  maxSelections = 3,
  error
}) {
  const [respondentType, setRespondentType] = useState(
    value.length === 0 ? 'anyone' : 'specific'
  );

  const handleTypeChange = (type) => {
    setRespondentType(type);
    if (type === 'anyone') {
      onChange([]);
      if (onOtherTextChange) onOtherTextChange('');
    }
  };

  const toggleIndustry = (industryId) => {
    if (value.includes(industryId)) {
      onChange(value.filter(id => id !== industryId));
      if (industryId === 'other' && onOtherTextChange) {
        onOtherTextChange('');
      }
    } else if (value.length < maxSelections) {
      onChange([...value, industryId]);
    }
  };

  const isMaxReached = value.length >= maxSelections;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Who would be best to answer this?
      </label>

      {/* Radio options */}
      <div className="space-y-3">
        <label 
          className={`
            flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${respondentType === 'anyone' 
              ? 'border-[#0021A5] bg-blue-50' 
              : 'border-slate-200 hover:border-slate-300 bg-white'
            }
          `}
        >
          <input
            type="radio"
            name="respondent_type"
            checked={respondentType === 'anyone'}
            onChange={() => handleTypeChange('anyone')}
            className="mt-1"
          />
          <div>
            <span className="font-medium text-slate-900 block">Anyone with career experience</span>
            <span className="text-sm text-slate-500">Great for general advice or exploring options</span>
          </div>
        </label>

        <label 
          className={`
            flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
            ${respondentType === 'specific' 
              ? 'border-[#0021A5] bg-blue-50' 
              : 'border-slate-200 hover:border-slate-300 bg-white'
            }
          `}
        >
          <input
            type="radio"
            name="respondent_type"
            checked={respondentType === 'specific'}
            onChange={() => handleTypeChange('specific')}
            className="mt-1"
          />
          <div>
            <span className="font-medium text-slate-900 block">Someone in a specific field</span>
            <span className="text-sm text-slate-500">Select up to {maxSelections}</span>
          </div>
        </label>
      </div>

      {/* Industry selection grid */}
      {respondentType === 'specific' && (
        <div className="mt-4 pl-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDUSTRIES.map(ind => {
              const isSelected = value.includes(ind.id);
              const isDisabled = !isSelected && isMaxReached;
              
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
                  <span className="font-medium flex-1">{ind.label}</span>
                  {isSelected && <span className="text-[#0021A5]">✓</span>}
                </button>
              );
            })}
          </div>

          {isMaxReached && (
            <p className="text-xs text-amber-600 mt-2">
              You can select up to {maxSelections} fields
            </p>
          )}

          {/* Other text input */}
          {value.includes('other') && (
            <div className="mt-3">
              <Input
                value={otherText}
                onChange={(e) => onOtherTextChange?.(e.target.value)}
                placeholder="e.g., 'sports management', 'data science'"
                className="w-full"
              />
              {!otherText?.trim() && (
                <p className="text-xs text-amber-600 mt-1">
                  Please tell us what field you're interested in
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

export { INDUSTRIES };