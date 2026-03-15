import React, { useState } from 'react';
import { toast } from 'sonner';

const dmSans = "'DM Sans', system-ui, sans-serif";

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#E85D20',
      background: 'rgba(232,93,32,0.06)', border: '1px solid rgba(232,93,32,0.15)',
      borderRadius: 100, padding: '4px 12px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
    }}>
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

function Section({ title, current, optimized, showOptimized }) {
  const text = showOptimized ? optimized : current;
  if (!text) return null;
  const highlight = showOptimized && optimized && current && optimized !== current;
  return (
    <div style={{
      marginBottom: 20, padding: '14px 16px', borderRadius: 10,
      background: highlight ? 'rgba(76,175,80,0.04)' : 'transparent',
      border: highlight ? '1px solid rgba(76,175,80,0.12)' : '1px solid transparent',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        {showOptimized && optimized && <CopyButton text={optimized} label={`Copy ${title.toLowerCase()} →`} />}
      </div>
      <div style={{
        fontFamily: title === 'Headline' ? dmSans : 'Georgia, serif',
        fontSize: title === 'Headline' ? 18 : 14,
        fontWeight: title === 'Headline' ? 600 : 300,
        color: '#1a1a1a', lineHeight: 1.7, whiteSpace: 'pre-wrap',
      }}>
        {text}
      </div>
    </div>
  );
}

export default function LinkedInProfileView({ result, mode }) {
  const [activeTab, setActiveTab] = useState(mode === 'build' ? 'optimized' : 'current');

  const tabs = mode === 'build'
    ? [{ key: 'optimized', label: 'Your New Profile' }]
    : [{ key: 'current', label: 'Current' }, { key: 'optimized', label: 'Optimized' }];

  const showOptimized = activeTab === 'optimized';

  return (
    <div>
      {/* Tab toggle */}
      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: 3 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: activeTab === t.key ? 500 : 400,
              color: activeTab === t.key ? '#1a1a1a' : '#888',
              background: activeTab === t.key ? '#fff' : 'transparent',
              border: 'none', borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
              flex: 1, transition: 'all 0.2s', minHeight: 'auto',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Profile card */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '24px' }}>
        <Section title="Headline" current={result.parsed_headline} optimized={result.optimized_headline} showOptimized={showOptimized} />
        <Section title="About" current={result.parsed_about} optimized={result.optimized_about} showOptimized={showOptimized} />
        <Section title="Experience" current={result.parsed_experience} optimized={result.optimized_experience} showOptimized={showOptimized} />

        {/* Skills */}
        {showOptimized && result.optimized_skills?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</span>
              <CopyButton text={result.optimized_skills.join(', ')} label="Copy skills →" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.optimized_skills.map((s, i) => (
                <span key={i} style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#555',
                  background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '4px 12px',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {!showOptimized && result.parsed_skills && (
          <Section title="Skills" current={result.parsed_skills} optimized="" showOptimized={false} />
        )}

        {showOptimized && result.optimized_education && (
          <Section title="Education" current="" optimized={result.optimized_education} showOptimized={true} />
        )}

        {showOptimized && result.featured_suggestion && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(232,93,32,0.04)', borderRadius: 10 }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20', margin: '0 0 4px' }}>Featured Section Suggestion</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', margin: 0, lineHeight: 1.5 }}>{result.featured_suggestion}</p>
          </div>
        )}

        {showOptimized && result.recommendations_strategy && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(33,150,243,0.04)', borderRadius: 10 }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#1565c0', margin: '0 0 4px' }}>Who to Ask for Recommendations</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', margin: 0, lineHeight: 1.5 }}>{result.recommendations_strategy}</p>
          </div>
        )}
      </div>
    </div>
  );
}