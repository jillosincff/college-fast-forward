import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { X } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

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
  if (p === 'parent') return { label: 'Parent', bg: '#E85D20', color: '#fff' };
  if (p === 'alumni') {
    const isHelper = user.alumni_intent === 'help_students' || (user.ways_to_help && user.ways_to_help.length > 0);
    if (isHelper) return { label: 'Alumni · Helper', bg: '#0d1117', color: '#fff' };
    return { label: 'Alumni · Seeker', bg: '#e5e7eb', color: '#555' };
  }
  return { label: 'Student', bg: '#e5e7eb', color: '#555' };
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
          const data = response?.data;
          if (data && data.id) {
            setProfileUser(data);
          } else if (data?.error) {
            setError(data.error);
          } else {
            setError('Could not load profile.');
          }
        })
        .catch(err => {
          console.error('ProfileModal fetch error:', err);
          setError('Could not load profile.');
        })
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

  const companyLine = useMemo(() => {
    if (!profileUser) return '';
    const company = profileUser.company || '';
    const title = profileUser.job_title || '';
    if (company && title) return `${company} · ${title}`;
    return company || title || '';
  }, [profileUser]);

  const memberSince = useMemo(() => {
    if (!profileUser?.created_date) return '';
    try {
      const d = new Date(profileUser.created_date);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch { return ''; }
  }, [profileUser]);

  const handleMessage = () => {
    if (onMessage && profileUser) {
      onMessage(profileUser);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(13,17,23,0.6)',
          animation: 'pmFadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 9999,
        // Desktop: centered
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 600, maxHeight: '90vh',
        borderRadius: 16, overflow: 'hidden',
        background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        animation: 'pmSlideUp 0.25s ease',
      }}
        className="profile-modal-shell"
      >
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        >
          <X style={{ width: 16, height: 16, color: '#fff' }} />
        </button>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, position: 'relative' }} className="profile-modal-scroll">

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{
                width: 28, height: 28, border: '3px solid #E85D20',
                borderTop: '3px solid transparent', borderRadius: '50%',
                animation: 'pmSpin 0.8s linear infinite',
              }} />
              <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>Loading profile…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12, padding: 24 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#333', textAlign: 'center' }}>Something went wrong.</p>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: '#999', textAlign: 'center' }}>{error}</p>
              <button onClick={onClose} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
                background: '#E85D20', border: 'none', borderRadius: 8,
                padding: '8px 24px', cursor: 'pointer', minHeight: 'auto',
              }}>Close</button>
            </div>
          )}

          {/* Profile content */}
          {profileUser && !loading && (
            <>
              {/* HEADER BAND */}
              <div style={{
                height: 100,
                backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
                position: 'relative', flexShrink: 0,
              }} />

              {/* AVATAR — overlaps band */}
              <div style={{ padding: '0 24px', marginTop: -40, position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: avatarColor,
                  border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontFamily: dmSans, fontSize: 28, fontWeight: 600, color: '#fff' }}>{initials}</span>
                </div>
              </div>

              {/* IDENTITY BLOCK */}
              <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{
                    fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a',
                    letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
                  }}>
                    {displayName}
                  </h2>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                    background: roleBadge.bg, color: roleBadge.color,
                    borderRadius: 100, padding: '3px 14px',
                  }}>
                    {roleBadge.label}
                  </span>
                  {companyLine && (
                    <p style={{
                      fontFamily: dmSans, fontSize: 13, color: '#888',
                      marginTop: 6, margin: '6px 0 0',
                    }}>
                      {companyLine}
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div style={{ flexShrink: 0 }}>
                  {isOwnProfile ? (
                    <button onClick={() => { onClose(); navigate('ProfileEdit'); }} style={{
                      fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333',
                      background: '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 10,
                      padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
                    }}>
                      Edit Profile
                    </button>
                  ) : (
                    <button onClick={handleMessage} style={{
                      fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
                      background: '#E85D20', border: 'none', borderRadius: 10,
                      padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'opacity 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Message
                    </button>
                  )}
                </div>
              </div>

              {/* BADGES ROW */}
              {(profileUser.is_founding_member || profileUser.karma_level) && (
                <div style={{ padding: '10px 24px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profileUser.is_founding_member && (
                    <span style={{
                      fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                      color: '#92700c', background: 'rgba(202,138,4,0.1)',
                      border: '1px solid rgba(202,138,4,0.2)', borderRadius: 100,
                      padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      🏆 Founding Member
                    </span>
                  )}
                  {profileUser.karma_level && (
                    <span style={{
                      fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                      color: '#666', background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100,
                      padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      ⭐ {profileUser.karma_level}
                    </span>
                  )}
                </div>
              )}

              {/* HELP TYPE TAGS BLOCK */}
              {helpTags.length > 0 && (
                <div style={{
                  margin: '16px 24px 0', padding: '16px 20px',
                  background: '#f4f2ee', borderRadius: 12,
                }}>
                  <p style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#999', marginBottom: 10, margin: '0 0 10px',
                  }}>
                    {isHelperOrParent ? 'HERE TO HELP WITH' : 'LOOKING FOR HELP WITH'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {helpTags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
                        border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100,
                        padding: '4px 14px', background: '#fff',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PROFESSIONAL DETAILS BLOCK */}
              {(companyLine || profileUser.major || profileUser.graduation_year || profileUser.linkedin_url || profileUser.industry || profileUser.bio) && (
                <div style={{ margin: '16px 24px 0' }} className="profile-details-grid">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="profile-two-col">
                    {/* Left: Professional */}
                    <div>
                      {(companyLine || profileUser.major || profileUser.graduation_year || profileUser.linkedin_url || profileUser.industry) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(profileUser.company || profileUser.job_title) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: dmSans, fontSize: 14, color: '#333' }}>
                              <span style={{ fontSize: 16 }}>🏢</span>
                              <span>{profileUser.company}{profileUser.company && profileUser.job_title ? ' · ' : ''}{profileUser.job_title}</span>
                            </div>
                          )}
                          {(profileUser.major || profileUser.graduation_year) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: dmSans, fontSize: 14, color: '#333' }}>
                              <span style={{ fontSize: 16 }}>🎓</span>
                              <span>
                                {profileUser.major}{profileUser.major && profileUser.graduation_year ? ' · ' : ''}
                                {profileUser.graduation_year ? `Class of ${profileUser.graduation_year}` : ''}
                              </span>
                            </div>
                          )}
                          {profileUser.linkedin_url && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: dmSans, fontSize: 14 }}>
                              <span style={{ fontSize: 16 }}>🔗</span>
                              <a
                                href={profileUser.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#E85D20', textDecoration: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                              >
                                LinkedIn Profile →
                              </a>
                            </div>
                          )}
                          {profileUser.industry && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontFamily: dmSans, fontSize: 12, color: '#666',
                                background: 'rgba(0,0,0,0.04)', borderRadius: 100,
                                padding: '3px 12px',
                              }}>
                                {profileUser.industry}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: About (bio) */}
                    {profileUser.bio && (
                      <div>
                        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, margin: '0 0 6px' }}>About</p>
                        <p style={{
                          fontFamily: dmSans, fontSize: 15, color: '#555', lineHeight: 1.6, margin: 0,
                          wordBreak: 'break-word',
                        }}>
                          {!bioExpanded && profileUser.bio.length > 300
                            ? profileUser.bio.slice(0, 300) + '…'
                            : profileUser.bio
                          }
                        </p>
                        {profileUser.bio.length > 300 && (
                          <button onClick={() => setBioExpanded(!bioExpanded)} style={{
                            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E85D20',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            marginTop: 4, minHeight: 'auto', width: 'auto',
                          }}>
                            {bioExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIVITY BLOCK — only for parents / alumni helpers with data */}
              {isHelperOrParent && (profileUser.students_helped > 0 || profileUser.answers_given > 0 || profileUser.intros_made > 0) && (
                <div style={{
                  margin: '16px 24px 0', padding: '16px 20px',
                  background: '#f4f2ee', borderRadius: 12,
                }}>
                  <p style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#999', marginBottom: 12, margin: '0 0 12px',
                  }}>
                    NETWORK ACTIVITY
                  </p>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <ActivityStat label="Students Helped" value={profileUser.students_helped} />
                    <ActivityStat label="Answers Given" value={profileUser.answers_given} />
                    <ActivityStat label="Intros Made" value={profileUser.intros_made} />
                  </div>
                  {profileUser.karma_level && profileUser.karma_points != null && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{
                        height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 2, background: '#E85D20',
                          width: `${Math.min((profileUser.karma_points || 0) % 100, 100)}%`,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <p style={{
                        fontFamily: dmSans, fontSize: 11, color: '#888', marginTop: 6, margin: '6px 0 0',
                      }}>
                        {profileUser.karma_level} · {profileUser.karma_points || 0} points
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FOOTER ROW */}
              <div style={{
                padding: '16px 24px 20px', marginTop: 16,
                borderTop: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {memberSince ? (
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: '#999', margin: 0 }}>
                    Member since {memberSince}
                  </p>
                ) : <span />}

                {!isOwnProfile && (
                  <button onClick={handleMessage} style={{
                    fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E85D20',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    minHeight: 'auto', width: 'auto',
                  }}>
                    Message {firstName} →
                  </button>
                )}
              </div>
            </>
          )}

          {/* Bottom fade indicator */}
          <div style={{
            position: 'sticky', bottom: 0, left: 0, right: 0, height: 24,
            background: 'linear-gradient(transparent, rgba(255,255,255,0.9))',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideUp { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes pmSpin { to { transform: rotate(360deg); } }

        /* Mobile: full screen drawer from bottom */
        @media (max-width: 640px) {
          .profile-modal-shell {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            max-width: 100% !important;
            max-height: 92vh !important;
            border-radius: 20px 20px 0 0 !important;
            animation: pmDrawerUp 0.3s ease !important;
          }
          .profile-two-col {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pmDrawerUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}

function ActivityStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a',
        lineHeight: 1, margin: '0 0 4px',
      }}>
        {value > 0 ? value : '–'}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: '#888', margin: 0 }}>{label}</p>
    </div>
  );
}