import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import GoogleSignInButton from '@/components/onboarding/student/GoogleSignInButton';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import StudentWelcomeScreen from '@/components/onboarding/student/StudentWelcomeScreen';
import { deriveSchoolCode } from '@/lib/schoolNames';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

/**
 * FLOW B — Student joins on their own (from role selection "I'm a Job Seeker").
 * 3 screens: Sign Up → Two Questions → Welcome Moment
 */
export default function StudentOnboarding() {
  const { user, refreshUser, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [school, setSchool] = useState('');
  const [parentCompany, setParentCompany] = useState('');
  const [showCompanyFeedback, setShowCompanyFeedback] = useState(false);

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('student-onb-fonts')) {
      const link = document.createElement('link');
      link.id = 'student-onb-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Capture referral code silently from URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const ref = hashParams.get('ref') || hashParams.get('referral');
    if (ref) {
      try { sessionStorage.setItem('pending_referral_code', ref); } catch (e) { /* ok */ }
      try { localStorage.setItem('parent_referral_code', ref); } catch (e) { /* ok */ }
    }
  }, []);

  // After OAuth completes — if already onboarded, redirect; otherwise pre-fill and advance
  useEffect(() => {
    if (!user || step !== 1) return;
    // Already onboarded — route them directly to the right dashboard
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
  }, [user, step]);

  // Handle OAuth error
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (hashParams.get('error')) {
      setError('Something went wrong. Please try again.');
    }
  }, []);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('pending_invite_role', 'student');
      // Safari clears localStorage during OAuth — sessionStorage survives
      sessionStorage.setItem('cff_onboarding_type', 'student');
    } catch (e) { /* private browsing */ }
    // Redirect back to StudentOnboarding so step 2 renders after OAuth
    base44.auth.redirectToLogin(window.location.origin + '/#StudentOnboarding');
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !school.trim()) return;
    setLoading(true);

    // Capture silent referral code
    let referralCode = null;
    try { referralCode = sessionStorage.getItem('pending_referral_code'); } catch (e) { /* ok */ }

    const schoolCode = deriveSchoolCode(school);

    const updateData = {
      persona: 'student',
      roles: ['student'],
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      is_new_signup: true,
      invite_code_used: 'direct',
      school: school.trim(),
      school_name: school.trim(),
      university: school.trim(),
      ...(schoolCode ? { school_code: schoolCode } : {}),
      first_name: firstName.trim(),
    };

    if (referralCode) updateData.referral_code = referralCode;
    if (user.full_name !== firstName.trim()) {
      updateData.full_name = firstName.trim();
    }

    try {
      await base44.auth.updateMe(updateData);

      // Save parent company if provided (non-blocking)
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
        
        // Show instant feedback
        setShowCompanyFeedback(true);
        setTimeout(async () => {
          setShowCompanyFeedback(false);
          // Auto-link to parent if any (non-blocking)
          base44.functions.invoke('linkStudentToParent', {
            action: 'auto_link',
            studentUserId: user.id,
            studentEmailAddress: user.email,
          }).catch(() => {});
          // Award karma (non-blocking)
          base44.functions.invoke('awardStudentKarma', {
            userId: user.id, userEmail: user.email,
            actionType: 'complete_profile', description: 'Completed student profile',
          }).catch(() => {});
          // Welcome email (non-blocking)
          base44.functions.invoke('sendWelcomeEmail', {
            userId: user.id, userEmail: user.email,
            userName: firstName.trim(), persona: 'student',
          }).catch(() => {});
          // Credit ambassador referral (non-blocking)
          if (referralCode) {
            base44.functions.invoke('trackReferralClick', {
              referral_code: referralCode,
              action: 'signup_completed',
              user_email: user.email,
            }).catch(() => {});
            try { sessionStorage.removeItem('pending_referral_code'); } catch (e) { /* ok */ }
          }
          // Claim parent referral if present (non-blocking)
          const parentRefCode = (() => { try { return localStorage.getItem('parent_referral_code'); } catch (e) { return null; } })();
          if (parentRefCode) {
            fetch('https://growth-hacker-marketing-agent-101dbdc8.base44.app/functions/claimParentReferral', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ referral_code: parentRefCode }),
              credentials: 'include',
            }).catch(() => {});
            try { localStorage.removeItem('parent_referral_code'); } catch (e) { /* ok */ }
          }
          localStorage.removeItem('pending_invite_role');
          try { sessionStorage.removeItem('cff_onboarding_type'); } catch (e) {}
          if (refreshUser) await refreshUser();
          setStep(3);
        }, 2000);
        return; // Exit early to show feedback animation
      }

      // No parent company - proceed normally
      // Auto-link to parent if any (non-blocking)
      base44.functions.invoke('linkStudentToParent', {
        action: 'auto_link',
        studentUserId: user.id,
        studentEmailAddress: user.email,
      }).catch(() => {});

      // Award karma (non-blocking)
      base44.functions.invoke('awardStudentKarma', {
        userId: user.id, userEmail: user.email,
        actionType: 'complete_profile', description: 'Completed student profile',
      }).catch(() => {});

      // Welcome email (non-blocking)
      base44.functions.invoke('sendWelcomeEmail', {
        userId: user.id, userEmail: user.email,
        userName: firstName.trim(), persona: 'student',
      }).catch(() => {});

      // Credit ambassador referral (non-blocking)
      if (referralCode) {
        base44.functions.invoke('trackReferralClick', {
          referral_code: referralCode,
          action: 'signup_completed',
          user_email: user.email,
        }).catch(() => {});
        try { sessionStorage.removeItem('pending_referral_code'); } catch (e) { /* ok */ }
      }

      // Claim parent referral if present (non-blocking)
      const parentRefCode = (() => { try { return localStorage.getItem('parent_referral_code'); } catch (e) { return null; } })();
      if (parentRefCode) {
        fetch('https://growth-hacker-marketing-agent-101dbdc8.base44.app/functions/claimParentReferral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referral_code: parentRefCode }),
          credentials: 'include',
        }).catch(() => {});
        try { localStorage.removeItem('parent_referral_code'); } catch (e) { /* ok */ }
      }

      localStorage.removeItem('pending_invite_role');
      try { sessionStorage.removeItem('cff_onboarding_type'); } catch (e) {}
      if (refreshUser) await refreshUser();
      setStep(3);
    } catch (e) {
      console.error('Onboarding update failed:', e.message);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = useCallback(() => {
    // Flow B: Go to PostJoinUpsell (7-day trial offer)
    navigate('PostJoinUpsell');
  }, []);

  // ── SCREEN 3: Welcome Moment ──
  if (step === 3) {
    return <StudentWelcomeScreen firstName={firstName} onComplete={handleWelcomeComplete} />;
  }

  // ── SCREEN 2: Two Questions ──
  if (step === 2 && user) {
    const isValid = firstName.trim().length > 0 && school.trim().length > 0;
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px' }}>
            <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>
              Almost there.
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888', lineHeight: 1.6, marginBottom: 32 }}>
              Just two quick things.
            </p>

            {/* First name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: ORANGE, marginBottom: 8,
              }}>
                First name
              </label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px',
                  fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = ORANGE; }}
                onBlur={e => { e.target.style.borderColor = '#2A2A2A'; }}
              />
            </div>

            {/* School */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: ORANGE, marginBottom: 8,
              }}>
                Your school
              </label>
              <SchoolSearchInput value={school} onChange={setSchool} />
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', marginTop: 8 }}>
                This helps us find alumni and opportunities specific to your campus.
              </p>
            </div>

            {/* Parent Company - Optional */}
            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#888', marginBottom: 8,
              }}>
                Where do your parents or guardians work? <span style={{ color: '#555', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                value={parentCompany}
                onChange={e => setParentCompany(e.target.value)}
                placeholder="e.g., Google, Deloitte, Mayo Clinic"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px',
                  fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = ORANGE; }}
                onBlur={e => { e.target.style.borderColor = '#2A2A2A'; }}
              />
              <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 8, padding: 12, marginTop: 12 }}>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#E85D20', marginBottom: 6 }}>
                  💡 Why do we ask this?
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888', lineHeight: 1.5, marginBottom: 6 }}>
                  The corporate game is rigged—80% of jobs are filled through personal connections, not cold job boards.
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888', lineHeight: 1.5, marginBottom: 6 }}>
                  College Fast Forward activates your Campus Ecosystem. By securely mapping where your family works, you help open up an Inside Track for a fellow student at your school.
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888', lineHeight: 1.5 }}>
                  In return, you get instant access to the Inside Tracks their families and alumni have opened up for you. It's how we all bypass the resume black hole together.
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 4, fontWeight: 400, color: '#555', fontStyle: 'italic', marginTop: 8 }}>
                  🔒 Zero Spam Guarantee: We will never email, call, or solicit your parents. This purely maps company availability to give your university ecosystem an unfair advantage.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 100, border: 'none',
                background: isValid && !loading ? ORANGE : 'rgba(232,93,32,0.3)',
                color: '#fff', fontFamily: dmSans, fontSize: 16, fontWeight: 600,
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                minHeight: 'auto', transition: 'background 0.2s',
              }}
            >
              {loading ? 'Setting up...' : 'Take Me In →'}
            </button>

            {/* Instant Feedback Animation */}
            {showCompanyFeedback && parentCompany && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(10,10,10,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24, zIndex: 9999,
              }}>
                <div style={{
                  background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 16,
                  padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center',
                  animation: 'fadeInUp 0.3s ease-out',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>
                    Boom! You just unlocked {parentCompany} network access
                  </h3>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888', lineHeight: 1.5 }}>
                    The entire {school} pool now has a warm entry point at {parentCompany}. In return, I've mapped out other parents and alums to help you jump the line this week.
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: ORANGE, marginTop: 16 }}>
                    Welcome to the engine. 🐊
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN 1: Sign Up ──
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
          {/* Label */}
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            color: ORANGE, marginBottom: 24,
          }}>
            College Fast Forward
          </p>

          {/* Header */}
          <h1 style={{
            fontFamily: dmSans, fontWeight: 700, fontSize: 'clamp(24px, 4vw, 30px)',
            color: '#fff', lineHeight: 1.3, marginBottom: 8,
          }}>
            {"Let's get you set up."}
          </h1>

          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888', marginBottom: 32 }}>
            Takes less than 60 seconds.
          </p>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'left' }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* CTA */}
          <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />

          {/* Fine print */}
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#555', marginTop: 16, lineHeight: 1.6 }}>
            By continuing you agree to our{' '}
            <a href="#Terms" style={{ color: '#888', textDecoration: 'underline' }}>Terms of Service</a> and{' '}
            <a href="#Privacy" style={{ color: '#888', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>

          {/* Sign in link */}
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888', marginTop: 24 }}>
            Already have an account?{' '}
            <button
              onClick={() => {
                try { localStorage.removeItem('pending_invite_role'); } catch (e) { /* ok */ }
                base44.auth.redirectToLogin(window.location.origin + '/#GatorAuth');
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE,
                minHeight: 'auto', width: 'auto', padding: 0,
              }}
            >
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}