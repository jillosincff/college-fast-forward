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
import DashboardBottomNav from '@/components/free-tier/DashboardBottomNav';
import CliffChatWidget from '@/components/free-tier/CliffChatWidget';
import AtsMatcher from '@/components/free-tier/AtsMatcher';
import FirstWarmMatchCard from '@/components/free-tier/FirstWarmMatchCard';
import FirstApplicationPackageCard from '@/components/free-tier/FirstApplicationPackageCard';
import GoalsCaptureCard from '@/components/free-tier/GoalsCaptureCard';
import NextMoveHero from '@/components/free-tier/NextMoveHero';
import ApplyConfirmToast from '@/components/free-tier/ApplyConfirmToast';
import { getThemeForSchool } from '@/lib/campusThemes';
import { getFirstName } from '@/lib/firstName';
import { checkIsFastIQ, checkIsTrialExpired } from '@/utils/isFastIQ';
import TrialEndedHeader from '@/components/free-tier/TrialEndedHeader';
import PeakMomentSharePrompt from '@/components/free-tier/PeakMomentSharePrompt';
import GoalMemoryStrip from '@/components/free-tier/GoalMemoryStrip';
import DashboardStatsRow from '@/components/free-tier/DashboardStatsRow';
import CareerSeasonCard from '@/components/free-tier/CareerSeasonCard';
import CliffTimeline from '@/components/free-tier/CliffTimeline';
import PlanStateBanner from '@/components/pro/PlanStateBanner';
import PostMagicMomentFlow from '@/components/conversion/PostMagicMomentFlow';
import PreparedWorkProPrompt from '@/components/conversion/PreparedWorkProPrompt';
import LocationPrefPrompt from '@/components/free-tier/LocationPrefPrompt';
import useAccessPlan from '@/hooks/useAccessPlan';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

