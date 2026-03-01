import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Building2, ChevronRight, ChevronLeft, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const STEPS = [
  { id: 'industry', title: 'What industries are you targeting?', subtitle: 'Select all that apply — we\'ll tailor intel to these.' },
  { id: 'companies', title: 'Name up to 3 dream companies', subtitle: 'We\'ll research them and find Gator alumni inside.' },
  { id: 'timeline', title: 'When do you want to start?', subtitle: 'This sets your urgency level.' },
  { id: 'stage', title: 'Where are you in your search?', subtitle: 'We\'ll calibrate your roadmap to this.' },
  { id: 'challenge', title: 'What\'s your biggest challenge?', subtitle: 'We\'ll prioritize fixing this first.' },
];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Consulting', 'Healthcare',
  'Pharmaceuticals & Biotech', 'Engineering', 'Marketing', 'Accounting & Tax',
  'Law & Legal', 'Data & Analytics', 'Sports & Athletics', 'Media & Entertainment',
  'Startups & Entrepreneurship', 'Aerospace & Defense', 'Real Estate', 'Education',
  'Government', 'Supply Chain & Logistics', 'Insurance', 'Agriculture & Food Science',
  'Non-Profit', 'Retail', 'Manufacturing', 'Hospitality',
];

const TIMELINES = [
  { value: 'asap', label: 'ASAP', emoji: '🔥' },
  { value: '3_months', label: 'Within 3 months', emoji: '⏰' },
  { value: '6_months', label: 'Within 6 months', emoji: '📅' },
  { value: 'next_year', label: 'Next year', emoji: '🌱' },
];

const STAGES = [
  { value: 'just_starting', label: 'Just starting', emoji: '🚀' },
  { value: 'applying', label: 'Applying to roles', emoji: '📝' },
  { value: 'interviewing', label: 'Interviewing', emoji: '🎤' },
  { value: 'have_offers', label: 'Have offers', emoji: '🎉' },
];

const INDUSTRY_COMPANIES = {
  'Technology': ['Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA', 'Salesforce', 'Oracle'],
  'Finance & Banking': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Citadel', 'Deloitte', 'PwC', 'Bank of America', 'Raymond James'],
  'Consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'EY', 'KPMG', 'Booz Allen'],
  'Healthcare': ['Mayo Clinic', 'UF Health', 'HCA', 'UnitedHealth', 'Johnson & Johnson', 'Medtronic', 'CVS Health', 'Baptist Health'],
  'Engineering': ['Lockheed Martin', 'Boeing', 'L3Harris', 'Raytheon', 'SpaceX', 'Tesla', 'Siemens', 'GE'],
};
const GENERIC_COMPANIES = ['Google', 'Amazon', 'Deloitte', 'JPMorgan', 'Lockheed Martin', 'UF Health', 'Disney', 'PwC'];

const CHALLENGES = [
  { value: 'dont_know_where_to_start', label: "Don't know where to start", emoji: '🤔' },
  { value: 'cant_get_responses', label: "Can't get responses", emoji: '📭' },
  { value: 'interview_prep', label: 'Interview prep', emoji: '🎯' },
  { value: 'negotiating', label: 'Negotiating offers', emoji: '💰' },
];

