import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

import AlumniOnboardingLayout from '../components/onboarding/alumni-v2/AlumniOnboardingLayout';
import AlumniStep1Details from '../components/onboarding/alumni-v2/AlumniStep1Details';
import AlumniStep2About from '../components/onboarding/alumni-v2/AlumniStep2About';
import AlumniStep2Seeker from '../components/onboarding/alumni-v2/AlumniStep2Seeker';
import AlumniStep3Industry from '../components/onboarding/alumni-v2/AlumniStep3Industry';
import AlumniStep3ParentInvite from '../components/onboarding/alumni-v2/AlumniStep3ParentInvite';
import AlumniStep4Intent from '../components/onboarding/alumni-v2/AlumniStep4Intent';
import AlumniStep5Help from '../components/onboarding/alumni-v2/AlumniStep5Help';
import AlumniStep6Pledge from '../components/onboarding/alumni-v2/AlumniStep6Pledge';
import AlumniStep7Ready from '../components/onboarding/alumni-v2/AlumniStep7Ready';
import AlumniOnboardingComplete from '../components/onboarding/alumni-v2/AlumniOnboardingComplete';

/*
 * RECENT GRAD (2025/2026) — 6 logical steps:
 *   Step 1: Details → Step 2: What looking for + Industry → Step 3: Parent invite
 *   → Step 4: Pledge → Step 5: Ready → Step 6: Notifications (complete screen)
 *   Internal step numbers: 1,2,3,4,5, then complete=true
 *
 * ESTABLISHED (≤2024) — 7 logical steps:
 *   Step 1: Details → Step 2: About → Step 3: Industry → Step 4: Intent
 *   → Step 5: Help (helpers only, seekers skip) → Step 6: Pledge → Step 7: Ready
 *   → Notifications (complete screen)
 *   Internal step numbers: 1,2,3,4,5,6,7, then complete=true
 */

