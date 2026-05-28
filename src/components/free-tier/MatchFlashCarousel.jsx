import { useState, useRef, useEffect } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import ColdDiscoveryCard from './ColdDiscoveryCard';

const dm = "'DM Sans', system-ui, sans-serif";

// ── Hiring signal pill ───────────────────────────────────────────────────────
function HiringSignal({ signal }) {
  const cfg = {
    hot: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', dot: '#ef4444', label: 'Hot' },
    warm: { bg: '#fff7ed', border: '#fdba74', color: '#92400e', dot: '#f97316', label: 'Active' },
    cool: { bg: '#f0f9ff', border: '#7dd3fc', color: '#075985', dot: '#38bdf8', label: 'Open' },
  }[signal || 'warm'] || { bg: '#f0fdf4', border: '#86efac', color: '#166534', dot: '#22c55e', label: 'Open' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 100, padding: '3px 8px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
    </span>
  );
}

// ── Source category config ───────────────────────────────────────────────────
// A = 🔥 Hidden Network Referral (from parent/alumni intake)
// B = 🛰️ Native LinkedIn Mention (hiring manager status post, pre-HR)
// C = ⚡ Direct Company Backdoor (Greenhouse/Lever career page, not cross-posted)
// D = 💬 Industry Community Thread (Reddit megathread, founder direct post)
const SOURCE_CATEGORY_CONFIG = {
  A: {
    emoji: '🔥', label: 'HIDDEN NETWORK REFERRAL',
    subtext: 'Surfaced directly from a parent or alumni referral — not posted anywhere public.',
    bg: 'linear-gradient(135deg, #fff1f2, #fff5f5)', border: '#fecaca', color: '#991b1b',
    ctaLabel: '🚀 Draft Warm Intro via Alumni', ctaBg: '#dc2626',
  },
  B: {
    emoji: '🛰️', label: 'SOURCED VIA NATIVE LINKEDIN MENTION',
    subtext: 'Found on a hiring manager\'s active feed before HR published to major public portals.',
    bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '#bae6fd', color: '#075985',
    ctaLabel: '🚀 Draft DM to Hiring Manager via CLiFF', ctaBg: '#0284c7',
  },
  C: {
    emoji: '⚡', label: 'DIRECT COMPANY BACKDOOR TRACK',
    subtext: 'Posted only on the company\'s own career page — not cross-listed on LinkedIn Jobs or Indeed.',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '#ddd6fe', color: '#5b21b6',
    ctaLabel: '🚀 Route Resume via Verified Alumnus', ctaBg: '#7c3aed',
  },
  D: {
    emoji: '💬', label: 'SOURCED FROM INDUSTRY COMMUNITY THREADS',
    subtext: 'Spotted in a weekly hiring megathread — founder post with direct email, no ATS black hole.',
    bg: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '#fcd34d', color: '#92400e',
    ctaLabel: '🚀 Browse Original Thread via CLiFF', ctaBg: '#d97706',
  },
  E: {
    emoji: '🔭', label: 'NICHE PLATFORM SCOUT',
    subtext: 'Curated from a specialist job network mainstream applicants never check.',
    bg: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '#6ee7b7', color: '#065f46',
    ctaLabel: '🔭 View via CLiFF Scout', ctaBg: '#059669',
  },
};

