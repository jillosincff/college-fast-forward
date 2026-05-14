import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const GREEN = '#22c55e';
const ORANGE = '#E85D20';

const TOP_SCHOOLS = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Southern California', 'Penn State University', 'University of Michigan',
  'Ohio State University', 'University of Georgia', 'University of Maryland',
  'Tulane University', 'University of Delaware', 'Florida International University',
  'New York University', 'Boston University', 'Georgetown University',
  'University of Texas at Austin', 'UCLA', 'UC Berkeley', 'Indiana University',
  'Purdue University', 'Arizona State University', 'University of Wisconsin',
  'University of Illinois', 'Northeastern University', 'Temple University',
];

const SEEKING_OPTIONS = [
  { key: 'internship', emoji: '🎓', label: 'Internship', sub: 'This semester or summer' },
  { key: 'fulltime', emoji: '💼', label: 'Full-time job after graduation', sub: 'Ready to enter the workforce' },
  { key: 'both', emoji: '🎯', label: 'Both internships and full-time', sub: 'Keeping all options open' },
  { key: 'exploring', emoji: '🔭', label: 'Just exploring options', sub: 'Not sure yet — that\'s okay' },
];

const BLOCKERS = [
  { key: 'resume', label: 'My resume isn\'t getting responses' },
  { key: 'ghosted', label: 'I\'m getting ghosted after applying' },
  { key: 'which_jobs', label: 'I don\'t know which jobs to apply for' },
  { key: 'outreach', label: 'I don\'t know how to reach the right people' },
  { key: 'disorganized', label: 'I\'m disorganized and losing track' },
  { key: 'interviews', label: 'Interviewing makes me nervous' },
];

