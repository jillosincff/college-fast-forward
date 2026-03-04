import React from 'react';

const ACTIONS = [
  { icon: '🔍', label: 'Scan for Insiders', color: '#0021A5', prompt: 'Find UF alumni at my target companies' },
  { icon: '✉️', label: 'Draft Outreach', color: '#FA4616', prompt: 'Draft a LinkedIn message to a recruiter' },
  { icon: '📄', label: 'Resume Review', color: '#EAB308', prompt: 'Review my resume' },
  { icon: '💼', label: 'Interview Prep', color: '#EF4444', prompt: 'Prep me for an interview' },
  { icon: '🗺️', label: 'Career Plan', color: '#10B981', prompt: 'Create a 4-week career action plan for me' },
  { icon: '💰', label: 'Salary Intel', color: '#10B981', prompt: 'What salary should I negotiate?' },
  { icon: '🔗', label: 'LinkedIn Review', color: '#0077B5', prompt: 'Review my LinkedIn profile' },
  { icon: '🧠', label: 'Strategy Brief', color: '#8B5CF6', prompt: 'What company should I target next and why?' },
];

export default function QuickActionsGrid({ onOpenChat }) {
  return (
    <div className="fiq-animate fiq-delay-6" style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
      }}>Quick Actions</h2>
      <div className="fiq-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {ACTIONS.map((a, i) => (
          <div
            key={a.label}
            onClick={() => onOpenChat(a.prompt)}
            style={{
              padding: '20px 12px', background: '#fff', borderRadius: 14,
              border: '1px solid #E2E8F0', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = a.color;
              e.currentTarget.style.borderWidth = '2px';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}30`;
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
              background: `${a.color}0D`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px', fontSize: 22,
            }}>{a.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{a.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}