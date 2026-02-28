import React, { useMemo } from 'react';
import { LayoutDashboard, MessageSquare, Users, Mail, Zap } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function MobileBottomNav({ user, currentPage }) {
  const effectivePersona = user?.email?.toLowerCase().endsWith('@ufl.edu')
    ? 'gator'
    : user?.persona;

  const getDashboardPage = () => {
    if (user?.roles?.includes('admin')) return 'AdminDashboard';
    if (effectivePersona === 'parent' || user?.roles?.includes('parent')) return 'ParentDashboard';
    if (effectivePersona === 'alumni' || user?.roles?.includes('alumni'))
      return user?.alumni_intent === 'help_students' ? 'ParentDashboard' : 'AlumniDashboard';
    return 'Dashboard';
  };

  const tabs = useMemo(() => [
    { name: 'Home', icon: LayoutDashboard, page: getDashboardPage() },
    { name: 'Community', icon: MessageSquare, page: 'Connections' },
    { name: 'Fast Track', icon: Zap, page: 'FastTrackPro' },
    { name: 'Directory', icon: Users, page: 'GatorDirectory' },
    { name: 'Messages', icon: Mail, page: 'MyMessages' },
  ], [user]);

  const isActive = (tabPage) => {
    if (tabPage === 'Dashboard' || tabPage === 'ParentDashboard' || tabPage === 'AlumniDashboard' || tabPage === 'AdminDashboard') {
      return ['Dashboard', 'ParentDashboard', 'AlumniDashboard', 'AdminDashboard'].includes(currentPage);
    }
    return currentPage === tabPage;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden safe-area-bottom mobile-bottom-nav"
      style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.page);
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.page)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors"
              style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${active ? 'text-[#0021A5]' : 'text-slate-400'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium leading-tight ${active ? 'text-[#0021A5]' : 'text-slate-400'}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}