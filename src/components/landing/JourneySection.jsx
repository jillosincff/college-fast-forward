import Reveal from '@/components/landing/Reveal';
import { GoalsVisual, DailyDropVisual, TailorVisual, WarmPathVisual, TrackVisual } from '@/components/landing/JourneyStepVisuals';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const STEPS = [
  {
    n: '01', kicker: 'Your goals',
    title: 'Tell us what you\u2019re after',
    body: 'Role, city, internship or full-time — 2 minutes, once. Everything CFF does from here on is built around it.',
    Visual: GoalsVisual,
  },
  {
    n: '02', kicker: 'Your daily drop',
    title: 'Fresh jobs land while you sleep',
    body: 'Live, entry-level roles matched to your goals every morning — no scrolling through senior positions or staffing-agency spam.',
    Visual: DailyDropVisual,
  },
  {
    n: '03', kicker: 'Tailored in minutes',
    title: 'Your resume, rewritten for each job',
    body: 'CFF reads the posting and rebuilds your resume around it — the right keywords, the right phrasing, an ATS score that actually clears the filter.',
    Visual: TailorVisual,
  },
  {
    n: '04', kicker: 'The warm path',
    title: 'A real person at the company, found for you',
    body: 'Alumni and CFF parents at that exact company surface automatically — with a personalized intro message already drafted.',
    Visual: WarmPathVisual,
  },
  {
    n: '05', kicker: 'Applied & tracked',
    title: 'One pipeline. Zero spreadsheets.',
    body: 'Every application tracked in one place, with smart reminders for follow-ups — so momentum never dies in a forgotten tab.',
    Visual: TrackVisual,
  },
];

export default function JourneySection() {
  return (
    <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)' }}>
      <style>{`
        .journey-row { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 6vw, 64px); align-items: center; }
        .journey-row.flip .journey-text { order: 2; }
        .journey-row.flip .journey-visual { order: 1; justify-content: flex-start; }
        @media (max-width: 760px) {
          .journey-row, .journey-row.flip { grid-template-columns: 1fr; gap: 20px; }
          .journey-row.flip .journey-text { order: 1; }
          .journey-row.flip .journey-visual { order: 2; }
          .journey-visual { justify-content: flex-start !important; }
        }
      `}</style>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>The path to hired</span>
          </div>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6.5vw, 48px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 12px', textAlign: 'center' }}>
            From doom-scrolling to{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>done-for-you.</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 17px)', color: TEXT2, textAlign: 'center', margin: '0 auto clamp(40px, 9vw, 72px)', maxWidth: 520, lineHeight: 1.6 }}>
            Five steps, mostly automatic. Here's exactly what happens after you sign up.
          </p>
        </Reveal>

        <div style={{ position: 'relative' }}>
          {/* Vertical connector line (desktop) */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(109,40,217,0.18) 8%, rgba(109,40,217,0.18) 92%, transparent)', transform: 'translateX(-0.5px)', pointerEvents: 'none' }} className="journey-line" />
          <style>{`@media (max-width: 760px) { .journey-line { display: none; } }`}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(44px, 10vw, 80px)' }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n}>
                <div className={`journey-row${i % 2 === 1 ? ' flip' : ''}`}>
                  <div className="journey-text">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 900, color: INDIGO, letterSpacing: '0.02em' }}>{s.n}</span>
                      <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>· {s.kicker}</span>
                    </div>
                    <h3 style={{ fontFamily: SF, fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 10px' }}>{s.title}</h3>
                    <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.8vw, 16px)', color: TEXT2, lineHeight: 1.65, margin: 0, fontWeight: 500, maxWidth: 400 }}>{s.body}</p>
                  </div>
                  <div className="journey-visual" style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
                    <s.Visual />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}