import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

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
  const size = user?.career_goals?.company_size_preference?.[0] || 'large';
  const sizeLabel = size === 'startup' ? 'startup' : size === 'mid' ? 'mid-size' : 'large';
  const roleLabel = role || industries?.[0] || 'your field';

  const searchTerms = [
    `Searching for ${roleLabel} opportunities in ${location}...`,
    `Checking hiring signals at ${sizeLabel} companies...`,
    'Cross-referencing CFF network connections...',
    'Building your personalized results...',
  ];
  const [currentTerm, setCurrentTerm] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTerm(prev => prev < searchTerms.length - 1 ? prev + 1 : prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{searchingStyles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 16 }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div className="fastiq-orb-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(232,93,32,0.15)' }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
        </div>
        <p key={currentTerm} className="fastiq-search-text" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', textAlign: 'center', minHeight: 20, margin: 0 }}>
          {searchTerms[currentTerm]}
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

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 12, padding: 16 }}>
      <div style={{ background: '#E5E5E5', borderRadius: 6, height: 18, width: '55%', marginBottom: 10 }} />
      <div style={{ background: '#E5E5E5', borderRadius: 4, height: 12, width: '90%', marginBottom: 6 }} />
      <div style={{ background: '#E5E5E5', borderRadius: 4, height: 12, width: '70%' }} />
    </div>
  );
}

const SIGNAL_LABEL = {
  hot: { emoji: '🟢', label: 'Actively Hiring' },
  warm: { emoji: '🟡', label: 'Selective' },
  cool: { emoji: '🔴', label: 'Freeze' },
  unknown: null,
};

function isRelevantEmployer(company, studentRole) {
  const roleLower = studentRole?.toLowerCase() || '';
  const companyLower = company.name?.toLowerCase() || '';
  const industryLower = company.industry?.toLowerCase() || '';
  const isHealthcareRole = ['nurs', 'doctor', 'physician', 'therapist',
    'medical', 'clinical', 'pharma', 'health'].some(k => roleLower.includes(k));
  if (isHealthcareRole) {
    const isSchool = ['school', 'university', 'college', 'academy',
      'institute', 'education', 'district'].some(k =>
        companyLower.includes(k) || industryLower.includes(k));
    if (isSchool) return false;
  }
  return true;
}

function InviteModal({ companyName, onClose }) {
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
        subject: 'You\'ve been invited to join College Fast Forward',
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
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
          Enter their email and we'll send them an invitation to join College Fast Forward.
        </p>
        {sent ? (
          <p style={{ fontSize: 14, color: '#22C55E', fontWeight: 600, textAlign: 'center' }}>✓ Invitation sent!</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="their@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSend}
              disabled={!email.trim() || sending}
              style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!email.trim() || sending) ? 0.6 : 1, minHeight: 'auto' }}
            >
              {sending ? 'Sending...' : 'Send Invitation →'}
            </button>
          </>
        )}
        <button onClick={onClose} style={{ marginTop: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999', minHeight: 'auto' }}>Cancel</button>
      </div>
    </div>
  );
}

function TierCard({ company, tier, user, onTabChange, onOpenUpgrade, isFastIQ }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const school = user?.school || user?.university || 'your school';
  const sig = SIGNAL_LABEL[company.hiring_signal];
  const borderColor = tier === 1 ? '#E85D20' : tier === 2 ? '#E85D20' : '#D0D0D0';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 10,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: 0 }}>{company.name}</p>
          {company.industry && (
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{company.industry}</p>
          )}
        </div>
        {sig && (
          <span style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', paddingTop: 2 }}>
            {sig.emoji} {sig.label}
          </span>
        )}
      </div>

      {/* Hiring description */}
      {company.hiring_description && (
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, margin: 0 }}>{company.hiring_description}</p>
      )}

      {/* CFF Connections block */}
      {(company.cff_parent_count > 0 || company.school_alumni_count > 0) ? (
        <div style={{ borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #F0F0F0', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {company.cff_parent_count > 0 && (
            <p style={{ fontSize: 12, color: '#E85D20', margin: 0 }}>
              🤝 {company.cff_parent_count} CFF parent{company.cff_parent_count > 1 ? 's' : ''} work here
              {company.open_to_intro_count > 0 && ` — ${company.open_to_intro_count} open to intros`}
            </p>
          )}
          {company.school_alumni_count > 0 && (
            <p style={{ fontSize: 12, color: '#4F8CFF', margin: 0 }}>
              🎓 {company.school_alumni_count} {school} alumni in the network
            </p>
          )}
          {company.sample_roles?.length > 0 && (
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
              {company.sample_roles.join(' · ')}
            </p>
          )}
        </div>
      ) : tier === 3 ? (
        <div style={{ borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #F0F0F0', padding: '8px 0' }}>
          <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px', fontStyle: 'italic' }}>
            👤 No CFF connections yet — be the first {school} student to build a path here.
          </p>
          <p style={{ fontSize: 12, color: '#999', margin: 0, fontStyle: 'italic' }}>
            Know someone who works here?{' '}
            <button
              onClick={() => setShowInviteModal(true)}
              style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, fontStyle: 'normal' }}
            >
              Invite them to CFF →
            </button>
          </p>
        </div>
      ) : null}

      {/* Why recommended */}
      {company.why_recommended && (
        <p style={{ fontSize: 11, color: '#C2440F', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
          {company.why_recommended}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 2 }}>
        <button
          onClick={() => onTabChange?.('company_intel')}
          style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
        >
          View Full Intel →
        </button>
        {tier <= 2 && (company.cff_parent_count > 0 || company.school_alumni_count > 0) && (
          isFastIQ ? (
            <button
              onClick={() => onTabChange?.('alumni_network')}
              style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              See Who to Contact →
            </button>
          ) : (
            <button
              onClick={() => onOpenUpgrade?.()}
              style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              🔒 See Who to Contact →
            </button>
          )
        )}
      </div>
      {showInviteModal && <InviteModal companyName={company.name} onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}

function TierSection({ tier, companies, label, subhead, user, onTabChange, onOpenUpgrade, isFastIQ }) {
  if (!companies || companies.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '0 0 12px', lineHeight: 1.5 }}>
        {subhead}
      </p>
      <div className="grid md:grid-cols-3 gap-3">
        {companies.map(c => (
          <TierCard
            key={c.name}
            company={c}
            tier={tier}
            user={user}
            onTabChange={onTabChange}
            onOpenUpgrade={onOpenUpgrade}
            isFastIQ={isFastIQ}
          />
        ))}
      </div>
    </div>
  );
}

