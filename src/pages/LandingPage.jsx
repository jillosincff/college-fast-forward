import React, { useEffect } from 'react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import V3Hero from '@/components/landing/v3/V3Hero';
import V3Problem from '@/components/landing/v3/V3Problem';

import V3ParentPeace from '@/components/landing/v3/V3ParentPeace';


import V3Pricing from '@/components/landing/v3/V3Pricing';




export default function LandingPage() {
  useEffect(() => {
    if (!document.getElementById('lp-v2-fonts')) {
      const link = document.createElement('link');
      link.id = 'lp-v2-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }

    sessionStorage.removeItem('oauth_redirect_in_progress');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_error') === 'timeout') {
      toast.error('Sign-in timed out. Please try again.', { duration: 5000 });
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []);

  const handleCTA = () => { trackEvent('cta_start_trial_clicked'); navigate('GetStarted'); };
  const handleParentCTA = () => { trackEvent('cta_parent_clicked'); navigate('ParentOnboarding'); };
  const handleStudentCTA = () => { trackEvent('cta_student_clicked'); navigate('StudentOnboarding'); };
  const handleSignIn = () => { trackEvent('cta_signin_clicked'); navigate('GetStarted'); };
  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SocialMetaTags
        title="College Fast Forward — FastIQ: Direction, Action, and Real Progress for Your Student"
        description="FastIQ gives your student clear direction, daily actions, and real outreach. 7-day free trial. No credit card required."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#050505' }}>
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleCTA} />

        {/* 1 — Hero */}
        <V3Hero onCTA={handleCTA} onParentCTA={handleParentCTA} onStudentCTA={handleStudentCTA} onHowItWorks={scrollToHowItWorks} />



        {/* 3 — The Reality */}
        <V3Problem />



        {/* 5 — How It Actually Works */}
        <V3ParentPeace onCTA={handleCTA} />





        {/* 7 — Pricing */}
        <V3Pricing onCTA={handleCTA} />




      </div>
    </>
  );
}

LandingPage.isPublic = true;