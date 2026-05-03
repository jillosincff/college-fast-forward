import { motion } from 'framer-motion';
import { dmSans, playfair, ORANGE, BORDER, SURFACE, TEXT, MUTED, SUCCESS } from './theme';

const formatList = (items, fallback) => {
  const cleaned = (items || []).filter(Boolean);
  if (cleaned.length === 0) return fallback;
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(', ')}, and ${cleaned[cleaned.length - 1]}`;
};

const challengeMicro = {
  no_network: 'closes the warm-intro gap',
  cold_apps: 'replaces the cold-application black hole',
  unsure_target: 'narrows in on what you actually want',
  imposter: 'gets you in front of people who can vouch for you',
};

const unlockMicro = {
  referral: 'an alum referral straight to the hiring manager',
  advice: 'a 15-minute call with someone who has lived it',
  foot_in_door: 'a foot in the door before you even apply',
  confidence: 'the confidence that comes from a real conversation',
};

/**
 * Reflection screen at the start of Act 3 that mirrors back every Act 1
 * answer and shows how the network solves each one. Pure read-only.
 */
export default function PersonalizedSummary({ answers, onContinue }) {
  const firstName = answers.firstName || 'You';
  const year = answers.year || 'a student';
  const school = answers.school || 'your school';
  const roles = formatList(answers.targetRoles, 'a role you love');
  const companies = formatList(answers.targetCompanies, 'companies you'+"'"+'re excited about');
  const unlock = unlockMicro[answers.unlock] || 'a real introduction';
  const challenge = challengeMicro[answers.challenge] || 'the hardest part of the search';
  const intros = answers.warmIntros || 'few';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px 20px 40px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        Your plan
      </p>
      <h1 style={{
        fontFamily: playfair, fontSize: 'clamp(24px, 5.4vw, 30px)', fontWeight: 700,
        color: TEXT, lineHeight: 1.25, margin: '0 0 24px', letterSpacing: '-0.005em',
      }}>
        Here's what's possible for you, {firstName}.
      </h1>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: '22px 22px 6px', marginBottom: 28,
      }}>
        <Row label="You" value={`${year} at ${school}`} />
        <Row label="Targeting" value={`${roles} at ${companies}`} />
        <Row label="Warm intros today" value={String(intros).replace('_', '–')} />
        <Row label="What you said you'd unlock" value={unlock} />
      </div>

      <h2 style={{
        fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: TEXT,
        margin: '0 0 14px', letterSpacing: '-0.005em',
      }}>
        How College Fast Forward + FastIQ closes the gap
      </h2>

      <Bullet text={`${school}'s parent and alumni network ${challenge}.`} />
      <Bullet text={`FastIQ scans alumni at ${companies} and surfaces the warmest intros first.`} />
      <Bullet text={`Every outreach gets a personalized AI draft — like the one we just made — so you stop staring at a blank LinkedIn box.`} />
      <Bullet text={`Resume tailored per role, interview prep, and follow-up nudges so you actually get replies.`} />

      <button
        onClick={onContinue}
        style={{
          width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
          background: ORANGE, color: TEXT, fontFamily: dmSans, fontSize: 16,
          fontWeight: 600, cursor: 'pointer', marginTop: 28, minHeight: 'auto',
        }}
      >
        I'm in →
      </button>
    </motion.div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: MUTED, margin: '0 0 4px',
      }}>
        {label}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.45 }}>
        {value}
      </p>
    </div>
  );
}

function Bullet({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
      <span style={{ color: SUCCESS, fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>✓</span>
      <span style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
        {text}
      </span>
    </div>
  );
}
