import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { sendStudentInviteEmail } from '@/functions/sendStudentInviteEmail';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { deriveSchoolCode } from '@/lib/schoolNames';
import ParentStep1AboutYou from '../components/onboarding/parent-v3/ParentStep1AboutYou';
import ParentStep2InviteStudent from '../components/onboarding/parent-v3/ParentStep2InviteStudent';

export default function ParentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [invited, setInvited] = useState(false);
  const [invitedStudents, setInvitedStudents] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '', school: '', company: '', industry: '', introWillingness: 'yes', directoryVisible: true,
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
    setStep(2); // advance immediately so auth refresh doesn't reset step
    const schoolName = formData.school?.trim() || '';
    const schoolCode = deriveSchoolCode(schoolName);
    const updateData = {
      // Always assert persona so user exists in DB immediately
      persona: 'parent',
      roles: ['parent'],
      full_name: formData.fullName.trim(),
      school: schoolName,
      school_name: schoolName,
      ...(schoolCode ? { school_code: schoolCode } : {}),
      current_company: formData.company.trim(),
      company: formData.company.trim(),
      career_background: formData.careerBackground?.trim() || '',
      industry: formData.industry,
      industries: [formData.industry],
      intro_willingness: formData.introWillingness,
      visible_in_directory: formData.directoryVisible !== false,
      directory_consent_given: formData.directoryVisible !== false,
      ...(formData.linkedinUrl?.trim() ? { linkedin_url: formData.linkedinUrl.trim() } : {}),
    };
    if (!user?.founding_offer_started_at) {
      updateData.founding_offer_started_at = new Date().toISOString();
    }
    if (formData.introWillingness === 'yes') {
      updateData.ways_to_help = ['networking_intros', 'career_advice'];
      updateData.help_types = ['networking_intros', 'career_advice'];
    } else if (formData.introWillingness === 'occasionally') {
      updateData.ways_to_help = ['career_advice'];
      updateData.help_types = ['career_advice'];
    }
    try {
      await base44.auth.updateMe(updateData);
    } catch (err) {
      console.error('updateMe failed, continuing anyway:', err);
    }
  };

  const handleInviteStudent = async () => {
    setIsSending(true);
    try {
      const parentFirstName = formData.fullName.split(' ')[0] || formData.fullName;
      await sendStudentInviteEmail({
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
      // Derive the parent's school from whatever university was entered (even if they skipped the invite)
      const parentSchool = formData.school?.trim() || formData.studentUniversity?.trim() || invitedStudents[0]?.university?.trim() || '';
      const finalSchoolCode = deriveSchoolCode(parentSchool);
      await base44.auth.updateMe({
        // Always re-assert persona so user is always in DB with correct role
        persona: 'parent',
        roles: ['parent'],
        onboarding_completed: true,
        ...(parentSchool ? { school: parentSchool, school_name: parentSchool } : {}),
        ...(finalSchoolCode ? { school_code: finalSchoolCode } : {}),
        onboarding_completed_at: new Date().toISOString(),
        onboarding_flow_type: 'parent_v3',
        pledge_taken: true,
        pledge_taken_at: new Date().toISOString(),
        first_question_shown: true,
      });

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

      // Redeem student text-referral (grants student 3 days of premium)
      try {
        const refCode = localStorage.getItem('cff_parent_ref_code');
        if (refCode) {
          base44.functions.invoke('redeemParentReferral', { code: refCode }).catch(() => {});
          localStorage.removeItem('cff_parent_ref_code');
        }
      } catch {}

      // Clean up invite session data + auth loop counters
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      localStorage.removeItem('oauth_attempt_count');
      localStorage.removeItem('oauth_start_time');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }

    // Refresh auth context so layout routing sees onboarding_completed: true
    try { await refreshUser(); } catch (e) { /* non-blocking */ }

    // Navigate to the ParentAllSet success page
    navigate('ParentAllSet');
  };

  if (step === 1) {
    return (
      <ParentStep1AboutYou
        formData={formData}
        onUpdate={updateFormData}
        onNext={saveProfileAndContinue}
        onBack={() => navigate('GatorAuth')}
        loading={isSaving}
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

  // Fallback — should not reach here; navigate('ParentWelcome') handles exit
  return null;
}