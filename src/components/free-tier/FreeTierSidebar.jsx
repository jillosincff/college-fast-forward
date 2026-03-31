import React, { useState, useRef, useEffect } from 'react';
import { Home, Building2, Map, GraduationCap, Target, Users, MessageSquare, Settings, LogOut, Lock, Sparkles, Zap, FileText, Mic, Linkedin, BookOpen, Search } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const FREE_NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'fastiq', icon: Zap, label: 'FastIQ Dashboard', isPage: true, page: 'FastIQDashboard' },
  { id: 'company_intel', icon: Building2, label: 'Company Intel' },
  { id: 'alumni_search', icon: Search, label: 'Alumni Search' },
  { id: 'career_goals', icon: Target, label: 'Career Goals' },
  { id: 'resume', icon: FileText, label: 'Resume', isPage: true, page: 'ResumeTailoring' },
  { id: 'career_path', icon: Map, label: 'Career Path Research' },
  { id: 'career_center', icon: GraduationCap, label: 'Career Center' },
  { id: 'directory', icon: Users, label: 'CFF Connections' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
];

const CONCIERGE_SUBTABS = [
  { id: 'resumes', icon: FileText, label: 'Résumés & Cover Letters' },
  { id: 'mock_interviews', icon: Mic, label: 'Mock Interviews' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn Profile Review' },
];

export default function FreeTierSidebar({ user, activeTab, onTabChange, onOpenUpgrade, onOpenConcierge }) {
  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const firstName = user?.full_name?.split(' ')[0] || 'Student';
  const university = user?.school || user?.university || 'UF';
  const [showMenu, setShowMenu] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [notebookCount, setNotebookCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.NotebookEntry.filter({ user_email: user.email }, '-saved_at', 200)
      .then(data => setNotebookCount((data || []).length))
      .catch(() => {});
  }, [user?.email]);

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
        {FREE_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.isPage ? navigate(item.page) : onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all"
              style={{
                minHeight: 'auto',
                background: 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid #E85D20' : '3px solid transparent',
                color: isActive ? '#E85D20' : '#666666',
                cursor: 'pointer',
              }}
            >
              <Icon style={{ width: 16, height: 16, color: isActive ? '#E85D20' : '#999999', flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}

        {/* Divider + upgrade label */}
        <div style={{ margin: '12px 4px 8px' }}>
          <div style={{ height: 1, background: '#E0E0E0', marginBottom: 8 }} />
          {!isFastIQ && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#BBBBBB', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, paddingLeft: 4 }}>UNLOCK WITH FASTIQ</p>}
          {isFastIQ && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, paddingLeft: 4 }}>FASTIQ FEATURES</p>}
        </div>

        {/* Career Concierge item + subtabs */}
        <button
          onClick={() => { setConciergeOpen(p => !p); if (!isFastIQ) onOpenConcierge?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:bg-[#FFF5F0]"
          style={{ minHeight: 'auto', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', color: '#666666', cursor: 'pointer' }}
        >
          <Sparkles style={{ width: 16, height: 16, color: '#999999', flexShrink: 0 }} />
          <div className="flex-1 text-left">
            <div>Career Concierge</div>
            {!conciergeOpen && <div style={{ fontSize: 10, color: '#BBBBBB', fontWeight: 400, marginTop: 1 }}>Resume · Interviews · LinkedIn</div>}
          </div>
          {!isFastIQ && <span style={{ padding: '2px 7px', background: '#E85D20', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upgrade</span>}
          <span style={{ fontSize: 10, color: '#BBBBBB', marginLeft: !isFastIQ ? 0 : 'auto' }}>{conciergeOpen ? '▲' : '▼'}</span>
        </button>
        {conciergeOpen && (
          <div style={{ marginLeft: 16 }}>
            {CONCIERGE_SUBTABS.map(sub => {
              const Icon = sub.icon;
              const pageMap = { resumes: 'ResumeTailoring', mock_interviews: 'MockInterview', linkedin: 'LinkedInReview' };
              return (
                <button
                  key={sub.id}
                  onClick={() => isFastIQ ? navigate(pageMap[sub.id] || 'ResumeTailoring') : onOpenConcierge?.()}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#999999] hover:text-[#666] transition-all"
                  style={{ minHeight: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Icon style={{ width: 13, height: 13, color: '#BBBBBB', flexShrink: 0 }} />
                  <span className="flex-1 text-left">{sub.label}</span>
                  {!isFastIQ && <Lock style={{ width: 11, height: 11, color: '#CCCCCC' }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Career Assessment item */}
        <button
          onClick={() => isFastIQ ? navigate('CareerAssessment') : onOpenUpgrade?.()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:bg-[#FFF5F0]"
          style={{ minHeight: 'auto', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', color: '#666666', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1 }}>⚡</span>
          <span className="flex-1 text-left">Career Assessment</span>
          {!isFastIQ && <span style={{ padding: '2px 7px', background: '#E85D20', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upgrade</span>}
        </button>

        {/* FastIQ item */}
        <button
          onClick={() => isFastIQ ? navigate('FastIQ') : onOpenUpgrade?.()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:bg-[#FFF5F0]"
          style={{ minHeight: 'auto', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', color: '#666666', cursor: 'pointer' }}
        >
          <Zap style={{ width: 16, height: 16, color: '#999999', flexShrink: 0 }} />
          <span className="flex-1 text-left">FastIQ</span>
          {!isFastIQ && <span style={{ padding: '2px 7px', background: '#E85D20', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upgrade</span>}
          {isFastIQ && <span style={{ padding: '2px 7px', background: '#22C55E', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>}
        </button>

        {/* Notebook item */}
        <button
          onClick={() => onTabChange('notebook')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:bg-[#FFF5F0]"
          style={{ minHeight: 'auto', background: 'transparent', border: 'none', borderLeft: activeTab === 'notebook' ? '3px solid #E85D20' : '3px solid transparent', color: activeTab === 'notebook' ? '#E85D20' : '#666666', cursor: 'pointer' }}
        >
          <BookOpen style={{ width: 16, height: 16, color: activeTab === 'notebook' ? '#E85D20' : '#999999', flexShrink: 0 }} />
          <span className="flex-1 text-left">Notebook</span>
          {notebookCount > 0 && (
            <span style={{ padding: '1px 7px', background: '#E85D20', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 100 }}>{notebookCount}</span>
          )}
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