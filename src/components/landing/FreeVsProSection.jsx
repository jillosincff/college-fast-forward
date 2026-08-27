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
  '3 matching jobs a day',
  'See how CLIFF works (example Best Path + job list)',
];

const PRO_BULLETS = [
  'People from your school + outreach drafts',
  'Up to 30 matching jobs a day',
  '$X/mo · Ask a parent to unlock',
];

export default function FreeVsProSection({ onGetStarted }) {
  return (
    <section style={{ padding: 'clamp(48px, 9vw, 72px) clamp(20px, 5vw, 32px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', display: 'inline-block', marginBottom: 12 }}>
            Free vs Pro
          </span>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(28px, 6vw, 36px)' }}>
            Start free. Unlock more when it's working.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 3vw, 18px)', textAlign: 'left' }}>
            {/* FREE */}
            <div style={{ background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 26px)' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Free</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, fontWeight: 600, margin: '0 0 16px' }}>Always</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FREE_BULLETS.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={12} color={INDIGO} strokeWidth={3} />
                    </span>
                    <span style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.2vw, 15px)', fontWeight: 600, color: TEXT2, lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRO */}
            <div style={{ background: 'linear-gradient(160deg, #faf5ff 0%, #f5f3ff 100%)', border: `1.5px solid ${INDIGO}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 26px)', position: 'relative', boxShadow: '0 8px 28px rgba(109,40,217,0.12)' }}>
              <span style={{ position: 'absolute', top: -10, right: 16, background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 100 }}>
                Pro
              </span>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: INDIGO_DIM, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Pro</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: INDIGO, fontWeight: 700, margin: '0 0 16px' }}>When you're ready to move faster</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRO_BULLETS.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </span>
                    <span style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.2vw, 15px)', fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
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
          >Get started</button>
        </div>
      </Reveal>
    </section>
  );
}