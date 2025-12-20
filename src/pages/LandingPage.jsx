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
import LivePricingCounter from '@/components/pricing/LivePricingCounter';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

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
  const [foundingStats, setFoundingStats] = useState({ 
    spots_left: 300, 
    total_users: 700,
    current_tier: 'founding',
    urgency_message: '🔥 Only 300 FREE Founding Spots Left!'
  });
  
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
    // Use same flow as "Join the Gator Network" for consistency
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
            total_users: response.data.total_users || response.data.total_families,
            current_tier: response.data.current_tier,
            urgency_message: response.data.urgency_message,
            next_tier_price: response.data.next_tier_price
          });
        }
      } catch (error) {
        console.error('Failed to load founding stats:', error);
      }
    };
    loadFoundingStats();
    
    // Check for OAuth timeout error
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('auth_error');
    
    if (authError === 'timeout') {
      toast.error('Sign-in timed out. Please try again.', {
        duration: 5000
      });
      
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
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
        {/* Dynamic Pricing Bar */}
        {foundingStats.spots_left !== null && (
          <div 
            className={`sticky top-0 z-50 text-white text-center py-3 px-4 font-bold shadow-lg ${
              foundingStats.current_tier === 'founding' 
                ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                : foundingStats.current_tier === 'early_adopter'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
                : 'bg-gradient-to-r from-slate-700 to-slate-800'
            }`}
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
              {foundingStats.current_tier === 'founding' ? (
                <>
                  <span className="text-sm sm:text-base">
                    🔥 ONLY <span className="text-2xl mx-1 text-yellow-300">{foundingStats.spots_left}</span> FREE FOUNDING SPOTS LEFT! 🔥
                  </span>
                  <span className="text-xs sm:text-sm text-white/90">
                    After 1,000 families: {foundingStats.next_tier_price}
                  </span>
                </>
              ) : foundingStats.current_tier === 'early_adopter' ? (
                <>
                  <span className="text-sm sm:text-base">
                    ⚡ <span className="text-2xl mx-1 text-yellow-300">{foundingStats.spots_left?.toLocaleString()}</span> spots left at $9/month! ⚡
                  </span>
                  <span className="text-xs sm:text-sm text-white/90">
                    Lock in $9/month forever • After 5,000: {foundingStats.next_tier_price}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base">
                  Join <span className="text-blue-300">{foundingStats.total_users?.toLocaleString()}+</span> Gator Families • $19/month Family Plan
                </span>
              )}
              <Button
                onClick={() => !user ? handleTopRightJoinClick() : navigate('Dashboard')}
                className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-bold px-6 py-2 shadow-xl"
              >
                {foundingStats.current_tier === 'founding' 
                  ? 'Claim My FREE Spot' 
                  : foundingStats.current_tier === 'early_adopter'
                  ? 'Lock In $9/month'
                  : 'Start Free Trial'}
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