import React, { useState } from 'react';
import { Home, Building2, Target, MessageSquare, Search, Zap, Sparkles, Brain, MoreHorizontal } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'company_intel', label: 'Companies', Icon: Building2 },
  { id: 'alumni_search', label: 'Alumni', Icon: Search },
  { id: 'career_goals', label: 'Goals', Icon: Target },
  { id: 'more', label: 'More', Icon: MoreHorizontal },
];

export default function FreeTierMobileNav({ activeTab, onTabChange, onOpenUpgrade, onOpenConcierge }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setShowMore(false)}
        />
      )}
      {showMore && (
        <div style={{ position: 'fixed', bottom: 65, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E0E0E0', zIndex: 50, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: '⚡ FastIQ Dashboard', action: () => { navigate('FastIQDashboard'); setShowMore(false); } },
            { label: '✨ Career Concierge', action: () => { setShowMore(false); onOpenConcierge?.(); } },
            { label: '🧠 Career Assessment', action: () => { navigate('CareerAssessment'); setShowMore(false); } },
            { label: '💬 Messages', action: () => { onTabChange('messages'); setShowMore(false); } },
            { label: '📓 Notebook', action: () => { onTabChange('notebook'); setShowMore(false); } },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{ background: 'none', border: 'none', textAlign: 'left', padding: '14px 8px', fontSize: 15, fontWeight: 500, color: '#1A1A1A', cursor: 'pointer', borderBottom: '1px solid #F5F5F5', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] safe-area-bottom z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const handleClick = () => {
              if (item.id === 'more') { setShowMore(p => !p); return; }
              setShowMore(false);
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
    </>
  );
}