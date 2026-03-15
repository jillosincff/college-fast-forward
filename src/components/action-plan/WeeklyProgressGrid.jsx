import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const GOAL_CONFIG = [
  { key: 'outreach', label: 'OUTREACH SENT' },
  { key: 'conversations', label: 'CONVERSATIONS' },
  { key: 'research', label: 'RESEARCHED' },
  { key: 'resumes', label: 'RESUMES TAILORED' },
];

function ProgressCard({ label, current, goal }) {
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;
  const exceeded = current >= goal && goal > 0;
  const behind = current < goal / 2 && goal > 0;

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', flexDirection: 'column',
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 400, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: '#aaa', marginBottom: 8,
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: orange }}>
          {current}
        </span>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#ccc' }}>/</span>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#aaa' }}>{goal}</span>
      </div>
      <div style={{
        height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 8,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${pct * 100}%`,
          background: exceeded ? '#4CAF50' : orange,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 300, marginTop: 6,
        color: exceeded ? '#4CAF50' : behind ? orange : '#aaa',
      }}>
        {exceeded ? 'Done this week 🎉' : behind ? `Behind — ${goal - current} to go` : 'On track ✓'}
      </p>
    </div>
  );
}

export default function WeeklyProgressGrid({ progress, goals }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16, marginBottom: 24,
    }} className="action-plan-progress-grid">
      <style>{`.action-plan-progress-grid { grid-template-columns: repeat(4, 1fr) !important; } @media (max-width: 640px) { .action-plan-progress-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      {GOAL_CONFIG.map(({ key, label }) => (
        <ProgressCard
          key={key}
          label={label}
          current={progress[key] || 0}
          goal={goals[key] || 1}
        />
      ))}
    </div>
  );
}