import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const cffIntroColor = { high: '#22C55E', medium: '#F59E0B', low: '#94A3B8' };
const cffIntroLabel = { high: '🤝 CFF intro: highly valuable', medium: '🤝 CFF intro: helpful', low: '🤝 CFF intro: optional' };

export default function CareerProfileCard({
  careerProfile, roleRecommendations, aboutYou, topStrengths,
  workEnvironment, honestChallenge, cffNetwork, preliminaryArchetype,
  onTabChange, onFindLeads, onRestart, onPromptSelect, userEmail, user,
}) {
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
    'Tell me more →',
    'Show companies →',
    'Start over →',
  ] : [];

  const accentColor = '#E85D20';

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Dark profile card */}
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(232,93,32,0.3)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(232,93,32,0.08)',
        marginBottom: 16,
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 6px' }}>
            ⚡ YOUR FASTIQ CAREER PROFILE
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            Based on everything you shared — here's what we found for you.
          </p>
        </div>

        {/* About You */}
        {aboutYou && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 12px' }}>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 12px' }}>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 12px' }}>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 14px' }}>
              YOUR BEST-FIT ROLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {roleRecommendations.map((rec, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 18, color: '#fff', margin: 0 }}>
                      {i + 1}. {rec.title}
                    </p>
                    {rec.entrepreneurship_path && (
                      <span style={{ fontSize: 11, background: 'rgba(232,93,32,0.15)', color: accentColor, borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>🚀 Founder path</span>
                    )}
                  </div>
                  {rec.specific_companies?.length > 0 && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 8px' }}>
                      Where to look: {rec.specific_companies.join(', ')}
                    </p>
                  )}
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#ccc', margin: '0 0 8px', lineHeight: 1.6 }}>
                    {rec.why_it_fits}
                  </p>
                  {rec.honest_challenge && (
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#F59E0B', margin: '0 0 6px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span>⚠️</span><span>{rec.honest_challenge}</span>
                    </div>
                  )}
                  {rec.no_experience_first_step && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '0 0 6px', fontStyle: 'italic' }}>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 12px' }}>
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, margin: '0 0 12px' }}>
              BEST CFF CONNECTIONS FOR YOU
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
              {cffNetwork}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '0 0 24px 0' }} />

      {/* Bottom section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Primary actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onFindLeads || (() => onTabChange?.('company_intel'))}
              style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
              Find My Leads →
            </button>
            <button onClick={() => onTabChange?.('career_path')}
              style={{ background: '#fff', color: '#E85D20', border: '2px solid #E85D20', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
              Dig Into Career Paths →
            </button>
          </div>
          {onRestart && (
            <button onClick={onRestart}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#999', cursor: 'pointer', textAlign: 'left', width: 'fit-content', fontFamily: "'DM Sans', sans-serif" }}>
              Start over →
            </button>
          )}
        </div>



      </div>

      <style>{`
        .profile-chip:hover { background: #E85D20 !important; color: #fff !important; }
        @media (max-width: 768px) {
          .button-group { flex-direction: column !important; gap: 10px !important; width: 100%; }
          .button-group button { width: 100% !important; text-align: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
}