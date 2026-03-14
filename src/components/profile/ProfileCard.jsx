import React from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

// SVG icons (stroke-based, 12x12)
const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const GradCapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10l-10-5L2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);
const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const ChatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const ChartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const MailIcon16 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const GradIcon16 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10l-10-5L2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);

const TAG_ICONS = {
  'Full-time': BriefcaseIcon,
  'Internship': GradCapIcon,
  'Resume': DocIcon,
  'Interview': ChatIcon,
  'Salary': ChartIcon,
};

function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = typeof gradYear === 'string' ? parseInt(gradYear) : gradYear;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const yearsUntilGrad = year - academicYear;
  if (yearsUntilGrad <= 0) return 'Senior';
  if (yearsUntilGrad === 1) return 'Junior';
  if (yearsUntilGrad === 2) return 'Sophomore';
  if (yearsUntilGrad === 3) return 'Freshman';
  return `Class of ${year}`;
}

function formatName(user) {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  const full = user.full_name || '';
  if (full.includes(',')) {
    return full.split(',').map(s => s.trim()).reverse().join(' ').replace(/\s+/g, ' ').trim();
  }
  return full || user.email?.split('@')[0] || 'User';
}

function getInitials(user) {
  const name = formatName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}

function formatIndustry(s) {
  if (!s) return s;
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ProfileCard({ user, isMyProfile }) {
  const classYear = getClassYear(user.graduation_year);
  const isStudent = user.persona === 'student' || user.persona === 'gator';
  const subtitle = [classYear, user.major].filter(Boolean).join(' · ');
  const displayName = formatName(user);
  const initials = getInitials(user);

  // Tags from seeking_type and help_needed
  const seekingLabels = { full_time: 'Full-time', internship: 'Internship', part_time: 'Part-time', contract: 'Contract' };
  const helpLabels = { resume_review: 'Resume', interview_prep: 'Interview', career_advice: 'Career Advice', salary_negotiation: 'Salary', networking_intros: 'Networking', industry_insights: 'Industry Insights', informational_interview: 'Info Interview', internship_leads: 'Internship Leads' };
  
  const tags = [];
  (user.seeking_type || []).forEach(s => tags.push(seekingLabels[s] || formatIndustry(s)));
  (user.help_needed || []).forEach(h => tags.push(helpLabels[h] || formatIndustry(h)));

  const industries = (user.industries_interested || []).map(formatIndustry);

  return (
    <div style={{
      background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 20, overflow: 'hidden',
    }}>
      {/* Cover */}
      <div style={{ height: 100, background: '#0d1117', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Profile info */}
      <div style={{ padding: '0 28px 24px', marginTop: -32, position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#0d1117',
          border: '3px solid #ffffff', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {user.profile_image_url ? (
            <img src={user.profile_image_url} alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#fff' }}>{initials}</span>
          )}
        </div>

        {/* Name row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 12, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h1 style={{
              fontFamily: dmSans, fontWeight: 600, fontSize: 22,
              color: '#1a1a1a', letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.2,
            }}>{displayName}</h1>
            {subtitle && (
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>{subtitle}</p>
            )}
            {!isStudent && user.current_position && (
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
                {user.current_position}{user.current_company ? ` at ${user.current_company}` : ''}
              </p>
            )}
            {user.fastiqActive && <FastiqBadge isMyProfile={isMyProfile} />}
          </div>
          {isMyProfile && (
            <button onClick={() => navigate('ProfileEdit')} style={{
              background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.12)',
              fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a',
              borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
              transition: 'background 0.15s', minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 0.5, background: 'rgba(0,0,0,0.06)', margin: '0 28px' }} />

      {/* Tags row */}
      {(tags.length > 0 || industries.length > 0) && (
        <div style={{ padding: '16px 28px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: industries.length > 0 ? 10 : 0 }}>
              {tags.map(tag => {
                const IconComp = TAG_ICONS[tag];
                return (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
                    borderRadius: 100, padding: '5px 12px',
                    fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#555',
                  }}>
                    {IconComp && <IconComp />}
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
          {industries.length > 0 && (
            <p style={{ fontFamily: dmSans, fontSize: 12, margin: 0 }}>
              <span style={{ fontWeight: 500, color: '#888' }}>Interested in: </span>
              <span style={{ fontWeight: 300, color: '#555' }}>{industries.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      {/* Details + About grid */}
      <div className="profile-details-grid" style={{
        padding: '20px 28px 28px', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 32,
      }}>
        {/* Details */}
        <div>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: '#bbb', display: 'block', marginBottom: 14,
          }}>Details</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <MailIcon16 />
            <a href={`mailto:${user.email}`} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#E85D20',
              textDecoration: 'none', wordBreak: 'break-all',
            }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >{user.email}</a>
          </div>

          {(user.graduation_year || user.major) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <GradIcon16 />
              <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555' }}>
                {user.graduation_year ? `Class of ${user.graduation_year}` : ''}
                {user.graduation_year && user.major ? ' · ' : ''}
                {user.major || ''}
              </span>
            </div>
          )}

          {user.minor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <GradIcon16 />
              <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555' }}>
                Minor: {user.minor}
              </span>
            </div>
          )}
        </div>

        {/* About */}
        <div>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: '#bbb', display: 'block', marginBottom: 14,
          }}>About</span>

          {user.bio ? (
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#555', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {user.bio}
            </p>
          ) : (
            <div>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#bbb', fontStyle: 'italic', margin: '0 0 8px' }}>
                No bio yet.
              </p>
              {isMyProfile && (
                <button onClick={() => navigate('ProfileEdit')} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
                  minHeight: 'auto', width: 'auto',
                }}>
                  Add a bio →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .profile-details-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}