import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// ── Design Tokens ──────────────────────────────────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const BORDER_R = 12;

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

function Card({ children, style = {}, accent }) {
  return (
    <div style={{
      background: CARD,
      borderRadius: BORDER_R,
      boxShadow: SHADOW,
      padding: '24px',
      marginBottom: 16,
      border: accent ? `1.5px solid ${BLUE_BORDER}` : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, label, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      {badge && (
        <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT2, marginLeft: 'auto', background: '#F1F5F9', borderRadius: 6, padding: '2px 8px' }}>{badge}</span>
      )}
    </div>
  );
}

export default function LinkedInScreen({ resumeData, college, seeking, targetRole, onBack, saveAndAuth, onNext }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const [activeHeadline, setActiveHeadline] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [step3Active, setStep3Active] = useState(false);

  const firstName = resumeData?.original?.name?.split(' ')[0] || null;
  const seekingLabel = targetRole || (seeking === 'internship' ? 'Internship' : seeking === 'fulltime' ? 'Full-Time Role' : 'Opportunity');

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
    return (
      <div style={{ maxWidth: 640, width: '100%', paddingTop: 120, paddingBottom: 80, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px', boxShadow: SHADOW_MD }}>💼</div>
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {firstName ? `Building ${firstName}'s LinkedIn Identity...` : 'Building Your LinkedIn Identity...'}
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 36px', lineHeight: 1.6 }}>Crafting headlines, bio, and alumni outreach template.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto' }}>
            {['Analyzing your experience & skills...', 'Writing recruiter-magnet headlines...', 'Crafting your story-driven bio...', 'Generating alumni DM template...'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: CARD, borderRadius: BORDER_R, padding: '12px 16px', boxShadow: SHADOW }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${BLUE_BORDER}`, borderTop: `2px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT2 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const ABOUT_PREVIEW = result.about_full?.slice(0, 220) || '';
  const ABOUT_REST = result.about_full?.slice(220) || '';
  const selectedHeadline = (result.headlines || [])[activeHeadline] || '';

  return (
    <div style={{ maxWidth: 720, width: '100%', paddingTop: 100, paddingBottom: 80, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes step3pulse { 0%,100%{box-shadow:0 0 0 3px rgba(0,102,255,0.2)} 50%{box-shadow:0 0 0 6px rgba(0,102,255,0.08)} }
        @keyframes fadUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {['Resume Wow', 'LinkedIn Identity', 'Your Plan'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i < 1 ? GREEN : i === 1 ? BLUE : (step3Active ? BLUE : '#E2E8F0'),
                  border: `2px solid ${i < 1 ? GREEN : i === 1 ? BLUE : (step3Active ? BLUE : '#CBD5E1')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: i > 1 && !step3Active ? '#94A3B8' : '#fff', fontFamily: FONT,
                  boxShadow: i === 1 ? `0 0 0 4px rgba(0,102,255,0.15)` : (i === 2 && step3Active) ? `0 0 0 4px rgba(0,102,255,0.2)` : 'none',
                  animation: (i === 2 && step3Active) ? 'step3pulse 1.4s ease-in-out infinite' : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: i < 1 ? GREEN : i === 1 ? BLUE : (step3Active ? BLUE : '#94A3B8'), whiteSpace: 'nowrap', transition: 'color 0.4s' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: i < 1 ? GREEN_BORDER : '#E2E8F0', borderRadius: 2, marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 13 }}>💼</span>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 2 — LinkedIn Identity Architect</span>
        </div>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {firstName ? `${firstName}'s LinkedIn Profile,` : 'Your LinkedIn Profile,'}<br />
          <span style={{ color: BLUE }}>Rebuilt for Recruiters</span>
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
          Headlines, a story-driven bio, 10 ATS keywords, and a ready-to-send alumni DM — all written by the Agent.
        </p>
      </div>

      {/* ── CARD 1: Headline Selector ── */}
      <Card accent>
        <CardHeader icon="🏷️" label="Your New High-Authority Headline" />

        <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: BORDER_R, padding: '16px 18px', marginBottom: 14 }}>
          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.6, letterSpacing: '-0.01em' }}>
            {selectedHeadline}
          </p>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, margin: '0 0 10px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Choose your version:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(result.headlines || []).map((h, i) => (
            <button
              key={i}
              onClick={() => setActiveHeadline(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%',
                background: activeHeadline === i ? BLUE_LIGHT : '#F8FAFC',
                border: `1.5px solid ${activeHeadline === i ? BLUE_BORDER : '#E2E8F0'}`,
                borderRadius: BORDER_R, padding: '12px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${activeHeadline === i ? BLUE : '#CBD5E1'}`, background: activeHeadline === i ? BLUE : 'transparent', flexShrink: 0, marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                {activeHeadline === i && '✓'}
              </div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: activeHeadline === i ? TEXT : TEXT2, margin: 0, lineHeight: 1.55 }}>{h}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── CARD 2: About Section ── */}
      <Card>
        <CardHeader icon="📝" label="Your Story-Driven About Section" badge="Agent Writing" />

        <div style={{ background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: BORDER_R, padding: '16px 18px', overflow: 'hidden', position: 'relative' }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.75 }}>
            <TypewriterText text={ABOUT_PREVIEW} delay={22} onDone={() => setTypingDone(true)} />
            {!typingDone && (
              <span style={{ display: 'inline-block', width: 2, height: 14, background: BLUE, marginLeft: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
            )}
          </p>
          {typingDone && ABOUT_REST && (
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.75, filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
              {ABOUT_REST}
            </p>
          )}
          {typingDone && ABOUT_REST && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, rgba(248,250,252,0), rgba(248,250,252,1))', pointerEvents: 'none' }} />
          )}
        </div>

        {typingDone && ABOUT_REST && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={() => setShowPaywall(true)} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto' }}>
              🔓 Unlock full bio →
            </button>
          </div>
        )}
      </Card>

      {/* ── CARD 3: Keywords ── */}
      <Card>
        <CardHeader icon="🎯" label="Top 10 LinkedIn ATS Keywords" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(result.keywords || []).map((kw, i) => (
            <span key={i} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8, padding: '6px 14px' }}>{kw}</span>
          ))}
        </div>
        <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: BORDER_R, padding: '12px 14px', marginTop: 14 }}>
          <p style={{ fontFamily: FONT, fontSize: 12, color: BLUE, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            💡 Agent Tip: Add these to your LinkedIn Skills section to pass the recruiter algorithm for {seekingLabel} roles.
          </p>
        </div>
      </Card>

      {/* ── CARD 4: Alumni DM ── */}
      <Card>
        <CardHeader icon="📨" label="Ready-to-Send Alumni DM" />
        <div style={{ background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: BORDER_R, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.8 }}>
            {result.alumni_dm}
          </p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to bottom, rgba(248,250,252,0), rgba(248,250,252,1))', pointerEvents: 'none' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setShowPaywall(true)} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8, padding: '9px 22px', cursor: 'pointer', minHeight: 'auto' }}>
            🔓 Copy full DM template →
          </button>
        </div>
      </Card>

      {/* ── Master CTA ── */}
      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 20 }}>
        <button
          onClick={() => { setStep3Active(true); if (onNext) { onNext(); } else { setShowPaywall(true); } }}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 14px',
            fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff',
            background: `linear-gradient(to bottom, #10B981, #059669)`,
            border: 'none', borderRadius: 8, padding: '20px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
        >
          Unlock My 14-Day Action Plan & Start Applying →
        </button>
        <button onClick={saveAndAuth} style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div onClick={() => setShowPaywall(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: CARD, borderRadius: 16, padding: '40px 32px', maxWidth: 420, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', animation: 'fadUp 0.25s ease' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 18px' }}>💼</div>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your Full LinkedIn Kit</h2>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>Full bio, all 3 headlines, alumni DM, unlimited resume versions, and the full Agent.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={saveAndAuth} style={{ width: '100%', background: '#F8FAFC', border: `1px solid #E2E8F0`, borderRadius: BORDER_R, padding: '18px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>$4.99 / week</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>Cancel anytime</p>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '3px 10px' }}>Flexible</span>
              </button>

              <button onClick={saveAndAuth} style={{ width: '100%', background: `linear-gradient(to bottom, ${GREEN}, #059669)`, border: 'none', borderRadius: BORDER_R, padding: '18px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#D1FAE5', margin: '2px 0 0' }}>Best value · Most students choose this</p>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: GREEN, background: '#fff', borderRadius: 6, padding: '4px 10px', position: 'absolute', top: -10, right: 12 }}>POPULAR</span>
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