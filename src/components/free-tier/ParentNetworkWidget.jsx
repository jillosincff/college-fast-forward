import { useState } from 'react';
import ParentUnlockModal from './ParentUnlockModal';

const dm = "'DM Sans', system-ui, sans-serif";

const SAMPLE_PARENTS = [
  { role: 'Director of Marketing', grad: "'27" },
  { role: 'VP of Operations', grad: "'25" },
];

// Simple overlapping avatar cluster
function AvatarCluster() {
  const colors = ['#0021A5', '#FA4616', '#16a34a'];
  const initials = ['J', 'M', 'R'];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {colors.map((c, i) => (
        <div
          key={i}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: c,
            border: '2px solid #fff',
            marginLeft: i === 0 ? 0 : -10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff',
            zIndex: 3 - i,
            position: 'relative',
          }}
        >
          {initials[i]}
        </div>
      ))}
      {/* Pulsing online dot */}
      <div style={{ marginLeft: 8, position: 'relative', width: 10, height: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: '#22c55e',
          position: 'absolute',
          boxShadow: '0 0 0 0 rgba(34,197,94,0.4)',
          animation: 'pulse-green 1.8s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}

export default function ParentNetworkWidget({ onUnlock, college, theme }) {
  const t = theme || { primary: '#1E293B', secondary: '#475569', bgTint: 'rgba(30,41,59,0.03)' };
  const shortName = t.shortName || college || 'Campus';
  const [showModal, setShowModal] = useState(false);

  const handleUnlock = () => setShowModal(true);

  return (
    <>
    {showModal && (
      <ParentUnlockModal
        onClose={() => setShowModal(false)}
        theme={t}
        college={college}
      />
    )}
    <div
      onClick={handleUnlock}
      style={{
        background: '#fff',
        border: `1px solid ${t.primary}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${t.primary}22`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
    >
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${t.bgTint}, rgba(255,255,255,0.9))`, padding: '16px 20px', borderBottom: `1px solid ${t.primary}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: t.primary, background: t.bgTint, border: `1px solid ${t.primary}44`, borderRadius: 100, padding: '3px 10px' }}>
            🤝 CAMPUS FAMILIES
          </span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: '#22c55e', borderRadius: 100, padding: '3px 10px' }}>
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>
            The <span style={{ color: t.primary }}>{shortName}</span> Parent Network
          </p>
          <AvatarCluster />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
          <strong style={{ color: t.primary }}>247 {shortName} Parents</strong> are active in our system this week — executives, managers, and directors who have <em>volunteered</em> to bypass HR filters for students from your school.
        </p>

        {/* Blurred role rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Roles Today</p>
          {SAMPLE_PARENTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.bgTint, borderRadius: 10, padding: '8px 12px' }}>
              {/* Blurred logo placeholder */}
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${t.primary}22`, filter: 'blur(3px)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{p.role}</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>Parent of {p.grad}</p>
              </div>
              <div style={{ width: 40, height: 12, background: '#e5e7eb', borderRadius: 4, filter: 'blur(4px)' }} />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          style={{
            width: '100%',
            fontFamily: dm,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`,
            border: 'none',
            borderRadius: 12,
            padding: '11px 0',
            cursor: 'pointer',
            minHeight: 'auto',
            letterSpacing: '0.01em',
          }}
          onClick={e => { e.stopPropagation(); handleUnlock(); }}
        >
          ⚡ Unlock Parent Introductions
        </button>
      </div>
    </div>
    </>
  );
}