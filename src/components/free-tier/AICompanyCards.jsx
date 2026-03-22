import React from 'react';
import { RefreshCw } from 'lucide-react';

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

function TierCard({ company, tier, user, onTabChange, onOpenUpgrade, isFastIQ }) {
  const school = user?.school || user?.university || 'your school';
  const sig = SIGNAL_LABEL[company.hiring_signal];
  const borderColor = tier === 1 ? '#E85D20' : tier === 2 ? '#4F8CFF' : '#D0D0D0';

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
          <p style={{ fontSize: 12, color: '#999', margin: 0, fontStyle: 'italic' }}>
            👤 No CFF connections yet — be the first {school} student to build a path here.
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
              style={{ fontSize: 12, color: '#4F8CFF', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              See Who to Contact →
            </button>
          ) : (
            <button
              onClick={() => onOpenUpgrade?.()}
              style={{ fontSize: 12, color: '#4F8CFF', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              🔒 See Who to Contact →
            </button>
          )
        )}
      </div>
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
  companies, loading, error, noIndustry,
  onRefetch, onTabChange, onOpenUpgrade,
  isFastIQ, user, weeklyNewCount, dark = true,
}) {
  const role = user?.career_goals?.role || user?.target_role || '';

  if (loading) {
    return (
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: dark ? '#999' : '#666', marginBottom: 12 }}>
          {role ? `FastIQ is searching for ${role} opportunities right now...` : 'FastIQ is finding companies that match your goals...'}
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
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

  const tier1 = companies.filter(c => c.tier === 1);
  const tier2 = companies.filter(c => c.tier === 2);
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
    </div>
  );
}