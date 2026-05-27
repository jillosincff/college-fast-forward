import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import FunnelProgress from './FunnelProgress';
import LinkedInLoader from './LinkedInLoader';

// ── Design Tokens — Purple/Indigo (match landing pages) ──────────────────────────────────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BG = '#f8f9ff';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const VIOLET = '#7c3aed';
const VIOLET_LIGHT = 'rgba(124,58,237,0.08)';
const VIOLET_BORDER = 'rgba(124,58,237,0.20)';
const TEAL = '#06b6d4';
const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const CORAL = '#f43f5e';
const CORAL_LIGHT = 'rgba(244,63,94,0.07)';
const CORAL_BORDER = 'rgba(244,63,94,0.22)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const BORDER_R = 12;
const LI_BORDER = '1px solid #E2E8F0';
// Aliases for backward compat
const BLUE = INDIGO;
const BLUE_LIGHT = INDIGO_LIGHT;
const BLUE_BORDER = INDIGO_BORDER;
const GREEN = TEAL;
const GREEN_LIGHT = TEAL_LIGHT;
const GREEN_BORDER = TEAL_BORDER;

function TypewriterText({ text, delay = 22, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed('');
    idx.current = 0;
    if (!text) return;
    const timer = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(timer);
        onDone?.();
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}</span>;
}

// LinkedIn-style profile card
function LinkedInProfileCard({ name, headline, college, expanded, onExpand, aboutFull, typingDone, setTypingDone, onPaywall }) {
  const ABOUT_PREVIEW_LEN = 200;
  const aboutPreview = aboutFull?.slice(0, ABOUT_PREVIEW_LEN) || '';
  const aboutRest = aboutFull?.slice(ABOUT_PREVIEW_LEN) || '';

  const initials = (name || 'S U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* ── Header Card ── */}
      <div style={{ background: CARD, border: LI_BORDER, borderRadius: BORDER_R, overflow: 'hidden', marginBottom: 12 }}>
        {/* Banner */}
        <div style={{
          height: 96,
          background: GRAD_INDIGO,
          position: 'relative',
        }} />

        {/* Avatar overlapping banner */}
        <div style={{ padding: '0 24px 20px', position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            border: '4px solid #FFFFFF',
            background: GRAD_INDIGO,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: -44, marginBottom: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{initials}</span>
          </div>

          {/* Identity */}
          <h2 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: '#1F2937', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {name || 'Your Name'}
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 16, color: '#1F2937', margin: '0 0 6px', lineHeight: 1.5 }}>
            {headline}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#6B7280', margin: '0 0 14px' }}>
            Greater {college ? college.split(' ').slice(-2).join(' ') : 'University'} Area • {college || 'University of Florida'}
          </p>

          {/* Connection strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex' }}>
              {['#4F46E5','#0891B2','#059669'].map((c, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i === 0 ? 0 : -6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>{['A','B','C'][i]}</span>
                </div>
              ))}
            </div>
            <span style={{ fontFamily: FONT, fontSize: 12, color: BLUE, fontWeight: 600 }}>
              87 connections • 500+ in network
            </span>
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1, background: BLUE, borderRadius: 100, padding: '8px 0', textAlign: 'center' }}>
              <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff' }}>Open to</span>
            </div>
            <div style={{ flex: 1, background: 'transparent', border: `1.5px solid #0A66C2`, borderRadius: 100, padding: '8px 0', textAlign: 'center' }}>
              <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#0A66C2' }}>Message</span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid #0A66C2`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
              <span style={{ fontSize: 16, color: '#0A66C2' }}>⋯</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── About Card ── */}
      <div style={{ background: CARD, border: LI_BORDER, borderRadius: BORDER_R, padding: '20px 24px', marginBottom: 12 }}>
        <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 12px' }}>About</h3>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            <TypewriterText text={aboutPreview} delay={16} onDone={() => setTypingDone(true)} />
            {!typingDone && (
              <span style={{ display: 'inline-block', width: 2, height: 14, background: BLUE, marginLeft: 2, animation: 'liBlinkCursor 1s step-end infinite', verticalAlign: 'middle' }} />
            )}
          </p>

          {typingDone && expanded && aboutRest && (
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT, margin: '4px 0 0', lineHeight: 1.75, whiteSpace: 'pre-wrap', animation: 'liExpandAbout 0.35s ease' }}>
              {aboutRest}
            </p>
          )}

          {typingDone && !expanded && aboutRest && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))', pointerEvents: 'none' }} />
          )}
        </div>

        {typingDone && !expanded && aboutRest && (
          <button
            onClick={onExpand}
            style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0', marginTop: 4, display: 'inline-block' }}
          >
            ...see more
          </button>
        )}
      </div>
    </>
  );
}

