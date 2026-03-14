import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'parents', label: 'Parents' },
  { key: 'alumni', label: 'Alumni' },
];

export default function MessageFilterTabs({ active, onChange }) {
  return (
    <div className="msg-filter-tabs" style={{
      display: 'flex', gap: 6, marginBottom: 16,
      animation: 'msgFadeUp 0.4s ease 0.05s both',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: isActive ? 500 : 400,
            color: isActive ? '#fff' : '#888',
            background: isActive ? '#E85D20' : '#fff',
            border: `0.5px solid ${isActive ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
            transition: 'all 0.15s', minHeight: 'auto', width: 'auto', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = '#E85D20'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#888'; } }}
          >{tab.label}</button>
        );
      })}

      <style>{`
        @media(max-width:768px) {
          .msg-filter-tabs { overflow-x: auto; white-space: nowrap; -ms-overflow-style: none; scrollbar-width: none; }
          .msg-filter-tabs::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}