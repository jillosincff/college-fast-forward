import React from 'react';
import { motion } from 'framer-motion';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';
const STEP_LABELS = ['You', 'Direction', 'Targets', 'Ready'];

function Checkmark() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1.5 4L3.25 5.75L6.5 2.25" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function FastIQSetupProgress({ currentStep }) {
  return (
    <div style={{ padding: '28px 24px 16px', maxWidth: 400, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Connecting lines behind dots */}
        {[0, 1, 2].map(i => (
          <div key={`line-${i}`} style={{
            position: 'absolute',
            top: 5,
            left: `calc(${(i / 3) * 100}% + 12px)`,
            width: `calc(${(1 / 3) * 100}% - 24px)`,
            height: 2,
            background: i < currentStep ? orange : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
            zIndex: 0,
          }} />
        ))}

        {STEP_LABELS.map((label, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{
                  background: isCompleted || isActive ? orange : 'rgba(255,255,255,0.15)',
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isCompleted && <Checkmark />}
              </motion.div>
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 300, marginTop: 8,
                color: isActive ? '#f4f0e8' : 'rgba(244,240,232,0.4)',
                transition: 'color 0.3s',
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}