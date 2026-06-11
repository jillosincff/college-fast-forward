import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import UpgradeModal from '@/components/free-tier/UpgradeModal';
import FreeTierNav from '@/components/free-tier/FreeTierNav';
import TeaserSignalsCard from '@/components/free-tier/TeaserSignalsCard';
// CareerAssetsCard removed — resume management moved to nav dropdown
import ParentNetworkWidget from '@/components/free-tier/ParentNetworkWidget';
import PremiumDashboard from '@/components/free-tier/PremiumDashboard';
import EmailSyncBanner from '@/components/free-tier/EmailSyncBanner';
import CliffPrioritizedFeed from '@/components/free-tier/CliffPrioritizedFeed';
import LockedAlumniTeaser from '@/components/free-tier/LockedAlumniTeaser';
import NetworkPulseStrip from '@/components/free-tier/NetworkPulseStrip';
import FirstDraftReadyCard from '@/components/free-tier/FirstDraftReadyCard';
import EditGoalsModal from '@/components/free-tier/EditGoalsModal';
import { getThemeForSchool } from '@/lib/campusThemes';
import { checkIsFastIQ, checkIsTrialExpired } from '@/utils/isFastIQ';
import TrialEndedHeader from '@/components/free-tier/TrialEndedHeader';

const dm = "'DM Sans', system-ui, sans-serif";

function FirstVisitToast({ firstName, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#111827', color: '#fff', borderRadius: 16,
      padding: '16px 22px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: 480, width: 'calc(100% - 40px)',
      animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <span style={{ fontSize: 22, flexShrink: 0 }}>👋</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
          Welcome to your Command Center, {firstName}!
        </p>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
          We've saved your onboarding data. Track up to 5 jobs below. Your AI-optimized assets and active campus signals are locked and updating live in the sidebar whenever you're ready to sprint.
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, flexShrink: 0, lineHeight: 1 }}
      >×</button>
    </div>
  );
}

// ── Active Profile Status Pill ────────────────────────────────────
function ActiveProfilePill({ user, onPillClick }) {
  const [atsOpen, setAtsOpen] = useState(false);
  const filename = user?.resume_filename || 'Master_Resume.pdf';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Pill Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: atsOpen ? '12px 12px 0 0' : 12, padding: '9px 14px' }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>📄</span>
        <button
          onClick={onPillClick}
          title="Click to manage resume in profile menu"
          style={{
            fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#15803d',
            background: 'none', border: 'none', cursor: 'pointer',
            minHeight: 'auto', minWidth: 'auto', padding: 0,
            textAlign: 'left', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: 'underline dotted',
          }}
        >
          Active Profile: {filename}
        </button>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          🟢 98% ATS
        </span>
        <button
          onClick={() => setAtsOpen(v => !v)}
          title="ATS Matcher"
          style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', background: 'none', border: '1px solid #d1fae5', borderRadius: 8, padding: '3px 8px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {atsOpen ? '▲ Close' : '🔍 ATS Check'}
        </button>
      </div>

      {/* ATS Matcher Drawer — collapses below the pill */}
      {atsOpen && (
        <ATSMatcherDrawer onClose={() => setAtsOpen(false)} />
      )}
    </div>
  );
}

function ATSMatcherDrawer({ onClose }) {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    // Simulate a quick ATS scan result (free tier teaser)
    setTimeout(() => {
      setResult({
        score: 72,
        missing: ['cross-functional', 'stakeholder management', 'KPI'],
        present: ['communication', 'Python', 'data analysis'],
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: 0 }}>Paste a job description to check your resume match:</p>
      <textarea
        value={jd}
        onChange={e => setJd(e.target.value)}
        placeholder="Paste job description here..."
        rows={4}
        style={{ fontFamily: dm, fontSize: 12, color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', resize: 'vertical', width: '100%', boxSizing: 'border-box', outline: 'none' }}
      />
      <button
        onClick={handleCheck}
        disabled={loading || !jd.trim()}
        style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: loading ? '#9ca3af' : '#15803d', border: 'none', borderRadius: 8, padding: '9px 0', cursor: loading ? 'default' : 'pointer', minHeight: 'auto', width: '100%' }}
      >
        {loading ? 'Scanning...' : '⚡ Run ATS Match'}
      </button>
      {result && (
        <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827' }}>Match Score</span>
            <span style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: result.score >= 80 ? '#16a34a' : result.score >= 60 ? '#d97706' : '#dc2626' }}>{result.score}%</span>
          </div>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
            ✅ Found: <strong>{result.present.join(', ')}</strong>
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#dc2626', margin: 0 }}>
            ❌ Missing: <strong>{result.missing.join(', ')}</strong>
          </p>
          <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', margin: 0 }}>Upgrade to auto-fix missing keywords →</p>
        </div>
      )}
    </div>
  );
}

