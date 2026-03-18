import React, { useState, useRef, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { User, MessageSquare, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

const NAV_LINKS = [
  { label: 'Dashboard', page: 'ParentHome' },
  { label: 'Directory', page: 'GatorDirectory' },
  { label: 'Messages', page: 'MyMessages' },
];

function getInitials(user) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'U';
  const cleaned = name.includes(',') ? name.split(',').reverse().map(s => s.trim()).join(' ') : name;
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}

export default function ParentProfileNav({ user, currentPage = 'Profile' }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const initials = getInitials(user);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <button onClick={() => navigate('ParentHome')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#f4f0e8',
          minHeight: 'auto', width: 'auto', display: 'flex',
        }}>
          <span>C</span><span style={{ color: ORANGE }}>FF</span>
        </button>
        <div className="hidden md:flex" style={{ gap: 24, display: 'flex', alignItems: 'center' }}>
          {NAV_LINKS.map(l => {
            const active = l.page === currentPage || (l.page === 'ParentHome' && currentPage === 'ParentHome');
            return (
              <button key={l.page} onClick={() => navigate(l.page)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 4px', borderBottom: active ? `2px solid ${ORANGE}` : '2px solid transparent',
                fontFamily: dmSans, fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#f4f0e8' : 'rgba(244,240,232,0.45)',
                transition: 'color 0.15s', minHeight: 'auto',
              }}>
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#0d1117',
            border: `2px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
            cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          }}>
            {initials}
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 40, right: 0, zIndex: 200,
              background: '#1A1A1A', borderRadius: 12, padding: '6px 0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)', border: '1px solid #2A2A2A', minWidth: 200,
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #2A2A2A' }}>
                <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', display: 'block' }}>
                  {user?.full_name || user?.email}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 11, color: '#888' }}>{user?.email}</span>
              </div>
              {[
                { label: 'Profile', page: 'Profile' },
                { label: 'Messages', page: 'MyMessages' },
              ].map(item => (
                <button key={item.page} onClick={() => { navigate(item.page); setMenuOpen(false); }} style={{
                  display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: dmSans, fontSize: 13, color: '#ccc', textAlign: 'left', minHeight: 'auto',
                }}>
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: '#2A2A2A', margin: '4px 0' }} />
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 13, color: '#e53935', textAlign: 'left', minHeight: 'auto',
              }}>Logout</button>
            </div>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#f4f0e8', minHeight: 'auto', padding: 0,
        }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden" style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          background: '#0d1117', borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '8px 0', zIndex: 99,
        }}>
          {NAV_LINKS.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 32px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 14, color: 'rgba(244,240,232,0.45)', minHeight: 'auto',
            }}>{l.label}</button>
          ))}
        </div>
      )}

      <style>{`@media(max-width:768px){nav{padding:0 16px !important}}`}</style>
    </nav>
  );
}