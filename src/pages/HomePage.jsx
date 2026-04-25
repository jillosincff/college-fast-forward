import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function HomePage() {
  const [phase, setPhase] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    if (!document.getElementById('home-fonts')) {
      const link = document.createElement('link');
      link.id = 'home-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    const timers = [
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2400),
      setTimeout(() => setPhase(5), 3000),
      setTimeout(() => setPhase(6), 3200),
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

        {/* Primary subheadline */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 'clamp(17px, 2.5vw, 24px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.8)',
          margin: '0 auto 24px',
          maxWidth: 520,
          lineHeight: 1.6,
          letterSpacing: '-0.01em',
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'center',
        }}>
          Your parents have connections.<br />
          Imagine access to <em style={{ color: '#E85D20', fontStyle: 'italic', fontWeight: 700, textShadow: '0 0 20px rgba(232,93,32,0.4)' }}>every family's network</em> at your school.
        </p>

        {/* Punchline */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 'clamp(17px, 2.2vw, 22px)',
          fontWeight: 700,
          color: '#f8f8f8',
          margin: '12px auto 52px',
          maxWidth: 460,
          lineHeight: 1.4,
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}>
          This is how people actually get hired — by getting in front of the right people.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          opacity: phase >= 5 ? 1 : 0,
          transform: phase >= 5 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Student CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => nav('/StudentLandingPage')}
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
              Help me get a job →
            </button>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.01em' }}>
              Find the right people. Reach out with confidence. Get hired.
            </p>
          </div>

          {/* Helper CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => nav('/ParentLandingPage')}
              style={{
                fontFamily: dmSans,
                fontSize: 15, fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: '16px 32px',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              I'm here to help →
            </button>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.01em' }}>
              Open doors for students at your child's school.
            </p>
          </div>
        </div>

        {/* Trust line */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
          margin: '40px 0 0',
          letterSpacing: '0.02em',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.6,
          opacity: phase >= 6 ? 1 : 0,
          transition: 'opacity 1s ease 0.3s',
        }}>
          Trusted by families at top schools including UF, FSU, OSU, and more.
        </p>


      </div>
    </div>
  );
}

HomePage.isPublic = true;