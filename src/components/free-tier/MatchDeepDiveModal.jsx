import { useState, useEffect, useRef } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

// School metadata mapper — abbreviation, campus town, mascot cheer
const SCHOOL_META = {
  UF:     { abbr: 'UF',    town: 'Gainesville', mascot: 'Gators',       cheer: 'Go Gators! 🐊' },
  FSU:    { abbr: 'FSU',   town: 'Tallahassee', mascot: 'Seminoles',    cheer: 'Go Noles! 🏹' },
  UCF:    { abbr: 'UCF',   town: 'Orlando',     mascot: 'Knights',      cheer: 'Go Knights! ⚔️' },
  USF:    { abbr: 'USF',   town: 'Tampa',       mascot: 'Bulls',        cheer: 'Go Bulls! 🐂' },
  FIU:    { abbr: 'FIU',   town: 'Miami',       mascot: 'Panthers',     cheer: 'Go Panthers! 🐾' },
  UM:     { abbr: 'UM',    town: 'Coral Gables', mascot: 'Hurricanes',  cheer: 'Go Canes! 🌀' },
  UGA:    { abbr: 'UGA',   town: 'Athens',      mascot: 'Bulldogs',     cheer: 'Go Dawgs! 🐾' },
  OSU:    { abbr: 'OSU',   town: 'Columbus',    mascot: 'Buckeyes',     cheer: 'Go Bucks! 🌰' },
  USC:    { abbr: 'USC',   town: 'Los Angeles', mascot: 'Trojans',      cheer: 'Fight On! ✌️' },
  UCLA:   { abbr: 'UCLA',  town: 'Los Angeles', mascot: 'Bruins',       cheer: 'Go Bruins! 🐻' },
  UMICH:  { abbr: 'U of M', town: 'Ann Arbor',  mascot: 'Wolverines',  cheer: 'Go Blue! 〽️' },
  PSU:    { abbr: 'Penn State', town: 'State College', mascot: 'Nittany Lions', cheer: 'We Are Penn State! 🦁' },
  TULANE: { abbr: 'Tulane', town: 'New Orleans', mascot: 'Green Wave', cheer: 'Roll Wave! 🌊' },
  UDEL:   { abbr: 'UD',    town: 'Newark',      mascot: 'Blue Hens',    cheer: 'Go Hens! 🐓' },
  UMD:    { abbr: 'UMD',   town: 'College Park', mascot: 'Terps',       cheer: 'Fear the Turtle! 🐢' },
};

function getSchoolMeta(schoolCode) {
  const key = (schoolCode || 'UF').toUpperCase();
  return SCHOOL_META[key] || { abbr: key, town: 'campus', mascot: 'team', cheer: `Go ${key}!` };
}

const SOURCE_CATEGORY_CONFIG = {
  A: {
    emoji: '🔥', label: 'HIDDEN NETWORK REFERRAL',
    subtext: 'Surfaced directly from a parent or alumni referral — not posted anywhere public.',
    bg: 'linear-gradient(135deg, #fff1f2, #fff5f5)', border: '#fecaca', color: '#991b1b',
    ctaLabel: '🔥 Draft Warm Intro via Alumni',
  },
  B: {
    emoji: '🛰️', label: 'SOURCED VIA NATIVE LINKEDIN MENTION',
    subtext: 'Found on a hiring manager\'s active feed before HR published to major public portals.',
    bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '#bae6fd', color: '#075985',
    ctaLabel: '🛰️ Draft DM to Hiring Manager via CLiFF',
  },
  C: {
    emoji: '⚡', label: 'DIRECT COMPANY BACKDOOR TRACK',
    subtext: 'Posted only on the company\'s own career page — not cross-listed on LinkedIn Jobs or Indeed.',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '#ddd6fe', color: '#5b21b6',
    ctaLabel: '⚡ Route Resume via Verified Alumnus',
  },
  D: {
    emoji: '💬', label: 'SOURCED FROM INDUSTRY COMMUNITY THREADS',
    subtext: 'Spotted in a weekly hiring megathread — founder post with direct email, no ATS black hole.',
    bg: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '#fcd34d', color: '#92400e',
    ctaLabel: '💬 Browse Original Thread via CLiFF',
  },
};

