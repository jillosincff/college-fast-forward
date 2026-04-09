import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, Linkedin } from 'lucide-react';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';
import ParentMessageComposer from '@/components/free-tier/ParentMessageComposer';
import FreeTierSidebar from '@/components/free-tier/FreeTierSidebar';
import FreeTierMobileNav from '@/components/free-tier/FreeTierMobileNav';
import FreeTierHomeTab from '@/components/free-tier/FreeTierHomeTab';
import FreeTierCompanyIntelTab from '@/components/free-tier/FreeTierCompanyIntelTab';
import FreeTierCareerPathTab from '@/components/free-tier/FreeTierCareerPathTab';
import FreeTierCareerCenterTab from '@/components/free-tier/FreeTierCareerCenterTab';
import FreeTierCareerGoalsTab from '@/components/free-tier/FreeTierCareerGoalsTab';
import FreeTierAlumniNetworkTab from '@/components/free-tier/FreeTierAlumniNetworkTab';
import FreeTierMessagesTab from '@/components/free-tier/FreeTierMessagesTab';
import FastIQUpgradeModal from '@/components/free-tier/FastIQUpgradeModal';

import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';
import CareerConciergeUpgradeModal from '@/components/free-tier/CareerConciergeUpgradeModal';
import NotebookPage from '@/components/free-tier/NotebookPage';
import AlumniSearch from '@/pages/AlumniSearch';
import FreeTierDirectoryTab from '@/components/free-tier/FreeTierDirectoryTab';
import ResumeTailoring from '@/pages/ResumeTailoring';
import MockInterview from '@/pages/MockInterview';
import LinkedInReview from '@/pages/LinkedInReview';
import OutreachDrafts from '@/pages/OutreachDrafts';
import CareerAssessment from '@/pages/CareerAssessment';

