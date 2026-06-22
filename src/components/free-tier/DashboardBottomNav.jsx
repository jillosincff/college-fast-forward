import { Home, Wrench, TrendingUp, User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dm = "'DM Sans', system-ui, sans-serif";

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'tools', label: 'Tools', Icon: Wrench },
  { id: 'progress', label: 'Progress', Icon: TrendingUp },
];

export default function DashboardBottomNav({ activeTab, onTabChange }) {
  const allTabs = [...TABS, { id: 'profile', label: 'Profile', Icon: User }];

  return (
    <>
      {/* Desktop top tabs */}
      <div className="hidden md:flex" style={{
        gap: 2, borderBottom: '1px solid #e5e7eb', marginBottom: 0,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 20px', background: 'none', border: 'none',
                borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                color: isActive ? '#4F46E5' : '#6b7280',
                fontFamily: dm, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                minHeight: 'auto', transition: 'color 0.15s',
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile bottom nav */}
      <div className="flex md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        padding: '8px 8px', paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        gap: 4, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 999,
      }}>
        {allTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const { Icon } = tab;
          const handleClick = () => {
            if (tab.id === 'profile') { navigate('Profile'); return; }
            onTabChange(tab.id);
          };
          return (
            <button
              key={tab.id}
              onClick={handleClick}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 4px', minHeight: 'auto', minWidth: 'auto', borderRadius: 8,
                color: isActive ? '#4F46E5' : '#6b7280',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.75} color={isActive ? '#4F46E5' : '#9ca3af'} />
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#4F46E5' : '#9ca3af' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}