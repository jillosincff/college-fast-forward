import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const dm = "'DM Sans', sans-serif";

/**
 * Post-signup welcome — Magic Moment first, CLIFF Pro second.
 * The hook is the one free CLIFF-powered application waiting on the dashboard.
 */
export default function PostJoinUpsell() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const goToMagicMoment = () => {
    navigate('FreeTierDashboard');
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createCheckoutSession({
        plan: 'pro_monthly',
        user: { id: user?.id, email: user?.email, family_id: user?.family_id },
        successUrl: `${window.location.origin}/#FreeTierDashboard?upgrade=success`,
        cancelUrl: `${window.location.origin}/#PostJoinUpsell`,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setError(res?.data?.error || 'Something went wrong. Please try again.');
    } catch (e) {
      setError('Could not start checkout. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FFF4', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✓</div>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#22C55E', margin: '0 0 8px' }}>
            You're in!
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.3 }}>
            Welcome, {firstName}. CLIFF is already working.
          </h1>
          <p style={{ fontFamily: dm, fontSize: 15, color: '#888', margin: 0, lineHeight: 1.6 }}>
            Your career agent has started scanning jobs and warm connections at your school.
          </p>
        </div>

        {/* Magic Moment card — the hero */}
        <div style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderRadius: 20, padding: '32px', marginBottom: 16, boxShadow: '0 12px 40px rgba(109,40,217,0.30)' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)', margin: '0 0 14px' }}>
            🎁 Your first application is on us
          </p>
          <h2 style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>
            CLIFF will build your first complete application — free.
          </h2>
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: '0 0 20px' }}>
            Pick a job, and CLIFF tailors your resume to it, finds warm connections at the company, and preps everything you need to apply. One full application, no card required.
          </p>
          <button
            onClick={goToMagicMoment}
            style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 15, fontWeight: 800, color: '#6d28d9', cursor: 'pointer', fontFamily: dm, width: '100%', minHeight: 'auto' }}
          >
            Claim My Free Application →
          </button>
        </div>

        {/* CLIFF Pro secondary offer */}
        <div style={{ background: '#0A0A0A', borderRadius: 20, padding: '28px 32px', marginBottom: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#a78bfa', margin: '0 0 12px' }}>
            ⚡ Or let CLIFF do the work on every job
          </p>
          {[
            { icon: '📄', text: 'Unlimited tailored resumes for every application' },
            { icon: '🤝', text: 'Warm intros through parents & alumni at your targets' },
            { icon: '✉️', text: 'AI outreach drafts that actually get replies' },
            { icon: '🎤', text: 'Full mock interview practice with feedback' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 10 : 0 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              <p style={{ fontFamily: dm, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{item.text}</p>
            </div>
          ))}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{ background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '15px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dm, width: '100%', margin: '20px 0 8px', minHeight: 'auto' }}
          >
            {loading ? 'Launching…' : 'Go CLIFF Pro — $4.99/wk →'}
          </button>
          <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
            $4.99/wk, billed monthly at $19.96 · Cancel anytime
          </p>
          {error && (
            <p style={{ fontFamily: dm, fontSize: 12, color: '#f87171', textAlign: 'center', margin: '8px 0 0', fontWeight: 600 }}>⚠️ {error}</p>
          )}
        </div>

        <button
          onClick={goToMagicMoment}
          style={{ background: 'none', border: 'none', width: '100%', padding: '14px', fontSize: 14, color: '#888', cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}
        >
          Take me to my dashboard →
        </button>

      </div>
    </div>
  );
}