import { useState } from 'react';

// ── Design Tokens — Purple/Indigo (match landing pages) ──────────────────────────────────────────────
export const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
export const BG = '#f8f9ff';
export const CARD = '#ffffff';
export const TEXT = '#0f172a';
export const TEXT2 = '#475569';
export const TEXT3 = '#94a3b8';
export const INDIGO = '#6d28d9';
export const INDIGO_DIM = '#5b21b6';
export const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
export const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
export const VIOLET = '#7c3aed';
export const VIOLET_LIGHT = 'rgba(124,58,237,0.08)';
export const VIOLET_BORDER = 'rgba(124,58,237,0.20)';
export const PINK = '#ec4899';
export const PINK_LIGHT = 'rgba(236,72,153,0.08)';
export const PINK_BORDER = 'rgba(236,72,153,0.22)';
export const TEAL = '#06b6d4';
export const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
export const TEAL_BORDER = 'rgba(6,182,212,0.22)';
export const TEAL_DARK = '#0891b2';
export const CORAL = '#f43f5e';
export const CORAL_LIGHT = 'rgba(244,63,94,0.07)';
export const CORAL_BORDER = 'rgba(244,63,94,0.22)';
export const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
export const GRAD_WARM = 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)';
export const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
export const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
export const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';
export const R = 16;
// Aliases for backward compat
export const BLUE = INDIGO;
export const BLUE_LIGHT = INDIGO_LIGHT;
export const BLUE_BORDER = INDIGO_BORDER;
export const GREEN = TEAL;
export const GREEN_LIGHT = TEAL_LIGHT;
export const GREEN_BORDER = TEAL_BORDER;

// ── Target field chips — single source of truth for ALL onboarding flows ──
// If you change these, all three onboarding components update automatically.
export const TARGET_FIELD_CHIPS = [
  'Sales/Business Development',
  'Marketing',
  'Finance/Accounting',
  'Operations',
  'Engineering',
  'Education/Non-profit',
  'Healthcare',
  'Legal',
];
export const OTHER_CHIP = 'Other';
export const OPEN_CHIP = "I'm open";
export const ONBOARDING_TARGET_CHIPS = [...TARGET_FIELD_CHIPS, OTHER_CHIP, OPEN_CHIP];

export const TOP_SCHOOLS = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Southern California', 'Penn State University', 'University of Michigan',
  'Ohio State University', 'University of Georgia', 'University of Maryland',
  'Tulane University', 'University of Delaware', 'Florida International University',
  'New York University', 'Boston University', 'Georgetown University',
  'University of Texas at Austin', 'UCLA', 'UC Berkeley', 'Indiana University',
  'Purdue University', 'Arizona State University', 'University of Wisconsin',
  'University of Illinois', 'Northeastern University', 'Temple University',
];

export const SEEKING_OPTIONS = [
  { key: 'internship', emoji: '🎓', label: 'Internship', sub: 'This semester or summer' },
  { key: 'fulltime', emoji: '💼', label: 'Full-time job', sub: 'Ready to launch my career' },
  { key: 'exploring', emoji: '🔭', label: 'Still exploring', sub: "Not sure yet — that's okay" },
];

