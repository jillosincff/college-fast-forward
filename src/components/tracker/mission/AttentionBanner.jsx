import { useState } from 'react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "CLIFF Needs Your Attention" — only the single highest-priority application
export default function AttentionBanner({ item, onAction }) {
  const [showWhy, setShowWhy] = useState(false);
  if (!item) return null;
  const { app, insight } = item;

  return (
    <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fef2f2)', border: '1px solid #fecaca', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
        CLIFF Needs Your Attention
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
            🔥 {app.company}{app.jobTitle && app.jobTitle !== '—' ? ` — ${app.jobTitle}` : ''}
          </p>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.5 }}>
            {insight.cliffSays}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {insight.action?.type !== 'none' && (
            <button
              onClick={() => onAction(item)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', minHeight: 44, boxShadow: '0 4px 14px rgba(220,38,38,0.25)' }}
            >
              {insight.action.label}
            </button>
          )}
          <button
            onClick={() => setShowWhy(p => !p)}
            style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#b91c1c', background: 'none', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', minHeight: 44 }}
          >
            Why now?
          </button>
        </div>
      </div>
      {showWhy && insight.whyNow && (
        <p style={{ fontFamily: dm, fontSize: 12.5, color: '#7f1d1d', background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 14px', margin: '12px 0 0', lineHeight: 1.55 }}>
          {insight.whyNow}
        </p>
      )}
    </div>
  );
}