import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { logAnalyticsEvent } from '@/functions/logAnalyticsEvent';
import { dmSans, playfair, ORANGE, BORDER, SURFACE, TEXT, MUTED, SUCCESS } from './theme';

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const FREE_FEATURES = [
  'Parent network basics',
  '1 alumni search',
  'Read-only directory',
];

const FASTIQ_FEATURES = [
  'Unlimited alumni search with full contact details',
  'AI-drafted outreach for every connection',
  'Resume tailored to each role you apply to',
  'LinkedIn review + interview prep',
  'Daily action plan and follow-up nudges',
];

export default function FastIQPaywallScreen({ user, schoolName, firstName, onContinueFree }) {
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const monthlyPlan = foundingActive ? 'fastiq_founding_monthly' : 'fastiq_monthly';
  const monthlyPrice = foundingActive ? '$14.50' : '$29';

  const handleUpgrade = async (plan) => {
    setUpgrading(true);
    setError(null);
    logAnalyticsEvent({
      event_name: 'upgrade_clicked',
      properties: { source: 'onboarding_v2_paywall', plan },
    }).catch(() => {});
    try {
      const response = await createCheckoutSession({
        plan,
        successUrl: `${window.location.origin}/#FreeTierDashboard?upgraded=true&from=onboarding_v2`,
        cancelUrl: `${window.location.origin}/#FreeTierDashboard?from=onboarding_v2`,
        user: {
          id: user?.id,
          email: user?.email,
          persona: user?.persona,
          roles: user?.roles,
          full_name: user?.full_name,
          stripe_customer_id: user?.stripe_customer_id,
          family_id: user?.family_id,
          founding_offer_started_at: user?.founding_offer_started_at,
          student_emails: user?.student_emails,
        },
      });
      const result = response?.data || response;
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      setError(result?.error || 'Could not start checkout — please try again.');
      setUpgrading(false);
    } catch (e) {
      console.error('Checkout error:', e);
      setError(e?.message || 'Could not start checkout — please try again.');
      setUpgrading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px 20px 48px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        Choose your speed
      </p>
      <h1 style={{
        fontFamily: playfair, fontSize: 'clamp(26px, 5.4vw, 32px)', fontWeight: 700,
        color: TEXT, lineHeight: 1.22, margin: '0 0 12px', letterSpacing: '-0.005em',
      }}>
        Hi {firstName || 'there'}. Want FastIQ doing this for you 24/7?
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
        You felt the value once. FastIQ runs the same play across every role and every alum at {schoolName || 'your school'} — every single day.
      </p>

      <div style={{
        background: SURFACE, border: `1px solid ${ORANGE}`, borderRadius: 16,
        padding: '24px 22px 22px', marginBottom: 14, position: 'relative',
      }}>
        {foundingActive && (
          <div style={{
            position: 'absolute', top: -10, right: 18,
            background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 10,
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 999,
          }}>
            Founding offer · 50% off
          </div>
        )}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: ORANGE, margin: '0 0 8px',
        }}>
          FastIQ AI Accelerator
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 24, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>
          {monthlyPrice}<span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}> / month</span>
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, margin: '0 0 18px' }}>
          Start free for 5 days. Cancel anytime.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {FASTIQ_FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: SUCCESS, fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>✓</span>
              <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleUpgrade(monthlyPlan)}
          disabled={upgrading}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
            background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 16,
            fontWeight: 600, cursor: upgrading ? 'wait' : 'pointer',
            minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</> : 'Start 5-day free trial →'}
        </button>
        <button
          onClick={() => handleUpgrade('fastiq_annual')}
          disabled={upgrading}
          style={{
            width: '100%', marginTop: 10, padding: '13px 24px', borderRadius: 999,
            background: 'transparent', border: `1px solid ${ORANGE}`,
            color: ORANGE, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            cursor: upgrading ? 'wait' : 'pointer', minHeight: 'auto',
          }}
        >
          Annual — $249/year (save $99)
        </button>
      </div>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: '22px 22px', marginBottom: 18, opacity: 0.85,
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: MUTED, margin: '0 0 10px',
        }}>
          Free
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: TEXT, margin: '0 0 14px' }}>
          $0 <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>forever</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {FREE_FEATURES.map((f) => (
            <p key={f} style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, margin: 0 }}>· {f}</p>
          ))}
        </div>
        <button
          onClick={onContinueFree}
          disabled={upgrading}
          style={{
            width: '100%', padding: '12px 24px', borderRadius: 999,
            background: 'transparent', border: `1px solid ${BORDER}`,
            color: TEXT, fontFamily: dmSans, fontSize: 14, fontWeight: 500,
            cursor: upgrading ? 'wait' : 'pointer', minHeight: 'auto',
          }}
        >
          Continue with the free plan
        </button>
      </div>

      {error && (
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: '0 0 12px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, textAlign: 'center', margin: 0 }}>
        Trial converts to {monthlyPrice}/month. Cancel anytime in settings.
      </p>
    </motion.div>
  );
}
