import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

export default function PastResearchSection({ pastResearch, onReAddCompany, onOpenChat }) {
  const [expanded, setExpanded] = useState(false);

  if (!pastResearch || pastResearch.length === 0) return null;

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
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Past Research ({pastResearch.length})
        </span>
        {expanded
          ? <ChevronDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
          : <ChevronRight style={{ width: 14, height: 14, color: '#94A3B8' }} />
        }
      </button>

      {expanded && (
        <div style={{
          background: '#FAFBFC', borderRadius: 14, border: '1px solid #E2E8F0',
          padding: '16px', marginTop: 8,
        }}>
          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14, lineHeight: 1.5 }}>
            Companies you previously researched that are no longer targets. Your data is preserved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastResearch.map((item) => {
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
                  padding: '12px 14px', background: '#fff', borderRadius: 10,
                  border: '1px solid #E2E8F0', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{name}</span>
                      {signal && (
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                          background: signal === 'hot' ? '#FFF7ED' : signal === 'warm' ? '#FEFCE8' : '#F1F5F9',
                          color: signal === 'hot' ? '#EA580C' : signal === 'warm' ? '#CA8A04' : '#64748B',
                        }}>
                          {signal === 'hot' ? '🔥' : signal === 'warm' ? '🟡' : '🔵'} {signal}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
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
                        fontSize: 10, fontWeight: 600, color: '#64748B', background: '#F1F5F9',
                        padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        minHeight: 'auto',
                      }}
                    >
                      View Intel
                    </button>
                    <button
                      onClick={() => onReAddCompany(name)}
                      style={{
                        fontSize: 10, fontWeight: 600, color: '#0021A5', background: 'rgba(0,33,165,0.06)',
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