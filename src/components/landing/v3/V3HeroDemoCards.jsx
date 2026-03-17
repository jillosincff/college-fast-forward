import React from 'react';
import { getSchoolShort } from './V3HeroDemoData';

const dmSans = '"DM Sans", system-ui, sans-serif';

const DEFAULT_ACCENT = { primary: '#D4A843', soft: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.30)', glow: 'rgba(212,168,67,0.25)' };

/* ── Shared card wrapper ────────────────────────────── */
function DemoCard({ label, badge, visible, accent, children }) {
  const a = accent || DEFAULT_ACCENT;
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.5s, transform 0.5s, border-color 0.4s',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${visible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 16,
        padding: '20px 22px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
        {badge && (
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: a.primary, background: a.soft, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.02em', transition: 'color 0.3s, background 0.3s' }}>
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
              fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #1F1F23',
              borderRadius: 10, padding: '8px 14px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.92)',
              transition: `opacity 0.35s ${0.08 * i}s, transform 0.35s ${0.08 * i}s`,
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
export function AlumniCard({ alumni, visible, schoolName, accent }) {
  const a = accent || DEFAULT_ACCENT;
  const shortSchool = getSchoolShort(schoolName);

  return (
    <DemoCard label="Alumni you can contact" badge={`${alumni.length} matches`} visible={visible} accent={accent}>
      <div className="flex flex-col gap-2">
        {alumni.map((al, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1F1F23',
              borderRadius: 12, padding: '12px 16px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.4s ${0.1 * i}s, transform 0.4s ${0.1 * i}s`,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${a.primary} 0%, ${a.primary}99 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
              transition: 'background 0.4s',
            }}>
              {al.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                {al.name}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 12, color: '#A1A1AA', lineHeight: 1.4 }}>
                {schoolName} {al.year} → {al.company} · {al.role}
              </div>
            </div>
            <div style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 600,
              color: a.primary, background: a.soft,
              padding: '3px 8px', borderRadius: 6, flexShrink: 0,
              letterSpacing: '0.05em', transition: 'color 0.3s, background 0.3s',
            }}>
              {shortSchool}
            </div>
          </div>
        ))}
      </div>
    </DemoCard>
  );
}

/* ── 3. Personalized Outreach ────────────────────────── */
export function OutreachCard({ outreach, visible, schoolName, accent }) {
  const body = outreach.body;

  return (
    <DemoCard label="Personalized outreach message" badge="Ready to send" visible={visible} accent={accent}>
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid #1F1F23',
          borderRadius: 12, padding: '16px 18px',
        }}
      >
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>To:</span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff' }}>{outreach.toFull}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>at {outreach.company}</span>
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 400,
          color: 'rgba(255,255,255,0.8)', lineHeight: 1.7,
          whiteSpace: 'pre-line', margin: 0,
        }}>
          {body}
        </p>
      </div>
    </DemoCard>
  );
}