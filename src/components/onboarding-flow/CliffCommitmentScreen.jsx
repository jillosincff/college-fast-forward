import { useState, useEffect, useRef } from 'react';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, GRAD_INDIGO,
  GREEN, GREEN_LIGHT, GREEN_BORDER, SHADOW,
} from './onboardingShared';

const PLAN_STEPS = [
  { icon: '🔍', text: 'Searching live job boards…' },
  { icon: '🧠', text: 'Learning your preferences…' },
  { icon: '⚖️', text: 'Prioritizing opportunities…' },
  { icon: '🤝', text: 'Finding warm connections…' },
  { icon: '📄', text: 'Checking your resume…' },
  { icon: '📅', text: 'Preparing your first week…' },
];

const SOLVE_MAP = {
  which_jobs: 'Tell you exactly which jobs deserve your attention',
  resume: 'Keep sharpening your resume for every application',
  ghosted: 'Get your applications past the black hole and in front of humans',
  interviews: 'Prepare every application so more of them convert to interviews',
  outreach: 'Surface parents & alumni you can actually contact',
  disorganized: 'Track everything and remind you when to follow up',
  no_direction: 'Help you discover the path that actually fits you',
};

/**
 * Final onboarding screen — no pricing. CLIFF states its plan, the student
 * confirms, then CLIFF visibly "builds the plan" and drops them on the dashboard
 * where the free Magic Moment application is waiting.
 */
export default function CliffCommitmentScreen({
  resumeData, firstName, college, seeking, blockers = [],
  locationPref, locationCity, selectedIndustries = [], targetRoles = [],
  onBack, saveAndAuth,
}) {
  const [phase, setPhase] = useState('confirm'); // 'confirm' | 'planning' | 'ready'
  const [stepIdx, setStepIdx] = useState(0);
  const launchedRef = useRef(false);

  const seekingLabel = seeking === 'internship' ? 'internships'
    : seeking === 'fulltime' ? 'full-time roles'
    : seeking === 'both' ? 'internships and full-time roles'
    : 'the right opportunities';
  const locationLabel = locationPref === 'remote' ? 'remote roles'
    : locationPref === 'hybrid' ? 'flexible & hybrid roles'
    : locationCity ? `opportunities in ${locationCity}` : 'your target market';
  const industriesLabel = selectedIndustries.slice(0, 2).join(' & ');

  const commitments = [
    industriesLabel
      ? `Prioritize ${industriesLabel}${targetRoles[0] ? ` — starting with ${targetRoles[0]} roles` : ''}`
      : 'Learn which industries fit you as we go',
    `Focus on ${locationLabel}`,
    `Help you land ${seekingLabel} first`,
    ...(blockers[0] && SOLVE_MAP[blockers[0]] ? [SOLVE_MAP[blockers[0]]] : []),
    resumeData
      ? 'Use your upgraded resume as the foundation for every application'
      : "Build your resume foundation from what you've shared",
    'Build your first application — free',
  ];

  // Planning animation → then straight to the dashboard (Magic Moment)
  useEffect(() => {
    if (phase !== 'planning') return;
    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, PLAN_STEPS.length - 1));
    }, 1300);
    const done = setTimeout(() => {
      setPhase('ready');
    }, PLAN_STEPS.length * 1300 + 900);
    return () => { clearInterval(interval); clearTimeout(done); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShowPlan = () => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    saveAndAuth('free');
  };

  // ── PHASE 3: The emotional handoff — CLIFF says "I did the work." ──
  if (phase === 'ready') {
    const industriesLabel2 = selectedIndustries.slice(0, 2).join(' & ');
    return (
      <div style={{ textAlign: 'center', maxWidth: 500, width: '100%', paddingTop: 60, animation: 'fadeUp 0.4s ease' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '6px 16px', marginBottom: 22 }}>
          <span style={{ fontSize: 13 }}>✓</span>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#0891b2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Your Career Plan is Ready</span>
        </div>

        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.15 }}>
          {firstName ? `Hi ${firstName}.` : 'Hi.'}
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: TEXT2, margin: '0 0 26px' }}>
          While you were setting up your profile, I already got to work.
        </p>

        <div style={{ background: CARD, border: '1px solid #E8EAF6', borderRadius: 16, padding: '22px 26px', textAlign: 'left', boxShadow: '0 4px 24px rgba(109,40,217,0.08)', marginBottom: 26 }}>
          {[
            industriesLabel2
              ? `Opportunities in ${industriesLabel2} I think are worth your time — already queued.`
              : 'A first batch of opportunities I think are worth your time — already queued.',
            'Your first application is on me — free.',
            "I'll explain every recommendation I make.",
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{['🎯', '🎁', '💬'][i]}</span>
              <p style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 500, color: TEXT, margin: 0, lineHeight: 1.6 }}>{line}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>Let's get started.</p>

        <button
          onClick={handleShowPlan}
          className="onb-btn-primary"
          style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto', fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '18px 40px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(109,40,217,0.38)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(109,40,217,0.28)'; }}
        >
          Show My Plan →
        </button>
      </div>
    );
  }

  if (phase === 'planning') {
    return (
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%', paddingTop: 60, animation: 'fadeUp 0.35s ease' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 22px' }}>🤖</div>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.25 }}>
          Give me about 30 seconds.
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 32px', lineHeight: 1.6 }}>
          I'm building your career plan.
        </p>
        <div style={{ background: CARD, border: '1px solid #E8EAF6', borderRadius: 16, padding: '22px 26px', textAlign: 'left', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
          {PLAN_STEPS.map((s, i) => {
            const isDone = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: i > stepIdx ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
                {isDone ? (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: GREEN, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                ) : isCurrent ? (
                  <span style={{ width: 20, height: 20, border: `2.5px solid rgba(109,40,217,0.25)`, borderTop: `2.5px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0, boxSizing: 'border-box' }} />
                ) : (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #E2E8F0', flexShrink: 0, boxSizing: 'border-box' }} />
                )}
                <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: isCurrent ? 700 : 500, color: isDone ? TEXT2 : isCurrent ? TEXT : TEXT3, margin: 0 }}>{s.text}</p>
              </div>
            );
          })}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, marginTop: 20, fontStyle: 'italic' }}>
          Your first CLIFF-built application will be waiting on your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: 540, width: '100%', paddingTop: 40, animation: 'fadeUp 0.35s ease' }}>
      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 22 }}>
        <span style={{ fontSize: 13 }}>🤖</span>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: INDIGO, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Based on what you told me</span>
      </div>

      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.15 }}>
        Here's what I'm going to do.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 auto 28px', maxWidth: 440, lineHeight: 1.65 }}>
        {college ? `Your plan, built around you and ${college}.` : 'Your plan, built around you.'}
      </p>

      {/* Commitment list */}
      <div style={{ background: CARD, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 16, padding: '24px 26px', textAlign: 'left', boxShadow: SHADOW, marginBottom: 24 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>I'm going to:</p>
        {commitments.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < commitments.length - 1 ? 12 : 0 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, color: '#0891b2', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>✓</span>
            <p style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: i === commitments.length - 1 ? 700 : 500, color: TEXT, margin: 0, lineHeight: 1.55 }}>{c}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>Does this look right?</p>

      <button
        onClick={() => setPhase('planning')}
        className="onb-btn-primary"
        style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 12px', fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '18px 40px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(109,40,217,0.38)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(109,40,217,0.28)'; }}
      >
        Yes — build my plan →
      </button>
      <button
        onClick={onBack}
        style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 10px', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        Edit my answers
      </button>
    </div>
  );
}