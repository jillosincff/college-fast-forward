import React from 'react';
import { Crown } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

// Stable avatar colors from user id/name
const AVATAR_COLORS = [
  '#E85D20', '#0821A5', '#6A2A60', '#16a34a', '#0891b2',
  '#7c3aed', '#dc2626', '#ca8a04', '#4f46e5', '#059669',
];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Detect if a name looks like a username/email prefix rather than a real name
function looksLikeUsername(name) {
  if (!name) return true;
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.includes('@')) return true;
  // All lowercase with no spaces = likely a username (e.g. "amisokol", "alitloo")
  if (trimmed === trimmed.toLowerCase() && !trimmed.includes(' ') && trimmed.length < 20) return true;
  // Contains numbers mixed with letters and no spaces = likely auto-generated
  if (/^[a-z0-9]+$/i.test(trimmed) && /\d/.test(trimmed) && !trimmed.includes(' ')) return true;
  return false;
}

function hasRealName(user) {
  // Check if user has a proper display name from any field
  if (user?.first_name && user?.last_name && !looksLikeUsername(user.first_name)) return true;
  const full = user?.full_name || '';
  if (full.includes(' ') && !looksLikeUsername(full)) return true;
  // Single word but capitalized properly (e.g. "Sarah") — allow it
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
  if (persona === 'parent') return { label: 'Parent', bg: '#E85D20', color: '#fff' };
  if (persona === 'alumni') return { label: 'Alumni', bg: '#0d1117', color: '#fff' };
  return { label: 'Student', bg: '#e5e7eb', color: '#555' };
}

function getCompanyLine(user) {
  const company = user.current_company || user.company || '';
  const industry = user.industry || '';
  if (company && industry) return `${company} · ${industry}`;
  return company || industry || '';
}

export default function DirectoryMemberCard({ user, onMessage, onViewProfile, viewMode = 'grid' }) {
  const initials = getInitials(user);
  const avatarColor = getAvatarColor(user.id || user.full_name);
  const displayName = formatFirstL(user);
  const role = getRoleBadge(user.persona);
  const companyLine = getCompanyLine(user);
  const helpTags = getHelpTags(user);
  const isFoundingMember = user.is_founding_member;

  if (viewMode === 'list') {
    return (
      <div style={{
        background: '#fff', padding: '14px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
      >
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>{initials}</span>
        </div>

        {/* Name + Role */}
        <div style={{ minWidth: 120, flexShrink: 0 }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
            {displayName}
          </span>
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 500,
            background: role.bg, color: role.color, borderRadius: 100,
            padding: '2px 8px', marginLeft: 8, whiteSpace: 'nowrap',
          }}>
            {role.label}
          </span>
          {user.persona === 'alumni' && user.graduation_year && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, color: '#888', marginLeft: 6,
            }}>
              Class of {user.graduation_year}
            </span>
          )}
        </div>

        {/* Company · Industry */}
        {companyLine && (
          <span style={{
            fontFamily: dmSans, fontSize: 12, color: '#888', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {companyLine}
          </span>
        )}

        {/* Help tags */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {helpTags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontFamily: dmSans, fontSize: 11, color: '#666',
              background: 'rgba(0,0,0,0.04)', borderRadius: 100,
              padding: '3px 10px', whiteSpace: 'nowrap',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => onMessage(user)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
            background: '#E85D20', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Message
          </button>
          <button onClick={() => onViewProfile(user.id)} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            minHeight: 'auto', width: 'auto',
          }}>
            View Profile
          </button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.2s',
      display: 'flex', flexDirection: 'column', height: 340,
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#E85D20';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 24, fontWeight: 600, color: '#fff' }}>{initials}</span>
        </div>

        {/* Name */}
        <p style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#1a1a1a',
          letterSpacing: '-0.01em', marginBottom: 6, textAlign: 'center',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}>
          {displayName}
        </p>

        {/* Role badge */}
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          background: role.bg, color: role.color, borderRadius: 100,
          padding: '3px 12px', marginBottom: 6,
        }}>
          {role.label}
        </span>

        {/* Graduation year for alumni */}
        {user.persona === 'alumni' && user.graduation_year && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 400,
            color: '#888', marginBottom: 4,
          }}>
            Class of {user.graduation_year}
          </span>
        )}

        {/* Founding Member badge */}
        {isFoundingMember && (
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 500,
            color: '#b8860b', display: 'flex', alignItems: 'center', gap: 4,
            marginBottom: 6,
          }}>
            <Crown style={{ width: 12, height: 12, color: '#b8860b' }} />
            Founding Member
          </span>
        )}

        {/* Company + Industry */}
        {companyLine && (
          <p style={{
            fontFamily: dmSans, fontSize: 12, color: '#888', textAlign: 'center',
            marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', maxWidth: '100%',
          }}>
            {companyLine}
          </p>
        )}

        {/* Help tags */}
        {helpTags.length > 0 && (
          <div style={{
            display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'nowrap',
            overflow: 'hidden', maxWidth: '100%',
          }}>
            {helpTags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: dmSans, fontSize: 11, color: '#666',
                background: 'rgba(0,0,0,0.04)', borderRadius: 100,
                padding: '2px 8px', whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider + Buttons */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px', display: 'flex', gap: 8 }}>
        <button onClick={() => onMessage(user)} style={{
          flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
          background: '#E85D20', border: 'none', borderRadius: 10,
          padding: '10px 0', cursor: 'pointer', minHeight: 'auto',
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Message
        </button>
        <button onClick={() => onViewProfile(user.id)} style={{
          flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#333',
          background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10,
          padding: '10px 0', cursor: 'pointer', minHeight: 'auto',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85D20'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}