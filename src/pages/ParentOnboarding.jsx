import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import ParentProgressBar from '../components/onboarding/parent/ParentProgressBar';
import ParentStep1LeftPanel from '../components/onboarding/parent/ParentStep1LeftPanel';
import ParentStep2LeftPanel from '../components/onboarding/parent/ParentStep2LeftPanel';
import ParentStep3LeftPanel from '../components/onboarding/parent/ParentStep3LeftPanel';
import ParentOnboardingStep1 from '../components/onboarding/parent/ParentOnboardingStep1';
import ParentOnboardingStep2 from '../components/onboarding/parent/ParentOnboardingStep2';
import LinkStudentStep from '../components/onboarding/parent/LinkStudentStep';
import CFFPledgePage from '../components/onboarding/parent/CFFPledgePage';
import PostPledgeQuestion from '../components/onboarding/parent/PostPledgeQuestion';

export default function ParentOnboarding() {
  const { user, refreshUser } = useAuth();

  const getInitialStep = () => {
    if (user?.pledge_taken === true && user?.first_question_shown === false) return 5;
    if (user?.onboarding_completed && !user?.pledge_taken) return 4;
    if (!user?.pledge_taken && user?.current_position) return 4;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep);
  const [loading, setLoading] = useState(false);
  const [linkedStudentEmail, setLinkedStudentEmail] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '', jobTitle: '', company: '', yearsExperience: '',
    linkedinUrl: '', bio: '', industries: [], waysToHelp: [],
  });

  // Inject fonts
  useEffect(() => {
    if (!document.getElementById('parent-onboarding-fonts')) {
      const link = document.createElement('link');
      link.id = 'parent-onboarding-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const updateFormData = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const handleLinkStudentComplete = (result) => {
    if (result?.studentEmail) setLinkedStudentEmail(result.studentEmail);
    saveProfileAndGoToPledge();
  };

  const handleLinkStudentSkip = () => saveProfileAndGoToPledge();

  const saveProfileAndGoToPledge = async () => {
    setLoading(true);
    try {
      const updateData = {
        current_position: formData.jobTitle?.trim() || undefined,
        current_company: formData.company?.trim() || undefined,
        job_title: formData.jobTitle?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        years_experience: formData.yearsExperience || undefined,
        linkedin_url: formData.linkedinUrl?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
        industries: formData.industries,
        industry: formData.industries[0] || undefined,
        ways_to_help: formData.waysToHelp,
        expertise_areas: formData.waysToHelp,
        help_types: formData.waysToHelp,
        visible_in_directory: true,
      };
      Object.keys(updateData).forEach(key => { if (updateData[key] === undefined) delete updateData[key]; });
      await base44.auth.updateMe(updateData);
      if (refreshUser) await refreshUser();
      setStep(4);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePledgeComplete = () => setStep(5);

  const handlePostPledgeComplete = async (result) => {
    setLoading(true);
    try {
      const updateData = { onboarding_completed: true, onboarding_completed_at: new Date().toISOString() };
      if (result?.answered) updateData.onboarding_question_answered = true;
      await base44.auth.updateMe(updateData);

      try {
        await base44.functions.invoke('awardKarma', {
          parentUserId: user.id, parentEmail: user.email, parentName: user.full_name,
          actionType: 'onboarding_complete', referenceType: 'onboarding', referenceId: user.id,
          description: 'Completed parent onboarding',
        });
      } catch (e) { console.log('Onboarding karma failed:', e.message); }

      try {
        base44.functions.invoke('sendWelcomeEmail', {
          userId: user.id, userEmail: user.email, userName: user.full_name,
          persona: 'parent', userIndustries: user.industries || formData?.industries || [],
        }).catch(() => {});
      } catch {}

      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      try {
        const utmSource = sessionStorage.getItem('utm_source');
        const utmCampaign = sessionStorage.getItem('utm_campaign');
        let source = 'organic';
        if (utmSource === 'newsletter' && utmCampaign) source = `newsletter_${utmCampaign}`;
        else if (utmSource) source = utmSource;
        await base44.entities.ActivationPrompt.create({
          user_id: user.id, user_type: 'parent', user_email: user.email,
          prompt_stage: 'welcome', status: result?.answered ? 'acted' : 'pending',
          action_taken: !!result?.answered, action_type: result?.answered ? 'answered_question' : null,
          acted_at: result?.answered ? new Date().toISOString() : null, source,
        });
      } catch {}

      if (refreshUser) await refreshUser();
      navigate('ParentDashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Post-pledge question
  if (step === 5) return <PostPledgeQuestion user={user} formData={formData} onComplete={handlePostPledgeComplete} />;

  // Step 4: Pledge (full screen)
  if (step === 4) return <CFFPledgePage user={user} onComplete={handlePledgeComplete} />;

  // Steps 1–3: Two-column layout
  const LeftPanel = step === 1 ? ParentStep1LeftPanel : step === 2 ? ParentStep2LeftPanel : ParentStep3LeftPanel;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f2ee' }}>
      <style>{`
        @media(max-width:768px) {
          .po-layout { flex-direction: column !important; }
          .po-left { display: none !important; }
          .po-mobile-header { display: block !important; }
          .po-right { padding: 24px 20px !important; }
        }
      `}</style>

      <ParentProgressBar currentStep={step} />

      <div className="po-layout" style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        {/* Left panel */}
        <div className="po-left hidden md:block" style={{ width: '45%', flexShrink: 0, minHeight: '100%', position: 'sticky', top: 52, height: 'calc(100vh - 52px)', overflowY: 'auto' }}>
          <div style={{ height: '100%' }}>
            <LeftPanel />
          </div>
          {/* Mobile condensed */}
          <div className="md:hidden" style={{
            background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
            padding: '24px 20px', minHeight: 180,
          }}>
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: '#f4f0e8', marginBottom: 6 }}>Help students find you</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>Set up your profile so students can reach out</p>
              </div>
            )}
            {step === 2 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: '#f4f0e8', marginBottom: 6 }}>What's your background?</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>Help us match you with the right students</p>
              </div>
            )}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: '#f4f0e8', marginBottom: 6 }}>Link your student</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>Connect your accounts to activate Karma boosts</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="po-right" style={{
          flex: 1, background: '#f4f2ee',
          padding: '48px 48px 60px', overflowY: 'auto',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#E85D20', marginBottom: 12 }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, color: '#888' }}>Setting up your account...</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <ParentOnboardingStep1
                    formData={formData}
                    onUpdate={updateFormData}
                    onNext={() => setStep(2)}
                    userName={user?.full_name}
                  />
                )}
                {step === 2 && (
                  <ParentOnboardingStep2
                    formData={formData}
                    onUpdate={updateFormData}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <LinkStudentStep
                    user={user}
                    onNext={handleLinkStudentComplete}
                    onSkip={handleLinkStudentSkip}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}