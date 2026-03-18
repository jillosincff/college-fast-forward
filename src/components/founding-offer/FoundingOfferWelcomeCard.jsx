import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const mono = "'DM Mono', 'Courier New', monospace";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';

/**
 * Founding member offer card for the Parent Welcome Screen.
 * Replaces standard pricing in the FastIQ sell section.
 * Display-only card — CTAs are rendered by WelcomeFastIQSection.
 */
export default function FoundingOfferWelcomeCard({ display, studentName }) {
  return (
    <div style={{
      background: CARD_BG, borderRadius: 14, padding: 24, marginBottom: 24,
      border: '2px solid #E85D20',
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: ORANGE, marginBottom: 12,
      }}>
        FOUNDING MEMBER OFFER
      </p>

      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: '#fff', textAlign: 'center', lineHeight: 1.5, marginBottom: 16,
      }}>
        Before you explore FastIQ — lock in your founding member rate.
      </p>

      {/* Timer */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{
          fontFamily: mono, fontSize: 34, fontWeight: 700,
          color: ORANGE, letterSpacing: '0.06em', margin: 0,
        }}>
          {display}
        </p>
      </div>

      {/* Pricing options side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Annual — highlighted */}
        <div style={{
          background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.3)',
          borderRadius: 12, padding: '16px 14px', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: ORANGE, marginBottom: 8,
          }}>
            BEST VALUE
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#666', margin: '0 0 4px' }}>
            <span style={{ textDecoration: 'line-through' }}>$249</span>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            $187<span style={{ fontSize: 13, fontWeight: 400, color: '#999' }}>/year</span>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: ORANGE, margin: 0 }}>
            Save $62 — locks in forever
          </p>
        </div>

        {/* Monthly */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid #333',
          borderRadius: 12, padding: '16px 14px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#888', margin: '0 0 4px' }}>
            $29<span style={{ fontSize: 13, fontWeight: 400 }}>/month</span>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#555', margin: 0 }}>
            No discount
          </p>
        </div>
      </div>

      <p style={{
        fontFamily: dmSans, fontSize: 12, color: '#555',
        textAlign: 'center', lineHeight: 1.6, marginBottom: 0,
      }}>
        Both plans include a 7-day free trial. The founding rate locks in permanently for all future renewals.
      </p>
    </div>
  );
}