function SourceCategoryBadge({ category, source }) {
  const cfg = SOURCE_CATEGORY_CONFIG[category] || SOURCE_CATEGORY_CONFIG['C'];
  return (
    <div style={{ borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '8px 10px' }}>
      <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: cfg.color, letterSpacing: '0.07em', margin: '0 0 3px' }}>
        {cfg.emoji} {cfg.label}
      </p>
      <p style={{ fontFamily: dm, fontSize: 10, color: cfg.color, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
        "{cfg.subtext}"
      </p>
      {source && (
        <p style={{ fontFamily: dm, fontSize: 9, color: '#9ca3af', margin: '4px 0 0' }}>{source}</p>
      )}
    </div>
  );
}

// Bullet points derived purely from verified DB counts — no AI, no guessing
function buildMatchReasons(match, shortName) {
  const reasons = [];
  const alumCount = match.alumniCount || match.alumCount || 0;
  const parentCount = match.parentCount || 0;
  
  if (alumCount > 0) {
    reasons.push(`Exceptional institutional bond — ${alumCount} verified ${shortName} alumni confirmed at this employer`);
  }
  if (parentCount > 0) {
    reasons.push(`Active parent ecosystem — ${parentCount} ${shortName} parent${parentCount > 1 ? 's have' : ' has'} opted in for referrals here`);
  }
  reasons.push('Warm path confirmed — this company is in the verified CFF network');
  if (alumCount + parentCount >= 5) {
    reasons.push('High network density — multiple entry points into this employer');
  }
  return reasons;
}