export default function LinkedInScreen({ resumeData, college, seeking, targetRole, selectedIndustries = [], onBack, saveAndAuth, onNext }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const [activeHeadline, setActiveHeadline] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [step3Active, setStep3Active] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const firstName = resumeData?.original?.name?.split(' ')[0] || null;
  const fullName = resumeData?.original?.name || null;
  const seekingLabel = targetRole || (seeking === 'internship' ? 'Internship' : seeking === 'fulltime' ? 'Full-Time Role' : 'Opportunity');

  useEffect(() => { generateLinkedIn(); }, []);

  const generateLinkedIn = async () => {
    setLoading(true);
    setTypingDone(false);
    setAboutExpanded(false);
    try {
      const resumeSummary = resumeData?.original
        ? `Name: ${resumeData.original.name || 'Student'}
Skills: ${(resumeData.original.skills || []).slice(0, 8).join(', ')}
Education: ${(resumeData.original.education || []).map(e => `${e.school} - ${e.degree}`).join('; ')}
Experience: ${(resumeData.original.experience || []).map(e => `${e.title} at ${e.company}`).join('; ')}`
        : `University: ${college || 'top university'}, Seeking: ${seekingLabel}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an elite Career Coach and LinkedIn Branding Expert. Transform this student's resume data into a high-authority LinkedIn profile.

Resume Data:
${resumeSummary}
University: ${college || 'University of Florida'}
Target Role: ${seekingLabel}

RULES:
- Never use "Aspiring." Use active, confident titles.
- No corporate buzzwords.
- Use "I" statements in the About section.
- Focus on results and outcomes.

Task 1 - Create 3 headline variations (max 220 chars each):
Format: [Target Role] | [Key Skill] | [Unique Value] | [University] '26

Task 2 - Write a 3-paragraph About section (under 2000 chars total):
Para 1 (Hook): The problem you solve.
Para 2 (Proof): A key project/internship with one specific metric.
Para 3 (CTA): University, target role, invite to connect.

Task 3 - Top 10 LinkedIn keywords for ATS optimization.

Task 4 - A 300-character alumni DM with a warm greeting + shared connection + low-friction ask.

Return valid JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            headlines: { type: 'array', items: { type: 'string' } },
            about_full: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
            alumni_dm: { type: 'string' }
          }
        }
      });
      setResult(res);
    } catch {
      setResult({
        headlines: [
          `${seekingLabel} | Results-Driven | Problem Solver | ${college || 'University of Florida'} '26`,
          `${seekingLabel} | Collaborative & Data-Informed | ${college || 'University of Florida'} '26`,
          `${seekingLabel} | Remote-Ready | Fast Learner | ${college || 'University of Florida'} '26`,
        ],
        about_full: `I build systems that make teams faster and clients happier. As a ${college || 'UF'} senior entering the workforce, I focus on turning ambiguous problems into structured, scalable solutions.\n\nDuring my internship at [Company], I redesigned our project tracking workflow, reducing missed deadlines by 30% and saving the team ~5 hours per week. I thrive at the intersection of strategy and execution.\n\nI'm actively targeting ${seekingLabel} roles. If you're a recruiter or ${college || 'UF'} alum, I'd love to connect and learn about your team's culture.`,
        keywords: ['Project Management', 'Remote Collaboration', 'Agile', 'Notion', 'Asana', 'Data Analysis', 'Cross-functional Teams', 'Process Improvement', 'Google Workspace', 'Communication'],
        alumni_dm: `Hi [Name] — fellow ${college || 'UF'} alum here! I noticed you're at [Company] and would love to hear one thing about the team culture. I'm targeting ${seekingLabel} roles — any chance you have 5 minutes?`
      });
    }
    setLoading(false);
  };

  /* ── Loading State ── */
  if (loading) {
    return <LinkedInLoader firstName={firstName} college={college} selectedIndustries={selectedIndustries} onSkip={() => setLoading(false)} />;
  }

  if (!result) return null;

  const selectedHeadline = (result.headlines || [])[activeHeadline] || '';

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 100, paddingBottom: 80, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes liBlinkCursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes liExpandAbout { from{opacity:0;max-height:0} to{opacity:1;max-height:600px} }
        @keyframes step3pulse { 0%,100%{box-shadow:0 0 0 3px rgba(0,102,255,0.2)} 50%{box-shadow:0 0 0 6px rgba(0,102,255,0.08)} }
        @keyframes fadUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
      <div style={{ marginBottom: 20 }}>
        <FunnelProgress activeStep={1} />
      </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>💼</span>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LinkedIn Identity Architect</span>
        </div>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 800, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {firstName ? `${firstName}, your LinkedIn profile is` : 'Your LinkedIn profile is'}{' '}
          <span style={{ color: BLUE }}>rebuilt to get you noticed.</span>
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 18px', lineHeight: 1.7, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          Based on your <strong style={{ color: TEXT }}>{selectedIndustries?.length > 0 ? selectedIndustries.slice(0, 2).join(' & ') : 'target fields'}</strong>
          {college ? <>, <strong style={{ color: TEXT }}>{college}</strong> background,</> : null}
          {' '}and goals, we've crafted a profile that attracts recruiters and alumni insiders.
        </p>
        {/* Immediate payoff summary — mirrors back their investment */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 14, padding: '14px 20px', maxWidth: 540, margin: '0 auto', textAlign: 'left' }}>
          <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>⚡ What changes right now</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Recruiters will stop scrolling — your headline is now keyword-optimized',
              `Alumni & parents in ${selectedIndustries?.length > 0 ? selectedIndustries[0] : 'your target spaces'} will see a compelling, credible story`,
              "You're positioned stronger than 95%+ of applicants before you send a single message",
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: GREEN, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#1E3A5F', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LinkedIn Profile Simulator ── */}
      <LinkedInProfileCard
        name={fullName}
        headline={selectedHeadline}
        college={college}
        expanded={aboutExpanded}
        onExpand={() => setAboutExpanded(true)}
        aboutFull={result.about_full}
        typingDone={typingDone}
        setTypingDone={setTypingDone}
        onPaywall={() => setShowPaywall(true)}
      />

      {/* ── Headline Switcher (outside the card) ── */}
      <div style={{ background: CARD, border: LI_BORDER, borderRadius: BORDER_R, padding: '20px 24px', marginBottom: 12 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Choose your headline track
        </p>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
          This becomes your #1 search result line — choose the one that fits your positioning.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(result.headlines || []).map((h, i) => {
            const whyLabels = [
              'Leads with your target role — optimized for recruiter keyword searches.',
              'Highlights your technical depth — great for specialist roles.',
              'Emphasizes impact and vision — stands out in alumni + hiring manager feeds.',
            ];
            return (
              <button
                key={i}
                onClick={() => { setActiveHeadline(i); }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%',
                  background: activeHeadline === i ? BLUE_LIGHT : BG,
                  border: `1.5px solid ${activeHeadline === i ? BLUE_BORDER : '#E2E8F0'}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${activeHeadline === i ? BLUE : '#CBD5E1'}`, background: activeHeadline === i ? BLUE : 'transparent', flexShrink: 0, marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                  {activeHeadline === i && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: activeHeadline === i ? TEXT : TEXT2, margin: 0, lineHeight: 1.55, fontWeight: activeHeadline === i ? 600 : 400 }}>{h}</p>
                  {activeHeadline === i && (
                    <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: '5px 0 0', lineHeight: 1.5, fontWeight: 500, fontStyle: 'italic' }}>
                      ✦ Why this works: {whyLabels[i] || 'Optimized for your target role and audience.'}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Keywords Card ── */}
      <div style={{ background: CARD, border: LI_BORDER, borderRadius: BORDER_R, padding: '20px 24px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 15 }}>🎯</span>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Top 10 LinkedIn ATS Keywords</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(result.keywords || []).map((kw, i) => (
            <span key={i} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8, padding: '6px 14px' }}>{kw}</span>
          ))}
        </div>
        <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8, padding: '12px 14px', marginTop: 14 }}>
          <p style={{ fontFamily: FONT, fontSize: 12, color: BLUE, margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
            💡 <strong>Agent Tip:</strong> Add these to your <strong>Skills section</strong> → you'll rank higher for the exact {seekingLabel} roles you told us you want.
          </p>
        </div>
      </div>

      {/* ── Emotional Payoff Box ── */}
      <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          ✦ What changes now
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Recruiters will actually stop scrolling on your profile',
            'Alumni & parents in your target spaces will see a clear, compelling story',
            "You're positioned as a stronger candidate than 95%+ of applicants",
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.55, fontWeight: 600 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Master CTA ── */}
      <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 20 }}>
        <button
          onClick={() => { setStep3Active(true); if (onNext) { onNext(); } else { setShowPaywall(true); } }}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 10px',
            fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff',
            background: `linear-gradient(to bottom, #10B981, #059669)`,
            border: 'none', borderRadius: 10, padding: '20px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
        >
          Next: Unlock My Inside Tracks →
        </button>
        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, fontWeight: 500, margin: '8px 0 0' }}>
          This opens your personalized alumni + parent network matches.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          ← Save &amp; Continue Later
        </button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div onClick={() => setShowPaywall(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: CARD, borderRadius: 16, padding: '40px 32px', maxWidth: 420, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', animation: 'fadUp 0.25s ease' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 18px' }}>💼</div>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your Full LinkedIn Kit</h2>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>Full bio, all 3 headlines, alumni DM, unlimited resume versions, and the full Agent.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => saveAndAuth('paid')} style={{ width: '100%', background: `linear-gradient(to bottom, ${GREEN}, #059669)`, border: 'none', borderRadius: 10, padding: '18px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>$4.99 / week</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#D1FAE5', margin: '2px 0 0' }}>Billed monthly at $19.96 · Cancel anytime</p>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff' }}>→</span>
              </button>
            </div>

            <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 20 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}