function getHeaderCopy(tier1, tier2, tier3, role) {
  const r = role || 'roles in your field';
  if (tier1.length > 0) {
    return `FastIQ found ${tier1.length} compan${tier1.length > 1 ? 'ies' : 'y'} actively hiring ${r}s where someone in the CFF network can open a door.`;
  }
  if (tier2.length > 0) {
    const total = tier2.length;
    return `${total} compan${total > 1 ? 'ies' : 'y'} in your field have CFF network connections.${tier3.length > 0 ? ` Plus ${tier3.length} actively hiring right now.` : ''}`;
  }
  if (tier3.length > 0) {
    return `FastIQ found ${tier3.length} compan${tier3.length > 1 ? 'ies' : 'y'} actively hiring ${r}s right now. No CFF connections yet — but every parent who joins expands your warm path possibilities.`;
  }
  return `FastIQ is searching for ${r} opportunities right now.`;
}

export default function AICompanyCards({
  companies, loading, searching, error, noIndustry,
  onRefetch, onTabChange, onOpenUpgrade,
  isFastIQ, user, weeklyNewCount, dark = true,
}) {
  const role = user?.career_goals?.role || user?.target_role || '';

  if (loading) {
    return (
      <FastIQSearchingAnimation
        role={role}
        industries={user?.career_goals?.industries || user?.target_industries}
        user={user}
      />
    );
  }

  if (noIndustry) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: dark ? '#fff' : '#1A1A1A', marginBottom: 8 }}>
          We need a bit more to find the right matches.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: dark ? '#888' : '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Tell us what industry you're interested in and we'll find companies with CFF connections in your field.
        </p>
        <button
          onClick={() => onTabChange?.('career_goals')}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}
        >
          Update Career Goals →
        </button>
      </div>
    );
  }

  if (error || !companies || companies.length === 0) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 12 }}>
          No company data available right now. Try again shortly.
        </p>
        <button onClick={onRefetch} className="flex items-center gap-2 mx-auto text-[#E85D20] font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, minHeight: 'auto' }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Retry
        </button>
      </div>
    );
  }

  const studentRole = user?.career_goals?.role || user?.target_role || '';
  const tier1 = companies.filter(c => c.tier === 1);
  const tier2 = companies.filter(c => c.tier === 2 && isRelevantEmployer(c, studentRole));
  const tier3 = companies.filter(c => c.tier === 3);

  const headerCopy = getHeaderCopy(tier1, tier2, tier3, role);

  const wrapStyle = dark
    ? { background: '#111', borderRadius: 12, padding: 20 }
    : {};

  return (
    <div style={wrapStyle}>
      {/* Dynamic header */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: dark ? '#aaa' : '#666', marginBottom: 20, lineHeight: 1.5 }}>
        {headerCopy}
      </p>

      <TierSection
        tier={1}
        companies={tier1}
        label="YOUR STRONGEST OPPORTUNITIES"
        subhead="Actively hiring AND someone in the network can open the door."
        user={user}
        onTabChange={onTabChange}
        onOpenUpgrade={onOpenUpgrade}
        isFastIQ={isFastIQ}
      />
      <TierSection
        tier={2}
        companies={tier2}
        label="WARM PATHS IN YOUR FIELD"
        subhead="People in the CFF network work here. A conversation could open the door."
        user={user}
        onTabChange={onTabChange}
        onOpenUpgrade={onOpenUpgrade}
        isFastIQ={isFastIQ}
      />
      <TierSection
        tier={3}
        companies={tier3}
        label="ACTIVELY HIRING RIGHT NOW"
        subhead="No CFF connections yet — but the opportunity is real. Be the first to build a path here."
        user={user}
        onTabChange={onTabChange}
        onOpenUpgrade={onOpenUpgrade}
        isFastIQ={isFastIQ}
      />

      {weeklyNewCount != null && weeklyNewCount > 0 && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: dark ? '#444' : '#aaa', marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
          <strong style={{ color: '#E85D20' }}>{weeklyNewCount} new connection{weeklyNewCount !== 1 ? 's' : ''}</strong> added to the network this week.
        </p>
      )}
      {searching && (
        <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 8 }}>
          ⚡ FastIQ is finding personalized matches — results may update shortly.
        </p>
      )}
    </div>
  );
}