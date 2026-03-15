import React from 'react';

const dmSans = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

/* ── SVG Icons ── */
const svgIcons = {
  crosshair: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/></svg>,
  building: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="2" width="10" height="12" rx="1"/><path d="M6 5h1M9 5h1M6 8h1M9 8h1M6 11h4"/></svg>,
  people: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.5 2.2-4 5-4s5 1.5 5 4"/><circle cx="11" cy="5" r="2"/><path d="M12 10c1.7.3 3 1.5 3 3"/></svg>,
  plane: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L7 9M14 2l-4 12-3-5-5-3z"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>,
  chat: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h12v8H6l-3 3v-3H2z" rx="1.5"/></svg>,
  document: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>,
  scissors: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 3l4 10M10 3L6 13"/><circle cx="4" cy="13" r="2" fill="none"/><circle cx="12" cy="13" r="2" fill="none"/></svg>,
  mic: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="1" width="6" height="9" rx="3"/><path d="M3 7c0 3 2 5 5 5s5-2 5-5M8 12v3"/></svg>,
  linkedin: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="14" height="14" rx="2"/><path d="M5 7v4M5 5.5v.01M8 11V9c0-1 .5-2 2-2s2 1 2 2v2"/></svg>,
  checklist: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 4l2 2 3-3M5 10l2 2 3-3"/><rect x="1" y="1" width="14" height="14" rx="2"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 14V8l4-3 4 5 4-8"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14s-6-4-6-8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 4-6 8-6 8z"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>,
  peopleSm: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>,
  thankNote: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12v8H2z"/><path d="M2 4l6 5 6-5"/></svg>,
  offerStar: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1l1.8 4H14l-3.5 2.8 1.3 4.2L8 9.5l-3.8 2.5 1.3-4.2L2 5h4.2z"/></svg>,
  thankHelpers: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.5 2.2-4 5-4s5 1.5 5 4"/><circle cx="11" cy="5" r="2"/><path d="M12 10c1.7.3 3 1.5 3 3"/></svg>,
};

const findPromptIcons = [
  svgIcons.crosshair, svgIcons.building, svgIcons.people,
  svgIcons.plane, svgIcons.clock, svgIcons.chat,
];

const toolCards = [
  { icon: svgIcons.document, name: 'Review my resume', bg: 'rgba(139,92,246,0.15)', color: '#A78BFA', prompt: 'Review my resume' },
  { icon: svgIcons.scissors, name: 'Tailor my resume', bg: 'rgba(232,93,32,0.15)', color: orange, prompt: 'Tailor my resume for a job' },
  { icon: svgIcons.mic, name: 'Mock interview', bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', prompt: 'Prep me for an interview' },
  { icon: svgIcons.linkedin, name: 'LinkedIn review', bg: 'rgba(34,211,238,0.15)', color: '#22D3EE', prompt: 'Review my LinkedIn profile' },
  { icon: svgIcons.checklist, name: 'Action plan', bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', prompt: 'Build my career action plan' },
  { icon: svgIcons.chart, name: 'Salary intel', bg: 'rgba(232,93,32,0.15)', color: orange, prompt: 'What should I negotiate for salary?' },
  { icon: svgIcons.thankNote, name: 'Thank-you note', bg: 'rgba(236,64,122,0.1)', color: '#ec407a', prompt: 'Draft a thank-you note after my interview' },
  { icon: svgIcons.offerStar, name: 'Got an offer!', bg: 'rgba(255,193,7,0.1)', color: '#FFC107', prompt: 'I got a job offer!' },
  { icon: svgIcons.thankHelpers, name: 'Thank my helpers', bg: 'rgba(156,39,176,0.1)', color: '#9c27b0', prompt: 'Thank everyone who helped me in my job search' },
];

export default function ChatWelcome({ profile, onSend }) {
  const hasTargets = (profile?.target_companies || []).length > 0;

  const findPrompts = hasTargets
    ? [
        "Research my #1 target company — are they hiring?",
        "Find UF alumni at my dream companies",
        "Find alumni who are product managers",
        "Draft a warm intro message",
        "Draft follow-up messages for stale outreach",
        "I got a reply from a contact — help me respond",
      ]
    : [
        "Help me find companies to target",
        "What mid-size companies should I look at?",
        "Find alumni who are product managers",
        "Draft a warm intro message",
        "Draft follow-up messages for stale outreach",
        "I got a reply from a contact — help me respond",
      ];

  const explorePrompts = [
    { icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M2 6h12M6 2v12M10 2v12"/></svg>, text: "What UF career events are coming up?" },
    { icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a10 10 0 010 12M2 8h12"/><path d="M4 5a10 10 0 008 0M4 11a10 10 0 008 0"/></svg>, text: "Explore career paths for my major" },
  ];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 32px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="fastiq-welcome-icon" style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(232,93,32,0.15)', border: '0.5px solid rgba(232,93,32,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', animation: 'fastiqPulse 2s ease infinite',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M12 2L4 13h8l-2 7 10-12h-8l2-6z" stroke={orange} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="fastiq-welcome-headline" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#f4f0e8', margin: '0 0 8px' }}>
          Your career center is ready.
        </h2>
        <p className="fastiq-welcome-subhead" style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 18, color: orange, margin: 0 }}>
          What should we tackle first?
        </p>
      </div>

      {/* FIND OPPORTUNITIES */}
      <p className="fastiq-section-label" style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'rgba(244,240,232,0.25)', marginBottom: 10,
      }}>FIND OPPORTUNITIES</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {findPrompts.map((text, i) => (
          <button key={i} onClick={() => onSend(text)} className="fastiq-prompt-card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
            transition: 'all 0.2s', textAlign: 'left', width: '100%',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <span style={{ flexShrink: 0 }}>{findPromptIcons[i] || findPromptIcons[0]}</span>
            <span className="fastiq-prompt-text" style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.7)', flex: 1 }}>{text}</span>
            <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.2)' }}>→</span>
          </button>
        ))}
      </div>

      {/* CAREER TOOLS */}
      <p className="fastiq-section-label" style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'rgba(244,240,232,0.25)', marginBottom: 10,
      }}>CAREER TOOLS</p>
      <div className="fastiq-tools-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
        {toolCards.map((t, i) => (
          <button key={i} onClick={() => onSend(t.prompt)} className="fastiq-tool-card" style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
            transition: 'all 0.25s', textAlign: 'left',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.color,
            }}>
              {t.icon}
            </div>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8' }}>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Explore prompts — consistent style */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {explorePrompts.map((p, i) => (
          <button key={i} onClick={() => onSend(p.text)} className="fastiq-prompt-card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
            transition: 'all 0.2s', textAlign: 'left', width: '100%',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <span style={{ flexShrink: 0 }}>{p.icon}</span>
            <span className="fastiq-prompt-text" style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.7)', flex: 1 }}>{p.text}</span>
            <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.2)' }}>→</span>
          </button>
        ))}
      </div>

      {/* Bottom callout */}
      <div style={{
        background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.2)',
        borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M12 2L4 13h8l-2 7 10-12h-8l2-6z"/>
        </svg>
        <p className="fastiq-callout-text" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.6, margin: 0 }}>
          CFF connects you with parents and alumni who've signed up. <span style={{ fontWeight: 500, color: '#f4f0e8' }}>FASTIQ goes further — searching the entire web to find UF alumni at any company.</span> That's your unfair advantage.
        </p>
      </div>
    </div>
  );
}