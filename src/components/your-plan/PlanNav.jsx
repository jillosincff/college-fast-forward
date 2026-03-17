import React, { useState, useRef, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { User, FileText, MessageSquare, LayoutDashboard, LogOut, TestTube, Zap, Briefcase, Mail, Users } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const NAV_LINKS = [
  { label: 'Your Plan', page: 'Dashboard', icon: LayoutDashboard },
  { label: 'Directory', page: 'GatorDirectory', icon: Users },
  { label: 'Pipeline', page: 'MyApplications', icon: Briefcase },
  { label: 'Messages', page: 'MyMessages', icon: Mail },
  { label: 'FASTIQ', page: 'FastIQ', icon: Zap },
];

export default function PlanNav({ user, currentPage = 'Dashboard' }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const fullName = user?.full_name || user?.email || '??';
  let initials = '??';
  if (fullName.includes(',')) {
    const parts = fullName.split(',').map(s => s.trim());
    initials = ((parts[1]?.[0] || '') + (parts[0]?.[0] || '')).toUpperCase();
  } else {
    initials = fullName.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  }

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#0B0B0F', height: 56,
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid #23252B',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <button onClick={() => navigate('Dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#f4f0e8',
          display: 'flex', alignItems: 'center', minHeight: 'auto', width: 'auto',
        }}>
          <span>C</span><span style={{ color: '#E85D20' }}>FF</span>
        </button>

        <div className="hidden md:flex" style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
          {NAV_LINKS.map(l => {
            const active = l.page === currentPage;
            return (
              <button key={l.page} onClick={() => navigate(l.page)} style={{
                background: active ? 'rgba(255,255,255,0.06)' : 'none',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                padding: '6px 14px',
                fontFamily: dmSans, fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#23252B',
            border: '1px solid #33363D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          }}>
            {initials}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 40, right: 0, zIndex: 200,
              background: '#1A1C22', borderRadius: 12, padding: '6px 0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)', border: '1px solid #2A2D35',
              minWidth: 200,
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #2A2D35' }}>
                <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', display: 'block' }}>
                  {fullName.includes(',') ? fullName.split(',').reverse().map(s => s.trim()).join(' ') : fullName}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.35)' }}>{user?.email}</span>
              </div>
              {[
                { icon: User, label: 'Profile', page: 'Profile' },
                { icon: Briefcase, label: 'My Pipeline', page: 'MyApplications' },
                { icon: FileText, label: 'My Requests', page: 'MyRequests' },
                { icon: MessageSquare, label: 'My Messages', page: 'MyMessages' },
              ].map(item => (
                <button key={item.page} onClick={() => { navigate(item.page); setMenuOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.7)',
                  transition: 'background 0.15s', minHeight: 'auto', textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <item.icon size={15} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: '#2A2D35', margin: '4px 0' }} />
              {user?.roles?.includes('admin') && (
                <>
                  {[
                    { icon: User, label: 'Admin Setup', page: 'AdminSetup', color: '#E85D20' },
                    { icon: LayoutDashboard, label: 'Admin Dashboard', page: 'AdminDashboard', color: '#7c3aed' },
                    { icon: TestTube, label: 'Testing', page: 'TestingDashboard', color: '#2563eb' },
                  ].map(item => (
                    <button key={item.page} onClick={() => { navigate(item.page); setMenuOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: item.color,
                      minHeight: 'auto', textAlign: 'left',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <item.icon size={15} style={{ flexShrink: 0 }} /> {item.label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: '#2A2D35', margin: '4px 0' }} />
                </>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#ef4444',
                minHeight: 'auto', textAlign: 'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <LogOut size={15} style={{ flexShrink: 0 }} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          minHeight: 'auto', width: 'auto', padding: 0,
        }}>
          {mobileOpen ? <span style={{ fontSize: 20 }}>✕</span> : <span style={{ fontSize: 18 }}>☰</span>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          background: '#0B0B0F', borderTop: '1px solid #23252B',
          padding: '8px 0', zIndex: 99,
        }}>
          {NAV_LINKS.map(l => {
            const active = l.page === currentPage;
            return (
              <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 32px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 14, fontWeight: active ? 500 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                minHeight: 'auto',
              }}>
                {l.label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`@media(max-width:768px) { nav { padding: 0 16px !important; } }`}</style>
    </nav>
  );
}