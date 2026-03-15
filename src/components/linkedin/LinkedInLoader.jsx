import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const REVIEW_STEPS = [
  'Reading your profile...',
  'Analyzing your headline...',
  'Checking your About section...',
  'Reviewing experience bullets...',
  'Scanning your skills...',
  'Calculating your profile strength...',
  'Done.',
];

const BUILD_STEPS = [
  'Building your headline...',
  'Writing your About section...',
  'Turning your experience into bullets...',
  'Selecting your top skills...',
  'Formatting education...',
  'Your LinkedIn profile is ready.',
];

export default function LinkedInLoader({ mode }) {
  const steps = mode === 'build' ? BUILD_STEPS : REVIEW_STEPS;
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= steps.length) return;
    const t = setTimeout(() => setVisibleLines(v => v + 1), 800);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(13,17,23,0.95)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <style>{`@keyframes liPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}}`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 20px', animation: 'liPulse 2s ease infinite' }}>
          <rect x="4" y="4" width="40" height="40" rx="8" stroke={orange} strokeWidth="2" fill="none"/>
          <path d="M14 20v8M14 16v1M22 28v-4c0-2 1-4 4-4s4 2 4 4v4" stroke={orange} strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#f4f0e8', marginBottom: 24 }}>
          {mode === 'build' ? 'FASTIQ is building your profile...' : 'FASTIQ is analyzing your LinkedIn...'}
        </h2>
        <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
          {steps.slice(0, visibleLines).map((line, i) => {
            const isLast = i === steps.length - 1;
            return (
              <p key={i} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: isLast ? 500 : 300,
                color: isLast ? orange : 'rgba(244,240,232,0.5)',
                margin: '0 0 6px', lineHeight: 1.8,
              }}>{line}</p>
            );
          })}
        </div>
      </div>
    </div>
  );
}