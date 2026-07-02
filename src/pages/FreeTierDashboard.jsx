import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Sparkles, ClipboardList } from 'lucide-react';
import UpgradeModal from '@/components/free-tier/UpgradeModal';
import FreeTierNav from '@/components/free-tier/FreeTierNav';
import TeaserSignalsCard from '@/components/free-tier/TeaserSignalsCard';
// CareerAssetsCard removed — resume management moved to nav dropdown
import ParentNetworkWidget from '@/components/free-tier/ParentNetworkWidget';
import PremiumDashboard from '@/components/free-tier/PremiumDashboard';
import CliffPrioritizedFeed from '@/components/free-tier/CliffPrioritizedFeed';
import LockedAlumniTeaser from '@/components/free-tier/LockedAlumniTeaser';
import NetworkPulseStrip from '@/components/free-tier/NetworkPulseStrip';
import FirstDraftReadyCard from '@/components/free-tier/FirstDraftReadyCard';
import EditGoalsModal from '@/components/free-tier/EditGoalsModal';
import PipelineImpactBar from '@/components/free-tier/PipelineImpactBar';
import ApplicationPipeline from '@/components/free-tier/ApplicationPipeline';
import PendingTailoringWidget from '@/components/free-tier/PendingTailoringWidget';
import ToolsTab from '@/components/free-tier/ToolsTab';
import TodaysActionsCard from '@/components/free-tier/TodaysActionsCard';
import DashboardBottomNav from '@/components/free-tier/DashboardBottomNav';
import CliffChatWidget from '@/components/free-tier/CliffChatWidget';
import AtsMatcher from '@/components/free-tier/AtsMatcher';
import FirstWarmMatchCard from '@/components/free-tier/FirstWarmMatchCard';
import { getThemeForSchool } from '@/lib/campusThemes';
import { checkIsFastIQ, checkIsTrialExpired } from '@/utils/isFastIQ';
import TrialEndedHeader from '@/components/free-tier/TrialEndedHeader';
import PeakMomentSharePrompt from '@/components/free-tier/PeakMomentSharePrompt';
import FollowUpNudgeCard from '@/components/free-tier/FollowUpNudgeCard';
import WarmApplyBar from '@/components/free-tier/WarmApplyBar';
import DashboardWelcomeHeader from '@/components/free-tier/DashboardWelcomeHeader';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

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
      <Sparkles size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
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

