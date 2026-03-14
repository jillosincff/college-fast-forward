import React, { useState, useRef, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Menu, X, User, FileText, MessageSquare, LayoutDashboard, LogOut, Trash2, TestTube } from 'lucide-react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const NAV_LINKS = [
  { label: 'Dashboard', page: 'Dashboard' },
  { label: 'Ask the Network', page: 'Connections' },
  { label: 'Directory', page: 'GatorDirectory' },
  { label: 'Messages', page: 'MyMessages' },
  { label: 'Pipeline', page: 'MyApplications' },
];

export default function DashboardNav({ user, currentPage = 'Dashboard' }) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Compute initials: handle "Last, First" format
  const fullName = user?.full_name || user?.email || '??';
  let initials = '??';
  if (fullName.includes(',')) {
    // "Osinoff, Lindsey M." → first = "Lindsey", last = "Osinoff"
    const parts = fullName.split(',').map(s => s.trim());
    const first = parts[1]?.split(/\s+/)[0] || '';
    const last = parts[0] || '';
    initials = ((first[0] || '') + (last[0] || '')).toUpperCase();
  } else {
    initials = fullName.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#0d1117', height: 56,
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <button onClick={() => navigate('Dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#f4f0e8',
          letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 0,
          minHeight: 'auto', width: 'auto',
        }}>
          <span style={{ color: '#f4f0e8' }}>C</span>
          <span style={{ color: '#E85D20' }}>FF</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 24, display: 'flex', alignItems: 'center' }}>
          {NAV_LINKS.map(l => {
            const active = l.page === currentPage || l.label === currentPage;
            return (
              <button key={l.page} onClick={() => navigate(l.page)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: dmSans, fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? '#f4f0e8' : 'rgba(244,240,232,0.45)',
                transition: 'color 0.15s', minHeight: 'auto', width: 'auto',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(244,240,232,0.8)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(244,240,232,0.45)'; }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* FASTIQ pill */}
        <button onClick={() => navigate('FastIQ')} style={{
          background: 'rgba(232,93,32,0.12)', border: '0.5px solid rgba(232,93,32,0.3)',
          borderRadius: 100, padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
          cursor: 'pointer', transition: 'background 0.15s', minHeight: 'auto', width: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.12)'; }}
        >
          <span className="fastiq-pulse-dot" style={{
            width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', flexShrink: 0,
          }} />
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20', whiteSpace: 'nowrap' }}>
            FASTIQ™ Active
          </span>
        </button>

        {/* Avatar + Dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#E85D20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
            border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          }}>
            {initials}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 40, right: 0, zIndex: 200,
              background: '#fff', borderRadius: 12, padding: '6px 0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)',
              minWidth: 200,
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', display: 'block' }}>
                  {fullName.includes(',') ? fullName.split(',').reverse().map(s => s.trim()).join(' ') : fullName}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa' }}>{user?.email}</span>
              </div>
              {[
                { icon: User, label: 'Profile', page: 'Profile' },
                { icon: FileText, label: 'My Pipeline', page: 'MyApplications' },
                { icon: FileText, label: 'My Requests', page: 'MyRequests' },
                { icon: MessageSquare, label: 'My Messages', page: 'MyMessages' },

              ].map(item => (
                <button key={item.page} onClick={() => { navigate(item.page); setMenuOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#1a1a1a',
                  transition: 'background 0.15s', minHeight: 'auto', textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <item.icon size={15} style={{ color: '#888', flexShrink: 0 }} />
                  {item.label}
                </button>
              ))}

              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

              {user?.roles?.includes('admin') && (
                <>
                  <button onClick={() => { navigate('AdminSetup'); setMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
                    minHeight: 'auto', textAlign: 'left',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <User size={15} style={{ flexShrink: 0 }} /> Admin Setup
                  </button>
                  <button onClick={() => { navigate('AdminDashboard'); setMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#7c3aed',
                    minHeight: 'auto', textAlign: 'left',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <LayoutDashboard size={15} style={{ flexShrink: 0 }} /> Admin Dashboard
                  </button>
                  <button onClick={() => { navigate('TestingDashboard'); setMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#2563eb',
                    minHeight: 'auto', textAlign: 'left',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <TestTube size={15} style={{ flexShrink: 0 }} /> Testing Dashboard
                  </button>
                  <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
                </>
              )}

              <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#e53935',
                minHeight: 'auto', textAlign: 'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <LogOut size={15} style={{ flexShrink: 0 }} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#f4f0e8',
          minHeight: 'auto', width: 'auto', padding: 0,
        }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          background: '#0d1117', borderTop: '0.5px solid rgba(255,255,255,0.08)',
          padding: '8px 0', zIndex: 99,
        }}>
          {NAV_LINKS.map(l => {
            const mActive = l.page === currentPage || l.label === currentPage;
            return (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 32px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 14, fontWeight: mActive ? 500 : 400,
              color: mActive ? '#f4f0e8' : 'rgba(244,240,232,0.45)',
              minHeight: 'auto',
            }}>
              {l.label}
            </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fastiqPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fastiq-pulse-dot { animation: fastiqPulse 2s ease-in-out infinite; }
        @media(max-width:768px) {
          nav { padding: 0 16px !important; }
        }
      `}</style>
    </nav>
  );
}