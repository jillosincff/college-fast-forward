import React from 'react';
import { Check } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const STATUS_STYLES = {
  pending: { dotBg: 'rgba(0,0,0,0.06)', dotBorder: 'rgba(0,0,0,0.1)', badgeBg: 'rgba(0,0,0,0.04)', badgeColor: '#aaa', label: 'Pending' },
  in_progress: { dotBg: 'rgba(232,93,32,0.1)', dotBorder: orange, badgeBg: 'rgba(232,93,32,0.08)', badgeColor: orange, label: 'In Progress' },
  complete: { dotBg: '#4CAF50', dotBorder: '#4CAF50', badgeBg: 'rgba(76,175,80,0.08)', badgeColor: '#2e7d32', label: 'Complete' },
  overdue: { dotBg: 'rgba(229,57,53,0.1)', dotBorder: '#e53935', badgeBg: 'rgba(229,57,53,0.08)', badgeColor: '#e53935', label: 'Overdue' },
};

function MilestoneItem({ milestone, isLast, onComplete }) {
  const s = STATUS_STYLES[milestone.status] || STATUS_STYLES.pending;
  const isComplete = milestone.status === 'complete';
  const dueDate = milestone.due_date ? new Date(milestone.due_date) : null;
  const formattedDue = dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: s.dotBg, border: `2px solid ${s.dotBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isComplete && <Check className="w-2.5 h-2.5 text-white" />}
        </div>
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 40,
            background: isComplete ? '#4CAF50' : 'rgba(0,0,0,0.06)',
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
            {milestone.title}
          </span>
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 500,
            background: s.badgeBg, color: s.badgeColor,
            padding: '2px 8px', borderRadius: 100,
          }}>
            {s.label}
          </span>
          {formattedDue && (
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', marginLeft: 'auto' }}>
              {formattedDue}
            </span>
          )}
        </div>
        {milestone.description && (
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.5, marginTop: 4 }}>
            {milestone.description}
          </p>
        )}
        {!isComplete && (milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'overdue') && (
          <button
            onClick={() => onComplete(milestone.id)}
            style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              marginTop: 8, minHeight: 'auto', width: 'auto',
            }}
          >
            Mark complete ✓
          </button>
        )}
        {isComplete && milestone.completed_at && (
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#4CAF50', marginTop: 6 }}>
            Completed {new Date(milestone.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MilestonesTimeline({ milestones, onComplete }) {
  // Mark overdue milestones
  const now = new Date();
  const processed = milestones.map(m => {
    if (m.status === 'complete') return m;
    if (m.due_date && new Date(m.due_date) < now && m.status === 'pending') {
      return { ...m, status: 'overdue' };
    }
    return m;
  });

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>
        Your Milestones
      </h2>
      {processed.map((m, i) => (
        <MilestoneItem
          key={m.id || i}
          milestone={m}
          isLast={i === processed.length - 1}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}