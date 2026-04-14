import { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function FoundingMemberBanner({ onUpgrade, onDismiss, show }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!show) return;

    const calculateTimeLeft = () => {
      const deadline = new Date('2026-04-30T23:59:59');
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, minutes });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show || isExpired) return null;

  const days = timeLeft?.days ?? 0;
  const hours = timeLeft?.hours ?? 0;
  const minutes = timeLeft?.minutes ?? 0;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a0e06, #2a1506)',
      borderBottom: '1px solid rgba(232,93,32,0.2)',
      padding: '10px 16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            🏅 <span style={{ color: '#E85D20', fontWeight: 600 }}>Founding Member</span> — lock in <strong style={{ color: '#fff' }}>$14.50/mo</strong> forever (ends {days}d {hours}h {minutes}m)&nbsp;
          </span>
          <button
            onClick={onUpgrade}
            style={{
              fontFamily: dmSans,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: '#E85D20',
              border: 'none',
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
              minHeight: 'unset',
              minWidth: 'unset',
              width: 'auto',
              display: 'inline-block',
            }}
          >
            Claim →
          </button>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 4,
            flexShrink: 0,
            minHeight: 'unset',
            minWidth: 'unset',
            width: 'auto',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}