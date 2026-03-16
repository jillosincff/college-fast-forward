import React, { useEffect } from 'react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import V2Hero from '@/components/landing/v2/V2Hero';
import V2PositioningStatement from '@/components/landing/v2/V2PositioningStatement';
import V2FamilyAffair from '@/components/landing/v2/V2FamilyAffair';
import V2TheProblem from '@/components/landing/v2/V2TheProblem';
import V2TheNumbers from '@/components/landing/v2/V2TheNumbers';
import V2ParentRelief from '@/components/landing/v2/V2ParentRelief';
import V2Pricing from '@/components/landing/v2/V2Pricing';
import V2FooterCTA from '@/components/landing/v2/V2FooterCTA';

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

  return (
    <>
      <SocialMetaTags
        title="College Fast Forward — FASTIQ: AI That Gets Your Kid In The Door"
        description="FASTIQ finds real UF alumni at target companies, writes personalized outreach, and gets your kid in the door. 7-day free trial."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0d1117' }}>
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleCTA} />

        {/* 1 — Hero */}
        <V2Hero onCTA={handleCTA} />

        {/* 2 — Positioning Statement */}
        <V2PositioningStatement />

        {/* 3 — Alumni Demo (inside Hero already) */}

        {/* 4 — The Family Affair */}
        <V2FamilyAffair />

        {/* 5 — The Problem */}
        <V2TheProblem />

        {/* 6 — The Numbers */}
        <V2TheNumbers />

        {/* 7 — For Parents Who Are Freaking Out */}
        <V2ParentRelief onCTA={handleCTA} />

        {/* 8 — Pricing */}
        <V2Pricing onCTA={handleCTA} />

        {/* 9 — Bottom CTA + Footer */}
        <V2FooterCTA onCTA={handleCTA} />
      </div>
    </>
  );
}

LandingPage.isPublic = true;