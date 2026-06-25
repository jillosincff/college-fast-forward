import React from 'react';

const SF = "'DM Sans', system-ui, sans-serif";

const SCHOOLS = [
  'University of Florida',
  'University of Central Florida',
  'University of South Carolina',
  'University of Michigan',
  'University of Delaware',
  'Ohio State',
  'Indiana University',
  'University of Wisconsin',
  'Florida Atlantic University',
  'Penn State',
];

function Pill({ name }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      flexShrink: 0, whiteSpace: 'nowrap',
      fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#64748b',
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999,
      padding: '8px 16px',
    }}>
      <span style={{ fontSize: 13 }}>🎓</span>
      {name}
    </span>
  );
}

export default function SchoolMarquee() {
  // Duplicate the list once so the -50% translate produces a seamless loop.
  const loop = [...SCHOOLS, ...SCHOOLS];

  return (
    <div style={{ background: '#fafbfc', borderBottom: '1px solid #f1f5f9', padding: '24px 0 28px' }}>
      <style>{`
        @keyframes cffSchoolScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .cff-school-track {
          display: flex;
          width: max-content;
          gap: 12px;
          animation: cffSchoolScroll 38s linear infinite;
        }
      `}</style>

      <p style={{
        fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#94a3b8',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        textAlign: 'center', margin: '0 0 16px',
      }}>
        Growing Networks At
      </p>

      <div style={{
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
      }}>
        <div className="cff-school-track">
          {loop.map((name, i) => (
            <Pill key={i} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}