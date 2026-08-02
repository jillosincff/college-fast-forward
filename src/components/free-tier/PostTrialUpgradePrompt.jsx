import { useState } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { useAuth } from '@/lib/AuthContext';

const GRAD = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';

export default function PostTrialUpgradePrompt({ message }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin || 'https://collegefastforward.com';
      const res = await createCheckoutSession({
        plan: 'pro_monthly',
        successUrl: `${origin}/#/FreeTierDashboard?upgraded=true`,
        cancelUrl: window.location.href,
        user: { id: user?.id, email: user?.email, persona: user?.persona, roles: user?.roles, full_name: user?.full_name },
      });
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setError(res?.data?.error || 'Could not start checkout. Please try again.');
    } catch (e) {
      console.error('Checkout failed:', e);
      setError(e?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(124,58,237,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px',
        }}
      >
        ⚡
      </div>
      <p
        style={{
          fontFamily: "'Satoshi', 'DM Sans', system-ui, sans-serif",
          fontSize: 24, fontWeight: 800,
          color: '#1A1A1A', margin: '0 0 10px', lineHeight: 1.2,
        }}
      >
        Unlock CLIFF Pro
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, color: '#666',
          margin: '0 0 28px', lineHeight: 1.6,
        }}
      >
        {message || 'Let CLIFF keep working for you — applications, outreach, and prep on autopilot.'}
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          background: GRAD, border: 'none',
          borderRadius: 12, padding: '15px 36px',
          fontSize: 15, fontWeight: 700,
          color: '#fff', cursor: loading ? 'default' : 'pointer',
          boxShadow: '0 10px 24px rgba(124,58,237,0.30)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Starting checkout…' : 'Unlock CLIFF Pro →'}
      </button>
      {error && (
        <p style={{ marginTop: 16, fontSize: 13, color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
      <p style={{ marginTop: 16, fontSize: 12, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>
        $19.96/month · cancel anytime
      </p>
    </div>
  );
}