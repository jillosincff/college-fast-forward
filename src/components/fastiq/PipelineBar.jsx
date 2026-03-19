import React from 'react';

const STAGES = [
{ key: 'identified', icon: '🔍', label: 'Identified', color: '#E85D20' },
{ key: 'reached_out', icon: '✉️', label: 'Intro Sent', color: '#F59E0B' },
{ key: 'replied', icon: '💬', label: 'Replies', color: '#22C55E' },
{ key: 'interview', icon: '📅', label: 'Interviews', color: '#E85D20' },
{ key: 'offer', icon: '🎉', label: 'Offers', color: '#22C55E' },
];

export default function PipelineBar({ counts, noResponseContacts = [], onOpenChat }) {
  const allZero = STAGES.every(s => (counts[s.key] || 0) === 0);

  // FIX 2: Hide empty pipeline, show FASTIQ conversation starter instead
  if (allZero && noResponseContacts.length === 0) {
    return (
      <div className="fiq-animate fiq-delay-4" style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 500, color: '#bbb',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
          fontFamily: "'DM Sans', sans-serif",
        }}>Your Pipeline</h2>
        <div style={{
          background: 'rgba(232,93,32,0.06)', border: '0.5px solid rgba(232,93,32,0.15)',
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>
              Your pipeline starts the moment you send your first message. Ready to find someone to reach out to?
            </p>
            <button
              onClick={() => onOpenChat('Find me UF alumni at companies I should reach out to')}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                color: '#fff', background: '#E85D20', border: 'none',
                borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
                minHeight: 'auto', width: 'auto', transition: 'background 0.2s',
              }}
            >
              Find alumni to message →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fiq-animate fiq-delay-4" style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#E85D20',
        textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}>Your Pipeline</h2>

      {(
        <div style={{
          background: '#1A1A1A', borderRadius: 12, padding: '24px 16px',
          border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {STAGES.map((s, i) => {
            const count = counts[s.key] || 0;
            const active = count > 0;
            return (
              <React.Fragment key={s.key}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: active ? `${s.color}20` : '#2A2A2A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px', fontSize: 18, transition: 'all 0.3s',
                  }}>{s.icon}</div>
                  <div className="fiq-mono" style={{
                    fontSize: 24, fontWeight: 700,
                    color: active ? s.color : '#555',
                  }}>{count}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: '#888',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2,
                  }}>{s.label}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{
                    width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#555', fontSize: 18, marginTop: -20, flexShrink: 0,
                  }}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* P2 FIX: Show no_response contacts as separate archived section */}
      {noResponseContacts.length > 0 && (
        <div style={{
          marginTop: 12, background: '#1A1A1A', borderRadius: 12,
          border: '1px solid #2A2A2A', padding: '14px 16px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#888',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>📭</span> Paused ({noResponseContacts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {noResponseContacts.slice(0, 5).map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 12, color: '#888',
              }}>
                <span>{c.alumni_name} at {c.company}</span>
                <span style={{ fontSize: 10, color: '#555' }}>No response</span>
              </div>
            ))}
            {noResponseContacts.length > 5 && (
              <div style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>
                +{noResponseContacts.length - 5} more
              </div>
            )}
          </div>
          <p style={{ fontSize: 10, color: '#555', marginTop: 8, lineHeight: 1.4 }}>
            These contacts didn't respond after 2 attempts. FASTIQ suggested alternative strategies.
          </p>
        </div>
      )}
    </div>
  );
}