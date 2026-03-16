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
import AlumniStep5Help from '../components/onboarding/alumni-v2/AlumniStep5Help';
import AlumniStep6Pledge from '../components/onboarding/alumni-v2/AlumniStep6Pledge';
import AlumniStep7Ready from '../components/onboarding/alumni-v2/AlumniStep7Ready';
import AlumniOnboardingComplete from '../components/onboarding/alumni-v2/AlumniOnboardingComplete';

/*
 * RECENT GRAD (2025/2026) — 6 steps, seeker by default:
 *   1: Details → 2: What looking for → 3: Parent invite
 *   → 4: Pledge (seeker) → 5: Almost There → finish → Notifications
 *
 * ESTABLISHED (≤2024) — 6 steps, helper by default:
 *   1: Details → 2: About → 3: Industry → 4: How to Help
 *   → 5: Pledge (helper) → 6: Almost There → finish → Notifications
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

  const isRecentGrad = formData.seniority === 'recent_grad';
  const TOTAL_STEPS = 6; // Both paths are now 6 steps

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
      const seniority = (year >= 2025) ? 'recent_grad' : 'established';
      updates.seniority = seniority;
      // Auto-set intent based on seniority — no user choice needed
      updates.intent = seniority === 'recent_grad' ? 'seeking_help' : 'help_students';
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /*
   * Both paths: 6 linear steps, no forks.
   * Recent Grad: 1→2→3→4(pledge)→5(ready)→finish
   * Established: 1→2→3→4→5(pledge)→6(ready)→finish
   */
  const goNext = () => {
    const lastStep = isRecentGrad ? 5 : 6;
    if (step === lastStep) { handleFinish(); return; }
    setStep(s => s + 1);
  };

  const goBack = () => {
    setStep(s => Math.max(1, s - 1));
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
    if (isRecentGrad) {
      navigate('RecentGradDashboard');
    } else {
      navigate('AlumniDashboard');
    }
  };

  // Notifications screen (after onboarding saved)
  if (complete) {
    return <AlumniOnboardingComplete user={user} onDone={goToDashboard} />;
  }

  // ═══════════════════════════════════════════════════════
  // RECENT GRAD PATH (2025/2026) — 6 steps, seeker by default
  //   1: Details → 2: What looking for → 3: Parent invite
  //   → 4: Pledge (seeker) → 5: Almost There → finish → Notifications
  // ═══════════════════════════════════════════════════════
  if (isRecentGrad) {
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
      <AlumniOnboardingLayout step={step} totalSteps={TOTAL_STEPS} intent="seeking_help" isRecentGrad={true}>
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
  // ESTABLISHED PATH (≤2024) — 6 steps, helper by default
  //   1: Details → 2: About → 3: Industry → 4: How to Help
  //   → 5: Pledge (helper) → 6: Almost There → finish → Notifications
  // ═══════════════════════════════════════════════════════
  if (step === 5) {
    return (
      <AlumniStep6Pledge
        user={user}
        intent="help_students"
        isRecentGrad={false}
        onComplete={goNext}
        onBack={goBack}
      />
    );
  }

  return (
    <AlumniOnboardingLayout step={step} totalSteps={TOTAL_STEPS} intent="help_students" isRecentGrad={false}>
      {step === 1 && <AlumniStep1Details formData={formData} onUpdate={updateForm} onNext={goNext} />}
      {step === 2 && <AlumniStep2About formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 3 && <AlumniStep3Industry formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 4 && <AlumniStep5Help formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />}
      {step === 6 && (
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