import React, { useState, useMemo } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';

import FastIQSetupProgress from '@/components/fastiq-setup/FastIQSetupProgress';
import FastIQStep1Confirm from '@/components/fastiq-setup/FastIQStep1Confirm';
import FastIQStep2Companies from '@/components/fastiq-setup/FastIQStep2Companies';
import FastIQStep3Location from '@/components/fastiq-setup/FastIQStep3Location';
import FastIQStep4Resume from '@/components/fastiq-setup/FastIQStep4Resume';
import FastIQActivation from '@/components/fastiq-setup/FastIQActivation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function ProAssessment({ user, existingProfile, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showActivation, setShowActivation] = useState(false);

  // Step 2 state
  const [companies, setCompanies] = useState(
    (existingProfile?.target_companies || []).map(titleCase)
  );
  const [explorerMode, setExplorerMode] = useState(
    existingProfile ? (existingProfile.target_companies || []).length === 0 && !!existingProfile.company_size_preference : false
  );

  // Step 3 state
  const [locations, setLocations] = useState(() => {
    const pref = existingProfile?.location_preference || user?.preferred_work_location || '';
    return pref ? pref.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  const [timeline, setTimeline] = useState(existingProfile?.start_timeline || '');
  const [customCity, setCustomCity] = useState('');

  // Derived from user profile (for step 1 display + saving)
  const userIndustries = user?.industries_interested || [];

  const canProceedStep = () => {
    switch (step) {
      case 0: return true; // confirm — always can proceed
      case 1: return explorerMode || companies.length > 0;
      case 2: return locations.length > 0 && timeline !== '';
      case 3: return true; // resume is optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async (resumeUrl) => {
    setSaving(true);
    try {
      const profileData = {
        target_companies: explorerMode ? [] : companies.map(titleCase),
        target_industry: userIndustries.join(', '),
        target_role: (user?.seeking_type || []).join(', '),
        location_preference: locations.join(', '),
        start_timeline: timeline,
        career_timeline: timeline,
        assessment_complete: true,
        current_stage: existingProfile?.current_stage || 'just_starting',
      };

      if (explorerMode) {
        profileData.company_size_preference = 'no_preference';
      }

      if (resumeUrl) {
        profileData.resume_text = resumeUrl;
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
      // Show activation screen before completing
      setShowActivation(true);
      // Store profile for when they leave activation
      window.__fastiqProfile = profile;
    } catch (err) {
      console.error('FASTIQ setup save failed:', err);
      setSaving(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Activation screen
  if (showActivation) {
    return (
      <FastIQActivation
        user={user}
        companies={companies}
        industries={userIndustries}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
      {/* Radial glow */}
      <div aria-hidden style={{
        position: 'fixed', top: '25%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.06), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Progress */}
      <FastIQSetupProgress currentStep={step} />

      {/* Step content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, paddingBottom: 120, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%' }}
          >
            {step === 0 && (
              <FastIQStep1Confirm
                user={user}
                onConfirm={handleNext}
                onEditProfile={() => navigate('ProfileEdit')}
              />
            )}

            {step === 1 && (
              <FastIQStep2Companies
                companies={companies}
                onCompaniesChange={setCompanies}
                industries={userIndustries}
                explorerMode={explorerMode}
                onExplorerModeChange={setExplorerMode}
              />
            )}

            {step === 2 && (
              <FastIQStep3Location
                locations={locations}
                onLocationsChange={setLocations}
                timeline={timeline}
                onTimelineChange={setTimeline}
                customCity={customCity}
                onCustomCityChange={setCustomCity}
                gradYear={user?.graduation_year}
              />
            )}

            {step === 3 && (
              <FastIQStep4Resume
                existingResumeUrl={user?.resume_url || existingProfile?.resume_text}
                onFinish={handleFinish}
                saving={saving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — steps 1-2 only (step 0 has its own CTA, step 3 has its own) */}
      {(step === 1 || step === 2) && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          padding: '16px 24px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', gap: 10 }}>
            <button
              onClick={handleBack}
              style={{
                padding: '14px 18px', borderRadius: 100,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(244,240,232,0.5)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 'auto', width: 'auto',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceedStep()}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 100, border: 'none',
                background: canProceedStep() ? orange : 'rgba(255,255,255,0.06)',
                color: canProceedStep() ? '#fff' : 'rgba(255,255,255,0.25)',
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                cursor: canProceedStep() ? 'pointer' : 'not-allowed', minHeight: 48,
                transition: 'all 0.15s',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}