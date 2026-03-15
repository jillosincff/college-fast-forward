import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function DirectoryLoadMore({ visibleCount, totalCount, onLoadMore }) {
  const allLoaded = visibleCount >= totalCount;

  return (
    <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
      {allLoaded ? (
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
        }}>
          You've seen everyone!
        </p>
      ) : (
        <>
          <button onClick={onLoadMore} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#0d1117',
            background: 'transparent', border: '1.5px solid rgba(0,0,0,0.2)',
            borderRadius: 100, padding: '10px 32px', cursor: 'pointer',
            transition: 'border-color 0.15s', minHeight: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85D20'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; }}
          >
            Load More Members
          </button>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa',
            marginTop: 8,
          }}>
            Showing {visibleCount} of {totalCount} members
          </p>
        </>
      )}
    </div>
  );
}