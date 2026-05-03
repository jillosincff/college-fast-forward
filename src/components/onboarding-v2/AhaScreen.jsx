import { motion } from 'framer-motion';
import { dmSans, playfair, ORANGE, BG, TEXT, MUTED, SUCCESS } from './theme';

export default function AhaScreen({ alumName, onContinue }) {
  const first = (alumName || '').split(' ')[0] || 'them';
  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)', background: BG, color: TEXT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
          style={{
            width: 84, height: 84, borderRadius: '50%',
            background: 'rgba(34,197,94,0.14)',
            border: `2px solid ${SUCCESS}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', fontSize: 40,
          }}
        >
          ✓
        </motion.div>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          color: SUCCESS, margin: '0 0 14px',
        }}>
          Draft saved to your dashboard
        </p>
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(26px, 5.4vw, 32px)', fontWeight: 700,
          color: TEXT, lineHeight: 1.22, margin: '0 0 16px', letterSpacing: '-0.01em',
        }}>
          A reply from {first} is just the start.
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '0 0 32px' }}>
          The right alum can get your resume in front of the hiring manager — or send a referral straight through.
          That's how 10× more interviews happen.
        </p>
        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
            background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 16,
            fontWeight: 600, cursor: 'pointer', minHeight: 'auto',
          }}
        >
          See what's next →
        </button>
      </motion.div>
    </div>
  );
}
