import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import ParentStep1AboutYou from '../components/onboarding/parent-v3/ParentStep1AboutYou';
import ParentStep2InviteStudent from '../components/onboarding/parent-v3/ParentStep2InviteStudent';
import ParentWelcomeScreen from '../components/onboarding/parent-v3/ParentWelcomeScreen';

export default function ParentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [invited, setInvited] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', company: '', industry: '', introWillingness: 'yes',
    studentFirstName: '', studentEmail: '', studentUniversity: '',
  });

  // Pre-fill name from user profile
  useEffect(() => {
    if (user?.full_name && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: user.full_name }));
    }
  }, [user?.full_name]);

  const updateFormData = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const saveProfileAndContinue = async () => {
    // Save parent profile data
    const updateData = {
      full_name: formData.fullName.trim(),
      current_company: formData.company.trim(),
      company: formData.company.trim(),
      industry: formData.industry,
      industries: [formData.industry],
      intro_willingness: formData.introWillingness,
      visible_in_directory: false,
      directory_consent_given: false,
    };

    // Map intro willingness to ways_to_help
    if (formData.introWillingness === 'yes') {
      updateData.ways_to_help = ['networking_intros', 'career_advice'];
      updateData.help_types = ['networking_intros', 'career_advice'];
    } else if (formData.introWillingness === 'occasionally') {
      updateData.ways_to_help = ['career_advice'];
      updateData.help_types = ['career_advice'];
    }

    await base44.auth.updateMe(updateData);
    if (refreshUser) await refreshUser();
    setStep(2);
  };

  const handleInviteStudent = async () => {
    setIsSending(true);
    try {
      // Send the invitation email
      const parentFirstName = formData.fullName.split(' ')[0] || formData.fullName;
      await base44.functions.invoke('sendStudentInviteEmail', {
        student_email: formData.studentEmail.trim(),
        student_name: formData.studentFirstName.trim(),
        parent_name: parentFirstName,
      });

      // Link student email to parent profile
      const currentStudentEmails = user?.student_emails || [];
      const newEmail = formData.studentEmail.trim().toLowerCase();
      if (!currentStudentEmails.includes(newEmail)) {
        await base44.auth.updateMe({
          student_emails: [...currentStudentEmails, newEmail],
        });
      }

      setInvited(true);
      completeOnboarding(true);
    } catch (error) {
      console.error('Failed to send invite:', error);
      // Still proceed even if email fails
      setInvited(true);
      completeOnboarding(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkipInvite = () => {
    setInvited(false);
    completeOnboarding(false);
  };

  const completeOnboarding = async (didInvite) => {
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_flow_type: 'parent_v3',
        pledge_taken: true,
        pledge_taken_at: new Date().toISOString(),
        first_question_shown: true,
      });

      // Award karma (non-blocking)
      try {
        base44.functions.invoke('awardKarma', {
          parentUserId: user.id, parentEmail: user.email, parentName: formData.fullName,
          actionType: 'onboarding_complete', referenceType: 'onboarding', referenceId: user.id,
          description: 'Completed parent onboarding',
        }).catch(() => {});
      } catch {}

      // Send welcome email (non-blocking)
      try {
        base44.functions.invoke('sendWelcomeEmail', {
          userId: user.id, userEmail: user.email, userName: formData.fullName,
          persona: 'parent', userIndustries: [formData.industry],
        }).catch(() => {});
      } catch {}

      // Clean up invite session data
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }

    setStep(3);
  };

  const handleProfile = () => navigate('Profile');
  const handleActivateFastIQ = () => navigate('GetStarted');

  // Check if FastIQ is active for the student
  const isFastIQActive = user?.fastiq_active === true || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq';

  if (step === 1) {
    return (
      <ParentStep1AboutYou
        formData={formData}
        onUpdate={updateFormData}
        onNext={saveProfileAndContinue}
        onBack={() => navigate('GatorAuth')}
      />
    );
  }

  if (step === 2) {
    return (
      <ParentStep2InviteStudent
        formData={formData}
        onUpdate={updateFormData}
        onInvite={handleInviteStudent}
        onSkip={handleSkipInvite}
        onBack={() => setStep(1)}
        isLoading={isSending}
      />
    );
  }

  return (
    <ParentWelcomeScreen
      user={user}
      studentName={formData.studentFirstName || null}
      isFastIQActive={isFastIQActive}
      onActivate={handleActivateFastIQ}
      onSkip={handleProfile}
      onProfile={handleProfile}
    />
  );
}