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
    setShowAuthInstructions(true);
  };

  const handleProceedToAuth = () => {
    setShowAuthInstructions(false);
    setTimeout(() => {
      base44.auth.redirectToLogin(window.location.href);
    }, 200);
  };

  const handleRequestInvite = () => {
    trackEvent('request_invite_clicked');
    navigate('RequestInvite');
  };

  const handleInviteFriend = () => {
    trackEvent('invite_friend_clicked');
    setShowInviteModal(true);
  };

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
        {/* Context-Aware Top Right Buttons */}
        <div className="fixed top-6 right-6 z-[100] flex gap-2">
          {!user ? (
            <>
              <Button
                variant="outline"
                onClick={handleRequestInvite}
                className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Request an Invite
              </Button>
              <Button
                variant="outline"
                onClick={handleTopRightJoinClick}
                className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
              >
                Join / Sign In
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleInviteFriend}
              className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Invite a Friend
            </Button>
          )}
        </div>

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
          showAuthInstructions={showAuthInstructions}
          setShowAuthInstructions={setShowAuthInstructions}
          onProceedToAuth={handleProceedToAuth}
        />
        
        <Suspense fallback={<PageLoader />}>
          <LazyLandingSections />
        </Suspense>

      </div>
    </>
  );
}

LandingPage.isPublic = true;