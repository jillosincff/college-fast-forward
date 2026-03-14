import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function FastIQNudgeBar({ uncontactedCount }) {
  if (!uncontactedCount || uncontactedCount <= 0) return null;

  return (
    <div onClick={() => navigate('FastIQ')} style={{
      background: 'rgba(232,93,32,0.05)', border: '0.5px solid rgba(232,93,32,0.15)',
      borderRadius: 12, padding: '12px 16px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      transition: 'background 0.2s',
      animation: 'msgFadeUp 0.4s ease 0.08s both',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.05)'; }}
    >
      {/* Icon */}
      <div style={{
        width: 28, height: 28, background: 'rgba(232,93,32,0.12)', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 2 }}>
          FASTIQ has {uncontactedCount} uncontacted match{uncontactedCount !== 1 ? 'es' : ''} ready for outreach
        </strong>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
          Let FASTIQ draft personalized messages — you review and send.
        </span>
      </div>

      {/* CTA */}
      <span className="fastiq-nudge-cta" style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
        marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0,
      }}>Start outreach →</span>

      <style>{`
        @media(max-width:768px) {
          .fastiq-nudge-cta { display: none !important; }
        }
      `}</style>
    </div>
  );
}