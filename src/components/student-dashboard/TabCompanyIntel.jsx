import React, { useState } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER, MUTED } from './constants';
import { Search } from 'lucide-react';

const SAMPLE_COMPANIES = [
  { name: 'Nike', industry: 'Consumer Goods', signal: 'green', insight: 'Nike expanded their marketing team by 12% this quarter.' },
  { name: 'Goldman Sachs', industry: 'Finance', signal: 'green', insight: 'Goldman is actively recruiting for analyst positions across 5 offices.' },
  { name: 'Spotify', industry: 'Tech/Media', signal: 'yellow', insight: 'Spotify is selectively hiring for product and engineering roles.' },
  { name: 'Deloitte', industry: 'Consulting', signal: 'green', insight: 'Deloitte opened 200+ new grad positions for spring recruiting.' },
  { name: 'Tesla', industry: 'Automotive/Tech', signal: 'yellow', insight: 'Tesla engineering internships are competitive but open for summer.' },
  { name: 'Meta', industry: 'Technology', signal: 'red', insight: 'Meta has paused most entry-level hiring through Q2.' },
];

const SIGNALS = { green: { label: 'Actively Hiring', color: '#10B981' }, yellow: { label: 'Selective Hiring', color: '#F59E0B' }, red: { label: 'Hiring Freeze', color: '#EF4444' } };
const FILTERS = ['All', 'Actively Hiring', 'Your Industry', 'Trending'];

export default function TabCompanyIntel({ user }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = SAMPLE_COMPANIES.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'Actively Hiring') return c.signal === 'green';
    return true;
  });

  return (
    <div>
      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>What's happening at companies that matter.</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 24 }}>Hiring signals, culture insights, and open roles — updated regularly.</p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search any company..."
          style={{ width: '100%', background: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px 12px 40px', fontFamily: dmSans, fontSize: 14, color: '#fff', boxSizing: 'border-box' }} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} data-chip="true"
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: filter === f ? 600 : 400, color: filter === f ? '#fff' : MUTED, background: filter === f ? 'rgba(232,93,32,0.15)' : 'transparent', border: `1px solid ${filter === f ? 'rgba(232,93,32,0.3)' : BORDER}`, borderRadius: 100, padding: '7px 16px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Company grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(c => {
          const sig = SIGNALS[c.signal];
          return (
            <div key={c.name} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{c.name}</p>
                  <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>{c.industry}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sig.color, display: 'inline-block' }} />
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: sig.color }}>{sig.label}</span>
                </div>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa', lineHeight: 1.55, marginBottom: 14 }}>{c.insight}</p>
              <button style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}>
                View Intel →
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: MUTED }}>Start by adding companies you're interested in from your Career Goals tab.</p>
        </div>
      )}
    </div>
  );
}