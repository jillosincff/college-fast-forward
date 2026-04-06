import React from 'react';
import { Crown, Linkedin, Building2, GraduationCap } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = [
  '#E85D20', '#c9a84c', '#16a34a', '#0891b2',
  '#7c3aed', '#dc2626', '#4f46e5', '#059669',
];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function looksLikeUsername(name) {
  if (!name) return true;
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.includes('@')) return true;
  if (trimmed === trimmed.toLowerCase() && !trimmed.includes(' ') && trimmed.length < 20) return true;
  if (/^[a-z0-9]+$/i.test(trimmed) && /\d/.test(trimmed) && !trimmed.includes(' ')) return true;
  return false;
}

function hasRealName(user) {
  if (user?.first_name && user?.last_name && !looksLikeUsername(user.first_name)) return true;
  const full = user?.full_name || '';
  if (full.includes(' ') && !looksLikeUsername(full)) return true;
  if (full.length > 0 && full[0] === full[0].toUpperCase() && full !== full.toLowerCase()) return true;
  return false;
}

function getInitials(user) {
  if (!hasRealName(user)) return 'M';
  const name = user?.full_name || user?.first_name || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 1) return parts[0][0].toUpperCase();
  return 'M';
}

function formatFirstL(user) {
  if (!hasRealName(user)) return 'Member';
  const first = user?.first_name || '';
  const last = user?.last_name || '';
  if (first && last && !looksLikeUsername(first)) return `${first} ${last[0]}.`;
  const full = user?.full_name || '';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  if (parts.length === 1 && !looksLikeUsername(parts[0])) return parts[0];
  return 'Member';
}

function getHelpTag(help) {
  const h = (help || '').toLowerCase().replace(/_/g, ' ');
  if (h.includes('introduction') || h.includes('intro') || h.includes('networking')) return 'Intros';
  if (h.includes('resume') || h.includes('linkedin')) return 'Resume Review';
  if (h.includes('career') || h.includes('advice')) return 'Career Advice';
  if (h.includes('interview') || h.includes('mock')) return 'Interview Prep';
  if (h.includes('job') && (h.includes('lead') || h.includes('referral'))) return 'Job Referrals';
  if (h.includes('industry') || h.includes('insight')) return 'Industry Insights';
  return help ? help.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
}

function getHelpTags(user) {
  const tags = new Set();
  (user.ways_to_help || []).forEach(h => { const t = getHelpTag(h); if (t) tags.add(t); });
  (user.primary_goal || []).forEach(g => { const t = getHelpTag(g); if (t) tags.add(t); });
  if (user.can_provide_referrals) tags.add('Job Referrals');
  return Array.from(tags);
}

function getRoleBadge(persona) {
  if (persona === 'parent') return { label: 'Parent', bg: 'rgba(232,93,32,0.18)', color: '#E85D20', border: 'rgba(232,93,32,0.35)' };
  if (persona === 'alumni') return { label: 'Alumni', bg: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: 'rgba(201,168,76,0.35)' };
  return { label: 'Student', bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.15)' };
}

function getCompanyLine(user) {
  const company = user.current_company || user.company || '';
  const title = user.job_title || '';
  const industry = user.industry || '';
  if (company && title) return { primary: company, secondary: title };
  if (company && industry) return { primary: company, secondary: industry };
  if (company) return { primary: company, secondary: null };
  if (industry) return { primary: industry, secondary: null };
  return null;
}

export default function DirectoryMemberCard({ user, onMessage, onViewProfile, viewMode = 'grid' }) {
  const initials = getInitials(user);
  const avatarColor = getAvatarColor(user.id || user.full_name);
  const displayName = formatFirstL(user);
  const role = getRoleBadge(user.persona);
  const companyInfo = getCompanyLine(user);
  const helpTags = getHelpTags(user);
  const isFoundingMember = user.is_founding_member;
  const hasLinkedIn = !!(user.linkedin_url);
  const school = user.school_name || user.school_code?.toUpperCase() || '';
  const gradYear = user.graduation_year;

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 20px', transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff' }}>{initials}</span>
        </div>

        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 14, color: '#fff' }}>{displayName}</span>
            {hasLinkedIn && <a href={user.linkedin_url?.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto' }}><Linkedin style={{ width: 12, height: 12, color: '#0a66c2', flexShrink: 0 }} /></a>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 600,
              background: role.bg, color: role.color,
              border: `1px solid ${role.border}`,
              borderRadius: 100, padding: '1px 8px',
            }}>{role.label}</span>
            {isFoundingMember && <Crown style={{ width: 11, height: 11, color: '#c9a84c' }} />}
          </div>
        </div>

        {companyInfo && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {companyInfo.primary}
            </p>
            {companyInfo.secondary && (
              <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {companyInfo.secondary}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {helpTags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap',
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => onMessage(user)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
            background: '#E85D20', border: 'none', borderRadius: 8,
            padding: '7px 16px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
          }}>Message</button>
          <button onClick={() => onViewProfile(user.id)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
          }}>View Profile</button>
        </div>
      </div>
    );
  }

  // ── GRID MODE ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      transition: 'all 0.2s ease',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1px solid rgba(232,93,32,0.4)';
        e.currentTarget.style.background = 'rgba(232,93,32,0.06)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {isFoundingMember && (
        <div style={{ height: 2, background: 'linear-gradient(90deg, #c9a84c, rgba(201,168,76,0))' }} />
      )}

      <div style={{ padding: '20px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: `0 4px 16px ${avatarColor}40`,
          }}>
            <span style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: '#fff' }}>{initials}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {isFoundingMember && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Crown style={{ width: 12, height: 12, color: '#c9a84c' }} />
                <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 600, color: '#c9a84c', letterSpacing: '0.05em' }}>FOUNDING</span>
              </div>
            )}
            {hasLinkedIn && (
              <a href={user.linkedin_url?.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <Linkedin style={{ width: 12, height: 12, color: '#0a66c2' }} />
                <span style={{ fontFamily: dmSans, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <p style={{
            fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#fff',
            letterSpacing: '-0.01em', margin: '0 0 6px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{displayName}</p>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600,
            background: role.bg, color: role.color,
            border: `1px solid ${role.border}`,
            borderRadius: 100, padding: '3px 10px',
          }}>{role.label}</span>
        </div>

        {companyInfo && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
            <Building2 style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 }}>{companyInfo.primary}</p>
              {companyInfo.secondary && (
                <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{companyInfo.secondary}</p>
              )}
            </div>
          </div>
        )}

        {(school || gradYear) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <GraduationCap style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              {school}{school && gradYear ? ' · ' : ''}{gradYear ? `Class of ${gradYear}` : ''}
            </p>
          </div>
        )}

        {helpTags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 10 }}>
            {helpTags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap',
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 14px',
        display: 'flex', gap: 8,
        background: 'rgba(0,0,0,0.15)',
      }}>
        <button onClick={() => onMessage(user)} style={{
          flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
          background: '#E85D20', border: 'none', borderRadius: 10,
          padding: '9px 0', cursor: 'pointer', minHeight: 'auto',
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >Message</button>
        <button onClick={() => onViewProfile(user.id)} style={{
          flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '9px 0', cursor: 'pointer', minHeight: 'auto',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        >View Profile</button>
      </div>
    </div>
  );
}