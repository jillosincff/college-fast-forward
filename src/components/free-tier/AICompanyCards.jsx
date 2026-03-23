import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Loader2 } from 'lucide-react';
import ParentMessageComposer from '@/components/free-tier/ParentMessageComposer';
import { base44 } from '@/api/base44Client';

// ─── Animations ───────────────────────────────────────────────────────────────
const searchingStyles = `
  @keyframes orbPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.4); opacity: 0.2; }
  }
  @keyframes searchFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }
  .fastiq-orb-pulse { animation: orbPulse 1.5s ease-in-out infinite; }
  .fastiq-search-text { animation: searchFadeIn 0.4s ease-in-out; }
  .fastiq-dot { animation: dotBounce 1.2s ease-in-out infinite; }
`;

function FastIQSearchingAnimation({ role, industries, user }) {
  const location = user?.career_goals?.locations?.[0] || user?.location_preferences?.[0] || 'the US';
  const roleLabel = role || industries?.[0] || 'your field';
  return (
    <>
      <style>{searchingStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 16 }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div className="fastiq-orb-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(232,93,32,0.15)' }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
        </div>
        <p className="fastiq-search-text" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', textAlign: 'center', minHeight: 20, margin: 0 }}>
          Searching for {roleLabel} opportunities in {location}...
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 200, 400].map(delay => (
            <span key={delay} className="fastiq-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', display: 'inline-block', animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function capitalizeName(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getInitials(firstName, lastName) {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
}

function getAvailabilityLabel(availability) {
  const val = (availability || '').toLowerCase();
  if (['happy_to_help', 'yes', 'open', 'true', '1', 'actively_helping', 'actively helping', 'happy to help'].some(v => val.includes(v))) {
    return '🟢 Happy to help';
  }
  if (['occasionally', 'sometimes', 'maybe'].some(v => val.includes(v))) {
    return '🟡 Occasionally available';
  }
  return '⚪ In the network';
}

function sortMembers(members) {
  return [...members].sort((a, b) => {
    const scoreA = (a.school_match ? 2 : 0) + (getAvailabilityLabel(a.intro_availability).includes('🟢') ? 1 : 0);
    const scoreB = (b.school_match ? 2 : 0) + (getAvailabilityLabel(b.intro_availability).includes('🟢') ? 1 : 0);
    return scoreB - scoreA;
  });
}

function sortCompanies(companies) {
  return [...companies].sort((a, b) => {
    const hasConnA = (a.cff_parent_count || 0) + (a.school_alumni_count || 0) > 0;
    const hasConnB = (b.cff_parent_count || 0) + (b.school_alumni_count || 0) > 0;
    const hotA = a.hiring_signal === 'hot' ? 1 : 0;
    const hotB = b.hiring_signal === 'hot' ? 1 : 0;
    const scoreA = (hasConnA ? 2 : 0) + hotA;
    const scoreB = (hasConnB ? 2 : 0) + hotB;
    return scoreB - scoreA;
  });
}

function getResultsSummary(members, companies, goals) {
  const role = goals?.role || 'professionals';
  const industry = goals?.industries?.[0] || 'your field';
  const parts = [];
  if (members.length > 0) {
    parts.push(`${members.length} CFF member${members.length > 1 ? 's' : ''} in ${industry} you can message directly`);
  }
  if (companies.length > 0) {
    parts.push(`${companies.length} compan${companies.length > 1 ? 'ies' : 'y'} actively hiring ${role}s right now`);
  }
  if (parts.length === 0) return `FastIQ is searching for ${role} opportunities — results coming shortly.`;
  return `FastIQ found ${parts.join(' and ')}.`;
}

// ─── Company Contacts Modal ──────────────────────────────────────────────────
const mobileSheetStyles = `
  @media (max-width: 640px) {
    .cff-contacts-overlay { align-items: flex-end !important; padding: 0 !important; }
    .cff-contacts-card { border-radius: 16px 16px 0 0 !important; max-height: 90vh !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; max-width: 100% !important; }
  }
`;

function CompanyContactsModal({ company, user, onClose, onOpenComposer, onTabChange }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allUsers = await base44.entities.User.list('-created_date', 300);
        const companyLower = company.name.toLowerCase();
        const schoolWord = (user?.school || user?.university || '').toLowerCase().split(' ')[0];
        const filtered = allUsers.filter(u => {
          const uCompany = (u.company || u.current_company || u.employer || '').toLowerCase();
          if (!uCompany.includes(companyLower)) return false;
          const firstName = (u.first_name || u.full_name?.split(' ')[0] || '').toLowerCase();
          if (['test', 'movie', 'demo', 'sample', 'fake'].includes(firstName)) return false;
          return true;
        });
        // Sort: school match + open to intros first
        filtered.sort((a, b) => {
          const aSchool = schoolWord && (a.school || a.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
          const bSchool = schoolWord && (b.school || b.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
          const aOpen = ['happy_to_help','yes','open','actively_helping'].includes(a.intro_availability) ? 1 : 0;
          const bOpen = ['happy_to_help','yes','open','actively_helping'].includes(b.intro_availability) ? 1 : 0;
          return (bSchool + bOpen) - (aSchool + aOpen);
        });
        setMembers(filtered);
      } catch (e) {
        console.error('CompanyContactsModal load failed:', e);
        setMembers([]);
      }
      setLoading(false);
    }
    load();
  }, [company.name]);

  const schoolWord = (user?.school || user?.university || '').toLowerCase().split(' ')[0];

  return (
    <>
      <style>{mobileSheetStyles}</style>
    <div
      className="cff-contacts-overlay"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        className="cff-contacts-card"
        style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 24px 16px', borderBottom: '1px solid #F5F5F5', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 4px' }}>CFF CONNECTIONS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1A1A1A', margin: '0 0 4px' }}>Who you know at {company.name}</h2>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>These CFF members work here and may be able to help you get in the door.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', padding: 4, marginLeft: 16, flexShrink: 0, minHeight: 'auto' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: '#888', fontSize: 14, fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
            Finding your connections at {company.name}...
          </div>
        )}

        {/* Members */}
        {!loading && members.length > 0 && (
          <div style={{ padding: '8px 0' }}>
            {members.map(m => {
              const firstName = m.first_name || m.full_name?.split(' ')[0] || '';
              const lastName = m.last_name || m.full_name?.split(' ').slice(1).join(' ') || '';
              const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?';
              const title = m.job_title || m.role_title || m.current_role || 'Professional';
              const isSchoolMatch = schoolWord && (m.school || m.university || '').toLowerCase().includes(schoolWord);
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: 0 }}>
                      {capitalizeName(firstName)} {lastName[0] ? `${lastName[0].toUpperCase()}.` : ''}
                    </p>
                    <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>{title}</p>
                    {isSchoolMatch && <p style={{ fontSize: 11, color: '#E85D20', margin: '2px 0 0' }}>🎓 {user?.school || 'Your school'} alumni</p>}
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{getAvailabilityLabel(m.intro_availability)}</p>
                    {m.linkedin_url && (
                      <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#0077B5', textDecoration: 'none', marginTop: 2, display: 'inline-block' }}>
                        View LinkedIn →
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenComposer(m); }}
                    style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto' }}
                  >
                    Send a Message →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && members.length === 0 && (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: '#888', fontSize: 14 }}>
            <p style={{ margin: '0 0 8px' }}>We couldn't find specific members at {company.name}.</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#aaa' }}>The connection count may reflect a recent join — check back shortly.</p>
            <button onClick={onClose} style={{ color: '#E85D20', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>Browse the full directory →</button>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F5F5F5', textAlign: 'center' }}>
          <button
            onClick={() => { onClose(); onTabChange?.('directory'); }}
            style={{ color: '#E85D20', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
          >
            See full directory filtered by {company.name} →
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: "You've been invited to join College Fast Forward",
        body: `Hi,\n\nA student thought you might be a great addition to College Fast Forward — a network connecting college students with parents and alumni for career guidance.\n\nJoin here: ${window.location.origin}\n\n— The CFF Team`,
      });
      setSent(true);
    } catch (e) {
      console.error('Invite send failed:', e);
    }
    setSending(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 6 }}>Invite someone to CFF</p>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>Enter their email and we'll send them an invitation to join College Fast Forward.</p>
        {sent ? (
          <p style={{ fontSize: 14, color: '#22C55E', fontWeight: 600, textAlign: 'center' }}>✓ Invitation sent!</p>
        ) : (
          <>
            <input type="email" placeholder="their@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <button onClick={handleSend} disabled={!email.trim() || sending}
              style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!email.trim() || sending) ? 0.6 : 1, minHeight: 'auto' }}>
              {sending ? 'Sending...' : 'Send Invitation →'}
            </button>
          </>
        )}
        <button onClick={onClose} style={{ marginTop: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999', minHeight: 'auto' }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({ member, user, onOpenComposer }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
        {getInitials(member.first_name, member.last_name)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: 0 }}>
          {capitalizeName(member.first_name)} {member.last_name?.[0] ? `${member.last_name[0].toUpperCase()}.` : ''}
        </p>
        <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>
          {member.job_title || 'Professional'}{member.company_name ? ` · ${member.company_name}` : ''}
        </p>
        {member.school_match && (
          <p style={{ fontSize: 11, color: '#E85D20', margin: '2px 0 0' }}>🎓 {user?.school || 'Your school'} connection</p>
        )}
        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{getAvailabilityLabel(member.intro_availability)}</p>
      </div>
      <button onClick={() => onOpenComposer(member)}
        style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto' }}>
        Send a Message →
      </button>
    </div>
  );
}