// Niche platform micro-badge config (mirrors backend NICHE_PLATFORM_CONFIG)
const NICHE_PLATFORM_CONFIG = {
  wellfound:         { label: 'Wellfound (AngelList)', icon: '🚀', insight: 'Sourced from an exclusive startup network. This role has 85% fewer public applicants than LinkedIn.' },
  builtin:           { label: 'Built In', icon: '🏙️', insight: 'Local tech ecosystem listing — not syndicated to mainstream job boards.' },
  keyvalues:         { label: 'Key Values', icon: '🧭', insight: 'Companies post here when culture fit matters more than a keyword-matched resume. High response rates.' },
  workingnotworking: { label: 'Working Not Working', icon: '🎨', insight: 'Elite creative community — only top agencies recruit here. Applicant pool is 10x smaller than Behance.' },
  dribbble:          { label: 'Dribbble Jobs', icon: '🏀', insight: 'Design studios post here to catch creatives actively shipping work, not passive resume uploaders.' },
  otta:              { label: 'Otta', icon: '📊', insight: 'Otta scores companies on salary transparency & growth. Only high-quality roles make the cut.' },
  jobbio:            { label: 'Jobbio', icon: '🌿', insight: 'Culture-first curation — roles matched on values, not keywords. Much lower noise than LinkedIn.' },
  lattice_rfh:       { label: 'Resources for Humans (Lattice)', icon: '👥', insight: 'Posted inside an invite-only HR Slack community — seen by People Ops insiders before anyone else.' },
  shrm:              { label: 'SHRM Job Board', icon: '🏛️', insight: 'Overlooked by students — thousands of HR coordinator roles with almost zero Gen-Z competition.' },
};

