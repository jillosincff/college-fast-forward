import React, { useState } from 'react';
import { toast } from 'sonner';

const dmSans = "'DM Sans', system-ui, sans-serif";

const priorityStyles = {
  high: { bg: 'rgba(229,57,53,0.08)', color: '#e53935' },
  medium: { bg: 'rgba(255,167,38,0.08)', color: '#FFA726' },
  low: { bg: 'rgba(76,175,80,0.08)', color: '#2e7d32' },
};

export default function LinkedInSuggestionsPanel({ suggestions, onMarkDone }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sorted = [...(suggestions || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] || 2) - (order[b.priority] || 2);
  });

  return (
    <div>
      <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 14 }}>Fix These First</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((s) => {
          const ps = priorityStyles[s.priority] || priorityStyles.low;
          return (
            <div key={s.id} style={{
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12,
              padding: '14px 16px', opacity: s.implemented ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: ps.bg, color: ps.color, textTransform: 'uppercase' }}>
                  {s.priority}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 100, background: 'rgba(0,0,0,0.04)', color: '#555' }}>
                  {s.section}
                </span>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px' }}>{s.issue}</p>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', lineHeight: 1.5, margin: '0 0 8px' }}>{s.suggestion}</p>
              {s.example_content && (
                <div style={{ background: 'rgba(232,93,32,0.04)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, fontStyle: 'italic', color: 'rgba(232,93,32,0.8)', margin: 0, lineHeight: 1.5 }}>
                    {s.example_content}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {s.example_content && (
                  <button onClick={() => handleCopy(s.example_content, s.id)} style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#E85D20',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto',
                  }}>
                    {copiedId === s.id ? '✓ Copied!' : 'Copy this →'}
                  </button>
                )}
                <button onClick={() => onMarkDone(s.id)} style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#aaa',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto',
                }}>
                  {s.implemented ? '✓ Done' : 'Mark done ✓'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}