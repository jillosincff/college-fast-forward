import { Home, Wrench, TrendingUp, User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dm = "'DM Sans', system-ui, sans-serif";

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'tools', label: 'Tools', Icon: Wrench },
  { id: 'progress', label: 'Application Tracker', Icon: TrendingUp },
];

const ALL_TABS = [...TABS, { id: 'profile', label: 'Profile', Icon: User }];

export default function DashboardBottomNav({ activeTab, onTabChange }) {
  const handleTabClick = (tabId) => {
    if (tabId === 'profile') { navigate('Profile'); return; }
    onTabChange(tabId);
  };

  return (
    <>
      {/* Top tabs — ALWAYS visible on all screen sizes */}
      <div style={{
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
                minHeight: 'auto',
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