function SourceProvenanceBanner({ category, nichePlatform }) {
  // Category E: use the specific niche platform config for richer copy
  if (category === 'E' && nichePlatform) {
    const plat = NICHE_PLATFORM_CONFIG[nichePlatform];
    if (plat) {
      return (
        <div style={{ margin: '0 10px', borderRadius: 10, background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #6ee7b7', padding: '8px 12px' }}>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: '#065f46', letterSpacing: '0.08em', margin: '0 0 3px' }}>
            🔭 CURATED VIA {plat.icon} {plat.label.toUpperCase()}
          </p>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#065f46', opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
            "{plat.insight}"
          </p>
        </div>
      );
    }
  }
  const cfg = SOURCE_CATEGORY_CONFIG[category] || SOURCE_CATEGORY_CONFIG['C'];
  return (
    <div style={{ margin: '0 10px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '8px 12px' }}>
      <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: cfg.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>
        {cfg.emoji} {cfg.label}
      </p>
      <p style={{ fontFamily: dm, fontSize: 10, color: cfg.color, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
        "{cfg.subtext}"
      </p>
    </div>
  );
}

// ── Reality Check Card (public listing with backdoor lever) ─────────────────
function RealityCheckCard({ card, shortName, onClick }) {
  const [hovered, setHovered] = useState(false);
  const daysAgo = card.daysPosted || 16;
  const applicants = card.applicantCount || 349;

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
        borderRadius: 20,
        border: hovered ? '1.5px solid rgba(124,58,237,0.55)' : '1.5px solid rgba(0,0,0,0.10)',
        boxShadow: hovered ? '0 8px 32px rgba(124,58,237,0.18)' : '0 2px 16px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s, border-color 0.25s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Row 1: Company header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            🏢
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.company}
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.role}
            </p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 100, padding: '3px 8px', flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#991b1b', letterSpacing: '0.06em' }}>⚠️ PUBLIC</span>
        </span>
      </div>

      {/* ── Row 2: Reality Check Banner ── */}
      <div style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #fef2f2, #fff5f5)', borderBottom: '1px solid #fecaca' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: '#b91c1c', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          ⚠️ PUBLIC REALITY CHECK
        </p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <span style={{ fontFamily: dm, fontSize: 11, color: '#7f1d1d', fontWeight: 700 }}>
            📅 Posted: {daysAgo} days ago
          </span>
          <span style={{ fontFamily: dm, fontSize: 11, color: '#7f1d1d', fontWeight: 700 }}>
            👥 Applicants: {applicants.toLocaleString()}
          </span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 0', lineHeight: 1.5 }}>
          ❌ The front door is completely flooded.
        </p>
      </div>

      {/* ── Row 3: Backdoor Lever ── */}
      <div style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderBottom: '1px solid #bbf7d0' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          🟢 YOUR BACKDOOR LEVER:
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#14532d', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          "{card.alumniCount} {shortName} Alum{card.alumniCount !== 1 ? 's' : ''} work here. Don't join the pile of {applicants.toLocaleString()} blind applications — bypass the ATS entirely with an alumni warm introduction."
        </p>
      </div>

      {/* ── Row 4: Footer ── */}
      <div style={{ padding: '10px 14px', borderTop: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: 11 }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>
            Network Weight: {card.networkWeight}%
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 800,
            color: '#fff', background: '#16a34a',
            border: 'none', borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
          }}
        >
          Bypass the Pile →
        </button>
      </div>
    </div>
  );
}

// ── Main card ────────────────────────────────────────────────────────────────
function MatchCard({ card, shortName, onClick }) {
  const [hovered, setHovered] = useState(false);
  const industryLabel = (card.targetIndustry || card.matchedIndustries?.[0] || '').toUpperCase();

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
        borderRadius: 20,
        border: hovered ? '1.5px solid rgba(124,58,237,0.55)' : '1.5px solid rgba(124,58,237,0.18)',
        boxShadow: hovered
          ? '0 8px 32px rgba(124,58,237,0.18), 0 0 0 4px rgba(124,58,237,0.06)'
          : '0 2px 16px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s, border-color 0.25s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Row 1: Company header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            🏢
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.company}
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.role}
            </p>
          </div>
        </div>
        <HiringSignal signal="hot" />
      </div>

      {/* ── Row 2: Live Match Banner ── */}
      <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #fdf4ff 0%, #eff6ff 100%)', borderBottom: '1px solid #e9d5ff' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
          🚀 Live Match for Your Target{industryLabel ? `: ${industryLabel}` : ''}
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#4b5563', margin: 0, lineHeight: 1.55 }}>
          {card.jobDescription}
        </p>
      </div>

      {/* ── Row 3: Alumni Backdoor Lever ── */}
      <div style={{ padding: '10px 16px', borderBottom: card.hasParentBonus ? '1px solid #f1f5f9' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎓</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
              {card.alumniCount} {shortName} Alum{card.alumniCount !== 1 ? 's' : ''} work here
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              Bypasses cold portals — Alumni Intro Draft Ready
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 4: Parent Mentorship Bonus (conditional) ── */}
      {card.hasParentBonus && (
        <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef9f0 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#78350f', margin: '0 0 2px' }}>
                Bonus: Parent Insight Path Unlocked
              </p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#92400e', margin: 0, lineHeight: 1.55 }}>
                {card.featuredParent
                  ? `A ${shortName} Parent ${card.featuredParent.title ? `(${card.featuredParent.title}) ` : ''}has offered mock interviews and career guidance for this specific path.`
                  : `${card.parentCount} ${shortName} Parent${card.parentCount !== 1 ? 's' : ''} available for mock interviews and insider career advice.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 4b: Sourcing provenance banner ── */}
      {card.jobSourceCategory && (
        <div style={{ padding: '8px 0 4px' }}>
          <SourceProvenanceBanner category={card.jobSourceCategory} nichePlatform={card.nichePlatform} />
        </div>
      )}

      {/* ── Row 5: Footer — category-specific CTA ── */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: 11 }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>
            {card.networkWeight}% match
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 800,
            color: '#fff',
            background: (SOURCE_CATEGORY_CONFIG[card.jobSourceCategory] || SOURCE_CATEGORY_CONFIG['C']).ctaBg,
            border: 'none', borderRadius: 8, padding: '6px 12px',
            cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {(SOURCE_CATEGORY_CONFIG[card.jobSourceCategory] || SOURCE_CATEGORY_CONFIG['C']).ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ── Carousel ─────────────────────────────────────────────────────────────────
export default function MatchFlashCarousel({ college, theme, user, onCardClick, onColdOptIn }) {
  const t = theme || { primary: '#2563eb', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'UF';
  const firstName = user?.full_name?.split(' ')[0] || null;
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetIndustries, setTargetIndustries] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const userTargets = (
      user?.career_goals?.target_industries
      || user?.industries_interested
      || user?.industries_of_interest
      || []
    ).map(i => i.toLowerCase());

    getPersonalizedNetworkCarousel({
      target_industries: userTargets,
      target_role: user?.career_goals?.role || user?.target_role || '',
    })
      .then(res => {
        const data = res?.data || {};
        setCards(data.cards || []);
        setTargetIndustries(data.targetIndustries || userTargets);
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, childNodes } = trackRef.current;
    const cardWidth = childNodes[0]?.offsetWidth + 12 || trackRef.current.clientWidth;
    setActiveIdx(Math.round(scrollLeft / cardWidth));
  };

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    const cardWidth = (trackRef.current.childNodes[0]?.offsetWidth || trackRef.current.clientWidth) + 12;
    trackRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <SectionHeader />
        <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ flexShrink: 0, width: 300, height: 220, borderRadius: 20, background: 'linear-gradient(to right, #f1f5f9 4%, #e2e8f0 25%, #f1f5f9 36%)', backgroundSize: '1000px 100%', animation: 'shimmer 1.5s infinite linear' }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }`}</style>
      </div>
    );
  }

  if (!cards.length) {
    const industryLabel = targetIndustries.length > 0 ? targetIndustries.slice(0, 2).join(' & ') : null;
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <SectionHeader />
        <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)', border: '1px dashed #a5b4fc', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🛰️</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#1e1b4b', margin: '0 0 6px' }}>CLiFF is Agent Hunting for You</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#4c1d95', margin: 0, lineHeight: 1.7 }}>
                {industryLabel
                  ? `You have strict targets locked in for ${industryLabel}. We haven't found a verified ${shortName} alum with a backdoor path at a relevant opening yet — but CLiFF is actively crawling for you 24/7.`
                  : `No verified alumni backdoor paths found yet. As more alumni join and list their companies, premium match cards will appear here.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 4px' }}>
      <style>{`
        @keyframes matchPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.2); } 50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); } }
        .match-track::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <SectionHeader />
      </div>

      <div
        ref={trackRef}
        className="match-track"
        onScroll={handleScroll}
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', gap: 12, padding: '4px 16px 8px' }}
      >
        {cards.map((card, i) => (
          card.displayStyle === 'REALITY_CHECK'
            ? <RealityCheckCard key={i} card={card} shortName={shortName} onClick={() => setSelectedMatch(card)} />
            : <MatchCard key={i} card={card} shortName={shortName} onClick={() => setSelectedMatch(card)} />
        ))}
        <ColdDiscoveryCard firstName={firstName} onOptIn={onColdOptIn} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 4 }}>
        {[...cards, null].map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{ width: i === activeIdx ? 20 : 7, height: 7, borderRadius: 100, background: i === activeIdx ? '#7c3aed' : '#d1d5db', border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s ease', minHeight: 'auto', boxShadow: i === activeIdx ? '0 0 8px rgba(124,58,237,0.5)' : 'none' }}
          />
        ))}
      </div>

      <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '0 0 6px', letterSpacing: '0.04em' }}>
        Verified {shortName} network · {cards.length} live opportunit{cards.length !== 1 ? 'ies' : 'y'} with alumni backdoor paths
      </p>

      {selectedMatch && (
        <MatchDeepDiveModal
          match={{
            ...selectedMatch,
            company: selectedMatch.company,
            role: selectedMatch.role,
            jobDescription: selectedMatch.jobDescription,
            jobSource: selectedMatch.jobSource,
            jobSourceCategory: selectedMatch.jobSourceCategory,
            alumCount: selectedMatch.alumniCount,
            parentCount: selectedMatch.parentCount,
            matchPct: selectedMatch.networkWeight,
            matchedIndustries: selectedMatch.matchedIndustries,
            _members: selectedMatch._members,
          }}
          shortName={shortName}
          onClose={() => setSelectedMatch(null)}
          onGenerateOutreach={(data) => onCardClick && onCardClick(data.match)}
        />
      )}
    </div>
  );
}

function SectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>🚀</span>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
        CLiFF's Live Backdoor Matches
      </p>
    </div>
  );
}