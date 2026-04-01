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
import CareerConciergeUpgradeModal from '@/components/free-tier/CareerConciergeUpgradeModal';
import NotebookPage from '@/components/free-tier/NotebookPage';
import AlumniSearch from '@/pages/AlumniSearch';
import FreeTierDirectoryTab from '@/components/free-tier/FreeTierDirectoryTab';

export default function FreeTierDashboard() {
  const { user, isLoading: isLoadingAuth, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    return params.get('tab') || 'home';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

  const getLastLoginDays = () => {
    const lastLogin = localStorage.getItem('cff_last_login');
    if (!lastLogin) return 0;
    return Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    localStorage.setItem('cff_last_login', new Date().toISOString());
  }, []);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
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
            hasDraftedOutreach: outreachDrafts.length > 0,
            isFastIQ,
            hasArchetype: !!user?.career_archetype,
            hasLinkedInReview: !!user?.linkedin_url,
            hasMockInterview: !!user?.has_done_mock_interview,
          },
          lastLoginDays: getLastLoginDays(),
          pendingFollowUps,
          unreadMessages: 0,
          resumeScore: user?.resume_score,
          archetypeName: user?.career_archetype,
          targetRoles: user?.career_goals?.target_roles,
          targetCompanies: user?.career_goals?.target_companies,
          targetIndustries: user?.career_goals?.target_industries,
          graduationYear: user?.career_goals?.graduation_year,
          outreachStats,
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

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

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
          currentPage={{
            home: 'FreeTierDashboard',
            career_goals: 'CareerGoals',
            company_intel: 'CompanyIntel',
            alumni_search: 'AlumniSearch',
            directory: 'Connections',
            messages: 'Messages',
            notebook: 'Notebook',
          }[activeTab] || activeTab}
          onNavigate={(page) => {
            const tabMap = {
              'FreeTierDashboard': 'home',
              'CareerGoals': 'career_goals',
              'CompanyIntel': 'company_intel',
              'AlumniSearch': 'alumni_search',
              'Connections': 'directory',
              'Messages': 'messages',
              'Notebook': 'notebook',
            };
            if (tabMap[page]) {
              handleTabChange(tabMap[page]);
            } else {
              navigate(page);
            }
          }}
          onOpenUpgrade={handleOpenUpgrade}
          onOpenConcierge={handleOpenConcierge}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
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
        {activeTab === 'career_path' && <FreeTierCareerPathTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_center' && <FreeTierCareerCenterTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_goals' && <FreeTierCareerGoalsTab user={user} onOpenUpgrade={handleOpenUpgrade} onGoalsSaved={handleGoalsSaved} onTabChange={handleTabChange} />}
        {activeTab === 'alumni_network' && <FreeTierAlumniNetworkTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'alumni_search' && <AlumniSearch user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'directory' && <FreeTierDirectoryTab user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={handleTabChange} />}
        {activeTab === 'messages' && <FreeTierMessagesTab user={user} />}
        {activeTab === 'notebook' && <NotebookPage user={user} />}
      </div>
      <div className="md:hidden">
        <FreeTierMobileNav activeTab={activeTab} onTabChange={handleTabChange} onOpenUpgrade={handleOpenUpgrade} onOpenConcierge={handleOpenConcierge} />
      </div>
      {showUpgradeModal && <FastIQUpgradeModal user={user} onClose={() => setShowUpgradeModal(false)} />}
      {showConciergeModal && <CareerConciergeUpgradeModal user={user} onClose={() => setShowConciergeModal(false)} onAskParent={() => { setShowConciergeModal(false); setShowUpgradeModal(true); }} />}
    </div>
  );
}