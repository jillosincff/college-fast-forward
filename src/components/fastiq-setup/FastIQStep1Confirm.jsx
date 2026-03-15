import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

export default function FastIQStep1Confirm({ user, onConfirm, onEditProfile }) {
  const fields = [
    { label: 'Major', value: user?.major },
    { label: 'Graduation', value: user?.graduation_year },
    { label: 'Looking for', value: (user?.seeking_type || []).join(' · ') },
    { label: 'Industries', value: (user?.industries_interested || []).join(' · ') },
  ];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        Let's set up <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>FASTIQ.</em>
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
        We pulled your profile. Confirm this is right before FASTIQ starts working.
      </p>

      {/* Profile card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, marginBottom: 28,
      }}>
        {fields.map((f, i) => (
          <div key={f.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < fields.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(244,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {f.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {f.value ? (
                <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#f4f0e8', textAlign: 'right', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.value}
                </span>
              ) : (
                <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.2)', fontStyle: 'italic' }}>
                  Not set yet
                </span>
              )}
              <button
                onClick={onEditProfile}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange, padding: 0, minHeight: 'auto', width: 'auto' }}
              >
                {f.value ? 'Edit →' : 'Add →'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Primary CTA */}
      <button
        onClick={onConfirm}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 100, border: 'none',
          background: orange, color: '#fff',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500, cursor: 'pointer', minHeight: 48,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
        onMouseLeave={e => e.currentTarget.style.background = orange}
      >
        This looks right — let's go →
      </button>

      <button
        onClick={onEditProfile}
        style={{
          display: 'block', margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)',
          minHeight: 44, width: 'auto',
        }}
      >
        Update my profile first →
      </button>
    </div>
  );
}