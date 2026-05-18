import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const TEXT3 = '#94A3B8';

export default function ArchetypeUnlockScreen({ archetypeResult, userFirstName }) {
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      // Save archetype to user profile
      await base44.auth.updateMe({
        career_archetype: archetypeResult.archetype,
        career_archetype_data: archetypeResult,
        onboarding_completed: true,
      });

      // Grant FastIQ trial
      await base44.functions.invoke('activateFastIQTrial', {
        userId: base44.auth.me().id,
        userEmail: base44.auth.me().email,
        trialDays: 7,
      });

      // Navigate to dashboard with archetype pre-loaded
      navigate('FreeTierDashboard?archetype=unlocked');
    } catch (err) {
      console.error('Unlock failed:', err);
    }
    setUnlocking(false);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 540, width: '100%', animation: 'fadeUp 0.35s ease', paddingTop: 40 }}>
      {/* Header badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
        <span style={{ fontSize: 12 }}>🔮</span>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Assessment Complete</span>
      </div>

      {/* Main headline */}
      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
        {userFirstName ? `${userFirstName}, Your Career Archetype is Ready!` : 'Your Career Archetype is Ready!'}
      </h1>

      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 auto 32px', maxWidth: 460, lineHeight: 1.7 }}>
        Based on your matching profile indicators, you have a rare combination of traits that align with specific high-growth career paths.
      </p>

      {/* Blurred archetype card */}
      <div style={{ background: `linear-gradient(135deg, #1e293b, #334155)`, borderRadius: 20, padding: '32px 28px', marginBottom: 32, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Decorative background */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 28 }}>🎯</span>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Your Primary Persona</p>
          </div>

          {/* Blurred archetype name */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', filter: 'blur(8px)', userSelect: 'none' }}>
              {archetypeResult.archetype}
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.7)', borderRadius: 12 }}>
              <span style={{ fontSize: 24 }}>🔒</span>
            </div>
          </div>

          {/* Blurred top industries */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
              Top 3 Industries Where You'll Make the Most Money
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 12px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>🔒</div>
                  <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', filter: 'blur(4px)' }}>Industry {i}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Archetype description teaser */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
              "{archetypeResult.description?.substring(0, 80)}..."
            </p>
          </div>
        </div>
      </div>

      {/* Value proposition */}
      <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 16, padding: '20px 18px', marginBottom: 28, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#059669', margin: '0 0 6px' }}>
              Unlock Your Complete Career Blueprint
            </p>
            <ul style={{ fontFamily: FONT, fontSize: 12, color: '#065F46', margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: 6 }}>✓ Full 15-page Archetype report with strengths & blind spots</li>
              <li style={{ marginBottom: 6 }}>✓ Top 5 ideal career paths matched to your personality</li>
              <li style={{ marginBottom: 6 }}>✓ Automated job pipeline with 3 pre-loaded opportunities</li>
              <li>✓ 7-day free trial, then just $4.99/week</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleUnlock}
          disabled={unlocking}
          style={{
            width: '100%',
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            background: unlocking ? '#CBD5E1' : `linear-gradient(to bottom, ${GREEN}, #059669)`,
            border: 'none',
            borderRadius: 12,
            padding: '18px 32px',
            cursor: unlocking ? 'not-allowed' : 'pointer',
            minHeight: 'auto',
            boxShadow: unlocking ? 'none' : '0 8px 24px rgba(16,185,129,0.3)',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (!unlocking) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(16,185,129,0.4)';
            }
          }}
          onMouseLeave={e => {
            if (!unlocking) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.3)';
            }
          }}
        >
          {unlocking ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Unlocking...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ⚡ Lock In Your Blueprint & Get Hired
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('FreeTierDashboard')}
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: TEXT2,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            minHeight: 'auto',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Maybe later — I'll explore on my own
        </button>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}