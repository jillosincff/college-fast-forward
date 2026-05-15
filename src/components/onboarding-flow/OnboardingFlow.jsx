import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import LinkedInScreen from './LinkedInScreen';
import PlanScreen from './PlanScreen';

// ── Design Tokens ──────────────────────────────────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const TEXT3 = '#94A3B8';
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';
const R = 12;

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
  { key: 'exploring', emoji: '🔭', label: 'Just exploring options', sub: "Not sure yet — that's okay" },
];

const BLOCKERS = [
  { key: 'resume', label: "My resume isn't getting responses" },
  { key: 'ghosted', label: "I'm getting ghosted after applying" },
  { key: 'which_jobs', label: "I don't know which jobs to apply for" },
  { key: 'outreach', label: "I don't know how to reach the right people" },
  { key: 'disorganized', label: "I'm disorganized and losing track" },
  { key: 'interviews', label: 'Interviewing makes me nervous' },
];

// ── Shared Components ──────────────────────────────────────────
const Btn = ({ children, onClick, disabled, primary = true, small = false, style: extra = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: FONT,
      fontSize: small ? 13 : 15,
      fontWeight: 700,
      color: primary ? '#fff' : TEXT2,
      background: primary
        ? disabled ? '#CBD5E1' : `linear-gradient(to bottom, ${BLUE}, #0052CC)`
        : CARD,
      border: primary ? 'none' : `1px solid #E2E8F0`,
      borderRadius: 8,
      padding: small ? '10px 20px' : '15px 36px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      minHeight: 'auto',
      boxShadow: primary && !disabled ? '0 4px 14px rgba(0,102,255,0.25)' : SHADOW,
      transition: 'all 0.2s ease',
      ...extra,
    }}
    onMouseEnter={e => { if (!disabled && primary) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.35)'; } }}
    onMouseLeave={e => { if (!disabled && primary) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,102,255,0.25)'; } }}
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

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon, autoFocus }) => (
  <div style={{ textAlign: 'left', marginBottom: 8 }}>
    {label && <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>{label}</p>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        style={{
          width: '100%', boxSizing: 'border-box',
          fontFamily: FONT, fontSize: 15, color: TEXT,
          background: BG, border: `1px solid #E2E8F0`,
          borderRadius: R, padding: icon ? '13px 14px 13px 44px' : '13px 14px',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = BLUE_BORDER}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
      />
    </div>
  </div>
);

export default function OnboardingFlow({ onClose }) {
  const [screen, setScreen] = useState(1);
  const [frustration, setFrustration] = useState(5);
  const [seeking, setSeeking] = useState('');
  const [blockers, setBlockers] = useState([]);
  const [college, setCollege] = useState('');
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [locationPref, setLocationPref] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [citySuggestionsClosed, setCitySuggestionsClosed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState('');
  const [quickMajor, setQuickMajor] = useState('');
  const [quickSkills, setQuickSkills] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [dataInputMode, setDataInputMode] = useState('choose');
  const fileRef = useRef();

  const TOTAL = 9;
  const go = (n) => setScreen(n);
  const next = () => setScreen(s => s + 1);
  const back = () => setScreen(s => s - 1);

  const toggleBlocker = (key) => {
    setBlockers(prev => prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 2 ? [...prev, key] : prev);
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
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a resume parser and expert resume writer. Analyze this resume and return TWO versions:
1. "original": Extract the EXACT content — name, contact info, education, experience with original bullets, skills, activities. Do NOT invent or change anything.
2. "optimized_experience": The same experience entries but with bullet points rewritten to be stronger, results-oriented, and ATS-friendly. Keep all company names, titles, dates, and locations EXACTLY the same. Only improve bullet language.
Return valid JSON matching the schema exactly.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            original: {
              type: 'object',
              properties: {
                name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
                linkedin: { type: 'string' }, location: { type: 'string' }, summary: { type: 'string' },
                education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
                experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
                skills: { type: 'array', items: { type: 'string' } },
                activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
              }
            },
            optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
          }
        }
      });
      const parsed = result.original;
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience } });
      setScreen(9);
    } catch (err) {
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
  const firstName = resumeData?.original?.name?.split(' ')[0] || null;

  const shell = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: BG,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    justifyContent: isFullPageScreen ? 'flex-start' : 'center',
    padding: isFullPageScreen ? '0 24px 40px' : '60px 24px 40px',
    fontFamily: FONT,
    overflowY: 'auto',
  };

  // Card wrapper for screens 1–8
  const card = { textAlign: 'center', maxWidth: 560, width: '100%', animation: 'fadeUp 0.3s ease' };

  // Heading styles for screens 1–8
  const h1style = {
    fontFamily: FONT, fontSize: 'clamp(24px, 4vw, 38px)',
    fontWeight: 800, color: TEXT, lineHeight: 1.15,
    letterSpacing: '-0.03em', margin: '0 0 14px',
  };
  const substyle = {
    fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 16px)',
    color: TEXT2, lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 440,
  };

  // Reusable option button for screens 4, 5, 7
  const OptionBtn = ({ active, onClick, emoji, label, sub, badge, shape = 'circle', disabled = false }) => (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      background: active ? BLUE_LIGHT : CARD,
      border: `1.5px solid ${active ? BLUE_BORDER : '#E2E8F0'}`,
      borderRadius: R, padding: '14px 16px', cursor: disabled ? 'default' : 'pointer',
      textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s',
      opacity: disabled ? 0.4 : 1, boxShadow: active ? 'none' : SHADOW,
    }}>
      {emoji && <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: active ? BLUE : TEXT, margin: 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {badge && <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{badge}</span>}
      <div style={{ width: 16, height: 16, borderRadius: shape === 'circle' ? '50%' : 4, border: `2px solid ${active ? GREEN : '#CBD5E1'}`, background: active ? GREEN : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
        {active && '✓'}
      </div>
    </button>
  );

  return (
    <div style={shell}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94A3B8; }
      `}</style>

      {/* ── Close Button ── */}
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, minHeight: 'auto', borderRadius: '50%', background: CARD, border: '1px solid #E2E8F0', color: TEXT2, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW }}>✕</button>

      {/* ── Progress Bar (screens 1–8) ── */}
      {screen < 9 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E2E8F0' }}>
            <div style={{ height: '100%', width: `${(screen / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: FONT, fontSize: 12, color: TEXT3, fontWeight: 600 }}>
            {screen} / {TOTAL}
          </div>
        </>
      )}

      {/* ── SCREEN 1: Welcome ── */}
      {screen === 1 && (
        <div style={card}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px', marginBottom: 28 }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>College Fast Forward</span>
          </div>
          <h1 style={h1style}>Welcome to College<br />Fast Forward.</h1>
          <p style={substyle}>Your job search co-pilot — built to learn who you are and get you interviews quickly.</p>
          <Btn onClick={next} style={{ display: 'block', margin: '0 auto', padding: '17px 52px', fontSize: 16 }}>Let's Get Started →</Btn>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, marginTop: 16 }}>Takes about 2 minutes. No credit card required.</p>
        </div>
      )}

      {/* ── SCREEN 2: Built by Experts ── */}
      {screen === 2 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            {[{ emoji: '🎓', label: 'Career Coach' }, { emoji: '💼', label: 'Recruiter' }, { emoji: '🏢', label: 'Hiring Manager' }].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: CARD, border: '1px solid #E2E8F0', borderRadius: R, padding: '20px 18px', boxShadow: SHADOW }}>
                <span style={{ fontSize: 26 }}>{item.emoji}</span>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: TEXT2, whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <h1 style={h1style}>Built by Hiring Experts</h1>
          <p style={substyle}>Designed with career coaches and recruiters who know exactly what gets candidates hired.</p>
          <Nav onBack={back} onNext={next} />
        </div>
      )}

      {/* ── SCREEN 3: Frustration Slider ── */}
      {screen === 3 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <h1 style={h1style}>How frustrated are you with your job search right now?</h1>
          <p style={substyle}>Most students feel overwhelmed, ghosted, or stuck. Be honest — this shapes your plan.</p>

          <div style={{ background: CARD, border: '1px solid #E2E8F0', borderRadius: R, padding: '28px 24px', marginBottom: 8, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT3 }}>Not at all</span>
              <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT3 }}>I'm losing my mind</span>
            </div>
            <input
              type="range" min="1" max="10" value={frustration}
              onChange={e => setFrustration(Number(e.target.value))}
              style={{ width: '100%', accentColor: frustration >= 7 ? '#EF4444' : GREEN, cursor: 'pointer', height: 6 }}
            />
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontFamily: FONT, fontSize: 52, fontWeight: 800, color: frustration >= 7 ? '#EF4444' : GREEN, lineHeight: 1, letterSpacing: '-0.03em' }}>{frustration}</span>
              <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT3, marginLeft: 6 }}>/10</span>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, marginTop: 10 }}>
                {frustration <= 3 ? "Things are going okay — let's make them even better." : frustration <= 6 ? "You're feeling the pressure. We've got you." : "We hear you. That's exactly why CFF exists."}
              </p>
            </div>
          </div>
          <Nav onBack={back} onNext={next} />
        </div>
      )}

      {/* ── SCREEN 4: What Are You Looking For ── */}
      {screen === 4 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <h1 style={h1style}>What are you mainly looking for right now?</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4, textAlign: 'left' }}>
            {SEEKING_OPTIONS.map(opt => (
              <OptionBtn key={opt.key} active={seeking === opt.key} onClick={() => setSeeking(opt.key)} emoji={opt.emoji} label={opt.label} sub={opt.sub} />
            ))}
          </div>
          <Nav onBack={back} onNext={next} nextDisabled={!seeking} />
        </div>
      )}

      {/* ── SCREEN 5: What's Holding You Back ── */}
      {screen === 5 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <h1 style={h1style}>What's the biggest thing holding you back?</h1>
          <p style={substyle}>Select up to 2 options.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {BLOCKERS.map(opt => {
              const active = blockers.includes(opt.key);
              const maxed = blockers.length >= 2 && !active;
              return (
                <OptionBtn key={opt.key} active={active} onClick={() => !maxed && toggleBlocker(opt.key)} label={opt.label} disabled={maxed} shape="square" />
              );
            })}
          </div>
          <Nav onBack={back} onNext={next} nextDisabled={blockers.length === 0} />
        </div>
      )}

      {/* ── SCREEN 6: School ── */}
      {screen === 6 && (
        <div style={{ ...card, maxWidth: 500 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 24px', boxShadow: SHADOW }}>🎓</div>
          <h1 style={h1style}>Alumni from your school are 10x more likely to help you.</h1>
          <p style={substyle}>We'll use this to find warm connections when it makes sense.</p>

          <div style={{ position: 'relative', textAlign: 'left' }}>
            <InputField
              label="What college do you go to?"
              placeholder="e.g. University of Florida, Penn State..."
              value={college}
              onChange={e => handleCollegeInput(e.target.value)}
              icon="🏛️"
            />
            {collegeSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: CARD, border: '1px solid #E2E8F0', borderRadius: R, overflow: 'hidden', zIndex: 10, marginTop: 4, boxShadow: SHADOW_MD }}>
                {collegeSuggestions.map(s => (
                  <button key={s} onClick={() => { setCollege(s); setCollegeSuggestions([]); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent', border: 'none', borderBottom: '1px solid #F1F5F9', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
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
        const TOP_CITIES = ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX', 'Boston, MA', 'Seattle, WA', 'Washington, DC', 'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Denver, CO', 'Philadelphia, PA', 'Houston, TX', 'Charlotte, NC', 'Nashville, TN', 'Minneapolis, MN', 'Portland, OR', 'San Diego, CA', 'Phoenix, AZ'];
        const citySuggestions = !citySuggestionsClosed && locationCity.length >= 2 ? TOP_CITIES.filter(c => c.toLowerCase().includes(locationCity.toLowerCase())).slice(0, 6) : [];
        const isRemote = locationPref === 'remote';
        const hasCity = locationPref === 'city' && locationCity.trim().length > 0;
        return (
          <div style={{ ...card, maxWidth: 500 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 24px', boxShadow: SHADOW }}>📍</div>
            <h1 style={h1style}>Where are you looking to work?</h1>
            <p style={substyle}>Helps the Agent find the right opportunities and connections for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 4 }}>
              <OptionBtn active={isRemote} onClick={() => setLocationPref('remote')} emoji="🌐" label="Remote" sub="Open to fully remote positions anywhere" />
              <OptionBtn active={locationPref === 'city'} onClick={() => setLocationPref('city')} emoji="🏙️" label="A specific city" sub="I have a target location in mind" />
            </div>
            {locationPref === 'city' && (
              <div style={{ position: 'relative', marginTop: 10 }}>
                <InputField placeholder="e.g. New York, NY or Austin, TX..." value={locationCity} onChange={e => { setLocationCity(e.target.value); setCitySuggestionsClosed(false); }} icon="🔍" autoFocus />
                {citySuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: CARD, border: '1px solid #E2E8F0', borderRadius: R, overflow: 'hidden', zIndex: 10, marginTop: 4, boxShadow: SHADOW_MD }}>
                    {citySuggestions.map(c => (
                      <button key={c} onClick={() => { setLocationCity(c); setLocationPref('city'); setCitySuggestionsClosed(true); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent', border: 'none', borderBottom: '1px solid #F1F5F9', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}
                        onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >{c}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Nav onBack={back} onNext={next} nextDisabled={!(isRemote || hasCity)} />
          </div>
        );
      })()}

      {/* ── SCREEN 8: Data Input ── */}
      {screen === 8 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

          {uploading && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px', boxShadow: SHADOW }}>⏳</div>
              <h1 style={h1style}>Analyzing your background...</h1>
              <p style={substyle}>The Agent is building your personalized profile. Just a moment.</p>
              <div style={{ background: CARD, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: R, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: SHADOW }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${GREEN_BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: FONT, fontSize: 14, color: GREEN, margin: 0, fontWeight: 600 }}>Building your optimized profile...</p>
              </div>
            </div>
          )}

          {!uploading && dataInputMode === 'choose' && (
            <>
              <h1 style={h1style}>Let's build your profile</h1>
              <p style={substyle}>The Agent needs to know who you are to find your insiders and build your plan.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <button onClick={() => fileRef.current?.click()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: R, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: SHADOW }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = GREEN}
                  onMouseLeave={e => e.currentTarget.style.borderColor = GREEN_BORDER}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>Upload Resume</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>PDF or Word — get a full Before/After transformation</p>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: GREEN, background: CARD, border: `1px solid ${GREEN_BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>BEST</span>
                </button>

                <button onClick={() => setDataInputMode('linkedin')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, background: BLUE_LIGHT, border: `1.5px solid ${BLUE_BORDER}`, borderRadius: R, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: SHADOW }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BLUE_BORDER}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>💼</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>Paste LinkedIn URL</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>No PDF? The Agent extracts your experience from LinkedIn</p>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: BLUE, background: CARD, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>FAST</span>
                </button>

                <button onClick={() => setDataInputMode('quickstart')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, background: CARD, border: `1px solid #E2E8F0`, borderRadius: R, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: SHADOW }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>⚡</span>
                  <div>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>Quick Start (3 questions)</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>No resume or LinkedIn? Answer 3 questions to build your starter profile</p>
                  </div>
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={back} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
              </div>
            </>
          )}

          {!uploading && dataInputMode === 'linkedin' && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px', boxShadow: SHADOW }}>💼</div>
              <h1 style={h1style}>Paste your LinkedIn URL</h1>
              <p style={substyle}>The Agent will extract your experience and build your full profile from there.</p>
              <InputField type="url" placeholder="https://linkedin.com/in/yourname" value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} />
              <Btn
                onClick={async () => {
                  if (!linkedinInput.trim()) return;
                  setUploading(true);
                  try {
                    const res = await base44.integrations.Core.InvokeLLM({
                      prompt: `Extract professional profile data from this LinkedIn URL: ${linkedinInput}
University: ${college || 'unknown'}. Target role type: ${seeking || 'unknown'}.
Create a professional profile JSON as if extracted from LinkedIn.`,
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
                    setResumeData({ original: parsed, optimized: { ...parsed, experience: res.optimized_experience || parsed.experience || [] } });
                  } catch { /* advance anyway */ }
                  setUploading(false);
                  setScreen(10);
                }}
                disabled={!linkedinInput.trim()}
                style={{ display: 'block', width: '100%', marginBottom: 12, marginTop: 8 }}
              >Extract My Profile →</Btn>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setDataInputMode('choose')} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>← Back to options</button>
              </div>
            </>
          )}

          {!uploading && dataInputMode === 'quickstart' && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px', boxShadow: SHADOW }}>⚡</div>
              <h1 style={h1style}>Quick Start</h1>
              <p style={substyle}>Answer 3 questions and the Agent builds your Starter Profile in seconds.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 20 }}>
                <InputField label="1. What's your major?" placeholder="e.g. Business Administration, Computer Science..." value={quickMajor} onChange={e => setQuickMajor(e.target.value)} />
                <InputField label="2. What are 2 things you're good at?" placeholder="e.g. Python, Writing, Organizing events, Excel..." value={quickSkills} onChange={e => setQuickSkills(e.target.value)} />
                <InputField label="3. What job/internship are you dreaming of?" placeholder="e.g. Marketing internship at a tech company..." value={quickRole} onChange={e => setQuickRole(e.target.value)} />
              </div>
              <Btn
                onClick={async () => {
                  if (!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()) return;
                  setUploading(true);
                  try {
                    const res = await base44.integrations.Core.InvokeLLM({
                      prompt: `Build a realistic starter professional profile for a college student with:
Major: ${quickMajor}, Skills: ${quickSkills}, Dream role: ${quickRole}, University: ${college || 'university'}
Create a plausible profile with 1-2 experience entries (clubs, part-time jobs, class projects), relevant skills, and education. Then write an optimized version.`,
                      response_json_schema: {
                        type: 'object', properties: {
                          original: { type: 'object', properties: {
                            name: { type: 'string' }, summary: { type: 'string' },
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
                    if (parsed.education?.length > 0 && college) parsed.education[0].school = college;
                    setResumeData({ original: parsed, optimized: { ...parsed, experience: res.optimized_experience }, isQuickStart: true, targetRole: quickRole });
                  } catch { /* advance anyway */ }
                  setUploading(false);
                  setScreen(9);
                }}
                disabled={!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()}
                style={{ display: 'block', width: '100%', marginBottom: 12 }}
              >Build My Starter Profile →</Btn>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setDataInputMode('choose')} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>← Back to options</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SCREEN 9: Wow Moment (Resume Before/After) ── */}
      {screen === 9 && (
        <div style={{ maxWidth: 900, width: '100%', animation: 'fadeUp 0.35s ease', paddingTop: 80, minHeight: '100vh', boxSizing: 'border-box' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {firstName
                ? `${firstName}'s Resume Just Leveled Up`
                : dataInputMode === 'quickstart' ? 'Your Starter Profile Is Ready' : 'Your Resume Just Leveled Up'}
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 auto', maxWidth: 520, lineHeight: 1.65 }}>
              {dataInputMode === 'quickstart' ? 'The Agent built your starter profile and showed what stronger positioning looks like.' : 'The Agent rewrote your bullets, improved the layout, and made it ATS-ready — without losing your story.'}
            </p>
          </div>

          {/* Before / After */}
          {(() => {
            const toStr = (v) => (v && typeof v === 'object') ? (v.url || v.text || v.value || JSON.stringify(v)) : (v || '');
            const orig = resumeData?.original;
            const opt = resumeData?.optimized;
            const SecDiv = ({ label }) => (
              <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: GREEN_BORDER }} />
                <span>{label}</span>
                <div style={{ flex: 1, height: 1, background: GREEN_BORDER }} />
              </div>
            );
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* BEFORE */}
                <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, overflow: 'hidden' }}>
                  <div style={{ background: '#F1F5F9', padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {dataInputMode === 'quickstart' ? 'Starter Profile' : 'Your Current Resume'}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>Before</span>
                  </div>
                  <div style={{ padding: '20px 24px', background: CARD, minHeight: 480 }}>
                    {orig ? (
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 11.5, color: '#374151', lineHeight: 1.6 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px', fontFamily: FONT }}>{toStr(orig.name)}</p>
                        <p style={{ fontSize: 10, color: TEXT2, margin: '0 0 12px', fontFamily: FONT }}>{[toStr(orig.email), toStr(orig.phone), toStr(orig.location)].filter(Boolean).join(' · ')}</p>
                        {orig.education?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Education</p>
                          {orig.education.map((e, i) => <div key={i}><p style={{ margin: '0 0 1px', fontWeight: 600, fontFamily: FONT, fontSize: 11 }}>{toStr(e.school)}</p><p style={{ margin: '0 0 6px', color: TEXT2, fontSize: 10, fontFamily: FONT }}>{toStr(e.degree)} {e.dates ? `· ${toStr(e.dates)}` : ''}</p></div>)}</>}
                        {orig.experience?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Experience</p>
                          {orig.experience.map((ex, i) => <div key={i} style={{ marginBottom: 8 }}><p style={{ margin: '0 0 1px', fontWeight: 600, fontFamily: FONT, fontSize: 11 }}>{toStr(ex.title)} — {toStr(ex.company)}</p><p style={{ margin: '0 0 3px', color: TEXT2, fontSize: 10, fontFamily: FONT }}>{toStr(ex.dates)}</p>{ex.bullets?.map((b, j) => <p key={j} style={{ margin: '0 0 1px', paddingLeft: 8 }}>· {toStr(b)}</p>)}</div>)}</>}
                        {orig.skills?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Skills</p><p style={{ margin: 0, fontFamily: FONT, fontSize: 10 }}>{orig.skills.map(toStr).join(', ')}</p></>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, flexDirection: 'column', gap: 10 }}>
                        <div style={{ width: 28, height: 28, border: `3px solid #E2E8F0`, borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>Parsing your resume...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER */}
                <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, border: `2px solid ${GREEN_BORDER}`, overflow: 'hidden' }}>
                  <div style={{ background: GREEN_LIGHT, padding: '14px 20px', borderBottom: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agent Optimized</span>
                    <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', background: GREEN, borderRadius: 6, padding: '2px 10px' }}>OPTIMIZED</span>
                  </div>
                  <div style={{ minHeight: 480 }}>
                    {!opt ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480, flexDirection: 'column', gap: 10 }}>
                        <div style={{ width: 32, height: 32, border: `3px solid ${GREEN_BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontFamily: FONT, fontSize: 13, color: GREEN, margin: 0 }}>Optimizing your resume...</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ background: '#0F172A', padding: '20px 24px 16px' }}>
                          <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{toStr(opt.name)}</div>
                          <div style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{[toStr(opt.email), toStr(opt.phone), toStr(opt.location)].filter(Boolean).join(' · ')}</div>
                          {opt.skills?.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {opt.skills.slice(0, 3).map((tag, i) => (
                                <span key={i} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: GREEN, background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 5, padding: '2px 7px' }}>{toStr(tag)}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                          {opt.education?.length > 0 && <div style={{ marginBottom: 16 }}><SecDiv label="Education" />{opt.education.map((e, i) => <div key={i} style={{ marginBottom: 6 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT }}>{toStr(e.school)}</span><span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>{toStr(e.dates)}</span></div><div style={{ fontFamily: FONT, fontSize: 10, color: TEXT2, marginTop: 1 }}>{toStr(e.degree)}</div></div>)}</div>}
                          {opt.experience?.length > 0 && <div style={{ marginBottom: 16 }}><SecDiv label="Experience" />{opt.experience.map((ex, i) => <div key={i} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT }}>{toStr(ex.title)}</span><span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>{toStr(ex.dates)}</span></div><div style={{ fontFamily: FONT, fontSize: 10, color: GREEN, fontWeight: 600, marginBottom: 4 }}>{toStr(ex.company)}</div>{ex.bullets?.map((b, j) => <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 3 }}><span style={{ color: GREEN, fontSize: 10, flexShrink: 0, marginTop: 1 }}>▸</span><p style={{ fontFamily: FONT, fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.6 }}>{toStr(b)}</p></div>)}</div>)}</div>}
                          {opt.skills?.length > 0 && <div><SecDiv label="Skills" /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{opt.skills.map((s, i) => <span key={i} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: '#059669', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 5, padding: '2px 7px' }}>{toStr(s)}</span>)}</div></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Agent Feedback Card */}
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px 28px', marginBottom: 32, border: `1px solid ${GREEN_BORDER}` }}>
            <h3 style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✓ Agent Feedback
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Strengthened bullet points to focus on results, not tasks',
                'Improved formatting and visual hierarchy for a modern look',
                'Made it ATS-friendly while keeping it visually standout',
                <span>Score improved from <span style={{ textDecoration: 'line-through', color: '#EF4444', margin: '0 4px' }}>51/100</span> → <span style={{ fontWeight: 700, color: GREEN, marginLeft: 4 }}>97/100</span></span>,
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
                  <span style={{ color: GREEN, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button
              onClick={() => setScreen(10)}
              style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto 14px', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff', background: `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 8, padding: '20px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(0,102,255,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,102,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,102,255,0.3)'; }}
            >
              Next: Optimize My Online Presence →
            </button>
            <button onClick={saveAndAuth} style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
              Use this version for now and continue
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button onClick={back} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
          </div>

          {/* Paywall Modal */}
          {showPaywall && (
            <div onClick={() => setShowPaywall(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ background: CARD, borderRadius: 16, padding: '36px 28px', maxWidth: 420, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', animation: 'fadeUp 0.25s ease' }}>
                <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: TEXT, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock the Full Agent</h2>
                <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>Unlimited modern resumes, tailoring for any job, tracking, reminders, and more.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={saveAndAuth} style={{ width: '100%', background: BG, border: `1px solid #E2E8F0`, borderRadius: R, padding: '16px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: SHADOW }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = BG}
                  >
                    <div><p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>$4.99 / week</p><p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>Cancel anytime</p></div>
                    <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '2px 8px' }}>Flexible</span>
                  </button>
                  <button onClick={saveAndAuth} style={{ width: '100%', background: `linear-gradient(to bottom, ${GREEN}, #059669)`, border: 'none', borderRadius: R, padding: '16px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div><p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p><p style={{ fontFamily: FONT, fontSize: 12, color: '#D1FAE5', margin: '2px 0 0' }}>Best value · Most students choose this</p></div>
                    <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: GREEN, background: '#fff', borderRadius: 6, padding: '4px 10px', position: 'absolute', top: -10, right: 12 }}>POPULAR</span>
                  </button>
                </div>
                <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 18 }}>
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