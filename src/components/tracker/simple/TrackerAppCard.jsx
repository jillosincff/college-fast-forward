import { Trash2 } from 'lucide-react';
import { getStatusGroup, getStatusLabel, getActions, formatAppliedDate, needsFollowUp } from '@/lib/simpleTracker';
import FollowUpDraft from './FollowUpDraft';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One application card: company, role, applied date, one primary next action,
// and subtle secondary status moves. Follow-up draft appears after 3–5 days.
export default function TrackerAppCard({ app, user, onTransition, onLogFollowUp, onDelete }) {
  const group = getStatusGroup(app.status);
  const label = getStatusLabel(app.status);
  const actions = getActions(group);
  const primary = actions.find(a => a.primary);
  const secondary = actions.filter(a => !a.primary);

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '14px 16px',
      border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      {/* Header: company / role · status · delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</p>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.job_title || '—'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: label.color, background: label.bg, border: `1px solid ${label.color}33`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' }}>
            {label.label}
          </span>
          <button onClick={() => onDelete(app)} title="Remove from tracker"
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none'; }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Applied date */}
      <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
        {formatAppliedDate(app.created_date)}
      </p>

      {/* Follow-up draft (3–5 days, no reply, no follow-up sent) */}
      {needsFollowUp(app) && (
        <FollowUpDraft app={app} user={user} onSent={() => onLogFollowUp(app)} />
      )}

      {/* Actions: one primary + subtle secondary transitions */}
      {actions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginTop: 12 }}>
          {primary && (
            <button onClick={() => onTransition(app, primary.target)}
              style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', minHeight: 40 }}>
              {primary.label} →
            </button>
          )}
          {secondary.map(s => (
            <button key={s.target} onClick={() => onTransition(app, s.target)}
              style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', minHeight: 'auto' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Job posting link */}
      {app.job_url && (
        <a href={app.job_url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#7c3aed', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
          View posting →
        </a>
      )}
    </div>
  );
}