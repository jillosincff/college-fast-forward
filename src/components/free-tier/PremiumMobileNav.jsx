import { useState } from 'react';
import PipelineKanbanModal from './PipelineKanbanModal';

const dm = "'DM Sans', system-ui, sans-serif";

const TABS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D20' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'pipeline',
    label: 'Pipeline',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D20' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h7v7H3z" />
        <path d="M14 3h7v7h-7z" />
        <path d="M14 14h7v7h-7z" />
        <path d="M3 14h7v7H3z" />
      </svg>
    ),
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D20' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D20' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function PremiumMobileNav({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showKanban, setShowKanban] = useState(false);

  const handleTabClick = (tabKey) => {
    if (tabKey === 'pipeline') {
      setShowKanban(true);
      setActiveTab('pipeline');
    } else {
      setActiveTab(tabKey);
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  minWidth: 64,
                }}
              >
                {tab.icon({ active: isActive })}
                <span style={{
                  fontFamily: dm,
                  fontSize: 10,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#E85D20' : '#9ca3af',
                  transition: 'color 0.15s',
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showKanban && (
        <PipelineKanbanModal
          isOpen={showKanban}
          onClose={() => {
            setShowKanban(false);
            setActiveTab('dashboard');
          }}
          user={user}
        />
      )}
    </>
  );
}