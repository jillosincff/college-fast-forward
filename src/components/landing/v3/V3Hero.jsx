import React from 'react';
import { Users, Zap } from 'lucide-react';

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
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeUp8 {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hf { opacity: 0; animation: heroFadeIn 0.6s ease-in-out forwards; }
        .hfu { opacity: 0; animation: heroFadeUp 0.6s ease-in-out forwards; }
        .hfu8 { opacity: 0; animation: heroFadeUp8 0.6s ease-in-out forwards; }
        @media (max-width: 768px) {
          .hf, .hfu, .hfu8 { animation-duration: 0.3s !important; }
          .hero-cards { flex-direction: column !important; }
          .hero-wrap { padding: 60px 20px 40px !important; }
        }
      `}</style>

      <div
        className="hero-wrap"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '120px 24px 80px',
          textAlign: 'center',
        }}
      >

        {/* TOP LABEL */}
        <div className="hf" style={{ animationDelay: '0ms', marginBottom: 32 }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: 0 }}>
            College Fast Forward
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888888', margin: '4px 0 0', letterSpacing: 'normal' }}>
            powered by <span style={{ color: '#E85D20' }}>FastIQ<sup style={{ fontSize: '0.7em', verticalAlign: 'super', lineHeight: 0 }}>™</sup></span>
          </p>
        </div>

        {/* TAGLINE */}
        <div style={{ marginBottom: 24 }}>
          <p className="hf" style={{ animationDelay: '400ms', fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Your network, scaled by our AI.
          </p>
          <p className="hf" style={{ animationDelay: '550ms', fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 28px)', fontStyle: 'italic', fontWeight: 400, color: '#E85D20', margin: 0 }}>
            Their ultimate competitive advantage.
          </p>
        </div>

        {/* HEADLINE */}
        <div className="hf" style={{ animationDelay: '1050ms', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: playfair, fontWeight: 700,
            fontSize: 'clamp(28px, 5vw, 42px)',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            color: '#fff', margin: 0,
          }}>
            The world's first career ecosystem that integrates a parent's professional network directly into their child's job search equation.
          </h1>
        </div>

        {/* SUBHEAD */}
        <div style={{ marginBottom: 40 }}>
          {[
            { text: 'We\u2019ve moved past the black hole of cold applications.', delay: '1450ms' },
            { text: 'Your experience provides the warm path.', delay: '1600ms' },
            { text: 'Our technology provides the execution.', delay: '1750ms' },
          ].map((line, i) => (
            <p key={i} className="hf" style={{
              animationDelay: line.delay,
              fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 18px)',
              fontWeight: 400, color: '#fff',
              lineHeight: 1.55, margin: '0 0 4px',
            }}>
              {line.text}
            </p>
          ))}
        </div>

        {/* TWO-FORCE CARDS */}
        <div className="hero-cards" style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 48 }}>
          {[
            {
              Icon: Users,
              label: 'You Provide',
              title: 'The network.',
              body: 'Your connections, your advocacy, and your word open doors that cold applications never will.',
              delay: '2250ms',
            },
            {
              Icon: Zap,
              label: 'FastIQ Provides',
              title: 'The speed.',
              body: 'AI handles the research, tailoring, and follow-up that usually takes hundreds of hours.',
              delay: '2250ms',
            },
          ].map((card, i) => (
            <div key={i} className="hf" style={{
              animationDelay: card.delay,
              flex: 1,
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 12,
              padding: 24,
              textAlign: 'left',
            }}>
              <card.Icon style={{ width: 24, height: 24, color: '#E85D20', marginBottom: 14 }} />
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>
                {card.label}
              </p>
              <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                {card.title}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888888', lineHeight: 1.6, margin: 0 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* THE MAGIC */}
        <div style={{ marginBottom: 48 }}>
          <p className="hf" style={{ animationDelay: '2750ms', fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#fff', margin: '0 0 6px' }}>
            One parent has a network.
          </p>
          <p className="hfu" style={{ animationDelay: '2950ms', fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#fff', margin: '0 0 14px', lineHeight: 1.4 }}>
            A community has{' '}
            <span style={{ fontFamily: playfair, fontStyle: 'italic', fontSize: 'clamp(26px, 4vw, 36px)', color: '#E85D20' }}>
              infinite possibilities.
            </span>
          </p>
          <p className="hf" style={{ animationDelay: '3150ms', fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888888', lineHeight: 1.6, margin: 0 }}>
            Every parent who joins expands the pool for every student inside it.
          </p>
        </div>

        {/* CLOSING MANIFESTO */}
        <div style={{ marginBottom: 48 }}>
          <p className="hf" style={{ animationDelay: '3550ms', fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
            This isn't just a job search. It's a strategic advantage.
          </p>
          <p className="hf" style={{ animationDelay: '3700ms', fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: '#fff', lineHeight: 1.65, maxWidth: 660, margin: '16px auto 0' }}>
            We take the nagging out of parenting and replace it with a high-tech pipeline that moves your student from the bottom of the pile to the top of the list.
          </p>
          <p className="hfu8" style={{ animationDelay: '3850ms', fontFamily: playfair, fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 32px)', color: '#E85D20', margin: '32px 0 0' }}>
            College Fast Forward provides the engine that syncs them.
          </p>
        </div>

        {/* CTA */}
        <div className="hf" style={{ animationDelay: '4250ms' }}>
          <button
            onClick={onCTA}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            style={{
              fontFamily: dmSans, fontSize: 16, fontWeight: 700,
              background: '#E85D20', color: '#fff',
              padding: '16px 48px', borderRadius: 100, border: 'none',
              cursor: 'pointer', transition: 'all 0.25s ease',
              minHeight: 'auto', minWidth: 'auto', width: 'auto',
              display: 'inline-block',
            }}
          >
            Join For Free →
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888888', marginTop: 16, marginBottom: 0 }}>
            Free to join. FastIQ from $29/mo. 7-day trial included.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontStyle: 'italic', fontWeight: 400, color: '#888888', marginTop: 8, marginBottom: 0 }}>
            The first and only platform of its kind.
          </p>
        </div>

      </div>
    </section>
  );
}