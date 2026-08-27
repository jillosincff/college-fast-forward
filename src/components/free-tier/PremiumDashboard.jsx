import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { getVerifiedNetworkCompanies } from '@/functions/getVerifiedNetworkCompanies';
import { getThemeForSchool } from '@/lib/campusThemes';
import { CliffLogo } from '@/components/brand/CliffLogo';
import PremiumResumeCard from './PremiumResumeCard';
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
import DashboardBottomNav from './DashboardBottomNav';
import ToolsTab from './ToolsTab';
import ProgressTab from './ProgressTab';
import PremiumActivationSequence from './PremiumActivationSequence';
import PeakMomentSharePrompt from './PeakMomentSharePrompt';
import WarmApplyBar from './WarmApplyBar';
import TodaysBestMoves from './TodaysBestMoves';
import JessePeopleCard from '@/components/premium/JessePeopleCard';
import ProHomeFeed from '@/components/premium/ProHomeFeed';
import MomentumScore from './MomentumScore';
import ProgressSinceLastVisit from './ProgressSinceLastVisit';
import JobWorkspaceCard from './JobWorkspaceCard';
import { Wrench, LogOut, Rocket, FileText, Users, MessageCircle, GraduationCap, Building2, CalendarCheck, Clock, Eye } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

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
                {(user?.role === 'admin' || user?.roles?.includes('admin')) && (
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('admin'); }}
                    style={{ fontFamily: dm, fontSize: 13, color: '#7c3aed', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Wrench size={14} /> Admin Dashboard
                  </button>
                )}

                <button
                  onClick={() => { setDropdownOpen(false); navigate('CliffMemory'); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  🧠 What CLIFF Knows About You
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#ef4444', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ icon: Icon, label, value, sublabel, theme, isLoading, warning, isMobile, onClick }) {
  // On mobile, a pill with a sublabel (the wide "Active Connections" one) takes a
  // full row so its value + sublabel never get crushed/clipped off the edge.
  const flexBasis = isMobile ? (sublabel ? '100%' : 'calc(50% - 6px)') : '1 1 0';
  return (
    <div onClick={onClick} style={{
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: warning ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)',
      border: warning ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14,
      padding: isMobile ? '11px 14px' : '12px 18px',
      flex: isMobile ? `1 1 ${flexBasis}` : '1 1 0',
      minWidth: 0,
      position: 'relative',
    }}>
      <Icon size={20} color="rgba(255,255,255,0.85)" style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoading ? (
            <>
              <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinStat 0.8s linear infinite' }} />
              <style>{`@keyframes spinStat{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Scouting...</span>
            </>
          ) : (
            <>
              {value}
              {warning && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fbbf24',
                  background: 'rgba(251,191,36,0.2)',
                  borderRadius: 100,
                  padding: '2px 6px',
                  marginLeft: 4,
                }}>
                  Upload
                </span>
              )}
            </>
          )}
        </p>
        <p style={{ fontFamily: dm, fontSize: 10, color: warning ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.55)', margin: 0, whiteSpace: isMobile ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
        {sublabel && (
          <p style={{ fontFamily: dm, fontSize: 9, color: 'rgba(255,255,255,0.7)', margin: '3px 0 0' }}>{sublabel}</p>
        )}
      </div>
    </div>
  );
}



export default function PremiumDashboard({ user: userProp, parentCount, college, theme }) {
  const [user, setUser] = useState(userProp);
  const t = theme || getThemeForSchool(college || 'UF');
  const lastUserFetchRef = useRef(0);

  // Fetch fresh user data on mount and when page regains focus
  useEffect(() => {
    // Throttle: refetch the user at most once every 30s to avoid hammering the API
    const loadFreshUser = async () => {
      const now = Date.now();
      if (now - lastUserFetchRef.current < 30000) return;
      lastUserFetchRef.current = now;
      const fresh = await base44.auth.me().catch(() => null);
      if (fresh) setUser(fresh);
    };
    loadFreshUser();

    // Refresh when returning to this tab/window (still throttled)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadFreshUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Listen for custom user update event from Resume Studio — use the
    // pushed payload directly, no extra API call needed
    const handleUserUpdate = (e) => {
      if (e.detail) setUser(e.detail);
    };
    window.addEventListener('cff:user-updated', handleUserUpdate);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('cff:user-updated', handleUserUpdate);
    };
  }, []);
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const shortName = t.shortName || college || 'your university';
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [signalAdditions, setSignalAdditions] = useState([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkStats, setNetworkStats] = useState({ companies: 0, alumni: 0, parents: 0 });
  const [showColdDiscovery, setShowColdDiscovery] = useState(false);
  const [warmCompanyNames, setWarmCompanyNames] = useState([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showKanbanModal, setShowKanbanModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pipelineCount, setPipelineCount] = useState(null);
  const [showMoreJobs, setShowMoreJobs] = useState(false); // job feed is the escape hatch, not the default
  const navRef = useRef(null);

  // Outcome stats for the hero: applications ready, jobs to apply to, interviews, follow-ups
  const [outcome, setOutcome] = useState(null);
  useEffect(() => {
    if (!user?.email) return;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 50).catch(() => []),
      base44.entities.UserDailyDrop.filter({ user_email: user.email, drop_date: today }).catch(() => []),
    ]).then(([rows, resumes, drops]) => {
      setPipelineCount(rows?.length ?? 0);
      const daysSince = r => (Date.now() - new Date(r.status_date || r.created_date).getTime()) / 86400000;
      const drop = (drops || [])[0];
      setOutcome({
        appsReady: (resumes || []).filter(r => r.status === 'completed' && !r.downloaded_at).length,
        jobsToApply: drop ? (drop.slots || []).filter(s => !(drop.actioned_keys || []).includes(s.key)).length : 0,
        // Opportunities CLIFF is actively evaluating — shown instead of a zero recommendation count
        watched: (drop ? (drop.slots || []).length : 0) + (rows || []).filter(r => ['identified', 'matched'].includes(r.status)).length,
        interviews: (rows || []).filter(r => r.status === 'interview').length,
        followUps: (rows || []).filter(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5).length,
      });
    });
  }, [user?.email]);

  // Listen for goals modal open event from child components
  useEffect(() => {
    const handleOpenGoals = () => setShowGoalsModal(true);
    window.addEventListener('cff:open-goals-modal', handleOpenGoals);
    return () => window.removeEventListener('cff:open-goals-modal', handleOpenGoals);
  }, []);

  // Bottom-nav "Pipeline" tab opens the same Application Tracker view as the top tab
  useEffect(() => {
    const handleSwitchTab = (e) => { if (e.detail) setActiveTab(e.detail); };
    window.addEventListener('cff:switch-dashboard-tab', handleSwitchTab);
    return () => window.removeEventListener('cff:switch-dashboard-tab', handleSwitchTab);
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
    setShowChat(true); // open the floating CLIFF chat
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
  // Trust rule: never show a zero that implies CLIFF has nothing.
  // Zero-value metrics are hidden; a zero recommendation count becomes
  // "Opportunities Being Watched" so the dashboard always communicates progress.
  let stats;
  if (outcome === null) {
    stats = [
      { icon: FileText, label: 'Applications Ready', value: '', isLoading: true },
      { icon: Rocket, label: 'Jobs Worth Applying To', value: '', isLoading: true },
      { icon: CalendarCheck, label: 'Interviews Scheduled', value: '', isLoading: true },
      { icon: Clock, label: 'Follow-Ups Due', value: '', isLoading: true },
    ];
  } else {
    stats = [];
    if (outcome.jobsToApply > 0) {
      stats.push({ icon: Rocket, label: 'Jobs Worth Applying To', value: `${outcome.jobsToApply}` });
    } else if (outcome.watched > 0) {
      stats.push({ icon: Eye, label: '👀 Opportunities Being Watched', value: `${outcome.watched}`, sublabel: "I'll only recommend them when they're worth your time." });
    }
    if (outcome.appsReady > 0) stats.push({ icon: FileText, label: 'Applications Ready', value: `${outcome.appsReady}` });
    if (outcome.interviews > 0) stats.push({ icon: CalendarCheck, label: 'Interviews Scheduled', value: `${outcome.interviews}` });
    if (outcome.followUps > 0) stats.push({ icon: Clock, label: 'Follow-Ups Due', value: `${outcome.followUps}` });
    if (stats.length === 0) {
      stats.push({ icon: Eye, label: 'Next Opportunity', value: '👀', sublabel: "I'm scouting right now — I'll flag it the moment something is worth your time." });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      {/* One-time premium activation moment on first visit */}
      <PremiumActivationSequence user={user} shortName={shortName} networkCount={networkCount} companiesCount={companiesCount} />

      {/* Referral prompt at peak moments (reply received / interview landed) */}
      <PeakMomentSharePrompt user={user} />

      <PremiumNav user={user} onEditGoals={() => setShowGoalsModal(true)} navRef={navRef} />

      {/* Tab Navigation */}
      <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tools Tab — paste-link hero + Ask CLIFF live here, not on the home */}
      {activeTab === 'tools' && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 100px' }}>
          <WarmApplyBar user={user} />
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => setShowChat(true)}
              style={{ width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '14px 20px', cursor: 'pointer', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <MessageCircle size={16} /> Ask CLIFF
            </button>
          </div>
          <ToolsTab user={user} onUpgrade={() => {}} />
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }}>
          <ProgressTab user={user} onUpgrade={() => {}} />
        </div>
      )}

      {/* CLIFF Chat Panel — opened from the Tools tab, X closes it */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? 0 : 40,
          right: isMobile ? 0 : 40,
          left: isMobile ? 0 : 'auto',
          top: isMobile ? 0 : 'auto',
          width: isMobile ? '100%' : 400,
          maxHeight: isMobile ? '100%' : 'calc(100vh - 80px)',
          height: isMobile ? '100%' : 'auto',
          background: '#fff',
          borderRadius: isMobile ? 0 : 20,
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', flexShrink: 0 }}>
            <span style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={16} color="#fff" /> Ask CLIFF
            </span>
            <button
              onClick={() => setShowChat(false)}
              aria-label="Close CLIFF chat"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1, padding: '6px 10px', minHeight: 'auto', minWidth: 'auto' }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <PremiumHiringChat user={user} selectedSignal={selectedSignal} selectedJob={selectedJob} />
          </div>
        </div>
      )}

      {/* Mobile-first responsive container */}
      <style>{`
        @media (max-width: 768px) {
          .premium-dashboard-container {
            padding: 12px 12px 96px !important;
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

      {/* ── Dashboard Tab — same layout as free home, with people unlocked ── */}
      {activeTab === 'dashboard' && (
        <>
          <ProHomeFeed user={user} onOpenTools={() => setActiveTab('tools')} />
          <MobileBottomNav user={user} onOpenPipeline={() => setShowKanbanModal(true)} />
        </>
      )}

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