import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

function ScoreRing({ score, size = 70, color }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100)) / 100;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 18, fontWeight: 700, fontFamily: dmSans, fill: color }}>
        {score}%
      </text>
    </svg>
  );
}

export default function ScorePanel({ originalScore, tailoredScore, keywordsAdded, keywordsMissing, acceptedCount, rejectedCount, pendingCount, totalChanges }) {
  const pct = totalChanges > 0 ? acceptedCount / totalChanges : 0;

  return (
    <div>
      {/* Match Score */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', letterSpacing: '0.06em', marginBottom: 12 }}>
          Resume Match Score
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ScoreRing score={originalScore} color="#94A3B8" />
          <span style={{ fontFamily: dmSans, fontSize: 18, color: '#ccc' }}>→</span>
          <ScoreRing score={tailoredScore} color={orange} />
        </div>
      </div>

      {/* Keywords */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
        {keywordsAdded.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#2e7d32', marginBottom: 6 }}>Keywords added</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {keywordsAdded.map((k, i) => (
                <span key={i} style={{ fontFamily: dmSans, fontSize: 11, background: 'rgba(76,175,80,0.08)', color: '#2e7d32', borderRadius: 100, padding: '2px 8px' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {keywordsMissing.length > 0 && (
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: orange, marginBottom: 6 }}>Still missing</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {keywordsMissing.map((k, i) => (
                <span key={i} style={{ fontFamily: dmSans, fontSize: 11, background: 'rgba(232,93,32,0.08)', color: orange, borderRadius: 100, padding: '2px 8px' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Changes Summary */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16 }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 4 }}>
          {totalChanges} changes made
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', marginBottom: 8 }}>
          {acceptedCount} accepted · {pendingCount} pending · {rejectedCount} rejected
        </p>
        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: '#4CAF50', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}