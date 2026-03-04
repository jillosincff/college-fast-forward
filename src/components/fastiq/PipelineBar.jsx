import React from 'react';

const STAGES = [
  { key: 'identified', icon: '🔍', label: 'Identified', color: '#0021A5' },
  { key: 'reached_out', icon: '✉️', label: 'Reached Out', color: '#8B5CF6' },
  { key: 'replied', icon: '💬', label: 'Replies', color: '#10B981' },
  { key: 'interview', icon: '📅', label: 'Interviews', color: '#FA4616' },
  { key: 'offer', icon: '🎉', label: 'Offers', color: '#EAB308' },
];

export default function PipelineBar({ counts }) {
  return (
    <div className="fiq-animate fiq-delay-4" style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
      }}>Your Pipeline</h2>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px 16px',
        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
      }}>
        {STAGES.map((s, i) => {
          const count = counts[s.key] || 0;
          const active = count > 0;
          return (
            <React.Fragment key={s.key}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: active ? `${s.color}12` : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px', fontSize: 18, transition: 'all 0.3s',
                }}>{s.icon}</div>
                <div className="fiq-mono" style={{
                  fontSize: 24, fontWeight: 700,
                  color: active ? s.color : '#CBD5E1',
                }}>{count}</div>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2,
                }}>{s.label}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div style={{
                  width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#E2E8F0', fontSize: 18, marginTop: -20, flexShrink: 0,
                }}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}