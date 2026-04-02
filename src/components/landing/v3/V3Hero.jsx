import React from 'react';
import { Users, Zap } from 'lucide-react';
import V3HeroTypingBox from './V3HeroTypingBox';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';

export default function V3Hero({ onCTA, onParentCTA, onStudentCTA }) {
  const handleParent = onParentCTA || onCTA;
  const handleStudent = onStudentCTA || onCTA;
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 380, margin: '0 auto' }}>
            {/* Parent CTA */}
            <button
              onClick={handleParent}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                background: '#E85D20', color: '#fff',
                padding: '16px 32px', borderRadius: 12, border: 'none',
                cursor: 'pointer', transition: 'filter 0.2s ease',
                minHeight: 'auto', minWidth: 'auto', width: '100%',
                marginBottom: 12,
              }}
            >
              Help my student get hired →
            </button>
            {/* Student CTA */}
            <button
              onClick={handleStudent}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                background: '#fff', color: '#E85D20',
                padding: '16px 32px', borderRadius: 12,
                border: '2px solid #E85D20',
                cursor: 'pointer', transition: 'filter 0.2s ease',
                minHeight: 'auto', minWidth: 'auto', width: '100%',
                marginBottom: 20,
              }}
            >
              I'm the student →
            </button>
            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {['✓ Free to join', '✓ No credit card', '✓ Upgrade anytime'].map(item => (
                <p key={item} style={{ fontFamily: dmSans, fontSize: 12, color: '#888', margin: 0, fontWeight: 500 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ALUMNI DEMO */}
        <div className="hf" style={{ animationDelay: '2000ms', marginBottom: 64 }}>
          <V3HeroTypingBox />
        </div>



      </div>
    </section>
  );
}