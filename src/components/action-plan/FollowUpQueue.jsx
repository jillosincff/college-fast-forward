import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function FollowUpQueue({ followUps, onDone }) {
  const now = new Date();

  const sorted = [...followUps].sort((a, b) =>
    new Date(a.follow_up_due_at) - new Date(b.follow_up_due_at)
  );

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleDraft = (item) => {
    const msg = `Draft a follow-up message to ${item.contact_name || 'contact'}${item.company_name ? ` at ${item.company_name}` : ''}. I ${item.type?.replace(/_/g, ' ')} and haven't heard back.`;
    sessionStorage.setItem('fastiq_initial_message', msg);
    navigate('FastIQ');
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          Follow-Ups Needed
        </h2>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#fff',
          background: orange, borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {followUps.length}
        </span>
      </div>

      {sorted.map(item => {
        const due = new Date(item.follow_up_due_at);
        const daysUntil = Math.ceil((due - now) / (24 * 60 * 60 * 1000));
        const isOverdue = daysUntil < 0;
        const isToday = daysUntil === 0;
        const borderColor = isOverdue ? '#e53935' : orange;
        const dueText = isOverdue
          ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''}`
          : isToday ? 'Follow up today' : `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;

        return (
          <div key={item.id} style={{
            background: '#fff', borderLeft: `3px solid ${borderColor}`,
            borderRadius: '0 12px 12px 0', padding: '14px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0021A5, #0033CC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
              flexShrink: 0,
            }}>
              {getInitials(item.contact_name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
                {item.contact_name || 'Contact'}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', margin: 0 }}>
                {item.company_name || ''}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 400,
                color: isOverdue ? '#e53935' : orange,
              }}>
                {dueText}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleDraft(item)}
                  style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#fff',
                    background: orange, borderRadius: 100, padding: '4px 12px',
                    border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto',
                  }}
                >
                  Draft follow-up →
                </button>
                <button
                  onClick={() => onDone(item.id)}
                  style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#4CAF50',
                    background: 'none', border: 'none', cursor: 'pointer',
                    minHeight: 'auto', width: 'auto',
                  }}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}