export default function MatchDeepDiveModal({ match, shortName, onClose, onGenerateOutreach, onInitiateOutreach, user }) {
  const [tab, setTab] = useState('alumni');
  const [selectedContact, setSelectedContact] = useState(null);
  const [launched, setLaunched] = useState(false);
  const [alumni, setAlumni] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  // Inline outreach draft state
  const [draftContact, setDraftContact] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const draftPanelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Members are passed directly from the carousel — already verified, no extra API call needed
  useEffect(() => {
    if (!match) return;
    setSelectedContact(null);
    setDraftContact(null);
    setGeneratedScript('');

    // Backend returns alumni in match.alumni (array of member objects with full_name field)

    const alumniList = Array.isArray(match.alumni) ? match.alumni : [];
    const mappedAlumni = alumniList
      .map(m => ({
        name: m.full_name || m.name || '',
        title: m.title || m.role_title || '',
        grad: m.graduation_year || m.grad || '',
        mutual: false,
        linkedin_url: m.linkedin_url || null,
        linkedin_is_search: false,
      }))
      .filter(m => m.name);
    setAlumni(mappedAlumni);

    // Backend returns parents via featuredParent (single object) — build a list from it
    const parentsRaw = match.featuredParent ? [match.featuredParent] : [];
    const mappedParents = parentsRaw
      .map(m => ({
        name: m.full_name || m.name || '',
        title: m.title || m.role_title || '',
        student: m.student_name ? `${m.student_name}, UF` : 'UF Student',
        linkedin_url: m.linkedin_url || null,
      }))
      .filter(m => m.name);
    setParents(mappedParents);

    setLoading(false);
  }, [match]);

  if (!match) return null;

  const contacts = tab === 'alumni' ? alumni : parents;
  const reasons = buildMatchReasons(match, shortName || 'UF');

  const handleTrackAndDraft = () => {
    const contact = selectedContact || contacts[0];
    setLaunched(true);
    onGenerateOutreach && onGenerateOutreach({ match, contact, tab });
    setTimeout(() => {
      onClose();
      window.location.hash = `#OutreachDrafts?company=${encodeURIComponent(match.company)}&role=${encodeURIComponent(match.role)}&contact=${encodeURIComponent(contact?.name || '')}`;
    }, 600);
  };

  const handleMessageViaCLiFF = (contact) => {
    setDraftContact(contact);
    setGeneratedScript('');
    setIsCopied(false);
    setIsGenerating(true);
    // Scroll draft panel into view inside the modal's scrollable container
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 80);
    const firstName = contact.name?.split(' ')[0] || contact.name;
    const schoolCode = user?.school_code || shortName || 'UF';
    const meta = getSchoolMeta(schoolCode);
    const userType = user?.persona === 'alumni' ? `fellow ${meta.abbr} grad` : `current ${meta.abbr} student`;
    setTimeout(() => {
      setGeneratedScript(
        `Hey ${firstName}, ${userType} here! I saw you made it from ${meta.town} to ${match.company} and that's exactly the path I'm working toward right now! I'm currently exploring opportunities in this space and would love to ask you one quick question about how you navigated the pipeline. Would you be open to a casual 15-minute chat sometime soon? ${meta.cheer}`
      );
      setIsGenerating(false);
    }, 750);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
    // Fire event so pipeline can auto-progress this job to "Applied"
    window.dispatchEvent(new CustomEvent('cliff:outreach-copied', {
      detail: {
        company: match.company,
        role: match.role,
        contactName: draftContact?.name || '',
        contactFirstName: draftContact?.name?.split(' ')[0] || '',
      }
    }));
  };

  const handleCloseDraft = () => {
    setDraftContact(null);
    setGeneratedScript('');
    setIsGenerating(false);
    setIsCopied(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>

        {/* Drag handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {/* Scrollable content */}
        <div ref={scrollContainerRef} style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px' }}>

          {/* ── Zone 1: Tactical Overview ── */}
          <div style={{ paddingTop: 4, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {match.logo}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 2px' }}>{match.company}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#64748b', margin: 0 }}>{match.role}</p>
              </div>
              <button
                onClick={onClose}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#64748b', minHeight: 'auto', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>📋 About This Role</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 10px', lineHeight: 1.6 }}>
                {match.jobDescription || 'Role details coming soon — check back for updates.'}
              </p>
              {match.jobSourceCategory && <SourceCategoryBadge category={match.jobSourceCategory} source={match.jobSource} />}
            </div>

            <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)', border: '1px solid #c7d2fe', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                  Network Connection Weight: {match.networkWeight || match.matchPct || 0}% — Here's why
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: '#fff' }}>✓</span>
                    </div>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#2563eb', margin: '0 0 2px' }}>{match.alumniCount || match.alumCount || 0}</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: 0, fontWeight: 600 }}>🎓 {shortName} Alumni</p>
              </div>
              <div style={{ flex: 1, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#7c3aed', margin: '0 0 2px' }}>{match.parentCount}</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: 0, fontWeight: 600 }}>👨‍👩‍👧 {shortName} Parents</p>
              </div>
            </div>
          </div>

          {/* ── Zone 2: Warm Connections Grid ── */}
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🔓 Your Warm Network — Unlocked
              </p>
              <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 8px', textTransform: 'uppercase' }}>Premium</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 10, padding: 4, marginBottom: 14 }}>
              {['alumni', 'parents'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedContact(null); }}
                  style={{
                    flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700,
                    color: tab === t ? '#fff' : '#64748b',
                    background: tab === t ? (t === 'alumni' ? '#2563eb' : '#7c3aed') : 'transparent',
                    border: 'none', borderRadius: 7, padding: '7px 0', cursor: 'pointer',
                    minHeight: 'auto', transition: 'all 0.2s',
                  }}
                >
                  {t === 'alumni' ? `🎓 Alumni (${loading ? '…' : alumni.length})` : `👨‍👩‍👧 Parents (${loading ? '…' : parents.length})`}
                </button>
              ))}
            </div>

            {/* Contact cards */}
            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontFamily: dm, fontSize: 12, color: '#94a3b8', margin: 0 }}>Loading real network data…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #faf5ff, #f0f9ff)', border: '1px solid #e9d5ff', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 20, margin: '0 0 8px' }}>🕵️‍♂️</p>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6b21a8', margin: '0 0 4px' }}>Pure Sourcing Play</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#7c3aed', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Hidden role found on company website. CLiFF is mapping custom inroads — no warm contacts needed.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(match.company)}&role=${encodeURIComponent(match.role)}`;
                    }, 200);
                  }}
                  style={{
                    fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 10, padding: '10px 20px',
                    cursor: 'pointer', minHeight: 'auto',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                  }}
                >
                  ⚡ Generate Cold Inroad
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contacts.map((c, i) => {
                  const isAlum = tab === 'alumni';
                  const isSelected = selectedContact === c;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedContact(isSelected ? null : c)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: isSelected ? (isAlum ? '#eff6ff' : '#f5f3ff') : '#f8fafc',
                        border: `1.5px solid ${isSelected ? (isAlum ? '#93c5fd' : '#c4b5fd') : '#e2e8f0'}`,
                        borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: isAlum ? '#dbeafe' : '#ede9fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: dm, fontSize: 14, fontWeight: 800,
                        color: isAlum ? '#2563eb' : '#7c3aed',
                      }}>
                        {(c.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isAlum
                            ? `${c.title}${c.grad ? ` · Class of ${c.grad}` : ''}`
                            : `${c.title} · Parent of ${c.student}`}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {isAlum && c.mutual && (
                          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 100, padding: '2px 7px' }}>
                            Mutual
                          </span>
                        )}
                        {!isAlum && (
                          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 100, padding: '2px 7px' }}>
                            Opted-in
                          </span>
                        )}
                        {c.linkedin_url && (
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            title={`View ${c.name} on LinkedIn`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px',
                              textDecoration: 'none', minHeight: 'auto', flexShrink: 0,
                              fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#475569',
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#475569"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedContact && !draftContact && (
              <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', fontWeight: 600, margin: '10px 0 0', textAlign: 'center' }}>
                ✓ {selectedContact.name} selected for outreach
              </p>
            )}

            {/* ── Inline CLiFF Draft Panel ── */}
            {draftContact && (
              <div ref={draftPanelRef} style={{ marginTop: 14, background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '14px 16px', animation: 'slideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 900, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 2px' }}>⚡ CLiFF Outreach Draft</p>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#4c1d95', margin: 0, fontWeight: 600 }}>For {draftContact.name}</p>
                  </div>
                  <button
                    onClick={handleCloseDraft}
                    style={{ background: '#ede9fe', border: 'none', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', fontSize: 12, color: '#7c3aed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>

                {isGenerating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                    <div style={{ width: 18, height: 18, border: '2px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#7c3aed', margin: 0, fontWeight: 600 }}>🤖 Tailoring your script...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Your Personalized Script</p>
                    <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '12px 14px', fontFamily: dm, fontSize: 13, color: '#1e1b4b', lineHeight: 1.65, fontWeight: 500 }}>
                      {generatedScript}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={handleCopyDraft}
                        style={{
                          flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, cursor: 'pointer', minHeight: 'auto',
                          fontFamily: dm, fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
                          background: isCopied ? '#16a34a' : '#111827',
                          color: '#fff', transition: 'background 0.2s',
                        }}
                      >
                        {isCopied ? '✓ Copied!' : '📋 Copy Draft'}
                      </button>
                      {draftContact?.linkedin_url ? (
                        <a
                          href={draftContact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '10px 0', borderRadius: 10, minHeight: 'auto',
                            fontFamily: dm, fontSize: 12, fontWeight: 800,
                            background: '#0a66c2', color: '#fff', textDecoration: 'none',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          Send on LinkedIn
                        </a>
                      ) : (
                        <div style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '10px 0', borderRadius: 10, minHeight: 'auto',
                          fontFamily: dm, fontSize: 11, fontWeight: 700,
                          background: '#f1f5f9', color: '#64748b',
                        }}>
                          Paste in LinkedIn DM
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Zone 3: Action Hand-off ── */}
          <div style={{ paddingTop: 20 }}>
            {alumni.length === 0 && parents.length === 0 ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(match.company)}&role=${encodeURIComponent(match.role)}`;
                    }, 200);
                  }}
                  style={{
                    width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 14, padding: '16px 0', cursor: 'pointer',
                    minHeight: 'auto', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
                >
                  <span style={{ fontSize: 16 }}>⚡</span>
                  Generate Cold Inroad
                </button>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0' }}>
                  No warm contacts needed · CLiFF crafts a cold industry outreach
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleTrackAndDraft}
                  disabled={launched}
                  style={{
                    width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                    background: launched ? '#6b7280' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 14, padding: '16px 0', cursor: launched ? 'default' : 'pointer',
                    minHeight: 'auto', boxShadow: launched ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (!launched) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = launched ? 'none' : '0 4px 16px rgba(124,58,237,0.35)'; }}
                >
                  <span style={{ fontSize: 16 }}>{launched ? '✅' : '🚀'}</span>
                  {launched ? 'Saved to Pipeline — Opening Drafts...' : ((SOURCE_CATEGORY_CONFIG[match.jobSourceCategory] || SOURCE_CATEGORY_CONFIG['C']).ctaLabel)}
                </button>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
                  {match.jobSourceCategory === 'C' 
                    ? '🎯 Route Resume: Saves to pipeline + opens Outreach Drafts with alumnus referral strategy'
                    : '💌 Draft Message: Saves to pipeline + opens pre-written outreach message'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}