import AppTimeline from './AppTimeline';
import { buildTimeline } from './trackerLogic';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One compact status card: company, role, stage, health, timeline,
// CLIFF's recommendation, next action + estimated time, contextual Ask CLIFF.
export default function MissionAppCard({ item, highlighted, onAction, onAskCliff, onOpen }) {
  const { app, insight } = item;
  const h = insight.health;
  const isWaiting = insight.group === 'waiting';

  return (
    <div
      onClick={() => onOpen(app)}
      style={{
        background: '#fff', borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
        border: highlighted ? '2px solid #7c3aed' : '1px solid #e5e7eb',
        boxShadow: highlighted ? '0 6px 24px rgba(124,58,237,0.18)' : '0 1px 4px rgba(0,0,0,0.03)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!highlighted) e.currentTarget.style.borderColor = '#c4b5fd'; }}
      onMouseLeave={e => { if (!highlighted) e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      {highlighted && (
        <p style={{ fontFamily: dm, fontSize: 10.5, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
          ✨ From Today's Mission
        </p>
      )}

      {/* Header: company / role / health */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</p>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.jobTitle !== '—' ? app.jobTitle : ''}{app.jobTitle !== '—' ? ' · ' : ''}{insight.stage}
          </p>
        </div>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: h.color, background: h.bg, border: `1px solid ${h.color}33`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {h.icon} {h.label}
        </span>
      </div>

      <AppTimeline steps={buildTimeline(app, insight)} />

      {/* CLIFF recommendation */}
      <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
        <p style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: 0, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 800, color: '#6d28d9' }}>CLIFF says: </span>{insight.cliffSays}
        </p>
        {isWaiting && insight.waiting && (
          <p style={{ fontFamily: dm, fontSize: 11.5, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.5 }}>
            Expected follow-up window: {insight.waiting.window} day{insight.waiting.window === 1 ? '' : 's'}. I'll remind you if action is needed.
          </p>
        )}
      </div>

      {/* Footer: action + Ask CLIFF */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {insight.action && insight.action.type !== 'none' ? (
          <button
            onClick={e => { e.stopPropagation(); onAction(item); }}
            style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', minHeight: 40 }}
          >
            {insight.action.label}{insight.action.estMinutes ? ` · ~${insight.action.estMinutes} min` : ''}
          </button>
        ) : (
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#9ca3af', padding: '9px 0' }}>
            {insight.action?.label || 'Nothing Right Now'}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onAskCliff(item); }}
          style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#6d28d9', background: 'none', border: '1px solid #ddd6fe', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', minHeight: 40, marginLeft: 'auto' }}
        >
          Ask CLIFF
        </button>
      </div>
    </div>
  );
}