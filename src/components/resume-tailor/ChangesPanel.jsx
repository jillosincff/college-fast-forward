import React, { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

// Outcome bullets shown before the individual edits — students understand results, not edit counts.
const OUTCOMES = [
  'Better matches this role',
  'ATS friendly',
  'Stronger, more specific language',
  'Better keyword coverage',
  'More measurable achievements',
];

// Opinionated review: all changes are accepted by default; students expand to inspect
// and can undo any single change. Each change explains WHY CLIFF made it.
export default function ChangesPanel({ changes, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const keptCount = changes.filter(c => c.accepted !== false).length;

  return (
    <div>
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
        <h3 style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '0 0 10px' }}>
          Here's what I improved
        </h3>
        {OUTCOMES.map((o, i) => (
          <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>
            <span style={{ color: '#16a34a', fontWeight: 800, marginRight: 7 }}>✓</span>{o}
          </p>
        ))}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>
            All {changes.length} improvements are applied{keptCount < changes.length ? ` (${changes.length - keptCount} undone)` : ''}. You can inspect each one.
          </p>
          <button onClick={() => setExpanded(v => !v)}
            style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#6d28d9', background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', minHeight: 'auto', width: '100%' }}>
            {expanded ? 'Hide changes' : 'Inspect each change →'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {changes.map((c, i) => {
            const kept = c.accepted !== false;
            return (
              <div key={c.id || i} style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderLeft: `3px solid ${kept ? '#4CAF50' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '0 12px 12px 0', padding: '14px 16px', marginBottom: 8,
              }}>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaa' }}>
                  {c.section || 'General'}
                </span>

                {c.original && (
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 300, color: '#aaa', lineHeight: 1.5, margin: '8px 0 6px', textDecoration: kept ? 'line-through' : 'none' }}>
                    {c.original}
                  </p>
                )}
                {c.tailored && (
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 500, color: kept ? '#1a1a1a' : '#aaa', lineHeight: 1.5, margin: '0 0 8px' }}>
                    {c.tailored}
                  </p>
                )}

                {/* Why CLIFF changed this */}
                {c.reason && (
                  <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <p style={{ fontFamily: dm, fontSize: 10.5, fontWeight: 800, color: '#7c3aed', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Why CLIFF changed this
                    </p>
                    <p style={{ fontFamily: dm, fontSize: 11.5, color: '#5b21b6', margin: 0, lineHeight: 1.45 }}>{c.reason}</p>
                  </div>
                )}

                <button
                  onClick={() => kept ? onReject(c.id) : onAccept(c.id)}
                  style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 600, color: kept ? '#9ca3af' : '#16a34a', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, textDecoration: 'underline' }}>
                  {kept ? 'Undo this change' : '✓ Re-apply this change'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}