export default function AlumniOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const [formData, setFormData] = useState({
    gradYear: '',
    major: '',
    minor: '',
    graduateDegrees: '',
    company: '',
    jobTitle: '',
    linkedinUrl: '',
    targetRole: '',
    industries: [],
    intent: '',
    helpTypes: [],
    yearsExperience: '',
    bio: '',
    visibleInDirectory: true,
    seniority: '',
    linkedParentId: '',
    linkedParentEmail: '',
    invitedParentEmail: '',
  });

  const currentYear = new Date().getFullYear();
  const isRecentGrad = formData.seniority === 'recent_grad';
  const TOTAL_STEPS = isRecentGrad ? 6 : 7;
  const isHelper = formData.intent === 'help_students';
  const isSeeker = formData.intent === 'seeking_help';

  useEffect(() => {
    if (!document.getElementById('alumni-ob-fonts')) {
      const link = document.createElement('link');
      link.id = 'alumni-ob-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const updateForm = (updates) => {
    if (updates.gradYear) {
      const year = parseInt(updates.gradYear);
      // Hard cutoff: 2025 or later = recent_grad, 2024 and earlier = established
      const seniority = (year >= 2025) ? 'recent_grad' : 'established';
      updates.seniority = seniority;
      if (seniority === 'recent_grad') {
        updates.intent = 'seeking_help';
      }
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /*
   * RECENT GRAD navigation: 1→2→3→4(pledge)→5(ready)→complete
   * ESTABLISHED navigation:
   *   1→2→3→4→ helper:5→6(pledge)→7(ready)→complete
   *   1→2→3→4→ seeker:skip5→6(pledge)→7(ready)→complete
   */
  const goNext = () => {
    if (isRecentGrad) {
      // RG steps: 1,2,3,4(pledge),5(ready) → complete
      if (step === 5) {
        handleFinish();
        return;
      }
      setStep(s => s + 1);
    } else {
      // Established: 1,2,3,4,5,6(pledge),7(ready)
      if (step === 4 && isSeeker) {
        setStep(6); // seekers skip Help step 5
      } else if (step === 7) {
        handleFinish();
        return;
      } else {
        setStep(s => s + 1);
      }
    }
  };

  const goBack = () => {
    if (isRecentGrad) {
      setStep(s => Math.max(1, s - 1));
    } else {
      if (step === 6 && isSeeker) {
        setStep(4); // seekers skip back over Help step
      } else {
        setStep(s => Math.max(1, s - 1));
      }
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const updateData = {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        pledge_taken: true,
        pledge_taken_at: new Date().toISOString(),
        visible_in_directory: formData.visibleInDirectory,
        alumni_intent: formData.intent,
      };

      if (formData.gradYear) updateData.graduation_year = parseInt(formData.gradYear);
      if (formData.seniority) updateData.alumni_seniority = formData.seniority;
      if (formData.major.trim()) updateData.major = formData.major.trim();
      if (formData.minor.trim()) updateData.minor = formData.minor.trim();
      if (formData.graduateDegrees.trim()) updateData.graduate_degrees = formData.graduateDegrees.trim();
      if (formData.company.trim()) {
        updateData.current_company = formData.company.trim();
        updateData.company = formData.company.trim();
      }
      if (formData.jobTitle.trim()) {
        updateData.current_position = formData.jobTitle.trim();
        updateData.job_title = formData.jobTitle.trim();
      }
      if (formData.targetRole?.trim()) updateData.target_role = formData.targetRole.trim();
      if (formData.linkedinUrl.trim()) {
        const match = formData.linkedinUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
        if (match) updateData.linkedin_url = `https://linkedin.com/in/${match[1]}`;
        else if (formData.linkedinUrl.includes('linkedin')) updateData.linkedin_url = formData.linkedinUrl.trim();
      }
      if (formData.industries.length > 0) {
        updateData.industries = formData.industries;
        updateData.industry = formData.industries[0];
      }
      if (formData.helpTypes.length > 0) {
        updateData.expertise_areas = formData.helpTypes;
        updateData.help_types = formData.helpTypes;
      }
      if (formData.yearsExperience) updateData.years_experience = formData.yearsExperience;
      if (formData.bio.trim()) updateData.bio = formData.bio.trim();
      if (formData.linkedParentId) updateData.linked_parent_id = formData.linkedParentId;
      if (formData.linkedParentEmail) updateData.linked_parent_email = formData.linkedParentEmail;

      await base44.auth.updateMe(updateData);

      try {
        await base44.functions.invoke('awardKarma', {
          parentUserId: user.id, parentEmail: user.email, parentName: user.full_name,
          actionType: 'onboarding_complete', referenceType: 'onboarding', referenceId: user.id,
          description: 'Completed alumni onboarding',
        });
      } catch (e) { console.log('Karma failed (non-critical):', e.message); }

      try {
        base44.functions.invoke('sendWelcomeEmail', {
          userId: user.id, userEmail: user.email, userName: user.full_name,
          persona: 'alumni', userIndustries: formData.industries,
        }).catch(() => {});
      } catch {}

      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      if (refreshUser) await refreshUser();
      setComplete(true);
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    if (isRecentGrad || isSeeker) {
      navigate('Dashboard');
    } else {
      navigate('ParentDashboard');
    }
  };

  // Notifications screen
  if (complete) {
    return <AlumniOnboardingComplete user={user} onDone={goToDashboard} />;
  }

  // ═══════════════════════════════════════════════════════
  // RECENT GRAD PATH
  // ═══════════════════════════════════════════════════════
  if (isRecentGrad) {
    // RG Step 4 = Pledge (full screen)
    if (step === 4) {
      return (
        <AlumniStep6Pledge
          user={user}
          intent="seeking_help"
          isRecentGrad={true}
          onComplete={goNext}
          onBack={goBack}
        />
      );
    }

    return (
      <AlumniOnboardingLayout step={step} totalSteps={TOTAL_STEPS} intent="seeking_help" isRecentGrad={true} stepMap="recent_grad">
        {step === 1 && <AlumniStep1Details formData={formData} onUpdate={updateForm} onNext={goNext} />}
        {step === 2 && <AlumniStep2Seeker formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
        {step === 3 && <AlumniStep3ParentInvite formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
        {step === 5 && (
          <AlumniStep7Ready
            formData={formData}
            onUpdate={updateForm}
            onFinish={goNext}
            onBack={goBack}
            loading={loading}
          />
        )}
      </AlumniOnboardingLayout>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ESTABLISHED PATH
  // ═══════════════════════════════════════════════════════
  // EA Step 6 = Pledge (full screen)
  if (step === 6) {
    return (
      <AlumniStep6Pledge
        user={user}
        intent={formData.intent}
        isRecentGrad={false}
        onComplete={goNext}
        onBack={goBack}
      />
    );
  }

  return (
    <AlumniOnboardingLayout step={step} totalSteps={TOTAL_STEPS} intent={formData.intent} isRecentGrad={false} stepMap="established">
      {step === 1 && <AlumniStep1Details formData={formData} onUpdate={updateForm} onNext={goNext} />}
      {step === 2 && <AlumniStep2About formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 3 && <AlumniStep3Industry formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 4 && <AlumniStep4Intent formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 5 && <AlumniStep5Help formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 7 && (
        <AlumniStep7Ready
          formData={formData}
          onUpdate={updateForm}
          onFinish={goNext}
          onBack={goBack}
          loading={loading}
        />
      )}
    </AlumniOnboardingLayout>
  );
}