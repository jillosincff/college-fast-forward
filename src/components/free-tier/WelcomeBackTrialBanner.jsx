import { useState } from 'react';
import { activateFastIQTrial } from '@/functions/activateFastIQTrial';

export default function WelcomeBackTrialBanner({ user, onTrialActivated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Only show for existing users who have never started a trial and are not paying
  const isEligible =
    user &&
    !user.trial_start_date &&
    user.trial_status !== 'active' &&
    user.subscription_status !== 'active' &&
    user.membership_tier !== 'fastiq';

  if (!isEligible) return null;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await activateFastIQTrial({});
      const data = res?.data || res;
      if (data?.success) {
        onTrialActivated?.();
      } else {
        setError(data?.reason || 'Could not activate trial. Please try again.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0d00 100%)',
      border: '1px solid rgba(232,93,32,0.4)',
      borderRadius: 16,
      padding: '28px 32px',
      margin: '16px 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: '#E85D20', margin: '0 0 10px',
        }}>
          🎉 Welcome back
        </p>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 700,
          color: '#fff', margin: '0 0 8px', lineHeight: 1.3,
        }}>
          Your free 7-day FastIQ trial is waiting.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: 'rgba(255,255,255,0.65)',
          margin: '0 0 6px', lineHeight: 1.6,
        }}>
          Try alumni search, AI outreach drafts, resume tailoring and more.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: 'rgba(255,255,255,0.35)',
          margin: 0,
        }}>
          No credit card needed.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            background: '#E85D20', border: 'none',
            borderRadius: 10, padding: '14px 28px',
            fontSize: 15, fontWeight: 600,
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Activating…' : 'Start My Free Trial →'}
        </button>
        {error && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: '#f87171', margin: 0, textAlign: 'right',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}