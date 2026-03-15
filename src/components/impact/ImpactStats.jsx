import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const TIME_FILTERS = [
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: 'all', label: 'All' },
];

function StatTile({ label, value, delta }) {
  const display = value == null || value === 0 ? '--' : value;
  const showDelta = delta != null && delta !== 0;

  return (
    <div style={{
      flex: 1, minWidth: 120, position: 'relative',
      padding: '20px 16px', textAlign: 'center',
    }}>
      {showDelta && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(34,197,94,0.1)', color: '#16a34a',
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          borderRadius: 100, padding: '2px 8px',
        }}>
          +{delta}
        </span>
      )}
      <p style={{
        fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#0d1117',
        letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
      }}>
        {display}
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', margin: 0,
      }}>
        {label}
      </p>
    </div>
  );
}

export default function ImpactStats({ stats, timeFilter, onTimeFilterChange }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Time filter */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0',
      }}>
        <div style={{
          display: 'flex', gap: 4, background: 'rgba(0,0,0,0.03)',
          borderRadius: 100, padding: 3,
        }}>
          {TIME_FILTERS.map(f => (
            <button key={f.id} onClick={() => onTimeFilterChange(f.id)} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: timeFilter === f.id ? 500 : 400,
              color: timeFilter === f.id ? '#fff' : '#888',
              background: timeFilter === f.id ? '#E85D20' : 'transparent',
              border: 'none', borderRadius: 100, padding: '5px 12px',
              cursor: 'pointer', transition: 'all 0.2s',
              minHeight: 'auto', width: 'auto',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="impact-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 8px 20px',
      }}>
        <StatTile label="Students Helped" value={stats.studentsHelped} delta={stats.studentsHelpedDelta} />
        <StatTile label="Answers Given" value={stats.answersGiven} delta={stats.answersGivenDelta} />
        <StatTile label="Intros Made" value={stats.introsMade} delta={stats.introsMadeDelta} />
        <StatTile label="Success Rate" value={stats.successRate ? `${stats.successRate}%` : null} delta={stats.successRateDelta ? `${stats.successRateDelta}%` : null} />
      </div>

      <style>{`
        @media(max-width:640px) {
          .impact-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}