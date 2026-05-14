import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const satoshi = "'Satoshi', 'DM Sans', system-ui, sans-serif";

export default function OnboardingFlow({ onClose }) {
  const [screen, setScreen] = useState(1);

  const goNext = () => {
    if (screen < 5) {
      setScreen(s => s + 1);
    } else {
      navigate('GatorAuth');
    }
  };

  const goToAuth = () => navigate('GatorAuth');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: '#06070d',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: dmSans,
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 24, right: 24,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 40, height: 40, minHeight: 'auto',
          color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >✕</button>

      {/* Progress dots */}
      <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            width: i === screen ? 24 : 8, height: 8, borderRadius: 4,
            background: i === screen ? '#22c55e' : i < screen ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Screen 1: Welcome */}
      {screen === 1 && (
        <div style={{ textAlign: 'center', maxWidth: 540, animation: 'fadeSlideIn 0.4s ease' }}>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Logo / wordmark */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 48,
          }}>
            <span style={{ fontFamily: satoshi, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              College <span style={{ color: '#22c55e' }}>Fast Forward</span>
            </span>
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            Welcome to College<br />Fast Forward.
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 440,
          }}>
            Your job search co-pilot built to learn who you are and get you interviews quickly.
          </p>

          <button
            onClick={goNext}
            style={{
              fontFamily: dmSans, fontSize: 17, fontWeight: 800,
              color: '#fff', background: '#22c55e', border: 'none',
              borderRadius: 14, padding: '18px 52px',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              transition: 'all 0.2s ease', display: 'block', margin: '0 auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
          >
            Let's Get Started →
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: '20px 0 0' }}>
            Takes about 2 minutes. No credit card required.
          </p>
        </div>
      )}

      {/* Screens 2–5: Placeholder — coming soon */}
      {screen > 1 && (
        <div style={{ textAlign: 'center', maxWidth: 540, animation: 'fadeSlideIn 0.4s ease' }}>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Screen {screen} of 5
          </p>
          <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Coming Soon
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 40px' }}>
            This screen is being built. For now, let's get you signed up!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(s => s - 1)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}>
              ← Back
            </button>
            {screen < 5 ? (
              <button onClick={goNext} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 12, padding: '14px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 24px rgba(34,197,94,0.35)', transition: 'all 0.2s' }}>
                Next →
              </button>
            ) : (
              <button onClick={goToAuth} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 12, padding: '14px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 24px rgba(34,197,94,0.35)', transition: 'all 0.2s' }}>
                Create My Account →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}