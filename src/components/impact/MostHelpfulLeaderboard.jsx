import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function MostHelpfulLeaderboard({ families }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? (families || []).slice(0, 20) : (families || []).slice(0, 5);

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.06)',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a',
          letterSpacing: '-0.01em', margin: 0,
        }}>
          Most Helpful This Month
        </h3>
        {families?.length > 5 && !showAll && (
          <button onClick={() => setShowAll(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
            minHeight: 'auto', width: 'auto',
          }}>
            View all →
          </button>
        )}
      </div>

      {/* List */}
      {displayed.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayed.map((family, i) => (
            <div key={family.id || i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              background: i < 3 ? 'rgba(232,93,32,0.03)' : 'transparent',
            }}>
              {/* Rank */}
              <span style={{
                fontFamily: dmSans, fontSize: 16, minWidth: 28, textAlign: 'center',
              }}>
                {i < 3 ? '🏆' : (
                  <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#aaa' }}>{i + 1}</span>
                )}
              </span>

              {/* Name */}
              <span style={{
                fontFamily: dmSans, fontSize: 14,
                fontWeight: family.isCurrentUser ? 600 : 400,
                color: family.isCurrentUser ? '#E85D20' : '#1a1a1a',
                flex: 1,
              }}>
                {family.displayName || 'A Family'}
                {family.isCurrentUser && (
                  <span style={{
                    fontFamily: dmSans, fontSize: 10, fontWeight: 500,
                    color: '#E85D20', background: 'rgba(232,93,32,0.1)',
                    borderRadius: 100, padding: '2px 8px', marginLeft: 8,
                  }}>You</span>
                )}
              </span>

              {/* Status */}
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                color: '#16a34a', background: 'rgba(34,197,94,0.08)',
                borderRadius: 100, padding: '3px 10px',
              }}>
                Active
              </span>

              {/* Karma */}
              <span style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#E85D20',
                minWidth: 40, textAlign: 'right',
              }}>
                {family.karma || '--'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa',
          textAlign: 'center', padding: '24px 0',
        }}>
          No activity this month yet. Be the first!
        </p>
      )}

      {/* Show top 20 */}
      {!showAll && families?.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setShowAll(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
            minHeight: 'auto', width: 'auto',
          }}>
            Show Top 20 →
          </button>
        </div>
      )}
      {showAll && families?.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setShowAll(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888',
            minHeight: 'auto', width: 'auto',
          }}>
            Show less
          </button>
        </div>
      )}
    </div>
  );
}