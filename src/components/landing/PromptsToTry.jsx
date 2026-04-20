import { useState } from 'react';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";

const PROMPTS = [
  {
    icon: '🔍',
    label: 'Alumni Search',
    prompt: 'Find alumni at [Target Company] who graduated from my school in the last 8 years and are open to coffee chats. Give me their LinkedIn + a personalized outreach message that sounds like me.',
    result: 'Gets you a warm contact + a ready-to-send message. Students are getting replies within 48h.',
    accentColor: '#a8ff3e',
    accentBg: 'rgba(168,255,62,0.07)',
    accentBorder: 'rgba(168,255,62,0.22)',
    preview: '✉️ "Hey Sarah — I\'m a UF finance junior, saw you\'re in IBD at Goldman..."',
  },
  {
    icon: '🎯',
    label: 'Interview Cheat Sheet',
    prompt: 'I have an interview with [Company Name] next week. Give me a cheat sheet on recent news, what the team has shipped, and 3 smart questions to ask the hiring manager.',
    result: 'Walk in knowing more than the interviewer expects. Literally changes how they see you.',
    accentColor: '#4f8cff',
    accentBg: 'rgba(79,140,255,0.07)',
    accentBorder: 'rgba(79,140,255,0.22)',
    preview: '📋 "Q3 earnings beat by 12%. Team shipped X feature. Ask about: roadmap, culture, first 90 days..."',
  },
  {
    icon: '💬',
    label: 'Follow-Up Writer',
    prompt: 'Write a follow-up message to the alumni who replied to my intro request. Make it natural, short, and suggest a 15-min call time that works for both of us.',
    result: 'Turns a "sure, let\'s chat" reply into an actual booked call. This is where most students drop the ball.',
    accentColor: '#fb923c',
    accentBg: 'rgba(251,146,60,0.07)',
    accentBorder: 'rgba(251,146,60,0.22)',
    preview: '💬 "Hey! So glad you replied — would 15 min this Thurs/Fri work? Happy to work around you..."',
  },
  {
    icon: '📄',
    label: 'Resume Rewrite',
    prompt: 'Analyze this job description and rewrite my resume bullet points to match exactly what they\'re looking for. [Paste job desc + your current bullets]',
    result: 'ATS-optimized in 30 seconds. Sounds like you wrote it for that role specifically — because it does.',
    accentColor: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.07)',
    accentBorder: 'rgba(167,139,250,0.22)',
    preview: '📄 "Led cross-functional initiative → Spearheaded 3-person cross-functional pilot that reduced..."',
  },
];

function PromptCard({ prompt, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: prompt.accentBg,
      border: `1px solid ${prompt.accentBorder}`,
      borderRadius: 20,
      padding: '22px 20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      flexShrink: 0,
      width: 290,
      scrollSnapAlign: 'start',
      position: 'relative',
      borderTop: `3px solid ${prompt.accentColor}`,
      boxShadow: `0 8px 32px ${prompt.accentColor}12, 0 0 0 1px rgba(255,255,255,0.03)`,
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{prompt.icon}</span>
        <span style={{
          fontSize: 10,
          fontWeight: 800,
          color: prompt.accentColor,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: dm,
        }}>{prompt.label}</span>
      </div>

      {/* Prompt text */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '13px 14px',
        position: 'relative',
      }}>
        <p style={{
          fontFamily: dm,
          fontSize: 12.5,
          color: 'rgba(255,255,255,0.82)',
          margin: 0,
          lineHeight: 1.65,
          letterSpacing: '-0.005em',
          paddingRight: 28,
        }}>
          {prompt.prompt}
        </p>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy prompt"
          style={{
            position: 'absolute',
            top: 9,
            right: 9,
            background: copied ? prompt.accentColor : 'rgba(255,255,255,0.08)',
            border: `1px solid ${copied ? prompt.accentColor : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 7,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 10,
            color: copied ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
            fontFamily: dm,
            fontWeight: 700,
            minHeight: 'auto',
            minWidth: 'auto',
            width: 'auto',
            transition: 'all 0.18s ease',
            letterSpacing: '0.03em',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Result */}
      <p style={{
        fontFamily: dm,
        fontSize: 12,
        color: 'rgba(255,255,255,0.42)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {prompt.result}
      </p>

      {/* Output preview teaser */}
      <div style={{
        background: 'rgba(0,0,0,0.28)',
        border: `1px solid ${prompt.accentBorder}`,
        borderRadius: 10,
        padding: '10px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blur overlay on bottom half */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'linear-gradient(to bottom, transparent, rgba(10,10,18,0.92))',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        <p style={{
          fontFamily: dm,
          fontSize: 11,
          color: prompt.accentColor,
          margin: 0,
          lineHeight: 1.6,
          fontStyle: 'italic',
          opacity: 0.8,
        }}>{prompt.preview}</p>
        <p style={{
          fontFamily: dm,
          fontSize: 10,
          color: 'rgba(255,255,255,0.18)',
          margin: '5px 0 0',
          position: 'relative',
          zIndex: 2,
        }}>↑ real FastIQ output preview</p>
      </div>
    </div>
  );
}

export default function PromptsToTry({ onStudentJoin }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '0 0 64px', maxWidth: 640, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(168,255,62,0.07)', border: '1px solid rgba(168,255,62,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 13 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#a8ff3e', letterSpacing: '0.05em', fontFamily: dm }}>⚡ FastIQ IN ACTION</span>
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.032em',
          lineHeight: 1.1,
          margin: '0 0 8px',
          fontFamily: dm,
        }}>
          Copy & paste these right now.
        </h2>
        <p style={{
          fontFamily: dm,
          fontSize: 14,
          color: 'rgba(255,255,255,0.38)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Real prompts students are using today to get replies, book calls, and walk into interviews prepared.
        </p>
      </div>

      {/* Horizontal scroll cards */}
      <div style={{
        display: 'flex',
        gap: 14,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 6,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        alignItems: 'stretch',
      }}>
        {PROMPTS.map((p, i) => (
          <PromptCard key={i} prompt={p} index={i} />
        ))}
        {/* Spacer for right padding on scroll */}
        <div style={{ width: 6, flexShrink: 0 }} />
      </div>

      {/* Bottom CTA line */}
      <div style={{ padding: '18px 20px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.28)', margin: '0 0 14px', lineHeight: 1.6 }}>
          These are real prompts students are using right now. Try them free for 7 days — no card needed.
        </p>
        <button
          onClick={onStudentJoin}
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#0a0a0a',
            background: 'linear-gradient(108deg, #a8ff3e, #78ff44)',
            border: 'none',
            borderRadius: 13,
            padding: '14px 30px',
            cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 4px 24px rgba(168,255,62,0.38)',
            fontFamily: dm,
          }}
        >
          Try FastIQ free — 7 days →
        </button>
      </div>
    </div>
  );
}