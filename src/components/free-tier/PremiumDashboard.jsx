import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { getVerifiedNetworkCompanies } from '@/functions/getVerifiedNetworkCompanies';
import { getThemeForSchool } from '@/lib/campusThemes';
import { CliffLogo } from '@/components/brand/CliffLogo';
import PremiumCareerAssetsCard from './PremiumCareerAssetsCard';
import PremiumParentNetworkWidget from './PremiumParentNetworkWidget';
import PremiumHiringChat from './PremiumHiringChat';
import MobileBottomNav from './PremiumMobileNav';
import MatchFlashCarousel from './MatchFlashCarousel';
import ColdDiscoverySection from './ColdDiscoverySection';
import OrganizedFeeds from './OrganizedFeeds';
import PipelineKanbanModal from './PipelineKanbanModal';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import EditGoalsModal from './EditGoalsModal';

const dm = "'DM Sans', system-ui, sans-serif";

function PremiumNav({ user, onEditGoals, navRef }) {
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (navRef) navRef.current = { openDropdown: () => setDropdownOpen(true) };
  }, [navRef]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CliffLogo size="text-xl" />
          <span style={{
            fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 100, padding: '5px 12px',
            boxShadow: '0 0 12px rgba(124,58,237,0.35), 0 1px 4px rgba(0,0,0,0.1)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', display: 'inline-block' }} />
            Premium Active
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(p => !p)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              {user?.full_name || user?.email}
              <span style={{ fontSize: 10, color: '#9ca3af' }}>▾</span>
            </button>
            {dropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 220, zIndex: 200, overflow: 'hidden' }}>
                <button
                  onClick={() => { setDropdownOpen(false); onEditGoals(); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  🎯 Update Career Goals
                </button>

                {/* ── Resume Management Section ── */}
                <div style={{ padding: '8px 16px 4px', borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Resume Management</p>
                </div>
                <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: user?.resume_filename ? '#111827' : '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.resume_filename || 'No resume uploaded'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); if (user?.resume_url) window.open(user.resume_url, '_blank'); else navigate('ResumeTailoring'); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '11px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  ⬇️ Download File
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('ResumeTailoring'); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '11px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  🔄 Swap / Update File
                </button>
                {/* ── End Resume Management ── */}

                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#ef4444', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ emoji, label, value, theme, isLoading }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 18px', flex: '1 1 0', minWidth: 0 }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoading ? (
            <>
              <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinStat 0.8s linear infinite' }} />
              <style>{`@keyframes spinStat{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Scouting...</span>
            </>
          ) : value}
        </p>
        <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: 0, whiteSpace: 'nowrap' }}>{label}</p>
      </div>
    </div>
  );
}

function PremiumActiveProfilePill({ user, onPillClick }) {
  const filename = user?.resume_filename;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: filename ? '#f0fdf4' : '#fffbeb', border: `1px solid ${filename ? '#bbf7d0' : '#fde68a'}`, borderRadius: 12, padding: '9px 14px' }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>📄</span>
      <button onClick={onPillClick} title="Click to manage resume in profile menu" style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: filename ? '#15803d' : '#92400e', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, textAlign: 'left', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'underline dotted' }}>
        {filename ? `Active Profile: ${filename}` : 'No resume uploaded yet'}
      </button>
      <button onClick={() => navigate('ResumeTailoring')} style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: filename ? '#15803d' : '#d97706', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {filename ? '⚡ Tailor Resume' : '⬆️ Upload Resume'}
      </button>
    </div>
  );
}

export default function PremiumDashboard({ user: userProp, parentCount, college, theme }) {
  const [user, setUser] = useState(userProp);
  
  const t = theme || getThemeForSchool(college || 'UF');
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const shortName = t.shortName || college || 'your university';
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [signalAdditions, setSignalAdditions] = useState([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkStats, setNetworkStats] = useState({ companies: 0, alumni: 0, parents: 0 });
  const [showColdDiscovery, setShowColdDiscovery] = useState(false);
  const [warmCompanyNames, setWarmCompanyNames] = useState([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showKanbanModal, setShowKanbanModal] = useState(false);
  const navRef = useRef(null);

  // Listen for goals modal open event from child components
  useEffect(() => {
    const handleOpenGoals = () => setShowGoalsModal(true);
    window.addEventListener('cff:open-goals-modal', handleOpenGoals);
    return () => window.removeEventListener('cff:open-goals-modal', handleOpenGoals);
  }, []);

  useEffect(() => {
    const industries = user?.career_goals?.target_industries || [];
    getVerifiedNetworkCompanies({ target_industries: industries })
      .then(res => {
        const companies = res?.data?.companies || [];
        const totalAlumni = companies.reduce((s, c) => s + c.alumniCount, 0);
        const totalParents = companies.reduce((s, c) => s + c.parentCount, 0);
        setNetworkStats({
          companies: companies.length,
          alumni: totalAlumni,
          parents: totalParents,
        });
        setWarmCompanyNames(companies.map(c => c.company));
      })
      .catch(() => {
        setNetworkStats({ companies: 0, alumni: 0, parents: 0 });
      });
  }, [user?.career_goals?.target_industries]);

  const handleBackdoorClick = (job) => {
    setSelectedJob(job);
    setSelectedSignal(null); // clear any signal selection
    // Scroll CliFF panel into view
    setTimeout(() => {
      document.getElementById('cliff-chat-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddFromSignals = (company, roles) => {
    const newCards = roles.map(r => ({
      company,
      role: r.title,
      source: 'Signal Feed · Agent discovered',
      recruiter: '—',
      posted: 'Not yet public',
      logo: '🤖',
      alumCount: 0,
      fromSignal: true,
    }));
    setSignalAdditions(prev => [...prev, ...newCards]);
  };
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showParentStat = parentCount === null || parentCount >= 20;
  const alumniCount = networkStats?.alumni || 0;
  const parentsCount = networkStats?.parents || 0;
  const companiesCount = networkStats?.companies || 0;
  const networkCount = alumniCount + parentsCount;
  const stats = [
    { emoji: '🤖', label: 'Agent Status', value: 'ACTIVE' },
    { emoji: '📄', label: 'Resume', value: user?.resume_filename ? 'On File' : 'Not Uploaded' },
    { emoji: '🐊', label: 'Synced Network', value: `${networkCount}` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <PremiumNav user={user} onEditGoals={() => setShowGoalsModal(true)} navRef={navRef} />

      {/* Mobile-first responsive container */}
      <style>{`
        @media (max-width: 768px) {
          .premium-dashboard-container {
            padding: 12px !important;
          }
          .premium-ftd-grid {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
          }
          .premium-ftd-sidebar {
            width: 100% !important;
          }
          .premium-mobile-bottom-nav {
            display: flex !important;
          }
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Premium Welcome Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, #0A0A0A 0%, #0d1a3a 50%, ${t.primary}33 100%)`,
        padding: isMobile ? '20px 16px 24px' : '28px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `${t.primary}22`, filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(51,65,85,1)', borderRadius: 100, padding: '4px 12px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Premium Account</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Let's get locked in and get you hired, {firstName} 🚀
          </h1>
          <p style={{ fontFamily: dm, fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', lineHeight: 1.7, maxWidth: 680 }}>
            Your career agent is live and working 24/7 — scouting roles that match your goals and mapping your{' '}
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{shortName}</strong> alumni backdoor channels.{' '}
            <strong style={{ color: '#E85D20' }}>Let's go get this offer.</strong>
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <StatPill key={i} {...s} theme={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Network Modal */}
      {showNetworkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowNetworkModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 420, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Your {college || 'UF'} Network</p>
              <button onClick={() => setShowNetworkModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#6b7280', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { emoji: '🎓', label: 'Verified Alumni in Network', value: `${alumniCount}`, color: '#2563eb' },
                { emoji: '👨‍👩‍👧', label: 'Verified Parents in Network', value: `${parentsCount}`, color: '#7c3aed' },
                { emoji: '🏢', label: 'Companies with Inside Contacts', value: `${companiesCount}`, color: '#0891b2' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px' }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontFamily: dm, fontSize: 18, fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: '16px 0 0', textAlign: 'center' }}>Counts reflect verified members who have joined and listed their employer in the {college || 'UF'} network.</p>
          </div>
        </div>
      )}

      {/* ── Three-Tier Organized Feeds ── */}
      <div style={{ background: '#f8f9fc', paddingTop: isMobile ? 8 : 16, paddingBottom: 16 }}>
        <OrganizedFeeds 
          key={`${JSON.stringify(user?.career_goals?.target_roles)}-${JSON.stringify(user?.career_goals?.target_industries)}-${user?.career_goals?.company_size_preference}`} 
          user={user} 
          verifiedAlumniCount={alumniCount} 
          verifiedParentsCount={parentsCount} 
          isPremium={true}
        />
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '12px' : '28px 20px 80px' }} className="premium-dashboard-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="premium-ftd-grid">

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Pipeline removed — accessible via Kanban modal only */}
          </div>

          {/* Right Column (Desktop Only) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="premium-ftd-sidebar desktop-only">
            {/* Active Profile Status Pill */}
            <PremiumActiveProfilePill user={user} onPillClick={() => navRef.current?.openDropdown()} />

            {/* Parent Network — unlocked if ≥20 parents */}
            {(parentCount === null || parentCount >= 20) && (
              <PremiumParentNetworkWidget parentCount={parentCount} college={college} theme={t} user={user} />
            )}

            <div id="cliff-chat-panel">
              <PremiumHiringChat user={user} selectedSignal={selectedSignal} selectedJob={selectedJob} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav user={user} onOpenPipeline={() => setShowKanbanModal(true)} />

      {/* Pipeline Kanban Modal */}
      {showKanbanModal && (
        <PipelineKanbanModal
          isOpen={showKanbanModal}
          onClose={() => setShowKanbanModal(false)}
          user={user}
        />
      )}

      {showGoalsModal && (
        <EditGoalsModal
          goals={user?.career_goals}
          user={user}
          onClose={() => setShowGoalsModal(false)}
          onSave={async (_, refreshedUser) => {
            // Fetch FRESH user data to ensure career_goals are updated
            const freshUser = await base44.auth.me();
            if (freshUser) setUser(freshUser);
            else if (refreshedUser) setUser(refreshedUser);
            setShowGoalsModal(false);
          }}
        />
      )}
    </div>
  );
}