import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const BLUE = '#0077b5';

function TypewriterText({ text, delay = 28, onDone }) {
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

function SectionCard({ children, style = {} }) {
  return (
    <div style={{
      background: '#1a1d24',
      border: '1px solid #2d3748',
      borderRadius: 20,
      padding: '24px 24px',
      marginBottom: 20,
      ...style
    }}>
      {children}
    </div>
  );
}

function CardLabel({ icon, label, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
      {badge && (
        <span style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px', letterSpacing: '0.05em' }}>{badge}</span>
      )}
    </div>
  );
}

export default function LinkedInScreen({ resumeData, college, seeking, targetRole, onBack, saveAndAuth }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const [activeHeadline, setActiveHeadline] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [step3Active, setStep3Active] = useState(false);

  const seekingLabel = targetRole || (seeking === 'internship' ? 'Remote Internship' : seeking === 'fulltime' ? 'Remote Full-Time Role' : 'Remote Opportunity');

  useEffect(() => { generateLinkedIn(); }, []);

  const generateLinkedIn = async () => {
    setLoading(true);
    setTypingDone(false);
    try {
      const resumeSummary = resumeData?.original
        ? `Name: ${resumeData.original.name || 'Student'}
Skills: ${(resumeData.original.skills || []).slice(0, 8).join(', ')}
Education: ${(resumeData.original.education || []).map(e => `${e.school} - ${e.degree}`).join('; ')}
Experience: ${(resumeData.original.experience || []).map(e => `${e.title} at ${e.company}`).join('; ')}`
        : `University: ${college || 'top university'}, Seeking: ${seekingLabel}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an elite Tech Career Coach and LinkedIn Branding Expert. Transform this student's resume data into a high-authority LinkedIn profile optimized for remote job searchability and recruiter appeal.

Resume Data:
${resumeSummary}
University: ${college || 'University of Florida'}
Target Role: ${seekingLabel}

RULES:
- Never use "Aspiring." Use active, confident titles.
- No corporate buzzwords.
- Use "I" statements in the About section.
- Focus on results and outcomes.
- For the DM template, use "University of Florida" or "Fellow Alum" — no mascot names.

Task 1 - Create 3 headline variations (max 220 chars each):
Format: [Target Role] | [Key Technical Skill] | [Unique Value] | [University] '26

Task 2 - Write a 3-paragraph About section (under 2000 chars total):
Para 1 (Hook): The problem you solve.
Para 2 (Proof): A key project/internship with one specific metric.
Para 3 (CTA): University, remote interest, invite to connect.

Task 3 - Top 10 LinkedIn keywords for ATS optimization.

Task 4 - A 300-character alumni DM with a high-energy greeting + shared connection + low-friction ask.

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
        about_full: `I build systems that make teams faster and clients happier. As a ${college || 'UF'} senior entering the remote workforce, I focus on turning ambiguous problems into structured, scalable solutions.\n\nDuring my internship at [Company], I redesigned our project tracking workflow, reducing missed deadlines by 30% and saving the team ~5 hours per week. I thrive at the intersection of strategy and execution.\n\nI'm actively targeting remote roles in project coordination and operations. If you're a recruiter or ${college || 'UF'} alum at a remote-first company, I'd love to connect and learn about your team's culture.`,
        keywords: ['Project Management', 'Remote Collaboration', 'Agile', 'Notion', 'Asana', 'Data Analysis', 'Cross-functional Teams', 'Process Improvement', 'Google Workspace', 'Communication'],
        alumni_dm: `Hi [Name] — fellow ${college || 'UF'} alum here! I noticed you're at [Company] and would love to hear one thing about the team culture there. I'm targeting remote roles in [Field] — any chance you have 5 minutes?`
      });
    }
    setLoading(false);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div style={{ maxWidth: 680, width: '100%', paddingTop: 120, paddingBottom: 80, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 28px' }}>💼</div>
          <h2 style={{ fontFamily: sat, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Building Your LinkedIn Identity...</h2>
          <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: '0 0 40px' }}>Crafting your headlines, bio, and alumni outreach template.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto' }}>
            {['Analyzing your experience & skills...', 'Writing recruiter-magnet headlines...', 'Crafting your story-driven bio...', 'Generating alumni DM template...'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 18, height: 18, border: `2px solid rgba(0,119,181,0.3)`, borderTop: `2px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!result) return null;

  const ABOUT_PREVIEW = result.about_full?.slice(0, 200) || '';
  const ABOUT_REST = result.about_full?.slice(200) || '';
  const selectedHeadline = (result.headlines || [])[activeHeadline] || '';

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 120, paddingBottom: 80, boxSizing: 'border-box' }}>

      {/* ── Progress Header ── */}
      <div style={{ marginBottom: 44 }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {['Resume Wow', 'LinkedIn Identity', 'Your Plan'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 1 ? BLUE : i < 1 ? '#22c55e' : (i === 2 && step3Active) ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${i === 1 ? BLUE : i < 1 ? '#22c55e' : (i === 2 && step3Active) ? '#60a5fa' : 'rgba(255,255,255,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: dm,
                  boxShadow: (i === 2 && step3Active) ? '0 0 0 4px rgba(59,130,246,0.3), 0 0 16px rgba(59,130,246,0.5)' : 'none',
                  animation: (i === 2 && step3Active) ? 'step3pulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, color: i === 1 ? '#93c5fd' : i < 1 ? '#86efac' : (i === 2 && step3Active) ? '#93c5fd' : 'rgba(255,255,255,0.25)', fontWeight: (i === 1 || (i === 2 && step3Active)) ? 700 : 400, whiteSpace: 'nowrap', transition: 'color 0.4s' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: i < 1 ? '#22c55e' : 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: 100, padding: '5px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: 13 }}>💼</span>
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Step 2 — LinkedIn Identity Architect</span>
          </div>
          <h1 style={{ fontFamily: sat, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Your LinkedIn Profile,<br />Rebuilt for Recruiters
          </h1>
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Headlines, a story-driven bio, 10 ATS keywords, and a ready-to-send alumni DM — all written for you.
          </p>
        </div>
      </div>

      {/* ── CARD 1: Headline Hero ── */}
      <SectionCard style={{ border: '1.5px solid rgba(0,119,181,0.4)', background: 'linear-gradient(135deg, rgba(0,119,181,0.08) 0%, #1a1d24 60%)' }}>
        <CardLabel icon="🏷️" label="Your New High-Authority Headline" />

        {/* Selected headline — large display */}
        <div style={{ background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.6, letterSpacing: '-0.01em' }}>
            {selectedHeadline}
          </p>
        </div>

        {/* 3 selectable options */}
        <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Choose your version:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(result.headlines || []).map((h, i) => (
            <button
              key={i}
              onClick={() => setActiveHeadline(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%',
                background: activeHeadline === i ? 'rgba(0,119,181,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeHeadline === i ? 'rgba(0,119,181,0.5)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${activeHeadline === i ? BLUE : 'rgba(255,255,255,0.2)'}`, background: activeHeadline === i ? BLUE : 'transparent', flexShrink: 0, marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                {activeHeadline === i && '✓'}
              </div>
              <p style={{ fontFamily: dm, fontSize: 13, color: activeHeadline === i ? '#e2e8f0' : 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>{h}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── CARD 2: About Section ── */}
      <SectionCard>
        <CardLabel icon="📝" label="Your Story-Driven About Section" badge="AGENT WRITING..." />

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', overflow: 'hidden' }}>
          {/* Visible typewriter text */}
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.8 }}>
            <TypewriterText text={ABOUT_PREVIEW} delay={22} onDone={() => setTypingDone(true)} />
            {!typingDone && (
              <span style={{ display: 'inline-block', width: 2, height: 15, background: '#60a5fa', marginLeft: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
            )}
          </p>

          {/* Blurred continuation */}
          {typingDone && ABOUT_REST && (
            <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0', lineHeight: 1.8, filter: 'blur(4.5px)', userSelect: 'none', pointerEvents: 'none' }}>
              {ABOUT_REST}
            </p>
          )}
        </div>

        {/* Gradient fade + unlock button BELOW the card */}
        {typingDone && ABOUT_REST && (
          <div style={{ marginTop: -28, paddingTop: 28, background: 'linear-gradient(to bottom, transparent 0%, #1a1d24 55%)', textAlign: 'center', paddingBottom: 4, position: 'relative', zIndex: 2 }}>
            <button
              onClick={() => setShowPaywall(true)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#93c5fd', background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.35)', borderRadius: 100, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto', marginTop: 8 }}
            >
              🔓 Unlock full bio →
            </button>
          </div>
        )}
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} } @keyframes step3pulse { 0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 0 16px rgba(59,130,246,0.5)} 50%{box-shadow:0 0 0 8px rgba(59,130,246,0.15),0 0 28px rgba(59,130,246,0.7)} }`}</style>
      </SectionCard>

      {/* ── CARD 3: Keywords ── */}
      <SectionCard>
        <CardLabel icon="🎯" label="Top 10 LinkedIn Keywords to Add" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(result.keywords || []).map((kw, i) => (
            <span key={i} style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#93c5fd', background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.28)', borderRadius: 10, padding: '6px 14px', lineHeight: 1 }}>{kw}</span>
          ))}
        </div>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: '14px 0 0', lineHeight: 1.5 }}>
          Add these to your LinkedIn Skills section to pass the recruiter algorithm for {seekingLabel} roles.
        </p>
      </SectionCard>

      {/* ── CARD 4: Alumni DM ── */}
      <SectionCard>
        <CardLabel icon="📨" label="Ready-to-Send Alumni DM" />
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.8 }}>
            {result.alumni_dm}
          </p>
          {/* Gradient fade over bottom portion */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, transparent, #1a1d24)', pointerEvents: 'none', borderRadius: '0 0 14px 14px' }} />
        </div>
        {/* Button cleanly below the fade */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={() => setShowPaywall(true)}
            style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#93c5fd', background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.35)', borderRadius: 100, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto' }}
          >
            🔓 Copy full DM template →
          </button>
        </div>
      </SectionCard>

      {/* ── Master CTA ── */}
      <div style={{ textAlign: 'center', marginTop: 36, marginBottom: 20 }}>
        <button
          onClick={() => { setStep3Active(true); setShowPaywall(true); }}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 14px',
            fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0077b5 50%, #005c8e 100%)',
            border: 'none', borderRadius: 18, padding: '22px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(14,165,233,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(14,165,233,0.65), 0 2px 8px rgba(0,0,0,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.5), 0 2px 8px rgba(0,0,0,0.3)'; }}
        >
          Unlock My 14-Day Action Plan & Start Applying →
        </button>
        <button
          onClick={saveAndAuth}
          style={{ fontFamily: dm, fontSize: 13, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
        >
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div
          onClick={() => setShowPaywall(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>💼</div>
            <h2 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your Full LinkedIn Kit</h2>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#9ca3af', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>Full bio, all 3 headlines, alumni DM, unlimited resume versions, and the full Agent.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: '#374151', border: '1px solid #4b5563', borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={e => e.currentTarget.style.background = '#374151'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>$9.99 / week</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>Cancel anytime</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: '#34d399', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '3px 10px' }}>Most flexible</span>
              </button>

              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: 'linear-gradient(135deg, #059669, #047857)', border: '2px solid #34d399', borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#d1fae5', margin: '3px 0 0' }}>Best value · Most students choose this</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#000', background: '#fff', borderRadius: 100, padding: '4px 10px', position: 'absolute', top: -10, right: 12 }}>POPULAR</span>
              </button>
            </div>

            <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 28 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}