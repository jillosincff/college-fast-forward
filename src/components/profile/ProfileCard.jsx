import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

function getInitials(user) {
  const name = user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'U';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}

function formatName(user) {
  if (user?.first_name) return user.first_name;
  if (user?.full_name) {
    if (user.full_name.includes(',')) return user.full_name.split(',').map(s => s.trim()).reverse().join(' ');
    return user.full_name;
  }
  return user?.email?.split('@')[0] || 'User';
}

export default function ProfileCard({ user, parentCompany, isMyProfile }) {
  const displayName = formatName(user);
  const initials = getInitials(user);
  const school = user?.school_name || user?.school || user?.university || '';

  return (
    <div style={{
      background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 20,
    }}>
      {/* Cover */}
      <div style={{ height: 100, background: '#0d1117', position: 'relative', borderRadius: '20px 20px 0 0' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Profile info */}
      <div style={{ padding: '0 28px 24px', marginTop: -32, position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#0d1117',
          border: '3px solid #ffffff', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
        }}>
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#fff' }}>{initials}</span>
          )}
        </div>

        {/* Name row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 12, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h1 style={{
              fontFamily: dmSans, fontWeight: 600, fontSize: 22,
              color: '#1a1a1a', letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.2,
            }}>{displayName}</h1>
            {school && (
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
                {school}
              </p>
            )}
          </div>
          {isMyProfile && (
            <button onClick={() => navigate('ProfileEdit')} style={{
              background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.12)',
              fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a',
              borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
              transition: 'background 0.15s', minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 0.5, background: 'rgba(0,0,0,0.06)', margin: '0 28px' }} />

      {/* Details */}
      <div style={{ padding: '20px 28px 28px' }}>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: '#bbb', display: 'block', marginBottom: 14,
        }}>Details</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" />
          </svg>
          <a href={`mailto:${user?.email}`} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#E85D20',
            textDecoration: 'none', wordBreak: 'break-all',
          }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
          >{user?.email}</a>
        </div>

        {school && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10l-10-5L2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
            </svg>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555' }}>{school}</span>
          </div>
        )}

        {parentCompany && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555' }}>
              Parent connection at <strong style={{ fontWeight: 500, color: '#333' }}>{parentCompany}</strong>
            </span>
          </div>
        )}

        {isMyProfile && !parentCompany && (
          <button onClick={() => navigate('ProfileEdit')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
            minHeight: 'auto', width: 'auto',
          }}>
            Add where your parents work →
          </button>
        )}
      </div>
    </div>
  );
}