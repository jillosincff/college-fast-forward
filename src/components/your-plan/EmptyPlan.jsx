import React from 'react';
import { Zap } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function EmptyPlan() {
  return (
    <div style={{
      background: '#15171C', borderRadius: 20, border: '1px solid #23252B',
      padding: '60px 32px', textAlign: 'center',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Zap size={24} style={{ color: '#4F8CFF' }} />
      </div>

      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
        Let's build your plan
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 28px' }}>
        Tell FastIQ what you're looking for and it will create a personalized plan with target companies, contacts, and outreach — ready in minutes.
      </p>

      <button onClick={() => navigate('FastIQ')} style={{
        background: '#4F8CFF', border: 'none', borderRadius: 12,
        padding: '14px 32px', cursor: 'pointer',
        fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'background 0.2s', minHeight: 'auto',
        boxShadow: '0 4px 20px rgba(79,140,255,0.25)',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#3A7BEE'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#4F8CFF'; }}
      >
        <Zap size={16} /> Start with FastIQ
      </button>

      <p style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 400,
        color: 'rgba(255,255,255,0.25)', marginTop: 16,
      }}>
        Ready when you are.
      </p>
    </div>
  );
}