import React from 'react';
import useCheckout from './useCheckout';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const mono = "'DM Mono', 'Courier New', monospace";
const ORANGE = '#E85D20';

/**
 * Founding member offer card for Screen 2 confirmation state.
 * Full psychology copy + offer mechanics (timer, buttons, fine print).
 */
export default function FoundingOfferScreen2Card({ display, studentName }) {
  const { startCheckout, loading, error } = useCheckout();
  const name = studentName || 'your student';

  return (
    <div style={{
      background: '#1A1A1A',
      border: `2px solid ${ORANGE}`,
      borderRadius: 16, padding: 32, marginTop: 24, marginBottom: 8,
      boxShadow: 'inset 0 0 40px rgba(232, 93, 32, 0.08)',
    }}>

      {/* ── Emotional opener ── */}
      <h2 style={{
        fontFamily: playfair, fontWeight: 700,
        fontSize: 22, color: '#fff', textAlign: 'center',
        lineHeight: 1.3, marginBottom: 16,
      }}>
        You just changed things for {name}.
      </h2>

      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: '#CCCCCC', textAlign: 'center',
        lineHeight: 1.7, marginBottom: 4,
      }}>
        A few minutes ago you were worried.
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: '#CCCCCC', textAlign: 'center',
        lineHeight: 1.7, marginBottom: 20,
      }}>
        Now {name} has a plan, a network, and people in their corner.
      </p>

      <p style={{
        fontFamily: dmSans, fontSize: 16, fontWeight: 700,
        color: '#fff', textAlign: 'center',
        marginTop: 24, marginBottom: 28,
      }}>
        {"That's not nothing. That's everything."}
      </p>

      {/* ── What happens next ── */}
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: ORANGE, textAlign: 'center',
        marginBottom: 14,
      }}>
        {"HERE'S WHAT HAPPENS NEXT"}
      </p>

      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 400,
        color: '#CCCCCC', textAlign: 'center',
        lineHeight: 1.7, marginBottom: 12,
      }}>
        {"FastIQ will build "}{name}{"'s personalized career plan — target companies, alumni to contact, and outreach messages ready to send."}
      </p>

      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 400,
        color: '#CCCCCC', textAlign: 'center',
        lineHeight: 1.7, marginBottom: 16,
      }}>
        The College Fast Forward network will make sure the right doors open — because other parents are here doing exactly what you just did.
      </p>

      {/* Stat line */}
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 700,
        color: '#fff', textAlign: 'center', marginBottom: 12,
      }}>
        Warm introductions make students{' '}
        <span style={{ color: ORANGE, fontSize: 18 }}>10x</span>{' '}
        more likely to land an interview.
      </p>

      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: '#CCCCCC', textAlign: 'center',
        marginBottom: 24,
      }}>
        {name} now has access to both.
      </p>

      {/* Emotional peak */}
      <p style={{
        fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
        fontSize: 24, color: ORANGE, textAlign: 'center',
        marginTop: 28, marginBottom: 28,
      }}>
        You did that.
      </p>

      {/* Offer transition */}
      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 400,
        color: '#888888', textAlign: 'center',
        lineHeight: 1.6, marginBottom: 20,
      }}>
        Lock in your founding member rate before this offer expires — and give {name} every advantage we have.
      </p>

      {/* Thin orange divider */}
      <div style={{ height: 1, background: ORANGE, opacity: 0.4, marginBottom: 24 }} />

      {/* ── Offer mechanics (unchanged) ── */}
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: ORANGE, marginBottom: 12, textAlign: 'center',
      }}>
        FOUNDING MEMBER OFFER
      </p>

      {/* Timer */}
      <div style={{ textAlign: 'center', padding: '8px 0 8px', marginBottom: 24 }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888888', marginBottom: 8,
        }}>
          Offer expires in:
        </p>
        <p style={{
          fontFamily: mono, fontSize: 32, fontWeight: 700,
          color: ORANGE, letterSpacing: '0.06em', margin: 0,
        }}>
          {display}
        </p>
      </div>

      {error && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#ff6b6b', textAlign: 'center', marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Primary CTA */}
      <button onClick={() => startCheckout('fastiq_founding_annual')} disabled={loading} style={{
        width: '100%', padding: '15px 24px', borderRadius: 100,
        background: ORANGE, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: dmSans, fontSize: 15, fontWeight: 700,
        color: '#fff', minHeight: 'auto', marginBottom: 10,
        opacity: loading ? 0.7 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Activate Annual Plan — $187/year →'}
      </button>

      {/* Secondary CTA */}
      <button onClick={() => startCheckout('fastiq_monthly')} disabled={loading} style={{
        width: '100%', padding: '14px 24px', borderRadius: 100,
        background: 'transparent', border: '1px solid #444444',
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, fontSize: 14, fontWeight: 500,
        color: '#CCCCCC', minHeight: 'auto',
      }}>
        Continue with Monthly — $29/mo
      </button>

      {/* Fine print */}
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 300,
        color: '#666666', textAlign: 'center',
        lineHeight: 1.6, marginTop: 14,
      }}>
        Both plans include a 7-day free trial. Annual plan billed as one payment of $187 — locks in at $187 for every renewal. Cancel anytime.
      </p>
    </div>
  );
}