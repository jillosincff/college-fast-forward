import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
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
  try {
    const auth = useAuth();
    const { user, isLoading: isLoadingAuth, refreshUser } = auth;
    const [activeTab, setActiveTab] = useState('home');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showConciergeModal, setShowConciergeModal] = useState(false);
    const [savedGoals, setSavedGoals] = useState(null);

    const handleGoalsSaved = async () => {
      if (refreshUser) await refreshUser();
      setSavedGoals(Date.now());
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
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
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
          <FreeTierSidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onOpenUpgrade={handleOpenUpgrade} onOpenConcierge={handleOpenConcierge} />
        </div>
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {activeTab === 'home' && <FreeTierHomeTab key={savedGoals || 'home'} user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={setActiveTab} />}
          {activeTab === 'company_intel' && <FreeTierCompanyIntelTab user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={setActiveTab} />}
          {activeTab === 'career_path' && <FreeTierCareerPathTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
          {activeTab === 'career_center' && <FreeTierCareerCenterTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
          {activeTab === 'career_goals' && <FreeTierCareerGoalsTab user={user} onOpenUpgrade={handleOpenUpgrade} onGoalsSaved={handleGoalsSaved} onTabChange={setActiveTab} />}
          {activeTab === 'alumni_network' && <FreeTierAlumniNetworkTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
          {activeTab === 'alumni_search' && <AlumniSearch user={user} onOpenUpgrade={handleOpenUpgrade} />}
          {activeTab === 'directory' && <FreeTierDirectoryTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
          {activeTab === 'messages' && <FreeTierMessagesTab user={user} />}
          {activeTab === 'notebook' && <NotebookPage user={user} />}
        </div>
        <div className="md:hidden">
          <FreeTierMobileNav activeTab={activeTab} onTabChange={setActiveTab} onOpenUpgrade={handleOpenUpgrade} onOpenConcierge={handleOpenConcierge} />
        </div>
        {showUpgradeModal && <FastIQUpgradeModal user={user} onClose={() => setShowUpgradeModal(false)} />}
        {showConciergeModal && <CareerConciergeUpgradeModal user={user} onClose={() => setShowConciergeModal(false)} onAskParent={() => { setShowConciergeModal(false); setShowUpgradeModal(true); }} />}
      </div>
    );
  } catch (e) {
    console.error('[FreeTierDashboard] Auth context error:', e);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-red-500 text-sm">Auth context not available</p>
        </div>
      </div>
    );
  }
}