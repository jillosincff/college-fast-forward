import React from 'react';
import { Target } from 'lucide-react';

export default function GoalsSummaryCard({ goals, onTabChange, onRestart }) {
  const roles = goals?.target_roles?.join(', ') || goals?.role || '—';
  const industries = goals?.target_industries?.join(', ') || goals?.industries?.join(', ') || '—';
  const seeking = goals?.seeking || '—';
  const gradYear = goals?.graduation_year?.toString() || '—';
  const location = goals?.location_preference || goals?.locations?.[0] || '—';
  const dreamCo = goals?.dream_company || '—';
  const experience = goals?.experience_level || '—';

  const rows = [
    ['Target Roles', roles],
    ['Industries', industries],
    ['Looking for', `${seeking}${gradYear !== '—' ? ` · Graduating ${gradYear}` : ''}`],
    ['Location', location],
    ['Dream Company', dreamCo],
    ['Experience', experience],
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Target style={{ width: 20, height: 20, color: '#E85D20' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Career Goals</p>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#888', minWidth: 120, flexShrink: 0 }}>{label}:</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={() => onTabChange?.('company_intel')}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Explore My Company List →
        </button>
        <button onClick={() => onTabChange?.('career_path')}
          style={{ background: 'none', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Dig Into Career Paths →
        </button>
        {onRestart && (
          <button onClick={onRestart}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '10px 4px' }}>
            Update my goals
          </button>
        )}
      </div>
    </div>
  );
}