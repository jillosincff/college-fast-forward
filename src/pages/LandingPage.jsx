import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import LandingHero from '@/components/landing/LandingHero';
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

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0021A5]/95 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <span className="text-white font-bold text-base sm:text-lg tracking-tight">College Fast Forward</span>
            <Button onClick={handleSignIn} variant="ghost" className="text-white hover:bg-white/10 font-semibold">
              Sign In
            </Button>
          </div>
        </nav>

        {/* 1 — HERO */}
        <LandingHero stats={stats} onClaim={handleClaim} />

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
        <LandingFooterCTA stats={stats} onClaim={handleClaim} onFAQ={() => {}} />

        {/* FOOTER */}
        <footer className="py-8 text-center" style={{ backgroundColor: '#060B18' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center gap-6 mb-6">
              {[
                { num: '1', text: 'Join & Connect' },
                { num: '2', text: 'Get Matched' },
                { num: '3', text: 'Help Each Other' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0021A5] text-white text-xs font-bold flex items-center justify-center">{s.num}</span>
                  <span className="text-white/50 text-xs font-medium hidden sm:inline">{s.text}</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm mb-2">© {new Date().getFullYear()} College Fast Forward. All Rights Reserved.</p>
            <p className="text-white/30 text-xs mb-4">Not affiliated with or endorsed by the University of Florida.</p>
            <div className="flex justify-center gap-6 text-xs">
              <a href="#Terms" className="text-white/40 hover:text-white transition-colors">Terms</a>
              <a href="#Privacy" className="text-white/40 hover:text-white transition-colors">Privacy</a>
              <a href="#CookiePolicy" className="text-white/40 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

LandingPage.isPublic = true;