import { useState, useEffect, useRef } from 'react';

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

// Animated bar chart: cold (1x) vs alumni (10x)
function AlumniBarChart({ pulse }) {
  const [alumniHeight, setAlumniHeight] = useState(0);
  const [coldHeight, setColdHeight] = useState(0);
  const MAX = 160; // px for 10x bar — capped at 180px per mobile spec

  useEffect(() => {
    const t1 = setTimeout(() => setColdHeight(16), 150);   // 1x = 16px
    const t2 = setTimeout(() => setAlumniHeight(MAX), 300); // 10x = 160px
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="alumni-chart-wrap" style={{ background: CARD, borderRadius: 16, boxShadow: SHADOW_MD, padding: '28px 32px 24px', marginBottom: 28, border: '1px solid #E8EFF6' }}>
      <style>{`
        @media (max-width: 640px) {
          .alumni-chart-wrap { padding: 18px 16px 16px !important; }
          .alumni-bars-area { height: 180px !important; }
        }
      `}</style>
      {/* Chart title */}
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 24px', textAlign: 'center' }}>Response Rate Comparison</p>

      {/* Bars */}
      <div className="alumni-bars-area" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 40, height: MAX + 20, marginBottom: 16 }}>
        {/* Cold bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 52, height: coldHeight, background: '#E2E8F0', borderRadius: '6px 6px 0 0', transition: 'height 0.6s ease', position: 'relative' }}>
            {coldHeight > 0 && (
              <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3 }}>1%</span>
            )}
          </div>
        </div>

        {/* Alumni bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 72, height: alumniHeight,
            background: 'linear-gradient(to top, #059669, #0066FF)',
            borderRadius: '8px 8px 0 0',
            transition: 'height 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            position: 'relative',
            boxShadow: pulse
              ? '0 0 0 4px rgba(0,102,255,0.18), 0 8px 24px rgba(0,102,255,0.22)'
              : '0 4px 16px rgba(0,102,255,0.18)',
            animation: pulse ? 'alumniPulse 0.5s ease' : 'none',
          }}>
            {alumniHeight > 60 && (
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: FONT, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>10x</span>
            )}
            {alumniHeight > 0 && (
              <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE }}>10%</span>
            )}
          </div>
        </div>
      </div>

      {/* X-axis baseline */}
      <div style={{ borderTop: '2px solid #E2E8F0', marginBottom: 12 }} />

      {/* Labels — wrap naturally on mobile */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: TEXT3, margin: 0, textAlign: 'center', wordBreak: 'break-word', maxWidth: 80 }}>Cold<br />Connections</p>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, margin: 0, textAlign: 'center', wordBreak: 'break-word', maxWidth: 80 }}>Alumni<br />Connections</p>
      </div>

      <style>{`
        @keyframes alumniPulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,102,255,0.4); }
          50%  { box-shadow: 0 0 0 10px rgba(0,102,255,0.08); }
          100% { box-shadow: 0 0 0 4px rgba(0,102,255,0.18); }
        }
      `}</style>
    </div>
  );
}

export default function Screen6School({ college, onCollegeChange, onBack, onNext, nextLabel = 'Continue →' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [pulse, setPulse] = useState(false);
  const inputRef = useRef();

  const handleInput = (val) => {
    onCollegeChange(val);
    if (val.length < 2) { setSuggestions([]); return; }
    setSuggestions(TOP_SCHOOLS.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
  };

  const selectSchool = (s) => {
    onCollegeChange(s);
    setSuggestions([]);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  };

  const isValid = college.trim().length > 0;

  return (
    <div style={{ textAlign: 'center', maxWidth: 520, width: '100%', animation: 'fadeUp 0.4s ease', padding: '0 4px', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 640px) {
          .school-screen-inner { padding: 0 !important; }
        }
      `}</style>
      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
        <span style={{ fontSize: 11 }}>🏛️</span>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Alumni Advantage</span>
      </div>

      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
        Alumni from your school are<br /><span style={{ color: BLUE }}>10x more likely</span> to help you.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.65, margin: '0 auto 28px', maxWidth: 400 }}>
        We'll use this to surface warm connections when it matters most.
      </p>

      {/* Animated bar chart */}
      <AlumniBarChart pulse={pulse} />

      {/* Input */}
      <div style={{ position: 'relative', textAlign: 'left', marginBottom: 4 }}>
        <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>What college do you go to?</p>
        <div style={{ position: 'relative' }}>
          {/* Building icon */}
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none' }}>
            <path d="M3 18V6l7-4 7 4v12" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 18v-4h4v4" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 8h.01M13 8h.01M7 12h.01M13 12h.01" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="organization"
            autoCorrect="on"
            spellCheck={false}
            placeholder="e.g. University of Florida, Penn State..."
            value={college}
            onChange={e => handleInput(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              fontFamily: FONT, fontSize: 15, color: TEXT,
              background: CARD,
              border: `1.5px solid ${isValid ? BLUE_BORDER : '#E2E8F0'}`,
              borderRadius: R, padding: '14px 14px 14px 44px',
              outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: isValid ? `0 0 0 3px ${BLUE_BORDER}55` : SHADOW,
            }}
            onFocus={e => { e.target.style.borderColor = BLUE_BORDER; e.target.style.boxShadow = `0 0 0 3px ${BLUE_BORDER}55`; }}
            onBlur={e => { if (!isValid) { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = SHADOW; } }}
          />
        </div>

        {/* Dropdown */}
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: CARD, border: '1px solid #E2E8F0', borderRadius: R, overflow: 'hidden', zIndex: 20, boxShadow: SHADOW_MD }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => selectSchool(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent', border: 'none', borderBottom: '1px solid #F1F5F9', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = BLUE_LIGHT; e.currentTarget.style.color = BLUE; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT; }}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Selected confirmation */}
      {isValid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 8, padding: '8px 14px', marginTop: 12, animation: 'fadeUp 0.2s ease' }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <p style={{ fontFamily: FONT, fontSize: 12, color: '#059669', fontWeight: 600, margin: 0 }}>Alumni network unlocked for <strong>{college}</strong></p>
        </div>
      )}

      {/* Nav — full-width continue on mobile, inline on desktop */}
      <style>{`
        @media (max-width: 640px) {
          .school-nav-wrap { flex-direction: column-reverse !important; gap: 10px !important; }
          .school-nav-continue { width: 100% !important; padding: 16px 20px !important; min-height: 52px !important; }
        }
      `}</style>
      <div className="school-nav-wrap" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
        <button onClick={onBack} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT2, background: CARD, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 48, boxShadow: SHADOW }}>← Back</button>
        <button
          className="school-nav-continue"
          onClick={onNext}
          disabled={!isValid}
          style={{
            fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
            background: isValid ? `linear-gradient(to bottom, ${BLUE}, #0052CC)` : '#CBD5E1',
            border: 'none', borderRadius: 8, padding: '15px 36px',
            cursor: isValid ? 'pointer' : 'not-allowed', minHeight: 48,
            boxShadow: isValid ? '0 4px 14px rgba(0,102,255,0.30)' : 'none',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => { if (isValid) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.40)'; }}}
          onMouseLeave={e => { if (isValid) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,102,255,0.30)'; }}}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}