import React, { useState, useEffect } from 'react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import V2Hero from '@/components/landing/v2/V2Hero';
import V2PainProof from '@/components/landing/v2/V2PainProof';
import V2ParentRelief from '@/components/landing/v2/V2ParentRelief';
import V2StudentPivot from '@/components/landing/v2/V2StudentPivot';
import V2Pricing from '@/components/landing/v2/V2Pricing';
import V2FooterCTA from '@/components/landing/v2/V2FooterCTA';

export default function LandingPage() {
  const [stats, setStats] = useState({ spots_left: 46 });

  useEffect(() => {
    // Load fonts
    if (!document.getElementById('lp-v2-fonts')) {
      const link = document.createElement('link');
      link.id = 'lp-v2-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }

    sessionStorage.removeItem('oauth_redirect_in_progress');
    const loadStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data?.success) {
          setStats(prev => ({ ...prev, spots_left: response.data.spots_left || 46 }));
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();

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
        description="FASTIQ finds real UF alumni at target companies, writes personalized messages, and gets your kid in the door. 7-day free trial."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0d1117' }}>
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleCTA} />

        {/* 1 — Hero (parent-first, full viewport) */}
        <V2Hero spotsLeft={stats.spots_left} onCTA={handleCTA} />

        {/* 2 — Pain + FASTIQ Proof */}
        <V2PainProof onCTA={handleCTA} />

        {/* 3 — For Parents Who Are Freaking Out */}
        <V2ParentRelief onCTA={handleCTA} />

        {/* 4 — Student Pivot */}
        <V2StudentPivot onCTA={handleCTA} />

        {/* 5 — Pricing (single FASTIQ offer) */}
        <V2Pricing onCTA={handleCTA} />

        {/* 6 — Footer CTA */}
        <V2FooterCTA spotsLeft={stats.spots_left} onCTA={handleCTA} />
      </div>
    </>
  );
}

LandingPage.isPublic = true;