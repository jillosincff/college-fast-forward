import { useState } from 'react';
import { recordMemorySignal } from '@/functions/recordMemorySignal';

const dmSans = "'DM Sans', system-ui, sans-serif";

// The tailoring wait is dead time. Two taps here make every future match better,
// so the student leaves the loader having accomplished something.
const QUESTIONS = [
  {
    prompt: 'Where do you want to work?',
    category: 'remote_preference',
    options: [['remote', 'Remote'], ['hybrid', 'Hybrid'], ['on-site', 'On-site'], ['no preference', 'No preference']],
  },
  {
    prompt: 'What are you after right now?',
    category: 'internship_vs_fulltime',
    options: [['internship', 'Internship'], ['full-time', 'Full-time'], ['either', 'Either']],
  },
];

export default function TailoringWaitTask() {
  const [step, setStep] = useState(0);
  const q = QUESTIONS[step];

  const pick = (value) => {
    recordMemorySignal({ category: q.category, value, explicit: true }).catch(() => {});
    setStep(s => s + 1);
  };

  if (!q) {
    return (
      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #F1F5F9' }}>
        <p style={{ fontFamily: dmSans, fontSize: 12.5, fontWeight: 600, color: '#16A34A', margin: 0 }}>
          ✓ Got it — CLIFF will use this on every match from here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #F1F5F9', textAlign: 'left' }}>
      <p style={{ fontFamily: dmSans, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', margin: '0 0 8px' }}>
        While CLIFF works · {step + 1} of {QUESTIONS.length}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>
        {q.prompt}
      </p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {q.options.map(([value, label]) => (
          <button
            key={value}
            onClick={() => pick(value)}
            style={{
              fontFamily: dmSans, fontSize: 12.5, fontWeight: 700, color: '#5b21b6',
              background: 'rgba(124,58,237,0.07)', border: `1px solid rgba(124,58,237,0.22)`,
              borderRadius: 999, padding: '8px 15px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: '#94A3B8', margin: '10px 0 0' }}>
        Answering sharpens every match CLIFF sends you — not just this one.
      </p>
    </div>
  );
}