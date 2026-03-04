import React from 'react';

export default function WeeklyBriefCard({ stats, onOpenChat }) {
  const parts = [];
  if (stats.opportunities > 0) parts.push(`${stats.opportunities} new opportunities found`);
  if (stats.alumniFound > 0) parts.push(`${stats.alumniFound} alumni identified`);
  if (stats.companiesScanned > 0) parts.push(`${stats.companiesScanned} companies scanned`);
  if (stats.topSignal) parts.push(`${stats.topSignal} moved to "Hot Hiring"`);
  const summary = parts.join(' · ') || 'FASTIQ is monitoring your targets — updates coming soon.';

  return (
    <div className="fiq-animate fiq-delay-7" style={{
      background: 'linear-gradient(135deg, #0A1628, #0021A5)',
      borderRadius: 18, padding: '28px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -20, width: 150, height: 150,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,70,22,0.2), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#FA4616',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
        }}>📊 Weekly Brief</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          FASTIQ worked while you were away
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
          {summary}
        </div>
        <button
          onClick={() => onOpenChat('Show me my full weekly brief — what happened with my targets this week?')}
          style={{
            marginTop: 18, background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
          }}
        >
          View Full Brief →
        </button>
      </div>
    </div>
  );
}