import { useState, useRef } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

const MATCHES = [
  {
    company: 'Salesforce',
    role: 'Business Development Representative',
    logo: '☁️',
    alumCount: 3,
    parentCount: 2,
    matchPct: 98,
    tag: 'Alumni Intro Draft Ready',
  },
  {
    company: 'Deloitte',
    role: 'Consulting Analyst, Technology',
    logo: '🏢',
    alumCount: 5,
    parentCount: 1,
    matchPct: 94,
    tag: '3 Intro Drafts Ready',
  },
  {
    company: 'Amazon',
    role: 'Operations Analyst — Summer Intern',
    logo: '📦',
    alumCount: 2,
    parentCount: 3,
    matchPct: 89,
    tag: 'Parent Referral Available',
  },
];

export default function MatchFlashCarousel({ college, theme, onCardClick }) {
  const t = theme || { primary: '#2563eb', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'UF';
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef(null);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setActiveIdx(idx);
  };

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    trackRef.current.scrollTo({ left: idx * trackRef.current.clientWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 4px' }}>
      <style>{`
        @keyframes matchPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); } }
        @keyframes boltFlash { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        .match-track::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚀</span>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          CLIFF's Top High-Outreach Matches Today
        </p>
      </div>

      {/* Horizontal snap track */}
      <div
        ref={trackRef}
        className="match-track"
        onScroll={handleScroll}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          gap: 12,
          padding: '4px 16px 8px',
        }}
      >
        {MATCHES.map((m, i) => (
          <MatchCard
            key={i}
            match={m}
            shortName={shortName}
            theme={t}
            onClick={() => onCardClick && onCardClick(m)}
          />
        ))}
      </div>

      {/* Pagination dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 4 }}>
        {MATCHES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{
              width: i === activeIdx ? 20 : 7,
              height: 7,
              borderRadius: 100,
              background: i === activeIdx ? '#7c3aed' : '#d1d5db',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: 'auto',
              boxShadow: i === activeIdx ? '0 0 8px rgba(124,58,237,0.5)' : 'none',
            }}
          />
        ))}
      </div>
      <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '0 0 6px', letterSpacing: '0.04em' }}>
        Swipe for more curated matches
      </p>
    </div>
  );
}

function MatchCard({ match, shortName, theme, onClick }) {
  const t = theme || { primary: '#2563eb' };
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 'calc(100vw - 56px)',
        maxWidth: 480,
        scrollSnapAlign: 'start',
        background: '#fff',
        borderRadius: 18,
        border: hovered ? '1.5px solid rgba(124,58,237,0.5)' : '1.5px solid rgba(124,58,237,0.18)',
        boxShadow: hovered
          ? '0 8px 32px rgba(124,58,237,0.18), 0 0 0 4px rgba(124,58,237,0.06)'
          : '0 2px 16px rgba(0,0,0,0.06), 0 0 0 0px transparent',
        padding: '18px 18px 14px',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s, border-color 0.25s',
        animation: 'matchPulse 3s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row: badge + logo + company */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {match.logo}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.company}</p>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 500, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.role}</p>
          </div>
        </div>

        {/* CLIFF TOP SELECTION badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 100, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: 10, animation: 'boltFlash 2s ease-in-out infinite' }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top Pick</span>
        </div>
      </div>

      {/* Network Intel row — the high-contrast hero stat */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', border: '1px solid #c7d2fe', borderRadius: 12, padding: '10px 14px' }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px', lineHeight: 1.3 }}>
          🔥 {match.alumCount} {shortName} Alums &amp; {match.parentCount} Parent{match.parentCount !== 1 ? 's' : ''} in this network
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#4c1d95', margin: 0, fontWeight: 600 }}>
          Warm entry point — no cold applications needed
        </p>
      </div>

      {/* Match score row + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '5px 10px' }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed' }}>
            CLIFF Match: {match.matchPct}%
          </span>
          <span style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>· {match.tag}</span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 'auto' }}
        >
          View Warm Intro →
        </button>
      </div>
    </div>
  );
}