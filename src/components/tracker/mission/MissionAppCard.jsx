import { Trash2 } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One compact status card: company, role, status, one CLIFF recommendation,
// and a single next action. Pipeline chips live in the detail panel.
export default function MissionAppCard({ item, highlighted, onAction, onOpen, onDelete }) {
  const { app, insight } = item;
  const h = insight.health;
  const hasAction = insight.action && insight.action.type !== 'none';

  return (
    <div
      onClick={() => onOpen(app)}
      style={{
        background: '#fff', borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
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

      {/* Header: company / role · stage / status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</p>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.jobTitle !== '—' ? `${app.jobTitle} · ${insight.stage}` : insight.stage}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: h.color, background: h.bg, border: `1px solid ${h.color}33`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' }}>
            {h.icon} {h.label}
          </span>
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(app); }}
              title="Remove from tracker"
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none'; }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* One CLIFF recommendation */}
      <p style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '10px 0 0', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 800, color: '#6d28d9' }}>CLIFF: </span>{insight.cliffSays}
      </p>

      {/* One action */}
      <div style={{ marginTop: 12 }}>
        {hasAction ? (
          <button
            onClick={e => { e.stopPropagation(); onAction(item); }}
            style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', minHeight: 40 }}
          >
            {insight.action.label}{insight.action.estMinutes ? ` · ~${insight.action.estMinutes} min` : ''}
          </button>
        ) : (
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>
            {insight.action?.label || 'Nothing right now'}
          </span>
        )}
      </div>
    </div>
  );
}