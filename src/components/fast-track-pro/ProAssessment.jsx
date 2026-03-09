import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Building2, ChevronRight, ChevronLeft, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import ResumeUploadStep from './ResumeUploadStep';
import ResumeBuilderStep from './ResumeBuilderStep';
import { toast } from 'sonner';
import { INDUSTRIES, ROLE_TYPES, POSITION_TYPES, START_TIMELINES, JOB_SEARCH_TYPES, migrateIndustries, migrateRoles } from '@/components/fastiq/constants';

const STEPS = [
  { id: 'industry', title: 'What industries are you targeting?', subtitle: 'Select all that apply — we\'ll tailor intel to these.' },
  { id: 'role_type', title: 'What type of role are you looking for?', subtitle: 'This helps FASTIQ find the right jobs — e.g. "marketing roles at tech companies."' },
  { id: 'companies', title: 'Name up to 5 dream companies', subtitle: 'We\'ll research them and find Gator alumni inside.' },
  { id: 'position_type', title: 'What type of position are you looking for?', subtitle: 'This tells FASTIQ exactly what to search for at every company.' },
  { id: 'start_timeline', title: 'When are you looking to start?', subtitle: 'This helps us time your outreach perfectly.' },
  { id: 'challenge', title: 'What\'s your biggest challenge?', subtitle: 'We\'ll prioritize fixing this first.' },
  { id: 'greek', title: 'Are you in a fraternity or sorority?', subtitle: 'Optional — Greek connections are powerful for networking.' },
  { id: 'resume', title: "Last step — let's get your resume into FASTIQ", subtitle: 'This powers everything: better company matches, tailored outreach, smarter interview prep, and instant resume tailoring for any job.' },
];

const INDUSTRY_COMPANIES = {
  'Technology & Software': ['Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA', 'Salesforce', 'Oracle'],
  'Financial Services & Banking': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Citadel', 'Deloitte', 'PwC', 'Bank of America', 'Raymond James'],
  'Consulting & Professional Services': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'EY', 'KPMG', 'Booz Allen'],
  'Healthcare & Biotech': ['Mayo Clinic', 'UF Health', 'HCA', 'UnitedHealth', 'Johnson & Johnson', 'Medtronic', 'CVS Health', 'Baptist Health'],
  'Aerospace & Defense': ['Lockheed Martin', 'Boeing', 'L3Harris', 'Raytheon', 'SpaceX', 'Northrop Grumman', 'General Dynamics', 'BAE Systems'],
  'Media & Entertainment': ['Disney', 'Warner Bros', 'Netflix', 'Comcast', 'Spotify', 'Paramount', 'Fox', 'Live Nation'],
};
const GENERIC_COMPANIES = ['Google', 'Amazon', 'Deloitte', 'JPMorgan', 'Lockheed Martin', 'UF Health', 'Disney', 'PwC'];

const CHALLENGES = [
  { value: 'dont_know_where_to_start', label: "Don't know where to start", emoji: '🤔' },
  { value: 'cant_get_responses', label: "Can't get responses", emoji: '📭' },
  { value: 'interview_prep', label: 'Interview prep', emoji: '🎯' },
  { value: 'negotiating', label: 'Negotiating offers', emoji: '💰' },
];

