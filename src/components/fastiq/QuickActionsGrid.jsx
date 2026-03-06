import React, { useState } from 'react';

const ALL_ACTIONS = [
  { icon: '🔍', label: 'Find Warm Intros', description: 'Find UF alumni at any company', color: '#0021A5', prompt: 'Find UF alumni at my target companies', primary: true },
  { icon: '✉️', label: 'Draft Intro', description: "I'll write a personalized message for you", color: '#FA4616', prompt: 'Draft an outreach message', primary: true },
  { icon: '📄', label: 'Resume Review & Tailor', description: 'Build, review, or customize your resume', color: '#8B5CF6', prompt: 'Help me with my resume', primary: true },
  { icon: '💼', label: 'Interview Prep', description: 'Company-specific questions and tips', color: '#EF4444', prompt: 'Prep me for an interview', primary: true },
  { icon: '🧭', label: 'Explore Careers', description: "Not sure what to do? Let's figure it out", color: '#06B6D4', prompt: 'Explore career paths for my major', primary: false },
  { icon: '💰', label: 'Salary Intel', description: 'What should you expect to earn?', color: '#10B981', prompt: 'Help me negotiate salary', primary: false },
  { icon: '🔗', label: 'LinkedIn Review', description: 'Optimize your profile to get noticed', color: '#0077B5', prompt: 'Review my LinkedIn profile', primary: false },
  { icon: '📝', label: 'Cover Letter', description: 'Tailored to each job you apply for', color: '#EAB308', prompt: 'Write a cover letter for me', primary: false },
];

function ActionCard({ action, onOpenChat }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onOpenChat(action.prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: action.primary ? '18px 14px 16px' : '14px 12px 12px',
        background: '#fff',
        borderRadius: 14,
        border: `1px solid ${hovered ? action.color : '#E2E8F0'}`,
        borderTop: `3px solid ${action.color}`,
        cursor: 'pointer',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${action.color}20` : action.primary ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{
        width: action.primary ? 44 : 38,
        height: action.primary ? 44 : 38,
        borderRadius: 12,
        background: `${action.color}0D`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: action.primary ? 20 : 18,
      }}>{action.icon}</div>
      <div style={{
        fontSize: action.primary ? 14 : 13,
        fontWeight: 700,
        color: '#1E293B',
        lineHeight: 1.3,
      }}>{action.label}</div>
      <div style={{
        fontSize: 11,
        color: '#64748B',
        lineHeight: 1.4,
      }}>{action.description}</div>
    </div>
  );
}

export default function QuickActionsGrid({ onOpenChat, isNewUser }) {
  return (
    <div className="fiq-animate fiq-delay-3" style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#334155',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
      }}>What Can I Help With?</h2>

      {isNewUser && (
        <div style={{
          background: '#F0F4FA', borderRadius: 10, padding: '10px 14px',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid #E2E8F0',
        }}>
          <span style={{ fontSize: 16 }}>👋</span>
          <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
            <b>Not sure where to start?</b> Try <b>"Find Warm Intros"</b> or <b>"Explore Careers"</b> — FASTIQ will guide you step by step.
          </span>
        </div>
      )}

      <div className="fiq-actions-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {ALL_ACTIONS.map((a) => (
          <ActionCard key={a.label} action={a} onOpenChat={onOpenChat} />
        ))}
      </div>
    </div>
  );
}