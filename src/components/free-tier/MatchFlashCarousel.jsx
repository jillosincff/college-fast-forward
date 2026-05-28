import { useState, useRef, useEffect } from 'react';
import { getVerifiedNetworkCompanies } from '@/functions/getVerifiedNetworkCompanies';
import { calculateNetworkMatchScore } from '@/utils/networkScore';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import ColdDiscoveryCard from './ColdDiscoveryCard';

const dm = "'DM Sans', system-ui, sans-serif";

function tagLabel(alumniCount, parentCount) {
  if (alumniCount > 0 && parentCount > 0) return 'Alumni + Parent paths available';
  if (alumniCount > 0) return `${alumniCount} Alumni intro path${alumniCount > 1 ? 's' : ''}`;
  return `${parentCount} Parent referral${parentCount > 1 ? 's' : ''} available`;
}

export default function MatchFlashCarousel({ college, theme, user, onCardClick, onColdOptIn }) {
  const t = theme || { primary: '#2563eb', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'UF';
  const firstName = user?.full_name?.split(' ')[0] || null;
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getVerifiedNetworkCompanies({})
      .then(res => {
        const companies = res?.data?.companies || [];
        // Map DB records to match card shape
        const mapped = companies
          .filter(c => c.alumniCount + c.parentCount >= 1)
          .slice(0, 6)
          .map(c => ({
            company: c.company,
            role: c.members.find(m => m.persona === 'alumni')?.title || 'Warm Intro Available',
            logo: '🏢',
            alumCount: c.alumniCount,
            parentCount: c.parentCount,
            matchPct: calculateNetworkMatchScore(c.alumniCount, c.parentCount),
            tag: tagLabel(c.alumniCount, c.parentCount),
            // Pass through real members for the modal
            _members: c.members,
          }));
        setMatches(mapped);
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    setActiveIdx(Math.round(scrollLeft / clientWidth));
  };

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    trackRef.current.scrollTo({ left: idx * trackRef.current.clientWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🚀</span>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            CLIFF's Top High-Outreach Matches Today
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ flexShrink: 0, width: 280, height: 140, borderRadius: 18, background: '#f1f5f9', animation: 'shimmer 1.5s infinite linear', backgroundSize: '1000px 100%', backgroundImage: 'linear-gradient(to right, #f1f5f9 4%, #e2e8f0 25%, #f1f5f9 36%)' }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }`}</style>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🚀</span>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            CLIFF's Top High-Outreach Matches Today
          </p>
        </div>
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#94a3b8', margin: 0 }}>
            No verified network connections found yet. As more alumni and parents join, your warm match carousel will populate here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 4px' }}>
      <style>{`
        @keyframes matchPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); } }
        @keyframes boltFlash { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        .match-track::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚀</span>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          CLIFF's Top High-Outreach Matches Today
        </p>
      </div>

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
        {matches.map((m, i) => (
          <MatchCard
            key={i}
            match={m}
            shortName={shortName}
            theme={t}
            onClick={() => setSelectedMatch(m)}
          />
        ))}
        {/* Cold Discovery opt-in — always the last card in the track */}
        <ColdDiscoveryCard firstName={firstName} onOptIn={onColdOptIn} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 4 }}>
        {/* +1 dot for the ColdDiscoveryCard at the end */}
        {[...matches, null].map((_, i) => (
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
        Verified {shortName} network · {matches.length} companies with warm paths
      </p>

      {selectedMatch && (
        <MatchDeepDiveModal
          match={selectedMatch}
          shortName={shortName}
          onClose={() => setSelectedMatch(null)}
          onGenerateOutreach={(data) => {
            onCardClick && onCardClick(data.match);
          }}
        />
      )}
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
      {/* Top row */}
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 100, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: 10, animation: 'boltFlash 2s ease-in-out infinite' }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verified</span>
        </div>
      </div>

      {/* Network intel */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', border: '1px solid #c7d2fe', borderRadius: 12, padding: '10px 14px' }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px', lineHeight: 1.3 }}>
          🔥 {match.alumCount} {shortName} Alum{match.alumCount !== 1 ? 's' : ''} &amp; {match.parentCount} Parent{match.parentCount !== 1 ? 's' : ''} confirmed in network
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#4c1d95', margin: 0, fontWeight: 600 }}>
          Warm entry point — no cold applications needed
        </p>
      </div>

      {/* Match score + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '5px 10px' }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed' }}>
            Network Weight: {match.matchPct}%
          </span>
          <span style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>· {match.tag}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', whiteSpace: 'nowrap', marginLeft: 'auto' }}
        >
          View Warm Intro →
        </button>
      </div>
    </div>
  );
}