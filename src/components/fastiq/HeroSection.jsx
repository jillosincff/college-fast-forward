import React, { useState, useEffect } from 'react';
import { PulseDot } from './LiveTickerBar';
import ProgressRing from './ProgressRing';

export default function HeroSection({ userName, user, profile, statValues, onOpenChat, statusLines }) {
  const major = user?.major || user?.student_major || profile?.target_industry || '';
  const gradYear = user?.graduation_year || '';
  const industry = profile?.target_industry || '';

  const subtitle = ['UF', major, gradYear, industry ? `Targeting ${industry}` : ''].filter(Boolean).join(' · ');

  const rings = [
    { value: statValues.targets, max: 5, label: 'Targets\nLocked', color: '#FF6B3D' },
    { value: statValues.insiders, max: 15, label: 'Insiders\nFound', color: '#22D3EE' },
    { value: statValues.messages, max: 10, label: 'Messages\nSent', color: '#A78BFA' },
    { value: statValues.warmPaths, max: 5, label: 'Warm\nPaths', color: '#4ADE80' },
  ];

  return (
    <>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(250,70,22,0.15), transparent 70%)',
        animation: 'fiq-heroGlow 4s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -60, width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,33,165,0.3), transparent 70%)',
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
            ✨ Chat with FASTIQ →
          </button>
        </div>

        {/* Greeting */}
        <div className="fiq-animate">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {userName}'s Career Center
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
            Your personal career center, working for you 24/7
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: 4 }}>
            {subtitle || 'UF · Your intelligent networking engine'}
          </p>
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
                  fontSize: 22, fontWeight: 700, color: '#fff',
                }}>
                  {r.value}
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