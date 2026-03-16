import React, { useState, useEffect } from 'react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import V2Hero from '@/components/landing/v2/V2Hero';
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

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0F172A' }}>
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleCTA} />

        {/* 1 — Hero: student panic + live teaser + dual CTAs */}
        <V2Hero onCTA={handleCTA} />

        {/* 2 — Parent Relief */}
        <V2ParentRelief onCTA={handleCTA} />

        {/* 3 — Pricing */}
        <V2Pricing onCTA={handleCTA} />

        {/* 4 — Footer */}
        <V2FooterCTA onCTA={handleCTA} />
      </div>
    </>
  );
}

LandingPage.isPublic = true;