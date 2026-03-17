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
      dy: (Math.random() - 0.5) * 0.2, o: Math.random() * 0.35 + 0.1,
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
        ctx.fillStyle = `rgba(232,93,32,${p.o})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.6 }} />;
}

function HeroCTA({ text, onClick, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        if (isPrimary) e.currentTarget.style.boxShadow = '0 6px 32px rgba(232,93,32,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        if (isPrimary) e.currentTarget.style.boxShadow = '0 4px 24px rgba(232,93,32,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
      }}
      style={{
        fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff',
        background: isPrimary ? 'linear-gradient(135deg, #E85D20 0%, #d44e14 100%)' : 'transparent',
        border: isPrimary ? 'none' : '2px solid rgba(255,255,255,0.2)',
        borderRadius: 100, padding: '16px 34px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        boxShadow: isPrimary ? '0 4px 24px rgba(232,93,32,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
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
      style={{ background: 'linear-gradient(#0d1117 0%, #0a1a6e 30%, #0821a5 65%, #0d1117 100%)', minHeight: '100vh' }}
    >
      <ParticleCanvas />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(rgba(232,93,32,0.07), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-36 pb-16">
        {/* Eyebrow */}
        <div className="mb-7">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20' }}>
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
          Your student doesn't need to send more resumes.{' '}
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #FA4616, #FF8A5C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            They need a plan.
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: dmSans, fontWeight: 400,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: '#FFFFFF', lineHeight: 1.65,
          maxWidth: 640, margin: '0 auto 16px',
        }}>
          FastIQ gives your student clear direction, identifies alumni from their school, and writes personalized outreach they can actually send.
        </p>

        {/* Supporting line */}
        <p style={{
          fontFamily: dmSans, fontWeight: 400,
          fontSize: 'clamp(15px, 1.8vw, 17px)',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
          maxWidth: 620, margin: '0 auto 44px',
        }}>
          In minutes, your student gets target companies, alumni to contact, and personalized messages ready to send.
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

        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}