import React from 'react';
import { dmSans } from './PipelineConstants';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'needs_action', label: 'Needs Action' },
  { key: 'matched', label: 'Matched' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'won', label: 'Won' },
];

const SORT_OPTIONS = [
  { key: 'recent', label: 'Sort: Most Recent' },
  { key: 'stage', label: 'Sort: Stage' },
  { key: 'name', label: 'Sort: Name' },
];

export default function PipelineFilterRow({ activeTab, onTabChange, sortBy, onSortChange }) {
  return (
    <div className="pipeline-filter-row" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    }}>
      <div className="pipeline-filter-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {TABS.map(t => {
          const active = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => onTabChange(t.key)} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
              color: active ? '#fff' : '#888',
              background: active ? '#E85D20' : '#fff',
              border: `0.5px solid ${active ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
              transition: 'all 0.2s', minHeight: 'auto', width: 'auto', flexShrink: 0,
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = '#E85D20'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#888'; } }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <select value={sortBy} onChange={e => onSortChange(e.target.value)} style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888',
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8,
        padding: '5px 10px', minHeight: 'auto', width: 'auto', flexShrink: 0,
      }}>
        {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
    </div>
  );
}