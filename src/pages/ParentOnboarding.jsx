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
  const [invitedStudents, setInvitedStudents] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '', company: '', industry: '', introWillingness: 'yes', directoryVisible: true,
    studentFirstName: '', studentEmail: '', studentUniversity: '',
  });

  // Pre-fill name from user profile
  useEffect(() => {
    if (user?.full_name && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: user.full_name }));
    }
  }, [user?.full_name]);

  // Allow deep-linking to invite step from profile page
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (hashParams.get('step') === 'invite' && user?.onboarding_completed === true) {
      setStep(2);
    }
  }, [user?.onboarding_completed]);

  const updateFormData = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const saveProfileAndContinue = async () => {
    // Save parent profile data + founding offer timestamp
    const updateData = {
      full_name: formData.fullName.trim(),
      current_company: formData.company.trim(),
      company: formData.company.trim(),
      industry: formData.industry,
      industries: [formData.industry],
      intro_willingness: formData.introWillingness,
      visible_in_directory: formData.directoryVisible !== false,
      directory_consent_given: formData.directoryVisible !== false,
    };

    // Only set founding offer timestamp if not already set (prevents reset on back-navigation)
    if (!user?.founding_offer_started_at) {
      updateData.founding_offer_started_at = new Date().toISOString();
    }

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
      const parentFirstName = formData.fullName.split(' ')[0] || formData.fullName;
      await base44.functions.invoke('sendStudentInviteEmail', {
        student_email: formData.studentEmail.trim(),
        student_name: formData.studentFirstName.trim(),
        parent_name: parentFirstName,
        student_university: formData.studentUniversity || '',
      });

      // Link student email to parent profile (don't refreshUser to avoid remounting)
      const currentStudentEmails = user?.student_emails || [];
      const newEmail = formData.studentEmail.trim().toLowerCase();
      if (!currentStudentEmails.includes(newEmail)) {
        await base44.auth.updateMe({
          student_emails: [...currentStudentEmails, newEmail],
        });
      }

      // Track this invitation and reset form for next student
      const invitedName = formData.studentFirstName.trim();
      const invitedUni = formData.studentUniversity || '';
      setInvitedStudents(prev => [...prev, { name: invitedName, email: newEmail, university: invitedUni }]);
      setFormData(prev => ({ ...prev, studentFirstName: '', studentEmail: '', studentUniversity: '' }));
      setInvited(true);
    } catch (error) {
      console.error('Failed to send invite:', error);
      // Still track on failure so user isn't stuck
      const invitedName = formData.studentFirstName.trim();
      const invitedEmail = formData.studentEmail.trim().toLowerCase();
      const invitedUni = formData.studentUniversity || '';
      setInvitedStudents(prev => [...prev, { name: invitedName, email: invitedEmail, university: invitedUni }]);
      setFormData(prev => ({ ...prev, studentFirstName: '', studentEmail: '', studentUniversity: '' }));
      setInvited(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkipInvite = () => {
    completeOnboarding(invitedStudents.length > 0);
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

      // Send parent welcome email (non-blocking)
      try {
        base44.functions.invoke('sendParentWelcomeEmail', {
          userEmail: user.email,
          firstName: formData.fullName.split(' ')[0],
          studentName: invitedStudents.length > 0 ? invitedStudents[0].name : '',
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

  const handleProfile = () => navigate('ParentHome');
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
        invitedStudents={invitedStudents}
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