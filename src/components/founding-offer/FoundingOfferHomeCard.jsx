import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, CARD_BG, ORANGE } from '@/components/parent-home/constants';

const mono = "'DM Mono', 'Courier New', monospace";

/**
 * Founding member offer card for ParentHome (first return visit only).
 * Shows between intro requests and FastIQ nudge.
 */
export default function FoundingOfferHomeCard({ display, studentName }) {
  const name = studentName || 'Your student';

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        background: CARD_BG,
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #E85D20, #C94E1A) 1',
        borderRadius: 0, // borderImage doesn't work with borderRadius
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Use an inner wrapper with rounded corners */}
        <div style={{
          position: 'absolute', inset: -2, borderRadius: 14,
          border: '2px solid #E85D20', pointerEvents: 'none',
        }} />

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
          <br />This offer won't appear again.
        </p>

        {/* Primary CTA */}
        <button onClick={() => navigate('GatorWelcome', { plan: 'annual', founding: 'true' })} style={{
          width: '100%', padding: '14px 24px', borderRadius: 100,
          background: ORANGE, border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 15, fontWeight: 700,
          color: '#fff', minHeight: 'auto', marginBottom: 10,
        }}>
          Activate Annual Plan — $187 →
        </button>

        {/* Secondary CTA */}
        <button onClick={() => navigate('GatorWelcome', { plan: 'monthly' })} style={{
          width: '100%', padding: '13px 24px', borderRadius: 100,
          background: 'transparent', border: `1.5px solid ${ORANGE}`,
          cursor: 'pointer', fontFamily: dmSans, fontSize: 14, fontWeight: 500,
          color: ORANGE, minHeight: 'auto',
        }}>
          Continue with monthly — $29/mo
        </button>

        <p style={{
          fontFamily: dmSans, fontSize: 11, color: '#555',
          textAlign: 'center', lineHeight: 1.6, marginTop: 14,
        }}>
          Annual plan billed as one payment of $187. Cancel anytime.
        </p>
      </div>
    </div>
  );
}