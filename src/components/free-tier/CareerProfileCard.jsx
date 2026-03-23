import React from 'react';

const networkColor = { strong: '#22C55E', moderate: '#F59E0B', limited: '#94A3B8' };
const networkLabel = { strong: '🤝 CFF Network: Strong', moderate: '🤝 CFF Network: Moderate', limited: '🤝 CFF Network: Limited' };

export default function CareerProfileCard({ careerProfile, roleRecommendations, onTabChange, onRestart, onPromptSelect }) {
  const suggestedPrompts = roleRecommendations?.length > 0 ? [
    `Tell me more about ${roleRecommendations[0]?.title}`,
    'Show me companies hiring for these roles',
    'I want to explore entrepreneurship',
    "This doesn't feel right — let's try again",
  ] : [];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Profile summary */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #F5F5F5', paddingBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your FastIQ Career Profile</p>
        </div>

        {careerProfile && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
            {[
              ['Work style', careerProfile.work_style],
              ['Environment', careerProfile.environment_preference],
              ['Top strengths', Array.isArray(careerProfile.top_strengths) ? careerProfile.top_strengths.join(', ') : careerProfile.top_strengths],
              ['Motivated by', careerProfile.motivated_by],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#888', minWidth: 120, flexShrink: 0 }}>{label}:</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Role recommendations */}
        {roleRecommendations?.length > 0 && (
          <>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 12px' }}>
              YOUR BEST-FIT ROLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {roleRecommendations.map((rec, i) => (
                <div key={i} style={{ borderLeft: '3px solid #E85D20', paddingLeft: 14 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: '0 0 4px' }}>
                    {i + 1}. {rec.title}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: '0 0 6px', lineHeight: 1.5 }}>{rec.why_it_fits}</p>
                  {rec.honest_challenge && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '0 0 4px' }}>
                      ⚠️ The challenge: {rec.honest_challenge}
                    </p>
                  )}
                  {rec.cff_network_strength && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: networkColor[rec.cff_network_strength] || '#888', margin: 0, fontWeight: 500 }}>
                      {networkLabel[rec.cff_network_strength] || ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => onTabChange?.('company_intel')}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Explore My Company List →
          </button>
          <button onClick={() => onTabChange?.('career_path')}
            style={{ background: 'none', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Dig Into Career Paths →
          </button>
          {onRestart && (
            <button onClick={onRestart}
              style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '10px 4px' }}>
              Update my goals
            </button>
          )}
        </div>
      </div>

      {/* Follow-up chips */}
      {onPromptSelect && suggestedPrompts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 0 }}>
          {suggestedPrompts.map((p, i) => (
            <button key={i} onClick={() => onPromptSelect(p)}
              style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}