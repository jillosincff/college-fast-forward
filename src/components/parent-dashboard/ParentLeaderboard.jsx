import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const MEDALS = ['🥇', '🥈', '🥉'];

function getFamilyDisplayName(family) {
  if (family.familyName || family.family_name) return `The ${family.familyName || family.family_name} Family`;
  if (family.parentLastName || family.parent_last_name) return `The ${family.parentLastName || family.parent_last_name} Family`;
  const fn = family.parentFirstName || family.parent_first_name || family.parent_name || family.name || '';
  if (fn) return `${fn}'s Family`;
  return 'A Family';
}

export default function ParentLeaderboard({ user }) {
  const [families, setFamilies] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.FamilyKarma.list('-total_karma', 20);
        setFamilies((data || []).filter(f => (f.total_karma || 0) > 0));
      } catch {}
    })();
  }, []);

  if (families.length === 0) return null;

  const displayed = showAll ? families : families.slice(0, 5);

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>Most Helpful This Month</h2>
        {families.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange, cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto' }}
          >{showAll ? 'Show less' : 'View all →'}</button>
        )}
      </div>

      {displayed.map((f, i) => (
        <div key={f.id || i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: '0.5px solid rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#1a1a1a', width: 24, textAlign: 'center' }}>
            {i < 3 ? MEDALS[i] : i + 1}
          </span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#1a1a1a', flex: 1 }}>
            {getFamilyDisplayName(f)}
          </span>
          {(f.total_karma || 0) > 50 && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500,
              background: 'rgba(232,93,32,0.08)', color: orange,
              borderRadius: 100, padding: '2px 8px',
            }}>Active</span>
          )}
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 16, color: orange }}>
            {f.total_karma || 0}
          </span>
        </div>
      ))}

      {!showAll && families.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            display: 'block', margin: '12px auto 0', background: 'none', border: 'none',
            fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange,
            cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto',
          }}
        >Show Top 20 →</button>
      )}
    </div>
  );
}