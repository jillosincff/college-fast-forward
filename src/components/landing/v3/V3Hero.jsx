import React from 'react';
import { Users, Zap } from 'lucide-react';
import V3HeroTypingBox from './V3HeroTypingBox';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';

export default function V3Hero({ onCTA }) {
  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #050505 0%, #0B0B0F 40%, #0E1018 70%, #07080C 100%)',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes hFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hFadeUp10 {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hFadeUp8 {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hf  { opacity: 0; animation: hFadeIn   0.6s ease-in-out forwards; }
        .hfu { opacity: 0; animation: hFadeUp10 0.6s ease-in-out forwards; }
        .hf8 { opacity: 0; animation: hFadeUp8  0.6s ease-in-out forwards; }
        @media (max-width: 768px) {
          .hf, .hfu, .hf8 { animation-duration: 0.3s !important; }
          .hero-cards { flex-direction: column !important; }
          .hero-wrap  { padding: 60px 20px 40px !important; }
        }
      `}</style>

      <div className="hero-wrap" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' }}>

        {/* TOP LABEL */}
        <div className="hf" style={{ animationDelay: '0ms', marginBottom: 32 }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: 0 }}>
            College Fast Forward
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#4F8CFF', margin: '4px 0 0', letterSpacing: 'normal' }}>
            powered by{' '}
            <span style={{ color: '#E85D20' }}>
              FastIQ<sup style={{ fontSize: '0.7em', verticalAlign: 'super', lineHeight: 0 }}>™</sup>
            </span>
          </p>
        </div>


        {/* HEADLINE */}
        <div className="hf" style={{ animationDelay: '1100ms', marginBottom: 20 }}>
          <h1 style={{
            fontFamily: playfair, fontWeight: 700,
            fontSize: 'clamp(28px, 5vw, 42px)',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            color: '#fff', margin: 0,
          }}>
            A smarter way to land internships and jobs&nbsp;— powered by parent connections and AI.
          </h1>
        </div>

        {/* BODY LINE */}
        <div className="hf" style={{ animationDelay: '1300ms', marginBottom: 36 }}>
          <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.65, margin: 0, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
            The tech they want with the connections they need.
          </p>
        </div>

        {/* DUAL-PATH CTAs */}
        <div className="hf" style={{ animationDelay: '1800ms', marginBottom: 52 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            {/* Parent CTA — orange */}
            <button
              onClick={onCTA}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 700,
                background: '#E85D20', color: '#fff',
                padding: '15px 28px', borderRadius: 100, border: 'none',
                cursor: 'pointer', transition: 'all 0.25s ease',
                minHeight: 'auto', minWidth: 'auto', width: 'auto',
                lineHeight: 1.3,
              }}
            >
              Activate FASTIQ for My Student – 7-Day Free Trial
            </button>
            {/* Student CTA — teal */}
            <button
              onClick={onCTA}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 700,
                background: 'transparent', color: 'rgba(255,255,255,0.85)',
                padding: '15px 28px', borderRadius: 100,
                border: '2px solid rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.25s ease',
                minHeight: 'auto', minWidth: 'auto', width: 'auto',
                lineHeight: 1.3,
              }}
            >
              I'm the Student – Start Free Trial
            </button>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888888', marginTop: 14, marginBottom: 0 }}>
            Free to join. FastIQ from $29/mo. 7-day trial included.
          </p>
        </div>

        {/* ALUMNI DEMO */}
        <div className="hf" style={{ animationDelay: '2000ms', marginBottom: 64 }}>
          <V3HeroTypingBox />
        </div>



      </div>
    </section>
  );
}