import { useState } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const CARD = '#ffffff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const INDIGO = '#6d28d9';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

const LINK = 'https://collegefastforward.com/#/GetStarted';

/**
 * Primary post-signup share for parents: get their own student on CFF.
 * A parent telling their kid converts far better than parent-to-parent sharing.
 */
export default function InviteStudentCard({ parentFirstName }) {
  const [copied, setCopied] = useState(false);

  const message = `I just joined College Fast Forward — it's an AI career agent that finds internships and preps your applications for you. Set up your account here: ${LINK}`;

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // iOS needs "sms:&body=", Android/others use "sms:?body=". Desktop has no SMS
  // handler at all, so there we just copy the message instead of dead-ending.
  const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const smsHref = `sms:${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;

  const handleText = (e) => {
    if (!isMobile) {
      e.preventDefault();
      copy();
    }
  };

  return (
    <div style={{
      background: CARD, border: `1px solid ${INDIGO_BORDER}`,
      borderRadius: 18, padding: 'clamp(20px, 5vw, 28px)',
      boxShadow: SHADOW_LG, marginBottom: 20, textAlign: 'left',
    }}>
      <p style={{
        fontFamily: SF, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.10em', color: INDIGO, margin: '0 0 8px',
      }}>
        Do this next
      </p>
      <h2 style={{
        fontFamily: SF, fontSize: 'clamp(19px, 5vw, 22px)', fontWeight: 900,
        color: TEXT, letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.25,
      }}>
        Get your student on College Fast Forward.
      </h2>
      <p style={{ fontFamily: SF, fontSize: 14.5, color: TEXT2, lineHeight: 1.65, margin: '0 0 18px' }}>
        Your student gets an AI career agent that finds internships and preps their applications for them. Send them the link — it takes about two minutes to set up.
      </p>

      <a
        href={smsHref}
        onClick={handleText}
        style={{
          display: 'block', textAlign: 'center', fontFamily: SF, fontSize: 15, fontWeight: 700,
          color: '#fff', background: GRAD_INDIGO, borderRadius: 12,
          padding: '15px 20px', textDecoration: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(109,40,217,0.30)', marginBottom: 10,
        }}
      >
        {!isMobile && copied ? '✓ Message copied — paste it to your student' : 'Text my student the link →'}
      </a>

      <button
        onClick={copy}
        style={{
          width: '100%', fontFamily: SF, fontSize: 14.5, fontWeight: 700,
          color: INDIGO, background: 'transparent', border: `1px solid ${INDIGO_BORDER}`,
          borderRadius: 12, padding: '13px 20px', cursor: 'pointer', minHeight: 48,
          touchAction: 'manipulation',
        }}
      >
        {copied ? '✓ Message copied!' : 'Copy the message instead'}
      </button>
    </div>
  );
}