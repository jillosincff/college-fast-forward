import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { X, Crown, Linkedin, Building2, GraduationCap, Briefcase, MapPin, ExternalLink } from 'lucide-react';

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

function getInitials(user) {
  if (!user) return 'M';
  const first = user.first_name || '';
  const last = user.last_name || '';
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  const full = user.full_name || '';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return 'M';
}

function getFirstL(user) {
  if (!user) return 'Member';
  const first = user.first_name || '';
  const last = user.last_name || '';
  if (first && last) return `${first} ${last[0]}.`;
  const full = user.full_name || '';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  if (parts.length === 1) return parts[0];
  return 'Member';
}

function getFirstName(user) {
  if (!user) return 'them';
  return user.first_name || (user.full_name || '').split(' ')[0] || 'them';
}

function getRoleBadge(user) {
  const p = user?.persona;
  if (p === 'parent') return { label: 'Parent', bg: 'rgba(232,93,32,0.2)', color: '#E85D20', border: 'rgba(232,93,32,0.4)' };
  if (p === 'alumni') {
    const isHelper = user.alumni_intent === 'help_students' || (user.ways_to_help && user.ways_to_help.length > 0);
    if (isHelper) return { label: 'Alumni · Helper', bg: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: 'rgba(201,168,76,0.35)' };
    return { label: 'Alumni', bg: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: 'rgba(201,168,76,0.25)' };
  }
  return { label: 'Student', bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.15)' };
}

function normalizeHelpTag(h) {
  const s = (h || '').toLowerCase().replace(/_/g, ' ');
  if (s.includes('career') || s.includes('advice')) return 'Career Guidance';
  if (s.includes('job') || s.includes('referral') || s.includes('lead') || s.includes('internship')) return 'Jobs & Referrals';
  if (s.includes('resume') || s.includes('interview') || s.includes('linkedin')) return 'Resume & Interviews';
  if (s.includes('industry') || s.includes('insight')) return 'Industry Insights';
  if (s.includes('intro') || s.includes('networking') || s.includes('informational')) return 'Introductions';
  return h ? h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
}

