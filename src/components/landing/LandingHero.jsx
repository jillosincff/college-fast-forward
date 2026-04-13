import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const STATS = [
  { number: '1,000+', label: 'Parents & Alumni' },
  { number: '15+', label: 'Universities' },
  { number: '3x', label: 'More Interviews' },
];

const SOCIAL_PROOF = [
  { quote: 'A conversation through CFF changed the trajectory of my son\'s career.', author: 'UF Parent' },
  { quote: 'My daughter landed her internship through a connection she never would have found alone.', author: 'CFF Member' },
  { quote: 'One warm intro did more than 50 applications.', author: 'Student, Class of 2025' },
];

export default function LandingHero({ onParentJoin, onStudentJoin, onClaim }) {
  const [mounted, setMounted] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveQuote(q => (q + 1) % SOCIAL_PROOF.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleParentJoin = onParentJoin || onClaim || (() => navigate('GetStarted'));
  const handleStudentJoin = onStudentJoin || (() => navigate('GetStarted'));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,93,32,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 60%, rgba(8,33,165,0.08) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#E85D20',
            boxShadow: '0 0 12px rgba(232,93,32,0.6)',
          }} />
          <span style={{
            fontFamily: playfair,
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.02em',
          }}>
            College Fast Forward
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('GetStarted')}
            style={{
              fontFamily: dmSans,
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              minHeight: 'auto',
            }}
          >
            Sign In
          </button>
          <button
            onClick={handleParentJoin}
            style={{
              fontFamily: dmSans,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              background: '#E85D20',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              cursor: 'pointer',
              minHeight: 'auto',
            }}
          >
            Join Free
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
      }}>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(232,93,32,0.1)',
          border: '1px solid rgba(232,93,32,0.25)',
          borderRadius: 100,
          padding: '6px 16px',
          marginBottom: 36,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.6s ease',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{
            fontFamily: dmSans,
            fontSize: 12,
            fontWeight: 600,
            color: '#E85D20',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            1,000+ Parents & Alumni Ready to Help
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: 820,
          margin: '0 0 12px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          "I've asked everyone I know.
        </h1>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 700,
          color: '#E85D20',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: 820,
          margin: '0 0 40px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.15s',
        }}>
          My kid still doesn't have a job lead."
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.65,
          maxWidth: 580,
          margin: '0 0 16px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.2s',
        }}>
          You're not alone. College Fast Forward connects you with 1,000+ parents
          and alumni who are ready to open their networks for your student.
        </p>

        <p style={{
          fontFamily: playfair,
          fontSize: 'clamp(17px, 2vw, 21px)',
          fontWeight: 700,
          color: '#fff',
          fontStyle: 'italic',
          margin: '0 0 48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.25s',
        }}>
          One warm intro changes everything.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 64,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.3s',
        }}>
          <button
            onClick={handleParentJoin}
            style={{
              fontFamily: dmSans,
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              background: '#E85D20',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              cursor: 'pointer',
              minHeight: 'auto',
              boxShadow: '0 8px 32px rgba(232,93,32,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)';
            }}
          >
            Join as a Parent or Alumni — Free →
          </button>
          <button
            onClick={handleStudentJoin}
            style={{
              fontFamily: dmSans,
              fontSize: 15,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '16px 32px',
              cursor: 'pointer',
              minHeight: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
            }}
          >
            I'm a Student →
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: 48,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 64,
          opacity: mounted ? 1 : 0,
          transition: 'all 0.7s ease 0.4s',
        }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: playfair,
                fontSize: 32,
                fontWeight: 700,
                color: '#E85D20',
                margin: '0 0 4px',
                lineHeight: 1,
              }}>
                {stat.number}
              </p>
              <p style={{
                fontFamily: dmSans,
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Social proof ticker */}
        <div style={{
          maxWidth: 560,
          opacity: mounted ? 1 : 0,
          transition: 'all 0.7s ease 0.5s',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '3px solid #E85D20',
            borderRadius: '0 12px 12px 0',
            padding: '16px 20px',
            transition: 'all 0.5s ease',
          }}>
            <p style={{
              fontFamily: playfair,
              fontSize: 16,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.8)',
              margin: '0 0 8px',
              lineHeight: 1.5,
            }}>
              "{SOCIAL_PROOF[activeQuote].quote}"
            </p>
            <p style={{
              fontFamily: dmSans,
              fontSize: 12,
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              — {SOCIAL_PROOF[activeQuote].author}
            </p>
          </div>

          {/* Quote dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {SOCIAL_PROOF.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveQuote(i)}
                style={{
                  width: i === activeQuote ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === activeQuote ? '#E85D20' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: 'auto',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Bottom divider */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{
          fontFamily: dmSans,
          fontSize: 12,
          color: 'rgba(255,255,255,0.25)',
        }}>
          Trusted by parents and alumni at UF, Tulane, Wake Forest, USC and 11 more universities
        </span>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}