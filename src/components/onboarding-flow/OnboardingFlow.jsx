import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { processReferralMilestone } from '@/functions/processReferralMilestone';
import LinkedInScreen from './LinkedInScreen';
import PlanScreen from './PlanScreen';
import Screen6School from './Screen6School';
import ATSScoreRing from './ATSScoreRing';
import LiveEngineLoader from './LiveEngineLoader';
import FunnelTransition from './FunnelTransition';
import IndustryScreen from './IndustryScreen';

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
  { key: 'internship', emoji: '🎓', label: 'Internship', sub: 'This semester or summer', hint: 'Agent will prioritize short-term roles + strong return-offer paths' },
  { key: 'fulltime', emoji: '💼', label: 'Full-time job after graduation', sub: 'Ready to enter the workforce', hint: 'Agent will focus on full-time pipelines + long-term networking' },
  { key: 'both', emoji: '🎯', label: 'Both internships and full-time', sub: 'Keeping all options open', hint: 'Agent will build a flexible dual-track strategy' },
  { key: 'exploring', emoji: '🔭', label: 'Just exploring options', sub: "Not sure yet — that's okay", hint: 'Agent will help you discover what fits best first' },
];

const BLOCKERS = [
  {
    key: 'resume',
    icon: '📄',
    label: "My resume isn't getting responses",
    solution: "We'll optimize it for ATS + make it recruiter-magnet level.",
    tool: 'Resume Optimizer',
  },
  {
    key: 'ghosted',
    icon: '👻',
    label: "I'm getting ghosted after applying",
    solution: "Switch to our verified Fast Track job feed with warm intros.",
    tool: 'Fast Track Feed',
  },
  {
    key: 'no_direction',
    icon: '🧩',
    label: "I'm not exactly sure what I want to do yet",
    solution: "Unlock your Career Archetype to discover your ideal path.",
    tool: 'Career Archetype Assessment',
  },
  {
    key: 'which_jobs',
    icon: '🔍',
    label: "I don't know which jobs to apply for",
    solution: "Your Agent scouts matching roles daily and ranks them for you.",
    tool: 'Job Scout Agent',
  },
  {
    key: 'outreach',
    icon: '🤝',
    label: "I don't know how to reach the right people",
    solution: "We'll surface alumni insiders at your target companies.",
    tool: 'Alumni Network',
  },
  {
    key: 'disorganized',
    icon: '📁',
    label: "I'm disorganized and losing track",
    solution: "Your Personal Hiring CRM keeps everything organized + on track.",
    tool: 'Hiring CRM',
  },
  {
    key: 'interviews',
    icon: '🎤',
    label: 'Interviewing makes me nervous',
    solution: "Unlock AI mock interviews with real-time feedback.",
    tool: 'Mock Interview Coach',
  },
];

