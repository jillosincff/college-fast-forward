import React from 'react';

const dmSans = '"DM Sans", system-ui, sans-serif';

/* ── Shared card wrapper ────────────────────────────── */
function DemoCard({ label, badge, delay, visible, children }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.5s ${delay}s, transform 0.5s ${delay}s`,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 16,
        padding: '20px 22px',
        marginBottom: 0,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
          {label}
        </span>
        {badge && (
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#34D399', background: 'rgba(52,211,153,0.12)', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.02em' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── 1. Target Companies ─────────────────────────────── */
export function CompaniesCard({ companies, visible }) {
  return (
    <DemoCard label="Suggested target companies" badge="Target list built" delay={0} visible={visible}>
      <div className="flex flex-wrap gap-2">
        {companies.map((c, i) => (
          <span
            key={i}
            style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.92)',
              transition: `opacity 0.35s ${0.08 * i}s, transform 0.35s ${0.08 * i}s`,
            }}
          >
            {c.name}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>{c.tag}</span>
          </span>
        ))}
      </div>
    </DemoCard>
  );
}

/* ── 2. Alumni Matches ───────────────────────────────── */
export function AlumniCard({ alumni, visible }) {
  return (
    <DemoCard label="Alumni you can reach out to" badge={`${alumni.length} matches`} delay={0} visible={visible}>
      <div className="flex flex-col gap-2">
        {alumni.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '12px 16px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.4s ${0.1 * i}s, transform 0.4s ${0.1 * i}s`,
            }}
          >
            {/* Avatar circle */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #E85D20 0%, #FF8A5C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            }}>
              {a.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                {a.name}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                {a.school} → {a.company} · {a.role}
              </div>
            </div>
            {/* UF badge */}
            <div style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 600,
              color: '#FA4616', background: 'rgba(250,70,22,0.12)',
              padding: '3px 8px', borderRadius: 6, flexShrink: 0,
              letterSpacing: '0.05em',
            }}>
              UF
            </div>
          </div>
        ))}
      </div>
    </DemoCard>
  );
}

/* ── 3. Personalized Outreach ────────────────────────── */
export function OutreachCard({ outreach, visible }) {
  return (
    <DemoCard label="Personalized outreach message" badge="Ready to send" delay={0} visible={visible}>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '16px 18px',
        }}
      >
        {/* To / From header */}
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>To:</span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff' }}>{outreach.toFull}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>at {outreach.company}</span>
        </div>
        {/* Message body */}
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 400,
          color: 'rgba(255,255,255,0.85)', lineHeight: 1.7,
          whiteSpace: 'pre-line', margin: 0,
        }}>
          {outreach.body}
        </p>
      </div>
    </DemoCard>
  );
}