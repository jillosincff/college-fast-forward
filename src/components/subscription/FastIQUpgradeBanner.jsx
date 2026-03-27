import React, { useState } from 'react';
import { Zap, ArrowRight, Clock, Loader2 } from 'lucide-react';

/**
 * Banner shown to CFF-only subscribers or non-subscribers when they visit FASTIQ.
 * Not shown to founding members (they have full access).
 */
export default function FastIQUpgradeBanner({ user, reason, periodEnd }) {
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { createCheckoutSession } = await import('@/functions/createCheckoutSession');
      const response = await createCheckoutSession({
        plan: 'fastiq_monthly',
        successUrl: `${window.location.origin}/#Dashboard?upgrade=success`,
        cancelUrl: window.location.href,
      });
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        console.error('Checkout failed:', response?.data?.error);
        setUpgrading(false);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setUpgrading(false);
    }
  };

  // Canceled but still in billing period
  if (reason === 'canceled_active_period' && periodEnd) {
    const endDate = new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return (
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10,
        border: '1px solid #F59E0B',
      }}>
        <Clock style={{ width: 18, height: 18, color: '#92400E', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#78350F', margin: 0 }}>Your FASTIQ access ends on {endDate}</p>
          <p style={{ fontSize: 11, color: '#92400E', margin: '2px 0 0' }}>Resubscribe to keep your AI career center active.</p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          style={{
            background: '#FA4616', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer',
            minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            opacity: upgrading ? 0.7 : 1,
          }}
        >
          {upgrading ? <><Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> Processing...</> : <>Resubscribe <ArrowRight style={{ width: 12, height: 12 }} /></>}
        </button>
      </div>
    );
  }

  // CFF-only or no subscription
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0021A5 0%, #001872 100%)',
      borderRadius: 16, padding: '24px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
        background: 'rgba(250,70,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap style={{ width: 24, height: 24, color: '#FA4616' }} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Unlock FASTIQ™</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        Your AI-powered career center. Company research, alumni finder, personalized outreach, resume tailoring, and weekly opportunity scouting.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          style={{
            background: '#FA4616', color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer',
            minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            opacity: upgrading ? 0.7 : 1,
          }}
        >
          {upgrading ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Processing...</> : <><Zap style={{ width: 14, height: 14 }} /> Start 7-Day Free Trial</>}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>$29/month or $249/year • Cancel anytime</p>
    </div>
  );
}