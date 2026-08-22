import React, { useEffect, useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import QuickOnboarding from '@/components/onboarding-flow/QuickOnboarding';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { buildLocationMemories } from '@/lib/locationPrefs';
import { saveParsedResume } from '@/lib/resumeText';
import { buildCareerGoalsFromOnboarding } from '@/lib/onboardingGoals';

console.log('🔵 [GatorAuth] Module loaded');

const dmSans = "'DM Sans', system-ui, sans-serif";
const ACCENT = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

function AuthPageShell({ children }) {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>{children}</div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function GatorAuth() {
  const { user, isLoadingAuth: isLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(null);
  const [resumeScreen, setResumeScreen] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    // New visitors arriving from the landing "Get Started" CTA carry an
    // onboarding-intent flag; show them Sign up, not Sign in. Returning users
    // clicking "Log In" from the nav have no flag → default to Sign in.
    try {
      const role = localStorage.getItem('pending_invite_role')
        || sessionStorage.getItem('pending_invite_role');
      const onbType = sessionStorage.getItem('cff_onboarding_type');
      if (role === 'student' || onbType === 'student') return 'signup';
    } catch (e) { /* private browsing */ }
    return 'signin';
  });
  const [isMigration] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('migration') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  // Sign in state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  
  // Sign up state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Forgot-password state — handled inline, no separate page
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Toggle password visibility — cuts typos that kill signups
  const [showPw, setShowPw] = useState(false);

  // OTP verification step (after native signup)
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingOtpPassword, setPendingOtpPassword] = useState('');

  // After a session is minted (login or OTP verify), refresh auth so checkAndRoute runs
  // and routes the user (new → 13-step onboarding, returning → dashboard).
  const completeAuth = async () => {
    try { await refreshUser(); } catch (e) {}
    // Dismiss the OTP screen — while pendingOtpEmail is set, render short-circuits
    // to the OTP form and the user gets stuck there even after routing decides.
    setPendingOtpEmail('');
    setPendingOtpPassword('');
    setStep(null); // re-trigger the routing effect via loading state
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!signinEmail || !signinPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      // Native, silent login — mints a real Base44 session in-place (no redirect, no Base44 page).
      const res = await base44.auth.loginViaEmailPassword(signinEmail.trim().toLowerCase(), signinPassword);
      const token = res?.access_token || res?.data?.access_token;
      if (token) base44.auth.setToken(token);
      await completeAuth();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || '';
      if (/verify/i.test(detail)) {
        // Account exists but email not verified yet — send them to the OTP step.
        // Do NOT auto-resend: that issues a NEW code and invalidates the one already
        // sitting in their inbox, causing a correct code to read as "wrong/expired".
        // They can press "Resend code" on the OTP screen if they truly need a fresh one.
        setPendingOtpPassword(signinPassword);
        setPendingOtpEmail(signinEmail.trim());
      } else {
        setError(detail || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim() || !lastName.trim() || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields including first and last name.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      // Native registration — creates the account and emails a 6-digit verification code.
      const cleanEmail = signupEmail.trim().toLowerCase();
      // Retry once on transient connection timeouts — the platform's database
      // occasionally has brief connectivity hiccups that succeed on retry.
      let regErr = null;
      try {
        await base44.auth.register({ email: cleanEmail, password: signupPassword, full_name: fullName });
      } catch (err) {
        const et = err?.response?.data?.error_type || '';
        if (/timeout|connect/i.test(et)) {
          await new Promise(r => setTimeout(r, 1500));
          try {
            await base44.auth.register({ email: cleanEmail, password: signupPassword, full_name: fullName });
          } catch (retryErr) { regErr = retryErr; }
        } else { regErr = err; }
      }
      if (regErr) throw regErr;
      // Defer email verification: try to mint a session immediately so the
      // student can start onboarding now and confirm their email later. The
      // verification email is still sent — we just don't block the funnel on
      // it. If the platform requires verification before issuing a session,
      // fall back to the OTP step (current behavior, no regression).
      try {
        const res = await base44.auth.loginViaEmailPassword(cleanEmail, signupPassword);
        const token = res?.access_token || res?.data?.access_token;
        if (token) {
          base44.auth.setToken(token);
          await completeAuth();
          return;
        }
      } catch (loginErr) {
        // Unverified account can't log in yet — show the OTP step.
      }
      setPendingOtpPassword(signupPassword);
      setPendingOtpEmail(cleanEmail);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || '';
      const errorType = err?.response?.data?.error_type || '';
      if (/already|exist|registered/i.test(detail)) {
        setError('An account with this email already exists. Try signing in.');
      } else if (/timeout|connect/i.test(errorType)) {
        setError('Connection timed out. Please try again — this is usually temporary.');
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Platform-native password reset — updates the SAME password the sign-in form
  // checks. (The old custom reset wrote to a separate field that login never
  // read, which is why resets appeared to "work" but sign-in still failed.)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!forgotEmail) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(forgotEmail.trim().toLowerCase());
      setInfo('If an account exists for that email, we just sent a reset link. Check your inbox.');
    } catch (err) {
      setError('Could not send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Only set onboarding type flag if user is NOT already logged in (i.e., truly a new sign-up flow)
    // This prevents returning users who click Google from being funnelled back into onboarding
    try {
      const existingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
      if (existingRole) {
        // Only preserve an explicitly set role (e.g. parent from landing page)
        localStorage.setItem('pending_invite_role', existingRole);
        sessionStorage.setItem('cff_onboarding_type', existingRole);
      }
      // Do NOT set cff_onboarding_type for plain sign-ins — returning users must not see onboarding
    } catch (e) { /* private browsing */ }
    // Preserve any returnTo so Google sign-ins land back on the intended page.
    let returnSuffix = '';
    try {
      const hashQuery = window.location.hash.split('?')[1] || '';
      const returnTo = new URLSearchParams(hashQuery).get('returnTo');
      if (returnTo) returnSuffix = '?returnTo=' + encodeURIComponent(returnTo);
    } catch (e) { /* ignore */ }
    base44.auth.loginWithProvider('google', window.location.origin + '/#/GatorAuth' + returnSuffix);
  };

  useEffect(() => {
    if (isLoading) return;

    // Not logged in — show the auth form
    if (!user) {
      setStep('auth');
      return;
    }

    const pendingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');

    // Verify the User entity record actually exists in the database.
    // If a user deletes their record but keeps their auth account, auth.me() still
    // returns persona/onboarding_completed from the auth layer — we must ignore those
    // stale flags and treat them as a brand-new user.
    const checkAndRoute = async () => {
      // ── FIRST: verify the User entity record actually exists in the database. ──
      // If a user was deleted (e.g. admin testing) but keeps their auth account,
      // auth.me() still returns stale persona/onboarding_completed flags — AND
      // localStorage may still have cff_funnel_completed from a prior test run.
      // We must clear ALL stale funnel state and route to QuickOnboarding fresh.
      let entityExists = true;
      try {
        const records = await base44.entities.User.filter({ email: user.email }, undefined, 1);
        entityExists = Array.isArray(records) && records.length > 0;
      } catch (e) {
        entityExists = true; // assume exists to avoid breaking normal returning users
      }

      if (!entityExists) {
        // Wipe stale auth-level flags + ALL funnel localStorage so the user
        // starts QuickOnboarding completely fresh (no stale career_goals, etc.)
        try { await base44.auth.updateMe({ persona: '', onboarding_completed: false }); } catch (e) {}
        try {
          localStorage.removeItem('cff_funnel_completed');
          sessionStorage.removeItem('cff_funnel_completed');
          localStorage.removeItem('cff_onboarding_screen');
          localStorage.removeItem('cff_onboarding_type');
          sessionStorage.removeItem('cff_onboarding_type');
          localStorage.removeItem('cff_college');
          localStorage.removeItem('cff_blockers');
          localStorage.removeItem('cff_industries');
          localStorage.removeItem('cff_target_roles');
          localStorage.removeItem('cff_location');
          localStorage.removeItem('cff_location_pref');
          localStorage.removeItem('cff_location_city');
          localStorage.removeItem('cff_work_location');
          localStorage.removeItem('cff_seeking');
          localStorage.removeItem('cff_resume_url');
          localStorage.removeItem('cff_resume_status');
          localStorage.removeItem('cff_resume_parsed');
          localStorage.removeItem('cff_resume_filename');
          localStorage.removeItem('cff_linkedin_url');
          localStorage.removeItem('cff_goal_text');
          localStorage.removeItem('pending_invite_role');
        } catch (e) {}
        try {
          const fn = user.full_name?.split(' ')[0] || '';
          if (fn) sessionStorage.setItem('cff_auth_first_name', fn);
        } catch (e) {}
        setResumeScreen(null);
        setStep('onboarding');
        return;
      }

      // NOTE: Do NOT clear cff_funnel_completed here. MinimalOnboarding (the
      // pre-auth funnel) sets this flag right before the Google OAuth
      // round-trip. A brand-new Google user has no persona yet — clearing the
      // flag here would wipe the legitimate signal and send them back to
      // onboarding step 1 instead of advancing to Magic Moment. The
      // entityExists check above already handles the stale deleted-user case.

      // Flow A completed BEFORE sign-in: the funnel saved every answer locally
      // and set cff_funnel_completed right before the OAuth round-trip.
      // Finalize the profile from those answers here — NEVER make the student
      // redo onboarding after they've already invested 5-10 minutes.
      let funnelDone = false;
      try {
        // Safari can clear localStorage during the OAuth round-trip — check both
        funnelDone = localStorage.getItem('cff_funnel_completed') === 'true'
          || sessionStorage.getItem('cff_funnel_completed') === 'true';
      } catch (e) {}
      if (funnelDone) {
        if (user.onboarding_completed !== true) {
          try {
            const college = localStorage.getItem('cff_college') || '';
            let blockers = [];
            try { blockers = JSON.parse(localStorage.getItem('cff_blockers') || '[]'); } catch (e) {}
            let locPrefs = {};
            try { locPrefs = JSON.parse(localStorage.getItem('cff_location_prefs') || '{}') || {}; } catch (e) {}
            // Resume capture state saved by the funnel before the OAuth round-trip —
            // attach it to the new account so the upload survives authentication.
            const resumeStatus = localStorage.getItem('cff_resume_status') || 'not_provided';
            const resumeUrl = localStorage.getItem('cff_resume_url') || '';
            // Onboarding answers → canonical career_goals (what searches +
            // the profile "My Search Preferences" section read).
            let goalIndustries = [];
            let goalRoles = [];
            try { goalIndustries = JSON.parse(localStorage.getItem('cff_industries') || '[]'); } catch (e) {}
            try { goalRoles = JSON.parse(localStorage.getItem('cff_target_roles') || '[]'); } catch (e) {}
            const goalLocation = localStorage.getItem('cff_location') || '';
            const linkedinUrl = localStorage.getItem('cff_linkedin_url') || '';
            await base44.auth.updateMe({
              persona: 'student',
              roles: ['student'],
              onboarding_completed: true,
              is_new_signup: true,
              school: college,
              school_code: (deriveSchoolCode(college) || '').toUpperCase(),
              career_blockers: blockers,
              resume_status: resumeStatus,
              resume_source: localStorage.getItem('cff_resume_source') || '',
              onboarding_resume_skipped: localStorage.getItem('cff_resume_skipped') === 'true',
              onboarding_resume_step_completed: true,
              ...(resumeUrl ? { resume_file_url: resumeUrl, resume_url: resumeUrl, resume_uploaded_at: new Date().toISOString() } : {}),
              ...locPrefs,
              career_goals: buildCareerGoalsFromOnboarding({
                seeking: localStorage.getItem('cff_seeking') || '',
                industries: goalIndustries,
                targetRoles: goalRoles,
                location: goalLocation,
              }),
              ...(goalLocation ? { location: goalLocation === 'remote' ? 'Remote' : goalLocation } : {}),
              ...(linkedinUrl ? { linkedin_url: linkedinUrl } : {}),
            });
            // The funnel parsed their resume before sign-in — persist it now that
            // there's an account to attach it to, or CLIFF has nothing to tailor.
            try {
              const rawParsed = localStorage.getItem('cff_resume_parsed');
              if (rawParsed) {
                await saveParsedResume(base44, user.email, JSON.parse(rawParsed), resumeUrl, localStorage.getItem('cff_resume_filename') || '');
                localStorage.removeItem('cff_resume_parsed');
                localStorage.removeItem('cff_resume_filename');
              }
            } catch (e) { console.warn('Resume save failed post-auth:', e); }
            // Work-location statements captured in the funnel → CLIFF memories
            try {
              const wl = JSON.parse(localStorage.getItem('cff_work_location') || 'null');
              const locMems = buildLocationMemories(wl, user.email);
              if (locMems.length) await base44.entities.StudentMemory.bulkCreate(locMems);
            } catch (e) {}
            localStorage.removeItem('cff_funnel_completed');
            try { sessionStorage.removeItem('cff_funnel_completed'); sessionStorage.removeItem('cff_onboarding_type'); localStorage.removeItem('pending_invite_role'); } catch (e) {}
            try { await refreshUser(); } catch (e) {}
            // Full reload so AuthContext re-fetches the now-persisted user
            // (with career_goals) before MagicMoment mounts. Without this,
            // MagicMoment reads a stale user (pre-updateMe) and its ranRef
            // guard prevents the effect from re-running when the user updates.
            window.location.hash = '#/MagicMoment';
            window.location.reload();
            return;
          } catch (e) { /* fall through to normal routing */ }
        } else {
          // Already onboarded — just clear the stale flag
          try { localStorage.removeItem('cff_funnel_completed'); sessionStorage.removeItem('cff_funnel_completed'); } catch (e) {}
        }
      }

      const hasPersona = !!user.persona?.trim();
      const onboardingDone = user.onboarding_completed === true;

      // Honor an explicit returnTo (e.g. parent clicking the "confirm your profile"
      // email link). Only for already-onboarded users so we never short-circuit a
      // brand-new user's onboarding.
      try {
        const hashQuery = window.location.hash.split('?')[1] || '';
        const returnTo = new URLSearchParams(hashQuery).get('returnTo');
        if (returnTo && hasPersona && onboardingDone) {
          window.location.hash = '#' + decodeURIComponent(returnTo);
          return;
        }
      } catch (e) { /* ignore */ }

      // Fully onboarded → send to the right home.
      // Parents/alumni only have the one-page signup form + success screen —
      // they never use the student dashboard (which renders blank for them).
      if (hasPersona && onboardingDone) {
        const isParentOrAlum = user.persona === 'parent' || user.persona === 'alumni'
          || user.roles?.includes('parent') || user.roles?.includes('alumni');
        window.location.hash = isParentOrAlum ? '#/ParentAllSet' : '#/FreeTierDashboard';
        return;
      }

      // Has persona but onboarding incomplete → resume correct flow
      if (hasPersona && !onboardingDone) {
        if (user.persona === 'parent' || user.roles?.includes('parent')) {
          window.location.hash = '#/ParentOnboarding';
        } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
          window.location.hash = '#/FreeTierDashboard';
        } else {
          localStorage.removeItem('cff_onboarding_screen');
          setResumeScreen(null);
          setStep('onboarding');
        }
        return;
      }

      // No persona → new user, always onboard
      if (!hasPersona) {
        if (pendingRole === 'parent') {
          window.location.hash = '#/ParentOnboarding';
          return;
        }
        localStorage.removeItem('cff_onboarding_screen');
        try {
          const fn = user.full_name?.split(' ')[0] || '';
          if (fn) sessionStorage.setItem('cff_auth_first_name', fn);
        } catch (e) {}
        setResumeScreen(null);
        setStep('onboarding');
      }
    };

    checkAndRoute();
  }, [user, isLoading]);

  const inputStyle = {
    width: '100%', fontSize: 14, padding: '14px 16px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    borderRadius: 10, color: '#0f172a',
    fontFamily: dmSans, outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = { fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'block', marginBottom: 6 };
  const primaryBtn = (l) => ({ background: l ? '#cbd5e1' : GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: l ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto', boxShadow: l ? 'none' : '0 8px 24px rgba(109,40,217,0.28)' });

  // OTP verification step — shown after native signup (or unverified sign-in).
  // On success, completeAuth() refreshes the session and lets checkAndRoute route the user.
  if (pendingOtpEmail) {
    return (
      <AuthPageShell>
        <div style={{ maxWidth: 460, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png" alt="College Fast Forward" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <h1 style={{ fontFamily: dmSans, fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
                College <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span>
              </h1>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: '#64748b', margin: 0 }}>Verify your email to continue.</p>
          </div>
          <OtpVerifyForm email={pendingOtpEmail} password={pendingOtpPassword} onVerified={completeAuth} />
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setPendingOtpEmail(''); setPendingOtpPassword(''); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto' }}>← Back</button>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  // While determining what to show, render a visible loading screen (not blank)
  if (step === null) {
    return (
      <AuthPageShell>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#64748b' }}>Setting up your account...</p>
        </div>
      </AuthPageShell>
    );
  }

  // New user — show the white-background onboarding funnel (postAuth=true since user is already signed in)
  if (step === 'onboarding') {
    const handleOnboardingComplete = async () => {
      // Clear funnel flags so returning visits don't re-trigger funnel
      try { sessionStorage.removeItem('cff_onboarding_type'); localStorage.removeItem('pending_invite_role'); localStorage.removeItem('cff_onboarding_screen'); } catch (e) {}
      // After funnel, set persona and go to dashboard.
      // CRITICAL: persist career_goals from the funnel answers saved to
      // localStorage. OnboardingFlow's X-close (onClose) and skip paths reach
      // here WITHOUT running saveAndAuth, so without this write the student is
      // marked onboarding_complete with empty career_goals — and
      // getLiveJobMatchesFn returns no jobs for empty role+industries, which
      // makes FirstApplicationPackageCard silently not render (no magic moment).
      try {
        const college = localStorage.getItem('cff_college') || '';
        let goalIndustries = [];
        let goalRoles = [];
        try { goalIndustries = JSON.parse(localStorage.getItem('cff_industries') || '[]'); } catch (e) {}
        try { goalRoles = JSON.parse(localStorage.getItem('cff_target_roles') || '[]'); } catch (e) {}
        const goalLocation = localStorage.getItem('cff_location') || '';
        const goalSeeking = localStorage.getItem('cff_seeking') || '';
        await base44.auth.updateMe({
          persona: 'student',
          roles: ['student'],
          onboarding_completed: true,
          is_new_signup: true,
          ...(college ? { school: college, school_code: (deriveSchoolCode(college) || '').toUpperCase() } : {}),
          career_goals: buildCareerGoalsFromOnboarding({
            seeking: goalSeeking,
            industries: goalIndustries,
            targetRoles: goalRoles,
            location: goalLocation,
          }),
          ...(goalLocation ? { location: goalLocation === 'remote' ? 'Remote' : goalLocation } : {}),
        });
      } catch (e) {}
      // Full reload so the auth context re-fetches the now-onboarded user —
      // otherwise OnboardingGuard sees the stale (no persona) user and loops
      // the student back to onboarding screen 1.
      window.location.hash = '#/MagicMoment';
      window.location.reload();
    };
    // Lean Free→Paid conversion flow: QuickOnboarding already persisted persona +
    // goals + resume, so the done handler only clears flags and routes to the
    // Magic Moment. (The old OnboardingFlow path re-persisted goals from
    // localStorage — which would wipe what QuickOnboarding just saved.)
    const handleQuickOnboardingDone = async () => {
      try { sessionStorage.removeItem('cff_onboarding_type'); localStorage.removeItem('pending_invite_role'); localStorage.removeItem('cff_onboarding_screen'); localStorage.removeItem('cff_funnel_completed'); } catch (e) {}
      window.location.hash = '#/MagicMoment';
      window.location.reload();
    };
    return <QuickOnboarding onDone={handleQuickOnboardingDone} />;
  }

  if (step === 'auth') {
    return (
      <AuthPageShell>
        <div style={{ maxWidth: 500, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 24, minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto 24px' }}>
              ← Back to home
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png" alt="College Fast Forward" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <h1 style={{ fontFamily: dmSans, fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
                College{' '}
                <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span>
              </h1>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: '#64748b', margin: 0 }}>
              Your first job, with a real plan and a warm intro.
            </p>
          </div>

          {isMigration && (
            <div style={{
              background: 'rgba(109,40,217,0.06)',
              border: '1px solid rgba(109,40,217,0.2)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: dmSans,
              fontSize: 13,
              color: '#475569',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              👋 Welcome to the new College Fast Forward.<br/>
              Sign in with Google, or use "Forgot your password?" to set a new password for your account.
            </div>
          )}

          {/* Google leads — one tap, no password to invent, no email code to hunt for. */}
          {!forgotMode && (
            <div style={{ marginBottom: 24 }}>
              <button onClick={handleGoogleSignIn} disabled={loading} style={{ width: '100%', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#0f172a', opacity: loading ? 0.7 : 1, minHeight: 'auto', boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}>
                <GoogleIcon /> Continue with Google
              </button>
              <p style={{ fontFamily: dmSans, fontSize: 12.5, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
                Fastest way in — no password, no verification code.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 20px' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>or use email</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
            </div>
          )}

          {!forgotMode && (
          <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 28, display: 'flex', gap: 4 }}>
            {['signin', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); setInfo(''); }}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? ACCENT : '#94a3b8',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: dmSans,
                  transition: 'all 0.2s', minHeight: 'auto',
                }}
              >
                {tab === 'signin' && 'Sign in'}
                {tab === 'signup' && 'Sign up'}
              </button>
            ))}
          </div>
          )}

          {!forgotMode && activeTab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, minHeight: 'auto', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setForgotEmail(signinEmail); setError(''); setInfo(''); }}
                  style={{ fontFamily: dmSans, fontSize: 13, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
                >
                  Forgot your password?
                </button>
              </div>
              <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {!forgotMode && activeTab === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, minHeight: 'auto', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, minHeight: 'auto', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>We'll email you a 6-digit code to verify your account.</p>
            </form>
          )}

          {forgotMode && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Reset your password</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Enter your email and we'll send you a link to set a new one.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setError(''); setInfo(''); }}
                style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto' }}
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p></div>}
          {info && !error && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#22C55E', margin: 0 }}>{info}</p></div>}

        </div>
      </AuthPageShell>
    );
  }

}

GatorAuth.isPublic = true;