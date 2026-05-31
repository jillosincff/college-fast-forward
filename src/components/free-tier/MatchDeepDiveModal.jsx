import { useState, useEffect } from 'react';
import CliFFOutreachModal from './CliFFOutreachModal';

const dm = "'DM Sans', system-ui, sans-serif";

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
  const alumCount = match.alumCount || match.alumniCount || 0;
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
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachInitialData, setOutreachInitialData] = useState(null);

  // Members are passed directly from the carousel — already verified, no extra API call needed
  useEffect(() => {
    if (!match) return;
    setSelectedContact(null);
    const members = match._members || [];
    setAlumni(
      members
        .filter(m => m.persona === 'alumni')
        .map(m => ({
          name: m.full_name || 'Alumni',
          title: m.role_title || m.title || '',
          grad: m.graduation_year || '',
          mutual: false,
          linkedin_url: m.linkedin_url || null,
        }))
    );
    setParents(
      members
        .filter(m => m.persona === 'parent')
        .map(m => ({
          name: m.full_name || 'Parent',
          title: m.role_title || m.title || '',
          student: m.student_name ? `${m.student_name}, UF` : 'UF Student',
          linkedin_url: m.linkedin_url || null,
        }))
    );
    setLoading(false);
  }, [match?.company]);

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
    setOutreachInitialData({
      name: contact.name,
      title: contact.title,
      company: match.company,
    });
    setShowOutreachModal(true);
  };

  const handleGenerateFromModal = (formData) => {
    setShowOutreachModal(false);
    const contact = selectedContact || contacts[0];
    onGenerateOutreach && onGenerateOutreach({ match, contact, tab, formData });
    setTimeout(() => {
      onClose();
      window.location.hash = `#OutreachDrafts?company=${encodeURIComponent(formData.company)}&role=${encodeURIComponent(match.role)}&contact=${encodeURIComponent(formData.name)}&tab=${tab}`;
    }, 300);
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
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px' }}>

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
                  Network Connection Weight: {match.matchPct}% — Here's why
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
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#2563eb', margin: '0 0 2px' }}>{match.alumCount}</p>
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
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  🔍 CLiFF is actively searching for {tab === 'alumni' ? 'alumni' : 'parents'} at {match.company}...
                </p>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: '8px 0 0' }}>
                  Check back soon — new connections are added daily!
                </p>
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
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageViaCLiFF(c);
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 8, padding: '4px 10px',
                            border: 'none', minHeight: 'auto', flexShrink: 0, cursor: 'pointer',
                            fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#fff',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #6d28d9)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <span>⚡</span>
                          <span>CLiFF Draft</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedContact && (
              <p style={{ fontFamily: dm, fontSize: 11, color: '#7c3aed', fontWeight: 600, margin: '10px 0 0', textAlign: 'center' }}>
                ✓ {selectedContact.name} selected for outreach
              </p>
            )}
          </div>

          {/* ── Zone 3: Action Hand-off ── */}
          <div style={{ paddingTop: 20 }}>
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
            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0' }}>
              Saves to pipeline · Selects best contact · Opens pre-drafted message
            </p>
          </div>
        </div>
      </div>

      {/* CLiFF Outreach Modal */}
      <CliFFOutreachModal
        isOpen={showOutreachModal}
        onClose={() => setShowOutreachModal(false)}
        initialData={outreachInitialData}
        onGenerate={handleGenerateFromModal}
      />
    </div>
  );
}