export default function FreeTierDashboard() {
  const [user, setUser] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [parentCount, setParentCount] = useState(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showOutreachToast, setShowOutreachToast] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navRef = useRef(null);

  // Load Satoshi font for brand consistency with the landing/marketing pages
  useEffect(() => {
    if (!document.getElementById('slp-satoshi')) {
      const l = document.createElement('link');
      l.id = 'slp-satoshi'; l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap';
      document.head.appendChild(l);
    }
  }, []);

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
    const loadUser = async () => {
      let u;
      try {
        u = await base44.auth.me();
      } catch {
        // Session check failed — bounce to login instead of hanging on a blank loader
        base44.auth.redirectToLogin('/#/FreeTierDashboard');
        return;
      }
      // FreeTierDashboard is a student-only view. Parents/alumni must never render
      // here — the student render tree assumes student-shaped data and blanks out.
      // They only have the signup form + success screen, so send them there.
      const isParentOrAlum = u?.persona === 'parent' || u?.persona === 'alumni'
        || u?.roles?.includes('parent') || u?.roles?.includes('alumni');
      // Preview bypass: owner account can view the student dashboard directly.
      if (isParentOrAlum && u?.email !== 'josinoff@gmail.com') {
        window.location.hash = '#/ParentAllSet';
        return;
      }
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
    };
    loadUser();
    
    // Listen for user updates from Resume Studio
    const handleUserUpdate = (e) => {
      if (e.detail) setUser(e.detail);
    };
    window.addEventListener('cff:user-updated', handleUserUpdate);
    return () => window.removeEventListener('cff:user-updated', handleUserUpdate);
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

  // Psychological Blueprint: "They Heard Me" - Dynamic emotional matching
  const PAIN_POINT_CONFIG = {
    interviews: {
      title: "Hey {name}, we know interviewing can be incredibly stressful.",
      subtitle: "But you don't have to walk into the room nervous. CLiFF didn't just find hidden slots—our agent is fully locked and loaded to run custom mock prep sessions specifically for these exact teams before you talk to them.",
      badge: "Interview Shield Activated",
      cta: 'Unlock AI Interview Coach',
      feature: 'Mock Interview Coach',
    },
    ghosted: {
      title: "Hey {name}, let's permanently end the job application black hole.",
      subtitle: "We know you are completely exhausted from getting ghosted by automated resume filters. That's why CLiFF completely bypasses the public job boards and plugs you directly into people ready to hire.",
      badge: "Ghosting Bypass Active",
      cta: 'Unlock the Inside Track Network',
      feature: 'Inside Track Signals',
    },
    outreach: {
      title: "Hey {name}, you don't need a massive personal network to break in.",
      subtitle: "If you feel like you don't have the right inside connections, don't worry. CLiFF has mapped out your entire school's active alumni ecosystem to open those closed doors for you.",
      badge: "Network Multiplier Engaged",
      cta: 'Unlock Warm Scripts',
      feature: 'AI Outreach Generator',
    },
    resume: {
      title: "Hey {name}, beating corporate ATS resume bots is a broken game.",
      subtitle: "Head to the Tools tab to run your free ATS match check — and see exactly what to fix. CLiFF will optimize your resume to beat the bots and catch human eyes.",
      badge: "ATS Crusher Mode",
      cta: 'Fix My Resume Instantly',
      feature: 'Resume Wow Rewrite',
    },
    which_jobs: {
      title: "Hey {name}, not knowing which roles to apply for wastes weeks.",
      subtitle: "Your background agent is scanning for openings that actually match your profile. Upgrade to see the unadvertised roles first and skip the application black hole.",
      badge: "Job Scout Active",
      cta: 'Unlock My Job Feed',
      feature: 'Inside Track Signals',
    },
    disorganized: {
      title: "Hey {name}, losing track of where you applied is more common than you think.",
      subtitle: "Use this board to stay organized — and upgrade to let the agent auto-log every application, track follow-ups, and remind you when to reach back out.",
      badge: "Auto-Tracking Ready",
      cta: 'Unlock Auto-Tracking',
      feature: 'Hiring CRM',
    },
  };

  const painConfig = PAIN_POINT_CONFIG[primaryBlocker] || {
    title: "Hey {name}, your inside track is officially live.",
    subtitle: "Track your applications here while our agent works in the background on unadvertised roles and warm alumni connections.",
    badge: "Premium Sprint Active",
    cta: 'Upgrade to Premium — $4.99/wk',
    feature: 'Premium Sprint',
  };

  const formattedTitle = painConfig.title.replace("{name}", firstName);

  const isNewUser = (() => { try { return !localStorage.getItem('cff_ftd_seen'); } catch { return false; } })();
  try { localStorage.setItem('cff_ftd_seen', '1'); } catch {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <FreeTierNav user={user} onUpgrade={() => triggerUpgrade('Premium Sprint')} navRef={navRef} />

      {/* Tab Navigation (desktop top tabs + mobile bottom nav) */}
      <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }}>
          <ToolsTab user={user} onUpgrade={triggerUpgrade} />
          {/* Free AI-powered ATS resume check */}
          <div style={{ marginTop: 20 }}><AtsMatcher user={user} /></div>
          {/* CLIFF Chat Widget - Embedded for tools section */}
          <CliffChatWidget mode="embedded" onOpenUpgrade={triggerUpgrade} />
        </div>
      )}

      {/* Dashboard Tab (default) */}
      {activeTab === 'dashboard' && (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }} className="main-dashboard-container">
        {/* CLIFF Chat Widget - Floating for dashboard */}
        <CliffChatWidget mode="widget" onOpenUpgrade={triggerUpgrade} />

        {/* Loss-framed reactivation header for expired trials */}
        {isTrialExpired && (
          <TrialEndedHeader
            firstName={firstName}
            user={user}
            theme={campusTheme}
            onReactivate={() => triggerUpgrade('Premium Reactivation')}
          />
        )}

        {/* Referral prompt at peak moments (reply received / interview landed) */}
        <PeakMomentSharePrompt user={user} />

        {/* Personalized pain-point welcome header (hidden when the expired-trial header shows) */}
        {!isTrialExpired && (
          <DashboardWelcomeHeader
            badge={painConfig.badge}
            title={formattedTitle}
            subtitle={painConfig.subtitle}
            ctaLabel={painConfig.cta}
            onCta={() => triggerUpgrade(painConfig.feature)}
          />
        )}

        {/* Day-one unlocked warm connection — the FIRST thing a new student sees */}
        <FirstWarmMatchCard user={user} onUpgrade={triggerUpgrade} />

        {/* Primary action: paste a job → warm connection → outreach → tracked */}
        <div style={{ marginBottom: 20 }}>
          <WarmApplyBar user={user} />
        </div>

        {/* Today: daily actions first, then any stalled-outreach nudge */}
        <TodaysActionsCard user={user} />
        <FollowUpNudgeCard user={user} />

        {/* Daily Drop Feed - Job Opportunities */}
        <div id="cff-daily-feed">
          <CliffPrioritizedFeed user={user} schoolAbbr={schoolAbbr} onUpgrade={triggerUpgrade} />
        </div>
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
          <ClipboardList size={18} color="#4ade80" style={{ flexShrink: 0 }} />
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