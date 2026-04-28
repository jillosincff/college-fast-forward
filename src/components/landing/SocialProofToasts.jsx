import { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const TOASTS = [
  { delay: 10000, text: "A Penn State parent just joined the network." },
  { delay: 40000, text: "A UF Senior just locked in early-bird Agent pricing." },
  { delay: 80000, text: "New referral connection made at Disney." },
];

export default function SocialProofToasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = TOASTS.map((toast) => {
      return setTimeout(() => {
        const id = Math.random();
        setToasts(prev => [...prev, { ...toast, id }]);
        
        // Auto-remove after 6 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 6000);
      }, toast.delay);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 40, pointerEvents: 'none' }}>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes toastSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-20px);
          }
        }
      `}</style>
      {toasts.map((toast, idx) => (
        <div
          key={toast.id}
          style={{
            fontFamily: dmSans,
            fontSize: 14,
            color: '#fff',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 100,
            padding: '12px 18px',
            marginBottom: idx > 0 ? 12 : 0,
            backdropFilter: 'blur(8px)',
            animation: 'toastSlideIn 0.3s ease-out',
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 280,
            lineHeight: 1.4,
          }}
        >
          ✓ {toast.text}
        </div>
      ))}
    </div>
  );
}