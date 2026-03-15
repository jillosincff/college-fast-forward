import React, { useState } from 'react';
import LinkedInScorePanel from './LinkedInScorePanel';
import LinkedInProfileView from './LinkedInProfileView';
import LinkedInSuggestionsPanel from './LinkedInSuggestionsPanel';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function LinkedInResults({ result, mode, onStartOver }) {
  const [suggestions, setSuggestions] = useState(result.suggestions || []);

  const handleMarkDone = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, implemented: !s.implemented } : s));
  };

  // Build mode completion tracker
  const buildSections = mode === 'build' ? ['headline', 'about', 'experience', 'skills', 'education'] : [];

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Mono:wght@400;700&display=swap');
        .li-grid { display: grid; grid-template-columns: 240px 1fr 280px; gap: 20px; }
        @media (max-width: 900px) { .li-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', margin: 0 }}>
              LinkedIn <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>
                {mode === 'build' ? 'Built' : 'Analyzed'}
              </em>
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginTop: 4 }}>
              {suggestions.length} suggestions · Score: {result.overall_score}/100
            </p>
          </div>
          <button onClick={onStartOver} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#888',
            background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100,
            padding: '8px 20px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
          }}>
            ← Start Over
          </button>
        </div>

        <div className="li-grid">
          <LinkedInScorePanel
            overallScore={result.overall_score || 0}
            sectionScores={result.section_scores}
            suggestionsCount={suggestions.length}
          />
          <LinkedInProfileView result={result} mode={mode} />
          <LinkedInSuggestionsPanel suggestions={suggestions} onMarkDone={handleMarkDone} />
        </div>

        {/* Next steps for build mode */}
        {mode === 'build' && result.next_steps?.length > 0 && (
          <div style={{ marginTop: 32, background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', padding: '24px' }}>
            <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>What to Do Next</h3>
            <ol style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#555', lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
              {result.next_steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}