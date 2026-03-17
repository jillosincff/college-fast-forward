import React from 'react';
import { Zap } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function StepWelcome({ onNext }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 32px',
      }}>
        <Zap size={26} style={{ color: '#4F8CFF' }} />
      </div>

      <h1 style={{
        fontFamily: dmSans, fontSize: 32, fontWeight: 700, color: '#fff',
        lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.02em',
      }}>
        Let's build your plan
      </h1>

      <p style={{
        fontFamily: dmSans, fontSize: 17, fontWeight: 400,
        color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 40,
      }}>
        This takes less than a minute.
      </p>

      <button onClick={onNext} style={{
        background: '#4F8CFF', border: 'none', borderRadius: 12,
        padding: '16px 48px', cursor: 'pointer',
        fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff',
        transition: 'all 0.2s', minHeight: 'auto',
        boxShadow: '0 4px 24px rgba(79,140,255,0.3)',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(79,140,255,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(79,140,255,0.3)'; }}
      >
        Get Started
      </button>

      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 400,
        color: 'rgba(255,255,255,0.25)', marginTop: 18,
      }}>
        No resume needed
      </p>
    </div>
  );
}