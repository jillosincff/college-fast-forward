import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const TOTAL = 3;

export default function StudentWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const [step, setStep] = useState(null); // null=loading, 1, 2, 3, 'done'
  const [saving, setSaving] = useState(false);
  const [focus, setFocus] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!document.getElementById('sw-fonts')) {
      const l = document.createElement('link');
      l.id = 'sw-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(l);
    }
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Poll for session after OAuth
      let attempts = 0;
      const poll = async () => {
        while (attempts++ < 15) {
          await new Promise(r => setTimeout(r, 600));
          if (!mounted.current) return;
          try { const u = await base44.auth.me(); if (u?.email) { refreshUser(); return; } } catch {}
        }
        navigate('GatorAuth');
      };
      poll();
      return;
    }
    // Already fully onboarded
    if (user.onboarding_completed === true) {
      navigate('FreeTierDashboard');
      return;
    }
    // Pre-fill if available
    if (user.school_name) setSchool(user.school_name);
    if (user.major) setMajor(user.major);
    setStep(1);
  }, [user, isLoading]);

  const toggleChallenge = (val) => {
    setChallenges(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : prev.length < 2 ? [...prev, val] : prev
    );
  };

  const finish = useCallback(async () => {
    setSaving(true);
    try {
      const finalChallenges = challenges.includes('other')
        ? [...challenges.filter(c => c !== 'other'), otherText].filter(Boolean)
        : challenges;
      await base44.auth.updateMe({
        persona: 'student',
        roles: ['student'],
        onboarding_completed: false,
        is_new_signup: true,
        onboarding_focus: focus,
        onboarding_challenges: finalChallenges,
        ...(school ? { school_name: school } : {}),
        ...(major ? { major } : {}),
        ...(gradYear ? { graduation_year: parseInt(gradYear) } : {}),
      });
      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      base44.functions.invoke('notifyNewUserJoined', { user_email: user?.email, user_name: user?.full_name, user_persona: 'student', user_id: user?.id }).catch(() => {});
      await refreshUser();
      if (mounted.current) setStep('done');
    } catch {
      if (mounted.current) setSaving(false);
    }
  }, [user, refreshUser, focus, challenges, otherText, school, major, gradYear]);

  const skip = useCallback(async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ persona: 'student', roles: ['student'], onboarding_completed: false, is_new_signup: true });
      base44.functions.invoke('incrementUserCount', { user_id: user?.id }).catch(() => {});
      await refreshUser();
    } catch {}
    navigate('FreeTierDashboard');
  }, [user, refreshUser]);

  // ── STYLES ──
  const S = {
    shell: { minHeight: '100vh', background: '#07070b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: dm },
    inner: { maxWidth: 500, width: '100%' },
    tag: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 },
    tagDot: { width: 7, height: 7, borderRadius: '50%', background: '#E85D20' },
    tagText: { fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' },
    h1: { fontFamily: pf, fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 10px', letterSpacing: '-0.02em' },
    sub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px', lineHeight: 1.65 },
    q: { fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' },
    card: (active) => ({
      background: active ? 'rgba(232,93,32,0.1)' : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${active ? '#E85D20' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
      textAlign: 'left', transition: 'all 0.15s ease', width: '100%', marginBottom: 10,
    }),
    btnPrimary: { fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '16px 28px', cursor: 'pointer', width: '100%', marginTop: 24, minHeight: 'auto', boxShadow: '0 8px 28px rgba(232,93,32,0.32)', transition: 'opacity 0.15s' },
    btnBack: { fontFamily: dm, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', minHeight: 'auto', flexShrink: 0 },
    btnSkip: { fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 18, minHeight: 'auto', display: 'block', width: '100%', textAlign: 'center', transition: 'color 0.15s' },
    input: { fontFamily: dm, fontSize: 16, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '12px 16px', width: '100%', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
    label: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 },
  };

  const ProgressBar = ({ n }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i < n ? '#E85D20' : 'rgba(255,255,255,0.09)', transition: 'background 0.3s' }} />
      ))}
    </div>
  );

  const Tag = () => (
    <div style={S.tag}>
      <div style={S.tagDot} />
      <span style={S.tagText}>Welcome to College Fast Forward</span>
    </div>
  );

  const StepLabel = ({ n }) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>
      Step {n} of {TOTAL}
    </p>
  );

  // ── LOADING ──
  if (!step) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070b' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(232,93,32,0.25)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── STEP 1 ──
  if (step === 1) {
    const opts = [
      { key: 'applying', emoji: '🚀', label: 'Actively applying for internships / jobs', sub: 'I have applications in progress or ready to send' },
      { key: 'building', emoji: '🛠️', label: 'Building materials (resume, LinkedIn, etc.)', sub: 'Getting my profiles and documents ready first' },
      { key: 'exploring', emoji: '🔭', label: 'Just exploring / early stage', sub: 'Figuring out direction, not applying yet' },
    ];
    return (
      <div style={S.shell}><div style={S.inner}>
        <Tag />
        <ProgressBar n={1} />
        <StepLabel n={1} />
        <h1 style={S.h1}>Let's build your job search workspace</h1>
        <p style={S.sub}>Answer 3 quick questions so we can show you the most useful tools first.</p>
        <p style={S.q}>What are you focused on right now?</p>
        {opts.map(o => (
          <button key={o.key} onClick={() => setFocus(o.key)} style={S.card(focus === o.key)}
            onMouseEnter={e => { if (focus !== o.key) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
            onMouseLeave={e => { if (focus !== o.key) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{o.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: focus === o.key ? 700 : 500, color: focus === o.key ? '#fff' : 'rgba(255,255,255,0.8)', margin: '0 0 2px' }}>{o.label}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{o.sub}</p>
              </div>
              {focus === o.key && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E85D20', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</div>}
            </div>
          </button>
        ))}
        <button onClick={() => setStep(2)} disabled={!focus} style={{ ...S.btnPrimary, opacity: focus ? 1 : 0.35 }}>Next →</button>
        <button onClick={skip} style={S.btnSkip} onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>Skip for now</button>
      </div></div>
    );
  }

  // ── STEP 2 ──
  if (step === 2) {
    const opts = [
      { key: 'organizing', label: 'Staying organized and tracking applications' },
      { key: 'resume', label: 'Resume / cover letters not getting responses' },
      { key: 'outreach', label: 'Writing outreach messages' },
      { key: 'interviews', label: 'Preparing for interviews' },
      { key: 'opportunities', label: 'Finding good opportunities' },
      { key: 'other', label: 'Other' },
    ];
    return (
      <div style={S.shell}><div style={S.inner}>
        <Tag />
        <ProgressBar n={2} />
        <StepLabel n={2} />
        <h1 style={S.h1}>What's your biggest challenge right now?</h1>
        <p style={S.sub}>Select up to 2 options.</p>
        {opts.map(o => (
          <button key={o.key} onClick={() => toggleChallenge(o.key)} style={S.card(challenges.includes(o.key))}
            onMouseEnter={e => { if (!challenges.includes(o.key)) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
            onMouseLeave={e => { if (!challenges.includes(o.key)) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${challenges.includes(o.key) ? '#E85D20' : 'rgba(255,255,255,0.22)'}`, background: challenges.includes(o.key) ? '#E85D20' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                {challenges.includes(o.key) && '✓'}
              </div>
              <p style={{ fontSize: 14, fontWeight: challenges.includes(o.key) ? 600 : 400, color: challenges.includes(o.key) ? '#fff' : 'rgba(255,255,255,0.7)', margin: 0 }}>{o.label}</p>
            </div>
          </button>
        ))}
        {challenges.includes('other') && (
          <input style={{ ...S.input, marginBottom: 4 }} placeholder="What else is challenging?" value={otherText} onChange={e => setOtherText(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor='#E85D20'} onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'} />
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={() => setStep(1)} style={S.btnBack}>←</button>
          <button onClick={() => setStep(3)} disabled={challenges.length === 0} style={{ ...S.btnPrimary, marginTop: 0, flex: 1, opacity: challenges.length ? 1 : 0.35 }}>Next →</button>
        </div>
        <button onClick={skip} style={S.btnSkip} onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>Skip for now</button>
      </div></div>
    );
  }

  // ── STEP 3 ──
  if (step === 3) {
    const years = Array.from({ length: 7 }, (_, i) => String(new Date().getFullYear() + i));
    return (
      <div style={S.shell}><div style={S.inner}>
        <Tag />
        <ProgressBar n={3} />
        <StepLabel n={3} />
        <h1 style={S.h1}>Quick info to personalize your workspace</h1>
        <p style={S.sub}>All optional — skip any field you prefer.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={S.label}>School</label>
            <input style={S.input} placeholder="e.g. University of Florida" value={school} onChange={e => setSchool(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor='#E85D20'} onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'} />
          </div>
          <div>
            <label style={S.label}>Major / Field of Study</label>
            <input style={S.input} placeholder="e.g. Business, Computer Science..." value={major} onChange={e => setMajor(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor='#E85D20'} onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'} />
          </div>
          <div>
            <label style={S.label}>Graduation Year <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>(optional)</span></label>
            <select style={{ ...S.input, color: gradYear ? '#fff' : 'rgba(255,255,255,0.32)', appearance: 'none' }} value={gradYear} onChange={e => setGradYear(e.target.value)}>
              <option value="">Select year...</option>
              {years.map(y => <option key={y} value={y} style={{ background: '#14141f', color: '#fff' }}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={() => setStep(2)} style={S.btnBack}>←</button>
          <button onClick={finish} disabled={saving} style={{ ...S.btnPrimary, marginTop: 0, flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Setting up...' : 'Build My Workspace →'}
          </button>
        </div>
        <button onClick={skip} style={S.btnSkip} onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>Skip for now</button>
      </div></div>
    );
  }

  // ── DONE ──
  const cards = [
    ...(focus === 'applying' ? [{ emoji: '📋', title: 'Open Application Tracker', sub: 'Track every application in one place', dest: 'FreeTierDashboard', hot: true }] : []),
    ...(focus === 'building' ? [{ emoji: '📄', title: 'Improve My Resume', sub: 'AI-powered resume tailoring and optimization', dest: 'ResumeTailoring', hot: true }] : []),
    { emoji: '⚡', title: 'Let the Agent help with your first task', sub: 'Tell the AI what you need — it handles the rest', dest: 'FreeTierDashboard', hot: !focus || focus === 'exploring' },
  ];

  return (
    <div style={S.shell}><div style={{ ...S.inner, textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,93,32,0.12)', border: '2px solid rgba(232,93,32,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22 }}>🎯</div>
      <h1 style={{ ...S.h1, textAlign: 'center', marginBottom: 10 }}>Your job search workspace is ready</h1>
      <p style={{ ...S.sub, maxWidth: 380, margin: '0 auto 32px', textAlign: 'center' }}>Based on your answers, here's where we recommend starting:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => navigate(c.dest)} style={{ background: c.hot ? 'rgba(232,93,32,0.09)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${c.hot ? 'rgba(232,93,32,0.35)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', width: '100%', transition: 'all 0.15s', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{c.title}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.42)', margin: 0 }}>{c.sub}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.hot ? '#E85D20' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>→</span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => navigate('FreeTierDashboard')} style={S.btnPrimary}>Go to My Workspace →</button>
    </div></div>
  );
}