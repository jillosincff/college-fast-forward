import React from 'react';
import { Pencil } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

export default function FastIQStep1Confirm({ user, onConfirm, onEditProfile }) {
  const major = user?.major || 'Not set';
  const minor = user?.minor || '';
  const gradYear = user?.graduation_year || 'Not set';
  const seeking = (user?.seeking_type || []).map(s => {
    const labels = { internship: 'Internship', full_time: 'Full-time', part_time: 'Part-time', co_op: 'Co-op', fellowship: 'Fellowship', research: 'Research' };
    return labels[s] || s;
  });
  const industries = user?.industries_interested || [];

  const fields = [
    { label: 'Major', value: major + (minor ? ` · Minor: ${minor}` : '') },
    { label: 'Graduation', value: gradYear },
    { label: 'Looking for', value: seeking.length > 0 ? seeking.join(' · ') : 'Not set' },
    { label: 'Industries', value: industries.length > 0 ? industries.join(' · ') : 'Not set' },
  ];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 30px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        FASTIQ is ready to go to work.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginBottom: 32 }}>
        We pulled your profile. Confirm this is right — or update anything before FASTIQ starts.
      </p>

      {/* Profile summary card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '24px 20px', marginBottom: 28,
      }}>
        {fields.map((field, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '12px 0',
            borderBottom: i < fields.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(244,240,232,0.4)', flexShrink: 0, marginRight: 16 }}>
              {field.label}
            </span>
            <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#f4f0e8', textAlign: 'right', lineHeight: 1.5 }}>
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 100, border: 'none',
          background: orange, color: '#fff',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: 'pointer', minHeight: 48,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
        onMouseLeave={e => e.currentTarget.style.background = orange}
      >
        This looks right — continue →
      </button>

      {/* Edit profile link */}
      <button
        onClick={onEditProfile}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: 'auto', margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.35)',
          minHeight: 44,
        }}
      >
        <Pencil className="w-3 h-3" /> Update my profile first →
      </button>
    </div>
  );
}