import React, { useState, useEffect } from 'react';
import { PulseDot } from './LiveTickerBar';
import ProgressRing from './ProgressRing';

function HeroStatusLineInline({ lines = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const safeLines = lines && lines.length > 0 ? lines : ['⚡ FASTIQ is scanning the market for you'];

  useEffect(() => {
    if (safeLines.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % safeLines.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [safeLines.length]);

  return (
    <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
      <span style={{
        fontSize: 12, color: 'rgba(244,240,232,0.45)', fontWeight: 300,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'opacity 0.4s ease-in-out',
        opacity: visible ? 1 : 0,
        lineHeight: 1.4,
      }}>
        {safeLines[currentIdx % safeLines.length]}
      </span>
    </div>
  );
}

export default function HeroSection({ userName, user, profile, statValues, onOpenChat, statusLines, onEditProfile }) {
  const major = user?.major || user?.student_major || profile?.target_industry || '';
  const gradYear = user?.graduation_year || '';
  const location = profile?.location_preference || '';
  const targetCompanies = profile?.target_companies || [];

  const profileLine = ['UF', major, gradYear, location].filter(Boolean).join(' · ');

  const rings = [
    { value: statValues.targets, max: 5, label: 'Targets\nLocked', color: '#FF6B3D' },
    { value: statValues.insiders, max: 15, label: 'Alumni\nFound', color: '#22D3EE' },
    { value: statValues.messages, max: 10, label: 'Intros\nSent', color: '#A78BFA' },
    { value: statValues.warmPaths, max: 5, label: 'Replies', color: '#4ADE80' },
  ];

  return (
    <>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,93,32,0.1), transparent 70%)',
        animation: 'fiq-heroGlow 4s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -60, width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,93,32,0.06), transparent 70%)',
        animation: 'fiq-heroGlow 5s ease-in-out infinite 1s', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto', padding: '32px 20px 40px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '0.02em' }}>FASTIQ™</span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(16,185,129,0.2)', color: '#34D399',
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            }}>
              <PulseDot color="#34D399" size={6} /> ACTIVE
            </span>
          </div>
          <button
            onClick={() => onOpenChat()}
            style={{
              background: '#FA4616', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s', boxShadow: '0 0 20px rgba(250,70,22,0.4)',
              minHeight: 'auto',
            }}
          >
            ✨ Open Chat →
          </button>
        </div>

        {/* Greeting */}
        <div className="fiq-animate">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {userName}'s Career Center
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
            Finding warm intros so you never have to apply cold again
          </p>
          {/* Line 3: Profile details + Edit Profile pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              {profileLine || 'UF · Your intelligent networking engine'}
            </span>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.8)', padding: '3px 12px', borderRadius: 20,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  minHeight: 'auto', minWidth: 'auto', width: 'auto',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Line 4: Target companies chips + Edit Targets pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {targetCompanies.length > 0 ? (
              <>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Targeting:
                </span>
                {targetCompanies.map((c, i) => (
                  <span key={i} style={{
                    background: 'rgba(250,70,22,0.15)', border: '1px solid rgba(250,70,22,0.3)',
                    color: 'rgba(255,255,255,0.85)', padding: '2px 10px', borderRadius: 14,
                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {c}
                  </span>
                ))}
              </>
            ) : null}
            {onEditProfile && targetCompanies.length > 0 && (
              <button
                onClick={onEditProfile}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.8)', padding: '2px 10px', borderRadius: 14,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  minHeight: 'auto', minWidth: 'auto', width: 'auto',
                  backdropFilter: 'blur(4px)', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                + Edit
              </button>
            )}
          </div>

          {/* Line 5: Rotating status line with live pulse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, height: 20 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', flexShrink: 0,
              animation: 'fiq-pulse-ring 2s infinite',
            }} />
            <HeroStatusLineInline lines={statusLines} />
          </div>
        </div>

        {/* Progress Rings */}
        <div className="fiq-animate fiq-delay-1 fiq-rings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28 }}>
          {rings.map((r, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
              borderRadius: 16, padding: '20px 12px 16px',
              border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <ProgressRing value={r.value} max={r.max} color={r.color} size={68} strokeWidth={6} />
                <div className="fiq-mono" style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 22, fontWeight: 700,
                  color: r.value === 0 ? 'rgba(244,240,232,0.2)' : '#f4f0e8',
                  fontFamily: r.value === 0 ? "'Playfair Display', Georgia, serif" : undefined,
                }}>
                  {r.value === 0 ? '--' : r.value}
                </div>
              </div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                fontWeight: 600, lineHeight: 1.3, whiteSpace: 'pre-line',
              }}>
                {r.label}
              </div>
              <div className="fiq-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                {r.value}/{r.max}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}