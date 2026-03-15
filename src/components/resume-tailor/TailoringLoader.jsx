import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

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
      background: 'rgba(13,17,23,0.95)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <style>{`@keyframes rtPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}}`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {/* Lightning icon */}
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 20px', animation: 'rtPulse 2s ease infinite' }}>
          <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke={orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#f4f0e8', marginBottom: 24 }}>
          FASTIQ is tailoring your resume...
        </h2>

        <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
          {STEPS.slice(0, visibleLines).map((line, i) => {
            const isDone = line === 'Done.';
            return (
              <p key={i} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: isDone ? 500 : 300,
                color: isDone ? orange : 'rgba(244,240,232,0.5)',
                margin: '0 0 6px', lineHeight: 1.8,
              }}>
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}