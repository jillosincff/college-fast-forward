import { useState, useEffect } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { base44 } from '@/api/base44Client';
import { logAnalyticsEvent } from '@/functions/logAnalyticsEvent';

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

export default function TrialBanner({ user }) {
  const [daysLeft, setDaysLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isTrialActive = user?.trial_status === 'active' || user?.fastiq_trial_active === true;
  const isPaying = user?.subscription_status === 'active' || user?.membership_tier === 'fastiq';

  useEffect(() => {
    if (!user?.trial_end_date) return;
    const end = new Date(user.trial_end_date);
    const diff = Math.max(0, Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24)));
    setDaysLeft(diff);
  }, [user?.trial_end_date]);

  if (!isTrialActive || isPaying || dismissed || daysLeft === null) return null;

  const foundingActive = new Date() < FOUNDING_DEADLINE;

  const handleUpgrade = async () => {
    setLoading(true);
    logAnalyticsEvent({ event_name: 'upgrade_clicked', properties: { source: 'trial_banner', days_left: daysLeft } }).catch(() => {});
    try {
      const res = await createCheckoutSession({
        plan: foundingActive ? 'founding_monthly' : 'monthly',
        success_url: `${window.location.origin}/#FreeTierDashboard?upgraded=true`,
        cancel_url: window.location.href,
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
      background: '#E85D20',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        margin: 0,
      }}>
        ⚡ CliFF Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining

      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 700,
            color: '#E85D20',
            cursor: 'pointer',
            minHeight: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Loading...' : 'Upgrade Now →'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 18,
            cursor: 'pointer',
            lineHeight: 1,
            minHeight: 'auto',
            minWidth: 'auto',
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}