import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function GatorWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const [choosing, setChoosing] = useState(false); // 'step1' | 'step2'
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Clear OAuth tracking on mount
  useEffect(() => {
    localStorage.removeItem('oauth_attempt_count');
    localStorage.removeItem('oauth_start_time');
    sessionStorage.removeItem('oauth_callback_detected');
    sessionStorage.removeItem('oauth_state_token');
    sessionStorage.removeItem('oauth_redirect_in_progress');
  }, []);

  const saveAndNavigate = useCallback(async (persona, alumniIntent, destination) => {
    setSaving(destination);
    setError(null);
    try {
      await base44.auth.updateMe({
        persona,
        roles: [persona],
        alumni_intent: alumniIntent,
        onboarding_completed: false,
        is_new_signup: true,
        ...(persona === 'parent' ? { pledge_taken: false, first_question_shown: false } : {}),
      });

      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      base44.functions.invoke('notifyNewUserJoined', {
        user_email: user?.email,
        user_name: user?.full_name,
        user_persona: persona,
        user_id: user?.id,
      }).catch(() => {});

      await refreshUser();

      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      navigate(destination);
    } catch (e) {
      console.error('[GatorWelcome] Choice save failed:', e);
      if (isMountedRef.current) {
        setError('Something went wrong. Please try again.');
        setSaving(null);
      }
    }
  }, [user, refreshUser]);

  const handleSeeker = useCallback(() => {
    saveAndNavigate('student', 'seeking_help', 'StudentWelcome');
  }, [saveAndNavigate]);

  const handleParent = useCallback(() => {
    saveAndNavigate('parent', 'help_students', 'ParentOnboarding');
  }, [saveAndNavigate]);

  const handleAlumniHelper = useCallback(() => {
    saveAndNavigate('alumni', 'giving_help', 'AlumniOnboarding');
  }, [saveAndNavigate]);

  // Main routing effect — once we have a user, decide what to show
  useEffect(() => {
    if (isLoading) return;

    // No user yet — poll for session
    if (!user) {
      let attempts = 0;
      const checkSession = async () => {
        while (attempts < 15) {
          attempts++;
          await new Promise(r => setTimeout(r, 600));
          if (!isMountedRef.current) return;
          try {
            const freshUser = await base44.auth.me();
            if (freshUser?.email) { refreshUser(); return; }
          } catch (e) { /* keep polling */ }
        }
        if (isMountedRef.current) navigate('GatorAuth');
      };
      checkSession();
      return;
    }

    // Already onboarded — send to the right dashboard
    if (user.onboarding_completed === true) {
      localStorage.removeItem('pending_intent');
      let dest = 'FreeTierDashboard';
      if (user.persona === 'parent') {
        dest = 'ParentHome';
      } else if (user.persona === 'alumni' && user.alumni_intent === 'giving_help') {
        dest = 'AlumniHome';
      }
      navigate(dest);
      return;
    }

    // Pre-stored intent from landing page CTA
    const pendingIntent = localStorage.getItem('pending_intent');
    if (pendingIntent === 'seeker') {
      localStorage.removeItem('pending_intent');
      saveAndNavigate('student', 'seeking_help', 'StudentWelcome');
      return;
    }
    if (pendingIntent === 'helper') {
      localStorage.removeItem('pending_intent');
      // Don't assume parent — show the parent/alumni sub-choice
      setChoosing('step2');
      return;
    }

    // Has a persona set but not completed onboarding — route to correct onboarding
    if (user.persona === 'parent') { navigate('ParentOnboarding'); return; }
    if (user.persona === 'student' || user.persona === 'gator') { navigate('StudentWelcome'); return; }
    if (user.persona === 'alumni') { navigate('AlumniOnboarding'); return; }

    // No persona, no intent — show the choice screen
    setChoosing('step1');
  }, [user, isLoading, refreshUser, saveAndNavigate]);

  const shellStyle = { minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' };
  const innerStyle = { maxWidth: 480, width: '100%', textAlign: 'center' };
  const dotStyle = { width: 10, height: 10, borderRadius: '50%', background: '#E85D20', boxShadow: '0 0 16px rgba(232,93,32,0.6)', margin: '0 auto 32px' };

  const btnStyle = (key) => ({
    background: saving === key ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.04)',
    border: '1.5px solid ' + (saving === key ? '#E85D20' : 'rgba(255,255,255,0.12)'),
    borderRadius: 16, padding: '22px 28px',
    cursor: saving ? 'not-allowed' : 'pointer',
    textAlign: 'left', transition: 'all 0.2s ease',
    opacity: saving && saving !== key ? 0.4 : 1,
    width: '100%',
  });

  // Loading / processing state
  if (!choosing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Setting up your account...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Step 2 — Parent or Alumni sub-choice
  if (choosing === 'step2') {
    return (
      <div style={shellStyle}>
        <div style={innerStyle}>
          <div style={dotStyle} />
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#E85D20', margin: '0 0 16px' }}>
            Welcome to College Fast Forward
          </p>
          <h1 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 40px', letterSpacing: '-0.02em' }}>
            Are you a parent or alumni?
          </h1>

          {error && <p style={{ fontFamily: dmSans, fontSize: 13, color: '#f87171', marginBottom: 20 }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              onClick={handleParent}
              disabled={!!saving}
              style={btnStyle('ParentOnboarding')}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; } }}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>👨‍👩‍👧</span>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                    {saving === 'ParentOnboarding' ? 'Setting up your account...' : "I'm a Parent →"}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                    Open your network to help students land opportunities
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleAlumniHelper}
              disabled={!!saving}
              style={btnStyle('AlumniOnboarding')}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; } }}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🎓</span>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                    {saving === 'AlumniOnboarding' ? 'Setting up your account...' : "I'm an Alumni →"}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                    Share your experience, make intros, give advice
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setChoosing('step1')}
            style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', marginTop: 24, minHeight: 'auto' }}
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // Step 1 — primary entry: student workspace vs helper
  const studentOpts = [
    { key: 'applying', emoji: '🚀', label: 'Actively applying for internships / jobs', sub: 'I have applications in progress or ready to send' },
    { key: 'building', emoji: '🔧', label: 'Building materials (resume, LinkedIn, etc.)', sub: 'Getting my profiles and documents ready first' },
    { key: 'exploring', emoji: '🔭', label: 'Just exploring / early stage', sub: 'Figuring out direction, not applying yet' },
  ];

  return (
    <div style={shellStyle}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Welcome to College Fast Forward</span>
        </div>

        {/* Progress bar (1 of 3) */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i === 0 ? '#E85D20' : 'rgba(255,255,255,0.09)' }} />
          ))}
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>Step 1 of 3</p>

        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Let's build your job search workspace
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.65 }}>
          Answer 3 quick questions so we can show you the most useful tools first.
        </p>

        <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>
          What are you focused on right now?
        </p>

        {error && <p style={{ fontFamily: dmSans, fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>}

        {studentOpts.map(o => {
          const active = selectedRole === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setSelectedRole(o.key)}
              style={{
                background: active ? 'rgba(232,93,32,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${active ? '#E85D20' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.18s ease', width: '100%', marginBottom: 10,
                boxShadow: active ? '0 4px 20px rgba(232,93,32,0.15)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{o.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.85)', margin: '0 0 4px' }}>{o.label}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>{o.sub}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? '#E85D20' : 'rgba(255,255,255,0.18)'}`, background: active ? '#E85D20' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                  {active && '✓'}
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={() => {
            if (selectedRole) {
              sessionStorage.setItem('onboarding_focus', selectedRole);
              handleSeeker();
            }
          }}
          disabled={!selectedRole || !!saving}
          style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '16px 28px', cursor: selectedRole ? 'pointer' : 'default', width: '100%', marginTop: 24, minHeight: 'auto', boxShadow: '0 8px 28px rgba(232,93,32,0.32)', opacity: selectedRole && !saving ? 1 : 0.35, transition: 'opacity 0.15s' }}
        >
          {saving === 'StudentWelcome' ? 'Setting up...' : 'Next →'}
        </button>

        {/* Helper option — smaller, secondary */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 12px' }}>Not a student?</p>
          <button
            onClick={() => setChoosing('step2')}
            disabled={!!saving}
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto' }}
          >
            I'm a parent or alumni →
          </button>
        </div>
      </div>
    </div>
  );
}