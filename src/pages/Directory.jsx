import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import MessageUserModal from '../components/directory/MessageUserModal';
import ProfileModal from '../components/directory/ProfileModal';
import MessageComposerModal from '@/components/composer/MessageComposerModal';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';

// Error boundary wrapper for modal
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Modal crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail — just close the modal
    }
    return this.props.children;
  }
}

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const PAGE_SIZE = 24;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeHelpTag(help) {
  const h = (help || '').toLowerCase().replace(/_/g, ' ');
  if (h.includes('introduction') || h.includes('intro') || h.includes('network')) return 'Introductions';
  if (h.includes('resume') || h.includes('linkedin')) return 'Resume Review';
  if (h.includes('career') || h.includes('advice') || h.includes('guidance')) return 'Career Advice';
  if (h.includes('interview') || h.includes('mock')) return 'Interview Prep';
  if (h.includes('job') && (h.includes('lead') || h.includes('referral'))) return 'Job Referrals';
  if (h.includes('industry') || h.includes('insight')) return 'Industry Insights';
  if (h.includes('mentor')) return 'Mentorship';
  return null;
}

function getHelpTags(user) {
  const raw = [...(user.ways_to_help || []), ...(user.help_types || [])];
  const tags = [...new Set(raw.map(normalizeHelpTag).filter(Boolean))];
  return tags.slice(0, 3);
}

