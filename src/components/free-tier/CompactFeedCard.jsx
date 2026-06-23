import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

// Generate a clean, colored letter placeholder for company logos
function getLogoPlaceholder(companyName) {
  const letter = (companyName || '?').charAt(0).toUpperCase();
  const colors = [
    { bg: '#7c3aed', text: '#fff' }, // Purple
    { bg: '#059669', text: '#fff' }, // Green
    { bg: '#dc2626', text: '#fff' }, // Red
    { bg: '#2563eb', text: '#fff' }, // Blue
    { bg: '#d97706', text: '#fff' }, // Amber
    { bg: '#db2777', text: '#fff' }, // Pink
  ];
  const colorIndex = letter.charCodeAt(0) % colors.length;
  return { letter, ...colors[colorIndex] };
}

export default function CompactFeedCard({ lead, isSelected, onClick, schoolAbbr }) {
  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';
  const location = lead.location || lead.location_text || '';
  const jobDesc = lead.hiring_description || lead.description || lead.jobDescription || '';
  const hasAlumni = lead.alumniCount > 0;
  const hasParent = lead.parentCount > 0;
  const networkCount = (lead.alumniCount || 0) + (lead.parentCount || 0);
  const logoData = getLogoPlaceholder(companyName);

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#faf5ff' : '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: isSelected ? '4px solid #7c3aed' : '4px solid transparent',
        borderRadius: 14,
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 10,
        boxShadow: isSelected 
          ? '0 4px 12px rgba(124,58,237,0.2)' 
          : '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#a78bfa';
          e.currentTarget.style.background = '#faf5ff';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.15)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }
      }}
    >
      {/* Company Logo (Left Side) */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 10,
        background: logoData.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}>
        <span style={{
          fontFamily: dm,
          fontSize: 20,
          fontWeight: 800,
          color: logoData.text,
          letterSpacing: '-0.02em',
        }}>{logoData.letter}</span>
      </div>

      {/* Content Stack (Right Side) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Top Row: Company + Network Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: dm,
            fontSize: 10,
            fontWeight: 800,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{companyName}</span>
          {(hasAlumni || hasParent) && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: hasAlumni 
                ? 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' 
                : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: 100,
              padding: '3px 9px',
              flexShrink: 0,
              border: hasAlumni 
                ? '1px solid rgba(124,58,237,0.2)' 
                : '1px solid rgba(5,150,105,0.2)',
            }}>
              <span style={{ fontSize: 10 }}>
                {hasAlumni ? (lead.alumniCount > 1 ? '👥' : '🎓') : '🏡'}
              </span>
              <span style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 700,
                color: hasAlumni ? '#6d28d9' : '#059669',
              }}>
                {hasAlumni 
                  ? `${lead.alumniCount} Alumni` 
                  : `${lead.parentCount} Parent${lead.parentCount > 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </div>

        {/* Job Title (Hero - Large & Bold) */}
        <h4 style={{
          fontFamily: dm,
          fontSize: 14,
          fontWeight: 700,
          color: '#111827',
          margin: 0,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{jobTitle}</h4>

        {/* Location & Type */}
        {location && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            color: '#9ca3af',
            fontWeight: 500,
          }}>
            <span>📍</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </span>
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
          }}>
            {jobDesc.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ').trim()}
          </div>
        )}
      </div>
    </div>
  );
}