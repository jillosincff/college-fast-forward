import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

/* ─── SVG icon components (20×20, stroke-based) ─── */
const icons = {
  warmIntros: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="4" /><path d="M3 17c0-3.5 3.1-5 7-5s7 1.5 7 5" />
    </svg>
  ),
  draftIntro: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="12" rx="2" /><path d="M3 7l7 5 7-5" />
    </svg>
  ),
  resume: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="1.5" /><path d="M7 7h6M7 10h6M7 13h4" />
    </svg>
  ),
  mockInterview: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="11" rx="2" /><path d="M7 17h6M10 14v3" />
    </svg>
  ),
  exploreCareers: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" /><path d="M10 2a14 14 0 010 16M2 10h16" /><path d="M4 6a14 14 0 0012 0M4 14a14 14 0 0012 0" />
    </svg>
  ),
  salaryIntel: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" /><path d="M10 6v1m0 6v1M8 9.5c0-1 .9-1.5 2-1.5s2 .7 2 1.5S11 11 10 11s-2 .7-2 1.5S8.9 14 10 14s2-.5 2-1.5" />
    </svg>
  ),
  linkedin: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="16" height="16" rx="2" /><path d="M6 9v5M6 7v.5M10 14v-3c0-1 .5-2 2-2s2 1 2 2v3" />
    </svg>
  ),
  coverLetter: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="14" height="16" rx="1.5" /><path d="M7 7h6M7 10h6M7 13h4" />
    </svg>
  ),
  actionPlan: (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l2 2 4-4" /><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 3v4M13 3v4M3 9h14" />
    </svg>
  ),
};

const ICON_BG_MAP = {
  'Find Warm Intros': 'rgba(232,93,32,0.1)',
  'Draft Intro': 'rgba(33,150,243,0.08)',
  'Resume Review & Tailor': 'rgba(156,39,176,0.08)',
  'Mock Interview': 'rgba(76,175,80,0.08)',
  'Explore Careers': 'rgba(255,167,38,0.08)',
  'Salary Intel': 'rgba(232,93,32,0.08)',
  'LinkedIn Review': 'rgba(33,150,243,0.08)',
  'Cover Letter': 'rgba(156,39,176,0.08)',
  'Action Plan': 'rgba(76,175,80,0.08)',
};

const ICON_COLOR_MAP = {
  'Find Warm Intros': '#E85D20',
  'Draft Intro': '#2196F3',
  'Resume Review & Tailor': '#9C27B0',
  'Mock Interview': '#4CAF50',
  'Explore Careers': '#FFA726',
  'Salary Intel': '#E85D20',
  'LinkedIn Review': '#2196F3',
  'Cover Letter': '#9C27B0',
  'Action Plan': '#4CAF50',
};

const ICON_FN_MAP = {
  'Find Warm Intros': icons.warmIntros,
  'Draft Intro': icons.draftIntro,
  'Resume Review & Tailor': icons.resume,
  'Mock Interview': icons.mockInterview,
  'Explore Careers': icons.exploreCareers,
  'Salary Intel': icons.salaryIntel,
  'LinkedIn Review': icons.linkedin,
  'Cover Letter': icons.coverLetter,
  'Action Plan': icons.actionPlan,
};

const ALL_ACTIONS = [
  { label: 'Find Warm Intros', description: 'Find UF alumni at any company', color: '#0021A5', prompt: 'Find UF alumni at my target companies', primary: true },
  { label: 'Draft Intro', description: "I'll write a personalized message for you", color: '#FA4616', prompt: 'Draft an outreach message', primary: true },
  { label: 'Resume Review & Tailor', description: 'Tailor your resume to any job listing', color: '#8B5CF6', prompt: '__navigate_resume_tailoring__', primary: true },
  { label: 'Mock Interview', description: 'Practice with FASTIQ as your interviewer', color: '#EF4444', prompt: '__navigate_mock_interview__', primary: true },
  { label: 'Explore Careers', description: "Not sure what direction to go? Let's explore", color: '#06B6D4', prompt: 'Explore career paths for my major', primary: false },
  { label: 'Salary Intel', description: 'What should you expect to earn?', color: '#10B981', prompt: 'Help me negotiate salary', primary: false },
  { label: 'LinkedIn Review', description: 'Optimize your profile to get noticed', color: '#0077B5', prompt: 'Review my LinkedIn profile', primary: false },
  { label: 'Cover Letter', description: 'Tailored to each job you apply for', color: '#EAB308', prompt: 'Write a cover letter for me', primary: false },
  { label: 'Action Plan', description: 'Your goals, milestones & activity', color: '#E85D20', prompt: '__navigate_action_plan__', primary: false },
];

function ActionCard({ action, onOpenChat }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (action.prompt === '__navigate_action_plan__') {
      navigate('ActionPlanTracker');
    } else if (action.prompt === '__navigate_resume_tailoring__') {
      navigate('ResumeTailoring');
    } else if (action.prompt === '__navigate_mock_interview__') {
      navigate('MockInterview');
    } else {
      onOpenChat(action.prompt);
    }
  };

  const iconColor = ICON_COLOR_MAP[action.label] || action.color;
  const iconBg = ICON_BG_MAP[action.label] || `${action.color}0D`;
  const iconFn = ICON_FN_MAP[action.label];

  return (
    <div
      onClick={handleClick}
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
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
      }}>
        {iconFn ? iconFn(iconColor) : <span style={{ fontSize: action.primary ? 20 : 18 }}>⚡</span>}
      </div>
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
        fontSize: 11, fontWeight: 500, color: '#bbb',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
        fontFamily: "'DM Sans', sans-serif",
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