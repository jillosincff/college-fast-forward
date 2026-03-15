import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const STARTERS = [
  'Something creative — design, content, brand',
  'Working with numbers — finance, analytics, data',
  'Helping people — healthcare, education, nonprofit',
  'Building things — engineering, product, startups',
  'Strategy and business — consulting, operations',
  "Not sure — ask me questions and help me figure it out",
];

export default function FastIQStep3Explore({ interest, onInterestChange, onSkip }) {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (text, idx) => {
    setSelectedCard(idx);
    onInterestChange(text);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        Tell FASTIQ what <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>sounds interesting.</em>
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', lineHeight: 1.6, marginBottom: 24 }}>
        There's no wrong answer. Vague is fine — we'll figure it out together.
      </p>

      {/* Starter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {STARTERS.map((text, i) => {
          const isSelected = selectedCard === i;
          return (
            <button key={i} onClick={() => handleCardClick(text, i)}
              style={{
                background: isSelected ? 'rgba(232,93,32,0.08)' : 'rgba(255,255,255,0.04)',
                border: isSelected ? '0.5px solid rgba(232,93,32,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 14, fontWeight: 300,
                color: isSelected ? '#f4f0e8' : 'rgba(244,240,232,0.65)',
                lineHeight: 1.4, textAlign: 'left', transition: 'all 0.2s',
                width: '100%', minHeight: 'auto',
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = '#f4f0e8'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(244,240,232,0.65)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
            >
              {text}
            </button>
          );
        })}
      </div>

      {/* Freeform textarea */}
      <textarea
        value={interest}
        onChange={e => { onInterestChange(e.target.value); setSelectedCard(null); }}
        placeholder="Or describe what sounds interesting in your own words..."
        rows={3}
        style={{
          width: '100%', padding: '14px 16px', borderRadius: 12, resize: 'none',
          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
          color: '#f4f0e8', fontFamily: dmSans, fontSize: 14, fontWeight: 300,
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      {/* Skip */}
      <button onClick={onSkip}
        style={{ display: 'block', margin: '24px auto 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.25)', minHeight: 44, width: 'auto' }}>
        I'll add this later →
      </button>
    </div>
  );
}