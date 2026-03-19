import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

export default function PastResearchSection({ pastResearch, onReAddCompany, onOpenChat }) {
  const [expanded, setExpanded] = useState(false);

  // FIX 6: Hide until there's real data (company with actual intel, not just cached empty records)
  const meaningfulResearch = (pastResearch || []).filter(item => {
    const intel = item.intel;
    if (!intel) return false;
    return (intel.hiring_signal || intel.open_roles_count > 0 || intel.entry_level_roles_count > 0 || intel.intern_roles_count > 0 || intel.intel_summary);
  });
  if (meaningfulResearch.length === 0) return null;

  return (
    <div className="fiq-animate fiq-delay-7" style={{ marginBottom: 32 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
          minHeight: 'auto',
        }}
      >
        <span style={{ fontSize: 14 }}>📁</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: "'DM Sans', sans-serif" }}>
          Companies FASTIQ is watching ({meaningfulResearch.length})
        </span>
        {!expanded && meaningfulResearch.length > 0 && (() => {
          const uniqueNames = [...new Set(meaningfulResearch.map(r => r.company_name).filter(n => n && n.length > 2))];
          const preview = uniqueNames.slice(0, 3).join(' · ');
          const remaining = Math.max(0, uniqueNames.length - 3);
          return (
            <span style={{ fontSize: 10, color: '#888', fontWeight: 500, fontStyle: 'italic', marginLeft: 4 }}>
              — {preview}{remaining > 0 ? ` +${remaining} more` : ''} ›
            </span>
          );
        })()}
        {expanded
          ? <ChevronDown style={{ width: 14, height: 14, color: '#888' }} />
          : <ChevronRight style={{ width: 14, height: 14, color: '#888' }} />
        }
      </button>

      {expanded && (
        <div style={{
          background: '#0A0A0A', borderRadius: 12, border: '1px solid #2A2A2A',
          padding: '16px', marginTop: 8,
        }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 14, lineHeight: 1.5 }}>
            Companies you previously researched that are no longer targets. Your data is preserved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meaningfulResearch.map((item) => {
              const name = item.company_name || 'Unknown';
              const alumni = item.alumni_count || 0;
              const reached = item.pipeline?.reached || 0;
              const signal = item.intel?.hiring_signal;
              const removedDate = item.intel?.updated_date
                ? new Date(item.intel.updated_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';

              return (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: '#1A1A1A', borderRadius: 12,
                  border: '1px solid #2A2A2A', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</span>
                      {signal && (
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                          background: signal === 'hot' ? 'rgba(34,197,94,0.1)' : signal === 'warm' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: signal === 'hot' ? '#22C55E' : signal === 'warm' ? '#F59E0B' : '#EF4444',
                        }}>
                          {signal === 'hot' ? '🔥' : signal === 'warm' ? '🟡' : '🔵'} {signal}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      {alumni > 0 && `${alumni} alumni found`}
                      {alumni > 0 && reached > 0 && ' · '}
                      {reached > 0 && `${reached} reached out`}
                      {removedDate && ((alumni > 0 || reached > 0) ? ` · removed ${removedDate}` : `removed ${removedDate}`)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => onOpenChat(`Research ${name} hiring`)}
                      style={{
                        fontSize: 10, fontWeight: 600, color: '#888', background: '#2A2A2A',
                        padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        minHeight: 'auto',
                      }}
                    >
                      View Intel
                    </button>
                    <button
                      onClick={() => onReAddCompany(name)}
                      style={{
                        fontSize: 10, fontWeight: 600, color: '#E85D20', background: 'rgba(232,93,32,0.08)',
                        padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      <RotateCcw style={{ width: 10, height: 10 }} /> Re-add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}