import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/free-tier/UpgradeModal';
import FreeTierNav from '@/components/free-tier/FreeTierNav';
import ApplicationTracker from '@/components/free-tier/ApplicationPipeline';
import TeaserSignalsCard from '@/components/free-tier/TeaserSignalsCard';
import CareerAssetsCard from '@/components/free-tier/CareerAssetsCard';
import ParentNetworkWidget from '@/components/free-tier/ParentNetworkWidget';
import PremiumDashboard from '@/components/free-tier/PremiumDashboard';
import EmailSyncBanner from '@/components/free-tier/EmailSyncBanner';
import { getThemeForSchool } from '@/lib/campusThemes';
import { checkIsFastIQ } from '@/utils/isFastIQ';

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

export default function FreeTierDashboard() {
  const [user, setUser] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [parentCount, setParentCount] = useState(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showEmailSyncModal, setShowEmailSyncModal] = useState(false);

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

  const empathyMap = {
    ghosted: {
      text: "We know how deflating it is to get ghosted after applying. While you track applications here, our background agent is hunting for unadvertised roles to get you real replies.",
      cta: '✨ Unlock the Backdoor Network',
      feature: 'Backdoor Lead Signals',
    },
    outreach: {
      text: "Cold-messaging strangers on LinkedIn is exhausting. We're mapping out your school's warm alumni connections below so you never have to guess what to write.",
      cta: '✨ Unlock Warm Scripts',
      feature: 'AI Outreach Generator',
    },
    resume: {
      text: "Beating corporate ATS resume bots is a broken game. Drop a job description on the right to run your free match check — and see exactly what to fix.",
      cta: '✨ Fix My Resume Instantly',
      feature: 'Resume Wow Rewrite',
    },
    which_jobs: {
      text: "Not knowing which roles to apply for wastes weeks. Your background agent is scanning for openings that actually match your profile — upgraded members see them first.",
      cta: '✨ Unlock My Job Feed',
      feature: 'Backdoor Lead Signals',
    },
    disorganized: {
      text: "Losing track of where you applied is more common than you think. Use this board to stay organized — and upgrade to let the agent auto-log every application for you.",
      cta: '✨ Unlock Auto-Tracking',
      feature: 'Hiring CRM',
    },
    interviews: {
      text: "Interview anxiety is real, but preparation kills it. Your free dashboard has a mock interview tool in the sidebar — upgrade to get instant AI feedback after every answer.",
      cta: '✨ Unlock AI Interview Coach',
      feature: 'Mock Interview Coach',
    },
  };

  const empathy = empathyMap[primaryBlocker] || {
    text: "Track your applications here while our agent works in the background on unadvertised roles and warm alumni connections.",
    cta: '⚡ Upgrade to Premium — $4.99/wk',
    feature: 'Premium Sprint',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FreeTierNav user={user} onUpgrade={() => triggerUpgrade('Premium Sprint')} />

      {/* Mobile-first responsive container */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }} className="main-dashboard-container">
        <style>{`
          @media (max-width: 768px) {
            .main-dashboard-container {
              padding: 12px !important;
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
          }
        `}</style>

        {/* ── Welcome Banner ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '24px 28px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back, {firstName} 👋
            </h1>
            <button
              onClick={() => triggerUpgrade(empathy.feature)}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${campusTheme.primary}, ${campusTheme.secondary || campusTheme.primary})`, border: 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: `0 4px 14px ${campusTheme.primary}44`, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {empathy.cta}
            </button>
          </div>
          {/* Dynamic Empathy Banner */}
          <div style={{ borderLeft: `4px solid ${campusTheme.primary}`, background: `${campusTheme.bgTint || 'rgba(15,23,42,0.02)'}`, borderRadius: '0 10px 10px 0', padding: '12px 16px', marginTop: 16 }}>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.7 }}>
              {empathy.text}
            </p>
          </div>
        </div>

        {/* ── Email Sync Banner ── */}
        {!user?.is_email_synced && (
          <EmailSyncBanner 
            user={user} 
            onSyncClick={handleEmailSync}
            onDismiss={() => {}}
          />
        )}

        {/* ── School Pride Network Anchor ── */}
        <div style={{ 
          background: campusTheme.bgTint || '#eff6ff', 
          border: `1px solid ${campusTheme.primary}33`, 
          borderRadius: 12, 
          padding: '14px 18px', 
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🐊</span>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: campusTheme.primary, margin: 0 }}>
            Synced: {college || 'UF'} Alumni & Parent Grid
          </p>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="ftd-grid">

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <ApplicationTracker onUpgrade={triggerUpgrade} />
            <TeaserSignalsCard onUnlock={() => triggerUpgrade('Backdoor Lead Signals')} college={college} theme={campusTheme} />
          </div>

          {/* ── Right Column (Desktop Only) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="ftd-sidebar desktop-only">

            {/* Career Assets (ATS Check + Premium assets) */}
            <CareerAssetsCard onUpgrade={() => triggerUpgrade('Resume Wow Rewrite')} />

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

      {showUpgrade && (
        <UpgradeModal
          featureName={upgradeFeature}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => {
            setShowUpgrade(false);
            base44.auth.redirectToLogin('/#FreeTierDashboard');
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '12px 20px', gap: 12, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 999 }}>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Pipeline</span>
        </button>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8 }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Assets</span>
        </button>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8 }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600 }}>Chat</span>
        </button>
      </div>
    </div>
  );
}