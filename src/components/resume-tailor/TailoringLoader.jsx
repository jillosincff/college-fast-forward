import React, { useState, useEffect } from 'react';
import TailoringWaitTask from '@/components/resume-tailor/TailoringWaitTask';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const violet = '#7c3aed';

const STEPS = [
  'Parsing your resume',
  'Analyzing job requirements',
  'Identifying keyword gaps',
  'Rewriting experience bullets',
  'Optimizing for ATS',
  'Calculating match score',
  'Finalizing your tailored resume',
];

export default function TailoringLoader({ onCancel }) {
  // Index of the step currently in progress. Steps before it are complete.
  // The final step stays "in progress" until the real work finishes and this
  // screen unmounts — so the copy never claims we're done before we are.
  const [activeStep, setActiveStep] = useState(0);
  const [showEscape, setShowEscape] = useState(false);

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return;
    const t = setTimeout(() => setActiveStep(s => s + 1), 5000);
    return () => clearTimeout(t);
  }, [activeStep]);

  // After 45s, offer a way out so nobody gets stuck on this screen
  useEffect(() => {
    const t = setTimeout(() => setShowEscape(true), 45000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#F8FAFC', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes rtPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.85}}
        @keyframes rtSpin{to{transform:rotate(360deg)}}
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

        <div style={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
          {STEPS.map((line, i) => {
            const isComplete = i < activeStep;
            const isActive = i === activeStep;
            return (
              <p key={i} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isComplete ? '#16A34A' : isActive ? violet : '#CBD5E1',
                margin: '0 0 6px', lineHeight: 1.8,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'color 0.3s',
              }}>
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                    border: '2px solid rgba(124,58,237,0.25)', borderTopColor: violet,
                    animation: 'rtSpin 0.8s linear infinite', display: 'inline-block',
                  }} />
                ) : (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                    background: '#E2E8F0', margin: '0 4.5px',
                  }} />
                )}
                {line}{isActive ? '…' : ''}
              </p>
            );
          })}
        </div>

        <TailoringWaitTask />

        {showEscape && onCancel && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#94A3B8', margin: '0 0 10px' }}>
              Taking longer than usual…
            </p>
            <button
              onClick={onCancel}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: violet,
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 999, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto',
              }}
            >
              ← Go back and try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}