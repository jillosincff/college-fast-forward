import { useState } from 'react';
import { motion } from 'framer-motion';
import { dmSans, playfair, ORANGE, BORDER, SURFACE, TEXT, MUTED } from './theme';

/**
 * Cialdini commitment/consistency — the user explicitly checks a box that
 * mirrors their stated goals. The micro-commitment makes the paywall
 * directly after feel like the natural next step, not a bait-and-switch.
 */
export default function CommitmentScreen({ schoolName, onContinue }) {
  const [committed, setCommitted] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        Last thing
      </p>
      <h1 style={{
        fontFamily: playfair, fontSize: 'clamp(24px, 5.4vw, 30px)', fontWeight: 700,
        color: TEXT, lineHeight: 1.25, margin: '0 0 28px', letterSpacing: '-0.005em',
      }}>
        Make it real.
      </h1>

      <button
        onClick={() => setCommitted(c => !c)}
        style={{
          width: '100%', textAlign: 'left',
          background: committed ? 'rgba(232,93,32,0.12)' : SURFACE,
          border: `1px solid ${committed ? ORANGE : BORDER}`,
          borderRadius: 16, padding: '20px 22px',
          display: 'flex', gap: 14, alignItems: 'flex-start',
          cursor: 'pointer', minHeight: 'auto', color: TEXT,
          transition: 'all 0.2s', marginBottom: 16,
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          border: `2px solid ${committed ? ORANGE : 'rgba(255,255,255,0.25)'}`,
          background: committed ? ORANGE : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: TEXT, fontSize: 16, fontWeight: 700,
        }}>
          {committed ? '✓' : ''}
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          color: TEXT, lineHeight: 1.55, margin: 0,
        }}>
          I want real responses and referrals from {schoolName ? `${schoolName} alumni and parents` : 'people who care about students like me'} — and I'll spend 15 minutes a week to make it happen.
        </p>
      </button>

      <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
        That's the bar. If you're in, hit continue.
      </p>

      <button
        onClick={onContinue}
        disabled={!committed}
        style={{
          width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
          background: committed ? ORANGE : 'rgba(232,93,32,0.28)',
          color: TEXT, fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          cursor: committed ? 'pointer' : 'not-allowed',
          minHeight: 'auto',
        }}
      >
        I'm committed →
      </button>
    </motion.div>
  );
}