export default function FreeTierDashboard() {
  const { user, isLoading: isLoadingAuth, refreshUser } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    return params.get('tab') || 'home';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('founding_banner_dismissed') === 'true'
  );
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

  // Read previous login BEFORE overwriting — capture it once on mount
  const lastLoginDaysRef = useRef(() => {
    const lastLogin = localStorage.getItem('cff_last_login');
    if (!lastLogin) return 0;
    return Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
  });
  const lastLoginDays = useRef(lastLoginDaysRef.current());

  useEffect(() => {
    localStorage.setItem('cff_last_login', new Date().toISOString());
  }, []);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq' || user?.fastiq_trial_active || user?.trial_status === 'active' || user?.membership_tier === 'fastiq_trial');
  const isPaying = user?.subscription_status === 'active';
  const foundingDeadlinePassed = new Date() > new Date('2026-04-15T23:59:59');
  const showFoundingBanner = !isPaying && !isFastIQ && !bannerDismissed && !foundingDeadlinePassed;
  const handleDismissBanner = () => { localStorage.setItem('founding_banner_dismissed', 'true'); setBannerDismissed(true); };
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchBriefing = async () => {
      if (!user?.email) return;
      setBriefingLoading(true);
      try {
        const outreachDrafts = await base44.entities.OutreachDraft
          .filter({ created_by: user?.email })
          .catch(() => []);

        const outreachStats = {
          sent: outreachDrafts.filter(d => d.status === 'sent' || d.status === 'replied').length,
          replied: outreachDrafts.filter(d => d.status === 'replied').length,
        };

        const pendingFollowUps = outreachDrafts.filter(d => {
          if (d.status !== 'sent' || d.follow_up_sent) return false;
          if (!d.follow_up_due_at) return false;
          return new Date(d.follow_up_due_at) <= new Date();
        }).length;

        const res = await base44.functions.invoke('generateDashboardBriefing', {
          firstName,
          completionState: {
            hasGoals: !!(user?.career_goals?.target_roles?.length > 0),
            hasResume: !!user?.resume_url,
            hasSearchedAlumni: !!user?.has_searched_alumni,
            hasMessaged: !!user?.has_messaged_connection,
            hasDraftedOutreach: (() => {
              const goalsSavedAt = user?.career_goals?.saved_at;
              const hasGoals = !!(user?.career_goals?.target_roles?.length > 0);
              if (!hasGoals) return false;
              if (!goalsSavedAt) return outreachDrafts.length > 0;
              return outreachDrafts.some(d => new Date(d.created_date) > new Date(goalsSavedAt));
            })(),
            isFastIQ,
            hasArchetype: !!user?.career_archetype,
            hasLinkedInReview: !!user?.linkedin_url,
            hasMockInterview: !!user?.has_done_mock_interview,
          },
          lastLoginDays: lastLoginDays.current,
          pendingFollowUps,
          unreadMessages: 0,
          resumeScore: user?.resume_score,
          archetypeName: user?.career_archetype,
          targetRoles: user?.career_goals?.target_roles,
          targetCompanies: user?.career_goals?.target_companies,
          targetIndustries: user?.career_goals?.target_industries,
          graduationYear: user?.career_goals?.graduation_year,
          newAlumniCount: 0,
          outreachStats,
          isFastIQ,
        });

        if (res?.data?.success) {
          setBriefing(res.data.briefing);
        }
      } catch (e) {
        console.error('Briefing failed:', e);
      }
      setBriefingLoading(false);
    };

    fetchBriefing();
  }, [user?.email]);

  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [savedGoals, setSavedGoals] = useState(null);
  const [showGiftBanner, setShowGiftBanner] = useState(false);
  const [giftParentName, setGiftParentName] = useState('');

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fastiqActivatedRecently = user?.trial_start_date &&
      (Date.now() - new Date(user.trial_start_date).getTime()) < 7 * 24 * 60 * 60 * 1000;
    const giftedByParent = isFastIQ &&
      fastiqActivatedRecently &&
      !user?.stripe_customer_id &&
      !!(user?.gifted_by_parent_email || user?.family_id) &&
      user?.persona === 'student';
    if (giftedByParent) {
      setShowGiftBanner(true);
      setGiftParentName(user?.linked_parent_name || 'Your parent');
    }
  }, [user]);

  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    if (params.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true);
      window.history.replaceState(null, '', window.location.pathname + '#FreeTierDashboard');
      // Poll until FastIQ is active — webhook may take a few seconds
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const updatedUser = await base44.auth.me();
        const isNowFastIQ = !!(updatedUser?.fastiq_setup_complete || updatedUser?.subscription_status === 'active' || updatedUser?.membership_tier === 'fastiq');
        if (isNowFastIQ || attempts >= 10) {
          clearInterval(poll);
          if (refreshUser) refreshUser();
        }
      }, 2000);
      return () => clearInterval(poll);
    }
  }, []);

  const handleGoalsSaved = () => {
    // Don't await — avoids remounting the tab before confirmation shows
    if (refreshUser) refreshUser().catch(() => {});
    setSavedGoals(Date.now());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#FreeTierDashboard?tab=${tab}`);
    // Track first-visit milestones
    if (tab === 'company_intel' && !user?.company_intel_viewed) {
      base44.auth.updateMe({ company_intel_viewed: true }).catch(() => {});
    }
    if (tab === 'directory' && !user?.leads_viewed) {
      base44.auth.updateMe({ leads_viewed: true }).catch(() => {});
    }
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      navigate('LandingPage');
      return;
    }
  }, [user, isLoadingAuth]);

  // Block rendering until auth is complete
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-8 h-8 text-[#E85D20] animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('LandingPage');
    return null;
  }

  const handleOpenUpgrade = () => setShowUpgradeModal(true);
  const handleOpenConcierge = () => setShowConciergeModal(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <div className="hidden md:block">
        <FreeTierSidebar
          user={user}
          currentTab={activeTab}
          onNavigate={(tab) => handleTabChange(tab)}
          onOpenUpgrade={handleOpenUpgrade}
          onOpenConcierge={handleOpenConcierge}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div style={{ padding: '16px 16px 0' }}>
          <FoundingMemberBanner
            show={showBanner && !isFastIQ}
            onUpgrade={() => navigate('FastIQDashboard')}
            onDismiss={() => setShowBanner(false)}
          />
        </div>
        {showFoundingBanner && (
          <div style={{
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(232,93,32,0.3)',
            padding: '12px 24px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
            position: 'sticky', top: 0, zIndex: 100,
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: 'rgba(255,255,255,0.82)',
              margin: 0, lineHeight: 1.5,
            }}>
              🎖 <strong style={{ color: '#E85D20' }}>Founding rate expires April 15</strong> — lock in 50% off FastIQ forever. Only $14.50/month.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button
                onClick={() => navigate('FastIQDashboard')}
                style={{
                  background: '#E85D20', border: 'none',
                  borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600,
                  color: '#fff', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap', minHeight: 'auto',
                }}
              >
                Claim $14.50/mo →
              </button>
              <button
                onClick={handleDismissBanner}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 16, color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', padding: 4,
                  lineHeight: 1, minHeight: 'auto', minWidth: 'auto',
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
        {showGiftBanner && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
            borderRadius: 16, padding: '24px 28px',
            margin: '16px 16px 0',
            border: '1px solid rgba(232,93,32,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>💙 FASTIQ GIFTED TO YOU</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', lineHeight: 1.3 }}>{giftParentName} just invested in your success.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>Your full AI career engine is unlocked for 7 days. Let's make them count.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleTabChange('alumni_search')}
                  style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
                >
                  Start Now →
                </button>
                <button
                  onClick={() => setShowGiftBanner(false)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {showUpgradeSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
            borderRadius: 16, padding: '24px 28px',
            margin: '16px 16px 0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 6px' }}>⚡ FASTIQ ACTIVATED</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Welcome to FastIQ, {firstName}! 🎉</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Your full career engine is now unlocked. Check your email for your receipt.</p>
            </div>
            <button onClick={() => setShowUpgradeSuccess(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Dismiss</button>
          </div>
        )}
        {activeTab === 'home' && <FreeTierHomeTab key={savedGoals || 'home'} user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={handleTabChange} briefing={briefing} briefingLoading={briefingLoading} />}
        {activeTab === 'company_intel' && <FreeTierCompanyIntelTab user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={handleTabChange} />}
        {activeTab === 'career_path' && <FreeTierCareerPathTab user={user} onOpenUpgrade={handleOpenUpgrade} refreshUser={refreshUser} />}
        {activeTab === 'career_center' && <FreeTierCareerCenterTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_goals' && <FreeTierCareerGoalsTab user={user} onOpenUpgrade={handleOpenUpgrade} onGoalsSaved={handleGoalsSaved} onTabChange={handleTabChange} />}
        {activeTab === 'alumni_network' && <FreeTierAlumniNetworkTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'alumni_search' && <AlumniSearch user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={handleTabChange} refreshUser={refreshUser} />}
        {activeTab === 'directory' && <FreeTierDirectoryTab user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={handleTabChange} />}
        {activeTab === 'messages' && <FreeTierMessagesTab user={user} />}
        {activeTab === 'notebook' && <NotebookPage user={user} />}
        {activeTab === 'resume' && <ResumeTailoring />}
        {activeTab === 'mock_interview' && <MockInterview />}
        {activeTab === 'linkedin_review' && <LinkedInReview />}
        {activeTab === 'outreach_drafts' && <OutreachDrafts />}
        {activeTab === 'career_assessment' && <CareerAssessment />}
      </div>
      <div className="md:hidden">
        <FreeTierMobileNav activeTab={activeTab} onTabChange={handleTabChange} onOpenUpgrade={handleOpenUpgrade} onOpenConcierge={handleOpenConcierge} />
      </div>
      {showUpgradeModal && <FastIQUpgradeModal user={user} onClose={() => setShowUpgradeModal(false)} />}
      {showConciergeModal && <CareerConciergeUpgradeModal user={user} onClose={() => setShowConciergeModal(false)} onAskParent={() => { setShowConciergeModal(false); setShowUpgradeModal(true); }} />}
    </div>
  );
}