const Btn = ({ children, onClick, disabled, primary = true, small = false, style: extra = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: dm,
      fontSize: small ? 14 : 16,
      fontWeight: 700,
      color: primary ? '#fff' : 'rgba(255,255,255,0.5)',
      background: primary
        ? disabled ? 'rgba(34,197,94,0.25)' : GREEN
        : 'transparent',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
      borderRadius: 12,
      padding: small ? '12px 24px' : '16px 40px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      minHeight: 'auto',
      boxShadow: primary && !disabled ? '0 8px 28px rgba(34,197,94,0.35)' : 'none',
      transition: 'all 0.2s ease',
      ...extra,
    }}
    onMouseEnter={e => { if (!disabled && primary) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(34,197,94,0.5)'; } }}
    onMouseLeave={e => { if (!disabled && primary) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,197,94,0.35)'; } }}
  >
    {children}
  </button>
);

const Nav = ({ onBack, onNext, nextLabel = 'Continue →', nextDisabled = false }) => (
  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
    {onBack && <Btn primary={false} onClick={onBack} small>← Back</Btn>}
    <Btn onClick={onNext} disabled={nextDisabled}>{nextLabel}</Btn>
  </div>
);

export default function OnboardingFlow({ onClose }) {
  const [screen, setScreen] = useState(1);
  const [frustration, setFrustration] = useState(5);
  const [seeking, setSeeking] = useState('');
  const [blockers, setBlockers] = useState([]);
  const [college, setCollege] = useState('');
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const fileRef = useRef();

  const TOTAL = 8;
  const go = (n) => setScreen(n);
  const next = () => setScreen(s => s + 1);
  const back = () => setScreen(s => s - 1);

  const toggleBlocker = (key) => {
    setBlockers(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 2 ? [...prev, key] : prev
    );
  };

  const handleCollegeInput = (val) => {
    setCollege(val);
    if (val.length < 2) { setCollegeSuggestions([]); return; }
    setCollegeSuggestions(TOP_SCHOOLS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setResumeUrl(file_url);
      setScreen(8); // auto-advance to wow moment
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const saveAndAuth = () => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_onboarding_questions_pending', 'true');
      if (college) localStorage.setItem('cff_college', college);
      if (seeking) localStorage.setItem('cff_seeking', seeking);
      if (blockers.length) localStorage.setItem('cff_blockers', JSON.stringify(blockers));
      if (frustration) localStorage.setItem('cff_frustration', String(frustration));
      if (resumeUrl) localStorage.setItem('cff_resume_url', resumeUrl);
    } catch (e) {}
    base44.auth.redirectToLogin(window.location.origin + '/#GatorAuth');
  };

  const shell = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#07080f',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px 40px',
    fontFamily: dm,
    overflowY: 'auto',
  };

  const card = {
    textAlign: 'center', maxWidth: 560, width: '100%',
    animation: 'fadeUp 0.35s ease',
  };

  const h1 = {
    fontFamily: sat, fontSize: 'clamp(26px, 5vw, 48px)',
    fontWeight: 900, color: '#fff', lineHeight: 1.1,
    letterSpacing: '-0.04em', margin: '0 0 16px',
  };

  const sub = {
    fontFamily: dm, fontSize: 'clamp(15px, 2vw, 18px)',
    color: 'rgba(255,255,255,0.55)', lineHeight: 1.65,
    margin: '0 auto 36px', maxWidth: 460,
  };

  return (
    <div style={shell}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 38, height: 38, minHeight: 'auto', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${(screen / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
        {screen} / {TOTAL}
      </div>

      {/* ── SCREEN 1: Welcome ── */}
      {screen === 1 && (
        <div style={card}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '6px 18px', marginBottom: 32 }}>
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.14em', textTransform: 'uppercase' }}>College Fast Forward</span>
          </div>
          <h1 style={h1}>Welcome to College<br />Fast Forward.</h1>
          <p style={sub}>Your job search co-pilot built to learn who you are and get you interviews quickly.</p>
          <Btn onClick={next} style={{ display: 'block', margin: '0 auto', padding: '18px 56px', fontSize: 17, fontWeight: 800 }}>Let's Get Started →</Btn>
          <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.22)', marginTop: 18 }}>Takes about 2 minutes. No credit card required.</p>
        </div>
      )}

      {/* ── SCREEN 2: Built by Experts ── */}
      {screen === 2 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 36 }}>
            {[{ emoji: '🎓', label: 'Career Coach' }, { emoji: '💼', label: 'Recruiter' }, { emoji: '🏢', label: 'Hiring Manager' }].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '18px 22px' }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <h1 style={h1}>Built by Hiring Experts</h1>
          <p style={sub}>Designed with career coaches and recruiters who know exactly what gets candidates hired.</p>
          <Nav onBack={back} onNext={next} />
        </div>
      )}

      {/* ── SCREEN 3: Frustration Slider ── */}
      {screen === 3 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <h1 style={h1}>Be honest — how frustrated are you with your job search right now?</h1>
          <p style={sub}>Most college students feel overwhelmed, ghosted, or stuck sending hundreds of applications with no replies.</p>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '32px 28px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Not at all</span>
              <span style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>I'm losing my mind</span>
            </div>
            <input
              type="range" min="1" max="10" value={frustration}
              onChange={e => setFrustration(Number(e.target.value))}
              style={{ width: '100%', accentColor: GREEN, cursor: 'pointer', height: 6 }}
            />
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontFamily: sat, fontSize: 56, fontWeight: 900, color: frustration >= 7 ? ORANGE : GREEN, lineHeight: 1 }}>{frustration}</span>
              <span style={{ fontFamily: dm, fontSize: 16, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>/10</span>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {frustration <= 3 ? "Things are going okay — let's make them even better." : frustration <= 6 ? "You're feeling the pressure. We've got you." : "We hear you. That's exactly why CFF exists."}
              </p>
            </div>
          </div>

          <Nav onBack={back} onNext={next} />
        </div>
      )}

      {/* ── SCREEN 4: What Are You Looking For ── */}
      {screen === 4 && (
        <div style={{ ...card, maxWidth: 540 }}>
          <h1 style={h1}>What are you mainly looking for right now?</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4, textAlign: 'left' }}>
            {SEEKING_OPTIONS.map(opt => {
              const active = seeking === opt.key;
              return (
                <button key={opt.key} onClick={() => setSeeking(opt.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 16, padding: '16px 20px', cursor: 'pointer', width: '100%',
                  textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: active ? '#fff' : 'rgba(255,255,255,0.8)', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{opt.sub}</p>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? GREEN : 'rgba(255,255,255,0.2)'}`, background: active ? GREEN : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                    {active && '✓'}
                  </div>
                </button>
              );
            })}
          </div>
          <Nav onBack={back} onNext={next} nextDisabled={!seeking} />
        </div>
      )}

      {/* ── SCREEN 5: What's Holding You Back ── */}
      {screen === 5 && (
        <div style={{ ...card, maxWidth: 540 }}>
          <h1 style={h1}>What's the biggest thing holding you back?</h1>
          <p style={sub}>Select up to 2 options.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {BLOCKERS.map(opt => {
              const active = blockers.includes(opt.key);
              const maxed = blockers.length >= 2 && !active;
              return (
                <button key={opt.key} onClick={() => !maxed && toggleBlocker(opt.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 14, padding: '14px 18px', cursor: maxed ? 'default' : 'pointer',
                  opacity: maxed ? 0.4 : 1, width: '100%', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? GREEN : 'rgba(255,255,255,0.22)'}`, background: active ? GREEN : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                    {active && '✓'}
                  </div>
                  <p style={{ fontFamily: dm, fontSize: 15, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.75)', margin: 0 }}>{opt.label}</p>
                </button>
              );
            })}
          </div>
          <Nav onBack={back} onNext={next} nextDisabled={blockers.length === 0} />
        </div>
      )}

      {/* ── SCREEN 6: School + Network ── */}
      {screen === 6 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 28px' }}>🎓</div>
          <h1 style={h1}>Did you know alumni and parents from your school are 10x more likely to reply and help?</h1>
          <p style={sub}>We'll use this to find warm connections when it makes sense.</p>

          <div style={{ position: 'relative', textAlign: 'left', marginBottom: 8 }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>What college do you go to?</p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🏛️</span>
              <input
                type="text"
                placeholder="e.g. University of Florida, Penn State..."
                value={college}
                onChange={e => handleCollegeInput(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: dm, fontSize: 15, color: '#fff',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '14px 14px 14px 44px',
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
            {collegeSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#14161f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', zIndex: 10, marginTop: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {collegeSuggestions.map(s => (
                  <button key={s} onClick={() => { setCollege(s); setCollegeSuggestions([]); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          <Nav onBack={back} onNext={next} nextDisabled={college.trim().length === 0} />
        </div>
      )}

      {/* ── SCREEN 7: Resume Upload ── */}
      {screen === 7 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

          <div style={{ width: 72, height: 72, borderRadius: 22, background: uploading ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 28px', transition: 'all 0.3s' }}>
            {uploading ? '⏳' : '📄'}
          </div>
          <h1 style={h1}>{uploading ? 'Analyzing your resume...' : 'Upload your resume'}</h1>
          <p style={sub}>{uploading ? 'The Agent is creating your upgraded version. This takes just a moment.' : 'The Agent will instantly show you a stronger, modern version — and build your personalized plan.'}</p>

          {!uploading && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', padding: '32px 24px', borderRadius: 20,
                border: '2px dashed rgba(34,197,94,0.4)',
                background: 'rgba(34,197,94,0.05)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                transition: 'all 0.2s', minHeight: 'auto', marginBottom: 20,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.7)'; e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.background = 'rgba(34,197,94,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: 40 }}>⬆️</span>
              <p style={{ fontFamily: dm, fontSize: 17, fontWeight: 700, color: GREEN, margin: 0 }}>Upload PDF or Word</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>We'll create your optimized version instantly</p>
            </button>
          )}

          {uploading && (
            <div style={{ width: '100%', padding: '32px 24px', borderRadius: 20, border: '2px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(34,197,94,0.2)', borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontFamily: dm, fontSize: 15, color: GREEN, margin: 0, fontWeight: 600 }}>Building your optimized resume...</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Strengthening bullets · Adding ATS keywords · Modernizing layout</p>
            </div>
          )}

          {!uploading && (
            <>
              <div style={{ textAlign: 'center' }}>
                <button onClick={next} style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, textDecoration: 'underline' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  Skip for now — I'll upload later
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={back} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SCREEN 8: Wow Moment ── */}
      {screen === 8 && (
        <div style={{ maxWidth: 680, width: '100%', animation: 'fadeUp 0.35s ease', overflowY: 'auto' }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase' }}>✨ Resume Upgraded</span>
            </div>
            <h1 style={{ ...h1, fontSize: 'clamp(22px, 4vw, 36px)' }}>Here's your upgraded resume</h1>
            {/* Score bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: sat, fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>42</span>
                <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Before</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ height: 4, width: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                <span style={{ fontFamily: dm, fontSize: 12, color: GREEN, fontWeight: 700 }}>→</span>
                <div style={{ height: 4, width: 40, background: GREEN, borderRadius: 2 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: sat, fontSize: 28, fontWeight: 900, color: GREEN, lineHeight: 1 }}>87</span>
                <p style={{ fontFamily: dm, fontSize: 10, color: GREEN, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>After</p>
              </div>
            </div>
            <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, fontStyle: 'italic' }}>
              This version is 3× more likely to get noticed based on recruiter feedback.
            </p>
          </div>

          {/* Before / After Resume Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* BEFORE */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px', opacity: 0.75 }}>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', textAlign: 'center' }}>Your Current Resume</p>
              <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', minHeight: 180, display: 'flex', alignItems: 'stretch' }}>
                {resumeUrl ? (
                  <iframe
                    src={resumeUrl}
                    title="Your Resume"
                    style={{ width: '100%', height: 220, border: 'none', display: 'block' }}
                  />
                ) : (
                  <div style={{ flex: 1, padding: '12px 10px' }}>
                    <div style={{ height: 8, background: '#ddd', borderRadius: 2, marginBottom: 6, width: '70%' }} />
                    <div style={{ height: 5, background: '#eee', borderRadius: 2, marginBottom: 10, width: '50%' }} />
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ccc', marginTop: 4, flexShrink: 0 }} />
                        <div style={{ height: 4, background: '#e5e5e5', borderRadius: 1, flex: 1 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AFTER */}
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))', border: '1.5px solid rgba(34,197,94,0.35)', borderRadius: 16, padding: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -8, right: 12, background: GREEN, borderRadius: 100, padding: '3px 10px', fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✨ Optimized</div>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', textAlign: 'center' }}>Agent-Optimized Version</p>
              <div style={{ background: '#fff', borderRadius: 8, padding: '12px 10px', minHeight: 180 }}>
                <div style={{ height: 8, background: '#1a1a2e', borderRadius: 2, marginBottom: 4, width: '75%' }} />
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <div style={{ height: 4, background: '#22c55e', borderRadius: 2, width: '30%' }} />
                  <div style={{ height: 4, background: '#e5e5e5', borderRadius: 2, width: '25%' }} />
                </div>
                <div style={{ height: 1, background: '#22c55e', marginBottom: 8, opacity: 0.4 }} />
                <div style={{ height: 4, background: '#1a1a2e', borderRadius: 1, marginBottom: 6, width: '55%' }} />
                {['Increased team efficiency by 34%', 'Led cross-functional project for 12 stakeholders', 'Drove $50K in new pipeline growth'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', marginTop: 4, flexShrink: 0 }} />
                    <div style={{ height: 4, background: i === 0 ? 'rgba(34,197,94,0.4)' : '#d1fae5', borderRadius: 1, flex: 1 }} />
                  </div>
                ))}
                <div style={{ height: 4, background: '#1a1a2e', borderRadius: 1, margin: '8px 0 5px', width: '50%' }} />
                {[1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', marginTop: 4, flexShrink: 0 }} />
                    <div style={{ height: 4, background: '#d1fae5', borderRadius: 1, flex: 1 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Feedback */}
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Agent Feedback</p>
            {[
              'Strengthened your bullet points to focus on results, not tasks',
              'Added clear sections for projects and leadership experience',
              'Made it ATS-friendly while keeping it visually standout',
              `Score improved from 42/100 → 87/100`,
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderTop: i > 0 ? '1px solid rgba(34,197,94,0.08)' : 'none' }}>
                <span style={{ color: GREEN, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{line}</p>
              </div>
            ))}
          </div>

          {/* Personalized Plan */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '22px 22px', marginBottom: 24 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>Based on your answers</p>
            <p style={{ fontFamily: sat, fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Your Personalized Job Search Plan</p>
            {(frustration >= 7
              ? [
                  { n: '01', text: 'Use this new resume on your next 10 applications this week' },
                  { n: '02', text: 'Apply to 3 lower Ghost Risk roles the Agent found for you' },
                  { n: '03', text: 'Let the Agent draft 2 warm outreach messages to alumni/parents' },
                ]
              : [
                  { n: '01', text: 'Refine this resume for your top 2 target roles' },
                  { n: '02', text: 'Build your application tracker so you stay organized' },
                  { n: '03', text: 'Start with 5 targeted applications per week' },
                ]
            ).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontFamily: sat, fontSize: 13, fontWeight: 900, color: GREEN, flexShrink: 0, marginTop: 1 }}>{item.n}</span>
                <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Pricing + CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(232,93,32,0.1), rgba(232,93,32,0.04))', border: '1.5px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '24px 22px', marginBottom: 12 }}>
            <p style={{ fontFamily: sat, fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Unlock Unlimited Resumes + Full Agent</p>
            <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px' }}>Everything you need to land interviews faster.</p>

            {[
              '✨ Unlimited resume versions & tailoring for any job',
              '📋 Full application tracker + smart reminders',
              '✉️ Personalized outreach + warm connection help',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{f}</p>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '16px 0 18px' }}>
              {[
                { price: '$9.99', period: '/week', label: 'Weekly', hot: false },
                { price: '$19', period: '/30 days', label: '🔥 Most Popular', hot: true },
              ].map((plan, i) => (
                <div key={i} onClick={saveAndAuth} style={{
                  background: plan.hot ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${plan.hot ? 'rgba(232,93,32,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <p style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: plan.hot ? ORANGE : '#fff', margin: 0, lineHeight: 1 }}>{plan.price}</p>
                  <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 4px' }}>{plan.period}</p>
                  <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: plan.hot ? ORANGE : 'rgba(255,255,255,0.5)', margin: 0 }}>{plan.label}</p>
                </div>
              ))}
            </div>

            <button onClick={saveAndAuth} style={{ width: '100%', fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', background: ORANGE, border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.4)', transition: 'all 0.2s', marginBottom: 10 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.4)'; }}
            >
              Unlock Full Agent →
            </button>

            <button onClick={saveAndAuth} style={{ width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s', marginBottom: 12 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              Use This Version &amp; Continue (limited free access)
            </button>

            <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>No credit card required for trial. Cancel anytime.</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 8 }}>
            <button onClick={back} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
          </div>
        </div>
      )}


    </div>
  );
}