function FirstVisitToast({ firstName, onDismiss, focusMode }) {
  if (focusMode) {
    return (
      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, background: '#111827', color: '#fff', borderRadius: 16,
        padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420, width: 'calc(100% - 40px)',
        animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
        <Sparkles size={18} color="#a78bfa" style={{ flexShrink: 0 }} />
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
          Welcome, {firstName}! Your first application package is ready above 👆
        </p>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, flexShrink: 0, lineHeight: 1 }}
        >×</button>
      </div>
    );
  }
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
          Welcome, {firstName}!
        </p>
        <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
          Your first application package is ready. Run your free cycle below — then unlock CLIFF Pro to repeat it for every job.
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
  const [upgradeTrigger, setUpgradeTrigger] = useState('dashboard_pro_card');
  const [parentCount, setParentCount] = useState(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showOutreachToast, setShowOutreachToast] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navRef = useRef(null);

  // First-session focus mode: while the Done-For-You package is pending, strip
  // the dashboard down to ONE action — no upgrade banner, no competing cards.
  const [focusMode, setFocusMode] = useState(() => {
    try { return localStorage.getItem('cff_first_draft_pending') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const exitFocus = () => setFocusMode(false);
    window.addEventListener('cff:first-package-done', exitFocus);
    return () => window.removeEventListener('cff:first-package-done', exitFocus);
  }, []);

  // Once the Magic Moment is completed, the Done-For-You package is done — exit
  // first-session focus mode and clear the stale pending flag so the post-magic-
  // moment Pro card (PlanStateBanner) renders instead of being suppressed.
  const { magicMomentCompleted } = useAccessPlan(user);
  useEffect(() => {
    if (!magicMomentCompleted) return;
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    setFocusMode(false);
  }, [magicMomentCompleted]);

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
      // Redeem a pending parent-purchased Pro gift (parent paid before the student signed up)
      if (u?.subscription_status !== 'active') {
        base44.functions.invoke('redeemPendingProGift', {}).then(res => {
          if (res?.data?.redeemed) base44.auth.me().then(setUser).catch(() => {});
        }).catch(() => {});
      }
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

  const firstName = getFirstName(user);
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

  // Students who closed onboarding early can land here with no career_goals AND
  // no major — getLiveJobMatchesFn has nothing to search, so the magic-moment
  // package card can't build a job. Show a goals-capture card in that slot so
  // they self-serve goals; on save the user refreshes and the package card
  // renders next.
  const needsGoalsCapture = (() => {
    if (!user) return false;
    const cg = user.career_goals || {};
    if (cg.target_roles?.length || cg.target_industries?.length) return false;
    if (user.major) return false;
    try {
      const lsR = JSON.parse(localStorage.getItem('cff_target_roles') || '[]');
      const lsI = JSON.parse(localStorage.getItem('cff_industries') || '[]');
      if (lsR.length || lsI.length) return false;
    } catch {}
    return true;
  })();

  const triggerUpgrade = (featureName, trigger) => {
    setUpgradeFeature(featureName);
    setUpgradeTrigger(trigger || 'dashboard_pro_card');
    setShowUpgrade(true);
  };

  const isNewUser = (() => { try { return !localStorage.getItem('cff_ftd_seen'); } catch { return false; } })();
  try { localStorage.setItem('cff_ftd_seen', '1'); } catch {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <FreeTierNav user={user} onUpgrade={() => triggerUpgrade('Premium Sprint')} navRef={navRef} />

      {/* Conversion Engine: one-time post-Magic-Moment reflection → next move → Pro offer */}
      <PostMagicMomentFlow user={user} onUpgrade={triggerUpgrade} />

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
        {!focusMode && <PeakMomentSharePrompt user={user} />}

        {/* One-time work-location question for students who onboarded before this step existed */}
        {!focusMode && !isTrialExpired && <LocationPrefPrompt user={user} onUpdated={setUser} />}

        {/* 1. Next best move — CLIFF's single highest-leverage action, reasoning visible */}
        {!isTrialExpired && !focusMode && (
          <NextMoveHero user={user} firstName={firstName} />
        )}

        {/* 2. The free warm connection — the standout value moment */}
        {!focusMode && (
          <FirstWarmMatchCard user={user} onUpgrade={triggerUpgrade} />
        )}

        {/* 3. Upgrade — free cycle done; unlock unlimited cycles.
            Renders even during first-session focus once the Magic Moment is completed. */}
        {(!focusMode || magicMomentCompleted) && <PlanStateBanner user={user} onUpgrade={triggerUpgrade} />}
        {!focusMode && !isTrialExpired && <PreparedWorkProPrompt user={user} onUpgrade={triggerUpgrade} />}

        {/* 4. Today's plan + activity stats (secondary) */}
        {needsGoalsCapture
          ? <GoalsCaptureCard user={user} onSaved={setUser} />
          : <FirstApplicationPackageCard user={user} />}
        {!isTrialExpired && !focusMode && (
          <>
            <GoalMemoryStrip user={user} />
            <DashboardStatsRow user={user} />
          </>
        )}

        {/* 5. Daily Drop Feed */}
        <div id="cff-daily-feed">
          <CliffPrioritizedFeed user={user} schoolAbbr={schoolAbbr} onUpgrade={triggerUpgrade} />
        </div>

        {/* 6. Longer-horizon context — below the day's work */}
        {!isTrialExpired && !focusMode && (
          <>
            <CareerSeasonCard user={user} />
            <CliffTimeline user={user} />
          </>
        )}
      </div>
      )}

      {/* "Did you finish?" — closes the Track & Redirect loop */}
      <ApplyConfirmToast />

      {showWelcomeToast && (
        <FirstVisitToast firstName={firstName} focusMode={focusMode} onDismiss={() => setShowWelcomeToast(false)} />
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
            // Conversion attribution: record which trigger led to this checkout
            base44.functions.invoke('conversionEngine', {
              action: 'log', event_name: 'checkout_started', once: false,
              trigger: upgradeTrigger, device: window.innerWidth < 768 ? 'mobile' : 'desktop',
            }).catch(() => {});
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