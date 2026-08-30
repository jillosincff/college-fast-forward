import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59-04:00');

export default function ParentUpsell() {
  const { user, isLoadingAuth } = useAuth();
  const foundingOfferActive = new Date() < FOUNDING_DEADLINE;
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleTrialStart = async () => {
    if (isLoadingAuth) return; // still loading, ignore click
    if (!user) {
      // Refresh the page to re-trigger auth
      window.location.reload();
      return;
    }
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        plan: foundingOfferActive ? 'fastiq_founding_monthly' : 'fastiq_monthly',
        user: { id: user.id, email: user.email },
      });
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
      } else {
        setCheckoutError('Could not start checkout. Please try again.');
      }
    } catch (e) {
      console.error('Checkout failed:', e);
      setCheckoutError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleSkip = () => {
    navigate('ParentAllSet');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 540, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#E85D20', margin: '0 0 16px',
          }}>
            ⚡ ONE MORE THING
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(24px, 4vw, 34px)',
            fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 12px', lineHeight: 1.3,
          }}>
            Want to supercharge your student's job search?
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, color: '#888',
            margin: 0, lineHeight: 1.6,
          }}>
            You're already helping other students by being in the
            network. FastIQ gives your own student the full AI
            advantage — try it free for 5 days.
          </p>
        </div>

        <div style={{
          background: '#0A0A0A',
          borderRadius: 20, padding: '32px',
          marginBottom: 16,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#E85D20', margin: '0 0 20px',
          }}>
            FASTIQ GIVES YOUR STUDENT:
          </p>

          {[
            { icon: '🔍', text: 'Unlimited alumni searches at any company' },
            { icon: '✉️', text: 'AI outreach drafts that actually get replies' },
            { icon: '📄', text: 'Resume scoring and tailoring to real job postings' },
            { icon: '🎤', text: 'Full mock interview practice with STAR feedback' },
            { icon: '🧠', text: 'Career archetype — helps them find their path' },
            { icon: '📊', text: 'Personalized AI briefing every time they log in' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: 12, marginBottom: i < 5 ? 14 : 0,
            }}>
              <span style={{
                fontSize: 18, flexShrink: 0,
                fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
              }}>
                {item.icon}
              </span>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: 'rgba(255,255,255,0.75)',
                margin: 0, lineHeight: 1.5,
              }}>{item.text}</p>
            </div>
          ))}

          <div style={{
            background: 'rgba(232,93,32,0.12)',
            border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 10, padding: '14px 18px',
            margin: '24px 0',
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: 'rgba(255,255,255,0.82)',
              margin: 0, lineHeight: 1.6,
            }}>
              <>After your trial, continue for <strong style={{ color: '#E85D20' }}>$29/month</strong>. Cancel anytime.</>
            </p>
          </div>

          <button
            onClick={handleTrialStart}
            disabled={loading || isLoadingAuth}
            style={{
              background: loading ? '#555' : '#E85D20',
              border: 'none', borderRadius: 10,
              padding: '16px', fontSize: 15,
              fontWeight: 600, color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%', marginBottom: 8,
              minHeight: 'auto',
            }}
          >
            {loading ? 'Loading...' : 'Start 5-Day FastIQ Trial for My Student →'}
          </button>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, color: 'rgba(255,255,255,0.3)',
            textAlign: 'center', margin: 0,
          }}>
            Cancel anytime
          </p>
          {checkoutError && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#ff6b6b', textAlign: 'center', margin: '8px 0 0' }}>
              {checkoutError}
            </p>
          )}
        </div>

        <button
          onClick={() => navigate('ParentAllSet')}
          style={{
            background: 'none', border: 'none',
            width: '100%', padding: '14px',
            fontSize: 14, color: '#888',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 'auto',
          }}
        >
          No thanks — I'm just here to help →
        </button>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: '#BBBBBB',
          textAlign: 'center', margin: '8px 0 0',
          lineHeight: 1.6,
        }}>
          No pressure. Your free profile stays active forever.
          Help students on your own terms.
        </p>

      </div>
    </div>
  );
}