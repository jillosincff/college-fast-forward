import { Home, Wrench, TrendingUp, User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const TABS = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'tools', label: 'CLIFF Toolbox', Icon: Wrench },
  { id: 'progress', label: 'Application History', Icon: TrendingUp },
];

const ALL_TABS = [...TABS, { id: 'profile', label: 'Profile', Icon: User }];

export default function DashboardBottomNav({ activeTab, onTabChange }) {
  const handleTabClick = (tabId) => {
    if (tabId === 'profile') { navigate('Profile'); return; }
    // Unified tracker: the Application Tracker tab always opens the real tracker page
    if (tabId === 'progress') { navigate('ApplicationTracker'); return; }
    onTabChange(tabId);
  };

  return (
    <>
      {/* Top tabs — ALWAYS visible on all screen sizes */}
      {/* Four labelled tabs are far wider than a phone screen. Body has
          overflow-x:hidden, so on mobile the last tabs (incl. Profile) were
          clipped and unreachable — make the row horizontally scrollable. */}
      <div className="scrollbar-hide" style={{
        display: 'flex',
        gap: 0,
        borderBottom: '2px solid #e5e7eb',
        background: '#fff',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 12px',
        position: 'sticky',
        top: 56,
        zIndex: 90,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {ALL_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                color: isActive ? '#4F46E5' : '#6b7280',
                fontFamily: dm,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 44,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
}