import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'company_intel', label: 'Companies', emoji: '🏢' },
  { id: 'career_goals', label: 'Goals', emoji: '🎯' },
  { id: 'career_concierge', label: 'Concierge', emoji: '✨', upgrade: true },
  { id: 'fastiq', label: 'FastIQ', emoji: '⚡', upgrade: true },
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
          return (
            <button
              key={item.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-1 px-3 py-2 min-w-0 relative"
              style={{ minHeight: 'auto' }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.emoji}</span>
              {item.upgrade && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: '#E85D20', borderRadius: '50%' }} />
              )}
              <span style={{ fontSize: 10, fontWeight: 500, color: isActive ? '#E85D20' : '#666666' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}