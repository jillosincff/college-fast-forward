import React, { useState, useEffect, useRef } from 'react';
import { getSchoolShort } from './V3HeroDemoData';

const dmSans = '"DM Sans", system-ui, sans-serif';

const DEFAULT_ACCENT = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

/* ── Dark card wrapper ─────────────────────────────────── */
function DemoCard({ label, badge, visible, accent, children }) {
  const a = accent || DEFAULT_ACCENT;
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        pointerEvents: visible ? 'auto' : 'none',
        background: '#111216',
        border: '1px solid #23252B',
        borderRadius: 16,
        padding: '20px 22px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </span>
        {badge && (
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: a.primary, background: a.soft, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.02em' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── 1. Target Companies ─────────────────────────────── */
export function CompaniesCard({ companies, visible, accent, hasAsterisk }) {
  return (
    <DemoCard label="Suggested target companies" badge="Target list built" visible={visible} accent={accent}>
      <div className="flex flex-wrap gap-2">
        {companies.map((c, i) => (
          <span
            key={i}
            style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#E5E7EB',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px 14px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.92)',
              transition: `opacity 0.35s ${0.06 * i}s, transform 0.35s ${0.06 * i}s`,
            }}
          >
            {c.name}{c.asterisk ? '*' : ''}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>{c.tag}</span>
          </span>
        ))}
      </div>
      {hasAsterisk && (
        <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 10, lineHeight: 1.4 }}>
          *Sample alumni matches based on similar roles and companies
        </p>
      )}
    </DemoCard>
  );
}

/* ── 2. Alumni Matches ───────────────────────────────── */
export function AlumniCard({ alumni, visible, accent, showSchoolBadge = false, schoolName = '' }) {
  const a = accent || DEFAULT_ACCENT;
  const shortSchool = showSchoolBadge ? getSchoolShort(schoolName) : null;

  return (
    <DemoCard label="Alumni you can contact" badge={`${alumni.length} matches`} visible={visible} accent={accent}>
      <div className="flex flex-col gap-2">
        {alumni.map((al, i) => (
          <div
            key={al.name}
            className="flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '12px 16px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-10px)',
              transition: `opacity 0.4s ${0.15 * i}s, transform 0.4s ${0.15 * i}s`,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${a.primary} 0%, ${a.primary}99 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            }}>
              {al.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#E5E7EB', lineHeight: 1.3 }}>
                {al.name}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 12, color: '#9CA3AF', lineHeight: 1.4 }}>
                {al.year} → {al.company} · {al.role}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, opacity: visible ? 1 : 0, transition: `opacity 0.3s ${0.15 * i + 0.1}s` }}>
                {i === 0 && (
                  <>
                    <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: '#34D399', background: 'rgba(52,211,153,0.1)', padding: '2px 7px', borderRadius: 100 }}>Active recently</span>
                    <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: '#818CF8', background: 'rgba(129,140,248,0.1)', padding: '2px 7px', borderRadius: 100 }}>Likely to respond</span>
                  </>
                )}
                {i === 1 && (
                  <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: '#34D399', background: 'rgba(52,211,153,0.1)', padding: '2px 7px', borderRadius: 100 }}>Open to helping students</span>
                )}
                {i === 2 && (
                  <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', padding: '2px 7px', borderRadius: 100 }}>Active recently</span>
                )}
              </div>
            </div>
            {showSchoolBadge && shortSchool && (
              <div style={{
                fontFamily: dmSans, fontSize: 10, fontWeight: 600,
                color: a.primary, background: a.soft,
                padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                letterSpacing: '0.05em',
              }}>
                {shortSchool}
              </div>
            )}
          </div>
        ))}
      </div>
    </DemoCard>
  );
}

/* ── 3. Personalized Outreach ────────────────────────── */
export function OutreachCard({ outreach, visible, accent }) {
  const body = outreach.body;
  const [typedChars, setTypedChars] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const typeTimer = useRef(null);
  const prevBody = useRef('');

  const lines = body.split('\n');
  const typingBoundary = (lines[0] + '\n' + (lines[1] || '')).length;

  useEffect(() => {
    if (!visible) {
      setTypedChars(0);
      setShowFull(false);
      setShowReady(false);
      prevBody.current = body;
      return;
    }
    if (prevBody.current === body && typedChars > 0) return;
    prevBody.current = body;
    setTypedChars(0);
    setShowFull(false);
    setShowReady(false);
    let i = 0;
    const type = () => {
      if (i <= typingBoundary) {
        setTypedChars(i);
        i++;
        typeTimer.current = setTimeout(type, 18);
      } else {
        setTimeout(() => setShowFull(true), 200);
        setTimeout(() => setShowReady(true), 600);
      }
    };
    typeTimer.current = setTimeout(type, 100);
    return () => clearTimeout(typeTimer.current);
  }, [visible, body]);

  const typedText = body.slice(0, typedChars);

  return (
    <DemoCard label="Personalized outreach message" badge={showReady ? '✔ Ready to send' : 'Drafting…'} visible={visible} accent={accent}>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '16px 18px',
        }}
      >
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>To:</span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E5E7EB' }}>{outreach.toFull}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>at {outreach.company}</span>
        </div>
        <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
          {!showFull ? (
            <>
              {typedText}
              {typedChars < typingBoundary && <span style={{ display: 'inline-block', width: 2, height: 16, background: 'rgba(255,255,255,0.5)', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'blink 0.9s infinite' }} />}
            </>
          ) : (
            <span style={{ animation: 'msgFadeIn 0.5s ease' }}>{body}</span>
          )}
        </div>
      </div>
      {/* Success signal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, opacity: showReady ? 1 : 0, transform: showReady ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.4s, transform 0.4s' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.5" stroke="#10B981" strokeWidth="1"/>
          <path d="M4 7.2L6 9.2L10 5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#10B981' }}>
          Students typically get replies within 48 hours
        </span>
      </div>
    </DemoCard>
  );
}