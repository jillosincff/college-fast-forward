import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function GatorWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const [choosing, setChoosing] = useState(false);
  const [saving, setSaving] = useState(null); // 'seeker' | 'helper'
  const [error, setError] = useState(null);
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

  const handleChoice = useCallback(async (intent) => {
    setSaving(intent);
    setError(null);
    try {
      const isHelper = intent === 'helper';
      await base44.auth.updateMe({
        persona: isHelper ? 'parent' : 'student',
        roles: [isHelper ? 'parent' : 'student'],
        alumni_intent: isHelper ? 'help_students' : 'seeking',
        onboarding_completed: false,
        is_new_signup: true,
        ...(isHelper ? { pledge_taken: false, first_question_shown: false } : {}),
      });

      // Non-blocking notifications
      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      base44.functions.invoke('notifyNewUserJoined', {
        user_email: user?.email,
        user_name: user?.full_name,
        user_persona: isHelper ? 'parent' : 'student',
        user_id: user?.id,
      }).catch(() => {});

      await refreshUser();

      // Clear stale invite data
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      navigate(isHelper ? 'ParentOnboarding' : 'StudentOnboarding');
    } catch (e) {
      console.error('[GatorWelcome] Choice save failed:', e);
      if (isMountedRef.current) {
        setError('Something went wrong. Please try again.');
        setSaving(null);
      }
    }
  }, [user, refreshUser]);

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
      const dest = (user.alumni_intent === 'help_students' || user.persona === 'parent')
        ? 'ParentHome'
        : 'FreeTierDashboard';
      navigate(dest);
      return;
    }

    // Pre-stored intent from landing page CTA — skip the choice screen
    const pendingIntent = localStorage.getItem('pending_intent');
    if (pendingIntent === 'helper' || pendingIntent === 'seeker') {
      localStorage.removeItem('pending_intent');
      handleChoice(pendingIntent);
      return;
    }

    // Has a persona set but not completed onboarding — route to correct onboarding
    if (user.persona === 'parent') { navigate('ParentOnboarding'); return; }
    if (user.persona === 'student' || user.persona === 'gator') { navigate('StudentOnboarding'); return; }

    // No persona, no intent — show the choice screen
    setChoosing(true);
  }, [user, isLoading, refreshUser, handleChoice]);

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

  // Two-button choice screen (generic signup — no intent pre-stored)
  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E85D20', boxShadow: '0 0 16px rgba(232,93,32,0.6)', margin: '0 auto 32px' }} />

        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#E85D20', margin: '0 0 16px' }}>
          Welcome to College Fast Forward
        </p>

        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 40px', letterSpacing: '-0.02em' }}>
          What brings you here?
        </h1>

        {error && (
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#f87171', marginBottom: 20 }}>{error}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            onClick={() => handleChoice('seeker')}
            disabled={!!saving}
            style={{ background: saving === 'seeker' ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (saving === 'seeker' ? '#E85D20' : 'rgba(255,255,255,0.12)'), borderRadius: 16, padding: '22px 28px', cursor: saving ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease', opacity: saving && saving !== 'seeker' ? 0.4 : 1 }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; } }}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🎯</span>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                  {saving === 'seeker' ? 'Setting up your account...' : "I'm looking for a job or internship"}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                  Access the network, AI tools, and alumni connections
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleChoice('helper')}
            disabled={!!saving}
            style={{ background: saving === 'helper' ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (saving === 'helper' ? '#E85D20' : 'rgba(255,255,255,0.12)'), borderRadius: 16, padding: '22px 28px', cursor: saving ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease', opacity: saving && saving !== 'helper' ? 0.4 : 1 }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; } }}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🤝</span>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                  {saving === 'helper' ? 'Setting up your account...' : "I'm happy to open my network"}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                  Help students with introductions, advice, or referrals
                </p>
              </div>
            </div>
          </button>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 28 }}>
          You can always change this later in your profile.
        </p>
      </div>
    </div>
  );
}