import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const BLUE = '#0077b5';
const GREEN = '#22c55e';

function TypewriterText({ text, delay = 30, onDone }) {
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

export default function LinkedInScreen({ resumeData, college, seeking, onNext, onBack, saveAndAuth }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const [activeHeadline, setActiveHeadline] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  const seekingLabel = seeking === 'internship' ? 'Remote Internship' : seeking === 'fulltime' ? 'Remote Full-Time Role' : 'Remote Opportunity';

  useEffect(() => {
    generateLinkedIn();
  }, []);

  const generateLinkedIn = async () => {
    setLoading(true);
    setError(null);
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
- Never use the word "Aspiring." Use active, confident titles.
- No corporate buzzwords like "passionate about synergy."
- Use "I" statements in the About section.
- Focus on results and outcomes, not tasks performed.
- For the DM template, use "University of Florida" or "Fellow Alum" — no mascot names.

Task 1 - Create 3 headline variations (max 220 chars each):
Format: [Target Role] | [Key Technical Skill] | [Unique Value] | [University] '26

Task 2 - Write a 3-paragraph About section:
Para 1 (Hook): The problem you solve and the industry you're entering.
Para 2 (Proof): A key project/internship from the resume with one specific metric.
Para 3 (CTA): Mention university, interest in remote work, invite recruiters/alumni to connect.
Keep it under 2000 characters total.

Task 3 - Top 10 LinkedIn keywords/skills for ATS optimization for this target role.

Task 4 - A 300-character alumni DM:
High-energy greeting + shared university connection + low-friction ask about company culture.

Return valid JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            headlines: { type: 'array', items: { type: 'string' } },
            about_preview: { type: 'string', description: 'First 150 characters of the about section' },
            about_full: { type: 'string', description: 'Complete 3-paragraph about section' },
            keywords: { type: 'array', items: { type: 'string' } },
            alumni_dm: { type: 'string' }
          }
        }
      });
      setResult(res);
    } catch (err) {
      // Fallback with placeholder data
      setResult({
        headlines: [
          `Remote Project Coordinator | Agile & Notion | Operations Enthusiast | ${college || 'University of Florida'} '26`,
          `Digital Marketing Strategist | SEO & Analytics | Content & Brand | ${college || 'University of Florida'} '26`,
          `Data Analyst | Python & SQL | Remote-First Operations | ${college || 'University of Florida'} '26`,
        ],
        about_preview: "I build systems that make teams faster and clients happier. As a ${college || 'UF'} senior entering the remote workforce...",
        about_full: `I build systems that make teams faster and clients happier. As a ${college || 'UF'} senior entering the remote workforce, I focus on turning ambiguous problems into structured, scalable solutions.\n\nDuring my internship at [Company], I redesigned our project tracking workflow, reducing missed deadlines by 30% and saving the team ~5 hours per week. I thrive at the intersection of strategy and execution.\n\nI'm actively targeting remote roles in project coordination and operations. If you're a recruiter or ${college || 'UF'} alum at a remote-first company, I'd love to connect and learn about your team's culture.`,
        keywords: ['Project Management', 'Remote Collaboration', 'Agile', 'Notion', 'Asana', 'Data Analysis', 'Cross-functional Teams', 'Process Improvement', 'Google Workspace', 'Communication'],
        alumni_dm: `Hi [Name] — I'm a fellow ${college || 'UF'} alum and noticed you're at [Company]. I'm targeting remote roles in [Field] and would love to hear one thing about the team culture there. Any chance you have 5 minutes?`
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 760, width: '100%', animation: 'fadeUp 0.35s ease', paddingTop: 100, minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 28px' }}>💼</div>
          <h2 style={{ fontFamily: sat, fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Building Your LinkedIn Identity...</h2>
          <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 40px' }}>The Agent is crafting your headlines, bio, and alumni outreach template.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
            {['Analyzing your experience & skills...', 'Writing recruiter-magnet headlines...', 'Crafting your story-driven bio...', 'Generating alumni DM template...'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 20, height: 20, border: `2px solid rgba(0,119,181,0.4)`, borderTop: `2px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const VISIBLE_ABOUT = result.about_preview || result.about_full?.slice(0, 150) || '';
  const BLURRED_ABOUT = result.about_full?.slice(150) || '';

  return (
    <div style={{ maxWidth: 860, width: '100%', animation: 'fadeUp 0.35s ease', paddingTop: 100, paddingBottom: 60, boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
          <span style={{ fontSize: 14 }}>💼</span>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Step 2 of 3 — LinkedIn Identity</span>
        </div>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          Your LinkedIn Profile,<br />Rebuilt for Recruiters
        </h1>
        <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          The Agent generated your high-authority headlines, a story-driven bio, and a ready-to-send alumni DM.
        </p>
      </div>

      {/* ── Section 1: Headlines ── */}
      <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: '28px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>✏️</span>
          <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>3 Recruiter-Magnet Headlines</h3>
          <span style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>Click to select</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(result.headlines || []).map((h, i) => (
            <button
              key={i}
              onClick={() => setActiveHeadline(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left', width: '100%',
                background: activeHeadline === i ? 'rgba(0,119,181,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeHeadline === i ? 'rgba(0,119,181,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, padding: '14px 18px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${activeHeadline === i ? BLUE : 'rgba(255,255,255,0.2)'}`, background: activeHeadline === i ? BLUE : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                {activeHeadline === i && '✓'}
              </div>
              <p style={{ fontFamily: dm, fontSize: 14, color: activeHeadline === i ? '#fff' : 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>{h}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 2: About Section with typewriter + blur ── */}
      <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: '28px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>📝</span>
          <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your Story-Driven About Section</h3>
          <span style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px' }}>AGENT WRITING...</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px' }}>
          {/* Typewriter visible portion */}
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 4px', lineHeight: 1.8 }}>
            <TypewriterText
              text={VISIBLE_ABOUT}
              delay={28}
              onDone={() => setTypingDone(true)}
            />
            {!typingDone && <span style={{ display: 'inline-block', width: 2, height: 16, background: '#60a5fa', marginLeft: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />}
          </p>

          {/* Blurred rest — paywall tease */}
          {typingDone && BLURRED_ABOUT && (
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.8, filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                {BLURRED_ABOUT}
              </p>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #1a1d24 60%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 }}>
                <button
                  onClick={() => setShowPaywall(true)}
                  style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#60a5fa', background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.4)', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', minHeight: 'auto' }}
                >
                  🔓 Unlock full bio →
                </button>
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>

      {/* ── Section 3: Keywords ── */}
      <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: '28px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Top 10 LinkedIn Keywords to Add</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(result.keywords || []).map((kw, i) => (
            <span key={i} style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#93c5fd', background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: 10, padding: '6px 14px' }}>{kw}</span>
          ))}
        </div>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '16px 0 0' }}>Add these to your LinkedIn Skills section to pass the recruiter algorithm for {seekingLabel} roles.</p>
      </div>

      {/* ── Section 4: Alumni DM ── */}
      <div style={{ background: '#1a1d24', border: '1px solid #374151', borderRadius: 24, padding: '28px 28px', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>📨</span>
          <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Ready-to-Send Alumni DM</h3>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.8 }}>
              {result.alumni_dm}
            </p>
          </div>
          {/* Blur overlay over bottom half */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to bottom, transparent, #1a1d24)', borderRadius: '0 0 14px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12 }}>
            <button
              onClick={() => setShowPaywall(true)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#60a5fa', background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.4)', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', minHeight: 'auto' }}
            >
              🔓 Copy full DM template →
            </button>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setShowPaywall(true)}
          style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto 16px', fontFamily: dm, fontSize: 18, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #0077b5, #005885)', border: 'none', borderRadius: 16, padding: '24px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 40px rgba(0,119,181,0.4)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,119,181,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,119,181,0.4)'; }}
        >
          Unlock Full Profile + Alumni DM Access →
        </button>
        <button onClick={saveAndAuth} style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div
          onClick={() => setShowPaywall(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#1f2937', borderRadius: 24, padding: 40, maxWidth: 440, width: '100%', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>💼</div>
            <h2 style={{ fontFamily: sat, fontSize: 24, fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Unlock Your Full LinkedIn Kit</h2>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#9ca3af', textAlign: 'center', margin: '0 0 32px', lineHeight: 1.6 }}>Get the full bio, all 3 headlines, the alumni DM, unlimited resume versions, and the full Agent.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: '#374151', border: '1px solid #4b5563', borderRadius: 16, padding: '24px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={e => e.currentTarget.style.background = '#374151'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>$9.99 / week</p>
                  <p style={{ fontFamily: dm, fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>Cancel anytime</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#34d399', background: 'rgba(34,197,94,0.15)', borderRadius: 100, padding: '4px 10px' }}>Most flexible</span>
              </button>

              <button
                onClick={saveAndAuth}
                style={{ width: '100%', background: '#059669', border: '2px solid #34d399', borderRadius: 16, padding: '24px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.background = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.background = '#059669'}
              >
                <div>
                  <p style={{ fontFamily: sat, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
                  <p style={{ fontFamily: dm, fontSize: 13, color: '#d1fae5', margin: '4px 0 0' }}>Best value • Most students choose this</p>
                </div>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#000', background: '#fff', borderRadius: 100, padding: '4px 12px', position: 'absolute', top: -8, right: -8 }}>POPULAR</span>
              </button>
            </div>

            <button onClick={() => setShowPaywall(false)} style={{ width: '100%', fontFamily: dm, fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center', marginTop: 32 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}