import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function LandingStickyNav({ onSignIn, onGetStarted }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(13,17,23,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        padding: '12px 40px',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .sticky-nav-wrap { padding: 12px 16px !important; }
          .sticky-nav-signin { display: none !important; }
          .sticky-nav-trust { display: none !important; }
        }
      `}</style>
      <div className="sticky-nav-wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Left — wordmark */}
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#f4f0e8', whiteSpace: 'nowrap' }}>
          College Fast Forward
        </span>

        {/* Center — trust snippet */}
        <span className="sticky-nav-trust"
          style={{
            fontFamily: dmSans,
            fontSize: 13,
            fontWeight: 300,
            color: 'rgba(244,240,232,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          FASTIQ™ — 7-day free trial · $29/mo founding rate
        </span>

        {/* Right — buttons */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <button className="sticky-nav-signin"
            onClick={onSignIn}
            style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(244,240,232,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              minHeight: 'auto',
              minWidth: 'auto',
              width: 'auto',
            }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#d44e14'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#E85D20'; }}
            style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 500,
              background: '#E85D20',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minHeight: 'auto',
              minWidth: 'auto',
              width: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}