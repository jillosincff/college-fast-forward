import React, { useState } from 'react';
import { Plus } from 'lucide-react';

function guessDomain(name) {
  if (!name) return null;
  const map = {
    'apple': 'apple.com', 'google': 'google.com', 'microsoft': 'microsoft.com',
    'amazon': 'amazon.com', 'meta': 'meta.com', 'nvidia': 'nvidia.com',
    'tesla': 'tesla.com', 'netflix': 'netflix.com', 'salesforce': 'salesforce.com',
    'jpmorgan': 'jpmorgan.com', 'goldman sachs': 'goldmansachs.com',
    'morgan stanley': 'morganstanley.com', 'disney': 'disney.com',
    'boeing': 'boeing.com', 'lockheed martin': 'lockheedmartin.com',
    'deloitte': 'deloitte.com', 'mckinsey': 'mckinsey.com',
    'spacex': 'spacex.com', 'ibm': 'ibm.com',
  };
  const lower = name.toLowerCase();
  if (map[lower]) return map[lower];
  return lower.replace(/[^a-z0-9]/g, '') + '.com';
}

function CompanyInitial({ name }) {
  const letter = (name || '?')[0].toUpperCase();
  const colors = ['#0021A5','#FA4616','#8B5CF6','#10B981','#EAB308','#06B6D4'];
  const colorIdx = (name || '').charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8, background: colors[colorIdx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: '#fff',
    }}>{letter}</div>
  );
}

function CompanyRow({ name, intel, alumniCount, onOpenChat, delay }) {
  const domain = guessDomain(name);
  const [logoErr, setLogoErr] = useState(false);
  const researched = !!intel;

  const signal = intel?.hiring_signal;
  let borderColor = '#E2E8F0';
  let glowShadow = 'none';
  let statusColor = '#94A3B8';
  let statusBg = '#F1F5F9';
  let statusLabel = '';

  if (researched) {
    if (signal === 'hot') {
      borderColor = '#F97316';
      glowShadow = '0 0 12px rgba(249,115,22,0.15)';
      statusColor = '#EA580C';
      statusBg = '#FFF7ED';
      statusLabel = '🔥 Hot';
    } else if (signal === 'warm') {
      borderColor = '#EAB308';
      glowShadow = '0 0 8px rgba(234,179,8,0.10)';
      statusColor = '#CA8A04';
      statusBg = '#FEFCE8';
      statusLabel = '🟡 Warm';
    } else {
      borderColor = '#3B82F6';
      glowShadow = 'none';
      statusColor = '#2563EB';
      statusBg = '#EFF6FF';
      statusLabel = '🔵 Cool';
    }
  }

  return (
    <div
      className={`fiq-animate fiq-delay-${delay}`}
      style={{
        padding: '14px 16px',
        background: researched ? '#fff' : '#FAFBFC',
        borderRadius: 12,
        border: researched ? `1.5px solid ${borderColor}` : '1.5px dashed #CBD5E1',
        borderLeft: researched ? `4px solid ${borderColor}` : '4px dashed #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.25s',
        boxShadow: glowShadow,
        opacity: researched ? 1 : 0.9,
      }}
    >
      {/* Logo */}
      <div style={{ flexShrink: 0 }}>
        {domain && !logoErr ? (
          <img src={`https://logo.clearbit.com/${domain}`} alt="" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 6 }} onError={() => setLogoErr(true)} />
        ) : (
          <CompanyInitial name={name} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{name}</span>
          {/* 7. NVIDIA URGENCY: "Not yet scanned" label for unresearched */}
          {!researched && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', fontStyle: 'italic' }}>
              Not yet scanned
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          {researched && statusLabel && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: statusColor,
              background: statusBg, padding: '2px 8px', borderRadius: 6,
            }}>{statusLabel}</span>
          )}
          {alumniCount > 0 && (
            <span style={{ fontSize: 10, color: '#64748B' }}>
              {alumniCount} alumni
            </span>
          )}
          {researched && ((intel?.entry_level_roles_count > 0 || intel?.intern_roles_count > 0) ? (
            <span style={{ fontSize: 10, color: '#64748B' }}>
              {(intel.entry_level_roles_count || 0) + (intel.intern_roles_count || 0)} entry-level{intel.open_roles_count ? ` (${intel.open_roles_count} total)` : ''}
            </span>
          ) : intel?.open_roles_count > 0 ? (
            <span style={{ fontSize: 10, color: '#64748B' }}>
              {intel.open_roles_count} roles
            </span>
          ) : null)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {!researched ? (
          /* 7. NVIDIA URGENCY: Larger, glowing orange Research button + pulsing dot */
          <button
            onClick={() => onOpenChat(`Research ${name} hiring`)}
            style={{
              fontSize: 12, fontWeight: 700, color: '#fff',
              background: '#FA4616', padding: '8px 18px',
              borderRadius: 8, border: 'none', cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 0 14px rgba(250,70,22,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#fff',
              display: 'inline-block', animation: 'fiq-pulse-ring 2s ease-out infinite',
            }} />
            Research →
          </button>
        ) : (
          <>
            {/* 4. TARGET COMPANY ACTIONS: "View X Alumni →" with count */}
            <button
              onClick={() => onOpenChat(`Find UF alumni at ${name}`)}
              style={{
                fontSize: 10, fontWeight: 600, color: '#0021A5',
                background: 'rgba(0,33,165,0.06)', padding: '5px 10px',
                borderRadius: 6, border: 'none', cursor: 'pointer', minHeight: 'auto',
              }}
            >
              View {alumniCount || 0} Alumni →
            </button>
            <button
              onClick={() => onOpenChat(`Research ${name} hiring`)}
              style={{
                fontSize: 10, fontWeight: 600, color: '#64748B',
                background: '#F1F5F9', padding: '5px 10px',
                borderRadius: 6, border: 'none', cursor: 'pointer', minHeight: 'auto',
              }}
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TargetCompaniesSection({ companies, companyIntel, alumniCounts, onOpenChat, onAddTargets }) {
  if (!companies || companies.length === 0) {
    return (
      <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>Target Companies</h2>
        <div style={{
          padding: '28px 20px', background: '#fff', borderRadius: 14,
          border: '1.5px dashed #CBD5E1', textAlign: 'center',
        }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 8, marginBottom: 4 }}>
            Set your target companies
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>
            FASTIQ will monitor hiring, find alumni, and scout opportunities for you
          </p>
          <button
            onClick={onAddTargets}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: '#0021A5', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            + Add Target Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
        }}>Target Companies</h2>
        <button
          onClick={onAddTargets}
          style={{
            fontSize: 11, fontWeight: 700, color: '#0021A5',
            background: 'rgba(0,33,165,0.06)', padding: '6px 14px',
            borderRadius: 8, border: 'none', cursor: 'pointer', minHeight: 'auto',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Plus style={{ width: 12, height: 12 }} /> Edit
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {companies.map((c, i) => (
          <CompanyRow
            key={c}
            name={c}
            intel={companyIntel[c.toLowerCase()]}
            alumniCount={alumniCounts[c.toLowerCase()] || 0}
            onOpenChat={onOpenChat}
            delay={Math.min(i + 5, 7)}
          />
        ))}
      </div>
    </div>
  );
}