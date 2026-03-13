import React, { useState } from 'react';
import { useFunnel } from './FunnelContext';
import QuizStep from './QuizStep';
import ChipSelect from './ChipSelect';
import { X } from 'lucide-react';

const MAJORS = [
  'Business / Finance', 'Computer Science', 'Engineering', 'Marketing / Communications',
  'Biology / Pre-Med', 'Psychology', 'Economics', 'Political Science', 'Journalism / Media',
  'Nursing / Health Sciences', 'Education', 'Accounting', 'Art / Design', 'Other',
];

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029'];

const POPULAR_COMPANIES = [
  'Amazon', 'Google', 'Apple', 'Microsoft', 'Meta', 'Goldman Sachs', 'JPMorgan',
  'Deloitte', 'McKinsey', 'BCG', 'Nike', 'Disney', 'Netflix', 'Salesforce',
  'Tesla', 'SpaceX', 'PwC', 'EY', 'KPMG', 'Bain', 'Accenture', 'P&G', 'Lockheed Martin',
];

const LOCATIONS = ['Anywhere / Remote', 'New York', 'San Francisco / Bay Area', 'Miami / South Florida', 'Austin', 'Chicago', 'Los Angeles', 'Washington DC', 'Atlanta', 'Other'];

const TIMELINES = [
  { value: 'asap', label: '🔥 ASAP — I need leads now' },
  { value: 'this_semester', label: '📅 This semester' },
  { value: 'summer', label: '☀️ For summer internship' },
  { value: 'next_year', label: '🎓 For after graduation' },
  { value: 'exploring', label: '🔍 Just exploring' },
];

export default function KnownTargetsQuiz() {
  const { answers, updateAnswer, setPhase, step, nextStep } = useFunnel();
  const [companyInput, setCompanyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const companies = answers.companies || [];

  const addCompany = (name) => {
    const trimmed = name.trim();
    if (trimmed && companies.length < 5 && !companies.includes(trimmed)) {
      updateAnswer('companies', [...companies, trimmed]);
    }
    setCompanyInput('');
    setShowSuggestions(false);
  };

  const removeCompany = (name) => {
    updateAnswer('companies', companies.filter(c => c !== name));
  };

  const filteredSuggestions = POPULAR_COMPANIES.filter(
    c => c.toLowerCase().includes(companyInput.toLowerCase()) && !companies.includes(c)
  ).slice(0, 6);

  const steps = [
    // Step 1: Major
    <QuizStep key={0} questionNumber={1} totalQuestions={6} title="What's your major?" subtitle="Pick the closest match" canNext={!!answers.major} onNext={nextStep}>
      <ChipSelect options={MAJORS} selected={answers.major} onChange={(v) => updateAnswer('major', v)} />
    </QuizStep>,

    // Step 2: Grad year
    <QuizStep key={1} questionNumber={2} totalQuestions={6} title="When do you graduate?" canNext={!!answers.grad_year} onNext={nextStep}>
      <ChipSelect options={GRAD_YEARS} selected={answers.grad_year} onChange={(v) => updateAnswer('grad_year', v)} />
    </QuizStep>,

    // Step 3: Target companies
    <QuizStep key={2} questionNumber={3} totalQuestions={6} title="What are your dream companies?" subtitle="Add up to 5 companies" canNext={companies.length > 0} onNext={nextStep}>
      {/* Tags */}
      {companies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {companies.map(c => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/40 text-orange-300 text-[13px] font-semibold">
              {c}
              <button onClick={() => removeCompany(c)} className="hover:text-white" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={companyInput}
          onChange={(e) => { setCompanyInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' && companyInput.trim()) { e.preventDefault(); addCompany(companyInput); }}}
          placeholder={companies.length >= 5 ? 'Max 5 companies' : 'Type a company name...'}
          disabled={companies.length >= 5}
          className="w-full bg-white/8 border-2 border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-orange-400/50 disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
        {showSuggestions && companyInput && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/15 overflow-hidden z-10" style={{ background: '#1a2238' }}>
            {filteredSuggestions.map(c => (
              <button
                key={c}
                onClick={() => addCompany(c)}
                className="w-full text-left px-4 py-2.5 text-[13px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[12px] text-white/30 mt-2">Press Enter to add custom companies</p>
    </QuizStep>,

    // Step 4: Location — after this, show teaser
    <QuizStep key={3} questionNumber={4} totalQuestions={6} title="Where do you want to work?" canNext={!!answers.location} onNext={() => setPhase('teaser')}>
      <ChipSelect options={LOCATIONS} selected={answers.location} onChange={(v) => updateAnswer('location', v)} />
    </QuizStep>,

    // Step 5: Role type (after teaser break, step resumes at 4)
    <QuizStep key={4} questionNumber={5} totalQuestions={6} title="What type of role?" canNext={!!answers.role_type} onNext={nextStep}>
      <ChipSelect options={[
        { value: 'internship', label: '📋 Internship' },
        { value: 'entry_level', label: '🎓 Entry-level / New Grad' },
        { value: 'coop', label: '🔄 Co-op' },
        { value: 'exploring', label: '🔍 Still exploring' },
      ]} selected={answers.role_type} onChange={(v) => updateAnswer('role_type', v)} />
    </QuizStep>,

    // Step 6: Timeline
    <QuizStep key={5} questionNumber={6} totalQuestions={6} title="How urgent is your search?" canNext={!!answers.timeline} onNext={() => setPhase('score')}>
      <ChipSelect options={TIMELINES} selected={answers.timeline} onChange={(v) => updateAnswer('timeline', v)} />
    </QuizStep>,
  ];

  return steps[step] || steps[0];
}