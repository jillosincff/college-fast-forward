const dm = "'DM Sans', system-ui, sans-serif";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import EditGoalsModal from './EditGoalsModal';

export default function FreeTierNav({ user, onUpgrade, onGoalsUpdated, navRef }) {
  const { logout } = useAuth();
  const isPremium = user?.fastiq_active || user?.membership_tier === 'premium';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const dropRef = useRef(null);

  // Expose openDropdown via navRef so external elements (e.g. Active Profile pill) can trigger it
  useEffect(() => {
    if (navRef) navRef.current = { openDropdown: () => setDropdownOpen(true) };
  }, [navRef]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 12px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              <span>C</span><span style={{ color: '#2563eb' }}>FF</span>
              <span className="nav-full-name" style={{ display: 'none' }}><span> ollege </span><span style={{ color: '#2563eb' }}>Fast Forward</span></span>
            </div>
            <style>{`@media(min-width:480px){.nav-full-name{display:inline !important}.nav-cff-abbr{display:none !important}}`}</style>
            {isPremium ? (
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 100, padding: '3px 8px', whiteSpace: 'nowrap' }}>⚡ Active</span>
            ) : (
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 100, padding: '3px 8px', whiteSpace: 'nowrap' }}>Free</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user && (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(p => !p)}
                  style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', maxWidth: 130, overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>▾</span>
                </button>
                {dropdownOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 220, zIndex: 200, overflow: 'hidden' }}>
                    <button
                      onClick={() => { setDropdownOpen(false); setShowGoalsModal(true); }}
                      style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      🎯 Update Career Goals
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('ProfileEdit'); }}
                      style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      👤 Edit Profile
                    </button>

                    {/* ── Resume Management Section ── */}
                    <div style={{ padding: '8px 16px 4px', borderTop: '1px solid #f3f4f6' }}>
                      <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Resume Management</p>
                    </div>
                    {/* Active file display */}
                    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: 14 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.resume_filename || 'Master_Resume.pdf'}
                        </p>
                        <p style={{ fontFamily: dm, fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 600 }}>🟢 98% ATS Optimized</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); /* download resume */ if (user?.resume_url) window.open(user.resume_url, '_blank'); else alert('No resume on file. Upload one in your profile.'); }}
                      style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '11px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      ⬇️ Download File
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('ResumeTailoring'); }}
                      style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '11px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      🔄 Swap / Update File
                    </button>
                    {/* ── End Resume Management ── */}

                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      style={{ fontFamily: dm, fontSize: 13, color: '#ef4444', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {!isPremium && (
              <button
                onClick={onUpgrade}
                style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', boxShadow: '0 2px 8px rgba(37,99,235,0.25)', whiteSpace: 'nowrap' }}
              >
                ⚡ Upgrade
              </button>
            )}
          </div>
        </div>
      </header>
      {showGoalsModal && (
        <EditGoalsModal
          goals={user?.career_goals}
          user={user}
          onClose={() => setShowGoalsModal(false)}
          onSave={(updated) => { onGoalsUpdated?.(updated); setShowGoalsModal(false); }}
        />
      )}
    </>
  );
}