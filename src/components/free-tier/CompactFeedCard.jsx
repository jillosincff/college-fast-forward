import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function CompactFeedCard({ lead, isSelected, onClick, schoolAbbr }) {
  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';
  const location = lead.location || lead.location_text || '';
  const jobDesc = lead.hiring_description || lead.description || lead.jobDescription || '';
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
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 8,
        boxShadow: isSelected ? '0 2px 8px rgba(124,58,237,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
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
      {/* Top Row: Company Name + Network Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{
          fontFamily: dm,
          fontSize: 10,
          fontWeight: 800,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{companyName}</span>
        {(hasAlumni || hasParent) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: hasAlumni ? 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderRadius: 100,
            padding: '2px 8px',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: dm,
              fontSize: 9,
              fontWeight: 700,
              color: hasAlumni ? '#6d28d9' : '#059669',
            }}>
              {hasAlumni ? `🎓 ${lead.alumniCount} Alumni` : '🤝 Parent'}
            </span>
          </div>
        )}
      </div>

      {/* Job Title (Hero) */}
      <h4 style={{
        fontFamily: dm,
        fontSize: 14,
        fontWeight: 700,
        color: '#111827',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{jobTitle}</h4>

      {/* Location */}
      {location && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          color: '#9ca3af',
          fontWeight: 500,
        }}>
          <span>📍</span>
          <span>{location}</span>
        </div>
      )}

      {/* Job Description Snippet (2 lines max) */}
      {jobDesc && (
        <div style={{
          fontFamily: dm,
          fontSize: 11,
          color: '#6b7280',
          lineHeight: 1.5,
          marginTop: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {jobDesc.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ').trim()}
        </div>
      )}
    </div>
  );
}