export default function ProAssessment({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Pre-fill from user fields
  const initialIndustries = useMemo(() => {
    if (user?.industries_interested?.length) return user.industries_interested.filter(i => INDUSTRIES.includes(i));
    return [];
  }, [user]);

  const initialTimeline = useMemo(() => {
    const t = user?.target_timeline;
    if (t && TIMELINES.some(tl => tl.value === t)) return t;
    return '';
  }, [user]);

  const [data, setData] = useState({
    target_industry: initialIndustries,
    target_companies: [],
    career_timeline: initialTimeline,
    current_stage: '',
    biggest_challenge: '',
  });
  const [companyInput, setCompanyInput] = useState('');

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep.id) {
      case 'industry': return data.target_industry.length > 0;
      case 'companies': return data.target_companies.length > 0;
      case 'timeline': return data.career_timeline !== '';
      case 'stage': return data.current_stage !== '';
      case 'challenge': return data.biggest_challenge !== '';
      default: return false;
    }
  };

  const addCompany = () => {
    const name = companyInput.trim();
    if (name && data.target_companies.length < 3 && !data.target_companies.includes(name)) {
      setData(prev => ({ ...prev, target_companies: [...prev.target_companies, name] }));
      setCompanyInput('');
    }
  };

  const removeCompany = (name) => {
    setData(prev => ({ ...prev, target_companies: prev.target_companies.filter(c => c !== name) }));
  };

  const toggleIndustry = (ind) => {
    setData(prev => ({
      ...prev,
      target_industry: prev.target_industry.includes(ind)
        ? prev.target_industry.filter(i => i !== ind)
        : [...prev.target_industry, ind],
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const profile = await base44.entities.FastTrackProProfile.create({
      user_email: user.email,
      target_companies: data.target_companies,
      target_industry: data.target_industry.join(', '),
      career_timeline: data.career_timeline,
      biggest_challenge: data.biggest_challenge,
      current_stage: data.current_stage,
      assessment_complete: true,
      pro_tier: 'free_trial',
    });
    setSaving(false);
    onComplete(profile);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const renderRadioOptions = (options, field) => (
    <div className="space-y-3">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setData(prev => ({ ...prev, [field]: opt.value }))}
          className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
            data[field] === opt.value
              ? 'bg-[#FA4616] text-white shadow-lg scale-[1.02]'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
          }`}
          style={{ minHeight: 'auto' }}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className="font-semibold text-base">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0021A5] to-slate-900 flex flex-col">
      {/* Progress */}
      <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FA4616]" />
            <span className="text-white/80 text-sm font-semibold">Fast Track Pro Setup</span>
          </div>
          <span className="text-white/60 text-xs">{step + 1} of {STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FA4616] to-orange-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
            <p className="text-white/60 text-sm mb-8">{currentStep.subtitle}</p>

            {/* Step 1: Industry Chips */}
            {currentStep.id === 'industry' && (
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      data.target_industry.includes(ind)
                        ? 'bg-[#FA4616] text-white shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                    style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Dream Companies */}
            {currentStep.id === 'companies' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
                    placeholder="Type a company name..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                    autoFocus
                  />
                  <Button
                    onClick={addCompany}
                    disabled={!companyInput.trim() || data.target_companies.length >= 3}
                    variant="secondary"
                    className="h-12 px-4"
                    style={{ minHeight: 'auto', width: 'auto' }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.target_companies.map(c => (
                    <Badge key={c} className="bg-white/10 text-white border-white/20 px-3 py-1.5 text-sm gap-2">
                      <Building2 className="w-3 h-3" /> {c}
                      <button onClick={() => removeCompany(c)} style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {data.target_companies.length > 0 && (
                  <p className="text-white/40 text-xs mt-3">{data.target_companies.length}/3 companies</p>
                )}

                {/* Suggested companies based on selected industries */}
                {data.target_companies.length < 3 && (() => {
                  const primaryIndustry = data.target_industry[0];
                  const suggestions = (INDUSTRY_COMPANIES[primaryIndustry] || GENERIC_COMPANIES)
                    .filter(c => !data.target_companies.includes(c));
                  if (suggestions.length === 0) return null;
                  return (
                    <div className="mt-5">
                      <p className="text-white/50 text-xs font-medium mb-2">Popular with UF students:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.slice(0, 8).map(c => (
                          <button
                            key={c}
                            onClick={() => {
                              if (data.target_companies.length < 3 && !data.target_companies.includes(c)) {
                                setData(prev => ({ ...prev, target_companies: [...prev.target_companies, c] }));
                              }
                            }}
                            disabled={data.target_companies.length >= 3}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-40"
                            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                          >
                            + {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Step 3: Timeline Radio */}
            {currentStep.id === 'timeline' && renderRadioOptions(TIMELINES, 'career_timeline')}

            {/* Step 4: Current Stage Radio */}
            {currentStep.id === 'stage' && renderRadioOptions(STAGES, 'current_stage')}

            {/* Step 5: Biggest Challenge Radio */}
            {currentStep.id === 'challenge' && renderRadioOptions(CHALLENGES, 'biggest_challenge')}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-white/20 text-white hover:bg-white/10"
              style={{ minHeight: 'auto', width: 'auto' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="flex-1 bg-[#FA4616] hover:bg-orange-600 text-white h-12 font-semibold"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {step === STEPS.length - 1 ? (saving ? 'Setting up...' : 'Launch Fast Track Pro') : 'Continue'}
            {!saving && step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            {!saving && step === STEPS.length - 1 && <Sparkles className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}