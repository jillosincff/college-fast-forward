import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const SIGNAL_CONFIG = {
  active:    { label: 'Actively Hiring', color: '#22C55E', bg: '#F0FDF4' },
  selective: { label: 'Selective',       color: '#F59E0B', bg: '#FFFBEB' },
  freeze:    { label: 'Hiring Freeze',   color: '#EF4444', bg: '#FEF2F2' },
  unknown:   { label: 'Status Unknown',  color: '#9CA3AF', bg: '#F9FAFB' },
};

function HiringSignal({ signal }) {
  const c = SIGNAL_CONFIG[signal] || SIGNAL_CONFIG.unknown;
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.color}30`,
      borderRadius: 100,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      ● {c.label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#bbb',
      margin: '16px 0 8px 0',
    }}>{children}</p>
  );
}

export default function CompanyIntelCard({
  company,
  isFastIQ,
  onUpgrade,
  onResearch,
  savedCompanies,
  onSave,
  onUnsave,
}) {
  const [showResearch, setShowResearch] = useState(false);
  const isSaved = savedCompanies?.includes(company.name);

  const handleResearch = () => {
    if (onResearch) onResearch(company);
  };

  return (
    <div style={{
      background: '#fff',
      border: company.is_combo ? '2px solid #E85D20' : '1px solid #f0f0f0',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      position: 'relative',
      transition: 'box-shadow 0.2s ease',
      fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Combo badge */}
      {company.is_combo && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: 16,
          background: '#E85D20',
          color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 100,
        }}>
          ⭐ Best Opportunity
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#0d1117', margin: '0 0 2px' }}>
            {company.name}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
            {company.industry}{company.headquarters ? ` · ${company.headquarters}` : ''}
            {company.size ? ` · ${company.size.charAt(0).toUpperCase() + company.size.slice(1)}` : ''}
          </p>
        </div>
        <HiringSignal signal={company.hiring_signal} />
      </div>

      {/* What's Happening */}
      <SectionLabel>What's Happening</SectionLabel>
      <p style={{ fontSize: 14, color: '#333', margin: '0 0 4px', lineHeight: 1.5 }}>{company.known_for}</p>
      {company.application_timeline && (
        <p style={{ fontSize: 13, color: '#888', margin: 0, fontStyle: 'italic' }}>
          📅 {company.application_timeline}
        </p>
      )}
      {company.entry_level_programs && (
        <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>
          🎯 Program: {company.entry_level_programs}
        </p>
      )}
      {company.campus_recruiting && (
        <p style={{ fontSize: 13, color: '#22C55E', margin: '4px 0 0', fontWeight: 600 }}>
          ✓ Does campus recruiting
        </p>
      )}

      {/* What They Look For */}
      {company.what_they_look_for?.length > 0 && (
        <>
          <SectionLabel>What They Look For</SectionLabel>
          <div>
            {company.what_they_look_for.map((item, i) => (
              <p key={i} style={{
                fontSize: 13,
                color: '#444',
                margin: '0 0 4px',
                paddingLeft: 14,
                position: 'relative',
                lineHeight: 1.5,
              }}>
                <span style={{ position: 'absolute', left: 0, color: '#E85D20' }}>·</span>
                {item}
              </p>
            ))}
          </div>
        </>
      )}

      {/* CFF Network */}
      <SectionLabel>CFF Network</SectionLabel>

      {/* Parents */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span>👥</span>
        {company.cff_parent_count > 0 ? (
          <>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0d1117' }}>
              {company.cff_parent_count} CFF parent{company.cff_parent_count !== 1 ? 's' : ''} work here
            </span>
            <span style={{ fontSize: 10, background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
              FREE
            </span>
            <button
              onClick={() => navigate('GatorDirectory')}
              style={{ fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, minHeight: 'auto', padding: 0 }}
            >
              View in Directory →
            </button>
          </>
        ) : (
          <>
            <span style={{ color: '#888', fontSize: 13 }}>No CFF parents here yet</span>
            <button
              onClick={() => navigate('GatorDirectory')}
              style={{ fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              Invite one →
            </button>
          </>
        )}
      </div>

      {/* Alumni */}
      {company.alumni_count > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span>🎓</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0d1117' }}>
            {company.alumni_count} UF alumni work here
          </span>
          {isFastIQ ? (
            <button
              onClick={() => navigate('FreeTierDashboard', { tab: 'career_goals' })}
              style={{ fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, minHeight: 'auto', padding: 0 }}
            >
              See who →
            </button>
          ) : (
            <>
              <span style={{ fontSize: 10, background: '#f5f5f5', color: '#888', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                🔒 FastIQ
              </span>
              <button
                onClick={() => onUpgrade?.(company)}
                style={{ fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, minHeight: 'auto', padding: 0 }}
              >
                See who →
              </button>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <SectionLabel>Actions</SectionLabel>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleResearch}
          style={{
            background: '#0d1117',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: 'auto',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Research This Company →
        </button>
        <button
          onClick={() => isSaved ? onUnsave?.(company.name) : onSave?.(company.name)}
          style={{
            background: isSaved ? '#FFF5F0' : '#fff',
            color: isSaved ? '#E85D20' : '#666',
            border: `1px solid ${isSaved ? '#E85D20' : '#e5e5e5'}`,
            borderRadius: 100,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            minHeight: 'auto',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {isSaved ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}