import React from 'react';
import { playfair, dmSans, DARK_BG_ALT, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const CHECK = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5.5L4 7.5L8 3" stroke="#E85D20" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FeatureItem({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(232,93,32,0.1)', border: '0.5px solid rgba(232,93,32,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        {CHECK}
      </div>
      <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function FeatureGroupLabel({ text }) {
  return (
    <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 10, marginTop: 4 }}>
      {text}
    </p>
  );
}

/* ── Card wrapper ──────────────────────────────────── */
function PricingCard({ badge, name, price, descriptor, subhead, features, cta, ctaStyle, finePrint, highlighted, children }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: highlighted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
      border: highlighted ? `2px solid ${ORANGE}` : '1px solid #1F1F23',
      borderRadius: 20,
      padding: highlighted ? '36px 26px 32px' : '30px 24px 28px',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      boxShadow: highlighted ? '0 8px 40px rgba(232,93,32,0.12), 0 0 60px rgba(232,93,32,0.04)' : 'none',
    }}>
      {badge && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#fff', background: ORANGE, borderRadius: 100, padding: '5px 16px', whiteSpace: 'nowrap',
          }}>
            {badge}
          </span>
        </div>
      )}

      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{name}</p>
      <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#fff', marginBottom: 2, lineHeight: 1.2 }}>{price}</p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>{descriptor}</p>

      <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#FFFFFF', marginBottom: 18, lineHeight: 1.4 }}>{subhead}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, flex: 1 }}>
        {children || features.map((f, i) => <FeatureItem key={i} text={f} />)}
      </div>

      <button
        onClick={cta.onClick}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
        style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 600, borderRadius: 100, padding: '14px 28px',
          cursor: 'pointer', transition: 'all 0.3s ease', width: '100%', textAlign: 'center',
          minHeight: 'auto', minWidth: 'auto', lineHeight: 1.35, filter: 'brightness(1)',
          ...(ctaStyle === 'solid'
            ? { background: ORANGE, color: '#fff', border: 'none', boxShadow: '0 4px 24px rgba(232,93,32,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' }
            : { background: 'transparent', color: ORANGE, border: `1.5px solid ${ORANGE}`, boxShadow: 'none' }),
        }}
      >
        {cta.text}
      </button>

      {finePrint && (
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 10, lineHeight: 1.5 }}>
          {finePrint}
        </p>
      )}
    </div>
  );
}

/* ── Free tier features ────────────────────────────── */
const FREE_FEATURES = [
  'Student profile and career goals',
  'See how many alumni from your school are at top companies',
  'Browse target company suggestions',
  'Parent professional profile and network listing',
  'Make warm introductions for students in the network',
  'Parent Impact Score — track your community contributions',
];

/* ── FastIQ tier features ──────────────────────────── */
const FASTIQ_STUDENT = [
  'Full alumni names, roles, and prioritization',
  'AI-generated personalized outreach messages',
  'Target company identification and ranking',
  'Resume tailoring for each role',
  'LinkedIn profile review',
  'Mock interview preparation',
  'Daily action plan and pipeline tracking',
];

const FASTIQ_PARENT = [
  'FastIQ activated for your student',
  'Full alumni visibility',
  'Intro requests for your student surfaced to the network',
  'Progress dashboard — see exactly what your student is working on',
];

/* ── University tier features ──────────────────────── */
const UNI_FEATURES = [
  'Campus-wide FastIQ access for all students',
  'Career center dashboard and reporting',
  'Alumni network integration',
  'Co-branded platform',
  'Dedicated onboarding and support',
  'Outcomes data for accreditation and rankings',
];

/* ── Main component ────────────────────────────────── */
export default function V3Pricing({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@media(max-width:820px){.v3-pricing-grid{flex-direction:column !important; max-width:420px !important; margin-left:auto !important; margin-right:auto !important}}`}</style>

      <div aria-hidden className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, var(--accent-glow, rgba(79,140,255,0.05)), transparent 70%)' }} />

      <div className="max-w-[1060px] mx-auto relative">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, marginBottom: 14, ...fadeStyle(vis, 0) }}>
          Pricing
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10, ...fadeStyle(vis, 0.02) }}>
          Choose how your family gets started.
        </h2>

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55, maxWidth: 520, margin: '0 auto 48px', ...fadeStyle(vis, 0.04) }}>
          Free to explore. Powerful when you're ready to act.
        </p>

        {/* ── Three cards ───────────────────────────── */}
        <div className="v3-pricing-grid" style={{ display: 'flex', gap: 20, alignItems: 'stretch', ...fadeStyle(vis, 0.08) }}>
          {/* Free */}
          <PricingCard
            name="The Network"
            price="$0"
            descriptor="Free forever"
            subhead="Get inside. Start exploring."
            features={FREE_FEATURES}
            cta={{ text: 'Get Started Free', onClick: onCTA }}
            ctaStyle="outline"
          >
            {FREE_FEATURES.map((f, i) => <FeatureItem key={i} text={f} />)}
            <p style={{ fontFamily: dmSans, fontStyle: 'italic', fontSize: 13, fontWeight: 400, color: 'rgba(232,93,32,0.7)', lineHeight: 1.5, marginTop: 6 }}>
              🔒 Full alumni names and outreach tools require FastIQ
            </p>
          </PricingCard>

          {/* FastIQ — highlighted */}
          <PricingCard
            badge="MOST POPULAR"
            highlighted
            name="FastIQ™"
            price="$29/mo"
            descriptor="Start free for 7 days — then $29/month. Cancel anytime."
            subhead="The full system. For families ready to act."
            cta={{ text: 'Start Your Free Trial', onClick: onCTA }}
            ctaStyle="solid"
            finePrint="Cancel anytime."
          >
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                or $249/year
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE, marginBottom: 14 }}>
                Save 28% with annual
              </p>
            </div>

            <FeatureGroupLabel text="Your student gets:" />
            {FASTIQ_STUDENT.map((f, i) => <FeatureItem key={`s-${i}`} text={f} />)}

            <div style={{ height: 16 }} />
            <FeatureGroupLabel text="You get:" />
            {FASTIQ_PARENT.map((f, i) => <FeatureItem key={`p-${i}`} text={f} />)}
          </PricingCard>

          {/* University */}
          <PricingCard
            name="University Partner"
            price="Custom"
            descriptor="Campus-wide access"
            subhead="For career centers ready to scale."
            features={UNI_FEATURES}
            cta={{ text: 'Contact Us', onClick: () => { window.location.hash = '#SubmitFeedback'; } }}
            ctaStyle="outline"
          />
        </div>

        {/* Closing lines */}
        <p className="text-center" style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.45)', marginTop: 36, lineHeight: 1.6, ...fadeStyle(vis, 0.14) }}>
          The network grows stronger with every family. Your student benefits from every parent who joins.
        </p>
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#fff', marginTop: 12, ...fadeStyle(vis, 0.16) }}>
          <span style={{ color: ORANGE, fontWeight: 500 }}>1,200+</span> families already inside.
        </p>
      </div>
    </section>
  );
}