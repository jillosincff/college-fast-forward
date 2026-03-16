import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import UserAvatar from '../common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, FileText, MessageSquare } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const NAV_ITEMS = [
  { label: 'Dashboard', page: 'RecentGradDashboard' },
  { label: 'Ask the Network', page: 'Connections' },
  { label: 'Directory', page: 'GatorDirectory' },
  { label: 'Messages', page: 'MyMessages' },
];

export default function RGNav({ user, currentPage }) {
  const handleLogout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = '/'; }
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.08)',
      fontFamily: dmSans,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('RecentGradDashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{
            fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.02em',
          }}>CFF</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{ gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentPage === item.page ||
              (item.page === 'RecentGradDashboard' && currentPage === 'Dashboard');
            return (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                style={{
                  fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderBottom: isActive ? '2px solid #E85D20' : '2px solid transparent',
                  transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Avatar + Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999, padding: '4px 12px 4px 4px',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              minHeight: 'auto', width: 'auto',
            }}>
              <UserAvatar user={user} className="h-8 w-8" />
              <span className="hidden sm:inline" style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
              }}>Menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{user?.full_name || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('Profile')}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('MyRequests')}>
              <FileText className="mr-2 h-4 w-4" /> My Requests
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('MyMessages')}>
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden" style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '0 8px', overflowX: 'auto',
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentPage === item.page ||
            (item.page === 'RecentGradDashboard' && currentPage === 'Dashboard');
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 600,
                padding: '10px 12px', border: 'none', background: 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: isActive ? '2px solid #E85D20' : '2px solid transparent',
                whiteSpace: 'nowrap', cursor: 'pointer', minHeight: 'auto', width: 'auto',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}