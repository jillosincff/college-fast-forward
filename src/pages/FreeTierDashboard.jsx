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
import PipelineImpactBar from '@/components/free-tier/PipelineImpactBar';
import ApplicationPipeline from '@/components/free-tier/ApplicationPipeline';
import PendingTailoringWidget from '@/components/free-tier/PendingTailoringWidget';
import ToolsTab from '@/components/free-tier/ToolsTab';
import ProgressTab from '@/components/free-tier/ProgressTab';
import DashboardBottomNav from '@/components/free-tier/DashboardBottomNav';
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
  const [activeTab, setActiveTab] = useState('dashboard');
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

      {/* Tab Navigation (desktop top tabs + mobile bottom nav) */}
      <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }}>
          <ToolsTab user={user} onUpgrade={triggerUpgrade} />
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }}>
          <ProgressTab user={user} onUpgrade={triggerUpgrade} />
        </div>
      )}

      {/* Dashboard Tab (default) */}
      {activeTab === 'dashboard' && (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }} className="main-dashboard-container">
...
      </div>
      )}

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

    </div>
  );
}