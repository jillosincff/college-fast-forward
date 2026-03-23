import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ParentMessageComposer from '@/components/free-tier/ParentMessageComposer';

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

// ─── Company Card ─────────────────────────────────────────────────────────────
function CompanyCard({ company, user, onTabChange }) {
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
        <button onClick={() => onTabChange?.('company_intel')}
          style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>
          View Full Intel →
        </button>
        {hasConnections && (
          <button onClick={() => onTabChange?.('directory')}
            style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>
            See Who to Contact →
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
              <CompanyCard key={c.name} company={c} user={user} onTabChange={onTabChange} />
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
    </div>
  );
}