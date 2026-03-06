import React, { useState } from 'react';

const PRIMARY_ACTIONS = [
  { icon: '🔍', label: 'Find Warm Intros', color: '#0021A5', prompt: 'Find UF alumni at my target companies', preview: 'Find UF alumni at your targets' },
  { icon: '✉️', label: 'Draft Intro', color: '#FA4616', prompt: 'Draft an outreach message', preview: 'AI-drafted personalized intro' },
  { icon: '🧭', label: 'Explore Careers', color: '#06B6D4', prompt: 'Explore career paths for my major', preview: 'Discover roles that fit your major' },
  { icon: '💼', label: 'Interview Prep', color: '#EF4444', prompt: 'Prep me for an interview', preview: 'Company-specific mock questions' },
];

const MORE_ACTIONS = [
  { icon: '🗺️', label: 'Career Plan', color: '#10B981', prompt: 'Build my career action plan', preview: 'Week-by-week action roadmap' },
  { icon: '💰', label: 'Salary Intel', color: '#10B981', prompt: 'Help me negotiate salary', preview: 'Market data + negotiation script' },
  { icon: '🔗', label: 'LinkedIn Review', color: '#0077B5', prompt: 'Review my LinkedIn profile', preview: 'Score and optimize your profile' },
  { icon: '📝', label: 'Cover Letter', color: '#8B5CF6', prompt: 'Write a cover letter for me', preview: 'Tailored letter for any role' },
];

function ActionCard({ action, onOpenChat }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onOpenChat(action.prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 12px', background: '#fff', borderRadius: 14,
        border: `1px solid ${hovered ? action.color : '#E2E8F0'}`,
        borderTop: `3px solid ${hovered ? action.color : '#E2E8F0'}`,
        textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 6px 20px ${action.color}25` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${action.color}0D`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px', fontSize: 22,
      }}>{action.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{action.label}</div>
      {/* 7. HOVER PREVIEW */}
      <div style={{
        fontSize: 10, color: '#64748B', marginTop: 4,
        height: hovered ? 16 : 0,
        opacity: hovered ? 1 : 0,
        transition: 'all 0.25s',
        overflow: 'hidden',
      }}>
        {action.preview}
      </div>
    </div>
  );
}

export default function QuickActionsGrid({ onOpenChat }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fiq-animate fiq-delay-6" style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#334155',
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