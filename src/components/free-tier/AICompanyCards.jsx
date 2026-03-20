import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const SIGNAL_CONFIG = {
  hot:  { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-900/40',  text: 'text-green-400' },
  warm: { emoji: '🟡', label: 'Selective',        bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
  cool: { emoji: '🔴', label: 'Freeze',            bg: 'bg-red-900/40',   text: 'text-red-400' },
};

const SIGNAL_CONFIG_LIGHT = {
  hot:  { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100',  text: 'text-green-700' },
  warm: { emoji: '🟡', label: 'Selective',        bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cool: { emoji: '🔴', label: 'Freeze',            bg: 'bg-red-100',   text: 'text-red-700' },
};

function CFFConnectionLine({ cffData, school, dark }) {
  if (!cffData || !cffData.cff_connection_count) return null;
  const { cff_connection_count: count, connection_type, school_match } = cffData;
  const textColor = dark ? '#E85D20' : '#C2440F';

  let text = '';
  if (connection_type === 'alumni' && school_match) {
    text = `${count} alumni from ${school || 'your school'} are in the CFF network here.`;
  } else if (connection_type === 'parent') {
    text = `${count} CFF parent${count > 1 ? 's' : ''} work here and can make introductions.`;
  } else {
    text = `${count} CFF connections here — alumni and parents.`;
  }

  return (
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontStyle: 'italic', color: textColor, margin: '6px 0 0', lineHeight: 1.5 }}>
      🟠 {text}
    </p>
  );
}

function SkeletonCard({ dark }) {
  const bg = dark ? '#2A2A2A' : '#E5E5E5';
  const cardBg = dark ? '#1A1A1A' : '#F5F5F5';
  return (
    <div style={{ background: cardBg, border: `1px solid ${dark ? '#2A2A2A' : '#E0E0E0'}`, borderRadius: 12, padding: 16 }}>
      <div style={{ background: bg, borderRadius: 6, height: 18, width: '55%', marginBottom: 10 }} />
      <div style={{ background: bg, borderRadius: 100, height: 22, width: '40%', marginBottom: 10 }} />
      <div style={{ background: bg, borderRadius: 4, height: 12, width: '90%', marginBottom: 6 }} />
      <div style={{ background: bg, borderRadius: 4, height: 12, width: '70%' }} />
    </div>
  );
}

export default function AICompanyCards({ companies, loading, error, onRefetch, onTabChange, onOpenUpgrade, isFastIQ, user, dark = true }) {
  const cardBg     = dark ? '#1A1A1A' : '#ffffff';
  const cardBorder = dark ? '#2A2A2A' : '#E0E0E0';
  const nameColor  = dark ? '#ffffff' : '#1A1A1A';
  const descColor  = dark ? '#888888' : '#666666';
  const whyColor   = dark ? '#999999' : '#888888';
  const school = user?.school || user?.university || 'your school';

  const sigConfig = dark ? SIGNAL_CONFIG : SIGNAL_CONFIG_LIGHT;

  if (loading) {
    return (
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 12 }}>
          FastIQ is finding companies that match your goals...
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <SkeletonCard dark={dark} /><SkeletonCard dark={dark} /><SkeletonCard dark={dark} />
        </div>
      </div>
    );
  }

  if (error || !companies || companies.length === 0) {
    return (
      <div style={{ background: dark ? '#1A1A1A' : '#F9F9F9', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 12 }}>
          We&apos;re having trouble finding companies right now. Check back in a few minutes.
        </p>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 mx-auto text-[#E85D20] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, minHeight: 'auto' }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} /> Retry
        </button>
      </div>
    );
  }

  const isFallback = companies?.some(c => c.is_fallback);

  const handleWarmPathClick = (companyName) => {
    if (isFastIQ) {
      onTabChange && onTabChange('company_intel');
    } else {
      onOpenUpgrade && onOpenUpgrade();
    }
  };

  return (
    <div>
      {isFallback && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontStyle: 'italic', color: '#999', marginBottom: 12 }}>
          Based on your saved industries — AI-powered matches coming soon.
        </p>
      )}
    <div className="grid md:grid-cols-3 gap-4">
      {companies.slice(0, 3).map(company => {
        const sig = sigConfig[company.hiring_signal] || sigConfig.warm;
        const hasCFF = company.cff_data && company.cff_data.cff_connection_count > 0;

        return (
          <div
            key={company.name}
            style={{ background: cardBg, border: `1px solid ${hasCFF ? '#E85D20' : cardBorder}`, borderRadius: 12, padding: 16, position: 'relative' }}
          >
            {/* Warm Path badge */}
            {hasCFF && (
              <button
                onClick={() => handleWarmPathClick(company.name)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: '#14532D', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                  border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}
                title={isFastIQ ? 'View CFF connections' : 'Unlock FastIQ to see who to contact'}
              >
                🤝 Warm Path Available
              </button>
            )}

            <h3 style={{ fontWeight: 700, color: nameColor, marginBottom: 4, fontSize: 15, paddingRight: hasCFF ? 130 : 0 }}>{company.name}</h3>
            {company.industry && (
              <p style={{ fontSize: 11, color: whyColor, margin: '0 0 8px' }}>{company.industry}</p>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${sig.bg} ${sig.text}`}>
                {sig.emoji} {sig.label}
              </span>
            </div>
            {company.hiring_description && (
              <p style={{ fontSize: 12, color: descColor, marginBottom: 6, lineHeight: 1.5 }}>{company.hiring_description}</p>
            )}
            {company.why_recommended && (
              <p style={{ fontSize: 11, fontStyle: 'italic', color: whyColor, marginBottom: 8, lineHeight: 1.5 }}>{company.why_recommended}</p>
            )}

            <CFFConnectionLine cffData={company.cff_data} school={school} dark={dark} />

            <button
              onClick={() => onTabChange && onTabChange('company_intel')}
              style={{ fontSize: 12, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, marginTop: 10, display: 'block' }}
            >
              View Full Intel
            </button>
          </div>
        );
      })}
    </div>
    </div>
  );
}