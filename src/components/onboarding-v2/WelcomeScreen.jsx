import { motion } from 'framer-motion';
import GoogleSignInButton from '@/components/onboarding/student/GoogleSignInButton';
import { dmSans, playfair, ORANGE, MUTED, TEXT, BG } from './theme';

/**
 * Screen 1 of the V2 onboarding. Branches the headline by entry type:
 *   - "self"    — cold problem framing
 *   - "invited" — acknowledges the parent who kicked things off
 *
 * Auth happens here (via existing GoogleSignInButton) if the user isn't
 * already signed in. If they ARE signed in, the orchestrator skips straight
 * past this screen.
 */
export default function WelcomeScreen({
  entry = 'self',
  parentName,
  schoolName,
  onSignIn,
  onContinue,
  authed,
  loading,
  error,
}) {
  const isInvited = entry === 'invited';

  const headline = isInvited
    ? `${parentName || 'Your parent'} just unlocked your network.`
    : 'Landing a job feels impossible without warm intros.';

  const sub = isInvited
    ? `They activated College Fast Forward for ${schoolName ? `${schoolName} students` : 'you'}. Take 10 minutes — we'll show you what just changed.`
    : "Cold applications get ignored. We'll show you, in the next 10 minutes, what your school's parent and alumni network can actually do for you.";

  return (
    <div style={{
      minHeight: '100vh', background: BG, color: TEXT,
      display: 'flex', flexDirection: 'column',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ maxWidth: 480, width: '100%' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: ORANGE, margin: '0 0 18px',
          }}>
            College Fast Forward
          </p>
          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 700,
            color: TEXT, lineHeight: 1.18, margin: '0 0 18px', letterSpacing: '-0.01em',
          }}>
            {headline}
          </h1>
          <p style={{
            fontFamily: dmSans, fontSize: 15, color: MUTED,
            lineHeight: 1.65, margin: '0 0 32px',
          }}>
            {sub}
          </p>

          {error && (
            <div style={{
              background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
            </div>
          )}

          {authed ? (
            <button
              onClick={onContinue}
              style={{
                width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
                background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 16,
                fontWeight: 600, cursor: 'pointer', minHeight: 'auto',
              }}
            >
              I'm ready — show me →
            </button>
          ) : (
            <GoogleSignInButton onClick={onSignIn} loading={loading} />
          )}

          <p style={{
            fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.32)',
            margin: '24px 0 0', lineHeight: 1.6,
          }}>
            By continuing you agree to our{' '}
            <a href="#Terms" style={{ color: MUTED, textDecoration: 'underline' }}>Terms</a>
            {' '}and{' '}
            <a href="#Privacy" style={{ color: MUTED, textDecoration: 'underline' }}>Privacy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
