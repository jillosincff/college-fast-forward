import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

const TABS = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    // SVG: clipboard (active = filled blue, inactive = outline gray)
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2563eb' : 'none'} stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        {active ? null : <line x1="12" y1="11" x2="12" y2="17" />}
        {active ? null : <line x1="9" y1="14" x2="15" y2="14" />}
      </svg>
    ),
  },
  {
    id: 'assets',
    label: 'Assets',
    // SVG: file-text (active = filled purple, inactive = outline gray)
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#7c3aed' : 'none'} stroke={active ? '#7c3aed' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        {!active && <line x1="16" y1="13" x2="8" y2="13" />}
        {!active && <line x1="16" y1="17" x2="8" y2="17" />}
        {!active && <polyline points="10 9 9 9 8 9" />}
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    // SVG: message-circle (active = filled blue, inactive = outline gray)
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2563eb' : 'none'} stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div
      className="premium-mobile-bottom-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 20px 12px',
        gap: 0,
        boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
        zIndex: 999,
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        const activeColor = id === 'assets' ? '#7c3aed' : '#2563eb';
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 12,
              transition: 'background 0.15s',
              position: 'relative',
            }}
          >
            {/* Active indicator dot above icon */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 2,
                width: 20,
                height: 3,
                borderRadius: 100,
                background: activeColor,
                boxShadow: `0 0 8px ${activeColor}99`,
              }} />
            )}
            <Icon active={isActive} />
            <span style={{
              fontFamily: dm,
              fontSize: 10,
              fontWeight: isActive ? 800 : 600,
              color: isActive ? activeColor : '#9ca3af',
              transition: 'color 0.15s',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}