// ── Screen 2: Built by Experts (extracted to avoid conditional hooks) ───────
const SCREEN2_EXPERTS = [
  { key: 'coach', avatar: 'https://media.base44.com/images/public/684474c5723dc90efce23588/fe0568933_image.png', name: 'Anna V.', role: 'ex-SAP, Global Early Talent', teaser: 'Built hiring pipelines at SAP. She knows exactly what recruiters look for in interns & new grads.', color: '#7C3AED', colorLight: '#F5F3FF', colorBorder: '#DDD6FE' },
  { key: 'recruiter', avatar: 'https://media.base44.com/images/public/684474c5723dc90efce23588/4dc2560b9_image.png', name: 'Jill O.', role: 'Ex-IPSY Recruiter + Certified Career Coach', teaser: "Spent years on the other side of the desk. She'll help you avoid the mistakes that get applications ghosted.", color: '#0066FF', colorLight: '#EFF6FF', colorBorder: '#BFDBFE' },
  { key: 'hm', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face', name: 'Sarah K.', role: 'Certified Career Coach', teaser: 'Specializes in helping students clarify their path and build unstoppable confidence in interviews.', color: '#10B981', colorLight: '#F0FDF4', colorBorder: '#BBF7D0' },
];
const SCREEN2_LOGOS = ['Goldman Sachs', 'Google', 'Meta', 'McKinsey', 'Amazon'];

// Maps blocker key → expert key that should be highlighted
const BLOCKER_TO_EXPERT = {
  resume: 'recruiter',   // Jill: ghosted applications / resume
  ghosted: 'recruiter',  // Jill: ghosted
  no_direction: 'hm',   // Sarah: career direction / confidence
  which_jobs: 'coach',  // Anna: what recruiters want
  outreach: 'coach',    // Anna: insider knowledge
  disorganized: 'hm',   // Sarah: clarity & confidence
  interviews: 'hm',     // Sarah: interview confidence
};

function Screen2Experts({ FONT, CARD, R, SHADOW, SHADOW_MD, BLUE, BLUE_LIGHT, BLUE_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, TEXT, TEXT2, TEXT3, h1style, substyle, hoveredExpert, setHoveredExpert, selectedExpert, setSelectedExpert, onBack, onNext, blockers }) {
  const [pressedExpert, setPressedExpert] = useState(null);

  // Determine featured expert from blockers
  const featuredKey = blockers?.length > 0
    ? (BLOCKER_TO_EXPERT[blockers[0]] || null)
    : null;
  const NavInline = ({ onBack: b, onNext: n, nextLabel = 'Continue →', nextDisabled = false }) => (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
      {b && <button onClick={b} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>← Back</button>}
      <button onClick={n} disabled={nextDisabled} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: nextDisabled ? '#CBD5E1' : `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 8, padding: '15px 36px', cursor: nextDisabled ? 'not-allowed' : 'pointer', minHeight: 'auto', boxShadow: nextDisabled ? 'none' : '0 4px 14px rgba(0,102,255,0.25)' }}>{nextLabel}</button>
    </div>
  );
  return (
    <div style={{ textAlign: 'center', maxWidth: 600, width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -60, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 20px' }}>Step 2 of 12 · Meet Your Team</p>
        <h1 style={{ ...h1style, fontSize: 'clamp(26px, 4.5vw, 42px)' }}>Your Career Agent is powered by real hiring experts.</h1>
        <p style={{ ...substyle, marginBottom: 8 }}>These are the people whose exact playbooks helped thousands of students break into competitive roles. Their strategies are now built into your personal Agent.</p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: BLUE, fontWeight: 600, margin: '0 0 24px' }}>Tap any expert below to see how they'll help you stand out.</p>
        <style>{`@media (max-width: 600px) { .expert-grid { flex-direction: column !important; } }`}</style>
        <div className="expert-grid" style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
          {SCREEN2_EXPERTS.map(ex => {
            const isActive = selectedExpert === ex.key;
            const isHov = hoveredExpert === ex.key;
            const isPressed = pressedExpert === ex.key;
            const isFeatured = featuredKey === ex.key && !selectedExpert;
            return (
              <div
                key={ex.key}
                onClick={() => setSelectedExpert(isActive ? null : ex.key)}
                onMouseEnter={() => setHoveredExpert(ex.key)}
                onMouseLeave={() => setHoveredExpert(null)}
                onMouseDown={() => setPressedExpert(ex.key)}
                onMouseUp={() => setPressedExpert(null)}
                onTouchStart={() => setPressedExpert(ex.key)}
                onTouchEnd={() => { setPressedExpert(null); setSelectedExpert(isActive ? null : ex.key); }}
                style={{
                  flex: 1, minWidth: 140,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  background: isActive ? ex.colorLight : isFeatured ? ex.colorLight : CARD,
                  border: `2px solid ${isActive ? ex.color : isFeatured ? ex.colorBorder : isHov ? ex.colorBorder : '#E2E8F0'}`,
                  borderRadius: 16, padding: '20px 14px 16px', cursor: 'pointer',
                  boxShadow: isActive ? `0 8px 24px ${ex.color}22` : isFeatured ? `0 8px 20px ${ex.color}18` : isHov ? SHADOW_MD : SHADOW,
                  transform: isPressed ? 'scale(0.95)' : isActive || isHov ? 'translateY(-4px)' : 'translateY(0)',
                  transition: isPressed ? 'transform 0.08s ease' : 'all 0.2s ease',
                  textAlign: 'center', position: 'relative',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Featured badge */}
                {isFeatured && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: ex.color, color: '#fff', fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    ✦ Recommended for you
                  </div>
                )}

                <img src={ex.avatar} alt={ex.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${isActive || isFeatured ? ex.color : '#E2E8F0'}`, transition: 'border-color 0.2s' }} onError={e => { e.target.style.display = 'none'; }} />
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: isActive || isFeatured ? ex.color : TEXT, margin: '0 0 2px' }}>{ex.name}</p>
                  <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, margin: 0 }}>{ex.role}</p>
                </div>

                {isActive ? (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: ex.color, margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>→ How she helps you: </span>
                    {ex.teaser}
                  </p>
                ) : (
                  <p style={{ fontFamily: FONT, fontSize: 11, color: isFeatured ? ex.color : TEXT2, margin: 0, fontWeight: isFeatured ? 600 : 400, opacity: isFeatured ? 1 : 0.75 }}>
                    Learn how she helps →
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20, marginBottom: 8 }}>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>Optimized for roles at</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {SCREEN2_LOGOS.map(l => <span key={l} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#CBD5E1', letterSpacing: '-0.01em' }}>{l}</span>)}
          </div>
        </div>

        {/* Bottom anticipation teaser */}
        <div style={{ margin: '16px 0 4px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
            Your Agent is already combining their best tactics into a custom plan for you…
          </p>
        </div>

        <NavInline onBack={onBack} onNext={onNext} />
      </div>
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────
const Btn = ({ children, onClick, disabled, primary = true, small = false, loading = false, style: extra = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      fontFamily: FONT,
      fontSize: small ? 13 : 15,
      fontWeight: 700,
      color: primary ? '#fff' : TEXT2,
      background: primary
        ? (disabled || loading) ? '#CBD5E1' : `linear-gradient(to bottom, ${BLUE}, #0052CC)`
        : CARD,
      border: primary ? 'none' : `1px solid #E2E8F0`,
      borderRadius: 8,
      padding: small ? '10px 20px' : '15px 36px',
      cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      minHeight: 'auto',
      boxShadow: primary && !disabled && !loading ? '0 4px 14px rgba(0,102,255,0.25)' : SHADOW,
      transition: 'all 0.2s ease',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      ...extra,
    }}
    onMouseEnter={e => { if (!disabled && !loading && primary) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.35)'; } }}
    onMouseLeave={e => { if (!disabled && !loading && primary) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,102,255,0.25)'; } }}
  >
    {loading && (
      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
    )}
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

// Persist onboarding progress to localStorage so returning users can resume
function saveProgress(screen, data = {}) {
  try {
    localStorage.setItem('cff_onboarding_screen', String(screen));
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        localStorage.setItem(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    });
  } catch (e) {}
}

function loadSavedProgress() {
  try {
    return {
      screen: parseInt(localStorage.getItem('cff_onboarding_screen') || '1', 10) || 1,
      seeking: localStorage.getItem('cff_seeking') || '',
      college: localStorage.getItem('cff_college') || '',
      frustration: parseInt(localStorage.getItem('cff_frustration') || '5', 10),
      blockers: JSON.parse(localStorage.getItem('cff_blockers') || '[]'),
      selectedIndustries: JSON.parse(localStorage.getItem('cff_industries') || '[]'),
      targetRoles: JSON.parse(localStorage.getItem('cff_target_roles') || '[]'),
      locationPref: localStorage.getItem('cff_location_pref') || '',
      locationCity: localStorage.getItem('cff_location_city') || '',
      resumeUrl: localStorage.getItem('cff_resume_url') || '',
    };
  } catch (e) {
    return { screen: 1, seeking: '', college: '', frustration: 5, blockers: [], selectedIndustries: [], targetRoles: [], locationPref: '', locationCity: '', resumeUrl: '' };
  }
}

export default function OnboardingFlow({ onClose, onAlreadyAuthed, postAuth = false, resumeAtScreen = null }) {
  // Load saved progress for returning users
  const saved = resumeAtScreen ? loadSavedProgress() : null;
  const startScreen = resumeAtScreen || 1;

  const [screen, setScreen] = useState(startScreen);
  const [analyzing, setAnalyzing] = useState(false); // analyzing loader after university
  const [frustration, setFrustration] = useState(saved?.frustration ?? 5);
  const [seeking, setSeeking] = useState(saved?.seeking ?? '');
  const [blockers, setBlockers] = useState(saved?.blockers ?? []);
  const [college, setCollege] = useState(saved?.college ?? '');
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [locationPref, setLocationPref] = useState(saved?.locationPref ?? '');
  const [locationCity, setLocationCity] = useState(saved?.locationCity ?? '');
  const [citySuggestionsClosed, setCitySuggestionsClosed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(saved?.resumeUrl ?? '');
  const [resumeData, setResumeData] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState('');
  const [quickMajor, setQuickMajor] = useState('');
  const [quickSkills, setQuickSkills] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [dataInputMode, setDataInputMode] = useState('choose');
  const [hoveredExpert, setHoveredExpert] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [analyzingFrustration, setAnalyzingFrustration] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState(saved?.selectedIndustries ?? []);
  const [targetRoles, setTargetRoles] = useState(saved?.targetRoles ?? []);
  const fileRef = useRef();

  const TOTAL = 12;

  const next = () => {
    const newScreen = screen + 1;
    saveProgress(newScreen, {
      cff_seeking: seeking,
      cff_college: college,
      cff_frustration: frustration,
      cff_blockers: blockers,
      cff_industries: selectedIndustries,
      cff_target_roles: targetRoles,
      cff_location_pref: locationPref,
      cff_location_city: locationCity,
      cff_resume_url: resumeUrl,
    });
    if (newScreen > 12) {
      if (onClose) onClose();
    } else {
      setScreen(newScreen);
    }
  };
  const back = () => {
    setScreen(s => {
      const prev = Math.max(1, s - 1);
      // Reset screen 9 sub-mode when leaving screen 9 via back
      if (s === 9) setDataInputMode('choose');
      return prev;
    });
  };

  const toggleBlocker = (key) => {
    setBlockers(prev => prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 2 ? [...prev, key] : prev);
  };

  const handleCollegeInput = (val) => {
    setCollege(val);
    if (val.length < 2) { setCollegeSuggestions([]); return; }
    setCollegeSuggestions(TOP_SCHOOLS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
  };

  // Fire referral milestone when referee hits the school step
  const fireReferralMilestone = async (schoolName) => {
    try {
      const referrerUserId = localStorage.getItem('cff_referrer_id');
      if (!referrerUserId) return;
      // Build a deterministic hash from a session-stable token (no PII at this point)
      const raw = referrerUserId + '_' + (Date.now() - (Date.now() % 86400000)); // day-bucket
      const msgBuffer = new TextEncoder().encode(raw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      processReferralMilestone({
        referrerUserId,
        refereeEmailHash: hashHex,
        schoolShortName: schoolName || '',
      }).catch(() => {}); // fire-and-forget — never block the UI
    } catch {}
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
IMPORTANT: Each field (name, email, phone, etc.) must be a plain string value, NOT a JSON object or nested structure. Return valid JSON matching the schema exactly.`,
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
      // Safely parse: if original is a string (LLM returned raw JSON string), parse it
      let parsed = result.original;
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch {} }
      // Sanitize each field: if any top-level field is an object or stringified JSON, extract string value
      if (parsed && typeof parsed === 'object') {
        ['name','email','phone','linkedin','location','summary'].forEach(k => {
          if (parsed[k]) {
            if (typeof parsed[k] === 'object') {
              parsed[k] = parsed[k].value || parsed[k].text || JSON.stringify(parsed[k]);
            }
            // If it's a string that looks like JSON, try to extract the actual value
            if (typeof parsed[k] === 'string' && parsed[k].startsWith('{')) {
              try {
                const nested = JSON.parse(parsed[k]);
                parsed[k] = nested[k] || nested.name || nested.value || nested.text || parsed[k];
              } catch {}
            }
          }
        });
      }
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience } });
      setUploading(false);
      next();
      return;
      } catch (err) {
      setUploading(false);
      next();
      return;
      }
    setUploading(false);
  };

  const saveAndAuth = async (planType) => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_onboarding_questions_pending', 'true');
      // Clear resume screen tracker — onboarding is now complete
      localStorage.removeItem('cff_onboarding_screen');
      if (college) localStorage.setItem('cff_college', college);
      if (seeking) localStorage.setItem('cff_seeking', seeking);
      if (blockers.length) localStorage.setItem('cff_blockers', JSON.stringify(blockers));
      if (selectedIndustries.length) localStorage.setItem('cff_industries', JSON.stringify(selectedIndustries));
      if (targetRoles.length) localStorage.setItem('cff_target_roles', JSON.stringify(targetRoles));
      if (frustration) localStorage.setItem('cff_frustration', String(frustration));
      if (resumeUrl) localStorage.setItem('cff_resume_url', resumeUrl);
      const loc = locationPref === 'remote' ? 'remote' : locationCity;
      if (loc) localStorage.setItem('cff_location', loc);
      if (planType === 'free') localStorage.setItem('cff_plan_type', 'free');
      if (blockers.includes('no_direction')) localStorage.setItem('cff_career_unsure', 'true');
      
      // CRITICAL: Update user profile with persona if already authenticated
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          await base44.auth.updateMe({
            persona: 'student',
            roles: ['student'],
            onboarding_completed: true,
            school: college || '',
            school_code: college ? college.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 10) : '',
          });
        }
      } catch (updateErr) {
        console.warn('Failed to update user persona during onboarding:', updateErr);
      }
    } catch (e) {}
    // In postAuth mode or if user is already authenticated, complete directly
    if (postAuth || onAlreadyAuthed) {
      if (planType === 'free') {
        // Route to free tier dashboard
        window.location.hash = '#FreeTierDashboard';
      } else {
        if (onAlreadyAuthed) onAlreadyAuthed();
        else if (onClose) onClose();
      }
    } else {
      const redirectPath = planType === 'free' ? '/#FreeTierDashboard' : '/#GatorAuth';
      base44.auth.loginWithProvider('google', window.location.origin + redirectPath);
    }
  };

  const isFullPageScreen = screen >= 10;
  const rawName = resumeData?.original?.name;
  const firstName = (typeof rawName === 'string' ? rawName : null)?.split(' ')[0] || null;

  const shell = {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: BG,
    opacity: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: isFullPageScreen ? '60px 24px 60px' : '100px 24px 60px',
    fontFamily: FONT,
    overflowY: 'auto',
    overflowX: 'hidden',
    isolation: 'isolate',
  };

  // Card wrapper for screens 1–8
  const card = { textAlign: 'center', maxWidth: 560, width: '100%' };

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

      {/* Welcome back banner intentionally removed */}

      {/* ── Analyzing Loader (postAuth only) ── */}
      {analyzing && (
        <div style={{ textAlign: 'center', maxWidth: 520, width: '100%', animation: 'fadeUp 0.3s ease' }}>
          <LiveEngineLoader />
        </div>
      )}



      {/* ── Progress Bar (screens 1–8, or postAuth steps) ── */}
      {!analyzing && screen < 10 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E2E8F0' }}>
            <div style={{ height: '100%', width: `${(screen / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: FONT, fontSize: 12, color: TEXT3, fontWeight: 600 }}>
            {screen} / {TOTAL}
          </div>
        </>
      )}

      {/* ── Screen Transition Wrapper ── */}
      {!analyzing && <FunnelTransition screenKey={screen}>

      {/* ── SCREEN 1: Welcome ── */}
      {screen === 1 && (
        <div style={{ ...card, position: 'relative', overflow: 'visible', minHeight: 400 }}>
          {/* Teaser background ghost cards */}
          <div style={{ position: 'absolute', left: '-18%', top: '8%', width: 160, height: 100, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', opacity: 0.07, transform: 'rotate(-6deg)', pointerEvents: 'none', padding: '10px 14px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: 8, background: '#0066FF', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: '90%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '75%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '80%', height: 5, background: '#CBD5E1', borderRadius: 3 }} />
          </div>
          <div style={{ position: 'absolute', right: '-15%', top: '20%', width: 150, height: 90, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', opacity: 0.07, transform: 'rotate(5deg)', pointerEvents: 'none', padding: '10px 14px', overflow: 'hidden' }}>
            <div style={{ width: '50%', height: 8, background: '#10B981', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: '85%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '70%', height: 5, background: '#CBD5E1', borderRadius: 3 }} />
          </div>

          <style>{`
            @keyframes boltPop {
              0%   { transform: scale(0.5) rotate(-15deg); opacity: 0; }
              60%  { transform: scale(1.3) rotate(8deg);  opacity: 1; }
              80%  { transform: scale(0.92) rotate(-4deg); }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes boltGlow {
              0%, 100% { text-shadow: 0 0 0px rgba(0,102,255,0); }
              50%       { text-shadow: 0 0 12px rgba(0,102,255,0.5); }
            }
          `}</style>

          {/* Badge pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ fontSize: 14, display: 'inline-block', animation: 'boltPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both, boltGlow 2s ease-in-out 0.8s infinite' }}>⚡</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Career Agent</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: FONT, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 16px', fontSize: 'clamp(30px, 5.5vw, 48px)', color: TEXT }}>
            Welcome to{' '}
            <span style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0F172A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>College Fast Forward.</span>
          </h1>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#334155', lineHeight: 1.6, margin: '0 auto 14px', maxWidth: 480, fontWeight: 600 }}>
            Your AI Career Agent is here to end the endless application black hole.
          </p>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 15px)', color: TEXT2, lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 460 }}>
            Most students are stuck spamming 100+ apps with almost no responses.{' '}
            <strong style={{ color: TEXT }}>We're different</strong> — we learn who you are, then use AI + real campus insiders to get you interviews fast.
          </p>

          {/* CTA button with glow */}
          <button
            onClick={next}
            style={{ display: 'block', margin: '0 auto 12px', fontFamily: FONT, fontSize: 17, fontWeight: 800, color: '#fff', background: `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 12, padding: '19px 52px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 24px rgba(0,102,255,0.28)', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,102,255,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,102,255,0.28)'; }}
          >Let's Build Your Interview Edge →</button>

          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, marginBottom: 4 }}>
            This guided setup takes 8–12 minutes and is worth it — you'll have your first personalized plan by the end.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: BLUE, fontWeight: 700, margin: '0 0 28px' }}>✨ Your first warm intro or interview is closer than you think.</p>

          {/* Social proof trust bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
              ].map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', marginLeft: i === 0 ? 0 : -8, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }} onError={e => { e.target.style.display = 'none'; }} />
              ))}
            </div>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
              Join <strong style={{ color: TEXT }}>2,400+ students</strong> from top campuses who stopped guessing and started landing opportunities.
            </p>
          </div>
        </div>
      )}

      {/* ── SCREEN 2: Built by Experts ── */}
      {screen === 2 && (
        <Screen2Experts
          FONT={FONT} CARD={CARD} R={R} SHADOW={SHADOW} SHADOW_MD={SHADOW_MD}
          BLUE={BLUE} BLUE_LIGHT={BLUE_LIGHT} BLUE_BORDER={BLUE_BORDER}
          GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} GREEN_BORDER={GREEN_BORDER}
          TEXT={TEXT} TEXT2={TEXT2} TEXT3={TEXT3}
          h1style={h1style} substyle={substyle}
          hoveredExpert={hoveredExpert} setHoveredExpert={setHoveredExpert}
          selectedExpert={selectedExpert} setSelectedExpert={setSelectedExpert}
          blockers={blockers}
          onBack={back} onNext={next}
        />
      )}

      {/* ── SCREEN 3: Frustration Slider ── */}
      {screen === 3 && (() => {
        const frustEmoji = frustration <= 2 ? '😌' : frustration <= 4 ? '😐' : frustration <= 6 ? '😟' : frustration <= 8 ? '😰' : '🆘';
        const frustColor = frustration <= 3 ? GREEN : frustration <= 6 ? '#F59E0B' : '#EF4444';
        const glowColor = frustration <= 3 ? 'rgba(16,185,129,0.08)' : frustration <= 6 ? 'rgba(245,158,11,0.09)' : 'rgba(239,68,68,0.11)';
        const microCopy = frustration <= 3
          ? `You're at a ${frustration}/10 — staying calm. Smart move. We'll keep that momentum going and get you ahead of the curve before things heat up.`
          : frustration <= 5
          ? `You're at a ${frustration}/10 — feeling the pressure but still in control. Most students hit their breakthrough right at this stage. Your Agent is ready to tip the scales.`
          : frustration <= 7
          ? `You're at a ${frustration}/10 — right in the danger zone. Most students feel exactly like you do before they start seeing real traction. The good news? This is where your Career Agent starts turning things around.`
          : frustration <= 9
          ? `You're at a ${frustration}/10 — we hear you. The black hole is real, and it's exhausting. But students at this exact level see the biggest gains fastest once the Agent kicks in. Let's go.`
          : `You're at 10/10 — at breaking point. Let's fix this fast. Your Agent is built exactly for this moment.`;
        const handleContinue = () => {
          setAnalyzingFrustration(true);
          setTimeout(() => { setAnalyzingFrustration(false); next(); }, 700);
        };
        const analyzing = analyzingFrustration;
        const pct = ((frustration - 1) / 9) * 100;
        return (
          <div style={{ ...card, maxWidth: 520, paddingTop: 40 }}>
            <h1 style={{ ...h1style, marginBottom: 10 }}>How frustrated are you with your job search right now?</h1>
            <p style={{ ...substyle, marginBottom: 32 }}>Be honest — the more accurately you answer, the better your Agent can build a strategy around your exact roadblocks.</p>

            <div style={{ background: CARD, border: `1.5px solid ${frustColor}33`, borderRadius: R, padding: '32px 28px 28px', marginBottom: 12, boxShadow: `0 0 40px ${glowColor}, ${SHADOW}`, transition: 'box-shadow 0.4s ease, border-color 0.4s ease' }}>
              {/* Emoji indicator */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 40, lineHeight: 1, transition: 'all 0.2s ease', display: 'inline-block' }}>{frustEmoji}</span>
              </div>

              {/* Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, fontWeight: 600 }}>Not at all</span>
                <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, fontWeight: 600 }}>I'm losing my mind</span>
              </div>

              {/* Custom styled slider */}
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <style>{`
                  .frustration-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 100px; outline: none; cursor: pointer; background: linear-gradient(to right, ${frustColor} 0%, ${frustColor} ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%); transition: background 0.15s ease; }
                  .frustration-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.16); cursor: grab; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
                  .frustration-slider::-webkit-slider-thumb:active { cursor: grabbing; box-shadow: 0 4px 16px rgba(0,0,0,0.22); }
                  .frustration-slider::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.16); cursor: grab; }
                `}</style>
                <input
                  type="range" min="1" max="10" value={frustration}
                  onChange={e => setFrustration(Number(e.target.value))}
                  className="frustration-slider"
                />
              </div>

              {/* Score display */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <span style={{ fontFamily: FONT, fontSize: 64, fontWeight: 800, color: frustColor, lineHeight: 1, letterSpacing: '-0.04em', transition: 'color 0.3s ease' }}>{frustration}</span>
                <span style={{ fontFamily: FONT, fontSize: 18, color: TEXT3, marginLeft: 6 }}>/10</span>
                <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, marginTop: 14, lineHeight: 1.6, minHeight: 44, transition: 'all 0.2s ease' }}>
                  {microCopy}
                </p>
              </div>
            </div>

            {/* Emotional closer */}
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '16px 0 0', lineHeight: 1.65, fontStyle: 'italic', textAlign: 'center' }}>
              Every day you stay stuck in this loop is another day without interviews. Let's change that starting now.
            </p>

            {/* Continue CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 20 }}>
              <button
                onClick={handleContinue}
                disabled={analyzing}
                style={{ width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: analyzing ? '#4A7FE8' : `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 10, padding: '16px 32px', cursor: analyzing ? 'default' : 'pointer', minHeight: 'auto', boxShadow: '0 10px 20px rgba(0,102,255,0.2)', transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => { if (!analyzing) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 28px rgba(0,102,255,0.32)'; }}}
                onMouseLeave={e => { if (!analyzing) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,102,255,0.2)'; }}}
              >
                {analyzing ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    Agent analyzing your frustration level…
                  </>
                ) : 'Continue →'}
              </button>
              <button onClick={back} style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 8px', textDecoration: 'underline', textUnderlineOffset: 3 }}>← Back</button>
            </div>
          </div>
        );
      })()}

      {/* ── SCREEN 4: What Are You Looking For ── */}
      {screen === 4 && (
        <div style={{ ...card, maxWidth: 520 }}>
          {/* Agent framing badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F0FDF4', border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11 }}>🎯</span>
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Setting your career coordinates</span>
          </div>

          <h1 style={h1style}>What's your main focus right now?</h1>
          <p style={{ ...substyle, marginBottom: 28 }}>This is the first key coordinate your Career Agent needs to lock in so it can prioritize the right opportunities, insiders, and tailored materials for you.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4, textAlign: 'left' }}>
            {SEEKING_OPTIONS.map(opt => {
              const isActive = seeking === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSeeking(opt.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                    background: isActive ? BLUE_LIGHT : CARD,
                    border: `2px solid ${isActive ? BLUE : '#E8EFF6'}`,
                    borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                    textAlign: 'left', minHeight: 'auto',
                    boxShadow: isActive
                      ? `0 0 0 3px ${BLUE_BORDER}, 0 10px 24px rgba(0,102,255,0.10)`
                      : '0 4px 12px rgba(0,0,0,0.05)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = BLUE_BORDER; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E8EFF6'; } }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isActive ? BLUE_BORDER : '#E2E8F0'}` }}>{opt.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isActive ? BLUE : TEXT, margin: '0 0 2px' }}>{opt.label}</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: isActive ? '#3B82F6' : TEXT2, margin: '0 0 2px' }}>{opt.sub}</p>
                    {isActive && (
                      <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>
                        → {opt.hint}
                      </p>
                    )}
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isActive ? BLUE : '#CBD5E1'}`, background: isActive ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, transition: 'all 0.18s ease' }}>
                    {isActive && '✓'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant mirroring after selection */}
          {seeking && (() => {
            const selected = SEEKING_OPTIONS.find(o => o.key === seeking);
            const mirrorMap = {
              internship: 'short-term roles and return-offer internships',
              fulltime: 'full-time pipelines and long-term networking',
              both: 'a flexible dual-track of internships and full-time roles',
              exploring: 'options that help you discover the best fit first',
            };
            return (
              <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '14px 18px', marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.25s ease' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.6 }}>
                  <strong>Got it — you're mainly targeting {selected?.label}.</strong><br />
                  Your Agent is now prioritizing <em>{mirrorMap[seeking]}</em> and will surface matching alumni insiders + resume tweaks tailored to that goal.
                </p>
              </div>
            );
          })()}

          <Nav onBack={back} onNext={next} nextDisabled={!seeking} />
        </div>
      )}

      {/* ── SCREEN 5: Industry & Role Picker ── */}
      {screen === 5 && (
        <IndustryScreen
          selectedIndustries={selectedIndustries}
          setSelectedIndustries={setSelectedIndustries}
          targetRoles={targetRoles}
          setTargetRoles={setTargetRoles}
          onBack={back}
          onNext={next}
        />
      )}

      {/* ── SCREEN 6: What's Holding You Back ── */}
      {screen === 6 && (() => {
        const activeBlocker = BLOCKERS.find(b => blockers[blockers.length - 1] === b.key);
        const dynamicHint = activeBlocker ? `✦ We'll unlock your ${activeBlocker.tool} based on this.` : null;
        const [limitToast, setLimitToast] = [false, () => {}]; // placeholder to avoid useState inside IIFE

        const handleBlockerClick = (key) => {
          const active = blockers.includes(key);
          if (!active && blockers.length >= 2) {
            // show toast by setting a temp DOM message
            const el = document.getElementById('blocker-limit-toast');
            if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 2200); }
            return;
          }
          toggleBlocker(key);
        };

        return (
          <div style={{ ...card, maxWidth: 540 }}>
            {/* Limit toast */}
            <div id="blocker-limit-toast" style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', color: '#fff', fontFamily: FONT, fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 20000, opacity: 0, transition: 'opacity 0.25s ease, transform 0.25s ease', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              Focusing on your top 2 priorities ensures the fastest results.
            </div>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 11 }}>🩺</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EA580C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Career Diagnostic</span>
            </div>

            <h1 style={h1style}>What's the biggest thing holding you back right now?</h1>
            <p style={{ ...substyle, marginBottom: 20 }}>Select up to 2. Be honest — <strong style={{ color: TEXT }}>CLiFF</strong> will instantly unlock the exact tools to crush these roadblocks.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
              {BLOCKERS.map(opt => {
                const active = blockers.includes(opt.key);
                const maxed = blockers.length >= 2 && !active;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleBlockerClick(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      background: active ? GREEN_LIGHT : CARD,
                      border: `2px solid ${active ? GREEN : maxed ? '#F1F5F9' : '#E2E8F0'}`,
                      borderRadius: 14, padding: '16px 18px', cursor: maxed ? 'default' : 'pointer',
                      textAlign: 'left', minHeight: 'auto',
                      boxShadow: active
                        ? `0 0 0 3px ${GREEN_BORDER}, 0 8px 20px rgba(16,185,129,0.12)`
                        : maxed ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                      opacity: maxed ? 0.45 : 1,
                      transform: active ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if (!active && !maxed) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    onMouseLeave={e => { if (!active && !maxed) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                  >
                    {/* Icon box */}
                    <span style={{
                      fontSize: 20, flexShrink: 0, width: 42, height: 42,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? 'rgba(16,185,129,0.12)' : BG,
                      borderRadius: 10, border: `1px solid ${active ? GREEN_BORDER : '#E2E8F0'}`,
                      filter: maxed ? 'grayscale(1)' : 'none',
                      transition: 'all 0.18s',
                    }}>{opt.icon}</span>

                    {/* Text block */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? '#065F46' : TEXT, margin: '0 0 3px' }}>{opt.label}</p>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: active ? '#059669' : TEXT3, margin: 0, fontStyle: 'italic' }}>{opt.solution}</p>
                    </div>

                    {/* Animated checkmark circle */}
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? GREEN : '#CBD5E1'}`,
                      background: active ? GREEN : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 800,
                      transition: 'all 0.18s ease',
                      boxShadow: active ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
                    }}>
                      {active && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant mirroring unlock panel */}
            {blockers.length > 0 && (
              <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 20, animation: 'fadeUp 0.25s ease' }}>
                <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#065F46', margin: '0 0 6px' }}>Got it.</p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: '0 0 12px', lineHeight: 1.6 }}>
                  You're dealing with{' '}
                  {blockers.map((key, idx) => {
                    const b = BLOCKERS.find(x => x.key === key);
                    return <span key={key}>{idx > 0 ? ' and ' : ''}<strong>"{b?.label}"</strong></span>;
                  })}.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                  CLiFF is already unlocking:
                </p>
                {blockers.map(key => {
                  const b = BLOCKERS.find(x => x.key === key);
                  if (!b) return null;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, flexShrink: 0 }}>{b.icon}</span>
                      <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.5 }}>
                        <strong>{b.tool}</strong>
                        <span style={{ display: 'inline-block', marginLeft: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, color: GREEN, background: '#fff', border: `1px solid ${GREEN_BORDER}`, borderRadius: 6, padding: '2px 8px' }}>✓ Unlocked</span>
                      </p>
                    </div>
                  );
                })}
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: '10px 0 0', lineHeight: 1.6, fontWeight: 600 }}>
                  You're now ahead of most students who never diagnose their biggest leaks. Let's fix this.
                </p>
              </div>
            )}

            {/* Continue button */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <Btn primary={false} onClick={back} small>← Back</Btn>
              <button
                onClick={next}
                disabled={blockers.length === 0}
                style={{
                  fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
                  background: blockers.length === 0 ? '#CBD5E1' : `linear-gradient(to bottom, ${BLUE}, #0052CC)`,
                  border: 'none', borderRadius: 8, padding: '15px 36px',
                  cursor: blockers.length === 0 ? 'not-allowed' : 'pointer',
                  minHeight: 'auto',
                  boxShadow: blockers.length === 0 ? 'none' : '0 4px 14px rgba(0,102,255,0.30)',
                  transition: 'all 0.25s ease',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { if (blockers.length > 0) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.40)'; }}}
                onMouseLeave={e => { if (blockers.length > 0) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,102,255,0.30)'; }}}
              >
                {blockers.length === 0 ? 'Select at least 1 →' : <>Continue → <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>Tools unlocked ✓</span></>}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── SCREEN 7: School (Alumni Advantage) ── */}
      {screen === 7 && (
        <Screen6School
          college={college}
          onCollegeChange={setCollege}
          onBack={back}
          onNext={() => {
            fireReferralMilestone(college);
            next();
          }}
          nextLabel="Continue →"
        />
      )}

      {/* ── SCREEN 8: Work Location ── */}
      {screen === 8 && (() => {
        const TOP_CITIES = ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX', 'Boston, MA', 'Seattle, WA', 'Washington, DC', 'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Denver, CO', 'Philadelphia, PA', 'Houston, TX', 'Charlotte, NC', 'Nashville, TN', 'Minneapolis, MN', 'Portland, OR', 'San Diego, CA', 'Phoenix, AZ'];
        const citySuggestions = !citySuggestionsClosed && locationCity.length >= 2 ? TOP_CITIES.filter(c => c.toLowerCase().includes(locationCity.toLowerCase())).slice(0, 6) : [];
        const isRemote = locationPref === 'remote';
        const isHybrid = locationPref === 'hybrid';
        const hasCity = locationPref === 'city' && locationCity.trim().length > 0;
        const isValid = isRemote || isHybrid || hasCity;

        // Mirroring copy per selection
        const mirrorLabel = isRemote ? 'Remote' : isHybrid ? 'Hybrid / Flexible' : locationCity || 'your target city';
        const mirrorDetails = isRemote
          ? ['Remote-first companies + distributed alumni networks', 'Async-friendly roles and distributed teams', 'Resume adjustments for remote-friendly positioning']
          : isHybrid
          ? ['Mix of remote and in-office opportunities', 'Alumni in flexible companies and hybrid-friendly roles', 'Roadmap tuned for flexible work arrangements']
          : [`Local alumni & parents near ${locationCity || 'your city'}`, `Companies actively hiring in that market`, `Events and networking opportunities in that area`];

        return (
          <div style={{ ...card, maxWidth: 500 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 24px', boxShadow: SHADOW }}>📍</div>
            <h1 style={h1style}>Where are you aiming to work?</h1>
            <p style={{ ...substyle, marginBottom: 28 }}>
              This helps your Agent prioritize opportunities and connections in the exact places you want to be — whether that's fully remote, a dream city, or hybrid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 4 }}>
              {/* Remote */}
              <button
                onClick={() => setLocationPref('remote')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: isRemote ? BLUE_LIGHT : CARD,
                  border: `2px solid ${isRemote ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: isRemote ? `0 0 0 3px ${BLUE_BORDER}, 0 10px 24px rgba(0,102,255,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: isRemote ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!isRemote) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (!isRemote) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRemote ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isRemote ? BLUE_BORDER : '#E2E8F0'}` }}>🌐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isRemote ? BLUE : TEXT, margin: '0 0 2px' }}>Remote 🌐</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>Open to fully remote positions anywhere</p>
                  {isRemote && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will surface remote-first companies + distributed alumni networks</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isRemote ? BLUE : '#CBD5E1'}`, background: isRemote ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{isRemote && '✓'}</div>
              </button>

              {/* Specific city */}
              <button
                onClick={() => setLocationPref('city')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: locationPref === 'city' ? BLUE_LIGHT : CARD,
                  border: `2px solid ${locationPref === 'city' ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: locationPref === 'city' ? `0 0 0 3px ${BLUE_BORDER}, 0 10px 24px rgba(0,102,255,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: locationPref === 'city' ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (locationPref !== 'city') { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (locationPref !== 'city') { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: locationPref === 'city' ? '#fff' : BG, borderRadius: 10, border: `1px solid ${locationPref === 'city' ? BLUE_BORDER : '#E2E8F0'}` }}>🏙️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: locationPref === 'city' ? BLUE : TEXT, margin: '0 0 2px' }}>A specific city 🏙️</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>I have a target location in mind</p>
                  {locationPref === 'city' && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will focus on local alumni, companies, and events in that city</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${locationPref === 'city' ? BLUE : '#CBD5E1'}`, background: locationPref === 'city' ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{locationPref === 'city' && '✓'}</div>
              </button>

              {/* Hybrid */}
              <button
                onClick={() => setLocationPref('hybrid')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: isHybrid ? BLUE_LIGHT : CARD,
                  border: `2px solid ${isHybrid ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: isHybrid ? `0 0 0 3px ${BLUE_BORDER}, 0 10px 24px rgba(0,102,255,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: isHybrid ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!isHybrid) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (!isHybrid) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isHybrid ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isHybrid ? BLUE_BORDER : '#E2E8F0'}` }}>🔀</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isHybrid ? BLUE : TEXT, margin: '0 0 2px' }}>Hybrid / Flexible</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>Open to a mix — I want options</p>
                  {isHybrid && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will build a flexible pipeline across remote and in-person opportunities</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isHybrid ? BLUE : '#CBD5E1'}`, background: isHybrid ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{isHybrid && '✓'}</div>
              </button>
            </div>

            {/* City input */}
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

            {/* Instant mirroring panel */}
            {isValid && (
              <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 16, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#065F46', margin: '0 0 10px' }}>
                  Got it — you're targeting <strong>{mirrorLabel}</strong>.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Your Agent is now:</p>
                {mirrorDetails.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: GREEN, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0 }}>{item}</p>
                  </div>
                ))}
                <p style={{ fontFamily: FONT, fontSize: 12, color: '#059669', margin: '10px 0 0', fontStyle: 'italic', fontWeight: 600 }}>
                  You're one step closer to opportunities that actually fit your life. 🎯
                </p>
              </div>
            )}

            <Nav onBack={back} onNext={next} nextDisabled={!isValid} />
          </div>
        );
      })()}

      {/* ── SCREEN 9: Data Input ── */}
      {screen === 9 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

          {uploading && <LiveEngineLoader college={college} selectedIndustries={selectedIndustries} seeking={seeking} onSkip={() => { setUploading(false); next(); }} />}

          {!uploading && dataInputMode === 'choose' && (
            <>
              <h1 style={h1style}>Let's build your standout profile</h1>
              <p style={{ ...substyle, marginBottom: 28 }}>The more your Agent knows about you, the better it can match you with alumni insiders, tailor your materials, and uncover opportunities that actually fit.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                {/* Upload Resume */}
                <button onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, background: GREEN_LIGHT, border: `2px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: `0 4px 12px rgba(16,185,129,0.10)` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px rgba(16,185,129,0.18)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = GREEN_BORDER; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(16,185,129,0.10)`; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, border: `1px solid ${GREEN_BORDER}` }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>Upload Resume</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 5px' }}>PDF or Word — get a full Before/After transformation in seconds</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: '#059669', margin: 0, fontStyle: 'italic' }}>Agent rewrites bullet points, adds ATS keywords + aligns with your target roles</p>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: '#fff', background: GREEN, borderRadius: 6, padding: '3px 9px', flexShrink: 0, marginTop: 2 }}>BEST</span>
                </button>

                {/* LinkedIn */}
                <button onClick={() => setDataInputMode('linkedin')}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, background: BLUE_LIGHT, border: `2px solid ${BLUE_BORDER}`, borderRadius: 14, padding: '18px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: `0 4px 12px rgba(0,102,255,0.08)` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,102,255,0.14)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,102,255,0.08)`; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, border: `1px solid ${BLUE_BORDER}` }}>💼</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>Paste LinkedIn URL</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 5px' }}>No PDF? The Agent instantly extracts your experience, skills, and story.</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic' }}>Fast, clean, and no uploading needed</p>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: '#fff', background: BLUE, borderRadius: 6, padding: '3px 9px', flexShrink: 0, marginTop: 2 }}>FAST</span>
                </button>

                {/* Quick Start */}
                <button onClick={() => setDataInputMode('quickstart')}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, background: CARD, border: `2px solid #E2E8F0`, borderRadius: 14, padding: '18px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s', boxShadow: SHADOW }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = SHADOW_MD; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A' }}>⚡</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>Quick Start (3 questions)</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 5px' }}>No resume or LinkedIn? Answer 3 quick questions and we'll build a strong starter profile for you.</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: '#D97706', margin: 0, fontStyle: 'italic' }}>Takes under 2 minutes</p>
                  </div>
                </button>
              </div>

              {/* Teaser: what you'll get */}
              <div style={{ background: BG, border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', marginTop: 20 }}>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>What you'll get right after:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { icon: '✨', text: 'AI-optimized resume version' },
                    { icon: '💬', text: 'Personalized outreach templates' },
                    { icon: '🔍', text: "Insider match preview based on everything you've shared so far" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, textAlign: 'center', margin: '16px 0 0', lineHeight: 1.6, fontStyle: 'italic' }}>
                Choose the fastest way for you — most students see their first "wow" moment within 60 seconds.
              </p>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
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
                  next();
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
                  next();
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

      {/* ── SCREEN 10: Wow Moment (Resume Before/After) ── */}
      {screen === 10 && (
      <div style={{ maxWidth: 900, width: '100%', paddingTop: 80, minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
          {firstName
            ? <>{firstName}, your resume just <span style={{ color: '#10B981' }}>leveled up.</span></>
            : dataInputMode === 'quickstart' ? 'Your Starter Profile Is Ready' : <>Your resume just <span style={{ color: '#10B981' }}>leveled up.</span></>}
        </h1>
        {/* Personal note — mirrors back their inputs */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 14 }}>
          <span style={{ fontSize: 12 }}>🤖</span>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#059669' }}>
            Customized for your{selectedIndustries.length > 0 ? ` ${selectedIndustries.slice(0,2).join(' & ')}` : ''}{blockers.includes('resume') || blockers.includes('ghosted') ? ' · optimized to beat ATS rejection' : ' target roles'}
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 auto', maxWidth: 560, lineHeight: 1.7 }}>
          {dataInputMode === 'quickstart'
            ? 'The Agent built your starter profile and showed what stronger positioning looks like.'
            : <>Based on your {selectedIndustries.length > 0 ? <strong style={{ color: TEXT }}>{selectedIndustries.slice(0,2).join(' & ')}</strong> : 'target'} goals{blockers.length > 0 ? <> and the <strong style={{ color: TEXT }}>{blockers.length === 2 ? '2 roadblocks' : 'roadblock'}</strong> you flagged</> : ''}, the Agent rewrote your bullets, modernized the layout, and made it ATS-ready while keeping your authentic story.</>}
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

          {/* Agent Feedback Card — 2-col layout */}
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px 28px', marginBottom: 24, border: `1px solid ${GREEN_BORDER}` }}>
            <h3 style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✓ Agent Feedback
            </h3>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Left: checklist (65%) */}
              <div style={{ flex: '0 0 calc(65% - 14px)', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Strengthened bullet points to focus on results and impact (recruiters love this)',
                  'Improved formatting and visual hierarchy for a modern, professional look',
                  'Made it ATS-friendly while keeping it visually standout',
                  <span key="score">Score improved from <span style={{ textDecoration: 'line-through', color: '#EF4444', margin: '0 4px' }}>59/100</span> → <span style={{ fontWeight: 700, color: GREEN, marginLeft: 4 }}>98/100</span></span>,
                  'Now optimized to beat the 75% auto-rejection rate most students face',
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
                    <span style={{ color: GREEN, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              {/* Right: ATS Score Ring (35%) */}
              <div style={{ flex: '0 0 35%', minWidth: 160, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ATSScoreRing />
              </div>
            </div>
          </div>

          {/* Emotional Payoff Section */}
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)', border: `1px solid ${BLUE_BORDER}`, borderRadius: R, padding: '22px 28px', marginBottom: 28 }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>🎯 What this actually means for you</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🧑‍💼', text: 'Your applications will finally reach human recruiters instead of getting auto-filtered' },
                { icon: '🏆', text: "You're now in the top 2% of candidates for your target roles" },
                { icon: '🤝', text: 'Alumni & parents will see a polished, confident version of you' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontFamily: FONT, fontSize: 14, color: '#1E3A5F', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button
              onClick={next}
              style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto 12px', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff', background: `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 10, padding: '20px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(0,102,255,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,102,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,102,255,0.3)'; }}
            >
              Next: Optimize My LinkedIn Profile →
            </button>
            <button
              onClick={() => saveAndAuth('free')}
              style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT2, background: CARD, border: `1.5px solid #E2E8F0`, borderRadius: 10, padding: '14px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: SHADOW, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = SHADOW_MD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = SHADOW; }}
            >
              Save This Version &amp; Continue Onboarding
            </button>
          </div>

          {/* Micro-copy */}
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, textAlign: 'center', margin: '0 0 16px', lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', fontStyle: 'italic' }}>
            You've now completed the hardest part most students never do. Your Agent is building the rest of your sprint plan with this stronger foundation.
          </p>

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

      {/* ── SCREEN 11: LinkedIn Identity Architect ── */}
      {screen === 11 && (
        <LinkedInScreen
          resumeData={resumeData}
          college={college}
          seeking={seeking}
          targetRole={resumeData?.targetRole || quickRole || targetRoles[0]}
          selectedIndustries={selectedIndustries}
          onBack={back}
          saveAndAuth={saveAndAuth}
          onNext={next}
        />
      )}

      {/* ── SCREEN 12: Your 14-Day Plan ── */}
      {screen === 12 && (
        <PlanScreen
          resumeData={resumeData}
          college={college}
          seeking={seeking}
          blockers={blockers}
          frustration={frustration}
          locationPref={locationPref}
          locationCity={locationCity}
          quickRole={quickRole || targetRoles[0]}
          selectedIndustries={selectedIndustries}
          targetRoles={targetRoles}
          onBack={back}
          saveAndAuth={saveAndAuth}
        />
      )}

      </FunnelTransition>}
    </div>
  );
}