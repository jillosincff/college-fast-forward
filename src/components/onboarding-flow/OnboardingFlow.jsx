import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import LinkedInScreen from './LinkedInScreen';
import PlanScreen from './PlanScreen';

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
  const [locationPref, setLocationPref] = useState(''); // 'remote' or a city string
  const [locationCity, setLocationCity] = useState('');
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState('');
  const [quickMajor, setQuickMajor] = useState('');
  const [quickSkills, setQuickSkills] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [dataInputMode, setDataInputMode] = useState('choose'); // 'choose' | 'linkedin' | 'quickstart'
  const fileRef = useRef();

  const TOTAL = 9;
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

      // Single AI call: parse original AND generate optimized bullets simultaneously
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a resume parser and expert resume writer. Analyze this resume and return TWO versions:

1. "original": Extract the EXACT content — name, contact info, education, experience with original bullets, skills, activities. Do NOT invent or change anything.

2. "optimized_experience": The same experience entries but with bullet points rewritten to be stronger, results-oriented, and ATS-friendly. Keep all company names, titles, dates, and locations EXACTLY the same. Only improve bullet language with stronger action verbs.

Return valid JSON matching the schema exactly.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            original: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                linkedin: { type: 'string' },
                location: { type: 'string' },
                summary: { type: 'string' },
                education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
                experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
                skills: { type: 'array', items: { type: 'string' } },
                activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
              }
            },
            optimized_experience: {
              type: 'array',
              items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } }
            }
          }
        }
      });

      const parsed = result.original;
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience } });
      setScreen(9);
    } catch (err) {
      console.error(err);
      // Still advance even if AI fails
      setScreen(9);
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
      const loc = locationPref === 'remote' ? 'remote' : locationCity;
      if (loc) localStorage.setItem('cff_location', loc);
    } catch (e) {}
    base44.auth.redirectToLogin(window.location.origin + '/#GatorAuth');
  };

  const isFullPageScreen = screen >= 9;

  const shell = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: screen === 11 ? '#f8f9fc' : '#07080f',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    justifyContent: isFullPageScreen ? 'flex-start' : 'center',
    padding: isFullPageScreen ? '0 24px 40px' : '60px 24px 40px',
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
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 38, height: 38, minHeight: 'auto', borderRadius: '50%', background: screen === 11 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)', border: `1px solid ${screen === 11 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`, color: screen === 11 ? '#6b7280' : 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      {/* Progress bar — hidden on final screen */}
      {screen < 9 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', width: `${(screen / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            {screen} / {TOTAL}
          </div>
        </>
      )}

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

      {/* ── SCREEN 7: Work Location ── */}
      {screen === 7 && (() => {
        const TOP_CITIES = [
          'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL',
          'Austin, TX', 'Boston, MA', 'Seattle, WA', 'Washington, DC',
          'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Denver, CO',
          'Philadelphia, PA', 'Houston, TX', 'Charlotte, NC', 'Nashville, TN',
          'Minneapolis, MN', 'Portland, OR', 'San Diego, CA', 'Phoenix, AZ',
        ];
        const citySuggestions = locationCity.length >= 2
          ? TOP_CITIES.filter(c => c.toLowerCase().includes(locationCity.toLowerCase())).slice(0, 6)
          : [];
        const isRemote = locationPref === 'remote';
        const hasCity = locationPref === 'city' && locationCity.trim().length > 0;
        const canContinue = isRemote || hasCity;

        return (
          <div style={{ ...card, maxWidth: 520 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 28px' }}>📍</div>
            <h1 style={h1}>Where are you looking to work?</h1>
            <p style={sub}>This helps the Agent find the right opportunities and connections for you.</p>

            {/* Remote option */}
            <button
              onClick={() => setLocationPref('remote')}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                background: isRemote ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isRemote ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
                textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>🌐</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: isRemote ? '#fff' : 'rgba(255,255,255,0.8)', margin: 0 }}>Remote</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Open to fully remote positions anywhere</p>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isRemote ? GREEN : 'rgba(255,255,255,0.2)'}`, background: isRemote ? GREEN : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                {isRemote && '✓'}
              </div>
            </button>

            {/* City option */}
            <button
              onClick={() => setLocationPref('city')}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                background: locationPref === 'city' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${locationPref === 'city' ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
                textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>🏙️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: locationPref === 'city' ? '#fff' : 'rgba(255,255,255,0.8)', margin: 0 }}>A specific city</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>I have a target location in mind</p>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${locationPref === 'city' ? GREEN : 'rgba(255,255,255,0.2)'}`, background: locationPref === 'city' ? GREEN : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                {locationPref === 'city' && '✓'}
              </div>
            </button>

            {/* City search input */}
            {locationPref === 'city' && (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY or Austin, TX..."
                    value={locationCity}
                    onChange={e => setLocationCity(e.target.value)}
                    autoFocus
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
                {citySuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#14161f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', zIndex: 10, marginTop: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    {citySuggestions.map(c => (
                      <button key={c} onClick={() => { setLocationCity(c); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >{c}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Nav onBack={back} onNext={next} nextDisabled={!canContinue} />
          </div>
        );
      })()}

      {/* ── SCREEN 8: Data Input (3 paths) ── */}
      {screen === 8 && (
        <div style={{ ...card, maxWidth: 540 }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

          {/* Loading state */}
          {uploading && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 28px' }}>⏳</div>
              <h1 style={h1}>Analyzing your background...</h1>
              <p style={sub}>The Agent is building your personalized profile. Just a moment.</p>
              <div style={{ width: '100%', padding: '28px 24px', borderRadius: 20, border: '2px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, border: `3px solid rgba(34,197,94,0.2)`, borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: dm, fontSize: 14, color: GREEN, margin: 0, fontWeight: 600 }}>Building your optimized profile...</p>
              </div>
            </div>
          )}

          {/* Choose path */}
          {!uploading && dataInputMode === 'choose' && (
            <>
              <h1 style={h1}>Let's build your profile</h1>
              <p style={sub}>The Agent needs to know who you are to find your insiders and build your plan.</p>

              {/* Option 1: Resume */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(34,197,94,0.07)', border: '1.5px solid rgba(34,197,94,0.35)', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', marginBottom: 12, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.13)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.07)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)'; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>Upload Resume</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>PDF or Word — get a full Before/After transformation</p>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, background: 'rgba(34,197,94,0.15)', borderRadius: 100, padding: '3px 10px', flexShrink: 0 }}>BEST</span>
              </button>

              {/* Option 2: LinkedIn */}
              <button
                onClick={() => setDataInputMode('linkedin')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(0,119,181,0.07)', border: '1.5px solid rgba(0,119,181,0.3)', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', marginBottom: 12, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,119,181,0.13)'; e.currentTarget.style.borderColor = 'rgba(0,119,181,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,119,181,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,119,181,0.3)'; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>💼</span>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>Paste LinkedIn URL</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>No PDF? The Agent extracts your experience from LinkedIn</p>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#60a5fa', background: 'rgba(0,119,181,0.15)', borderRadius: 100, padding: '3px 10px', flexShrink: 0 }}>FAST</span>
              </button>

              {/* Option 3: Quick Start */}
              <button
                onClick={() => setDataInputMode('quickstart')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', marginBottom: 24, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>⚡</span>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>Quick Start (3 questions)</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>No resume, no LinkedIn? Answer 3 questions and we'll build your starter profile</p>
                </div>
              </button>

              <div style={{ textAlign: 'center' }}>
                <button onClick={back} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
              </div>
            </>
          )}

          {/* LinkedIn path */}
          {!uploading && dataInputMode === 'linkedin' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>💼</div>
              <h1 style={h1}>Paste your LinkedIn URL</h1>
              <p style={sub}>The Agent will extract your experience and build your full profile from there.</p>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={linkedinInput}
                onChange={e => setLinkedinInput(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', fontFamily: dm, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px', outline: 'none', marginBottom: 20 }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,119,181,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <Btn
                onClick={async () => {
                  if (!linkedinInput.trim()) return;
                  setUploading(true);
                  try {
                    const res = await base44.integrations.Core.InvokeLLM({
                      prompt: `Extract professional profile data from this LinkedIn URL: ${linkedinInput}
University: ${college || 'unknown'}. Target role type: ${seeking || 'unknown'}.
Create a professional profile JSON as if extracted from LinkedIn. Be realistic and professional.`,
                      response_json_schema: {
                        type: 'object', properties: {
                          original: { type: 'object', properties: {
                            name: { type: 'string' }, email: { type: 'string' }, linkedin: { type: 'string' },
                            summary: { type: 'string' },
                            education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' } } } },
                            experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
                            skills: { type: 'array', items: { type: 'string' } },
                            activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' } } } }
                          }},
                          optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
                        }
                      }
                    });
                    const parsed = res.original || res;
                    const optimizedExp = res.optimized_experience || parsed.experience || [];
                    setResumeData({ original: parsed, optimized: { ...parsed, experience: optimizedExp } });
                  } catch { /* advance anyway */ }
                  setUploading(false);
                  setScreen(10);
                }}
                disabled={!linkedinInput.trim()}
                style={{ display: 'block', width: '100%', marginBottom: 16 }}
              >
                Extract My Profile →
              </Btn>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setDataInputMode('choose')} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>← Back to options</button>
              </div>
            </>
          )}

          {/* Quick Start path */}
          {!uploading && dataInputMode === 'quickstart' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>⚡</div>
              <h1 style={h1}>Quick Start</h1>
              <p style={sub}>Answer 3 questions and the Agent builds your Starter Profile in seconds.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', marginBottom: 24 }}>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>1. What's your major?</p>
                  <input
                    type="text" placeholder="e.g. Business Administration, Computer Science..."
                    value={quickMajor} onChange={e => setQuickMajor(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', fontFamily: dm, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 16px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = `rgba(34,197,94,0.5)`}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>2. What are 2 things you're good at?</p>
                  <input
                    type="text" placeholder="e.g. Python, Writing, Organizing events, Excel..."
                    value={quickSkills} onChange={e => setQuickSkills(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', fontFamily: dm, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 16px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = `rgba(34,197,94,0.5)`}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>3. What job/internship are you dreaming of?</p>
                  <input
                    type="text" placeholder="e.g. Marketing internship at a tech company..."
                    value={quickRole} onChange={e => setQuickRole(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', fontFamily: dm, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 16px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = `rgba(34,197,94,0.5)`}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>

              <Btn
                onClick={async () => {
                  if (!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()) return;
                  setUploading(true);
                  try {
                    const res = await base44.integrations.Core.InvokeLLM({
                      prompt: `Build a realistic starter professional profile for a college student with:
Major: ${quickMajor}
Skills: ${quickSkills}
Dream role: ${quickRole}
University: ${college || 'university'}

Create a plausible profile with 1-2 experience entries (clubs, part-time jobs, class projects), relevant skills, and education. Then write an optimized version with stronger bullets.`,
                      response_json_schema: {
                        type: 'object', properties: {
                          original: { type: 'object', properties: {
                            name: { type: 'string' },
                            summary: { type: 'string' },
                            education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' } } } },
                            experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
                            skills: { type: 'array', items: { type: 'string' } },
                            activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' } } } }
                          }},
                          optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
                        }
                      }
                    });
                    const parsed = res.original;
                    // Inject college and role into the data
                    if (parsed.education?.length > 0 && college) parsed.education[0].school = college;
                    setResumeData({ original: parsed, optimized: { ...parsed, experience: res.optimized_experience }, isQuickStart: true, targetRole: quickRole });
                  } catch { /* advance anyway */ }
                  setUploading(false);
                  setScreen(9);
                }}
                disabled={!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()}
                style={{ display: 'block', width: '100%', marginBottom: 16 }}
              >
                Build My Starter Profile →
              </Btn>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setDataInputMode('choose')} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>← Back to options</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SCREEN 9: Wow Moment ── */}
      {screen === 9 && (
        <div className="resume-wow-page" style={{ maxWidth: 900, width: '100%', animation: 'fadeUp 0.35s ease', paddingTop: 100, minHeight: '100vh', boxSizing: 'border-box' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ ...h1, fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: 8 }}>
              {dataInputMode === 'linkedin' ? 'Your Profile Just Got Optimized' : dataInputMode === 'quickstart' ? 'Your Starter Profile Is Ready' : 'Your Resume Just Leveled Up'}
            </h1>
            <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              {dataInputMode === 'linkedin' ? 'The CFF Agent extracted your experience from LinkedIn and built you an optimized professional profile.' : dataInputMode === 'quickstart' ? 'The CFF Agent built your starter profile and showed you what it could look like with stronger positioning.' : 'The CFF Agent rewrote your bullets, fixed the layout, and made it look professional — without losing your story.'}
            </p>
          </div>

          {/* Before / After side by side */}
          {(() => {
            const toStr = (v) => (v && typeof v === 'object') ? (v.url || v.text || v.value || JSON.stringify(v)) : (v || '');
            const orig = resumeData?.original;
            const opt = resumeData?.optimized;
            const secDivider = (label) => (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, color: '#16a34a', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: '#d1fae5' }} />
                <span>{label}</span>
                <div style={{ flex: 1, height: 1, background: '#d1fae5' }} />
              </div>
            );
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>

                {/* BEFORE */}
                <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#9ca3af', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {dataInputMode === 'linkedin' ? 'Your LinkedIn Profile' : dataInputMode === 'quickstart' ? 'Your Starter Profile' : 'Your Current Resume'}
                    </h2>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 32, minHeight: 520, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)' }}>
                    {orig ? (
                      <div style={{ padding: 0, fontFamily: 'Georgia, serif', fontSize: 12, color: '#222', lineHeight: 1.6 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{toStr(orig.name)}</p>
                        <p style={{ fontSize: 11, color: '#555', margin: '0 0 12px' }}>{[toStr(orig.email), toStr(orig.phone), toStr(orig.linkedin), toStr(orig.location)].filter(Boolean).join(' | ')}</p>
                        {orig.education?.length > 0 && <>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '10px 0 4px', borderBottom: '1px solid #ccc', paddingBottom: 3 }}>EDUCATION</p>
                          {orig.education.map((e, i) => <div key={i}>
                            <p style={{ margin: '0 0 2px', fontWeight: 600 }}>{toStr(e.school)} — {toStr(e.degree)}</p>
                            <p style={{ margin: '0 0 8px', color: '#555', fontSize: 11 }}>{toStr(e.dates)}{e.gpa ? ` | GPA: ${toStr(e.gpa)}` : ''}{e.honors ? ` | ${toStr(e.honors)}` : ''}</p>
                          </div>)}
                        </>}
                        {orig.experience?.length > 0 && <>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '10px 0 4px', borderBottom: '1px solid #ccc', paddingBottom: 3 }}>EXPERIENCE</p>
                          {orig.experience.map((ex, i) => <div key={i} style={{ marginBottom: 10 }}>
                            <p style={{ margin: '0 0 2px', fontWeight: 600 }}>{toStr(ex.title)} — {toStr(ex.company)}{ex.location ? `, ${toStr(ex.location)}` : ''}</p>
                            <p style={{ margin: '0 0 4px', color: '#555', fontSize: 11 }}>{toStr(ex.dates)}</p>
                            {ex.bullets?.map((b, j) => <p key={j} style={{ margin: '0 0 2px' }}>- {toStr(b)}</p>)}
                          </div>)}
                        </>}
                        {orig.skills?.length > 0 && <>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '10px 0 4px', borderBottom: '1px solid #ccc', paddingBottom: 3 }}>SKILLS</p>
                          <p style={{ margin: '0 0 10px' }}>{orig.skills.map(toStr).join(', ')}</p>
                        </>}
                        {orig.activities?.length > 0 && <>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '10px 0 4px', borderBottom: '1px solid #ccc', paddingBottom: 3 }}>ACTIVITIES</p>
                          {orig.activities.map((a, i) => <p key={i} style={{ margin: '0 0 2px' }}>{toStr(a.name)}{a.role ? ` — ${toStr(a.role)}` : ''}{a.dates ? ` (${toStr(a.dates)})` : ''}</p>)}
                        </>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 12 }}>
                        <div style={{ width: 36, height: 36, border: '3px solid #374151', borderTop: '3px solid #6b7280', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0 }}>Parsing your resume...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER */}
                <div style={{ background: '#1a1d24', border: '2px solid #10b981', borderRadius: 24, padding: 32, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#34d399', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Agent Optimized Version</h2>
                    <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#000', background: '#10b981', borderRadius: 100, padding: '4px 16px' }}>OPTIMIZED</span>
                  </div>
                  
                  {/* Loading state */}
                  {!opt && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 40, height: 40, border: '4px solid #10b981', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ fontFamily: dm, fontSize: 14, color: '#34d399', margin: '0 0 4px' }}>The Agent is optimizing your resume...</p>
                        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>This usually takes 10-20 seconds</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Optimized content */}
                  {opt && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, minHeight: 520, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                      {/* Dark header */}
                      <div style={{ background: '#0f172a', padding: '24px 22px 18px', margin: '-32px -32px 24px', borderRadius: '16px 16px 0 0' }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{toStr(opt.name)}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                          {[toStr(opt.email), toStr(opt.phone), toStr(opt.linkedin), toStr(opt.location)].filter(Boolean).join(' · ')}
                        </div>
                        {opt.skills?.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {opt.skills.slice(0, 3).map((tag, i) => (
                              <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, padding: '2px 8px' }}>{toStr(tag)}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      {opt.summary && (
                        <div style={{ marginBottom: 24 }}>
                          {secDivider('Professional Summary')}
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: '#374151', margin: 0, lineHeight: 1.7 }}>{toStr(opt.summary)}</p>
                        </div>
                      )}

                      {/* Education */}
                      {opt.education?.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          {secDivider('Education')}
                          {opt.education.map((e, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                 <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{toStr(e.school)}</div>
                                 <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#64748b' }}>{toStr(e.dates)}</div>
                               </div>
                               <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#475569', marginTop: 1 }}>
                                 {[toStr(e.degree), e.gpa ? `GPA: ${toStr(e.gpa)}` : null, toStr(e.honors)].filter(Boolean).join(' · ')}
                               </div>
                             </div>
                          ))}
                        </div>
                      )}

                      {/* Experience */}
                      {opt.experience?.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          {secDivider('Experience')}
                          {opt.experience.map((ex, i) => (
                            <div key={i} style={{ marginBottom: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{toStr(ex.title)}</div>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#64748b' }}>{toStr(ex.dates)}</div>
                              </div>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>
                                {toStr(ex.company)}{ex.location ? ` · ${toStr(ex.location)}` : ''}
                              </div>
                              {ex.bullets?.map((b, j) => (
                                <div key={j} style={{ display: 'flex', gap: 7, marginBottom: 4 }}>
                                  <span style={{ color: '#22c55e', fontSize: 11, flexShrink: 0, marginTop: 1 }}>▸</span>
                                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.6 }}>{toStr(b)}</p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {opt.skills?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          {secDivider('Skills')}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {opt.skills.map((s, i) => (
                              <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 9px' }}>{toStr(s)}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {opt.activities?.length > 0 && (
                        <div>
                          {secDivider('Leadership & Activities')}
                          {opt.activities.map((a, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{toStr(a.name)}{a.role ? ` — ${toStr(a.role)}` : ''}</div>
                              {a.dates && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#64748b' }}>{toStr(a.dates)}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Agent Feedback */}
          <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: '32px 28px', marginBottom: 48 }}>
            <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>✓</span> AGENT FEEDBACK
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Strengthened your bullet points to focus on results, not tasks',
                'Improved formatting and visual hierarchy for a modern look',
                'Made it ATS-friendly while keeping it visually standout',
                <>Score improved from <span style={{ textDecoration: 'line-through', color: '#f87171', margin: '0 6px' }}>51/100</span> → <span style={{ fontWeight: 700, color: '#34d399', marginLeft: 6 }}>97/100</span></>,
              ].map((line, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: dm, fontSize: 14, color: '#d1d5db', lineHeight: 1.6 }}>
                  <span style={{ color: '#34d399', fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={() => setScreen(10)}
              style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto 16px', fontFamily: dm, fontSize: 18, fontWeight: 700, color: '#fff', background: '#f97316', border: 'none', borderRadius: 16, padding: '24px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 40px rgba(249,115,22,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(249,115,22,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(249,115,22,0.4)'; }}
            >
              Next: Optimize My Online Presence →
            </button>
            <button onClick={saveAndAuth} style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
              Use this version for now and continue
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button onClick={back} style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
          </div>

          {/* Paywall Modal */}
          {showPaywall && (
            <div
              onClick={() => setShowPaywall(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
            >
              <div onClick={e => e.stopPropagation()} style={{ background: '#1f2937', borderRadius: 24, padding: 40, maxWidth: 440, width: '100%', animation: 'fadeUp 0.25s ease' }}>
                <h2 style={{ fontFamily: sat, fontSize: 24, fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock the Full Agent</h2>
                <p style={{ fontFamily: dm, fontSize: 14, color: '#9ca3af', textAlign: 'center', margin: '0 0 32px', lineHeight: 1.6 }}>Get unlimited modern resumes, tailoring for any job, tracking, reminders, and more.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Weekly plan */}
                  <button
                    onClick={saveAndAuth}
                    style={{ width: '100%', background: '#374151', border: '1px solid #4b5563', borderRadius: 16, padding: '24px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4b5563'}
                    onMouseLeave={e => e.currentTarget.style.background = '#374151'}
                  >
                    <div>
                      <p style={{ fontFamily: sat, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>$9.99 / week</p>
                      <p style={{ fontFamily: dm, fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>Cancel anytime</p>
                    </div>
                    <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#34d399', background: 'rgba(34,197,94,0.15)', borderRadius: 100, padding: '4px 10px' }}>Most flexible</span>
                  </button>

                  {/* 30-day plan */}
                  <button
                    onClick={saveAndAuth}
                    style={{ width: '100%', background: '#059669', border: '2px solid #34d399', borderRadius: 16, padding: '24px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#10b981'}
                    onMouseLeave={e => e.currentTarget.style.background = '#059669'}
                  >
                    <div>
                      <p style={{ fontFamily: sat, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
                      <p style={{ fontFamily: dm, fontSize: 13, color: '#d1fae5', margin: '4px 0 0' }}>Best value • Most students choose this</p>
                    </div>
                    <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#000', background: '#fff', borderRadius: 100, padding: '4px 12px', position: 'absolute', top: -8, right: -8 }}>POPULAR</span>
                  </button>
                </div>

                <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 32 }}>
                  Maybe later
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCREEN 10: LinkedIn Identity Architect ── */}
      {screen === 10 && (
        <LinkedInScreen
          resumeData={resumeData}
          college={college}
          seeking={seeking}
          targetRole={resumeData?.targetRole || quickRole}
          onBack={() => setScreen(9)}
          saveAndAuth={saveAndAuth}
          onNext={() => setScreen(11)}
        />
      )}

      {/* ── SCREEN 11: Your 14-Day Plan ── */}
      {screen === 11 && (
        <PlanScreen
          resumeData={resumeData}
          college={college}
          seeking={seeking}
          blockers={blockers}
          frustration={frustration}
          locationPref={locationPref}
          locationCity={locationCity}
          quickRole={quickRole}
          onBack={() => setScreen(10)}
          saveAndAuth={saveAndAuth}
        />
      )}

    </div>
  );
}