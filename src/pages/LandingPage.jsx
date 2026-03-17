import React, { useEffect } from 'react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import V3Hero from '@/components/landing/v3/V3Hero';
import V3Problem from '@/components/landing/v3/V3Problem';
import V3HowFastIQWorks from '@/components/landing/v3/V3HowFastIQWorks';
import V3FastIQ247 from '@/components/landing/v3/V3FastIQ247';
import V3NetworkAdvantage from '@/components/landing/v3/V3NetworkAdvantage';
import V3StudentQuiz from '@/components/landing/v3/V3StudentQuiz';
import V3ParentQuiz from '@/components/landing/v3/V3ParentQuiz';
import V3Numbers from '@/components/landing/v3/V3Numbers';
import V3ParentPeace from '@/components/landing/v3/V3ParentPeace';
import V3Pricing from '@/components/landing/v3/V3Pricing';
import V3FinalCTA from '@/components/landing/v3/V3FinalCTA';

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

  const handleCTA = () => { trackEvent('cta_start_trial_clicked'); navigate('GatorAuth'); };
  const handleSignIn = () => { trackEvent('cta_signin_clicked'); navigate('GatorAuth'); };
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

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0d1117' }}>
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleCTA} />

        {/* 1 — Hero */}
        <V3Hero onCTA={handleCTA} onHowItWorks={scrollToHowItWorks} />

        {/* 2 — Problem / Reality Check */}
        <V3Problem />

        {/* 3 — How FastIQ Works */}
        <V3HowFastIQWorks />

        {/* 4 — FastIQ Works 24/7 */}
        <V3FastIQ247 />

        {/* 5 — Network Edge */}
        <V3NetworkAdvantage />

        {/* 6 — Student Quiz */}
        <V3StudentQuiz onCTA={handleCTA} />

        {/* 7 — Parent Quiz */}
        <V3ParentQuiz />

        {/* 8 — Numbers / Proof */}
        <V3Numbers />

        {/* 9 — Parent Peace of Mind */}
        <V3ParentPeace />

        {/* 10 — Pricing */}
        <V3Pricing onCTA={handleCTA} />

        {/* 11 — Final CTA + Footer */}
        <V3FinalCTA onCTA={handleCTA} onQuiz={handleCTA} />
      </div>
    </>
  );
}

LandingPage.isPublic = true;