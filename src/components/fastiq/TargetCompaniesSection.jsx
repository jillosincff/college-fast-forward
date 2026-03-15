import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getPositionTypeConfig } from './constants';

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

function CompanyRow({ name, intel, alumniCount, onOpenChat, delay, positionType }) {
  const ptConfig = getPositionTypeConfig(positionType);
  const domain = guessDomain(name);
  const [logoErr, setLogoErr] = useState(false);
  const researched = !!intel;

  const signal = intel?.hiring_signal;
  let borderColor = '#E2E8F0';
  let glowShadow = 'none';
  let statusColor = '#64748B';
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
        background: researched ? '#fff' : '#FFFBF5',
        borderRadius: 12,
        border: researched ? `1.5px solid ${borderColor}` : '1.5px dashed #E2C9A6',
        borderLeft: researched ? `4px solid ${borderColor}` : '4px dashed #E2A54A',
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
          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 6 }} onError={() => setLogoErr(true)} />
        ) : (
          <CompanyInitial name={name} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{name}</span>
          {/* Unresearched label */}
          {!researched && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#B45309', fontStyle: 'italic' }}>
              Not yet scanned — let's find your insiders 🔍
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          {researched && statusLabel && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: statusColor,
              background: statusBg, padding: '2px 8px', borderRadius: 6,
            }}>{statusLabel}</span>
          )}
          {!researched && (
            <span style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic' }}>
              UF alumni likely present · recent postings detected
            </span>
          )}
          {alumniCount > 0 && (
            <span style={{ fontSize: 10, color: '#64748B' }}>
              {alumniCount} alumni
            </span>
          )}
          {researched && (() => {
            const entry = intel?.entry_level_roles_count || 0;
            const intern = intel?.intern_roles_count || 0;
            const isIntern = positionType === 'summer_internship' || positionType === 'semester_internship';
            const isEntryLevel = positionType === 'entry_level';
            let relevantCount = entry + intern;
            let relevantLabel = ptConfig.rolesFoundLabel;
            if (isIntern && intern > 0) {
              relevantCount = intern;
              relevantLabel = 'internship' + (intern > 1 ? 's' : '');
            } else if (isEntryLevel && entry > 0) {
              relevantCount = entry;
              relevantLabel = 'new grad role' + (entry > 1 ? 's' : '');
            }
            if (relevantCount > 0) {
              return <span style={{ fontSize: 10, color: '#64748B' }}>{relevantCount} {relevantLabel}</span>;
            }
            if (alumniCount === 0 && !(intel?.open_roles_count > 0)) {
              return <span style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic' }}>No matches yet — many roles open seasonally</span>;
            }
            if (intel?.open_roles_count > 0) {
              return (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#EA580C',
                  background: '#FFF7ED', padding: '2px 10px', borderRadius: 20,
                  border: '1px solid #FDBA74',
                }}>
                  📅 {ptConfig.rolesFoundLabel} open seasonally · {intel.open_roles_count} other role{intel.open_roles_count > 1 ? 's' : ''} posted
                </span>
              );
            }
            return <span style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic' }}>Many roles open seasonally — let's scan now?</span>;
          })()}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {!researched ? (
          <button
            onClick={() => onOpenChat(`Research ${name} hiring`)}
            style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: '#FA4616', padding: '10px 22px',
              borderRadius: 10, border: 'none', cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 0 16px rgba(250,70,22,0.4)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#fff',
              display: 'inline-block', animation: 'fiq-pulse-ring 2s ease-out infinite',
            }} />
            Find Alumni →
          </button>
        ) : (alumniCount === 0 && !(intel?.entry_level_roles_count > 0 || intel?.intern_roles_count > 0)) ? (
          /* 0 alumni + 0 entry-level: helpful guidance instead of dead-end */
          <>
            <button
              onClick={() => onOpenChat(`Find companies similar to ${name} that are hiring`)}
              style={{
                fontSize: 10, fontWeight: 600, color: '#0021A5',
                background: 'rgba(0,33,165,0.06)', padding: '5px 10px',
                borderRadius: 6, border: 'none', cursor: 'pointer', minHeight: 'auto',
              }}
            >
              Find Similar →
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
        ) : (
          <>
            {alumniCount > 0 && (
              <button
                onClick={() => onOpenChat(`Find UF alumni at ${name}`)}
                style={{
                  fontSize: 10, fontWeight: 600, color: '#0021A5',
                  background: 'rgba(0,33,165,0.06)', padding: '5px 10px',
                  borderRadius: 6, border: 'none', cursor: 'pointer', minHeight: 'auto',
                }}
              >
                View {alumniCount} Alumni →
              </button>
            )}
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

export default function TargetCompaniesSection({ companies, companyIntel, alumniCounts, onOpenChat, onAddTargets, positionType }) {
  // FIX 5: Conversational empty state for no target companies
  if (!companies || companies.length === 0) {
    return (
      <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#334155',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>Target Companies</h2>
        <div style={{
          background: 'rgba(232,93,32,0.06)', border: '0.5px solid rgba(232,93,32,0.15)',
          borderRadius: 14, padding: '20px 24px', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontStyle: 'italic',
            fontSize: 15, color: '#666', lineHeight: 1.65, marginBottom: 16, marginTop: 0,
            maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
          }}>
            "Not sure where to start? Tell me what kind of companies interest you and I'll find the right ones — along with UF alumni who work there."
          </p>
          <button
            onClick={() => onOpenChat('Help me find target companies based on my major and interests')}
            style={{
              padding: '10px 24px', borderRadius: 100, border: 'none',
              background: '#E85D20', color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', minHeight: 'auto',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
            }}
          >
            Help Me Find Companies →
          </button>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300,
            color: '#999', marginTop: 10, marginBottom: 0,
          }}>
            or <span
              onClick={onAddTargets}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#666'}
              onMouseLeave={e => e.currentTarget.style.color = '#999'}
            >add companies manually</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#334155',
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
            positionType={positionType}
          />
        ))}
      </div>
    </div>
  );
}