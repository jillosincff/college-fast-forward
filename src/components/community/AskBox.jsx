import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";

const CATEGORIES = [
  { id: 'networking', label: 'Networking & Outreach', icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { id: 'career_path', label: 'Career Path', icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )},
  { id: 'first_job', label: 'First Job Advice', icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  )},
  { id: 'industry', label: 'Industry-Specific', icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  )},
];

export default function AskBox({ onOpenModal, selectedCategory, onCategorySelect }) {
  const { user } = useAuth();
  const initials = user?.full_name ? user.full_name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') : '?';

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
      padding: 24, marginBottom: 24,
      animation: 'atnFadeUp 0.4s ease 0.06s both',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#E85D20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
        <button onClick={() => onOpenModal(null)} style={{
          flex: 1, background: '#f4f2ee', border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 100, padding: '11px 18px', fontFamily: dmSans, fontSize: 14,
          fontWeight: 300, color: '#aaa', textAlign: 'left', cursor: 'text',
          transition: 'border-color 0.2s', minHeight: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
        >
          Have another question for the network?
        </button>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => { onCategorySelect(cat.id); onOpenModal(cat.id); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
              color: active ? '#E85D20' : '#888',
              background: active ? 'rgba(232,93,32,0.08)' : '#f4f2ee',
              border: `0.5px solid ${active ? 'rgba(232,93,32,0.3)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
              transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = '#E85D20'; e.currentTarget.style.background = 'rgba(232,93,32,0.04)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '#f4f2ee'; }}}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Subline */}
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', fontStyle: 'italic', margin: '0 0 16px' }}>
        Your onboarding question is already posted. Ask as many follow-up questions as you want.
      </p>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.06)' }} />
    </div>
  );
}

export { CATEGORIES };