import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

const OPTIONS = [
  { value: 'yes', label: 'Happy to help' },
  { value: 'occasionally', label: 'Occasionally available' },
  { value: 'no', label: 'Not right now' },
];

export default function ParentIntroCard({ user }) {
  const [selected, setSelected] = useState(user?.intro_willingness || 'yes');

  const handleSelect = async (value) => {
    setSelected(value);
    await base44.auth.updateMe({ intro_willingness: value });
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>Intro Availability</p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Are you open to making introductions?</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {OPTIONS.map(opt => {
          const active = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : ORANGE,
              background: active ? ORANGE : 'transparent',
              border: `1.5px solid ${ORANGE}`, borderRadius: 100,
              padding: '9px 20px', cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s',
            }}>
              {opt.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 12, color: '#666' }}>This controls how often we match you with student intro requests.</p>
    </div>
  );
}