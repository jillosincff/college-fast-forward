import React from 'react';
import { Zap } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function WeeklyFocusCard({ focusText, actionPrompt }) {
  const handleAction = () => {
    // Navigate to FastIQ chat with pre-loaded context
    sessionStorage.setItem('fastiq_initial_message', actionPrompt || focusText);
    navigate('FastIQ');
  };

  return (
    <div style={{
      background: '#fff',
      borderLeft: `3px solid ${orange}`,
      borderRadius: '0 16px 16px 0',
      padding: '20px 24px',
      marginBottom: 24,
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: orange, marginBottom: 8,
      }}>
        FASTIQ'S FOCUS FOR YOU THIS WEEK
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#1a1a1a',
        lineHeight: 1.5, marginBottom: 12,
      }}>
        {focusText}
      </p>
      <button
        onClick={handleAction}
        style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
          background: orange, border: 'none', borderRadius: 100,
          padding: '8px 18px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          minHeight: 'auto', width: 'auto',
        }}
      >
        <Zap className="w-3.5 h-3.5" />
        Do this now →
      </button>
    </div>
  );
}