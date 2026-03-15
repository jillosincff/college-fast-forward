import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const TYPING_SPEED = 40;
const LINE_DELAY = 800;

export default function FastIQActivation({ user, mode, companies, interest, onFinish }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [charIdx, setCharIdx] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  const firstName = (user?.full_name || 'Student').split(/[\s,]+/)[0];
  const major = user?.major || 'your field';

  const lines = mode === 'focused'
    ? [
        `Scanning UF alumni at ${companies?.[0] || 'your targets'}...`,
        companies?.[0] ? `Found ${Math.floor(Math.random() * 5) + 2} alumni at ${companies[0]}` : 'Identifying alumni network...',
        `Checking hiring signals at ${companies?.[0] || 'target companies'}...`,
        `Analyzing careers pages...`,
        `Building your outreach strategy...`,
        `FASTIQ is ready.`,
      ]
    : [
        `Analyzing your profile...`,
        `Finding UF alumni in ${interest?.split('—')[0]?.trim() || major}...`,
        `Mapping career paths from UF ${major}...`,
        `Identifying people for you to talk to...`,
        `Building your exploration roadmap...`,
        `FASTIQ is ready.`,
      ];

  useEffect(() => {
    if (visibleLines >= lines.length) { setAnimDone(true); return; }
    const currentLine = lines[visibleLines];
    if (charIdx < currentLine.length) {
      const t = setTimeout(() => { setTypingText(currentLine.substring(0, charIdx + 1)); setCharIdx(charIdx + 1); }, TYPING_SPEED);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setVisibleLines(v => v + 1); setCharIdx(0); setTypingText(''); }, LINE_DELAY);
    return () => clearTimeout(t);
  }, [visibleLines, charIdx]);

  const stats = mode === 'focused'
    ? [{ value: `${(companies?.length || 0) * 100}+`, label: 'Alumni being searched' }, { value: String(companies?.length || 0), label: 'Companies targeted' }, { value: '74%', label: 'Avg response rate' }]
    : [{ value: '6+', label: 'Alumni in your field' }, { value: '12', label: 'Career paths mapped' }, { value: 'Today', label: 'Conversations possible' }];

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <style>{`@keyframes fiqPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}} @keyframes fiqFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {/* Pulsing icon */}
        <div style={{ margin: '0 auto 24px', width: 48, height: 48 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'fiqPulse 2s ease infinite' }}>
            <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke={orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px,5vw,32px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8, animation: 'fiqFade 0.5s ease both' }}>
          FASTIQ is <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>activated.</em>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.7, marginBottom: 28, animation: 'fiqFade 0.5s 0.1s ease both' }}>
          Your personal career agent is now working for you — 24 hours a day, 7 days a week.
        </p>

        {/* Terminal log */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 24, minHeight: 140, animation: 'fiqFade 0.5s 0.2s ease both' }}>
          {lines.slice(0, visibleLines).map((line, i) => (
            <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: i === lines.length - 1 && visibleLines >= lines.length ? 500 : 300, color: i === lines.length - 1 && visibleLines >= lines.length ? orange : 'rgba(244,240,232,0.5)', margin: '0 0 6px', lineHeight: 1.8 }}>{line}</p>
          ))}
          {visibleLines < lines.length && (
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.6)', margin: 0, lineHeight: 1.8 }}>
              {typingText}<span style={{ opacity: 0.5, animation: 'fiqPulse 1s ease-in-out infinite' }}>|</span>
            </p>
          )}
        </div>

        {/* Stats */}
        {animDone && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32, animation: 'fiqFade 0.4s ease both' }}>
            {stats.map((st, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: orange, margin: '0 0 4px' }}>{st.value}</p>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {animDone && (
          <div style={{ animation: 'fiqFade 0.4s 0.1s ease both' }}>
            <button onClick={onFinish}
              style={{ width: '100%', padding: '14px 0', borderRadius: 100, border: 'none', background: orange, color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500, cursor: 'pointer', minHeight: 48, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
              onMouseLeave={e => e.currentTarget.style.background = orange}>
              Open FASTIQ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}