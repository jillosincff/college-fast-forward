import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59');

export default function PostJoinUpsell() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const foundingOfferActive = new Date() < FOUNDING_DEADLINE;
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const handleTrialStart = async () => {
    setLoading(true);
    try {
      const successUrl = user?.persona === 'parent'
        ? `${window.location.origin}/#ParentHome?payment=success`
        : `${window.location.origin}/#FreeTierDashboard?upgraded=true`;
      const res = await base44.functions.invoke('createCheckoutSession', {
        userId: user?.id,
        userEmail: user?.email,
        plan: foundingOfferActive ? 'fastiq_founding_monthly' : 'fastiq_monthly',
        isTrial: true,
        trialDays: 7,
        isFoundingMember: true,
        successUrl,
        cancelUrl: `${window.location.origin}/#PostJoinUpsell`,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      console.error('Checkout failed:', e);
    }
    setLoading(false);
  };

  const handleContinueFree = () => {
    navigate('FreeTierDashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F5F5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#F0FFF4', border: '2px solid #22C55E',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28,
            margin: '0 auto 16px',
          }}>✓</div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#22C55E', margin: '0 0 8px',
          }}>
            You're in!
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 700, color: '#1A1A1A',
            margin: '0 0 8px', lineHeight: 1.3,
          }}>
            Welcome to the network, {firstName}.
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, color: '#888',
            margin: 0, lineHeight: 1.6,
          }}>
            455+ parents and professionals are ready to help.
            Want to move faster with AI that actually works?
          </p>
        </div>

        {/* Main upsell card */}
        <div style={{
          background: '#0A0A0A', borderRadius: 20,
          padding: '32px', marginBottom: 16,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#E85D20', margin: '0 0 16px',
          }}>
            ⚡ TRY FASTIQ FREE FOR 7 DAYS
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.7, margin: '0 0 24px',
          }}>
            The free network gets you in the door. FastIQ gets
            you the interview. Just 7 days to see what AI can do for your search.
          </p>

          {[
            { icon: '🔍', text: 'Unlimited alumni searches at any company' },
            { icon: '✉️', text: 'AI outreach drafts that actually get replies' },
            { icon: '📄', text: 'Resume tailoring to specific job descriptions' },
            { icon: '🎤', text: 'Full STAR method mock interview practice' },
            { icon: '🧠', text: 'Career archetype assessment' },
            { icon: '📊', text: 'Personalized AI dashboard briefing every login' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: 12, marginBottom: i < 5 ? 12 : 0,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: 'rgba(255,255,255,0.75)',
                margin: 0,
              }}>{item.text}</p>
            </div>
          ))}

          <div style={{
            background: 'rgba(232,93,32,0.12)',
            border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 10, padding: '12px 16px',
            margin: '24px 0',
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: 'rgba(255,255,255,0.82)',
              margin: 0, lineHeight: 1.6,
            }}>
              {foundingOfferActive
                ? <>🎖 After your trial, continue at the <strong style={{ color: '#E85D20' }}>Founding Rate of $14.50/month forever</strong> — 50% off the regular price. This rate disappears after April 15th.</>
                : <>After your trial, continue for <strong style={{ color: '#E85D20' }}>$29/month</strong>. Cancel anytime.</>}
            </p>
          </div>

          <button
            onClick={handleTrialStart}
            disabled={loading}
            style={{
              background: loading ? '#888' : '#E85D20',
              border: 'none', borderRadius: 10,
              padding: '16px', fontSize: 15,
              fontWeight: 600, color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%', marginBottom: 8, minHeight: 'auto',
            }}
          >
            {loading ? 'Loading...' : 'Start My 7-Day FastIQ Trial — Free →'}
          </button>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            textAlign: 'center', margin: 0,
          }}>
            Cancel anytime
          </p>
        </div>

        <button
          onClick={handleContinueFree}
          style={{
            background: 'none', border: 'none',
            width: '100%', padding: '14px',
            fontSize: 14, color: '#888',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 'auto',
          }}
        >
          Continue with free tier for now →
        </button>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: '#BBBBBB',
          textAlign: 'center', margin: '8px 0 0',
          lineHeight: 1.6,
        }}>
          No pressure. Your free network stays active forever.
          You can upgrade or cancel the trial anytime from your dashboard.
        </p>

      </div>
    </div>
  );
}