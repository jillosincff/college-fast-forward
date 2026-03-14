import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { Menu, X } from 'lucide-react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const NAV_LINKS = [
  { label: 'Dashboard', page: 'Dashboard' },
  { label: 'Community', page: 'Connections' },
  { label: 'Directory', page: 'GatorDirectory' },
  { label: 'Messages', page: 'MyMessages' },
  { label: 'Opportunities', page: 'Opportunities' },
];

export default function DashboardNav({ user, currentPage = 'Dashboard' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (user?.full_name || user?.email || '??')
    .split(/[\s@]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

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
            const active = l.page === currentPage;
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

        {/* Avatar */}
        <button onClick={() => navigate('Profile')} style={{
          width: 32, height: 32, borderRadius: '50%', background: '#E85D20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
          border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
        }}>
          {initials}
        </button>

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
          {NAV_LINKS.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 32px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 14, fontWeight: l.page === currentPage ? 500 : 400,
              color: l.page === currentPage ? '#f4f0e8' : 'rgba(244,240,232,0.45)',
              minHeight: 'auto',
            }}>
              {l.label}
            </button>
          ))}
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