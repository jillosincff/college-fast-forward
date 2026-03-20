import React from 'react';
import { Home, Building2, Users, Target, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'company_intel', label: 'Companies', Icon: Building2 },
  { id: 'directory', label: 'Directory', Icon: Users },
  { id: 'career_goals', label: 'Goals', Icon: Target },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
];

export default function FreeTierMobileNav({ activeTab, onTabChange, onOpenUpgrade, onOpenConcierge }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          const handleClick = () => {
            if (item.id === 'career_concierge') { onOpenConcierge && onOpenConcierge(); return; }
            if (item.id === 'fastiq') { onOpenUpgrade && onOpenUpgrade(); return; }
            onTabChange(item.id);
          };
          const { Icon } = item;
          return (
            <button
              key={item.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-1 px-3 py-2 min-w-0 relative"
              style={{ minHeight: 'auto' }}
            >
              <Icon size={24} strokeWidth={1.75} color={isActive ? '#E85D20' : '#888888'} />
              <span style={{ fontSize: 10, fontWeight: 500, color: isActive ? '#E85D20' : '#888888' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}