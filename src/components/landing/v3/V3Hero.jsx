import React, { useEffect, useRef } from 'react';
import V3HeroTypingBox from './V3HeroTypingBox';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * 1920, y: Math.random() * 1200,
      r: Math.random() * 1.5 + 0.5, dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.2, o: Math.random() * 0.2 + 0.05,
    }));
    const draw = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,160,170,${p.o})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }} />;
}

function HeroCTA({ text, onClick, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
      style={{
        fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff',
        background: isPrimary ? 'var(--accent-primary, #4F8CFF)' : 'transparent',
        border: isPrimary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        borderRadius: 100, padding: '16px 34px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.35s ease', minHeight: 'auto', minWidth: 'auto',
        boxShadow: isPrimary ? '0 4px 24px var(--accent-glow, rgba(79,140,255,0.25)), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
        lineHeight: 1.35, textAlign: 'center',
        backdropFilter: isPrimary ? 'none' : 'blur(12px)',
      }}
    >
      {text}
    </button>
  );
}

export default function V3Hero({ onCTA, onHowItWorks }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #0B0B0F 40%, #0E1018 70%, #07080C 100%)', minHeight: '100vh' }}
    >
      <ParticleCanvas />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(var(--accent-glow, rgba(79,140,255,0.06)), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-36 pb-16">
        {/* Eyebrow */}
        <div className="mb-7">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>
            College Fast Forward
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(30px, 5.5vw, 62px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 22, padding: '0 4px', color: '#fff',
        }}>
          <span style={{
            fontStyle: 'italic',
            color: '#E85D20',
          }}>
            Relax.
          </span>{' '}
          Your student's job search just got way easier.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: dmSans, fontWeight: 400,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: '#4F8CFF', lineHeight: 1.65,
          maxWidth: 640, margin: '0 auto 44px',
        }}>
          The tech they want with the human connections they actually need.
        </p>

        {/* Product Demo */}
        <div className="mb-12">
          <V3HeroTypingBox />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <HeroCTA text="Start Free 7-Day Trial" onClick={onCTA} variant="primary" />
          <HeroCTA text="See How It Works" onClick={onHowItWorks} variant="outline" />
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 6 }}>
          Free to join the network. FastIQ included in your trial.
        </p>
      </div>
    </section>
  );
}