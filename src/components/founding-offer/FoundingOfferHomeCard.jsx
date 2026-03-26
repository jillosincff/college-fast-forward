import React from 'react';
import { dmSans, CARD_BG, ORANGE } from '@/components/parent-home/constants';
import useCheckout from './useCheckout';
import { Loader2 } from 'lucide-react';

const mono = "'DM Mono', 'Courier New', monospace";

/**
 * Founding member offer card for ParentHome (first return visit only).
 * Shows between intro requests and FastIQ nudge.
 */
export default function FoundingOfferHomeCard({ display, studentName }) {
  const name = studentName || 'Your student';
  const { startCheckout, loading, error } = useCheckout();

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        background: CARD_BG,
        border: '2px solid #E85D20',
        borderRadius: 14,
        padding: 24,
      }}>

        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: ORANGE, marginBottom: 14,
        }}>
          FOUNDING MEMBER OFFER — EXPIRES SOON
        </p>

        <h3 style={{
          fontFamily: dmSans, fontSize: 17, fontWeight: 700,
          color: '#fff', lineHeight: 1.35, marginBottom: 16,
        }}>
          {name}'s founding member discount expires in:
        </h3>

        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{
            fontFamily: mono, fontSize: 34, fontWeight: 700,
            color: ORANGE, letterSpacing: '0.06em', margin: 0,
          }}>
            {display}
          </p>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13, color: '#888',
          lineHeight: 1.6, marginBottom: 20, textAlign: 'center',
        }}>
          Activate the annual plan before it expires and pay just $187 — save $62.
          <br />This rate locks in permanently. This offer won't appear again.
        </p>

        {error && (
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button onClick={() => startCheckout('fastiq_monthly')} disabled={loading} style={{
          width: '100%', padding: '14px 24px', borderRadius: 100,
          background: ORANGE, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: dmSans, fontSize: 15, fontWeight: 700,
          color: '#fff', minHeight: 'auto', marginBottom: 10,
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Activate Now — $29/month →'}
        </button>

        <p style={{
          fontFamily: dmSans, fontSize: 11, color: '#555',
          textAlign: 'center', lineHeight: 1.6, marginTop: 14,
        }}>
          Both plans include a 7-day free trial. Annual plan locks in at $187/year forever. Cancel anytime.
        </p>
      </div>
    </div>
  );
}