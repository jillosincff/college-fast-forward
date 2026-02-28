import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Briefcase, Building2, Clock, Target, ChevronRight, ChevronLeft, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const STEPS = [
  { id: 'dream_role', title: "What's your dream role?", subtitle: 'Be specific — our AI tailors everything to this.' },
  { id: 'target_companies', title: 'Name up to 5 target companies', subtitle: "We'll research them and find alumni for you." },
  { id: 'target_industries', title: 'What industries interest you?', subtitle: 'Select all that apply.' },
  { id: 'timeline', title: 'When do you want to start working?', subtitle: 'This helps us set your urgency level.' },
  { id: 'challenge', title: "What's your biggest challenge?", subtitle: "We'll prioritize fixing this first." },
];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Consulting', 'Healthcare', 'Marketing',
  'Engineering', 'Law & Legal', 'Real Estate', 'Media & Entertainment', 'Education',
  'Non-Profit', 'Government', 'Retail', 'Manufacturing', 'Hospitality',
];

const TIMELINES = [
  { value: 'immediately', label: 'ASAP', icon: '🔥' },
  { value: '1_3_months', label: '1–3 months', icon: '⏰' },
  { value: '3_6_months', label: '3–6 months', icon: '📅' },
  { value: '6_plus_months', label: '6+ months', icon: '🌱' },
  { value: 'exploring', label: 'Just exploring', icon: '🔍' },
];

const CHALLENGES = [
  { value: 'finding_roles', label: "Finding the right roles", icon: '🔍' },
  { value: 'getting_responses', label: "Getting responses back", icon: '📭' },
  { value: 'interviewing', label: "Nailing interviews", icon: '🎤' },
  { value: 'networking', label: "Building my network", icon: '🤝' },
  { value: 'unsure_what_i_want', label: "Not sure what I want", icon: '🤔' },
];

export default function FastTrackAssessment({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    dream_role: '',
    target_companies: [],
    target_industries: [],
    job_search_timeline: '',
    biggest_challenge: '',
  });
  const [companyInput, setCompanyInput] = useState('');

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep.id) {
      case 'dream_role': return data.dream_role.trim().length > 0;
      case 'target_companies': return data.target_companies.length > 0;
      case 'target_industries': return data.target_industries.length > 0;
      case 'timeline': return data.job_search_timeline !== '';
      case 'challenge': return data.biggest_challenge !== '';
      default: return false;
    }
  };

  const addCompany = () => {
    const name = companyInput.trim();
    if (name && data.target_companies.length < 5 && !data.target_companies.includes(name)) {
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
      target_industries: prev.target_industries.includes(ind)
        ? prev.target_industries.filter(i => i !== ind)
        : [...prev.target_industries, ind],
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const profile = await base44.entities.FastTrackProProfile.create({
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name || '',
      assessment_completed: true,
      dream_role: data.dream_role,
      target_companies: data.target_companies,
      target_industries: data.target_industries,
      job_search_timeline: data.job_search_timeline,
      biggest_challenge: data.biggest_challenge,
    });
    setSaving(false);
    onComplete(profile);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

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

            {/* Dream Role */}
            {currentStep.id === 'dream_role' && (
              <Input
                value={data.dream_role}
                onChange={(e) => setData(prev => ({ ...prev, dream_role: e.target.value }))}
                placeholder="e.g. Product Manager, Software Engineer, Marketing Analyst"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 text-base"
                autoFocus
              />
            )}

            {/* Target Companies */}
            {currentStep.id === 'target_companies' && (
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
                  <Button onClick={addCompany} disabled={!companyInput.trim() || data.target_companies.length >= 5} variant="secondary" className="h-12 px-4" style={{ minHeight: 'auto', width: 'auto' }}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.target_companies.map(c => (
                    <Badge key={c} className="bg-white/10 text-white border-white/20 px-3 py-1.5 text-sm gap-2">
                      <Building2 className="w-3 h-3" /> {c}
                      <button onClick={() => removeCompany(c)} style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
                {data.target_companies.length > 0 && (
                  <p className="text-white/40 text-xs mt-3">{data.target_companies.length}/5 companies</p>
                )}
              </div>
            )}

            {/* Industries */}
            {currentStep.id === 'target_industries' && (
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      data.target_industries.includes(ind)
                        ? 'bg-[#FA4616] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                    style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            )}

            {/* Timeline */}
            {currentStep.id === 'timeline' && (
              <div className="space-y-3">
                {TIMELINES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setData(prev => ({ ...prev, job_search_timeline: t.value }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                      data.job_search_timeline === t.value
                        ? 'bg-[#FA4616] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/15'
                    }`}
                    style={{ minHeight: 'auto' }}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Challenge */}
            {currentStep.id === 'challenge' && (
              <div className="space-y-3">
                {CHALLENGES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setData(prev => ({ ...prev, biggest_challenge: c.value }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                      data.biggest_challenge === c.value
                        ? 'bg-[#FA4616] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/15'
                    }`}
                    style={{ minHeight: 'auto' }}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="font-semibold">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-white/20 text-white hover:bg-white/10" style={{ minHeight: 'auto', width: 'auto' }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="flex-1 bg-[#FA4616] hover:bg-orange-600 text-white h-12 font-semibold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {step === STEPS.length - 1 ? (saving ? 'Setting up...' : 'Launch Fast Track Pro') : 'Continue'}
            {!saving && step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            {!saving && step === STEPS.length - 1 && <Sparkles className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}