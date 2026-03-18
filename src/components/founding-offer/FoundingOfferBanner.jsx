import React from 'react';
import useCheckout from './useCheckout';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const mono = "'DM Mono', 'Courier New', monospace";

/**
 * Founding member offer banner for Onboarding Screen 2.
 * Orange gradient, countdown timer, two CTAs.
 */
export default function FoundingOfferBanner({ display, studentName }) {
  const { startCheckout, loading, error } = useCheckout();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #E85D20 0%, #C94E1A 100%)',
      borderRadius: 16, padding: '28px 24px', marginTop: 24, marginBottom: 8,
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.7)', marginBottom: 12,
      }}>
        FOUNDING MEMBER OFFER
      </p>

      <h3 style={{
        fontFamily: dmSans, fontSize: 18, fontWeight: 700,
        color: '#fff', lineHeight: 1.35, marginBottom: 8,
      }}>
        Activate the annual plan in the next 24 hours and save $62.
      </h3>

      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 400,
        color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 24,
      }}>
        As one of our earliest members, we're offering you a special rate — $187/year instead of $249. This rate locks in permanently for all future renewals. This offer won't appear again.
      </p>

      {/* Timer */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 400,
          color: 'rgba(255,255,255,0.5)', marginBottom: 6,
        }}>
          Offer expires in:
        </p>
        <p style={{
          fontFamily: mono, fontSize: 32, fontWeight: 700,
          color: '#fff', letterSpacing: '0.06em', margin: 0,
        }}>
          {display}
        </p>
      </div>

      {error && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#FFD0C0', textAlign: 'center', marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Primary CTA */}
      <button onClick={() => startCheckout('fastiq_founding_annual')} disabled={loading} style={{
        width: '100%', padding: '15px 24px', borderRadius: 100,
        background: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: dmSans, fontSize: 15, fontWeight: 700,
        color: '#E85D20', minHeight: 'auto', marginBottom: 10,
        opacity: loading ? 0.7 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Activate Annual Plan — $187/year →'}
      </button>

      {/* Secondary CTA */}
      <button onClick={() => startCheckout('fastiq_monthly')} disabled={loading} style={{
        width: '100%', padding: '14px 24px', borderRadius: 100,
        background: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)',
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, fontSize: 14, fontWeight: 500,
        color: '#fff', minHeight: 'auto',
      }}>
        Continue with Monthly — $29/mo
      </button>

      {/* Fine print */}
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 300,
        color: 'rgba(255,255,255,0.45)', textAlign: 'center',
        lineHeight: 1.6, marginTop: 14,
      }}>
        Both plans include a 7-day free trial. Annual plan billed as one payment of $187 — locks in at $187 for every renewal. Cancel anytime.
      </p>
    </div>
  );
}