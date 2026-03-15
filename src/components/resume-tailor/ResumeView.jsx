import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const TABS = [
  { key: 'original', label: 'Original' },
  { key: 'tailored', label: 'Tailored' },
];

export default function ResumeView({ originalText, tailoredText, changes, activeTab, onTabChange }) {
  const text = activeTab === 'original' ? originalText : tailoredText;

  return (
    <div>
      {/* Tab Toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, background: 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 3 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1, fontFamily: dmSans, fontSize: 12, fontWeight: activeTab === tab.key ? 500 : 400,
              color: activeTab === tab.key ? '#1a1a1a' : '#888',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              border: 'none', borderRadius: 8, padding: '8px 12px',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resume Display */}
      <div style={{
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 14, padding: '24px 28px',
        maxHeight: 600, overflowY: 'auto',
      }}>
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 13, lineHeight: 1.5, color: '#1a1a1a',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {(text || 'No resume content available.').split('\n').map((line, i) => {
            const isHeader = /^[A-Z][A-Z\s&]+$/.test(line.trim()) && line.trim().length < 40;
            if (isHeader) {
              return (
                <div key={i} style={{ marginTop: 16, marginBottom: 4, paddingBottom: 2, borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {line}
                  </span>
                </div>
              );
            }
            return <p key={i} style={{ margin: '2px 0' }}>{line}</p>;
          })}
        </div>

        {/* Change badges in tailored view */}
        {activeTab === 'tailored' && changes.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 6 }}>
              {changes.length} sections modified
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {changes.map((c, i) => (
                <span key={i} style={{
                  fontFamily: dmSans, fontSize: 10, fontWeight: 500,
                  background: c.accepted === true ? 'rgba(76,175,80,0.08)' : c.accepted === false ? 'rgba(0,0,0,0.04)' : 'rgba(232,93,32,0.08)',
                  color: c.accepted === true ? '#2e7d32' : c.accepted === false ? '#aaa' : '#E85D20',
                  borderRadius: 100, padding: '2px 8px',
                }}>
                  {c.section || 'Change'} · {c.type || 'modified'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}