import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const SIGNAL_CONFIG = {
  hot:     { emoji: '🟢', label: 'Actively Hiring' },
  warm:    { emoji: '🟡', label: 'Selective' },
  cool:    { emoji: '🔴', label: 'Freeze' },
  unknown: { emoji: '⚪', label: 'Signal Unknown' },
};

const WARM_PATH_BADGE = {
  very_strong: { label: '🤝 Very Strong Warm Path', bg: '#14532D', color: '#fff' },
  strong:      { label: '🤝 Warm Path Available',   bg: '#1A3A1A', color: '#4ADE80' },
  moderate:    { label: '🤝 CFF Connection',         bg: '#1c2b1c', color: '#86efac' },
  none:        { label: '📊 No CFF connections yet', bg: '#1e1e1e', color: '#888' },
};

const WARM_PATH_BADGE_LIGHT = {
  very_strong: { label: '🤝 Very Strong Warm Path', bg: '#DCFCE7', color: '#14532D' },
  strong:      { label: '🤝 Warm Path Available',   bg: '#F0FFF4', color: '#16A34A' },
  moderate:    { label: '🤝 CFF Connection',         bg: '#F0FFF4', color: '#15803D' },
  none:        { label: '📊 No CFF connections yet', bg: '#F5F5F5', color: '#888' },
};

function SkeletonCard({ dark }) {
  const bg = dark ? '#2A2A2A' : '#E5E5E5';
  const cardBg = dark ? '#1A1A1A' : '#F5F5F5';
  return (
    <div style={{ background: cardBg, border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 16 }}>
      <div style={{ background: bg, borderRadius: 6, height: 18, width: '55%', marginBottom: 10 }} />
      <div style={{ background: bg, borderRadius: 100, height: 22, width: '45%', marginBottom: 10 }} />
      <div style={{ background: bg, borderRadius: 4, height: 12, width: '90%', marginBottom: 6 }} />
      <div style={{ background: bg, borderRadius: 4, height: 12, width: '70%' }} />
    </div>
  );
}

function ConnectionLine({ company, school, dark }) {
  const textColor = dark ? '#E85D20' : '#C2440F';
  const lines = [];

  if (company.alumni_count > 0 && company.school_match) {
    lines.push(`🟠 ${company.alumni_count} ${school || 'school'} alumni work here`);
  } else if (company.cff_connection_count > 0 && company.connection_type === 'alumni') {
    lines.push(`🟠 ${company.cff_connection_count} CFF alumni work here`);
  }

  if (company.connection_type === 'parent' || company.connection_type === 'both') {
    const parentCount = company.connection_type === 'both'
      ? company.cff_connection_count - (company.alumni_count || 0)
      : company.cff_connection_count;
    const introText = company.open_to_intro ? ` — open to introductions` : '';
    if (parentCount > 0) {
      lines.push(`🟠 ${parentCount} CFF parent${parentCount > 1 ? 's' : ''}${introText}`);
    }
  }

  if (lines.length === 0) return null;

  return (
    <div style={{ borderTop: `1px solid ${dark ? '#2A2A2A' : '#E5E5E5'}`, borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E5E5E5'}`, margin: '10px 0', padding: '8px 0' }}>
      {lines.map((line, i) => (
        <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: textColor, margin: '2px 0', lineHeight: 1.5 }}>{line}</p>
      ))}
    </div>
  );
}

function CompanyCard({ company, onTabChange, onOpenUpgrade, isFastIQ, user, dark }) {
  const cardBg     = dark ? '#1A1A1A' : '#ffffff';
  const cardBorder = dark ? '#2A2A2A' : '#E0E0E0';
  const nameColor  = dark ? '#ffffff' : '#1A1A1A';
  const descColor  = dark ? '#888888' : '#666666';
  const whyColor   = dark ? '#999999' : '#888888';
  const school = user?.school || user?.university || 'your school';
  const hasCFF = company.cff_connection_count > 0;
  const warmStrength = company.warm_path_strength || 'none';
  const badgeCfg = (dark ? WARM_PATH_BADGE : WARM_PATH_BADGE_LIGHT)[warmStrength];
  const sig = SIGNAL_CONFIG[company.hiring_signal] || SIGNAL_CONFIG.warm;
  const borderColor = hasCFF ? '#E85D20' : cardBorder;

  const handleWarmPathClick = () => {
    if (isFastIQ) onTabChange?.('company_intel');
    else onOpenUpgrade?.();
  };

  return (
    <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 16, position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Warm path badge */}
      <button
        onClick={hasCFF ? handleWarmPathClick : undefined}
        style={{
          alignSelf: 'flex-start',
          background: badgeCfg.bg, color: badgeCfg.color,
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
          border: 'none', cursor: hasCFF ? 'pointer' : 'default',
          minHeight: 'auto', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {badgeCfg.label}
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 700, color: nameColor, fontSize: 15, margin: 0 }}>{company.name}</h3>
          {company.industry && (
            <p style={{ fontSize: 11, color: whyColor, margin: '2px 0 0' }}>{company.industry}</p>
          )}
        </div>
        {company.hiring_signal && company.hiring_signal !== 'unknown' && (
          <span style={{ fontSize: 11, color: whyColor, whiteSpace: 'nowrap', paddingTop: 2 }}>
            {sig.emoji} {sig.label}
          </span>
        )}
      </div>

      {company.hiring_description && (
        <p style={{ fontSize: 12, color: descColor, lineHeight: 1.5, margin: 0 }}>{company.hiring_description}</p>
      )}

      <ConnectionLine company={company} school={school} dark={dark} />

      {company.why_recommended && (
        <p style={{ fontSize: 11, fontStyle: 'italic', color: dark ? '#E85D20' : '#C2440F', margin: 0, lineHeight: 1.5 }}>
          {company.why_recommended}
        </p>
      )}

      <button
        onClick={() => onTabChange?.('company_intel')}
        style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0 0', textAlign: 'left' }}
      >
        View Full Intel →
      </button>
    </div>
  );
}

export default function AICompanyCards({ companies, loading, error, noIndustry, onRefetch, onTabChange, onOpenUpgrade, isFastIQ, user, weeklyNewCount, dark = true }) {
  const role = user?.career_goals?.role || user?.target_role || '';
  const loadingMessage = role
    ? `FastIQ is searching for ${role} opportunities right now...`
    : 'FastIQ is finding companies that match your goals...';
  const school = user?.school || user?.university || 'your school';
  const isAnyFallback = companies?.every(c => c.gap_fill || c.is_fallback);

  if (loading) {
    return (
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 12 }}>
          {loadingMessage}
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <SkeletonCard dark={dark} /><SkeletonCard dark={dark} /><SkeletonCard dark={dark} />
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

  return (
    <div>
      {isAnyFallback && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontStyle: 'italic', color: '#999', marginBottom: 12 }}>
          Showing general results for your industries — personalized AI matches coming soon.
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {companies.slice(0, 3).map(company => (
          <CompanyCard
            key={company.name}
            company={company}
            onTabChange={onTabChange}
            onOpenUpgrade={onOpenUpgrade}
            isFastIQ={isFastIQ}
            user={user}
            dark={dark}
          />
        ))}
      </div>

      {/* Network growth message */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: dark ? '#555' : '#999', marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
        Every parent who joins CFF expands the warm path possibilities for every student.
        {weeklyNewCount != null && weeklyNewCount > 0 && (
          <> <strong style={{ color: '#E85D20' }}>{weeklyNewCount} new connection{weeklyNewCount !== 1 ? 's' : ''}</strong> added to the network this week.</>
        )}
      </p>
    </div>
  );
}