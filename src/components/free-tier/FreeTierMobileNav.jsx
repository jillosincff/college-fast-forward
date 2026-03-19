import React from 'react';
import { Home, Building2, Target, Users, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'company_intel', icon: Building2, label: 'Intel' },
  { id: 'career_goals', icon: Target, label: 'Goals' },
  { id: 'alumni_network', icon: Users, label: 'Alumni' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
];

export default function FreeTierMobileNav({ activeTab, onTabChange, onOpenUpgrade }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 min-w-0"
              style={{ minHeight: 'auto' }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E85D20]' : 'text-[#999999]'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#E85D20]' : 'text-[#666666]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}