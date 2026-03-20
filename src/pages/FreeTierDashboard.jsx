import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
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
import { Loader2 } from 'lucide-react';

export default function FreeTierDashboard() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [savedGoals, setSavedGoals] = useState(null);

  const handleGoalsSaved = async () => {
    if (refreshUser) await refreshUser();
    setSavedGoals(Date.now()); // trigger re-render on tabs
  };
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('LandingPage');
      return;
    }

    // Gate: If student has FastIQ active, redirect to FastIQ
    if (user.fastiq_setup_complete || user.subscription_status === 'active' || user.membership_tier === 'fastiq') {
      navigate('FastIQ');
      return;
    }

    setLoading(false);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="w-8 h-8 text-[#E85D20] animate-spin" />
      </div>
    );
  }

  const handleOpenUpgrade = () => setShowUpgradeModal(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <FreeTierSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenUpgrade={handleOpenUpgrade}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {activeTab === 'home' && <FreeTierHomeTab user={user} onOpenUpgrade={handleOpenUpgrade} onTabChange={setActiveTab} />}
        {activeTab === 'company_intel' && <FreeTierCompanyIntelTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_path' && <FreeTierCareerPathTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_center' && <FreeTierCareerCenterTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'career_goals' && <FreeTierCareerGoalsTab user={user} onOpenUpgrade={handleOpenUpgrade} onGoalsSaved={handleGoalsSaved} onTabChange={setActiveTab} />}
        {activeTab === 'alumni_network' && <FreeTierAlumniNetworkTab user={user} onOpenUpgrade={handleOpenUpgrade} />}
        {activeTab === 'messages' && <FreeTierMessagesTab user={user} />}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <FreeTierMobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenUpgrade={handleOpenUpgrade}
        />
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <FastIQUpgradeModal
          user={user}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}