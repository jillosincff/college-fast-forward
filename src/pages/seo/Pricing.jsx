import React, { useState } from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Section, CrossLinks } from '@/components/seo-landing/SeoSections';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

// Brand tokens (matched to SeoSections)
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

const FREE_FEATURES = [
  'AI resume tailoring for your first application (Magic Moment)',
  "Today's Best Moves — CLIFF picks the 3 jobs worth your time",
  'CLIFF\u2019s verdict on every job (pursue / consider / skip)',
  'Job application tracker',
  'Career trajectory & next-step guidance',
];

const PRO_FEATURES = [
  'Unlimited AI resume tailoring for every application',
  'Unlimited mock interviews with AI feedback',
  'LinkedIn profile review & rewrites',
  'Warm networking through parents & alumni at your targets',
  'AI outreach drafts that get replies',
  'Priority CLIFF agent & proactive discoveries',
];

const COMPARISON = [
  { feature: 'AI resume tailoring', free: '1 free application', pro: 'Unlimited' },
  { feature: 'Mock interviews', free: '\u2014', pro: 'Unlimited' },
  { feature: 'LinkedIn review', free: '\u2014', pro: 'Included' },
  { feature: 'Warm networking (parents & alumni)', free: 'Limited', pro: 'Full access' },
  { feature: 'AI outreach drafts', free: 'Limited', pro: 'Unlimited' },
  { feature: "Today\u2019s Best Moves & job verdicts", free: 'Included', pro: 'Included' },
  { feature: 'Application tracker', free: 'Included', pro: 'Included' },
  { feature: 'Priority CLIFF agent', free: '\u2014', pro: 'Included' },
];

const FAQS = [
  { q: 'Is CLIFF really free for college students?', a: 'Yes. The free plan is free for college students and recent grads \u2014 no credit card required. You get CLIFF\u2019s job verdicts, Today\u2019s Best Moves, the application tracker, and one free CLIFF-powered application (your Magic Moment).' },
  { q: 'How much is CLIFF Pro?', a: 'CLIFF Pro is $19.96 per month (billed as $4.99/week). You can cancel anytime \u2014 no lock-in.' },
  { q: 'Who is CLIFF for?', a: 'CLIFF is built for US college students and recent graduates searching for internships and entry-level jobs.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account at any time and keep access until the end of your billing period.' },
];

export default function Pricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePro = async () => {
    setError('');
    if (!user) {
      // Anonymous visitors sign up first; checkout happens after onboarding.
      window.location.hash = '#/GetStarted';
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        plan: 'pro_monthly',
        user: { id: user.id, email: user.email, family_id: user.family_id },
      });
      const result = res?.data || res;
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      setError(result?.error || 'Could not start checkout. Please try again.');
    } catch (e) {
      setError('Could not start checkout. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SeoLandingLayout
      title="Pricing | Free for Students & CLIFF Pro $19.96/mo | College Fast Forward"
      description="CLIFF is free for college students. Go Pro for $19.96/month \u2014 unlimited AI resume tailoring, mock interviews, LinkedIn review, and warm networking. Cancel anytime."
      slug="pricing"
    >
      {/* Hero */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>Pricing</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,50px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.08, margin: '0 0 20px' }}>
          Free for students.{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Go Pro for $19.96/mo.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 680 }}>
          CLIFF is the AI career agent that finds jobs worth applying to, tailors your resume, and lands interviews. Start free \u2014 upgrade when you want CLIFF working on every application.
        </p>
      </section>

      {/* Pricing cards */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, alignItems: 'stretch' }}>
          {/* Free */}
          <div style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: '32px 28px', boxShadow: SHADOW, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT2, margin: '0 0 8px', letterSpacing: '0.04em' }}>CLIFF</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '0 0 22px' }}>
              <span style={{ fontFamily: SF, fontSize: 44, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em' }}>$0</span>
              <span style={{ fontFamily: INTER, fontSize: 15, color: TEXT3 }}>/ forever</span>
            </div>
            <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: '0 0 22px' }}>Everything you need to find the right jobs and land your first application \u2014 free.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: INTER, fontSize: 14.5, color: TEXT, lineHeight: 1.5 }}>
                  <span style={{ color: INDIGO, fontWeight: 800, flexShrink: 0 }}>\u2713</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="#/GetStarted" style={{ display: 'block', textAlign: 'center', fontFamily: SF, fontSize: 16, fontWeight: 800, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 14, padding: '15px 24px', textDecoration: 'none' }}>
              Start Free
            </a>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(180deg,#ffffff 0%,#fbfaff 100%)', border: `2px solid ${INDIGO}`, borderRadius: 20, padding: '32px 28px', boxShadow: '0 14px 40px rgba(109,40,217,0.18)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -12, left: 28, background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, boxShadow: '0 6px 16px rgba(109,40,217,0.4)' }}>Most popular</span>
            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: INDIGO, margin: '0 0 8px', letterSpacing: '0.04em' }}>CLIFF Pro</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '0 0 4px' }}>
              <span style={{ fontFamily: SF, fontSize: 44, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em' }}>$19.96</span>
              <span style={{ fontFamily: INTER, fontSize: 15, color: TEXT3 }}>/ month</span>
            </div>
            <p style={{ fontFamily: INTER, fontSize: 13, color: TEXT3, margin: '0 0 22px' }}>$4.99/week, billed monthly \u00b7 Cancel anytime</p>
            <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: '0 0 22px' }}>CLIFF does the work on every job \u2014 unlimited tailoring, prep, and warm networking.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {PRO_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: INTER, fontSize: 14.5, color: TEXT, lineHeight: 1.5 }}>
                  <span style={{ color: INDIGO, fontWeight: 800, flexShrink: 0 }}>\u2713</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handlePro}
              disabled={loading}
              style={{ display: 'block', width: '100%', fontFamily: SF, fontSize: 16, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 14, padding: '15px 24px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 30px rgba(109,40,217,0.32)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Launching\u2026' : user ? 'Go CLIFF Pro \u2192' : 'Sign up to go Pro \u2192'}
            </button>
            {error && <p style={{ fontFamily: INTER, fontSize: 13, color: '#dc2626', textAlign: 'center', margin: '12px 0 0', fontWeight: 600 }}>{error}</p>}
          </div>
        </div>
      </Section>

      {/* Comparison table */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 22px' }}>Compare plans</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: INTER, fontSize: 15, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${INDIGO_BORDER}` }}>
                <th style={{ textAlign: 'left', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: TEXT2, fontSize: 14 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: TEXT, fontSize: 15 }}>Free</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: INDIGO, fontSize: 15 }}>CLIFF Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(109,40,217,0.08)' }}>
                  <td style={{ padding: '14px 12px', color: TEXT, fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: TEXT2 }}>{row.free}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: INDIGO_DIM, fontWeight: 700 }}>{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section narrow>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 22px' }}>Pricing FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 14, padding: '22px 22px', boxShadow: SHADOW }}>
              <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>{f.q}</h3>
              <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
          { label: 'ATS Resume Checker', to: '#/ats-resume-checker' },
          { label: 'Interview Prep', to: '#/interview-prep' },
          { label: 'Job Application Tracker', to: '#/job-application-tracker' },
          { label: 'LinkedIn Review', to: '#/linkedin-review' },
        ]}
      />
    </SeoLandingLayout>
  );
}