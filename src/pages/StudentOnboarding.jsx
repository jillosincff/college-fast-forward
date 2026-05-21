import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import GoogleSignInButton from '@/components/onboarding/student/GoogleSignInButton';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import { deriveSchoolCode } from '@/lib/schoolNames';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [school, setSchool] = useState('');
  const [parentCompany, setParentCompany] = useState('');
  const [showCompanyFeedback, setShowCompanyFeedback] = useState(false);
  const [careerGoal, setCareerGoal] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [linkedInOptimized, setLinkedInOptimized] = useState(false);

  useEffect(() => {
    if (!document.getElementById('student-onb-fonts')) {
      const link = document.createElement('link');
      link.id = 'student-onb-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const ref = hashParams.get('ref') || hashParams.get('referral');
    if (ref) {
      try { sessionStorage.setItem('pending_referral_code', ref); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user && step === 1) {
      // Already onboarded — route them to the right dashboard
      if (user.persona && user.onboarding_completed) {
        if (user.persona === 'parent' || user.roles?.includes('parent')) {
          navigate('ParentHome');
        } else if (user.persona === 'alumni' && user.alumni_intent === 'giving_help') {
          navigate('AlumniHome');
        } else {
          navigate('FreeTierDashboard');
        }
        return;
      }
      const name = user.full_name?.split(' ')[0] || '';
      setFirstName(name);
      setStep(2);
    }
  }, [user, step]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
    } catch (e) {}
    base44.auth.redirectToLogin(window.location.origin + '/#StudentOnboarding');
  };

  const completeLifecycle = async (referralCode) => {
    base44.functions.invoke('linkStudentToParent', { action: 'auto_link', studentUserId: user.id, studentEmailAddress: user.email }).catch(() => {});
    base44.functions.invoke('awardStudentKarma', { userId: user.id, userEmail: user.email, actionType: 'complete_profile' }).catch(() => {});
    base44.functions.invoke('sendWelcomeEmail', { userId: user.id, userEmail: user.email, userName: firstName.trim(), persona: 'student' }).catch(() => {});
    if (referralCode) {
      base44.functions.invoke('trackReferralClick', { referral_code: referralCode, action: 'signup_completed', user_email: user.email }).catch(() => {});
    }
    if (refreshUser) await refreshUser();
    setLoading(false);
    navigate('FreeTierDashboard');
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    let referralCode = null;
    try { referralCode = sessionStorage.getItem('pending_referral_code'); } catch (e) {}
    const schoolCode = deriveSchoolCode(school);

    const updateData = {
      persona: 'student',
      roles: ['student'],
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      is_new_signup: true,
      school: school.trim(),
      school_name: school.trim(),
      university: school.trim(),
      first_name: firstName.trim(),
    };

    if (schoolCode) updateData.school_code = schoolCode;
    if (referralCode) updateData.referral_code = referralCode;

    try {
      await base44.auth.updateMe(updateData);

      if (parentCompany.trim()) {
        base44.entities.ParentNetworkProfile.create({
          first_name: firstName.trim(),
          last_name: user?.full_name?.split(' ').slice(1).join(' ') || 'Student',
          company_name: parentCompany.trim(),
          company_domain: parentCompany.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
          role_title: 'Parent/Guardian',
          school_code: schoolCode || '',
          is_active: true,
        }).catch(() => {});

        setShowCompanyFeedback(true);
        setTimeout(async () => {
          setShowCompanyFeedback(false);
          await completeLifecycle(referralCode);
        }, 2000);
        return;
      }

      await completeLifecycle(referralCode);
    } catch (e) {
      setError('System update failed. Please try again.');
      setLoading(false);
    }
  };

  const OnboardingLayout = ({ currentStep, totalSteps, children }) => (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: (idx + 1) === currentStep ? ORANGE : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 16, padding: '40px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // SCREEN 1: Authentication Gateway
  if (step === 1) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={9}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: ORANGE, marginBottom: 16 }}>College Fast Forward</p>
          <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 28, color: '#fff', marginBottom: 8 }}>Let's get you set up.</h1>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 32 }}>Takes less than 60 seconds.</p>
          {error && (
            <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
            </div>
          )}
          <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />
        </div>
      </OnboardingLayout>
    );
  }

  // SCREEN 2: Welcome & Co-Pilot
  if (step === 2) {
    if (!user) {
      return (
        <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontFamily: dmSans, fontSize: 14 }}>Loading...</div>
        </div>
      );
    }
    return (
      <OnboardingLayout currentStep={2} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 26, color: '#fff', marginBottom: 12 }}>Welcome, {firstName}!</h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, color: '#AAA', lineHeight: '1.6', marginBottom: 32 }}>
          Think of College Fast Forward as your personal career co-pilot. We aren't here to make you fill out endless applications—we're here to build your competitive engine.
        </p>
        <button onClick={() => setStep(3)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: 'pointer', minHeight: 'auto' }}>
          Meet the Team →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 3: Built by Experts
  if (step === 3) {
    return (
      <OnboardingLayout currentStep={3} totalSteps={9}>
        <span style={{ background: 'rgba(232,93,32,0.1)', color: ORANGE, fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Built by Experts</span>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 24, color: '#fff', marginTop: 16, marginBottom: 12 }}>No generic templates here.</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: '1.6', marginBottom: 32 }}>
          This system was custom engineered by senior career technology professionals who got exhausted watching excellent students get automatically vaporized by corporate parsing scripts.
        </p>
        <button onClick={() => setStep(4)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: 'pointer', minHeight: 'auto' }}>
          See the Strategy →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 4: The Frustration Screen
  if (step === 4) {
    return (
      <OnboardingLayout currentStep={4} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>The cold application market is completely broken.</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#EC5B5B', fontWeight: 500, marginBottom: 16 }}>❌ Spatially spamming 500 portals = getting ghosted.</p>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: '1.6', marginBottom: 32 }}>
          Mass-applying drops your profile straight into algorithmic black holes. CLiFF fixes this by completely reversing the framework: we map target actions to isolated lanes.
        </p>
        <button onClick={() => setStep(5)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: 'pointer', minHeight: 'auto' }}>
          Lock in Your Intent →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 5: What Are You Looking For?
  if (step === 5) {
    const options = [
      { id: 'internship', title: 'Summer 2027 Internship' },
      { id: 'fulltime', title: 'Graduation Full-Time Career' },
      { id: 'explore', title: 'Isolating High-Yield Paths' }
    ];
    return (
      <OnboardingLayout currentStep={5} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>What are you tracking?</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 24 }}>We optimize your engine parameters based on this anchor target.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {options.map(opt => (
            <div
              key={opt.id}
              onClick={() => setCareerGoal(opt.id)}
              style={{ padding: '16px', borderRadius: 12, border: careerGoal === opt.id ? `2px solid ${ORANGE}` : '1px solid #2A2A2A', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500 }}
            >
              {opt.title}
            </div>
          ))}
        </div>
        <button disabled={!careerGoal} onClick={() => setStep(6)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: careerGoal ? ORANGE : '#2A2A2A', color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: careerGoal ? 'pointer' : 'not-allowed', minHeight: 'auto' }}>
          Continue →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 6: Location Preference
  if (step === 6) {
    return (
      <OnboardingLayout currentStep={6} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>Target Footprint</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 24 }}>Where are we looking to establish inside tracks?</p>
        <input
          value={locationPreference}
          onChange={e => setLocationPreference(e.target.value)}
          placeholder="e.g., New York, Charlotte, Remote"
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', fontFamily: dmSans, fontSize: 15, color: '#fff', boxSizing: 'border-box', marginBottom: 24 }}
        />
        <button disabled={!locationPreference.trim()} onClick={() => setStep(7)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: locationPreference.trim() ? ORANGE : '#2A2A2A', color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: locationPreference.trim() ? 'pointer' : 'not-allowed', minHeight: 'auto' }}>
          Continue →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 7: Resume
  if (step === 7) {
    return (
      <OnboardingLayout currentStep={7} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>Resume Formatting Repair</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 24 }}>Prepare your file structure to slide right past AI filtration gates.</p>
        <div
          onClick={() => setResumeUploaded(true)}
          style={{ border: '2px dashed #333', padding: '32px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: resumeUploaded ? 'rgba(46,125,50,0.1)' : 'transparent', borderColor: resumeUploaded ? '#2E7D32' : '#333', marginBottom: 24 }}
        >
          <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📄</span>
          <span style={{ color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 500 }}>
            {resumeUploaded ? 'Resume Parsing Configured!' : 'Tap to sync baseline resume file'}
          </span>
        </div>
        <button onClick={() => setStep(8)} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: 'pointer', minHeight: 'auto' }}>
          {resumeUploaded ? 'Next Step' : 'Skip for Now'} →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 8: LinkedIn Optimization
  if (step === 8) {
    return (
      <OnboardingLayout currentStep={8} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>Profile Optimization</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 24 }}>Ensure your digital footprint completely matches your target assets before network execution.</p>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2A2A2A', padding: '16px', borderRadius: 12, color: '#AAA', fontSize: 14, fontFamily: dmSans, lineHeight: '1.5', marginBottom: 24 }}>
          💡 <strong style={{ color: '#fff' }}>Agent Tip:</strong> Inside tracks check your social links immediately. We'll deploy optimized headlines directly to your profile workspace.
        </div>
        <button onClick={() => { setLinkedInOptimized(true); setStep(9); }} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: 'pointer', minHeight: 'auto' }}>
          Connect Engine Asset Base →
        </button>
      </OnboardingLayout>
    );
  }

  // SCREEN 9: Finalize
  if (step === 9) {
    const isFormValid = school.trim().length > 0;
    return (
      <OnboardingLayout currentStep={9} totalSteps={9}>
        <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>Finalizing Inside Tracks</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 24 }}>Map your local ecosystem coordinates.</p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: ORANGE, marginBottom: 8 }}>Your School</label>
          <SchoolSearchInput value={school} onChange={setSchool} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
            Parents' Employer <span style={{ color: '#555', fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            value={parentCompany}
            onChange={e => setParentCompany(e.target.value)}
            placeholder="e.g., Apple, McKinsey"
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', fontFamily: dmSans, fontSize: 15, color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleFinalSubmit}
          disabled={!isFormValid || loading}
          style={{ width: '100%', padding: '16px', borderRadius: 100, border: 'none', background: isFormValid && !loading ? ORANGE : 'rgba(232,93,32,0.2)', color: '#fff', fontWeight: 600, fontFamily: dmSans, cursor: isFormValid && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto' }}
        >
          {loading ? 'Activating Agent...' : 'Deploy My Agent ⚡'}
        </button>

        {showCompanyFeedback && parentCompany && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,10,10,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 16, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>Unlocked {parentCompany}</h3>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', margin: 0 }}>Your school now has a direct insider channel locked into the registry.</p>
            </div>
          </div>
        )}
      </OnboardingLayout>
    );
  }

  return null;
}

StudentOnboarding.isPublic = true;