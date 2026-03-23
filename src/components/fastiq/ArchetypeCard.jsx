import React, { useState, useEffect, useRef } from 'react';

export default function ArchetypeCard({ result, onTabChange, onRetake }) {
  const [visible, setVisible] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!result) return null;

  const {
    archetype_name, primary_holland_code, secondary_holland_code,
    archetype_description, top_strengths, work_environment,
    best_fit_roles, roles_to_avoid, famous_examples,
    honest_challenge, cff_network_recommendation,
  } = result;

  const archetypeKey = (archetype_name || '').replace('THE ', '').trim();
  const archetypeColors = {
    BUILDER: '#E85D20', ANALYST: '#4F8CFF', CREATOR: '#A855F7',
    CONNECTOR: '#22C55E', CHAMPION: '#F59E0B', OPERATOR: '#94A3B8',
  };
  const accentColor = archetypeColors[archetypeKey] || '#E85D20';

  const handleShare = async () => {
    setSharing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `fastiq-${(archetype_name || 'archetype').toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Share failed:', e);
    }
    setSharing(false);
  };

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>
      <div ref={cardRef} style={{
        background: '#0d1117',
        border: `1px solid ${accentColor}40`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: `0 0 40px ${accentColor}20`,
        marginBottom: 24,
      }}>
        {/* Header */}
        <div style={{ padding: '32px 28px 24px', borderBottom: `1px solid ${accentColor}20` }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, margin: '0 0 6px' }}>
            ⚡ YOUR FASTIQ CAREER ARCHETYPE
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: accentColor, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {archetype_name}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', letterSpacing: '0.05em' }}>
            {primary_holland_code}{secondary_holland_code ? ` · ${secondary_holland_code}` : ''}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
            {archetype_description}
          </p>
        </div>

        {/* Top strengths */}
        {top_strengths?.length > 0 && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 12px' }}>
              TOP STRENGTHS
            </p>
            {top_strengths.map((s, i) => (
              <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px' }}>
                → {s}
              </p>
            ))}
          </div>
        )}

        {/* Thrives in */}
        {work_environment && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              THRIVES IN
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
              {work_environment}
            </p>
          </div>
        )}

        {/* Best-fit roles */}
        {best_fit_roles?.length > 0 && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 12px' }}>
              BEST-FIT ROLES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {best_fit_roles.map((r, i) => (
                <span key={i} style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  color: 'rgba(255,255,255,0.85)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  {r.entrepreneurship_path && <span style={{ fontSize: 10 }}>🚀</span>}
                  {r.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roles to avoid */}
        {roles_to_avoid?.length > 0 && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#EF4444', margin: '0 0 12px' }}>
              ROLES TO AVOID
            </p>
            {roles_to_avoid.map((r, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{r.title}</span>
                {r.why && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>— {r.why}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Famous examples */}
        {famous_examples?.length > 0 && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              FAMOUS {archetypeKey}S
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {famous_examples.join(' · ')}
            </p>
          </div>
        )}

        {/* Honest note */}
        {honest_challenge && (
          <div style={{ padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>
              THE HONEST NOTE
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
              {honest_challenge}
            </p>
          </div>
        )}

        {/* CFF network */}
        {cff_network_recommendation && (
          <div style={{ padding: '20px 28px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accentColor, margin: '0 0 10px' }}>
              BEST CFF CONNECTIONS FOR YOU
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
              {cff_network_recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Share button */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <button
          onClick={handleShare}
          disabled={sharing}
          style={{ background: 'rgba(232,93,32,0.12)', border: '1.5px solid rgba(232,93,32,0.4)', color: '#E85D20', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: sharing ? 'default' : 'pointer', minHeight: 'auto', opacity: sharing ? 0.7 : 1 }}
        >
          {sharing ? 'Generating...' : '📸 Share My Archetype'}
        </button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>Downloads as an image — perfect for LinkedIn or Instagram</p>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <button onClick={() => onTabChange?.('company_intel')}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Explore Companies That Hire {archetypeKey}s →
        </button>
        <button onClick={() => onTabChange?.('career_path')}
          style={{ background: 'none', border: `1.5px solid ${accentColor}`, color: accentColor, borderRadius: 100, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Career Paths for My Archetype →
        </button>
        <button onClick={() => onTabChange?.('alumni_network')}
          style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 100, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Find CFF Parents Who Are {archetypeKey}s →
        </button>
        <button onClick={onRetake}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '11px 4px' }}>
          Retake Assessment
        </button>
      </div>
    </div>
  );
}