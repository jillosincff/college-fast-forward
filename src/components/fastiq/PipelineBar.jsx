import React from 'react';

const STAGES = [
  { key: 'identified', icon: '🔍', label: 'Identified', color: '#0021A5' },
  { key: 'reached_out', icon: '✉️', label: 'Intro Sent', color: '#8B5CF6' },
  { key: 'replied', icon: '💬', label: 'Replies', color: '#10B981' },
  { key: 'interview', icon: '📅', label: 'Interviews', color: '#FA4616' },
  { key: 'offer', icon: '🎉', label: 'Offers', color: '#EAB308' },
];

export default function PipelineBar({ counts, noResponseContacts = [], onOpenChat }) {
  const allZero = STAGES.every(s => (counts[s.key] || 0) === 0);

  return (
    <div className="fiq-animate fiq-delay-4" style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#334155',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
      }}>Your Pipeline</h2>

      {(
        <div style={{
          background: '#fff', borderRadius: 16, padding: '24px 16px',
          border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* "Getting started" overlay for empty pipeline */}
          {allZero && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(248,250,252,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2, borderRadius: 16, backdropFilter: 'blur(2px)',
            }}>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  🚀 Your pipeline is ready
                </p>
                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, maxWidth: 300, margin: '0 auto' }}>
                  Find alumni at your target companies, send intros, and watch these numbers fill up as you build connections.
                </p>
              </div>
            </div>
          )}
          {STAGES.map((s, i) => {
            const count = counts[s.key] || 0;
            const active = count > 0;
            return (
              <React.Fragment key={s.key}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: active ? `${s.color}12` : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px', fontSize: 18, transition: 'all 0.3s',
                  }}>{s.icon}</div>
                  <div className="fiq-mono" style={{
                    fontSize: 24, fontWeight: 700,
                    color: active ? s.color : '#94A3B8',
                  }}>{count}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2,
                  }}>{s.label}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{
                    width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#E2E8F0', fontSize: 18, marginTop: -20, flexShrink: 0,
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
          marginTop: 12, background: '#F8FAFC', borderRadius: 12,
          border: '1px solid #E2E8F0', padding: '14px 16px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>📭</span> Paused ({noResponseContacts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {noResponseContacts.slice(0, 5).map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 12, color: '#64748B',
              }}>
                <span>{c.alumni_name} at {c.company}</span>
                <span style={{ fontSize: 10, color: '#64748B' }}>No response</span>
              </div>
            ))}
            {noResponseContacts.length > 5 && (
              <div style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
                +{noResponseContacts.length - 5} more
              </div>
            )}
          </div>
          <p style={{ fontSize: 10, color: '#64748B', marginTop: 8, lineHeight: 1.4 }}>
            These contacts didn't respond after 2 attempts. FASTIQ suggested alternative strategies.
          </p>
        </div>
      )}
    </div>
  );
}