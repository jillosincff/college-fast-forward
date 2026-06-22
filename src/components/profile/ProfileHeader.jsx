import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const VIOLET = '#7c3aed';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

export default function ProfileHeader({ user, isMyProfile }) {
  const initials = (() => {
    const name = user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'U';
    const parts = name.split(/[\s,]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0] || 'U').slice(0, 2).toUpperCase();
  })();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid rgba(109,40,217,0.10)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: 640, margin: '0 auto', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        {/* Left: Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('FreeTierDashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: FONT, fontSize: 13, fontWeight: 600, color: INDIGO,
            minHeight: 'auto', width: 'auto',
          }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(109,40,217,0.15)' }} />
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Profile
          </span>
        </div>

        {/* Right: Avatar + Edit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMyProfile && (
            <button onClick={() => navigate('ProfileEdit')} style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#fff',
              background: GRAD_INDIGO, border: 'none', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', minHeight: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(109,40,217,0.20)',
            }}>
              <Pencil size={14} /> Edit
            </button>
          )}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: GRAD_INDIGO,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}