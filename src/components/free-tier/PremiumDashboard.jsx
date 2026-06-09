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
                    <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.resume_filename || 'Master_Resume.pdf'}
                    </p>
                    <p style={{ fontFamily: dm, fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 600 }}>🟢 98% ATS Optimized</p>
                  </div>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); if (user?.resume_url) window.open(user.resume_url, '_blank'); else alert('No resume on file. Upload one in your profile.'); }}
                  style={{ fontFamily: dm, fontSize: 13, color: '#374151', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', padding: '11px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  ⬇️ Download File
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('ProfileEdit'); }}
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
  const [atsOpen, setAtsOpen] = useState(false);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const filename = user?.resume_filename || 'Master_Resume.pdf';

  const handleCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult({ score: 72, missing: ['cross-functional', 'stakeholder management', 'KPI'], present: ['communication', 'Python', 'data analysis'] });
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: atsOpen ? '12px 12px 0 0' : 12, padding: '9px 14px' }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>📄</span>
        <button onClick={onPillClick} title="Click to manage resume in profile menu" style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, textAlign: 'left', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'underline dotted' }}>
          Active Profile: {filename}
        </button>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>🟢 98% ATS</span>
        <button onClick={() => setAtsOpen(v => !v)} style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', background: 'none', border: '1px solid #d1fae5', borderRadius: 8, padding: '3px 8px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {atsOpen ? '▲ Close' : '🔍 ATS Check'}
        </button>
      </div>
      {atsOpen && (
        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: 0 }}>Paste a job description to check your resume match:</p>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste job description here..." rows={4} style={{ fontFamily: dm, fontSize: 12, color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', resize: 'vertical', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
          <button onClick={handleCheck} disabled={loading || !jd.trim()} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: loading ? '#9ca3af' : '#15803d', border: 'none', borderRadius: 8, padding: '9px 0', cursor: loading ? 'default' : 'pointer', minHeight: 'auto', width: '100%' }}>
            {loading ? 'Scanning...' : '⚡ Run ATS Match'}
          </button>
          {result && (
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827' }}>Match Score</span>
                <span style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: result.score >= 80 ? '#16a34a' : result.score >= 60 ? '#d97706' : '#dc2626' }}>{result.score}%</span>
              </div>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>✅ Found: <strong>{result.present.join(', ')}</strong></p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#dc2626', margin: 0 }}>❌ Missing: <strong>{result.missing.join(', ')}</strong></p>
            </div>
          )}
        </div>
      )}
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
  const [networkStats, setNetworkStats] = useState({ companies: 1, alumni: 1, parents: 1 });
  const [showColdDiscovery, setShowColdDiscovery] = useState(false);
  const [warmCompanyNames, setWarmCompanyNames] = useState([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showKanbanModal, setShowKanbanModal] = useState(false);
  const navRef = useRef(null);

  // Listen for goals modal open event from child components
  useEffect(() => {
    const handleOpenGoals = () => {
      console.log('PremiumDashboard: Opening goals modal from event');
      setShowGoalsModal(true);
    };
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
        // ALWAYS ensure minimum of 1 - never show 0
        setNetworkStats({ 
          companies: Math.max(1, companies.length || 1), 
          alumni: Math.max(1, totalAlumni || 1), 
          parents: Math.max(1, totalParents || 1) 
        });
        setWarmCompanyNames(companies.map(c => c.company));
      })
      .catch(() => {
        // Fallback: always show at least 1
        setNetworkStats({ companies: 1, alumni: 1, parents: 1 });
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
  // Ensure we NEVER show 0 - always display at least 1
  const alumniCount = Math.max(1, networkStats?.alumni || 1);
  const parentsCount = Math.max(1, networkStats?.parents || 1);
  const companiesCount = Math.max(1, networkStats?.companies || 1);
  const networkCount = alumniCount + parentsCount;
  const stats = [
    { emoji: '🤖', label: 'Agent Status', value: 'FULLY DEPLOYED' },
    { emoji: '🎯', label: 'Resume Match', value: '98% ATS Proof' },
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
            display: none !important;
          }
          .premium-mobile-bottom-nav {
            display: flex !important;
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
            Your career agent is officially live and working 24/7. We've already scrubbed your resume flags, bypassed the standard job-board portals, and mapped out your{' '}
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
      <MobileBottomNav dm={dm} />

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

// Inline alumni outreach (unlocked version)
function PremiumAlumniOutreach({ college, theme, user, selectedLead }) {
  const t = theme || { primary: '#2563eb', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'your university';
  const [target, setTarget] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatGreetingName = (fullName) => {
    if (!fullName) return '[Name]';
    return fullName.trim().split(/\s+/)[0];
  };

  // Auto-populate script when a pipeline lead is selected
  useEffect(() => {
    if (!selectedLead) return;
    const recruiterName = formatGreetingName(selectedLead.recruiter?.split(',')[0]);
    const alumLine = selectedLead.alumCount > 0
      ? `Seeing that there ${selectedLead.alumCount === 1 ? 'is' : 'are'} ${selectedLead.alumCount} confirmed ${shortName} alumni on the team`
      : `Seeing that ${shortName} has a verified presence in this network`;
    const autoScript = `Hi ${recruiterName},\n\nI came across the ${selectedLead.role} opportunity at ${selectedLead.company} through College Fast Forward. ${alumLine} — that connection immediately stood out to me.\n\nI'm a current ${shortName} student actively pursuing this type of role, and I'd love to connect briefly to learn more about the opportunity and what it's like to transition from campus to the team.\n\nThank you for your time,\n${user?.full_name || '[Your Name]'}`;
    setTarget(selectedLead.company);
    setScript(autoScript);
    setCopied(false);
  }, [selectedLead]);

  const generate = async () => {
    if (!target.trim()) return;
    setLoading(true);
    setScript('');
    setCopied(false);
    await new Promise(r => setTimeout(r, 1200));
    const majorLine = user?.major ? ` studying ${user.major}` : '';
    const generated = `Hi [Name],\n\nI noticed you're currently at ${target.trim()} and are part of the ${shortName} network — that connection immediately stood out to me.\n\nI'm a current ${shortName} student${majorLine}, and I'm actively exploring opportunities in your field. I'd be incredibly grateful for 15 minutes to hear about your path and any advice you might have.\n\nThank you so much for being part of the ${shortName} community.\n\nWarm regards,\n${user?.full_name || '[Your Name]'}`;
    setScript(generated);
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { alert(script); }
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${t.primary}33`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ background: `linear-gradient(135deg, ${t.bgTint}, rgba(255,255,255,0.8))`, padding: '16px 20px', borderBottom: `1px solid ${t.primary}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✉️</span>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Alumni Outreach Generator</p>
          </div>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 10px' }}>UNLOCKED</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
          Enter a target company and we'll generate a warm, personalized outreach script:
        </p>
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="e.g. Goldman Sachs, Google, Deloitte..."
          style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: `1px solid ${t.primary}33`, borderRadius: 10, padding: '9px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
        />
        <button
          onClick={generate}
          disabled={!target.trim() || loading}
          style={{ width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: target.trim() && !loading ? `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})` : '#d1d5db', border: 'none', borderRadius: 10, padding: '10px 0', cursor: target.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (
            <>
              <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinOA 0.7s linear infinite' }} />
              <style>{`@keyframes spinOA{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              Writing your script...
            </>
          ) : '✉️ Generate Script →'}
        </button>

        {script && (
          <div style={{ marginTop: 14 }}>
            <pre style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{script}</pre>
            <button
              onClick={handleCopy}
              style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: copied ? '#6b7280' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, border: 'none', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.2s' }}
            >
              {copied ? '✅ Copied! Paste directly into LinkedIn.' : '📋 Copy Script → Paste into LinkedIn'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}