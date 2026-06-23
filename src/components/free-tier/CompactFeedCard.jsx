import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function CompactFeedCard({ lead, isSelected, onClick, schoolAbbr }) {
  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';
  const location = lead.location || lead.location_text || '';
  const hasAlumni = lead.alumniCount > 0;
  const hasParent = lead.parentCount > 0;
  const networkCount = (lead.alumniCount || 0) + (lead.parentCount || 0);

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#f5f3ff' : '#fff',
        border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 8,
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#a78bfa';
          e.currentTarget.style.background = '#faf5ff';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.background = '#fff';
        }
      }}
    >
      {/* Network Badge - Top */}
      {(hasAlumni || hasParent) && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: hasAlumni ? 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          borderRadius: 6,
          padding: '3px 8px',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 10 }}>{hasAlumni ? '🎓' : '🤝'}</span>
          <span style={{
            fontFamily: dm,
            fontSize: 10,
            fontWeight: 700,
            color: hasAlumni ? '#6d28d9' : '#059669',
          }}>
            {networkCount} {hasAlumni ? 'Alumni' : 'Parent'}{networkCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Company & Title */}
      <div style={{ marginBottom: 6 }}>
        <h4 style={{
          fontFamily: dm,
          fontSize: 13,
          fontWeight: 800,
          color: '#111827',
          margin: '0 0 2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{companyName}</h4>
        <p style={{
          fontFamily: dm,
          fontSize: 11,
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{jobTitle}</p>
      </div>

      {/* Metadata Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#9ca3af' }}>
        {location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            📍 {location.length > 20 ? location.substring(0, 20) + '…' : location}
          </span>
        )}
        {lead.posted_date && (
          <span style={{ color: '#d1d5db' }}>•</span>
        )}
        {lead.posted_date && (
          <span>
            {(() => {
              const posted = new Date(lead.posted_date);
              const days = Math.floor((Date.now() - posted) / (1000 * 60 * 60 * 24));
              return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`;
            })()}
          </span>
        )}
      </div>
    </div>
  );
}