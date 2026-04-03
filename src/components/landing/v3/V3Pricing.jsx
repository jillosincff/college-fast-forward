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
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px' }}>
      <div className="max-w-[700px] mx-auto">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, ...fadeStyle(vis, 0) }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#AAAAAA', margin: '0 0 8px' }}>
            SIMPLE PRICING
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
            Two options. No surprises.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16, marginBottom: 24, ...fadeStyle(vis, 0.06) }}>

          {/* FREE TIER */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '28px 24px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', margin: '0 0 12px' }}>COLLEGE FAST FORWARD</p>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: playfair, fontSize: 48, fontWeight: 700, color: '#1A1A1A' }}>$0</span>
              <span style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginLeft: 4 }}>/ forever</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 20px' }}>A warm network to kickstart your career.</p>
            {[
              'Student profile + career goals',
              'Resume upload + AI score',
              'Company Intel + hiring signals',
              'Browse 455+ parents and professionals',
              '1 free alumni search',
              'Direct messaging',
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                <span style={{ color: '#22C55E', fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#444', margin: 0, lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
            <button
              onClick={() => { window.location.hash = '#StudentOnboarding'; }}
              style={{ background: 'none', border: '2px solid #E85D20', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: dmSans, width: '100%', marginTop: 24, minHeight: 'auto' }}
            >
              Join Free →
            </button>
          </div>

          {/* FASTIQ TIER */}
          <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: '#E85D20', borderRadius: 20, padding: '4px 12px' }}>
              <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>MOST POPULAR</p>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>CFF + FASTIQ™</p>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: playfair, fontSize: 48, fontWeight: 700, color: '#fff' }}>$29</span>
              <span style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>/ month</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>or $249/year — save 28%</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '0 0 20px' }}>The warm network + AI to turbocharge your job search.</p>
            {[
              'Unlimited alumni searches at any company',
              'Resume tailoring to any job description',
              'Full STAR method mock interview practice',
              'LinkedIn profile scoring and optimization',
              'AI outreach drafts with follow-up nudges',
              'Career archetype assessment',
              'Personalized AI dashboard briefing',
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                <span style={{ color: '#E85D20', fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
            <button
              onClick={onCTA}
              style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: dmSans, width: '100%', marginTop: 24, minHeight: 'auto' }}
            >
              Unlock FastIQ →
            </button>
            <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '12px 0 0' }}>
              🎖 Founding rate: $14.50/mo forever · Expires April 15
            </p>
          </div>

        </div>

        {/* Trust line */}
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#AAAAAA', textAlign: 'center', margin: 0, ...fadeStyle(vis, 0.12) }}>
          Cancel anytime · No contracts · Founding rate locks in forever
        </p>

      </div>
    </section>
  );
}