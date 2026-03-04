import React, { useState } from 'react';

const PRIMARY_ACTIONS = [
  { icon: '🔍', label: 'Scan for Insiders', color: '#0021A5', prompt: 'Find UF alumni at my target companies' },
  { icon: '✉️', label: 'Draft Outreach', color: '#FA4616', prompt: 'Draft an outreach message' },
  { icon: '📄', label: 'Resume Review & Tailor', color: '#EAB308', prompt: 'Review my resume' },
  { icon: '💼', label: 'Interview Prep', color: '#EF4444', prompt: 'Prep me for an interview' },
];

const MORE_ACTIONS = [
  { icon: '🗺️', label: 'Career Plan', color: '#10B981', prompt: 'Build my career action plan' },
  { icon: '💰', label: 'Salary Intel', color: '#10B981', prompt: 'Help me negotiate salary' },
  { icon: '🔗', label: 'LinkedIn Review', color: '#0077B5', prompt: 'Review my LinkedIn profile' },
  { icon: '🧭', label: 'Explore Careers', color: '#06B6D4', prompt: 'Explore career paths for my major' },
];

function ActionCard({ action, onOpenChat }) {
  return (
    <div
      onClick={() => onOpenChat(action.prompt)}
      style={{
        padding: '20px 12px', background: '#fff', borderRadius: 14,
        border: '1px solid #E2E8F0', textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = action.color;
        e.currentTarget.style.borderWidth = '2px';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}30`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.borderWidth = '1px';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${action.color}0D`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px', fontSize: 22,
      }}>{action.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{action.label}</div>
    </div>
  );
}

export default function QuickActionsGrid({ onOpenChat }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fiq-animate fiq-delay-6" style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
      }}>Quick Actions</h2>
      <div className="fiq-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {PRIMARY_ACTIONS.map((a) => (
          <ActionCard key={a.label} action={a} onOpenChat={onOpenChat} />
        ))}
      </div>

      {showMore && (
        <div className="fiq-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
          {MORE_ACTIONS.map((a) => (
            <ActionCard key={a.label} action={a} onOpenChat={onOpenChat} />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowMore(!showMore)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', marginTop: 12, padding: '10px 0',
          background: 'transparent', border: '1px dashed #CBD5E1',
          borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#64748B',
          cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0021A5'; e.currentTarget.style.color = '#0021A5'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#64748B'; }}
      >
        {showMore ? '↑ Show less' : '↓ More tools'}
      </button>
    </div>
  );
}