export default function FreeTierDashboard() {
  const [user, setUser] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [parentCount, setParentCount] = useState(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showOutreachToast, setShowOutreachToast] = useState(false);
  const [showEmailSyncModal, setShowEmailSyncModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const navRef = useRef(null);

  // Listen for goals modal open event from child components
  useEffect(() => {
    const handleOpenGoals = () => {
      console.log('Opening goals modal from event');
      setShowGoalsModal(true);
    };
    window.addEventListener('cff:open-goals-modal', handleOpenGoals);
    return () => window.removeEventListener('cff:open-goals-modal', handleOpenGoals);
  }, []);

  // Show outreach success toast when redirected from OutreachDrafts
  useEffect(() => {
    const hash = window.location.hash;
    const paramStr = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(paramStr);
    if (params.get('outreach_sent') === '1') {
      setShowOutreachToast(true);
      setTimeout(() => setShowOutreachToast(false), 5000);
      // Clean up the URL param
      window.history.replaceState({}, '', window.location.origin + '/#FreeTierDashboard');
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Show first-visit toast once per session
      const key = 'cff_ftd_welcomed';
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          setTimeout(() => setShowWelcomeToast(true), 800);
          setTimeout(() => setShowWelcomeToast(false), 8000);
        }
      } catch {}

      // Count parents matching this exact school — no regional fallbacks
      const school = u?.school_code || u?.school || null;
      if (school) {
        base44.entities.User.filter({ persona: 'parent', school_code: school })
          .then(results => setParentCount(results?.length ?? 0))
          .catch(() => setParentCount(0));
      } else {
        setParentCount(0);
      }
    }).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const college = (() => {
    try { return localStorage.getItem('cff_college') || user?.school || 'your university'; } catch { return 'your university'; }
  })();
  const campusTheme = getThemeForSchool(college);
  const isCareerUnsure = (() => { try { return localStorage.getItem('cff_career_unsure') === 'true'; } catch { return false; } })();
  const schoolAbbr = user?.school_code?.toUpperCase() || college?.split(' ').map(w => w[0]).join('') || 'Campus';

  // Show loader while user hasn't loaded yet
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Render premium dashboard if user has paid access
  const isPremium = checkIsFastIQ(user);
  if (isPremium) {
    return (
      <PremiumDashboard
        user={user}
        parentCount={parentCount}
        college={college}
        theme={campusTheme}
      />
    );
  }

  const isTrialExpired = checkIsTrialExpired(user);

  const triggerUpgrade = (featureName) => {
    setUpgradeFeature(featureName);
    setShowUpgrade(true);
  };

  // Dynamic empathy banner driven by onboarding blocker selection
  const primaryBlocker = (() => {
    try {
      const stored = localStorage.getItem('cff_blockers');
      return stored ? JSON.parse(stored)[0] : null;
    } catch { return null; }
  })();

  const handleEmailSync = async () => {
    try {
      const res = await base44.functions.invoke('getEmailOAuthUrl', {});
      const oauthUrl = res?.data?.url || res?.url;
      if (oauthUrl) {
        window.open(oauthUrl, '_blank', 'width=600,height=800');
        // Poll for completion
        const checkInterval = setInterval(async () => {
          try {
            const updatedUser = await base44.auth.me();
            if (updatedUser?.is_email_synced) {
              clearInterval(checkInterval);
              setUser(updatedUser);
              // Trigger banner hide
              window.dispatchEvent(new CustomEvent('cff:email-synced'));
            }
          } catch {}
        }, 1000);
        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(checkInterval), 120000);
      }
    } catch (err) {
      console.error('Failed to get OAuth URL:', err);
      alert('Email sync is temporarily unavailable. Please try again later.');
    }
  };

  // Psychological Blueprint: "They Heard Me" - Dynamic emotional matching
  const PAIN_POINT_CONFIG = {
    interviews: {
      title: "Hey {name}, we know interviewing can be incredibly stressful.",
      subtitle: "But you don't have to walk into the room nervous. CLiFF didn't just find hidden slots—our agent is fully locked and loaded to run custom mock prep sessions specifically for these exact teams before you talk to them.",
      badge: "⚡ Interview Shield Activated",
      cta: '✨ Unlock AI Interview Coach',
      feature: 'Mock Interview Coach',
    },
    ghosted: {
      title: "Hey {name}, let's permanently end the job application black hole.",
      subtitle: "We know you are completely exhausted from getting ghosted by automated resume filters. That's why CLiFF completely bypasses the public job boards and plugs you directly into people ready to hire.",
      badge: "⚡ Ghosting Bypass Active",
      cta: '✨ Unlock the Inside Track Network',
      feature: 'Inside Track Signals',
    },
    outreach: {
      title: "Hey {name}, you don't need a massive personal network to break in.",
      subtitle: "If you feel like you don't have the right inside connections, don't worry. CLiFF has mapped out your entire school's active alumni ecosystem to open those closed doors for you.",
      badge: "⚡ Network Multiplier Engaged",
      cta: '✨ Unlock Warm Scripts',
      feature: 'AI Outreach Generator',
    },
    resume: {
      title: "Hey {name}, beating corporate ATS resume bots is a broken game.",
      subtitle: "Drop a job description on the right to run your free match check — and see exactly what to fix. CLiFF will optimize your resume to beat the bots and catch human eyes.",
      badge: "⚡ ATS Crusher Mode",
      cta: '✨ Fix My Resume Instantly',
      feature: 'Resume Wow Rewrite',
    },
    which_jobs: {
      title: "Hey {name}, not knowing which roles to apply for wastes weeks.",
      subtitle: "Your background agent is scanning for openings that actually match your profile. Upgrade to see the unadvertised roles first and skip the application black hole.",
      badge: "⚡ Job Scout Active",
      cta: '✨ Unlock My Job Feed',
      feature: 'Inside Track Signals',
    },
    disorganized: {
      title: "Hey {name}, losing track of where you applied is more common than you think.",
      subtitle: "Use this board to stay organized — and upgrade to let the agent auto-log every application, track follow-ups, and remind you when to reach back out.",
      badge: "⚡ Auto-Tracking Ready",
      cta: '✨ Unlock Auto-Tracking',
      feature: 'Hiring CRM',
    },
  };

  const painConfig = PAIN_POINT_CONFIG[primaryBlocker] || {
    title: "Hey {name}, your inside track is officially live.",
    subtitle: "Track your applications here while our agent works in the background on unadvertised roles and warm alumni connections.",
    badge: "⚡ Premium Sprint Active",
    cta: '⚡ Upgrade to Premium — $4.99/wk',
    feature: 'Premium Sprint',
  };

  const formattedTitle = painConfig.title.replace("{name}", firstName);

  const isNewUser = (() => { try { return !localStorage.getItem('cff_ftd_seen'); } catch { return false; } })();
  try { localStorage.setItem('cff_ftd_seen', '1'); } catch {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FreeTierNav user={user} onUpgrade={() => triggerUpgrade('Premium Sprint')} navRef={navRef} />

      {/* Mobile-first responsive container */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }} className="main-dashboard-container">
        <style>{`
          @media (max-width: 768px) {
            .main-dashboard-container {
              padding: 12px 12px 100px !important;
            }
            .ftd-grid {
              grid-template-columns: 1fr !important;
            }
            .ftd-sidebar {
              display: none !important;
            }
            .mobile-bottom-nav {
              display: flex !important;
            }
            .desktop-only {
              display: none !important;
            }
            .hero-header-card {
              padding: 16px !important;
              border-radius: 16px !important;
            }
            .hero-title {
              font-size: 16px !important;
            }
            .hero-subtitle {
              font-size: 12px !important;
              margin-bottom: 14px !important;
            }
            .hero-cta-btn {
              width: 100% !important;
              text-align: center !important;
              font-size: 13px !important;
              padding: 13px 16px !important;
            }
            .school-anchor {
              padding: 10px 14px !important;
              font-size: 12px !important;
            }
          }
        `}</style>

        {/* ── Header: post-expiry paywall OR new-user psychological pitch ── */}
        {isTrialExpired ? (
          <TrialEndedHeader
            firstName={firstName}
            theme={campusTheme}
            onReactivate={() => triggerUpgrade('Premium Reactivation')}
          />
        ) : (
        <div className="hero-header-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '1px solid #1e293b', borderRadius: 20, padding: '24px 28px', marginBottom: 20, boxShadow: '0 4px 24px rgba(15,23,42,0.15)' }}>
          {/* Badge Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {painConfig.badge}
            </span>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 100, padding: '4px 12px' }}>
              🔒 Premium Sprint Active
            </span>
          </div>

          {/* Dynamic Mirror Header */}
          <h2 className="hero-title" style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            {formattedTitle}
          </h2>
          <p className="hero-subtitle" style={{ fontFamily: dm, fontSize: 13, color: '#94a3b8', margin: '0 0 18px', lineHeight: 1.65, fontWeight: 500 }}>
            {painConfig.subtitle}
          </p>

          {/* CTA Button */}
          {!isCareerUnsure && (
            <button
              className="hero-cta-btn"
              onClick={() => triggerUpgrade(painConfig.feature)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${campusTheme.primary}, ${campusTheme.secondary || campusTheme.primary})`, border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: `0 4px 14px ${campusTheme.primary}44`, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${campusTheme.primary}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${campusTheme.primary}44`; }}
            >
              {painConfig.cta}
            </button>
          )}
        </div>
        )}

        {/* CLiFF Rescue Hook — shown when student selected "not sure" during onboarding */}
        {isCareerUnsure && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '24px 28px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>📎</span>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>
                Hey {firstName}, <span style={{ color: '#4F46E5' }}>CLiFF</span> here.
              </p>
            </div>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#4B5563', margin: '0 0 16px', lineHeight: 1.7 }}>
              You mentioned during setup that you're not quite sure what you want to do yet. <strong>No sweat at all.</strong> Most college students are in the exact same boat. We're going to help you figure it out step-by-step.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
              <button
                onClick={() => triggerUpgrade('Career Archetype Assessment')}
                style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#4F46E5', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(79,70,229,0.25)', flex: '1 1 auto' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4338CA'}
                onMouseLeave={e => e.currentTarget.style.background = '#4F46E5'}
              >
                🎯 Find My Career Archetype
              </button>
              <button
                onClick={() => navigate('Directory')}
                style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Browse {schoolAbbr} Inside Tracks
              </button>
            </div>
          </div>
        )}

        {/* ── Email Sync Banner ── */}
        {!user?.is_email_synced && (
          <EmailSyncBanner 
            user={user} 
            onSyncClick={handleEmailSync}
            onDismiss={() => {}}
          />
        )}


        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="ftd-grid">

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Zeigarnik close — unfinished outreach draft from onboarding */}
            <FirstDraftReadyCard
              theme={campusTheme}
              onOpen={() => triggerUpgrade('Your First Outreach Draft')}
            />

            {/* Network Pulse — real outcome stats from the alumni database */}
            <NetworkPulseStrip user={user} theme={campusTheme} />

            {/* Locked warm-connection teaser — real alumni match, name hidden */}
            <LockedAlumniTeaser
              user={user}
              theme={campusTheme}
              onUnlock={() => triggerUpgrade('Warm Alumni Connection')}
            />

            {/* Zero-Waste Prioritized Feed */}
            <div id="cliff-feed-section">
              <CliffPrioritizedFeed user={user} />
            </div>
            
            <TeaserSignalsCard onUnlock={() => triggerUpgrade('Inside Track Signals')} college={college} theme={campusTheme} />
          </div>

          {/* ── Right Column (Desktop Only) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="ftd-sidebar desktop-only">

            {/* ── Active Profile Status Pill ── */}
            <ActiveProfilePill user={user} onPillClick={() => navRef.current?.openDropdown()} />

            {/* Alumni Outreach Generator — campus-themed */}
            <div
              onClick={() => triggerUpgrade('AI Outreach Generator')}
              style={{ background: '#fff', border: `1px solid ${campusTheme.primary}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${campusTheme.primary}22`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              <div style={{ background: `linear-gradient(135deg, ${campusTheme.bgTint}, rgba(255,255,255,0.8))`, padding: '16px 20px', borderBottom: `1px solid ${campusTheme.primary}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✉️</span>
                    <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Alumni Outreach Generator</p>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: campusTheme.primary, background: campusTheme.bgTint, border: `1px solid ${campusTheme.primary}44`, borderRadius: 100, padding: '3px 10px' }}>PREMIUM</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', opacity: 0.7, position: 'relative' }}>
                <div style={{ background: campusTheme.bgTint, borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: `1px solid ${campusTheme.primary}22` }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>
                    Hi Sarah, I noticed you graduated from <strong style={{ color: campusTheme.primary }}>{college}</strong> and currently work as a Product Manager at <span style={{ background: '#e5e7eb', borderRadius: 3, padding: '0 6px', filter: 'blur(4px)', userSelect: 'none' }}>████████ Co</span>. I'm a senior at <strong style={{ color: campusTheme.primary }}>{college}</strong> studying...
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} style={{ height: 8, background: `${campusTheme.primary}22`, borderRadius: 4, width: i === 2 ? '60%' : '100%' }} />
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: campusTheme.secondary, fontWeight: 700, margin: 0 }}>Click to unlock personalized scripts →</p>
                </div>
              </div>
            </div>

            {/* Parent Network Widget — only shown when ≥20 parents from this exact school */}
            {parentCount >= 20 && (
              <ParentNetworkWidget
                onUnlock={() => triggerUpgrade('Parent Network Introductions')}
                college={college}
                theme={campusTheme}
                user={user}
              />
            )}

            {/* Hiring Experts Chat */}
            <div
              onClick={() => triggerUpgrade('Hiring Expert Chat')}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>💬</span>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Hiring Experts Chat</p>
                </div>
                <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: '#fff', background: '#6b7280', borderRadius: 100, padding: '3px 10px' }}>PREMIUM ONLY</span>
              </div>
              <div style={{ padding: '16px 20px', opacity: 0.5 }}>
                {[
                  { from: 'Agent', msg: 'I found 3 hiring managers at your target company active this week.' },
                  { from: 'You', msg: 'Can you draft an intro message for me?' },
                  { from: 'Agent', msg: "Absolutely — here's a personalized script based on your background..." },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: 8, textAlign: m.from === 'You' ? 'right' : 'left' }}>
                    <div style={{ display: 'inline-block', background: m.from === 'You' ? '#eff6ff' : '#f9fafb', border: `1px solid ${m.from === 'You' ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', maxWidth: '80%' }}>
                      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.5 }}>{m.msg}</p>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: '#2563eb', fontWeight: 600, margin: 0 }}>Unlock to chat with your Agent →</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showWelcomeToast && (
        <FirstVisitToast firstName={firstName} onDismiss={() => setShowWelcomeToast(false)} />
      )}

      {showOutreachToast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: '#0f172a', color: '#fff', borderRadius: 16,
          padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 12, maxWidth: 440, width: 'calc(100% - 40px)',
          animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📋</span>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
            Script copied! Pipeline updated to <span style={{ color: '#4ade80' }}>"Reached Out"</span>.
          </p>
          <button
            onClick={() => setShowOutreachToast(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, flexShrink: 0, lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal
          featureName={upgradeFeature}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={async () => {
            setShowUpgrade(false);
            if (!user) {
              base44.auth.redirectToLogin('/#FreeTierDashboard');
              return;
            }
            try {
              const res = await base44.functions.invoke('createCheckoutSession', {
                plan: 'pro_monthly',
                user: { id: user.id, email: user.email },
                successUrl: window.location.origin + '/#FreeTierDashboard?upgrade=success',
                cancelUrl: window.location.origin + '/#FreeTierDashboard',
              });
              const url = res?.data?.url || res?.url;
              if (url) window.location.href = url;
              else alert('Unable to start checkout. Please try again.');
            } catch (err) {
              console.error('Checkout error:', err);
              alert('Unable to start checkout. Please try again.');
            }
          }}
        />
      )}

      {showGoalsModal && (
        <EditGoalsModal
          goals={user?.career_goals}
          user={user}
          onClose={() => setShowGoalsModal(false)}
          onSave={(updatedGoals, refreshedUser) => {
            if (refreshedUser) setUser(refreshedUser);
            setShowGoalsModal(false);
            // Force reload of user data immediately
            base44.auth.me().then(u => setUser(u));
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '8px 8px', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', gap: 4, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 999 }}>
        <button onClick={() => document.getElementById('cliff-feed-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '6px 4px', minHeight: 'auto', minWidth: 'auto', borderRadius: 8 }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Leads</span>
        </button>
        <button onClick={() => triggerUpgrade('Premium Sprint')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px 4px', minHeight: 'auto', minWidth: 'auto', borderRadius: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Upgrade</span>
        </button>
        <button onClick={() => navigate('Profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px 4px', minHeight: 'auto', minWidth: 'auto', borderRadius: 8 }}>
          <span style={{ fontSize: 22 }}>👤</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Profile</span>
        </button>
      </div>
    </div>
  );
}