export const BLOCKERS = [
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

// Single-select "If CLIFF could solve ONE thing today…" options.
// Keys intentionally reuse legacy BLOCKERS keys so downstream logic keeps working.
export const CLIFF_SOLVE = [
  { key: 'which_jobs', icon: '🔍', label: 'Finding the right jobs', sub: "I'll scout and rank the roles actually worth your time — daily." },
  { key: 'resume', icon: '📄', label: 'Improving my resume', sub: "I'll rewrite it to beat ATS filters and reach real recruiters." },
  { key: 'interviews', icon: '🎤', label: 'Getting interviews', sub: "I'll prepare every application so more of them convert." },
  { key: 'outreach', icon: '🤝', label: 'Networking', sub: "I'll surface parents & alumni insiders at your target companies." },
  { key: 'no_direction', icon: '🧭', label: 'Figuring out where to start', sub: "I'll help you discover the path that actually fits you." },
];

// ── Screen 2: Built by Experts (extracted to avoid conditional hooks) ───────
export const SCREEN2_EXPERTS = [
  { key: 'coach', avatar: 'https://media.base44.com/images/public/684474c5723dc90efce23588/fe0568933_image.png', name: 'Anna V.', role: 'ex-SAP, Global Early Talent', teaser: 'Built hiring pipelines at SAP. She knows exactly what recruiters look for in interns & new grads.', color: '#7C3AED', colorLight: '#F5F3FF', colorBorder: '#DDD6FE' },
  { key: 'recruiter', avatar: 'https://media.base44.com/images/public/684474c5723dc90efce23588/4dc2560b9_image.png', name: 'Jill O.', role: 'Ex-IPSY Recruiter + Certified Career Coach', teaser: "Spent years on the other side of the desk. She'll help you avoid the mistakes that get applications ghosted.", color: '#0066FF', colorLight: '#EFF6FF', colorBorder: '#BFDBFE' },
  { key: 'hm', avatar: 'https://media.base44.com/images/public/684474c5723dc90efce23588/ac28e9514_image.png', name: 'Suzanne R.', role: 'Career Development Coach', teaser: 'Specializes in helping students clarify their path and build unstoppable confidence in interviews.', color: '#10B981', colorLight: '#F0FDF4', colorBorder: '#BBF7D0' },
];
export const SCREEN2_LOGOS = ['Goldman Sachs', 'Google', 'Meta', 'McKinsey', 'Amazon'];

// Maps blocker key → expert key that should be highlighted
export const BLOCKER_TO_EXPERT = {
  resume: 'recruiter',   // Jill: ghosted applications / resume
  ghosted: 'recruiter',  // Jill: ghosted
  no_direction: 'hm',   // Sarah: career direction / confidence
  which_jobs: 'coach',  // Anna: what recruiters want
  outreach: 'coach',    // Anna: insider knowledge
  disorganized: 'hm',   // Sarah: clarity & confidence
  interviews: 'hm',     // Sarah: interview confidence
};

export function Screen2Experts({ FONT, CARD, R, SHADOW, SHADOW_MD, BLUE, BLUE_LIGHT, BLUE_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, TEXT, TEXT2, TEXT3, h1style, substyle, hoveredExpert, setHoveredExpert, selectedExpert, setSelectedExpert, onBack, onNext, blockers }) {
  const [pressedExpert, setPressedExpert] = useState(null);

  // Determine featured expert from blockers
  const featuredKey = blockers?.length > 0
    ? (BLOCKER_TO_EXPERT[blockers[0]] || null)
    : null;
  const NavInline = ({ onBack: b, onNext: n, nextLabel = 'Continue →', nextDisabled = false }) => (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
      {b && <button onClick={b} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>← Back</button>}
      <button onClick={n} disabled={nextDisabled} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: nextDisabled ? '#CBD5E1' : GRAD_INDIGO, border: 'none', borderRadius: 8, padding: '15px 36px', cursor: nextDisabled ? 'not-allowed' : 'pointer', minHeight: 'auto', boxShadow: nextDisabled ? 'none' : '0 4px 14px rgba(109,40,217,0.25)' }}>{nextLabel}</button>
    </div>
  );
  return (
    <div style={{ textAlign: 'center', maxWidth: 600, width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -60, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 20px' }}>Step 2 of 12 · Meet Your Team</p>
        <h1 style={{ ...h1style, fontSize: 'clamp(26px, 4.5vw, 42px)' }}>Your Career Agent is powered by real hiring experts.</h1>
        <p style={{ ...substyle, marginBottom: 8 }}>These are the people whose exact playbooks helped thousands of students break into competitive roles. Their strategies are now built into your personal Agent.</p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: INDIGO, fontWeight: 600, margin: '0 0 24px' }}>Tap any expert below to see how they'll help you stand out.</p>
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
export const Btn = ({ children, onClick, disabled, primary = true, small = false, loading = false, style: extra = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      fontFamily: FONT,
      fontSize: small ? 13 : 15,
      fontWeight: 700,
      color: primary ? '#fff' : TEXT2,
      background: primary
        ? (disabled || loading) ? '#CBD5E1' : GRAD_INDIGO
        : CARD,
      border: primary ? 'none' : `1px solid #E2E8F0`,
      borderRadius: 8,
      padding: small ? '10px 20px' : '15px 36px',
      cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      minHeight: 'auto',
      boxShadow: primary && !disabled && !loading ? '0 4px 14px rgba(109,40,217,0.25)' : SHADOW,
      transition: 'all 0.2s ease',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      ...extra,
    }}
    onMouseEnter={e => { if (!disabled && !loading && primary) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(109,40,217,0.35)'; } }}
    onMouseLeave={e => { if (!disabled && !loading && primary) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.25)'; } }}
  >
    {loading && (
      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
    )}
    {children}
  </button>
);

export const Nav = ({ onBack, onNext, nextLabel = 'Continue →', nextDisabled = false }) => (
  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
    {onBack && <Btn primary={false} onClick={onBack} small>← Back</Btn>}
    <Btn onClick={onNext} disabled={nextDisabled}>{nextLabel}</Btn>
  </div>
);

export const InputField = ({ label, placeholder, value, onChange, type = 'text', icon, autoFocus }) => (
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
export function saveProgress(screen, data = {}) {
  try {
    localStorage.setItem('cff_onboarding_screen', String(screen));
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        localStorage.setItem(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    });
  } catch (e) {}
}

export function loadSavedProgress() {
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
      workLocation: JSON.parse(localStorage.getItem('cff_work_location') || 'null'),
      resumeUrl: localStorage.getItem('cff_resume_url') || '',
      yearLevel: localStorage.getItem('cff_year') || '',
      goalText: localStorage.getItem('cff_goal_text') || '',
    };
  } catch (e) {
    return { screen: 1, seeking: '', college: '', frustration: 5, blockers: [], selectedIndustries: [], targetRoles: [], locationPref: '', locationCity: '', resumeUrl: '' };
  }
}