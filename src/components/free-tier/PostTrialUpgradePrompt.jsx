import { useState } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { useAuth } from '@/lib/AuthContext';

export default function PostTrialUpgradePrompt({ message }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await createCheckoutSession({
        plan: 'pro_monthly',
        successUrl: `${window.location.origin || 'https://collegefastforward.com'}/#/FreeTierDashboard?upgraded=true`,
        cancelUrl: window.location.href,
        user: { id: user?.id, email: user?.email, persona: user?.persona, roles: user?.roles, full_name: user?.full_name },
      });
      const url = res?.data?.url || res?.url;
      if (url) window.location.href = url;
    } catch (e) {
      console.error('Checkout failed:', e);
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 520,
      margin: '80px auto',
      textAlign: 'center',
      padding: '0 24px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#FFF5F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, margin: '0 auto 20px',
      }}>
        ⚡
      </div>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22, fontWeight: 700,
        color: '#1A1A1A', margin: '0 0 10px',
      }}>
        Your CliFF premium trial has ended.
      </p>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, color: '#888',
        margin: '0 0 8px', lineHeight: 1.6,
      }}>
        {message || 'Upgrade to continue using this feature.'}
      </p>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          background: '#E85D20', border: 'none',
          borderRadius: 10, padding: '14px 32px',
          fontSize: 15, fontWeight: 600,
          color: '#fff', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {loading ? 'Loading...' : 'Upgrade Now →'}
      </button>
    </div>
  );
}