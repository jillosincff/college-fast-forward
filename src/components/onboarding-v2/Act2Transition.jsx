import { motion } from 'framer-motion';
import { dmSans, playfair, ORANGE, BG, TEXT, MUTED } from './theme';

export default function Act2Transition({ schoolName, onContinue }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)', background: BG, color: TEXT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(232,93,32,0.12)',
            border: `2px solid ${ORANGE}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', fontSize: 36,
          }}
        >
          ⚡
        </motion.div>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          color: ORANGE, margin: '0 0 14px',
        }}>
          Act 2 — Your aha moment
        </p>
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(26px, 5.4vw, 34px)', fontWeight: 700,
          color: TEXT, lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '-0.01em',
        }}>
          Let's change that right now with your{' '}
          <span style={{ color: ORANGE }}>{schoolName || 'school'}</span> network.
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, color: MUTED, lineHeight: 1.6, margin: '0 0 32px' }}>
          We'll find 3–5 alumni at your target companies and help you reach out — together, in the next two minutes.
        </p>
        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
            background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 16,
            fontWeight: 600, cursor: 'pointer', minHeight: 'auto',
          }}
        >
          Find my alumni →
        </button>
      </motion.div>
    </div>
  );
}
