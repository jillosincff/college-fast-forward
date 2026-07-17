import { useState, useEffect } from 'react';
import { FONT, TEXT, TEXT2, GREEN } from './onboardingShared';

const MESSAGES = [
  'Reading your experience…',
  'Finding your strongest skills…',
  'Connecting your background to your goals…',
  'Getting your first move ready…',
];

// Post-upload processing state — never a generic spinner.
export default function ResumeProcessing() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => Math.min(i + 1, MESSAGES.length - 1)), 2600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
        Perfect. Now I can make this personal.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 420 }}>
        I'll use your experience to improve your recommendations and prepare stronger applications.
      </p>
      <div style={{ width: 34, height: 34, border: '3px solid #E2E8F0', borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
      <p key={idx} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: GREEN, margin: 0, animation: 'fadeUp 0.3s ease' }}>
        {MESSAGES[idx]}
      </p>
    </div>
  );
}