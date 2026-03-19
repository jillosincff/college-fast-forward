import React, { useState, useRef, useEffect } from 'react';
import { Home, Building2, Map, GraduationCap, Target, Users, MessageSquare, Settings, LogOut, Lock } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'company_intel', icon: Building2, label: 'Company Intel' },
  { id: 'career_path', icon: Map, label: 'Career Path Research' },
  { id: 'career_center', icon: GraduationCap, label: 'Career Center' },
  { id: 'career_goals', icon: Target, label: 'Career Goals' },
  { id: 'alumni_network', icon: Users, label: 'Alumni Network' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
];

export default function FreeTierSidebar({ user, activeTab, onTabChange, onOpenUpgrade }) {
  const firstName = user?.full_name?.split(' ')[0] || 'Student';
  const university = user?.school || user?.university || 'UF';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="w-60 h-full bg-white border-r border-[#E0E0E0] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
          alt="CFF"
          className="h-12 w-auto mb-3"
        />
        <p className="text-xs text-[#666666]">{firstName} · {university}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#FFF5F0] text-[#E85D20] border-l-3 border-[#E85D20]'
                  : 'text-[#666666] hover:bg-[#F5F5F5]'
              }`}
              style={{ minHeight: 'auto', borderLeftWidth: isActive ? '3px' : '0' }}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#E85D20]' : 'text-[#999999]'}`} />
              {item.label}
            </button>
          );
        })}

        {/* FastIQ Locked Item */}
        <button
          onClick={onOpenUpgrade}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#E85D20] hover:bg-[#FFF5F0] transition-all mt-4"
          style={{ minHeight: 'auto' }}
        >
          <Lock className="w-4 h-4 text-[#E85D20]" />
          <span className="flex-1 text-left">FastIQ</span>
          <span className="px-2 py-0.5 bg-[#E85D20] text-white text-[9px] font-bold rounded-full uppercase">
            Upgrade
          </span>
        </button>
      </nav>

      {/* Footer — Avatar popover */}
      <div className="p-4 border-t border-[#E0E0E0]" ref={menuRef}>
        {showMenu && (
          <div style={{
            position: 'absolute', bottom: 72, left: 12, width: 180,
            background: '#1E1E1E', border: '1px solid #2A2A2A',
            borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            overflow: 'hidden', zIndex: 100,
          }}>
            <button
              onClick={() => { navigate('ProfileEdit'); setShowMenu(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, minHeight: 'auto' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Settings style={{ width: 14, height: 14, color: '#888' }} /> Settings
            </button>
            <button
              onClick={() => base44.auth.logout()}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, minHeight: 'auto' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LogOut style={{ width: 14, height: 14, color: '#888' }} /> Sign Out
            </button>
          </div>
        )}
        <button
          onClick={() => setShowMenu(prev => !prev)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', minHeight: 'auto', borderRadius: 8 }}
          className="hover:bg-[#F5F5F5] transition-colors"
        >
          <UserAvatar user={user} className="h-8 w-8" showFallback={true} />
          <p className="text-xs font-medium text-[#1A1A1A]">{firstName}</p>
        </button>
      </div>
    </div>
  );
}