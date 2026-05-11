import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const TOTAL_STEPS = 3;

export default function StudentWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const [step, setStep] = useState(null); // null = loading, 'choose_role', 1, 2, 3, 'done'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  // Step answers
  const [focus, setFocus] = useState(null); // step 1
  const [challenges, setChallenges] = useState([]); // step 2
  const [otherChallenge, setOtherChallenge] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');

  useEffect(() => {
    isMountedRef.current = true;
    // Load fonts
    if (!document.getElementById('sw-fonts')) {
      const link = document.createElement('link');
      link.id = 'sw-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    // Clear OAuth tracking
    localStorage.removeItem('oauth_attempt_count');
    localStorage.removeItem('oauth_start_time');
    sessionStorage.removeItem('oauth_callback_detected');
    sessionStorage.removeItem('oauth_state_token');
    return () => { isMountedRef.current = false; };
  }, []);

  // Routing logic
  useEffect(() => {
    if (isLoading) return;
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
          } catch (e) {}
        }
        if (isMountedRef.current) navigate('GatorAuth');
      };
      checkSession();
      return;
    }

    // Already onboarded
    if (user.onboarding_completed === true) {
      let dest = 'FreeTierDashboard';
      if (user.persona === 'parent') dest = 'ParentHome';
      else if (user.persona === 'alumni' && user.alumni_intent === 'giving_help') dest = 'AlumniHome';
      navigate(dest);
      return;
    }

    // Has a non-student persona — route them correctly
    if (user.persona === 'parent') { navigate('ParentOnboarding'); return; }
    if (user.persona === 'alumni') { navigate('AlumniOnboarding'); return; }

    // Pre-stored helper intent (parent/alumni flow)
    const pendingIntent = localStorage.getItem('pending_intent');
    if (pendingIntent === 'helper') {
      localStorage.removeItem('pending_intent');
      setStep('choose_role');
      return;
    }
    if (pendingIntent === 'seeker') {
      localStorage.removeItem('pending_intent');
    }

    // Pre-fill school if available
    if (user.school_name) setSchool(user.school_name);
    if (user.major) setMajor(user.major);

    // Student/gator or no persona — go straight to step 1 (student onboarding)
    setStep(1);
  }, [user, isLoading, refreshUser]);

  const saveAsHelper = useCallback(async (persona, alumniIntent, destination) => {
    setSaving(true);
    setError(null);
    try {
      await base44.auth.updateMe({ persona, roles: [persona], alumni_intent: alumniIntent, onboarding_completed: false });
      base44.functions.invoke('notifyNewUserJoined', { user_email: user?.email, user_name: user?.full_name, user_persona: persona, user_id: user?.id }).catch(() => {});
      await refreshUser();
      navigate(destination);
    } catch (e) {
      if (isMountedRef.current) { setError('Something went wrong. Please try again.'); setSaving(false); }
    }
  }, [user, refreshUser]);

  const finishOnboarding = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const onboardingData = {
        persona: user?.persona || 'student',
        roles: [user?.persona || 'student'],
        onboarding_completed: false,
        is_new_signup: true,
        onboarding_focus: focus,
        onboarding_challenges: challenges.includes('other') ? [...challenges.filter(c => c !== 'other'), otherChallenge].filter(Boolean) : challenges,
        ...(school ? { school_name: school } : {}),
        ...(major ? { major } : {}),
        ...(gradYear ? { graduation_year: parseInt(gradYear) } : {}),
      };
      await base44.auth.updateMe(onboardingData);
      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      base44.functions.invoke('notifyNewUserJoined', { user_email: user?.email, user_name: user?.full_name, user_persona: 'student', user_id: user?.id }).catch(() => {});
      await refreshUser();
      setStep('done');
    } catch (e) {
      if (isMountedRef.current) { setError('Something went wrong. Please try again.'); setSaving(false); }
    }
  }, [user, refreshUser, focus, challenges, otherChallenge, school, major, gradYear]);

  const skip = useCallback(async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ persona: user?.persona || 'student', roles: [user?.persona || 'student'], onboarding_completed: false, is_new_signup: true });
      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      await refreshUser();
      navigate('FreeTierDashboard');
    } catch (e) {
      navigate('FreeTierDashboard');
    }
  }, [user, refreshUser]);

  const toggleChallenge = (val) => {
    setChallenges(prev => prev.includes(val) ? prev.filter(c => c !== val) : prev.length < 2 ? [...prev, val] : prev);
  };

  // ── STYLES ──
  const shell = { minHeight: '100vh', background: '#060609', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: dmSans };
  const inner = { maxWidth: 520, width: '100%' };
  const tag = { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 };
  const card = (active) => ({
    background: active ? 'rgba(232,93,32,0.1)' : 'rgba(255,255,255,0.04)',
    border: `1.5px solid ${active ? '#E85D20' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 16, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s ease', width: '100%', marginBottom: 10,
  });
  const btnPrimary = { fontFamily: dmSans, fontSize: 15, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '16px 32px', cursor: 'pointer', width: '100%', marginTop: 24, minHeight: 'auto', boxShadow: '0 8px 28px rgba(232,93,32,0.35)', transition: 'all 0.2s ease' };
  const btnGhost = { fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 18, minHeight: 'auto', display: 'block', width: '100%', textAlign: 'center', transition: 'color 0.15s' };
  const input = { fontFamily: dmSans, fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', width: '100%', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box', fontSize: 16 };

  const ProgressBar = ({ current, total }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i < current ? '#E85D20' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
      ))}
    </div>
  );

  // ── LOADING ──
  if (!step) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060609' }}>
        <div style={{ width: 30, height: 30, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── CHOOSE ROLE (for helpers / no-persona) ──
  if (step === 'choose_role') {
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={tag}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Welcome to College Fast Forward</span></div>
          <h1 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.02em' }}>What brings you here?</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px', lineHeight: 1.6 }}>Choose the option that best describes you.</p>
          {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>}
          {[
            { key: 'student', emoji: '🎯', label: "I'm a student looking for a job", sub: 'Get AI tools, track applications, write outreach', action: () => setStep(1) },
            { key: 'parent', emoji: '👨‍👩‍👧', label: "I'm a parent", sub: 'Help students land opportunities with your network', action: () => saveAsHelper('parent', 'help_students', 'ParentOnboarding') },
            { key: 'alumni', emoji: '🎓', label: "I'm an alumni", sub: 'Share experience, make intros, give advice', action: () => saveAsHelper('alumni', 'giving_help', 'AlumniOnboarding') },
          ].map(opt => (
            <button key={opt.key} onClick={opt.action} disabled={saving} style={card(false)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{opt.emoji}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 3px' }}>{saving ? 'Setting up...' : opt.label + ' →'}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{opt.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 1 ──
  if (step === 1) {
    const options = [
      { key: 'applying', emoji: '🚀', label: 'Actively applying for internships / jobs', sub: 'I have applications in progress or ready to send' },
      { key: 'building', emoji: '🛠️', label: 'Building materials (resume, LinkedIn, etc.)', sub: 'Getting my profiles and docs ready first' },
      { key: 'exploring', emoji: '🔭', label: 'Just exploring / early stage', sub: 'Not sure yet, figuring out my direction' },
    ];
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={tag}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Welcome to College Fast Forward</span></div>
          <ProgressBar current={1} total={TOTAL_STEPS} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Step 1 of {TOTAL_STEPS}</p>
          <h1 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Let's build your job search workspace</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px', lineHeight: 1.6 }}>Answer 3 quick questions so we can show you the most useful tools first.</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>What are you focused on right now?</p>
          {options.map(opt => (
            <button key={opt.key} onClick={() => setFocus(opt.key)} style={card(focus === opt.key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.emoji}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: focus === opt.key ? 700 : 500, color: focus === opt.key ? '#fff' : 'rgba(255,255,255,0.8)', margin: '0 0 3px' }}>{opt.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{opt.sub}</p>
                </div>
                {focus === opt.key && <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#E85D20', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 10, color: '#fff' }}>✓</span></div>}
              </div>
            </button>
          ))}
          <button onClick={() => setStep(2)} disabled={!focus} style={{ ...btnPrimary, opacity: focus ? 1 : 0.4 }}>Next →</button>
          <button onClick={skip} style={btnGhost}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
          >Skip for now</button>
        </div>
      </div>
    );
  }

  // ── STEP 2 ──
  if (step === 2) {
    const options = [
      { key: 'organizing', label: 'Staying organized and tracking applications' },
      { key: 'resume', label: 'Resume / cover letters not getting responses' },
      { key: 'outreach', label: 'Writing outreach messages' },
      { key: 'interviews', label: 'Preparing for interviews' },
      { key: 'opportunities', label: 'Finding good opportunities' },
      { key: 'other', label: 'Other' },
    ];
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={tag}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Welcome to College Fast Forward</span></div>
          <ProgressBar current={2} total={TOTAL_STEPS} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Step 2 of {TOTAL_STEPS}</p>
          <h1 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.02em' }}>What's your biggest challenge right now?</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.6 }}>Select up to 2 options.</p>
          {options.map(opt => (
            <button key={opt.key} onClick={() => toggleChallenge(opt.key)} style={card(challenges.includes(opt.key))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${challenges.includes(opt.key) ? '#E85D20' : 'rgba(255,255,255,0.25)'}`, background: challenges.includes(opt.key) ? '#E85D20' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {challenges.includes(opt.key) && <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span>}
                </div>
                <p style={{ fontSize: 14, fontWeight: challenges.includes(opt.key) ? 600 : 400, color: challenges.includes(opt.key) ? '#fff' : 'rgba(255,255,255,0.7)', margin: 0 }}>{opt.label}</p>
              </div>
            </button>
          ))}
          {challenges.includes('other') && (
            <input style={{ ...input, marginTop: 4, marginBottom: 4 }} placeholder="What else is challenging?" value={otherChallenge} onChange={e => setOtherChallenge(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#E85D20'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', minHeight: 'auto', flex: '0 0 auto' }}>←</button>
            <button onClick={() => setStep(3)} disabled={challenges.length === 0} style={{ ...btnPrimary, marginTop: 0, flex: 1, opacity: challenges.length > 0 ? 1 : 0.4 }}>Next →</button>
          </div>
          <button onClick={skip} style={btnGhost}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
          >Skip for now</button>
        </div>
      </div>
    );
  }

  // ── STEP 3 ──
  if (step === 3) {
    const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() + i).toString());
    return (
      <div style={shell}>
        <div style={inner}>
          <div style={tag}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Welcome to College Fast Forward</span></div>
          <ProgressBar current={3} total={TOTAL_STEPS} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Step 3 of {TOTAL_STEPS}</p>
          <h1 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Quick info to personalize your workspace</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px', lineHeight: 1.6 }}>Optional — skip any field you prefer.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>School</label>
              <input style={input} placeholder="e.g. University of Florida" value={school} onChange={e => setSchool(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = '#E85D20'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Major / Field of Study</label>
              <input style={input} placeholder="e.g. Business, Computer Science..." value={major} onChange={e => setMajor(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = '#E85D20'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Graduation Year <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <select style={{ ...input, color: gradYear ? '#fff' : 'rgba(255,255,255,0.35)', appearance: 'none' }} value={gradYear} onChange={e => setGradYear(e.target.value)}>
                <option value="">Select year...</option>
                {years.map(y => <option key={y} value={y} style={{ background: '#1a1a2e', color: '#fff' }}>{y}</option>)}
              </select>
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#f87171', marginTop: 16 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={() => setStep(2)} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', minHeight: 'auto', flex: '0 0 auto' }}>←</button>
            <button onClick={finishOnboarding} disabled={saving} style={{ ...btnPrimary, marginTop: 0, flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Setting up your workspace...' : 'Build My Workspace →'}
            </button>
          </div>
          <button onClick={skip} style={btnGhost}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
          >Skip for now</button>
        </div>
      </div>
    );
  }

  // ── DONE ──
  const isApplying = focus === 'applying';
  const isBuilding = focus === 'building';

  const quickStartCards = [
    ...(isApplying ? [{ emoji: '📋', title: 'Open Application Tracker', sub: 'Track every application in one place', cta: 'Open Tracker →', dest: 'FreeTierDashboard', highlight: true }] : []),
    ...(isBuilding ? [{ emoji: '📄', title: 'Improve My Resume', sub: 'AI-powered resume tailoring and optimization', cta: 'Improve Resume →', dest: 'ResumeTailoring', highlight: true }] : []),
    { emoji: '⚡', title: 'Let the Agent help with your first task', sub: 'Tell the AI what you need — it handles the rest', cta: 'Start with Agent →', dest: 'FreeTierDashboard', highlight: !isApplying && !isBuilding },
  ];

  return (
    <div style={shell}>
      <div style={{ ...inner, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '2px solid rgba(232,93,32,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 24 }}>🎯</div>
        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 4.5vw, 38px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Your job search workspace is ready</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px', lineHeight: 1.65, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Based on your answers, here's where we recommend starting:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
          {quickStartCards.map((c, i) => (
            <button key={i} onClick={() => navigate(c.dest)} style={{ background: c.highlight ? 'linear-gradient(135deg, rgba(232,93,32,0.15), rgba(232,93,32,0.05))' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${c.highlight ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: '18px 20px', cursor: 'pointer', width: '100%', transition: 'all 0.18s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>{c.title}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{c.sub}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.highlight ? '#E85D20' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.cta}</span>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => navigate('FreeTierDashboard')} style={{ ...btnPrimary, fontSize: 16 }}>
          Go to My Workspace →
        </button>
      </div>
    </div>
  );
}