// ─── Company Intel Modal ─────────────────────────────────────────────────────
const intelMobileStyles = `
  @media (max-width: 640px) {
    .cff-intel-overlay { align-items: flex-end !important; padding: 0 !important; }
    .cff-intel-card { border-radius: 16px 16px 0 0 !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; max-width: 100% !important; max-height: 90vh !important; }
  }
`;

function CompanyIntelModal({ company, user, onClose, onOpenContacts, isFastIQ, onOpenUpgrade }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Check cache first
        const cached = await base44.entities.CompanyIntelCache.filter(
          { company_name: company.name }, '-updated_date', 1
        );
        const record = cached?.[0];
        if (record && record.expires_at && new Date(record.expires_at) > new Date()) {
          // Normalize cache record to display shape
          if (!cancelled) setIntel({
            hiring_signal: record.hiring_signal,
            hiring_score: record.hiring_score,
            intel_summary: record.intel_summary || record.recommendation_text || '',
            open_roles_categories: Array.isArray(record.open_roles_categories) ? record.open_roles_categories : [],
            culture_insight: record.recommendation_text || '',
            warning_signals: Array.isArray(record.warning_signals) ? record.warning_signals : [],
            similar_companies: Array.isArray(record.similar_companies) ? record.similar_companies : [],
          });
          if (!cancelled) setLoading(false);
          return;
        }
        // Fetch fresh via LLM
        const fresh = await base44.integrations.Core.InvokeLLM({
          prompt: `Research ${company.name} as a potential employer for an entry-level candidate in ${company.industry || 'their field'}. Provide: 1) current hiring status 2) a short description of what's happening now (2-3 sentences) 3) open role categories as a flat string array 4) one culture insight for new grads 5) any warning signals such as layoffs, hiring freeze, or financial trouble as a flat string array 6) 2-3 similar companies as a flat string array 7) a hiring score 0-100.`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              hiring_signal: { type: 'string', enum: ['hot', 'warm', 'cool'] },
              hiring_score: { type: 'number' },
              intel_summary: { type: 'string' },
              open_roles_categories: { type: 'array', items: { type: 'string' } },
              culture_insight: { type: 'string' },
              warning_signals: { type: 'array', items: { type: 'string' } },
              similar_companies: { type: 'array', items: { type: 'string' } },
            },
          },
        });
        console.log('Intel LLM response:', JSON.stringify(fresh).substring(0, 300));
        // Normalize to display shape
        const normalized = {
          hiring_signal: fresh.hiring_signal || company.hiring_signal || 'warm',
          hiring_score: fresh.hiring_score || null,
          intel_summary: fresh.intel_summary || company.hiring_description || '',
          open_roles_categories: Array.isArray(fresh.open_roles_categories) ? fresh.open_roles_categories : [],
          culture_insight: fresh.culture_insight || '',
          warning_signals: Array.isArray(fresh.warning_signals) ? fresh.warning_signals : [],
          similar_companies: Array.isArray(fresh.similar_companies) ? fresh.similar_companies : [],
        };
        if (!cancelled) setIntel(normalized);
        // Cache asynchronously — don't block display
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const cachePayload = {
          company_name: company.name,
          hiring_signal: normalized.hiring_signal,
          hiring_score: normalized.hiring_score,
          intel_summary: normalized.intel_summary,
          open_roles_categories: normalized.open_roles_categories,
          recommendation_text: normalized.culture_insight,
          warning_signals: normalized.warning_signals,
          similar_companies: normalized.similar_companies,
          expires_at: expires,
        };
        if (record) {
          base44.entities.CompanyIntelCache.update(record.id, cachePayload).catch(() => {});
        } else {
          base44.entities.CompanyIntelCache.create(cachePayload).catch(() => {});
        }
      } catch (e) {
        console.warn('Intel load failed:', e);
        if (!cancelled) setIntel({
          hiring_signal: company.hiring_signal || 'warm',
          hiring_score: null,
          intel_summary: company.hiring_description || 'Unable to load intel at this time.',
          open_roles_categories: [],
          culture_insight: '',
          warning_signals: [],
          similar_companies: [],
        });
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [company.name]);

  const sigColor = { hot: '#22C55E', warm: '#F59E0B', cool: '#EF4444' }[intel?.hiring_signal] || '#888';
  const sigLabel = { hot: 'Actively Hiring', warm: 'Selective Hiring', cool: 'Limited Openings' }[intel?.hiring_signal] || 'Checking...';
  const warnings = Array.isArray(intel?.warning_signals) ? intel.warning_signals : [];
  const similar = Array.isArray(intel?.similar_companies) ? intel.similar_companies : [];
  const roles = Array.isArray(intel?.open_roles_categories) ? intel.open_roles_categories : [];
  const hasConnections = (company.cff_parent_count || 0) + (company.school_alumni_count || 0) > 0;

  return (
    <>
      <style>{intelMobileStyles}</style>
      <div className="cff-intel-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20 }} onClick={onClose}>
        <div className="cff-intel-card" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 24px 16px', borderBottom: '1px solid #F5F5F5', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{company.name}</p>
              {company.industry && <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>{company.industry}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {intel && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: sigColor }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sigColor, display: 'inline-block', flexShrink: 0 }} />
                  {sigLabel}
                </span>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', minHeight: 'auto', minWidth: 'auto', padding: 4 }}>✕</button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <p style={{ fontSize: 14, margin: 0 }}>FastIQ is researching {company.name}...</p>
            </div>
          )}

          {/* Content */}
          {!loading && intel && (
            <div style={{ flex: 1 }}>
              {/* Score bar */}
              {intel.hiring_score > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>HIRING SIGNAL SCORE</p>
                  <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${intel.hiring_score}%`, background: sigColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#888', textAlign: 'right', margin: 0 }}>{intel.hiring_score}/100</p>
                </div>
              )}
              {/* Description */}
              {intel.intel_summary && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>WHAT'S HAPPENING NOW</p>
                  <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 }}>{intel.intel_summary}</p>
                </div>
              )}
              {/* Open roles */}
              {roles.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>OPEN ROLE CATEGORIES</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {roles.map((r, i) => (
                      <span key={i} style={{ background: '#F5F5F5', color: '#333', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Culture insight */}
              {intel.culture_insight && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>CULTURE INSIGHTS</p>
                  <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 }}>{intel.recommendation_text || intel.culture_insight}</p>
                </div>
              )}
              {/* Warnings */}
              {warnings.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', letterSpacing: '0.15em', margin: '0 0 8px' }}>⚠ WARNING SIGNALS</p>
                  {warnings.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#EF4444', borderLeft: '2px solid #EF4444', paddingLeft: 10, marginBottom: 6 }}>{w.text || w}</div>
                  ))}
                </div>
              )}
              {/* CFF Network */}
              {hasConnections && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9', background: '#FFF8F5' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>CFF NETWORK</p>
                  <p style={{ fontSize: 14, color: '#E85D20', fontWeight: 600, margin: '0 0 8px' }}>
                    🤝 {(company.cff_parent_count || 0) + (company.school_alumni_count || 0)} CFF {company.connection_type === 'alumni' ? 'alumni' : 'members'} work here
                  </p>
                  {(isFastIQ || true) && (
                    <button onClick={() => { onClose(); onOpenContacts(company); }}
                      style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
                      See Who to Contact →
                    </button>
                  )}
                </div>
              )}
              {/* Similar companies */}
              {similar.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F9F9F9' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', margin: '0 0 8px' }}>SIMILAR COMPANIES TO CONSIDER</p>
                  <p style={{ fontSize: 13, color: '#666' }}>{similar.map(s => s.name || s).join(' · ')}</p>
                </div>
              )}
              {/* Upgrade prompt */}
              {!isFastIQ && (
                <div style={{ margin: 16, background: '#F9F9F9', border: '1px solid #E5E5E5', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 10px' }}>Want FastIQ to find alumni at {company.name} and write your outreach message?</p>
                  <button onClick={onOpenUpgrade} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Unlock FastIQ →</button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '12px 24px', borderTop: '1px solid #F5F5F5', textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: '#BBB', fontStyle: 'italic' }}>Updated every 24 hours</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────
function CompanyCard({ company, user, onViewIntel, isFastIQ, onOpenUpgrade, onSeeContacts }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const hasConnections = (company.cff_parent_count || 0) + (company.school_alumni_count || 0) > 0;
  const sig = company.hiring_signal === 'hot' ? { emoji: '🟢', label: 'Actively Hiring' }
    : company.hiring_signal === 'warm' ? { emoji: '🟡', label: 'Selective' } : null;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderLeft: hasConnections ? '3px solid #E85D20' : '3px solid #D0D0D0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: 0 }}>{company.name}</p>
          {company.industry && <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{company.industry}</p>}
        </div>
        {sig && <span style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', paddingTop: 2 }}>{sig.emoji} {sig.label}</span>}
      </div>

      {company.hiring_description && (
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, margin: 0 }}>{company.hiring_description}</p>
      )}

      {hasConnections ? (
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {company.cff_parent_count > 0 && (
            <p style={{ fontSize: 12, color: '#E85D20', margin: 0 }}>
              🤝 {company.cff_parent_count} CFF parent{company.cff_parent_count > 1 ? 's' : ''} work here
              {company.open_to_intro_count > 0 && ` — ${company.open_to_intro_count} open to intros`}
            </p>
          )}
          {company.school_alumni_count > 0 && (
            <p style={{ fontSize: 12, color: '#4F8CFF', margin: 0 }}>
              🎓 {company.school_alumni_count} {user?.school || 'your school'} alumni in the network
            </p>
          )}
        </div>
      ) : (
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '8px 0' }}>
          <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px', fontStyle: 'italic' }}>
            👤 No CFF connections yet — be the first to build a path here.
          </p>
          <button onClick={() => setShowInviteModal(true)}
            style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>
            Know someone who works here? Invite them to CFF →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 2 }}>
        <button onClick={() => onViewIntel?.(company)}
          style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>
          View Full Intel →
        </button>
        {hasConnections && (
          <button
            onClick={() => isFastIQ ? onSeeContacts(company) : onOpenUpgrade?.()}
            style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
          >
            {isFastIQ ? 'See Who to Contact →' : '🔒 See Who to Contact →'}
          </button>
        )}
      </div>

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AICompanyCards({
  companies, members = [], loading, searching, error, noIndustry,
  onRefetch, onTabChange, onOpenUpgrade,
  isFastIQ, user, weeklyNewCount, dark = true,
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [contactsCompany, setContactsCompany] = useState(null);
  const [intelCompany, setIntelCompany] = useState(null);

  const role = user?.career_goals?.role || user?.target_role || '';
  const primaryIndustry = user?.career_goals?.industries?.[0] || user?.target_industries?.[0] || 'your field';

  if (loading) {
    return <FastIQSearchingAnimation role={role} industries={user?.career_goals?.industries || user?.target_industries} user={user} />;
  }

  if (noIndustry) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: dark ? '#fff' : '#1A1A1A', marginBottom: 8 }}>We need a bit more to find the right matches.</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: dark ? '#888' : '#666', marginBottom: 20, lineHeight: 1.6 }}>Tell us what industry you're interested in and we'll find companies with CFF connections in your field.</p>
        <button onClick={() => onTabChange?.('career_goals')}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Update Career Goals →
        </button>
      </div>
    );
  }

  const sortedMembers = sortMembers(members);
  const sortedCompanies = sortCompanies(companies || []);
  const hasMembers = sortedMembers.length > 0;
  const hasCompanies = sortedCompanies.length > 0;

  if (!hasMembers && !hasCompanies && !error) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 12 }}>FastIQ is still searching — check back shortly.</p>
        <button onClick={onRefetch} className="flex items-center gap-2 mx-auto text-[#E85D20] font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, minHeight: 'auto' }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 12 }}>No company data available right now. Try again shortly.</p>
        <button onClick={onRefetch} className="flex items-center gap-2 mx-auto text-[#E85D20] font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, minHeight: 'auto' }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Retry
        </button>
      </div>
    );
  }

  const wrapStyle = dark ? { background: '#111', borderRadius: 12, padding: 20 } : {};
  const summaryText = getResultsSummary(sortedMembers, sortedCompanies, user?.career_goals || {});

  return (
    <div style={wrapStyle}>
      {/* Dynamic summary line */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: dark ? '#aaa' : '#666', marginBottom: 24, lineHeight: 1.5 }}>
        {summaryText}
      </p>

      {/* SECTION 1 — PEOPLE WHO CAN HELP */}
      {hasMembers && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
            PEOPLE WHO CAN HELP
          </p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: dark ? '#fff' : '#1A1A1A', margin: '0 0 4px' }}>
            CFF members in {primaryIndustry} — reach out directly.
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: dark ? '#888' : '#999', margin: '0 0 12px', lineHeight: 1.5 }}>
            These professionals joined CFF specifically to help students like you. One conversation could open a door.
          </p>

          <div style={{ background: dark ? '#1a1a1a' : '#fff', borderRadius: 12, border: `1px solid ${dark ? '#2A2A2A' : '#E5E5E5'}`, borderLeft: '3px solid #E85D20', padding: '4px 16px 0' }}>
            {sortedMembers.slice(0, 6).map(member => (
              <PersonCard key={member.id} member={member} user={user} onOpenComposer={setSelectedMember} />
            ))}
          </div>

          {sortedMembers.length > 6 && (
            <button onClick={() => onTabChange?.('directory')}
              style={{ display: 'block', textAlign: 'center', color: '#E85D20', fontSize: 13, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: '100%' }}>
              See all {sortedMembers.length} CFF members in {primaryIndustry} →
            </button>
          )}
        </div>
      )}

      {/* SECTION 2 — COMPANIES ACTIVELY HIRING */}
      {hasCompanies && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
            COMPANIES ACTIVELY HIRING RIGHT NOW
          </p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: dark ? '#fff' : '#1A1A1A', margin: '0 0 4px' }}>
            FastIQ found {sortedCompanies.length} compan{sortedCompanies.length > 1 ? 'ies' : 'y'} hiring {role || 'in your field'} right now.
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: dark ? '#888' : '#999', margin: '0 0 12px', lineHeight: 1.5 }}>
            Updated every 24 hours. The more specific your goals, the better the matches.
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {sortedCompanies.map(c => (
              <CompanyCard
                key={c.name}
                company={c}
                user={user}
                onViewIntel={setIntelCompany}
                isFastIQ={isFastIQ}
                onOpenUpgrade={onOpenUpgrade}
                onSeeContacts={setContactsCompany}
              />
            ))}
          </div>
        </div>
      )}

      {weeklyNewCount != null && weeklyNewCount > 0 && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: dark ? '#444' : '#aaa', marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
          <strong style={{ color: '#E85D20' }}>{weeklyNewCount} new connection{weeklyNewCount !== 1 ? 's' : ''}</strong> added to the network this week.
        </p>
      )}

      {/* Message Composer Modal */}
      {selectedMember && (
        <ParentMessageComposer
          user={user}
          parent={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSent={() => setSelectedMember(null)}
        />
      )}

      {/* Company Intel Modal */}
      {intelCompany && (
        <CompanyIntelModal
          company={intelCompany}
          user={user}
          isFastIQ={isFastIQ}
          onOpenUpgrade={onOpenUpgrade}
          onClose={() => setIntelCompany(null)}
          onOpenContacts={(c) => { setIntelCompany(null); setContactsCompany(c); }}
        />
      )}

      {/* Company Contacts Modal */}
      {contactsCompany && (
        <CompanyContactsModal
          company={contactsCompany}
          user={user}
          onClose={() => setContactsCompany(null)}
          onOpenComposer={(member) => setSelectedMember(member)}
          onTabChange={onTabChange}
        />
      )}
    </div>
  );
}