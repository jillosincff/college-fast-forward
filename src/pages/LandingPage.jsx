import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import LandingHero from '@/components/landing/LandingHero';
import LandingStickyNav from '@/components/landing/LandingStickyNav';
import LandingTrustBar from '@/components/landing/LandingTrustBar';
import LandingPainBlock from '@/components/landing/LandingPainBlock';
import LandingFastIQIntro from '@/components/landing/LandingFastIQIntro';
import LandingParentRelief from '@/components/landing/LandingParentRelief';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingStudentPivot from '@/components/landing/LandingStudentPivot';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingTwoProducts from '@/components/landing/LandingTwoProducts';
import LandingFooterCTA from '@/components/landing/LandingFooterCTA';
import FastIQFunnel from '@/components/fastiq-funnel/FastIQFunnel';

const FOUNDING_LIMIT = 1000;

export default function LandingPage() {
  const [stats, setStats] = useState({ spots_left: 46, total_families: 954 });
  const [showFunnel, setShowFunnel] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('oauth_redirect_in_progress');
    const loadStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data?.success) {
          setStats(prev => ({
            ...prev,
            spots_left: response.data.spots_left || 51,
            total_families: response.data.total_users || response.data.total_families || 949
          }));
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

  const handleClaim = () => { trackEvent('cta_claim_free_spot_clicked'); navigate('GatorAuth'); };
  const handleSignIn = () => { trackEvent('cta_signin_clicked'); navigate('GatorAuth'); };
  const handleFastIQ = () => { trackEvent('cta_fastiq_clicked'); navigate('GatorAuth'); };
  const handleFunnel = (variant) => { trackEvent(`funnel_${variant}_clicked`); setShowFunnel(true); };

  return (
    <>
      <SocialMetaTags
        title="College Fast Forward - The Private Career Network for UF Families"
        description="The private career network only UF families can access. Warm introductions, not cold applications."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0A1628' }}>

        {/* STICKY NAV (appears after scroll) */}
        <LandingStickyNav onSignIn={handleSignIn} onGetStarted={handleClaim} />

        {/* 1 — HERO */}
        <LandingHero onClaim={handleClaim} />

        {/* TRUST BAR */}
        <LandingTrustBar />

        {/* 2 — YOUR KID IS INVISIBLE */}
        <LandingPainBlock onCTA={handleClaim} />

        {/* 3 — TWO PRODUCTS */}
        <LandingTwoProducts onClaim={handleClaim} onFastIQ={handleClaim} />

        {/* 4 — QUIZ */}
        {showFunnel ? (
          <FastIQFunnel onClose={() => setShowFunnel(false)} />
        ) : (
          <LandingStudentPivot onFunnel={handleFunnel} />
        )}

        {/* 5 — FASTIQ INTRO */}
        <LandingFastIQIntro onCTA={handleClaim} />

        {/* 6 — FOR PARENTS */}
        <LandingParentRelief onCTA={handleClaim} />

        {/* 7 — TESTIMONIALS */}
        <LandingTestimonials onClaim={handleClaim} />

        {/* 8 — HOW IT WORKS */}
        <LandingHowItWorks onClaim={handleClaim} />

        {/* 7 — FINAL CTA */}
        <LandingFooterCTA stats={stats} onClaim={handleClaim} />
      </div>
    </>
  );
}

LandingPage.isPublic = true;