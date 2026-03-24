import React, { useState } from 'react';

const SIGNAL_CONFIG = {
  active:    { label: 'Actively Hiring', color: '#22C55E', bg: '#F0FDF4' },
  selective: { label: 'Selective',       color: '#F59E0B', bg: '#FFFBEB' },
  freeze:    { label: 'Hiring Freeze',   color: '#EF4444', bg: '#FEF2F2' },
  unknown:   { label: 'Status Unknown',  color: '#9CA3AF', bg: '#F9FAFB' },
};

const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^[-•]\s/gm, '')
    .trim();
};

function HiringSignal({ signal }) {
  const c = SIGNAL_CONFIG[signal] || SIGNAL_CONFIG.unknown;
  return (
    <span style={{
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}30`,
      borderRadius: 100, padding: '3px 10px',
      fontSize: 12, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      ● {c.label}
    </span>
  );
}

function CFFParentsModal({ company, onClose }) {
  const parents = company.cff_parents || [];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 4px' }}>CFF NETWORK</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#0d1117', margin: 0 }}>Parents at {company.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa', minHeight: 'auto', padding: 4, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {parents.length === 0 ? (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>No CFF parents found at this company.</p>
          ) : parents.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {(p.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.job_title || 'CFF Parent'}{p.school ? ` · ${p.school}` : ''}</p>
              </div>
            </div>
          ))}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa', margin: '4px 0 0', textAlign: 'center' }}>Go to the Directory tab to message them directly.</p>
        </div>
      </div>
    </div>
  );
}

export default function CompanyIntelCard({ company, isFastIQ, onUpgrade, onResearch, savedCompanies, onSave, onUnsave }) {
  const [expanded, setExpanded] = useState(false);
  const [showParentsModal, setShowParentsModal] = useState(false);
  const isSaved = savedCompanies?.includes(company.name);

  const signal = company.hiring_signal || 'unknown';
  const isBest = company.is_combo;
  const isActive = signal === 'active';
  const isCollapsed = !isBest && !isActive && !expanded;

  const knownFor = cleanText(company.known_for);
  const whatTheyLookFor = (company.what_they_look_for || []).map(cleanText).slice(0, 3);
  const timeline = cleanText(company.application_timeline);

  let cardStyle = {};
  if (isBest) {
    cardStyle = { border: '2px solid #E85D20', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(232,93,32,0.1)', marginBottom: 16, position: 'relative' };
  } else if (isActive) {
    cardStyle = { border: '1px solid #e5e5e5', background: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, position: 'relative' };
  } else {
    cardStyle = { border: '1px solid #f0f0f0', background: '#fafafa', padding: 16, borderRadius: 12, marginBottom: 10, cursor: isCollapsed ? 'pointer' : 'default', position: 'relative' };
  }

  return (
    <>
      {showParentsModal && <CFFParentsModal company={company} onClose={() => setShowParentsModal(false)} />}
      <div style={cardStyle} onClick={isCollapsed ? () => setExpanded(true) : undefined}>
        {isBest && (
          <div style={{ position: 'absolute', top: -12, left: 16, background: '#E85D20', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
            ⭐ Best Opportunity
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: isBest ? 8 : 0 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: isBest ? 20 : 17, fontWeight: 600, color: '#0d1117', margin: '0 0 2px' }}>{company.name}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{company.industry}{company.headquarters ? ` · ${company.headquarters}` : ''}</p>
          </div>
          <HiringSignal signal={signal} />
        </div>

        {isCollapsed ? (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {company.cff_parent_count > 0 && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}>👥 {company.cff_parent_count}</span>
              )}
              {company.alumni_count > 0 && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}>🎓 ~{company.alumni_count}</span>
              )}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa' }}>Tap to expand →</span>
          </div>
        ) : (
          <>
            {knownFor && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: '12px 0 0', lineHeight: 1.5 }}>{knownFor}</p>
            )}
            {timeline && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '4px 0 0', fontStyle: 'italic' }}>📅 {timeline}</p>
            )}
            {whatTheyLookFor.length > 0 && (
              <div style={{ margin: '12px 0 0' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bbb', margin: '0 0 6px' }}>WHAT THEY LOOK FOR</p>
                {whatTheyLookFor.map((item, i) => (
                  <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: '0 0 3px', paddingLeft: 12, position: 'relative', lineHeight: 1.4 }}>
                    <span style={{ position: 'absolute', left: 0, color: '#E85D20' }}>·</span>{item}
                  </p>
                ))}
              </div>
            )}

            {/* CFF Network */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555' }}>
                👥 {company.cff_parent_count > 0 ? (
                  <>
                    <strong>{company.cff_parent_count}</strong> CFF parent{company.cff_parent_count !== 1 ? 's' : ''}
                    <span style={{ fontSize: 10, background: '#E8F5E9', color: '#2E7D32', padding: '1px 6px', borderRadius: 100, fontWeight: 700, marginLeft: 6 }}>FREE</span>
                  </>
                ) : 'No CFF parents yet'}
              </span>
              {company.cff_parent_count > 0 && (
                <button onClick={() => setShowParentsModal(true)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, fontWeight: 500 }}>View →</button>
              )}
              {(company.alumni_count > 0 || company.alumni_signal) && (
                <>
                  <span style={{ color: '#ddd' }}>·</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555' }}>
                    🎓 {(company.alumni_count && company.alumni_confidence === 'verified')
                      ? <><strong>{company.alumni_count.toLocaleString()}</strong> UF alumni</>
                      : 'UF alumni work here'
                    }
                  </span>
                  {isFastIQ ? (
                    <button onClick={() => {}} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, fontWeight: 500 }}>See who →</button>
                  ) : (
                    <button onClick={() => onUpgrade?.(company)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>🔒 See who →</button>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f5f5f5' }}>
              <button
                onClick={() => onResearch?.(company)}
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'none', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { e.target.style.background = '#E85D20'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#E85D20'; }}
              >
                Research This Company →
              </button>
              <button
                onClick={() => isSaved ? onUnsave?.(company.name) : onSave?.(company.name)}
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'none', border: 'none', color: isSaved ? '#E85D20' : '#888', fontSize: 13, cursor: 'pointer', padding: '7px 10px', minHeight: 'auto', transition: 'color 0.15s ease' }}
              >
                {isSaved ? '🔖 Saved' : '🔖 Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}