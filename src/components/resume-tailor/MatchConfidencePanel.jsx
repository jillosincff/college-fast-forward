import React, { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

function matchLabel(score) {
  if (score >= 75) return { label: 'Strong Match', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (score >= 55) return { label: 'Good Match', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Improved Match', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' };
}

// Confidence-first match panel: label + plain-English sentence; percentages behind an expander.
export default function MatchConfidencePanel({ originalScore, tailoredScore, keywordsAdded = [], keywordsMissing = [] }) {
  const [showDetails, setShowDetails] = useState(false);
  const m = matchLabel(tailoredScore);

  return (
    <div>
      {/* Match confidence */}
      <div style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 14, padding: 20, marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 19, fontWeight: 900, color: m.color, margin: '0 0 6px' }}>{m.label}</p>
        <p style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
          Your resume is now much better aligned with this role.
        </p>
        <button onClick={() => setShowDetails(v => !v)}
          style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 4px 0', textDecoration: 'underline' }}>
          {showDetails ? 'Hide details' : 'See details'}
        </button>
        {showDetails && (
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '8px 0 0' }}>
            Match score improved from <strong>{originalScore}%</strong> to <strong style={{ color: m.color }}>{tailoredScore}%</strong>.
          </p>
        )}
      </div>

      {/* What now matches this job */}
      {keywordsAdded.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 8 }}>What now matches this job</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {keywordsAdded.map((k, i) => (
              <span key={i} style={{ fontFamily: dm, fontSize: 11.5, background: 'rgba(76,175,80,0.08)', color: '#2e7d32', borderRadius: 100, padding: '3px 10px' }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nice to have (soft framing of missing keywords) */}
      {keywordsMissing.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', marginBottom: 4 }}>Nice to have</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: '0 0 8px', lineHeight: 1.4 }}>
            Optional improvements — only add these if they truly reflect your experience.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {keywordsMissing.map((k, i) => (
              <span key={i} style={{ fontFamily: dm, fontSize: 11.5, background: 'rgba(0,0,0,0.04)', color: '#6b7280', borderRadius: 100, padding: '3px 10px' }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}