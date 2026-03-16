import React from 'react';
import { Check } from 'lucide-react';
import AlumniLeftPanel from './AlumniLeftPanel';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const STEP_LABELS_FULL = ['Details', 'About', 'Industry', 'Intent', 'Help', 'Pledge', 'Ready'];
const STEP_LABELS_RECENT = ['Details', 'About', 'Industry', 'Help', 'Pledge', 'Ready'];

function ProgressDots({ step, totalSteps, isRecentGrad }) {
  const labels = isRecentGrad ? STEP_LABELS_RECENT : STEP_LABELS_FULL;
  // Map display index to actual step number for recent grads (skip step 4)
  const stepMapping = isRecentGrad
    ? [1, 2, 3, 5, 6, 7] // display positions map to these actual steps
    : [1, 2, 3, 4, 5, 6, 7];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
      {labels.map((label, i) => {
        const actualStep = stepMapping[i];
        const isCompleted = step > actualStep;
        const isActive = step === actualStep;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{
                width: 16, height: 1.5,
                background: step > actualStep ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)',
              }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: isActive ? '#E85D20' : isCompleted ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.08)',
              border: isActive ? '2px solid rgba(232,93,32,0.6)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }}>
              {isCompleted ? (
                <Check style={{ width: 14, height: 14, color: '#fff' }} />
              ) : (
                <span style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 600,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                }}>{i + 1}</span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function AlumniOnboardingLayout({ step, totalSteps, intent, isRecentGrad, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f2ee' }}>
      <div className="ao-layout" style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        {/* LEFT PANEL — dark gradient */}
        <div className="ao-left" style={{
          width: '45%', flexShrink: 0, position: 'sticky', top: 0,
          height: '100vh', overflowY: 'auto',
          backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
          backgroundColor: '#0d1117',
          padding: '40px 36px',
          display: 'flex', flexDirection: 'column',
        }}>
          <ProgressDots step={step} totalSteps={totalSteps} />
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16,
          }}>
            {step === 1 ? 'WELCOME TO' : step === 7 ? 'FINAL STEP' : (() => {
              // For recent grads, compute display step number (skip step 4)
              const displayStep = isRecentGrad && step >= 5 ? step - 1 : step;
              return `STEP ${displayStep} OF ${totalSteps}`;
            })()}
          </p>
          <AlumniLeftPanel step={step} intent={intent} isRecentGrad={isRecentGrad} />
        </div>

        {/* MOBILE HEADER */}
        <div className="ao-mobile-header" style={{ display: 'none' }}>
          <div style={{
            backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
            padding: '24px 20px 20px', textAlign: 'center',
          }}>
            <ProgressDots step={step} totalSteps={totalSteps} isRecentGrad={isRecentGrad} />
          </div>
        </div>

        {/* RIGHT PANEL — white form */}
        <div className="ao-right" style={{
          flex: 1, background: '#ffffff', padding: '48px 48px 60px', overflowY: 'auto',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ao-layout { flex-direction: column !important; }
          .ao-left { display: none !important; }
          .ao-mobile-header { display: block !important; }
          .ao-right { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}