const dm = "'DM Sans', system-ui, sans-serif";

import { base44 } from '@/api/base44Client';

export default function FreeTierNav({ user, onUpgrade }) {
  const isPremium = user?.fastiq_active || user?.membership_tier === 'premium';
  
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            <span>College </span><span style={{ color: '#2563eb' }}>Fast Forward</span>
          </div>
          {isPremium ? (
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 100, padding: '3px 12px', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>Sprint Active</span>
          ) : (
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 100, padding: '3px 10px' }}>Free</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <span style={{ fontFamily: dm, fontSize: 13, color: '#6b7280' }}>
              {user.full_name || user.email}
            </span>
          )}
          {!isPremium && (
            <button
              onClick={onUpgrade}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
            >
              ⚡ Upgrade
            </button>
          )}
          <button
            onClick={() => base44.auth.logout()}
            style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#6b7280', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', minHeight: 'auto' }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}