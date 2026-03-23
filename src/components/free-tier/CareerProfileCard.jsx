import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const cffIntroColor = { high: '#22C55E', medium: '#F59E0B', low: '#94A3B8' };
const cffIntroLabel = { high: '🤝 CFF intro: highly valuable', medium: '🤝 CFF intro: helpful', low: '🤝 CFF intro: optional' };

export default function CareerProfileCard({
  careerProfile, roleRecommendations, aboutYou, topStrengths,
  workEnvironment, honestChallenge, cffNetwork, preliminaryArchetype,
  onTabChange, onFindLeads, onRestart, onPromptSelect, userEmail,
}) {
  // Auto-save to notebook on render
  useEffect(() => {
    if (!roleRecommendations?.length || !userEmail) return;
    const content = [
      preliminaryArchetype?.label ? `Career Profile: ${preliminaryArchetype.label}` : 'Career Goals Profile',
      aboutYou ? `\nAbout You: ${aboutYou}` : '',
      topStrengths?.length ? `\nTop Strengths: ${topStrengths.join(', ')}` : '',
      roleRecommendations.length ? `\nBest-Fit Roles: ${roleRecommendations.map(r => r.title).join(', ')}` : '',
    ].filter(Boolean).join('');
    base44.entities.NotebookEntry.create({
      user_email: userEmail,
      content,
      source_page: 'career_goals',
      source_label: 'Career Goals',
      tags: ['career_goals', 'profile'],
      saved_at: new Date().toISOString(),
    }).catch(() => {});
  }, []);
  const suggestedPrompts = roleRecommendations?.length > 0 ? [
    `Tell me more about ${roleRecommendations[0]?.title}`,
    'Show me companies hiring for these roles',
    'I want to explore entrepreneurship',
    "This doesn't feel right — let's try again",
  ] : [];

  const archetypeLabel = preliminaryArchetype?.label || preliminaryArchetype?.name || null;
  const accentColor = '#E85D20';

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Dark profile card */}
      <div style={{
        background: '#0d1117',
        border: `1px solid rgba(232,93,32,0.3)`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(232,93,32,0.08)',
        marginBottom: 16,
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, margin: '0 0 6px' }}>
            ⚡ YOUR FASTIQ CAREER PROFILE
          </p>
          {archetypeLabel && (
            <>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: accentColor, margin: '0 0 4px' }}>
                {archetypeLabel}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, fontStyle: 'italic' }}>
                Preview — based on your goals conversation.{' '}
                <button
                  onClick={() => onTabChange?.('assessment')}
                  title="Take the full 10-minute FastIQ Assessment to confirm and deepen your archetype"
                  style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 12, padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
                >
                  Take the full assessment to confirm →
                </button>
              </p>
            </>
          )}
        </div>

        {/* About You */}
        {aboutYou && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              ABOUT YOU
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7 }}>
              {aboutYou}
            </p>
          </div>
        )}

        {/* Top Strengths */}
        {topStrengths?.length > 0 && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              TOP STRENGTHS
            </p>
            {topStrengths.map((s, i) => (
              <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px' }}>
                → {s}
              </p>
            ))}
          </div>
        )}

        {/* Work Environment */}
        {(workEnvironment || careerProfile?.environment_preference) && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              WORK ENVIRONMENT
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
              {workEnvironment || careerProfile?.environment_preference}
            </p>
          </div>
        )}

        {/* Best-Fit Roles */}
        {roleRecommendations?.length > 0 && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 14px' }}>
              YOUR BEST-FIT ROLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {roleRecommendations.map((rec, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>
                      {i + 1}. {rec.title}
                    </p>
                    {rec.entrepreneurship_path && (
                      <span style={{ fontSize: 11, background: 'rgba(232,93,32,0.15)', color: accentColor, borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>🚀 Founder path</span>
                    )}
                  </div>
                  {rec.specific_companies?.length > 0 && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>
                      Where to look: {rec.specific_companies.join(', ')}
                    </p>
                  )}
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 8px', lineHeight: 1.6 }}>
                    {rec.why_it_fits}
                  </p>
                  {rec.honest_challenge && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,200,100,0.8)', margin: '0 0 6px', lineHeight: 1.5 }}>
                      ⚠️ {rec.honest_challenge}
                    </p>
                  )}
                  {rec.no_experience_first_step && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', fontStyle: 'italic' }}>
                      First step: {rec.no_experience_first_step}
                    </p>
                  )}
                  {rec.cff_intro_value && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: cffIntroColor[rec.cff_intro_value] || '#888', margin: 0, fontWeight: 500 }}>
                      {cffIntroLabel[rec.cff_intro_value] || ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Honest Challenge */}
        {honestChallenge && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
              THE HONEST NOTE
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
              {honestChallenge}
            </p>
          </div>
        )}

        {/* CFF Network */}
        {cffNetwork && (
          <div style={{ padding: '18px 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              BEST CFF CONNECTIONS FOR YOU
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
              {cffNetwork}
            </p>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={onFindLeads || (() => onTabChange?.('company_intel'))}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Find My Leads →
        </button>
        <button onClick={() => onTabChange?.('career_path')}
          style={{ background: 'none', border: `1.5px solid ${accentColor}`, color: accentColor, borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Dig Into Career Paths →
        </button>
        {onRestart && (
          <button onClick={onRestart}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '10px 4px' }}>
            Update my goals
          </button>
        )}
      </div>

      {/* Assessment upsell */}
      <div style={{ border: `1px solid rgba(232,93,32,0.25)`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, background: 'rgba(232,93,32,0.04)' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#E85D20', margin: '0 0 6px' }}>
          ⚡ Want to go deeper?
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '0 0 12px', lineHeight: 1.6 }}>
          The full FastIQ Career Assessment takes 10 minutes and gives you a scientifically validated Career Archetype that powers your entire CFF experience — company matches, parent connections, outreach templates, all of it.
        </p>
        <button
          onClick={() => onTabChange?.('assessment')}
          style={{ background: 'none', border: `1.5px solid ${accentColor}`, color: accentColor, borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}
        >
          Take the Full Assessment →
        </button>
      </div>

      {/* Follow-up chips */}
      {onPromptSelect && suggestedPrompts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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