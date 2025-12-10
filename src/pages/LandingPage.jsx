import React, { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Send } from "lucide-react";
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import AnimatedNetworkHero from '../components/home/AnimatedNetworkHero';
import FeaturePreviewModal from '@/components/home/FeaturePreviewModal';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import GenerateInviteModal from '@/components/dashboard/GenerateInviteModal';
import { base44 } from '@/api/base44Client';

const LazyLandingSections = React.lazy(() => import('../components/home/LazyLandingSections'));

const PageLoader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin"></div>
  </div>
);

export default function LandingPage() {
  const { user } = useAuth();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showAuthInstructions, setShowAuthInstructions] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [foundingStats, setFoundingStats] = useState({ spots_left: 430, total_users: 570 });
  
  const handleSeeHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleCTAClick = (ctaType) => {
    trackEvent(`cta_${ctaType}_clicked`);
    if (user) {
      const routes = {
        start: 'Dashboard',
        student: 'Dashboard',
        parent: 'ParentDashboard',
        gator: 'Dashboard'
      };
      const onboardingRoutes = {
        parent: 'Onboarding',
        gator: 'StudentOnboarding',
        student: 'StudentOnboarding'
      };

      if (user.onboarding_completed) {
         navigate(routes[ctaType] || 'Dashboard');
      } else {
         navigate(onboardingRoutes[ctaType] || 'WelcomeRole');
      }
    }
  };

  const handleFeatureClick = (featureKey, page, params = {}) => {
    if (user) {
      navigate(page, params);
    } else {
      setSelectedFeature(featureKey);
      setShowPreviewModal(true);
    }
  };

  const handlePreviewGetStarted = () => {
    setShowPreviewModal(false);
  };

  const handleTopRightJoinClick = () => {
    navigate('WelcomeRole');
  };

  const handleRequestInvite = () => {
    trackEvent('request_invite_clicked');
    navigate('RequestInvite');
  };

  const handleInviteFriend = () => {
    trackEvent('invite_friend_clicked');
    setShowInviteModal(true);
  };

  useEffect(() => {
    const loadFoundingStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data.success) {
          setFoundingStats({
            spots_left: response.data.spots_left,
            total_users: response.data.total_users
          });
        }
      } catch (error) {
        console.error('Failed to load founding stats:', error);
      }
    };
    loadFoundingStats();
  }, []);

  return (
    <>
      <SocialMetaTags 
        title="🧡💙 College Fast Forward - Get Gators Hired"
        description="🐊 When parents open their networks, Gators get hired! Connect with 12,000+ UF students and parents for internships, jobs, and career advice. Go Gators! 🎓"
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />
      
      <style jsx>{`
        [id="how-it-works"] {
          scroll-margin-top: 88px;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Founding Gator Bar */}
        {foundingStats.spots_left > 0 && (
          <div 
            className="sticky top-0 z-50 text-white text-center py-3 px-4 font-bold shadow-lg"
            style={{ backgroundColor: '#FA4616' }}
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-sm sm:text-base">
                ⚡ ONLY <span className="text-2xl mx-1">{foundingStats.spots_left}</span> FOUNDING SPOTS LEFT (out of 1000) ⚡
              </span>
              <span className="text-xs sm:text-sm">
                Lifetime free + permanent Founding Gator Family badge — claim yours now →
              </span>
              <Button
                onClick={() => !user ? handleTopRightJoinClick() : navigate('Dashboard')}
                className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold px-6 py-2 shadow-xl"
              >
                Claim My Spot Free
              </Button>
            </div>
          </div>
        )}

        {selectedFeature && (
           <FeaturePreviewModal
              isOpen={showPreviewModal}
              onClose={() => setShowPreviewModal(false)}
              featureKey={selectedFeature}
              onGetStarted={handlePreviewGetStarted}
           />
         )}

        {/* Invite Modal for Authenticated Users */}
        {user && (
          <GenerateInviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            inviteType={user.persona === 'gator' ? 'gator_to_parent' : 'parent_to_parent'}
            userPersona={user.persona}
          />
        )}

        <AnimatedNetworkHero
          handleCTAClick={handleCTAClick}
          handleSeeHowItWorks={handleSeeHowItWorks}
          onRequestInvite={handleRequestInvite}
          onTopRightJoinClick={handleTopRightJoinClick}
          onInviteFriend={handleInviteFriend}
          showTopButtons={true}
        />
        
        <Suspense fallback={<PageLoader />}>
          <LazyLandingSections />
        </Suspense>

      </div>
    </>
  );
}

LandingPage.isPublic = true;