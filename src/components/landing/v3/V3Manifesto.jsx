import React, { useEffect, useRef, useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = '"Playfair Display", Georgia, serif';
const dmSans = '"DM Sans", system-ui, sans-serif';
const ORANGE = '#E85D20';

export default function V3Manifesto() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const dur = isMobile ? 400 : 600;
  const gap = isMobile ? 200 : 400;

  // Cumulative delays
  const d1 = 0;
  const d2 = d1 + gap;
  const d3 = d2 + gap;
  const d4 = d3 + (isMobile ? 250 : 500);
  const d5 = d4 + gap;
  const d6 = d5 + (isMobile ? 250 : 500);
  const d7 = d6 + gap;
  const d8 = d7 + (isMobile ? 200 : 300);

  const fade = (delay, drift = false) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${drift ? '10px' : '0'})`,
    transition: `opacity ${dur}ms ease-in-out ${delay}ms, transform ${dur}ms ease-in-out ${delay}ms`,
  });

  const dividerStyle = {
    width: visible ? 60 : 0,
    height: 1,
    background: ORANGE,
    margin: '48px auto 0',
    transition: `width 400ms ease-in-out ${d7}ms`,
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#0A0A0A',
        padding: '120px 24px',
      }}
    >
      <style>{`@media(max-width:767px){.manifesto-section{padding:60px 24px !important}}`}</style>
      <div className="manifesto-section" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>

        {/* Line 1 — Opening statement */}
        <h2 style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(26px, 4.5vw, 44px)',
          color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em',
          marginBottom: 32,
          ...fade(d1),
        }}>
          The tech they want. The human connections they actually need.
        </h2>

        {/* Line 2 — The insight */}
        <p style={{
          fontFamily: dmSans, fontWeight: 400,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: '#fff', lineHeight: 1.7,
          marginBottom: 32,
          ...fade(d2),
        }}>
          Every parent joins us with two powerful forces: the fierce motivation to see their child succeed and a lifetime of professional wisdom.
        </p>

        {/* Line 3 — The pivot */}
        <div style={{ marginBottom: 40, ...fade(d3) }}>
          <p style={{
            fontFamily: dmSans, fontWeight: 400,
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: '#fff', lineHeight: 1.7,
            marginBottom: 4,
          }}>
            We don't just value your connections —
          </p>
          <p style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(28px, 4vw, 42px)',
            color: ORANGE, lineHeight: 1.3,
          }}>
            we scale them.
          </p>
        </div>

        {/* Line 4 — The mechanism */}
        <p style={{
          fontFamily: dmSans, fontWeight: 400,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: '#fff', lineHeight: 1.7,
          marginBottom: 40,
          marginTop: 8,
          ...fade(d4),
        }}>
          We transform individual devotion into systemic advantage. Your personal reach becomes a warm path that moves your student from the bottom of the pile to the top of the list.
        </p>

        {/* Line 5 — The handshake */}
        <p style={{
          fontFamily: dmSans, fontWeight: 700,
          fontSize: 'clamp(18px, 2.5vw, 22px)',
          color: '#fff', lineHeight: 1.6,
          marginBottom: 16,
          ...fade(d5),
        }}>
          You bring the motivation. You bring the network.
        </p>

        {/* Line 6 — The closing */}
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 42px)',
          color: ORANGE, lineHeight: 1.3,
          marginTop: 40,
          ...fade(d6, true),
        }}>
          College Fast Forward provides the engine that syncs them.
        </p>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Social proof + CTA */}
        <div style={{ marginTop: 32, ...fade(d8) }}>
          <p style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 400,
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24,
          }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>1,200+</span> families already inside — and growing.
          </p>

          <button
            onClick={() => navigate('GetStarted')}
            onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ORANGE; }}
            style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 600,
              color: '#fff', background: ORANGE, border: 'none',
              borderRadius: 100, padding: '16px 40px', cursor: 'pointer',
              display: 'inline-block', minHeight: 'auto', minWidth: 'auto',
              transition: 'background 0.2s',
            }}
          >
            Start Free — Join the Network
          </button>

          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400,
            color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginTop: 16,
          }}>
            Free to join. FastIQ from $29/mo. 7-day trial included.
          </p>
        </div>
      </div>
    </section>
  );
}