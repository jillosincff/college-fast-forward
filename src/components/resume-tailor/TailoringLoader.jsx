import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const violet = '#7c3aed';

const STEPS = [
  'Parsing your resume...',
  'Analyzing job requirements...',
  'Identifying keyword gaps...',
  'Rewriting experience bullets...',
  'Optimizing for ATS...',
  'Calculating match score...',
  'Done.',
];

export default function TailoringLoader() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= STEPS.length) return;
    const t = setTimeout(() => setVisibleLines(v => v + 1), 800);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#F8FAFC', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes rtPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.85}}
      `}</style>
      <div style={{
        textAlign: 'center', maxWidth: 420, width: '100%',
        background: '#fff', border: '1px solid #ECECEC', borderRadius: 20,
        padding: '40px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}>
        {/* CLIFF badge icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
          background: 'rgba(124,58,237,0.08)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          animation: 'rtPulse 2s ease infinite',
        }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke={violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: violet, margin: '0 0 8px' }}>
          CLIFF · Resume Studio
        </p>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: '0 0 24px' }}>
          Tailoring your resume...
        </h2>

        <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
          {STEPS.slice(0, visibleLines).map((line, i) => {
            const isDone = line === 'Done.';
            return (
              <p key={i} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: isDone ? 600 : 400,
                color: isDone ? violet : '#94A3B8',
                margin: '0 0 6px', lineHeight: 1.8,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? violet : '#CBD5E1',
                }} />
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}