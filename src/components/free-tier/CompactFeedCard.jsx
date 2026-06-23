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
        background: isSelected ? '#faf5ff' : '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: isSelected ? '4px solid #7c3aed' : '4px solid transparent',
        borderRadius: 12,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 8,
        boxShadow: isSelected ? '0 2px 8px rgba(124,58,237,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
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
      {/* Company & Title */}
      <div style={{ marginBottom: 8 }}>
        <h4 style={{
          fontFamily: dm,
          fontSize: 13,
          fontWeight: 800,
          color: isSelected ? '#111827' : '#374151',
          margin: '0 0 3px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>
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

      {/* Network Pills - Bottom Right */}
      {(hasAlumni || hasParent) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {hasAlumni && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
              borderRadius: 100,
              padding: '3px 8px',
            }}>
              <span style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 700,
                color: '#6d28d9',
              }}>
                🎓 {lead.alumniCount} Alumni
              </span>
            </div>
          )}
          {hasParent && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: 100,
              padding: '3px 8px',
            }}>
              <span style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 700,
                color: '#059669',
              }}>
                🤝 Parent
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}