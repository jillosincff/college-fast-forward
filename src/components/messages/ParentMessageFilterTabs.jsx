import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'direct', label: 'Direct Messages' },
  { key: 'intros', label: "Intros I've Made" },
];

export default function ParentMessageFilterTabs({ active, onChange }) {
  return (
    <div className="pmsg-filter-tabs" style={{
      display: 'flex', gap: 8, marginBottom: 20,
      animation: 'pmsgFadeUp 0.4s ease 0.05s both',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: isActive ? 600 : 400,
            color: isActive ? '#fff' : '#888',
            background: isActive ? ORANGE : 'transparent',
            border: `1px solid ${isActive ? ORANGE : '#555'}`,
            borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
            transition: 'all 0.15s', minHeight: 'auto', width: 'auto', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#888'; } }}
          >{tab.label}</button>
        );
      })}

      <style>{`
        @media(max-width:768px) {
          .pmsg-filter-tabs { overflow-x: auto; white-space: nowrap; -ms-overflow-style: none; scrollbar-width: none; }
          .pmsg-filter-tabs::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}