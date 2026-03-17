import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const OPTIONS = [
  { label: 'Consulting', emoji: '📊' },
  { label: 'Finance', emoji: '💰' },
  { label: 'Marketing', emoji: '📣' },
  { label: 'Tech / Product', emoji: '💻' },
  { label: 'Startups', emoji: '🚀' },
  { label: 'Not sure yet', emoji: '🤷' },
];

export default function StepInterests({ selected, onChange, onNext }) {
  const toggle = (label) => {
    if (label === 'Not sure yet') {
      onChange(selected.includes(label) ? [] : [label]);
      return;
    }
    const without = selected.filter(s => s !== 'Not sure yet');
    if (without.includes(label)) {
      onChange(without.filter(s => s !== label));
    } else {
      onChange([...without, label]);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 440, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: dmSans, fontSize: 26, fontWeight: 700, color: '#fff',
        lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.02em',
      }}>
        What are you interested in?
      </h2>
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: 'rgba(255,255,255,0.4)', marginBottom: 28,
      }}>
        Pick as many as you'd like.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
        {OPTIONS.map(opt => {
          const active = selected.includes(opt.label);
          return (
            <button key={opt.label} onClick={() => toggle(opt.label)} style={{
              background: active ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: active ? '1px solid rgba(79,140,255,0.4)' : '1px solid #2A2D35',
              borderRadius: 12, padding: '12px 20px',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: dmSans, fontSize: 15, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              display: 'flex', alignItems: 'center', gap: 8,
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#2A2D35'; }}
            >
              <span>{opt.emoji}</span> {opt.label}
            </button>
          );
        })}
      </div>

      <button onClick={onNext} disabled={selected.length === 0} style={{
        background: selected.length > 0 ? '#4F8CFF' : 'rgba(255,255,255,0.08)',
        border: 'none', borderRadius: 12, padding: '14px 44px',
        cursor: selected.length > 0 ? 'pointer' : 'default',
        fontFamily: dmSans, fontSize: 16, fontWeight: 600,
        color: selected.length > 0 ? '#fff' : 'rgba(255,255,255,0.25)',
        transition: 'all 0.2s', minHeight: 'auto',
        boxShadow: selected.length > 0 ? '0 4px 24px rgba(79,140,255,0.25)' : 'none',
      }}>
        Continue
      </button>
    </div>
  );
}