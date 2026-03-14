import React from 'react';
import { dmSans, playfair, STAGES } from './PipelineConstants';

export default function PipelineStatsRow({ connections, activeFilter, onFilter }) {
  const counts = {};
  STAGES.forEach(s => { counts[s.key] = 0; });
  let total = 0;
  (connections || []).forEach(c => {
    total++;
    if (counts[c.status] !== undefined) counts[c.status]++;
  });

  const cards = [
    { key: 'all', dot: '#888', count: total, label: 'Total Connections' },
    ...STAGES.filter(s => s.key !== 'no_response').map(s => ({
      key: s.key, dot: s.dot, count: counts[s.key] || 0, label: s.label,
    })),
  ];

  return (
    <div className="pipeline-stats-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 28,
    }}>
      {cards.map(c => {
        const active = activeFilter === c.key;
        return (
          <button key={c.key} onClick={() => onFilter(c.key === activeFilter ? null : c.key)} style={{
            background: active ? 'rgba(232,93,32,0.04)' : '#fff',
            border: `0.5px solid ${active ? '#E85D20' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
            transition: 'all 0.2s', textAlign: 'left', minHeight: 'auto', width: 'auto',
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; } }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, marginBottom: 8 }} />
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', lineHeight: 1, marginBottom: 4 }}>{c.count}</div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#aaa', lineHeight: 1.3 }}>{c.label}</div>
          </button>
        );
      })}
      <style>{`
        @media(max-width:768px) { .pipeline-stats-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </div>
  );
}