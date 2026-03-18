import React, { useState, useEffect } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER } from './constants';

export default function WelcomeCard({ onBuildPlan }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('cff_fastiq_welcome_dismissed')) setDismissed(true);
    } catch {}
  }, []);

  if (dismissed) return null;

  const handleClick = () => {
    try { localStorage.setItem('cff_fastiq_welcome_dismissed', 'true'); } catch {}
    setDismissed(true);
    if (onBuildPlan) onBuildPlan();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(232,93,32,0.12) 0%, rgba(232,93,32,0.06) 100%)',
      border: `1px solid rgba(232,93,32,0.25)`,
      borderRadius: 12, padding: '24px', marginBottom: 20,
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
        🚀 FastIQ is active.
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 16 }}>
        Your full career engine is ready. Start with your Career Goals to build your plan — everything else follows from there.
      </p>
      <button onClick={handleClick}
        style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '10px 24px', cursor: 'pointer', minHeight: 'auto' }}>
        Build My Plan →
      </button>
    </div>
  );
}