import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function DirectoryEmptyState({ onClearFilters }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 18, fontWeight: 500, color: '#333',
        marginBottom: 8,
      }}>
        No members match your search.
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888',
        marginBottom: 20,
      }}>
        Try adjusting your filters or search term.
      </p>
      <button onClick={onClearFilters} style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20',
        background: 'transparent', border: '1.5px solid #E85D20', borderRadius: 100,
        padding: '10px 28px', cursor: 'pointer', minHeight: 'auto',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        Clear Filters
      </button>
    </div>
  );
}