import { Check } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const FREE_BULLETS = [
  "3 jobs matched to you, with CLIFF's verdict on each (pursue / consider / skip)",
  'One AI-tailored resume for your best-fit application',
  'Application tracker',
  'Career trajectory & next-step guidance',
  'A limited taste of warm networking and AI outreach drafts',
];

const PRO_BULLETS = [
  'Unlimited AI resume tailoring for every application',
  'Unlimited mock interviews with AI feedback',
  'LinkedIn profile review & rewrites',
  'Warm networking through parents & alumni at your target companies',
  'AI outreach drafts that get replies',
  'Priority CLIFF agent with proactive job discoveries',
];

function Bullet({ children, pro }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: pro ? GRAD_INDIGO : '#fff', border: pro ? 'none' : `1.5px solid ${INDIGO_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Check size={12} color={pro ? '#fff' : INDIGO} strokeWidth={3} />
      </span>
      <span style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.2vw, 15px)', fontWeight: 600, color: pro ? TEXT : TEXT2, lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

export default function FreeVsProSection({ onGetStarted }) {
  return (
    <section style={{ padding: 'clamp(48px, 9vw, 72px) clamp(20px, 5vw, 32px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', display: 'inline-block', marginBottom: 12 }}>
            Free vs Pro
          </span>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(28px, 6vw, 36px)' }}>
            Start free. Unlock more when it's working.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 3vw, 18px)', textAlign: 'left' }}>
            {/* FREE */}
            <div style={{ background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 26px)', display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Free</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, fontWeight: 600, margin: '0 0 16px' }}>Your first guided cycle, free.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {FREE_BULLETS.map((b) => (
                  <Bullet key={b}>{b}</Bullet>
                ))}
              </div>
              <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.2vw, 14.5px)', fontWeight: 800, color: INDIGO_DIM, margin: 'auto 0 0', paddingTop: 4 }}>Free forever · No credit card</p>
            </div>

            {/* PRO */}
            <div style={{ background: 'linear-gradient(160deg, #faf5ff 0%, #f5f3ff 100%)', border: `1.5px solid ${INDIGO}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 26px)', position: 'relative', boxShadow: '0 8px 28px rgba(109,40,217,0.12)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ position: 'absolute', top: -10, right: 16, background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 100 }}>
                Pro
              </span>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: INDIGO_DIM, letterSpacing: '-0.02em', margin: '0 0 4px' }}>CLIFF Pro</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: INDIGO, fontWeight: 700, margin: '0 0 16px' }}>Everything, unlimited.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRO_BULLETS.map((b) => (
                  <Bullet key={b} pro>{b}</Bullet>
                ))}
              </div>
              <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.2vw, 14.5px)', fontWeight: 800, color: TEXT, margin: '16px 0 14px' }}>$19.96/month, billed monthly. Cancel anytime.</p>
              <button onClick={onGetStarted} style={{
                fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 15.5px)', fontWeight: 800, color: '#fff',
                background: GRAD_INDIGO, border: 'none', borderRadius: 999,
                padding: '13px clamp(18px, 4vw, 28px)', cursor: 'pointer', minHeight: 48, marginTop: 'auto',
                boxShadow: '0 10px 32px rgba(109,40,217,0.30)', transition: 'all 0.15s',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.40)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(109,40,217,0.30)'; }}
              >Try Pro free for 7 days — no credit card</button>
            </div>
          </div>

          {/* Purple CTA */}
          <button onClick={onGetStarted} style={{
            fontFamily: SF, fontSize: 'clamp(15px, 3.8vw, 17px)', fontWeight: 800, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 999,
            padding: '15px clamp(32px, 6vw, 44px)', cursor: 'pointer', minHeight: 52,
            boxShadow: '0 10px 32px rgba(109,40,217,0.30)', transition: 'all 0.15s',
            marginTop: 'clamp(24px, 5vw, 32px)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.40)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(109,40,217,0.30)'; }}
          >Start my guided job search →</button>
        </div>
      </Reveal>
    </section>
  );
}