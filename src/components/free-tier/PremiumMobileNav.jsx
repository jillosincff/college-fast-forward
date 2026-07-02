import { useState } from 'react';
import PremiumHiringChat from './PremiumHiringChat';
import { navigate } from '@/components/utils/navigation';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const TABS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'pipeline',
    label: 'Tracker',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'cliff',
    label: 'CliFF',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9 10h.01" />
        <path d="M13 10h.01" />
        <path d="M17 10h.01" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: ({ active }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function PremiumMobileNav({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCliff, setShowCliff] = useState(false);

  const handleTabClick = (tabKey) => {
    if (tabKey === 'pipeline') {
      // Open the same Application Tracker view as the top tab
      setActiveTab('pipeline');
      window.dispatchEvent(new CustomEvent('cff:switch-dashboard-tab', { detail: 'progress' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabKey === 'cliff') {
      setShowCliff(true);
      setActiveTab('cliff');
    } else if (tabKey === 'profile') {
      navigate('Profile');
    } else {
      setActiveTab(tabKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile-only: hidden on desktop */}
      <style>{`
        .premium-mobile-nav-root { display: none; }
        @media (max-width: 768px) {
          .premium-mobile-nav-root { display: block; }
        }
      `}</style>

      <div className="premium-mobile-nav-root">
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
                    width: 'auto',
                  }}
                >
                  {tab.icon({ active: isActive })}
                  <span style={{
                    fontFamily: dm,
                    fontSize: 10,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#6d28d9' : '#9ca3af',
                    transition: 'color 0.15s',
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-screen CliFF chat overlay */}
        {showCliff && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#f8f9fc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>🤖 CliFF — Your Career Agent</p>
              <button
                onClick={() => { setShowCliff(false); setActiveTab('dashboard'); }}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '6px 14px', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: 12, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', display: 'flex', flexDirection: 'column' }}>
              <PremiumHiringChat user={user} selectedSignal={null} selectedJob={null} fullHeight />
            </div>
          </div>
        )}
      </div>
    </>
  );
}