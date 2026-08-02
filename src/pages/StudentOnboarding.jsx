import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import GoogleSignInButton from '@/components/onboarding/student/GoogleSignInButton';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import StudentWelcomeScreen from '@/components/onboarding/student/StudentWelcomeScreen';
import StudentMicroQuestions from '@/components/onboarding/student/StudentMicroQuestions';
import { deriveSchoolCode } from '@/lib/schoolNames';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

/**
 * FLOW B — Student joins on their own (from role selection "I'm a Job Seeker").
 * 3 screens: Sign Up → Two Questions → Welcome Moment
 */
export default function StudentOnboarding() {
  const { user, refreshUser, isLoadingAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [school, setSchool] = useState('');

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
    if (user.persona && user.onboarding_completed && user.full_name?.trim()) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('ParentAllSet');
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
    // loginWithProvider takes a relative return path the platform resolves against
    // the app's real base URL — avoids the fragile manual window.location.origin build
    // (which is "null" inside the sandboxed preview iframe).
    base44.auth.loginWithProvider('google', '/#StudentOnboarding');
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
      // NOTE: onboarding_completed is NOT set here — it flips only at the
      // welcome moment after the micro-questions have warmed the job feed.
      // Setting it early left drop-offs marked "done" with a cold start.
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
      // Three micro questions next — they power the job feed from day one
      setStep(2.5);
    } catch (e) {
      console.error('Onboarding update failed:', e.message);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = useCallback(async () => {
    // Flip onboarding_completed now that the job feed is warm and the welcome
    // moment is done. Reload (not a plain hash change) so the in-memory auth
    // context re-fetches the user — otherwise OnboardingGuard bounces the
    // stale "not completed" state back into onboarding (the screen-1 loop).
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      });
    } catch (e) { /* never block the dashboard on this */ }

    // Zeigarnik close: surface the "your first application package is ready" card
    // on the first dashboard visit. Flow A (OnboardingFlow) sets this same flag;
    // without it the FirstApplicationPackageCard stays hidden and the Magic
    // Moment is never offered — this was the single biggest funnel leak.
    try { localStorage.setItem('cff_first_draft_pending', 'true'); } catch (e) {}

    // Generate LinkedIn optimization in background (non-blocking)
    base44.functions.invoke('generateLinkedInOptimization', {}).catch(() => {});

    // Flow B: straight to the dashboard where the free Magic Moment application waits.
    // Pricing comes later — after the student has experienced CLIFF working.
    window.location.hash = '#/FreeTierDashboard';
    window.location.reload();
  }, []);

  // ── SCREEN 2.5: Three micro questions (20 seconds) — warms up the job feed ──
  if (step === 2.5 && user) {
    return <StudentMicroQuestions onComplete={() => setStep(3)} />;
  }

  // ── SCREEN 3: Welcome Moment ──
  if (step === 3) {
    return <StudentWelcomeScreen firstName={firstName} onComplete={handleWelcomeComplete} />;
  }

  // ── SCREEN 2: Two Questions ──
  if (step === 2 && user) {
    const isValid = firstName.trim().length > 0 && school.trim().length > 0;
    return (
      <div className="onb-screen" style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />
          </div>

          <div className="onb-card" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px' }}>
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

          </div>
        </div>
      </div>
    );
  }

  // While auth resolves (e.g. right after the Google OAuth redirect), show a
  // branded loader instead of the sign-up screen. Without this, returning
  // students see "Let's get you set up" flash before user loads — many think
  // sign-up failed and leave, a major contributor to the onboarding drop-off.
  if (!user && isLoadingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: ORANGE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── SCREEN 1: Sign Up ──
  return (
    <div className="onb-screen" style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div className="onb-card" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
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