import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';
import { generateActionPlan } from '@/functions/generateActionPlan';

import FastIQSetupProgress from '@/components/fastiq-setup/FastIQSetupProgress';
import FastIQStep1Confirm from '@/components/fastiq-setup/FastIQStep1Confirm';
import FastIQStep2Direction from '@/components/fastiq-setup/FastIQStep2Direction';
import FastIQStep3Targets from '@/components/fastiq-setup/FastIQStep3Targets';
import FastIQStep3Explore from '@/components/fastiq-setup/FastIQStep3Explore';
import FastIQActivation from '@/components/fastiq-setup/FastIQActivation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function ProAssessment({ user, existingProfile, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 2 — direction
  const [direction, setDirection] = useState(null); // 'focused' | 'explorer'

  // Step 3A — targets (focused)
  const [companies, setCompanies] = useState(
    (existingProfile?.target_companies || []).map(titleCase)
  );

  // Step 3B — exploration interest (explorer)
  const [interest, setInterest] = useState('');

  // Step 4 — activation
  const [showActivation, setShowActivation] = useState(false);

  const userIndustries = user?.industries_interested || [];

  // Get CTA label for bottom bar
  const getCtaLabel = () => {
    if (step === 1) {
      if (!direction) return 'Select a path';
      return direction === 'focused' ? 'Set up my target companies →' : 'Start exploring →';
    }
    if (step === 2) {
      if (direction === 'focused') return companies.length > 0 ? `Start with these ${companies.length} companies →` : 'Add at least 1 company';
      return interest.trim() ? "Let's explore this →" : 'Select or type something';
    }
    return 'Continue →';
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!direction;
    if (step === 2) return direction === 'focused' ? companies.length > 0 : interest.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else if (step === 2) handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkipStep3 = () => {
    // Skip targets/explore — go directly to activation with empty data
    handleFinish(true);
  };

  const handleFinish = async (skipped = false) => {
    setSaving(true);
    try {
      const profileData = {
        target_companies: direction === 'focused' && !skipped ? companies.map(titleCase) : [],
        target_industry: userIndustries.join(', '),
        target_role: (user?.seeking_type || []).join(', '),
        assessment_complete: true,
        current_stage: existingProfile?.current_stage || 'just_starting',
      };

      if (direction === 'explorer' || skipped) {
        profileData.company_size_preference = 'no_preference';
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

      // Save setup-complete flag + mode to user
      await base44.auth.updateMe({
        fastiq_setup_complete: true,
        fastiq_mode: direction || 'explorer',
        fastiq_target_companies: direction === 'focused' && !skipped ? companies : [],
        fastiq_exploration_interest: direction === 'explorer' && !skipped ? interest : '',
        fastiq_activated_at: new Date().toISOString(),
      });

      window.__fastiqProfile = profile;

      // Auto-generate action plan in background
      generateActionPlan({}).catch(e => console.log('Action plan auto-gen failed (non-critical):', e.message));

      setSaving(false);
      setShowActivation(true);
    } catch (err) {
      console.error('FASTIQ setup save failed:', err);
      setSaving(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleActivationFinish = () => {
    const profile = window.__fastiqProfile;
    // Build initial message for chat based on path
    let initialMsg = '';
    if (direction === 'focused' && companies.length > 0) {
      initialMsg = `Research ${companies[0]} for me`;
    } else if (direction === 'explorer' && interest) {
      initialMsg = interest;
    }
    if (onComplete) onComplete(profile, initialMsg);
  };

  // Activation screen
  if (showActivation) {
    return (
      <FastIQActivation
        user={user}
        mode={direction || 'explorer'}
        companies={companies}
        interest={interest}
        onFinish={handleActivationFinish}
      />
    );
  }

  const showBackBtn = step > 0 && step <= 2;
  const showBottomNav = step >= 1;

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

      {/* Back button for steps 1-2 */}
      {showBackBtn && (
        <button onClick={handleBack}
          style={{ position: 'absolute', top: 80, left: 24, background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(244,240,232,0.3)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 5, minHeight: 'auto', width: 'auto' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(244,240,232,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,240,232,0.3)'}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* Step content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, paddingBottom: showBottomNav ? 120 : 40, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
              <FastIQStep2Direction
                selected={direction}
                onSelect={setDirection}
              />
            )}
            {step === 2 && direction === 'focused' && (
              <FastIQStep3Targets
                companies={companies}
                onCompaniesChange={setCompanies}
                industries={userIndustries}
                mode="focused"
                onSkip={handleSkipStep3}
              />
            )}
            {step === 2 && direction === 'explorer' && (
              <FastIQStep3Explore
                interest={interest}
                onInterestChange={setInterest}
                onSkip={handleSkipStep3}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — steps 1 & 2 */}
      {showBottomNav && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          padding: '16px 24px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 100, border: 'none',
                background: canProceed() ? orange : 'rgba(255,255,255,0.06)',
                color: canProceed() ? '#fff' : 'rgba(255,255,255,0.25)',
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                cursor: canProceed() ? 'pointer' : 'not-allowed', minHeight: 48,
                transition: 'all 0.15s',
              }}
            >
              {saving ? 'Setting up...' : getCtaLabel()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}