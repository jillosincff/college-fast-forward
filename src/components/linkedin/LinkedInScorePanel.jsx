import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function ScoreBar({ label, score }) {
  const color = score >= 70 ? '#4CAF50' : score >= 50 ? '#FFA726' : '#e53935';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#1a1a1a' }}>{label}</span>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa' }}>{score}/100</span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function LinkedInScorePanel({ overallScore, sectionScores, suggestionsCount }) {
  const scoreLabel = overallScore >= 90 ? 'Recruiter Magnet 🎯' : overallScore >= 70 ? 'Strong Profile' : overallScore >= 50 ? 'Needs Work' : 'Major Gaps';
  const scoreColor = overallScore >= 70 ? '#4CAF50' : overallScore >= 50 ? '#FFA726' : '#e53935';
  const sections = sectionScores || {};

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', padding: '24px 20px' }}>
      {/* Overall Score Ring */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={`${(overallScore / 100) * 264} 264`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{overallScore}</span>
          </div>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: scoreColor, margin: 0 }}>{scoreLabel}</p>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', marginTop: 2 }}>/100 profile strength</p>
      </div>

      {/* Section Scores */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
        <ScoreBar label="Headline" score={sections.headline || 0} />
        <ScoreBar label="About" score={sections.about || 0} />
        <ScoreBar label="Experience" score={sections.experience || 0} />
        <ScoreBar label="Skills" score={sections.skills || 0} />
        <ScoreBar label="Education" score={sections.education || 0} />
        <ScoreBar label="Completeness" score={sections.completeness || 0} />
      </div>

      {/* Suggestions count */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(232,93,32,0.04)', borderRadius: 10, textAlign: 'center' }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20' }}>
          {suggestionsCount} improvement{suggestionsCount !== 1 ? 's' : ''} found
        </span>
      </div>
    </div>
  );
}