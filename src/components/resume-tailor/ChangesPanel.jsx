import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const TYPE_LABELS = {
  modified: 'Modified',
  added: 'Added',
  reordered: 'Reordered',
  removed: 'Removed',
};

export default function ChangesPanel({ changes, onAccept, onReject, onAcceptAll }) {
  const hasPending = changes.some(c => c.accepted === null || c.accepted === undefined);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          Review Changes
        </h3>
        {hasPending && (
          <button
            onClick={onAcceptAll}
            style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: orange,
              background: 'none', border: 'none', cursor: 'pointer',
              minHeight: 'auto', width: 'auto',
            }}
          >
            Accept all →
          </button>
        )}
      </div>

      <div style={{ maxHeight: 600, overflowY: 'auto' }}>
        {changes.map((c, i) => {
          const isAccepted = c.accepted === true;
          const isRejected = c.accepted === false;
          const isPending = c.accepted === null || c.accepted === undefined;
          const borderColor = isAccepted ? '#4CAF50' : isRejected ? 'rgba(0,0,0,0.1)' : orange;

          return (
            <div key={c.id || i} style={{
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
              borderLeft: `3px solid ${borderColor}`,
              borderRadius: '0 12px 12px 0', padding: '14px 16px', marginBottom: 8,
            }}>
              {/* Section + Type */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaa' }}>
                  {c.section || 'General'}
                </span>
                <span style={{
                  fontFamily: dmSans, fontSize: 10, fontWeight: 500,
                  background: 'rgba(0,0,0,0.04)', color: '#666',
                  borderRadius: 100, padding: '1px 6px',
                }}>
                  {TYPE_LABELS[c.type] || c.type || 'Modified'}
                </span>
              </div>

              {/* Original */}
              {c.original && (
                <p style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa',
                  lineHeight: 1.5, margin: '0 0 6px',
                  textDecoration: isRejected ? 'none' : 'line-through',
                }}>
                  {c.original}
                </p>
              )}

              {/* Tailored */}
              {c.tailored && (
                <p style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: isRejected ? '#aaa' : '#1a1a1a',
                  lineHeight: 1.5, margin: '0 0 6px',
                }}>
                  {c.tailored}
                </p>
              )}

              {/* Reason */}
              {c.reason && (
                <p style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 300, fontStyle: 'italic',
                  color: 'rgba(232,93,32,0.8)', margin: '0 0 10px',
                }}>
                  "{c.reason}"
                </p>
              )}

              {/* Accept/Reject */}
              {isPending ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onAccept(c.id)}
                    style={{
                      fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#2e7d32',
                      background: 'rgba(76,175,80,0.08)', border: '0.5px solid rgba(76,175,80,0.2)',
                      borderRadius: 100, padding: '4px 12px', cursor: 'pointer',
                      minHeight: 'auto', width: 'auto',
                    }}
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => onReject(c.id)}
                    style={{
                      fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#e53935',
                      background: 'rgba(229,57,53,0.08)', border: '0.5px solid rgba(229,57,53,0.2)',
                      borderRadius: 100, padding: '4px 12px', cursor: 'pointer',
                      minHeight: 'auto', width: 'auto',
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              ) : (
                <span style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                  color: isAccepted ? '#2e7d32' : '#aaa',
                }}>
                  {isAccepted ? '✓ Accepted' : '✗ Rejected'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}