export default function ProAssessment({ user, existingProfile, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [resumeMode, setResumeMode] = useState(null); // null, 'builder'

  // Pre-fill from existing profile first, then user fields — migrate legacy values
  const initialIndustries = useMemo(() => {
    if (existingProfile?.target_industry) {
      return migrateIndustries(existingProfile.target_industry);
    }
    if (user?.industries_interested?.length) return user.industries_interested.filter(i => INDUSTRIES.includes(i));
    return [];
  }, [user, existingProfile]);

  const initialTimeline = useMemo(() => {
    return existingProfile?.career_timeline || existingProfile?.start_timeline || '';
  }, [existingProfile]);

  const initialRoles = useMemo(() => {
    return migrateRoles(existingProfile?.target_role, existingProfile?.target_industry);
  }, [existingProfile]);

  const [data, setData] = useState({
    target_industry: initialIndustries,
    target_role: initialRoles,
    target_companies: (existingProfile?.target_companies || []).map(titleCase),
    job_search_type: existingProfile?.job_search_type || '',
    position_type: existingProfile?.position_type || '',
    start_timeline: existingProfile?.start_timeline || '',
    career_timeline: initialTimeline,
    current_stage: existingProfile?.current_stage || '',
    biggest_challenge: existingProfile?.biggest_challenge || '',
    greek_organization: existingProfile?.greek_organization || '',
  });
  const [companyInput, setCompanyInput] = useState('');
  const [explorerMode, setExplorerMode] = useState(
    existingProfile ? (existingProfile.target_companies || []).length === 0 && !!existingProfile.company_size_preference : false
  );
  const [companySizePref, setCompanySizePref] = useState(existingProfile?.company_size_preference || '');
  const [locationPref, setLocationPref] = useState(existingProfile?.location_preference || '');

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleRole = (role) => {
    setData(prev => ({
      ...prev,
      target_role: prev.target_role.includes(role)
        ? prev.target_role.filter(r => r !== role)
        : [...prev.target_role, role],
    }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case 'industry': return data.target_industry.length > 0;
      case 'role_type': return data.target_role.length > 0;
      case 'companies': return explorerMode ? companySizePref !== '' : data.target_companies.length > 0;
      case 'position_type': return data.position_type !== '';
      case 'start_timeline': return data.start_timeline !== '';
      case 'challenge': return data.biggest_challenge !== '';
      case 'greek': return true; // optional step, always can proceed
      case 'resume': return false; // resume step handled separately
      default: return false;
    }
  };

  const addCompany = () => {
    const raw = companyInput.trim();
    const name = titleCase(raw);
    if (name && data.target_companies.length < 5 && !data.target_companies.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
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

  // titleCase imported from @/components/utils/titleCase

  const handleFinish = async (resumeText, parsedData) => {
    setSaving(true);
    try {
      const profileData = {
        target_companies: explorerMode ? [] : data.target_companies.map(titleCase),
        target_industry: data.target_industry.join(', '),
        target_role: data.target_role.join(', '),
        job_search_type: data.job_search_type,
        position_type: data.position_type,
        start_timeline: data.start_timeline,
        career_timeline: data.start_timeline || data.career_timeline,
        biggest_challenge: data.biggest_challenge,
        current_stage: data.current_stage || 'just_starting',
        assessment_complete: true,
      };
      if (explorerMode) {
        profileData.company_size_preference = companySizePref;
        profileData.location_preference = locationPref;
      } else {
        profileData.company_size_preference = '';
        profileData.location_preference = '';
      }
      if (data.greek_organization) {
        profileData.greek_organization = data.greek_organization;
      }
      if (resumeText) {
        profileData.resume_text = resumeText;
      }

      let profile;
      if (existingProfile?.id) {
        await base44.entities.FastTrackProProfile.update(existingProfile.id, profileData);
        profile = { ...existingProfile, ...profileData };
      } else {
        profile = await base44.entities.FastTrackProProfile.create({
          user_email: user.email,
          pro_tier: 'free_trial',
          ...profileData,
        });
      }
      setSaving(false);
      onComplete(profile);
    } catch (err) {
      console.error('Assessment save failed:', err);
      setSaving(false);
      toast.error('Something went wrong saving your profile. Please try again.');
    }
  };

  const handleStartBuilderAndFinish = async () => {
    // Save profile without resume, then navigate to chat with resume builder
    setSaving(true);
    try {
      const profileData = {
        target_companies: explorerMode ? [] : data.target_companies.map(titleCase),
        target_industry: data.target_industry.join(', '),
        target_role: data.target_role.join(', '),
        job_search_type: data.job_search_type,
        position_type: data.position_type,
        start_timeline: data.start_timeline,
        career_timeline: data.start_timeline || data.career_timeline,
        biggest_challenge: data.biggest_challenge,
        current_stage: data.current_stage || 'just_starting',
        assessment_complete: true,
      };
      if (explorerMode) {
        profileData.company_size_preference = companySizePref;
        profileData.location_preference = locationPref;
      }
      if (data.greek_organization) {
        profileData.greek_organization = data.greek_organization;
      }

      let profile;
      if (existingProfile?.id) {
        await base44.entities.FastTrackProProfile.update(existingProfile.id, profileData);
        profile = { ...existingProfile, ...profileData };
      } else {
        profile = await base44.entities.FastTrackProProfile.create({
          user_email: user.email,
          pro_tier: 'free_trial',
          ...profileData,
        });
      }
      setSaving(false);
      // Navigate to chat with resume builder opener
      onComplete(profile, 'Help me build a resume');
    } catch (err) {
      console.error('Assessment save failed:', err);
      setSaving(false);
      toast.error('Something went wrong saving your profile. Please try again.');
    }
  };

  const handleResumeReady = (resumeText, parsedData) => {
    // resumeText === null means "skip for now"
    handleFinish(resumeText, parsedData);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    // Resume step is handled by its own components, not handleFinish directly
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
            <span className="text-white/80 text-sm font-semibold">FASTIQ™ Setup</span>
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

            {/* Step 1: Industry Chips (multi-select) */}
            {currentStep.id === 'industry' && (
              <div>
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
                {data.target_industry.length > 0 && (
                  <p className="text-white/40 text-xs mt-3">{data.target_industry.length} selected</p>
                )}
              </div>
            )}

            {/* Step 1.5: Role Type Chips (multi-select) */}
            {currentStep.id === 'role_type' && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_TYPES.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        data.target_role.includes(role)
                          ? 'bg-[#FA4616] text-white shadow-md'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                      }`}
                      style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                {data.target_role.length > 0 && (
                  <p className="text-white/40 text-xs mt-3">{data.target_role.length} selected</p>
                )}
              </div>
            )}

            {/* Step 2: Dream Companies */}
            {currentStep.id === 'companies' && (
              <div>
                {!explorerMode ? (
                  <>
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
                        disabled={!companyInput.trim() || data.target_companies.length >= 5}
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
                      <p className="text-white/40 text-xs mt-3">{data.target_companies.length}/5 companies</p>
                    )}

                    {/* Suggested companies based on selected industries */}
                    {data.target_companies.length < 5 && (() => {
                      const primaryIndustry = data.target_industry[0];
                      const suggestions = (INDUSTRY_COMPANIES[primaryIndustry] || GENERIC_COMPANIES)
                        .filter(c => !data.target_companies.map(tc => tc.toLowerCase()).includes(c.toLowerCase()));
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="mt-5">
                          <p className="text-white/50 text-xs font-medium mb-2">Popular with UF students:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 8).map(c => (
                              <button
                                key={c}
                                onClick={() => {
                                  if (data.target_companies.length < 5 && !data.target_companies.map(tc => tc.toLowerCase()).includes(c.toLowerCase())) {
                                    setData(prev => ({ ...prev, target_companies: [...prev.target_companies, c] }));
                                  }
                                }}
                                disabled={data.target_companies.length >= 5}
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

                    {/* Explorer mode toggle */}
                    <button
                      onClick={() => setExplorerMode(true)}
                      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                      style={{ minHeight: 'auto' }}
                    >
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium">I'm not sure yet — help me find companies</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Company size preference */}
                    <div>
                      <p className="text-white/70 text-sm font-medium mb-3">What kind of company?</p>
                      <div className="space-y-2">
                        {[
                          { value: 'large', label: 'Large corporation', emoji: '🏢' },
                          { value: 'mid_size', label: 'Mid-size company', emoji: '🏗️' },
                          { value: 'startup', label: 'Startup', emoji: '🚀' },
                          { value: 'no_preference', label: "Don't care", emoji: '🤷' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setCompanySizePref(opt.value)}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-left transition-all ${
                              companySizePref === opt.value
                                ? 'bg-[#FA4616] text-white shadow-lg scale-[1.02]'
                                : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
                            }`}
                            style={{ minHeight: 'auto' }}
                          >
                            <span className="text-xl">{opt.emoji}</span>
                            <span className="font-semibold text-sm">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location preference */}
                    <div>
                      <p className="text-white/70 text-sm font-medium mb-3">Where do you want to work?</p>
                      <Input
                        value={locationPref}
                        onChange={(e) => setLocationPref(e.target.value)}
                        placeholder="e.g. New York, Remote, Florida..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 mb-3"
                      />
                      <div className="flex flex-wrap gap-2">
                        {['New York', 'San Francisco', 'Remote', 'Florida', 'Austin', 'Chicago', 'Anywhere'].map(loc => (
                          <button
                            key={loc}
                            onClick={() => setLocationPref(loc)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              locationPref === loc
                                ? 'bg-[#FA4616] text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                            }`}
                            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Back to company input */}
                    <button
                      onClick={() => setExplorerMode(false)}
                      className="text-white/50 text-xs hover:text-white/70 underline"
                      style={{ minHeight: 'auto' }}
                    >
                      ← I actually have specific companies in mind
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Position Type */}
            {currentStep.id === 'position_type' && renderRadioOptions(POSITION_TYPES, 'position_type')}

            {/* Step 4: Start Timeline */}
            {currentStep.id === 'start_timeline' && renderRadioOptions(START_TIMELINES, 'start_timeline')}

            {/* Step 5: Biggest Challenge Radio */}
            {currentStep.id === 'challenge' && renderRadioOptions(CHALLENGES, 'biggest_challenge')}

            {/* Step 5.5: Greek Life (optional) */}
            {currentStep.id === 'greek' && (
              <div>
                <Input
                  value={data.greek_organization}
                  onChange={(e) => setData(prev => ({ ...prev, greek_organization: e.target.value }))}
                  placeholder="e.g. Kappa Delta, Sigma Chi, Alpha Phi..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 mb-4"
                />
                <p className="text-white/50 text-xs mb-4">
                  Greek connections are a powerful networking lever — sorority sisters and fraternity brothers respond at 3× the rate of cold outreach.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Kappa Delta', 'Alpha Delta Pi', 'Sigma Chi', 'Phi Delta Theta', 'Tri Delta', 'Kappa Kappa Gamma', 'Pi Beta Phi', 'Sigma Nu', 'Alpha Epsilon Phi', 'Zeta Beta Tau'].map(org => (
                    <button
                      key={org}
                      onClick={() => setData(prev => ({ ...prev, greek_organization: org }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        data.greek_organization === org
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                      }`}
                      style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                    >
                      🏛️ {org}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="mt-6 w-full text-white/50 text-sm hover:text-white/70 underline"
                  style={{ minHeight: 'auto' }}
                >
                  Skip — I'm not in Greek life
                </button>
              </div>
            )}

            {/* Step 6: Resume */}
            {currentStep.id === 'resume' && resumeMode !== 'builder' && (
              <ResumeUploadStep
                user={user}
                onResumeReady={handleResumeReady}
                onStartBuilder={handleStartBuilderAndFinish}
              />
            )}
            {currentStep.id === 'resume' && resumeMode === 'builder' && (
              <ResumeBuilderStep
                user={user}
                onResumeReady={handleResumeReady}
                onBack={() => setResumeMode(null)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav — hidden on resume step (resume step has its own buttons) */}
      {currentStep.id !== 'resume' && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-white/30 text-white hover:bg-white/10 bg-white/10"
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
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}