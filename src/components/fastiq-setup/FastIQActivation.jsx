import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const TYPING_SPEED = 40;
const LINE_DELAY = 1200;

export default function FastIQActivation({ user, companies, industries }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  const firstName = (user?.full_name || 'Student').split(/[\s,]+/)[0];
  const companyNames = (companies || []).slice(0, 3);
  const industryNames = (industries || []).slice(0, 2);

  const lines = [
    `⚡ Scanning UF alumni network...`,
    companyNames.length > 0 ? `⚡ Found alumni at ${companyNames[0]}` : `⚡ Searching alumni in ${industryNames[0] || 'your industries'}...`,
    companyNames.length > 1 ? `⚡ Analyzing connections at ${companyNames[1]}` : '⚡ Building your outreach strategy...',
    `⚡ Drafting personalized outreach for ${firstName}...`,
  ];

  useEffect(() => {
    if (visibleLines >= lines.length) return;
    const currentLine = lines[visibleLines];

    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setTypingText(currentLine.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisibleLines(visibleLines + 1);
        setCurrentCharIndex(0);
        setTypingText('');
      }, LINE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, currentCharIndex]);

  const completedLines = lines.slice(0, visibleLines);

  return (
    <div style={{
      minHeight: '100vh', minHeight: '100dvh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', boxSizing: 'border-box', overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes fiqPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes fiqFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Pulsing logo */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', margin: '0 auto 28px',
          background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fiqPulse 2.5s ease-in-out infinite',
        }}>
          <Zap className="w-6 h-6" style={{ color: orange }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 5vw, 34px)',
          color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 10,
          animation: 'fiqFadeUp 0.5s ease both',
        }}>
          FASTIQ is now working for you.
        </h1>
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300,
          color: 'rgba(244,240,232,0.5)', lineHeight: 1.6, marginBottom: 36,
          animation: 'fiqFadeUp 0.5s 0.1s ease both',
        }}>
          24 hours a day. 7 days a week. We'll notify you the moment we find something worth your attention.
        </p>

        {/* Activity preview */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 20px', textAlign: 'left', marginBottom: 32,
          minHeight: 120,
          animation: 'fiqFadeUp 0.5s 0.2s ease both',
        }}>
          {completedLines.map((line, i) => (
            <p key={i} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 300,
              color: 'rgba(244,240,232,0.5)', margin: '0 0 8px', lineHeight: 1.5,
            }}>
              {line}
            </p>
          ))}
          {visibleLines < lines.length && (
            <p style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 300,
              color: 'rgba(244,240,232,0.6)', margin: 0, lineHeight: 1.5,
            }}>
              {typingText}<span style={{ opacity: 0.5, animation: 'fiqPulse 1s ease-in-out infinite' }}>|</span>
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 36,
          animation: 'fiqFadeUp 0.5s 0.3s ease both',
        }}>
          {[
            { value: '500+', label: 'Alumni being searched' },
            { value: String(companyNames.length || (industries || []).length || 3), label: 'Companies targeted' },
            { value: '72%', label: 'Avg response rate' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: orange, margin: '0 0 4px' }}>{stat.value}</p>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.35)', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ animation: 'fiqFadeUp 0.5s 0.4s ease both' }}>
          <button
            onClick={() => navigate('Dashboard')}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 100, border: 'none',
              background: orange, color: '#fff',
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              cursor: 'pointer', minHeight: 48, transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
            onMouseLeave={e => e.currentTarget.style.background = orange}
          >
            Go to my dashboard →
          </button>
          <button
            onClick={() => navigate('FastIQ')}
            style={{
              display: 'block', margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.35)',
              minHeight: 44, width: 'auto',
            }}
          >
            See what FASTIQ found →
          </button>
        </div>
      </div>
    </div>
  );
}