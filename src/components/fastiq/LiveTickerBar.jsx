import React from 'react';

function PulseDot({ color = '#34D399', size = 5 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{
        position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
        backgroundColor: color, animation: 'fiq-pulse-ring 2s ease-out infinite',
      }} />
      <span style={{
        position: 'relative', display: 'block', width: '100%', height: '100%',
        borderRadius: '50%', backgroundColor: color,
      }} />
    </span>
  );
}

export { PulseDot };

export default function LiveTickerBar({ items = [] }) {
  const displayItems = items.length > 0 ? items : [
    'FASTIQ scanned your targets 12 min ago',
    'New roles posted at target companies',
    'FASTIQ continuously monitors hiring signals',
  ];

  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden', height: 32, display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingLeft: 16, paddingRight: 12,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        height: '100%', flexShrink: 0,
      }}>
        <PulseDot color="#34D399" size={5} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LIVE</span>
      </div>
      <div style={{
        display: 'flex', animation: 'fiq-ticker 90s linear infinite', whiteSpace: 'nowrap',
      }}>
        {[...displayItems, ...displayItems].map((item, i) => (
          <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ padding: '0 32px' }}>{item}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}