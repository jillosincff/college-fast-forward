import React, { useEffect, useState } from 'react';

/**
 * Lightweight CSS-only confetti animation.
 * variant: 'normal' | 'big' (gold/orange colors, more particles, longer duration)
 * onDone: called when animation finishes
 */
const COLORS_NORMAL = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#FA4616'];
const COLORS_BIG = ['#EAB308', '#FA4616', '#F59E0B', '#FBBF24', '#D97706', '#FCD34D', '#FB923C', '#FFD700'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function CSSConfetti({ variant = 'normal', onDone }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const count = variant === 'big' ? 60 : 30;
    const colors = variant === 'big' ? COLORS_BIG : COLORS_NORMAL;
    const duration = variant === 'big' ? 4000 : 2500;

    const ps = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: randomBetween(5, 95),
      delay: randomBetween(0, duration * 0.3),
      duration: randomBetween(duration * 0.6, duration),
      size: randomBetween(4, variant === 'big' ? 10 : 7),
      color: colors[i % colors.length],
      rotation: randomBetween(0, 360),
      drift: randomBetween(-40, 40),
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));
    setParticles(ps);

    const timer = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, duration + 500);

    return () => clearTimeout(timer);
  }, []);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 1; }
          25% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -10,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            '--drift': `${p.drift}px`,
            animation: `confetti-fall ${p.duration}ms ease-in ${p.delay}ms forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}