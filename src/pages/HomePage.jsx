import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function HomePage() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!document.getElementById('home-fonts')) {
      const link = document.createElement('link');
      link.id = 'home-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      >
        <source src="https://imagine-public.x.ai/imagine-public/share-videos/e0df326f-2021-4720-804d-3ead19d1aed3.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 600,
        background: 'radial-gradient(ellipse, rgba(232,93,32,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 2s ease',
      }} />

      <div style={{
        position: 'absolute',
        top: '40%', left: '40%',
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
        opacity: phase >= 3 ? 1 : 0,
        transition: 'opacity 2s ease',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 0,
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo dot */}
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: '#E85D20',
          boxShadow: phase >= 1 ? '0 0 20px rgba(232,93,32,0.6)' : 'none',
          marginBottom: 28,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />

        {/* Main title */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(36px, 7vw, 88px)',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          margin: '0 0 20px',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          College Fast Forward
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: playfair,
          fontSize: 'clamp(18px, 3vw, 32px)',
          fontWeight: 700,
          fontStyle: 'italic',
          color: '#E85D20',
          margin: '0 0 64px',
          letterSpacing: '-0.01em',
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          Reimagining how students land jobs.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <button
            onClick={() => navigate('StudentLandingPage')}
            style={{
              fontFamily: dmSans,
              fontSize: 15, fontWeight: 700,
              color: '#fff',
              background: '#E85D20',
              border: 'none',
              borderRadius: 14,
              padding: '16px 36px',
              cursor: 'pointer',
              minHeight: 'auto',
              boxShadow: '0 8px 32px rgba(232,93,32,0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)';
            }}
          >
            I'm a student →
          </button>

          <button
            onClick={() => navigate('ParentLandingPage')}
            style={{
              fontFamily: dmSans,
              fontSize: 15, fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: '16px 32px',
              cursor: 'pointer',
              minHeight: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            I'm here to help →
          </button>
        </div>

        <p style={{
          fontFamily: dmSans,
          fontSize: 12,
          color: 'rgba(255,255,255,0.15)',
          margin: '40px 0 0',
          letterSpacing: '0.04em',
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 1s ease 0.3s',
        }}>
          collegefastforward.com
        </p>
      </div>
    </div>
  );
}

HomePage.isPublic = true;