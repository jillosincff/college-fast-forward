import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';

const FAKE_SIGNALS = [
  { count: 3, label: 'Unadvertised roles', company: 'matching your FSU Alumni network', time: 'This morning' },
  { count: 1, label: 'Hiring manager viewed a similar profile', company: 'at a company on your list', time: '2 hours ago' },
  { count: 5, label: 'New Inside Track leads crawled', company: 'from alumni-connected companies', time: 'Today' },
];

function SignalRow({ sig, i, onUnlock }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onUnlock}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="premium-blurred-row"
      style={{
        background: i === 0 ? BLUE_LIGHT : '#f9fafb',
        border: `1px solid ${i === 0 ? BLUE_BORDER : '#e5e7eb'}`,
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'visible',
        boxShadow: hovered ? '0 4px 16px rgba(37,99,235,0.12)' : 'none',
        filter: hovered ? 'brightness(0.97)' : 'none',
      }}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          top: -38,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          fontFamily: dm,
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          Click to reveal company &amp; alumni network
          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: '#1e293b', borderRadius: 1, rotate: '45deg' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #93c5fd, #6366f1)', flexShrink: 0, filter: 'blur(6px)', opacity: 0.8 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: i === 0 ? BLUE : '#374151' }}>{sig.count}</span>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{sig.label}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>{sig.company.split(' at ')[0]} at{' '}</p>
            <span style={{ fontFamily: dm, fontSize: 12, color: '#111827', background: '#e5e7eb', borderRadius: 4, padding: '1px 8px', filter: 'blur(4px)', userSelect: 'none' }}>████████ Corp</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', margin: '0 0 6px' }}>{sig.time}</p>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: BLUE, borderRadius: 100, padding: '3px 10px' }}>Unlock</span>
        </div>
      </div>
    </div>
  );
}

export default function TeaserSignalsCard({ onUnlock }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Career Signals Feed</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Your Agent is actively scanning. Unlock to see results.</p>
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#fff', borderRadius: 100, padding: '3px 10px' }}>LIVE</span>
      </div>

      {/* Blurred signals */}
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'visible' }}>
        {FAKE_SIGNALS.map((sig, i) => (
          <SignalRow key={i} sig={sig} i={i} onUnlock={onUnlock} />
        ))}
      </div>

      {/* CTA */}
      <div
        onClick={onUnlock}
        style={{ borderTop: '1px solid #e5e7eb', padding: '14px 22px', background: 'linear-gradient(135deg, #eff6ff, #fff)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0 }}>
          🔒 Unlock these leads for <strong style={{ color: BLUE }}>$4.99/week — billed monthly at $19.96</strong>
        </p>
        <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: BLUE }}>See All →</span>
      </div>
    </div>
  );
}