function getHelpTags(user) {
  const tags = new Set();
  (user?.ways_to_help || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  (user?.mentorship_topics || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  (user?.expertise_areas || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  if (user?.can_provide_referrals) tags.add('Jobs & Referrals');
  return Array.from(tags);
}

function InfoRow({ icon: Icon, label, value, link }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Icon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.3)', marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        {link ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: dmSans, fontSize: 14, color: '#E85D20', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View LinkedIn Profile <ExternalLink style={{ width: 11, height: 11 }} />
          </a>
        ) : (
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

export default function ProfileModal({ isOpen, onClose, userId, onMessage }) {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      setProfileUser(null);
      setBioExpanded(false);
      base44.functions.invoke('getPublicUserInfo', { userId })
        .then(response => {
          // Platform V2: response is the function's return body directly: { success, data: profile }
          const profile = response?.data;
          if (profile && profile.id) setProfileUser(profile);
          else if (response?.error) setError(response.error);
          else setError('Could not load profile.');
        })
        .catch((err) => { console.error('ProfileModal error:', err); setError('Could not load profile.'); })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;
  const displayName = useMemo(() => getFirstL(profileUser), [profileUser]);
  const firstName = useMemo(() => getFirstName(profileUser), [profileUser]);
  const initials = useMemo(() => getInitials(profileUser), [profileUser]);
  const avatarColor = useMemo(() => getAvatarColor(profileUser?.id || profileUser?.full_name), [profileUser]);
  const roleBadge = useMemo(() => getRoleBadge(profileUser), [profileUser]);
  const helpTags = useMemo(() => getHelpTags(profileUser), [profileUser]);

  const isHelperOrParent = profileUser && (
    profileUser.persona === 'parent' ||
    (profileUser.persona === 'alumni' && profileUser.alumni_intent === 'help_students') ||
    (profileUser.ways_to_help && profileUser.ways_to_help.length > 0)
  );

  const companyDisplay = useMemo(() => {
    if (!profileUser) return '';
    const company = profileUser.company || profileUser.current_company || '';
    const title = profileUser.job_title || '';
    if (company && title) return `${title} at ${company}`;
    return company || title || '';
  }, [profileUser]);

  const schoolDisplay = useMemo(() => {
    if (!profileUser) return '';
    const school = profileUser.school_name || profileUser.school_code?.toUpperCase() || '';
    const year = profileUser.graduation_year ? `Class of ${profileUser.graduation_year}` : '';
    const major = profileUser.major || '';
    return [major, school, year].filter(Boolean).join(' · ');
  }, [profileUser]);

  const locationDisplay = useMemo(() => {
    if (!profileUser) return '';
    const city = profileUser.city || '';
    const state = profileUser.state || '';
    return [city, state].filter(Boolean).join(', ');
  }, [profileUser]);

  const memberSince = useMemo(() => {
    if (!profileUser?.created_date) return '';
    try {
      return new Date(profileUser.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch { return ''; }
  }, [profileUser]);

  const handleMessage = () => {
    if (onMessage && profileUser) { onMessage(profileUser); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        animation: 'pmFadeIn 0.2s ease',
      }} />

      <div style={{
        position: 'fixed', zIndex: 9999,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 560, maxHeight: '95vh',
        borderRadius: 20, overflow: 'hidden',
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        animation: 'pmSlideUp 0.25s ease',
      }} className="profile-modal-shell">

        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, zIndex: 10,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <X style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />
        </button>

        <div style={{ overflowY: 'auto', flex: 1 }} className="profile-modal-scroll">

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(232,93,32,0.3)', borderTop: '2px solid #E85D20', borderRadius: '50%', animation: 'pmSpin 0.8s linear infinite' }} />
              <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Loading profile…</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12, padding: 24 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>Could not load this profile.</p>
              <button onClick={onClose} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer', minHeight: 'auto' }}>Close</button>
            </div>
          )}

          {profileUser && !loading && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #1a0e06 0%, #1f1208 60%, #0d1117 100%)',
                borderBottom: '1px solid rgba(232,93,32,0.15)',
                padding: '36px 24px 20px',
                position: 'relative',
              }}>
                {profileUser.is_founding_member && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.2))' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: '3px solid rgba(255,255,255,0.12)',
                    boxShadow: `0 8px 24px ${avatarColor}50`,
                  }}>
                    <span style={{ fontFamily: dmSans, fontSize: 26, fontWeight: 700, color: '#fff' }}>{initials}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                    <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px', lineHeight: 1.2 }}>
                      {displayName}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: dmSans, fontSize: 11, fontWeight: 600,
                        background: roleBadge.bg, color: roleBadge.color,
                        border: `1px solid ${roleBadge.border}`,
                        borderRadius: 100, padding: '3px 12px',
                      }}>{roleBadge.label}</span>
                      {profileUser.is_founding_member && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Crown style={{ width: 12, height: 12, color: '#c9a84c' }} />
                          <span style={{ fontFamily: dmSans, fontSize: 11, color: '#c9a84c', fontWeight: 600 }}>Founding Member</span>
                        </div>
                      )}
                      {profileUser.linkedin_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Linkedin style={{ width: 12, height: 12, color: '#0a66c2' }} />
                          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>LinkedIn</span>
                        </div>
                      )}
                    </div>
                    {companyDisplay && (
                      <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '8px 0 0' }}>
                        {companyDisplay}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>

                {helpTags.length > 0 && (
                  <div style={{
                    background: 'rgba(232,93,32,0.06)',
                    border: '1px solid rgba(232,93,32,0.15)',
                    borderRadius: 12, padding: '14px 16px', marginBottom: 20,
                  }}>
                    <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                      {isHelperOrParent ? '✦ Here to help with' : '✦ Looking for help with'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {helpTags.map(tag => (
                        <span key={tag} style={{
                          fontFamily: dmSans, fontSize: 13, color: '#E85D20',
                          border: '1px solid rgba(232,93,32,0.3)',
                          borderRadius: 100, padding: '5px 14px',
                          background: 'rgba(232,93,32,0.08)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileUser.bio && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>About</p>
                    <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
                      {!bioExpanded && profileUser.bio.length > 280 ? profileUser.bio.slice(0, 280) + '…' : profileUser.bio}
                    </p>
                    {profileUser.bio.length > 280 && (
                      <button onClick={() => setBioExpanded(!bioExpanded)} style={{
                        fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E85D20',
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 0',
                        minHeight: 'auto', width: 'auto',
                      }}>
                        {bioExpanded ? 'Show less' : 'Read more →'}
                      </button>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <InfoRow icon={Briefcase} label="Role / Company" value={companyDisplay} />
                  <InfoRow icon={GraduationCap} label="Education" value={schoolDisplay} />
                  <InfoRow icon={MapPin} label="Location" value={locationDisplay} />
                  <InfoRow icon={Linkedin} label="LinkedIn" value={profileUser.linkedin_url} link={true} />
                  {profileUser.industry && (
                    <InfoRow icon={Building2} label="Industry" value={profileUser.industry} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {isOwnProfile ? (
                    <button onClick={() => { onClose(); navigate('ProfileEdit'); }} style={{
                      flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                      color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12, padding: '12px 0', cursor: 'pointer', minHeight: 'auto',
                    }}>Edit Profile</button>
                  ) : (
                    <button onClick={handleMessage} style={{
                      flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
                      background: '#E85D20', border: 'none', borderRadius: 12,
                      padding: '12px 0', cursor: 'pointer', minHeight: 'auto',
                      boxShadow: '0 4px 16px rgba(232,93,32,0.3)',
                      transition: 'opacity 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Message {firstName}
                    </button>
                  )}
                </div>

                {memberSince && (
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: '16px 0 0', textAlign: 'center' }}>
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideUp { from { opacity: 0; transform: translate(-50%, -47%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes pmSpin { to { transform: rotate(360deg); } }
        .profile-modal-scroll::-webkit-scrollbar { width: 4px; }
        .profile-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .profile-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @media (max-width: 640px) {
          .profile-modal-shell { top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important; transform: none !important; max-width: 100% !important; max-height: 92vh !important; border-radius: 20px 20px 0 0 !important; }
        }
      `}</style>
    </>
  );
}