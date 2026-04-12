import { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function FoundingMemberBanner({ onUpgrade, onDismiss, show }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!show) return;

    const calculateTimeLeft = () => {
      const deadline = new Date('2026-04-15T23:59:59');
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
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 8px', lineHeight: 1.5 }}>
            🏅 <span style={{ color: '#E85D20', fontWeight: 600 }}>Founding Member Pricing</span> ends in {days}d {hours}h {minutes}m — lock in <strong style={{ color: '#fff' }}>$14.50/mo</strong> forever instead of $29
          </p>
          <button onClick={onUpgrade} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
            background: '#E85D20', border: 'none', borderRadius: 8,
            padding: '6px 16px', cursor: 'pointer', minHeight: 'auto',
            whiteSpace: 'nowrap',
          }}>Claim $14.50/mo →</button>
        </div>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', fontSize: 16, minHeight: 'auto', minWidth: 'auto',
          padding: '0 0 0 8px', flexShrink: 0,
        }}>✕</button>
      </div>
    </div>
  );
}