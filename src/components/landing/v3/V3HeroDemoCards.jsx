import React from 'react';
import { getSchoolShort } from './V3HeroDemoData';

const dmSans = '"DM Sans", system-ui, sans-serif';

const DEFAULT_ACCENT = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

/* ── Shared card wrapper ────────────────────────────── */
function DemoCard({ label, badge, visible, accent, children }) {
  const a = accent || DEFAULT_ACCENT;
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.5s, transform 0.5s',
        background: '#F9F9FB',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.4)' }}>
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
              fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a',
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 10, padding: '8px 14px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.92)',
              transition: `opacity 0.35s ${0.08 * i}s, transform 0.35s ${0.08 * i}s`,
            }}
          >
            {c.name}{c.asterisk ? '*' : ''}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(0,0,0,0.35)' }}>{c.tag}</span>
          </span>
        ))}
      </div>
      {hasAsterisk && (
        <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(0,0,0,0.3)', marginTop: 10, lineHeight: 1.4 }}>
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
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
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
              <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>
                {al.name}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
                {schoolName} {al.year} → {al.company} · {al.role}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 10, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>
                {i === 0 ? 'Active 2 days ago · Open to helping students' : i === 1 ? 'Replied recently' : 'Open to helping students'}
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
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, padding: '16px 18px',
        }}
      >
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>To:</span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{outreach.toFull}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(0,0,0,0.3)', marginLeft: 4 }}>at {outreach.company}</span>
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 400,
          color: '#374151', lineHeight: 1.7,
          whiteSpace: 'pre-line', margin: 0,
        }}>
          {body}
        </p>
      </div>
      {/* Success signal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
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