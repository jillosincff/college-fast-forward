import React from 'react';
import { Users, Zap } from 'lucide-react';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';

export default function V3Hero({ onCTA, onHowItWorks }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #0B0B0F 40%, #0E1018 70%, #07080C 100%)', minHeight: '100vh' }}
    >
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(0); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade { opacity: 0; animation: heroFadeIn 0.6s ease-in-out forwards; }
        .hero-fade-up { opacity: 0; animation: heroFadeUp 0.6s ease-in-out forwards; }
        @media (max-width: 768px) {
          .hero-fade { animation-duration: 0.3s !important; }
          .hero-fade-up { animation-duration: 0.3s !important; }
          .hero-cards-row { flex-direction: column !important; }
          .hero-magic-text { font-size: clamp(28px, 7vw, 48px) !important; }
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(80px, 12vw, 140px) 24px 80px', textAlign: 'center' }}>

        {/* TOP LABEL */}
        <div className="hero-fade" style={{ animationDelay: '0ms', marginBottom: 32 }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: 0 }}>
            College Fast Forward
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888888', marginTop: 4, marginBottom: 0 }}>
            powered by <span style={{ color: '#E85D20' }}>FastIQ<sup style={{ fontSize: '0.7em', verticalAlign: 'super', lineHeight: 0 }}>™</sup></span>
          </p>
        </div>

        {/* EYEBROW */}
        <div className="hero-fade" style={{ animationDelay: '80ms', marginBottom: 24 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#E85D20', margin: 0 }}>
            The Synchronized Advantage: Human Advocacy + AI Intelligence
          </p>
        </div>

        {/* HEADLINE */}
        <div className="hero-fade" style={{ animationDelay: '380ms', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: playfair, fontWeight: 700,
            fontSize: 'clamp(28px, 5vw, 58px)',
            letterSpacing: '-0.02em', lineHeight: 1.15,
            color: '#fff', margin: 0, padding: '0 4px',
          }}>
            The world's first career ecosystem that integrates a parent's professional network directly into the job search equation.
          </h1>
        </div>

        {/* SUBHEAD — 3 staggered lines */}
        <div style={{ marginBottom: 56 }}>
          {[
            { text: 'We’ve moved past the black hole of cold applications.', delay: '780ms' },
            { text: 'Your experience provides the warm path.', delay: '930ms' },
            { text: 'Our technology provides the execution.', delay: '1080ms' },
          ].map((line, i) => (
            <p key={i} className="hero-fade" style={{
              animationDelay: line.delay,
              fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
              fontWeight: 400, color: '#fff',
              lineHeight: 1.5, margin: '0 0 6px',
            }}>
              {line.text}
            </p>
          ))}
        </div>

        {/* TWO-FORCE CARDS */}
        <div className="hero-cards-row" style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 72 }}>
          {[
            {
              label: 'You Provide',
              title: 'The network.',
              body: 'Your connections, your advocacy, and your word open doors that cold applications never will.',
              Icon: Users,
              delay: '1480ms',
            },
            {
              label: 'FastIQ Provides',
              title: 'The speed.',
              body: 'AI handles the research, tailoring, and follow-up that usually takes hundreds of hours.',
              Icon: Zap,
              delay: '1480ms',
            },
          ].map((card, i) => (
            <div key={i} className="hero-fade" style={{
              animationDelay: card.delay,
              flex: 1,
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 12,
              padding: 24,
              textAlign: 'left',
            }}>
              <card.Icon style={{ width: 22, height: 22, color: '#E85D20', marginBottom: 14 }} />
              <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>
                {card.label}
              </p>
              <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                {card.title}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888888', lineHeight: 1.6, margin: 0 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* THE MAGIC */}
        <div style={{ marginBottom: 72 }}>
          <p className="hero-fade" style={{ animationDelay: '1980ms', fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#fff', margin: '0 0 6px' }}>
            One parent has a network.
          </p>
          <p className="hero-fade" style={{ animationDelay: '2180ms', fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#fff', margin: '0 0 10px' }}>
            A community has{' '}
            <span className="hero-fade-up" style={{
              animationDelay: '2380ms',
              fontFamily: playfair, fontStyle: 'italic',
              fontSize: 'clamp(28px, 4.5vw, 52px)',
              color: '#E85D20', display: 'inline',
            }}>
              infinite possibilities.
            </span>
          </p>
          <p className="hero-fade" style={{ animationDelay: '2580ms', fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#666666', lineHeight: 1.6, margin: '16px 0 0' }}>
            Every parent who joins expands the pool for every student inside it.
          </p>
        </div>

        {/* CLOSING MANIFESTO */}
        <div style={{ marginBottom: 72 }}>
          <p className="hero-fade" style={{ animationDelay: '2980ms', fontFamily: dmSans, fontSize: 'clamp(16px, 2.2vw, 20px)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            This isn’t just a job search. It’s a strategic advantage.
          </p>
          <p className="hero-fade" style={{ animationDelay: '3130ms', fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 18px)', fontWeight: 400, color: '#fff', lineHeight: 1.65, maxWidth: 680, margin: '0 auto 24px' }}>
            We take the nagging out of parenting and replace it with a high-tech pipeline that moves your student from the bottom of the pile to the top of the list.
          </p>
          <p className="hero-fade" style={{ animationDelay: '3280ms', fontFamily: playfair, fontStyle: 'italic', fontSize: 'clamp(18px, 2.5vw, 28px)', color: '#E85D20', margin: 0 }}>
            College Fast Forward provides the engine that syncs them.
          </p>
        </div>

        {/* CTA */}
        <div className="hero-fade" style={{ animationDelay: '3680ms' }}>
          <button
            onClick={onCTA}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            style={{
              fontFamily: dmSans, fontSize: 16, fontWeight: 600,
              background: '#E85D20', color: '#fff',
              padding: '16px 44px', borderRadius: 100, border: 'none',
              cursor: 'pointer', transition: 'all 0.25s ease',
              minHeight: 'auto', minWidth: 'auto', width: 'auto',
              display: 'inline-block',
            }}
          >
            Join For Free →
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#666666', marginTop: 14, marginBottom: 6 }}>
            Free to join. FastIQ from $29/mo. 7-day trial included.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontStyle: 'italic', fontWeight: 300, color: '#555555', margin: 0 }}>
            The first and only platform of its kind.
          </p>
        </div>

      </div>
    </section>
  );
}