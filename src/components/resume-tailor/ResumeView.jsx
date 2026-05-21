import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const TABS = [
  { key: 'original', label: 'Before' },
  { key: 'tailored', label: 'Optimized' },
];

export default function ResumeView({ originalText, tailoredText, changes, activeTab, onTabChange, tailoredScore }) {
  const text = activeTab === 'original' ? originalText : tailoredText;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Calculate key improvements for summary box
  const improvements = [];
  if (tailoredScore) improvements.push(`ATS Score: ${tailoredScore}%`);
  if (changes.length > 0) improvements.push(`${changes.length} sections strengthened`);
  improvements.push('Bullet points enhanced');
  improvements.push('Keywords optimized');

  return (
    <div>
      {/* Summary Box - Show in tailored view */}
      {activeTab === 'tailored' && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '2px solid #22c55e',
          borderRadius: 12,
          padding: isMobile ? '16px' : '20px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              background: '#22c55e',
              color: '#fff',
              borderRadius: 8,
              padding: '4px 12px',
              fontFamily: dmSans,
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              ✓ Optimized
            </div>
            {tailoredScore && (
              <div style={{
                background: tailoredScore >= 80 ? '#22c55e' : tailoredScore >= 60 ? '#f59e0b' : '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 800,
              }}>
                {tailoredScore}
              </div>
            )}
          </div>
          <p style={{
            fontFamily: dmSans,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 8px',
          }}>
            Your resume just leveled up
          </p>
          <p style={{
            fontFamily: dmSans,
            fontSize: isMobile ? 12 : 13,
            color: '#666',
            margin: '0 0 12px',
            lineHeight: 1.5,
          }}>
            The Agent rewrote your bullets, improved the layout, and made it ATS-ready.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {improvements.map((imp, i) => (
              <span key={i} style={{
                background: '#fff',
                border: '1px solid #22c55e',
                borderRadius: 100,
                padding: '4px 10px',
                fontFamily: dmSans,
                fontSize: 11,
                fontWeight: 600,
                color: '#16a34a',
              }}>
                {imp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab Toggle - Enhanced for mobile */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 16,
        background: 'rgba(0,0,0,0.04)',
        borderRadius: 10,
        padding: 3,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              fontFamily: dmSans,
              fontSize: isMobile ? 13 : 12,
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? '#1a1a1a' : '#888',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: 8,
              padding: isMobile ? '10px 12px' : '8px 12px',
              cursor: 'pointer',
              minHeight: 'auto',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
              ...(activeTab === tab.key && {
                border: '2px solid #E85D20',
              }),
            }}
          >
            {tab.label}
            {tab.key === 'tailored' && (
              <span style={{
                marginLeft: 6,
                background: '#22c55e',
                color: '#fff',
                borderRadius: 100,
                padding: '2px 6px',
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                New
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Resume Display - Mobile optimized */}
      <div style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 14,
        padding: isMobile ? '20px' : '24px 28px',
        minHeight: isMobile ? 'auto' : 600,
        maxHeight: isMobile ? 'none' : 600,
        overflowY: isMobile ? 'visible' : 'auto',
      }}>
        {!text && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 10 }}>
            <span style={{ fontSize: 32 }}>📄</span>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa', margin: 0, textAlign: 'center' }}>
              Resume content is still loading.<br />Try refreshing or re-uploading your resume.
            </p>
          </div>
        )}
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: isMobile ? 15 : 13,
          lineHeight: isMobile ? 1.6 : 1.5,
          color: '#1a1a1a',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: text ? 'block' : 'none',
        }}>
          {(text || '').split('\n').map((line, i) => {
            const isHeader = /^[A-Z][A-Z\s&]+$/.test(line.trim()) && line.trim().length < 40;
            if (isHeader) {
              return (
                <div key={i} style={{
                  marginTop: isMobile ? 20 : 16,
                  marginBottom: isMobile ? 8 : 4,
                  paddingBottom: 3,
                  borderBottom: '2px solid #1a1a1a',
                }}>
                  <span style={{
                    fontFamily: dmSans,
                    fontSize: isMobile ? 14 : 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {line}
                  </span>
                </div>
              );
            }
            return (
              <p
                key={i}
                style={{
                  margin: isMobile ? '6px 0' : '2px 0',
                  fontSize: isMobile ? 15 : 13,
                  lineHeight: isMobile ? 1.6 : 1.5,
                }}
              >
                {line}
              </p>
            );
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