const AVATAR_COLORS = [
  ['#E85D20', '#c9471a'],
  ['#0821A5', '#061680'],
  ['#c9a84c', '#a8872e'],
  ['#2d6a4f', '#1b4332'],
  ['#6b21a8', '#4c1d95'],
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ── Member Card ───────────────────────────────────────────────────────────────

function MemberCard({ user, onMessage, onViewProfile }) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(user.full_name);
  const [avatarFrom, avatarTo] = getAvatarColor(user.full_name);
  const helpTags = getHelpTags(user);
  const isParent = user.persona === 'parent';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(232,93,32,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(232,93,32,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.2s ease',
        cursor: 'default',
        height: '100%',
      }}
    >
      {/* Top row — avatar + name + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${avatarFrom}, ${avatarTo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff',
          boxShadow: `0 4px 12px ${avatarFrom}40`,
        }}>
          {initials}
        </div>

        {/* Name + school */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: '#fff', margin: '0 0 4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {user.full_name || 'Anonymous'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {/* Persona badge */}
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 700,
              color: isParent ? '#E85D20' : '#c9a84c',
              background: isParent ? 'rgba(232,93,32,0.12)' : 'rgba(201,168,76,0.12)',
              border: `1px solid ${isParent ? 'rgba(232,93,32,0.25)' : 'rgba(201,168,76,0.25)'}`,
              borderRadius: 100, padding: '2px 8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {isParent ? 'Parent' : 'Alumni'}
            </span>
            {/* School */}
            {user.school_name && (
              <span style={{
                fontFamily: dmSans, fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
              }}>
                {user.school_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Company + role */}
      {(user.company || user.job_title) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 14 }}>💼</span>
          <p style={{
            fontFamily: dmSans, fontSize: 13,
            color: 'rgba(255,255,255,0.65)', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {[user.job_title, user.company].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* Industry */}
      {user.industry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🏷</span>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 500,
            color: 'rgba(255,255,255,0.4)', margin: 0,
            textTransform: 'capitalize',
          }}>
            {user.industry}
          </p>
        </div>
      )}

      {/* Help tags */}
      {helpTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {helpTags.map((tag, i) => (
            <span key={i} style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100, padding: '3px 10px',
              letterSpacing: '0.04em',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Founding badge */}
      {user.is_founding_member && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11 }}>🏅</span>
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 600,
            color: '#c9a84c', letterSpacing: '0.06em',
          }}>Founding Member</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onMessage(user)}
          style={{
            flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 600,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 8, padding: '9px 0', cursor: 'pointer',
            minHeight: 'auto', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Message
        </button>
        <button
          onClick={() => onViewProfile(user.id)}
          style={{
            flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '9px 0', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({ count, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, padding: '12px 24px',
        background: active ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 100, cursor: 'pointer', minHeight: 'auto',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{
        fontFamily: playfair, fontSize: 22, fontWeight: 700,
        color: active ? '#E85D20' : '#fff', lineHeight: 1,
      }}>
        {count === null ? '—' : count.toLocaleString()}
      </span>
      <span style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 600,
        color: active ? '#E85D20' : 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </button>
  );
}

// ── Main Directory ────────────────────────────────────────────────────────────

export default function Directory() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incompleteProfile, setIncompleteProfile] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [helpFilter, setHelpFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const isFastIQ = !!(
    user?.fastiq_setup_complete ||
    user?.subscription_status === 'active' ||
    user?.membership_tier === 'fastiq' ||
    user?.trial_status === 'active' ||
    user?.fastiq_trial_active === true ||
    user?.is_founding_member === true
  );

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('dir-fonts')) {
      const link = document.createElement('link');
      link.id = 'dir-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('getDirectoryUsers', {});
      const result = response?.data || response;

      if (result?.error === 'incomplete_profile') {
        setIncompleteProfile(result);
        setLoading(false);
        return;
      }
      if (result?.error) throw new Error(result.error);

      const raw = result?.data || [];

      // Filter to helpers only — exclude students and seekers
      const helpers = raw.filter(u => {
        if (u.persona === 'student' || u.persona === 'gator') return false;
        if (u.persona === 'alumni' && u.alumni_intent === 'seeking_help') return false;
        return true;
      });

      setAllUsers(helpers);
    } catch (err) {
      console.error('[Directory] Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = () => loadData();
    document.addEventListener('cff:pull-refresh', handler);
    return () => document.removeEventListener('cff:pull-refresh', handler);
  }, [loadData]);

  // Stats
  const stats = useMemo(() => ({
    total: allUsers.length,
    parents: allUsers.filter(u => u.persona === 'parent').length,
    alumni: allUsers.filter(u => u.persona === 'alumni').length,
  }), [allUsers]);

  // Industries
  const industries = useMemo(() => {
    return [...new Set(allUsers.map(u => u.industry).filter(Boolean))].sort();
  }, [allUsers]);

  const helpTypes = ['Introductions', 'Resume Review', 'Career Advice', 'Interview Prep', 'Job Referrals', 'Industry Insights', 'Mentorship'];

  // Filtered users
  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    if (roleFilter !== 'all') {
      users = users.filter(u => u.persona === roleFilter);
    }
    if (industryFilter !== 'all') {
      users = users.filter(u => u.industry === industryFilter);
    }
    if (helpFilter !== 'all') {
      users = users.filter(u => getHelpTags(u).includes(helpFilter));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      users = users.filter(u =>
        u.full_name?.toLowerCase().includes(term) ||
        u.company?.toLowerCase().includes(term) ||
        u.job_title?.toLowerCase().includes(term) ||
        u.industry?.toLowerCase().includes(term) ||
        u.bio?.toLowerCase().includes(term)
      );
    }

    users.sort((a, b) => {
      if (a.is_founding_member && !b.is_founding_member) return -1;
      if (!a.is_founding_member && b.is_founding_member) return 1;
      const aScore = [a.company, a.job_title, a.bio, a.industry].filter(Boolean).length;
      const bScore = [b.company, b.job_title, b.bio, b.industry].filter(Boolean).length;
      return bScore - aScore;
    });

    return users;
  }, [allUsers, roleFilter, industryFilter, helpFilter, searchTerm]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, roleFilter, industryFilter, helpFilter]);

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  const handleMessage = (u) => { 
  setSelectedUser(u); 
  setMessageModalOpen(true);
};
  const handleViewProfile = (id) => { setSelectedProfileId(id); setProfileModalOpen(true); };
  const clearFilters = () => { setSearchTerm(''); setRoleFilter('all'); setIndustryFilter('all'); setHelpFilter('all'); };

  // ── Incomplete profile state ──
  if (incompleteProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav user={user} currentPage="Directory" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{ fontFamily: playfair, fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Almost there
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
              Add your school to your profile to see your network.
            </p>
            <button onClick={() => navigate('ProfileEdit')} style={{
              background: '#E85D20', color: '#fff', border: 'none',
              borderRadius: 12, padding: '14px 32px',
              fontFamily: dmSans, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', minHeight: 'auto',
            }}>
              Complete My Profile →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav user={user} currentPage="Directory" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)',
            borderTop: '3px solid #E85D20', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav user={user} currentPage="Directory" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            Something went wrong loading the directory.
          </p>
          <button onClick={loadData} style={{
            background: '#E85D20', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 28px',
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', minHeight: 'auto',
          }}>Try Again</button>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(232,93,32,0.07) 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        <DashboardNav user={user} currentPage="Directory" />

        {/* Founding banner */}
        {!isFastIQ && showBanner && (
          <div style={{ padding: '12px 24px 0', maxWidth: 960, margin: '0 auto', width: '100%' }}>
            <FoundingMemberBanner
              show={true}
              onUpgrade={() => navigate('FastIQDashboard')}
              onDismiss={() => setShowBanner(false)}
            />
          </div>
        )}

        {/* ── HERO ── */}
        <div style={{
          maxWidth: 960, margin: '0 auto', width: '100%',
          padding: '48px 24px 32px', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 16px',
          }}>
            Your Network
          </p>
          <h1 style={{
            fontFamily: playfair,
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}>
            Every door starts with a conversation.
          </h1>
          <p style={{
            fontFamily: dmSans, fontSize: 16,
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
            margin: '0 0 32px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Parents and alumni — here to open their networks for your student.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <StatPill count={stats.total} label="Total Helpers" active={roleFilter === 'all'} onClick={() => setRoleFilter('all')} />
            <StatPill count={stats.parents} label="Parents" active={roleFilter === 'parent'} onClick={() => setRoleFilter('parent')} />
            <StatPill count={stats.alumni} label="Alumni" active={roleFilter === 'alumni'} onClick={() => setRoleFilter('alumni')} />
          </div>
        </div>

        {/* ── SEARCH + FILTERS ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(13,17,23,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', fontSize: 14,
                color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
              }}>🔍</span>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, or industry..."
                style={{
                  width: '100%', fontFamily: dmSans, fontSize: 14,
                  color: '#fff', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '10px 12px 10px 36px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Industry filter */}
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              style={{
                fontFamily: dmSans, fontSize: 13,
                color: industryFilter === 'all' ? 'rgba(255,255,255,0.5)' : '#fff',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px',
                outline: 'none', cursor: 'pointer',
                flex: '0 1 160px',
              }}
            >
              <option value="all">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind} style={{ background: '#1a1a2e' }}>
                  {ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
            </select>

            {/* Help type filter */}
            <select
              value={helpFilter}
              onChange={e => setHelpFilter(e.target.value)}
              style={{
                fontFamily: dmSans, fontSize: 13,
                color: helpFilter === 'all' ? 'rgba(255,255,255,0.5)' : '#fff',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px',
                outline: 'none', cursor: 'pointer',
                flex: '0 1 160px',
              }}
            >
              <option value="all">All Help Types</option>
              {helpTypes.map(h => (
                <option key={h} value={h} style={{ background: '#1a1a2e' }}>{h}</option>
              ))}
            </select>

            {/* Result count */}
            <p style={{
              fontFamily: dmSans, fontSize: 12,
              color: 'rgba(255,255,255,0.3)', margin: 0,
              whiteSpace: 'nowrap', flex: '0 0 auto',
            }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'helper' : 'helpers'}
            </p>

            {/* Clear filters */}
            {(searchTerm || roleFilter !== 'all' || industryFilter !== 'all' || helpFilter !== 'all') && (
              <button
                onClick={clearFilters}
                style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 600,
                  color: '#E85D20', background: 'none', border: 'none',
                  cursor: 'pointer', minHeight: 'auto', padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Clear filters ×
              </button>
            )}
          </div>
        </div>

        {/* ── CARDS ── */}
        <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '28px 24px 80px' }}>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <p style={{ fontFamily: playfair, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                No helpers found
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                style={{
                  background: 'rgba(232,93,32,0.15)', color: '#E85D20',
                  border: '1px solid rgba(232,93,32,0.3)',
                  borderRadius: 10, padding: '12px 24px',
                  fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="dir-grid">
                {visibleUsers.map(u => (
                  <MemberCard key={u.id} user={u} onMessage={handleMessage} onViewProfile={handleViewProfile} />
                ))}
              </div>

              {visibleCount < filteredUsers.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                    style={{
                      fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                      color: '#fff', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '12px 32px',
                      cursor: 'pointer', minHeight: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  >
                    Load more · {filteredUsers.length - visibleCount} remaining
                  </button>
                </div>
              )}

              {visibleCount >= filteredUsers.length && filteredUsers.length > 0 && (
                <p style={{
                  textAlign: 'center', marginTop: 40,
                  fontFamily: dmSans, fontSize: 13,
                  color: 'rgba(255,255,255,0.2)', fontStyle: 'italic',
                }}>
                  You've seen everyone in your network.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        .dir-grid { grid-template-columns: repeat(3, 1fr) !important; grid-auto-rows: 1fr !important; }
        @media (max-width: 768px) { .dir-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .dir-grid { grid-template-columns: 1fr !important; } }
        select option { background: #1a1a2e; color: #fff; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: rgba(232,93,32,0.4) !important; }
      `}</style>

      {selectedUser && (
        <MessageUserModal
          isOpen={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          recipientUser={selectedUser}
        />
      )}
      {selectedProfileId && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => { setProfileModalOpen(false); setSelectedProfileId(null); }}
          userId={selectedProfileId}
          onMessage={(recipient) => {
            setSelectedUser(recipient);
            setMessageModalOpen(true);
            setProfileModalOpen(false);
          }}
        />
      )}
    </div>
  );
}