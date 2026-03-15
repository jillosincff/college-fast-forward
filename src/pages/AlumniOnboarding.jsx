import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

import AlumniOnboardingLayout from '../components/onboarding/alumni-v2/AlumniOnboardingLayout';
import AlumniStep1Details from '../components/onboarding/alumni-v2/AlumniStep1Details';
import AlumniStep2About from '../components/onboarding/alumni-v2/AlumniStep2About';
import AlumniStep3Industry from '../components/onboarding/alumni-v2/AlumniStep3Industry';
import AlumniStep4Intent from '../components/onboarding/alumni-v2/AlumniStep4Intent';
import AlumniStep5Help from '../components/onboarding/alumni-v2/AlumniStep5Help';
import AlumniStep6Pledge from '../components/onboarding/alumni-v2/AlumniStep6Pledge';
import AlumniStep7Ready from '../components/onboarding/alumni-v2/AlumniStep7Ready';
import AlumniOnboardingComplete from '../components/onboarding/alumni-v2/AlumniOnboardingComplete';

const TOTAL_STEPS = 7;

export default function AlumniOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    gradYear: '',
    major: '',
    minor: '',
    graduateDegrees: '',
    company: '',
    jobTitle: '',
    linkedinUrl: '',
    industries: [],
    intent: '', // 'help_students' or 'seeking_help'
    helpTypes: [],
    yearsExperience: '',
    bio: '',
    pledgeChecks: {},
    visibleInDirectory: true,
  });

  // Inject fonts
  useEffect(() => {
    if (!document.getElementById('alumni-ob-fonts')) {
      const link = document.createElement('link');
      link.id = 'alumni-ob-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const isHelper = formData.intent === 'help_students';
  const isSeeker = formData.intent === 'seeking_help';

  // Seekers skip step 5 (how to help)
  const goNext = () => {
    if (step === 4 && isSeeker) {
      setStep(6); // skip step 5
    } else {
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step === 6 && isSeeker) {
      setStep(4); // skip back over step 5
    } else {
      setStep(s => Math.max(1, s - 1));
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

      await base44.auth.updateMe(updateData);

      // Award karma
      try {
        await base44.functions.invoke('awardKarma', {
          parentUserId: user.id, parentEmail: user.email, parentName: user.full_name,
          actionType: 'onboarding_complete', referenceType: 'onboarding', referenceId: user.id,
          description: 'Completed alumni onboarding',
        });
      } catch (e) { console.log('Karma failed (non-critical):', e.message); }

      // Welcome email
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
    if (formData.intent === 'help_students') {
      navigate('ParentDashboard');
    } else {
      navigate('AlumniDashboard');
    }
  };

  // Completion screen (notifications)
  if (complete) {
    return <AlumniOnboardingComplete user={user} onDone={goToDashboard} />;
  }

  // Step 6: Pledge is full-screen (no two-panel)
  if (step === 6) {
    return (
      <AlumniStep6Pledge
        user={user}
        intent={formData.intent}
        onComplete={goNext}
        onBack={goBack}
      />
    );
  }

  // Steps 1-5, 7: Two-panel layout
  return (
    <AlumniOnboardingLayout step={step} totalSteps={TOTAL_STEPS} intent={formData.intent}>
      {step === 1 && (
        <AlumniStep1Details formData={formData} onUpdate={updateForm} onNext={goNext} />
      )}
      {step === 2 && (
        <AlumniStep2About formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />
      )}
      {step === 3 && (
        <AlumniStep3Industry formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />
      )}
      {step === 4 && (
        <AlumniStep4Intent formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />
      )}
      {step === 5 && (
        <AlumniStep5Help formData={formData} onUpdate={updateForm} onNext={goNext} onBack={goBack} />
      )}
      {step === 7 && (
        <AlumniStep7Ready
          formData={formData}
          onUpdate={updateForm}
          onFinish={handleFinish}
          onBack={goBack}
          loading={loading}
        />
      )}
    </AlumniOnboardingLayout>
  );
}