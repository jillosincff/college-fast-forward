import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Lock } from "lucide-react";
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SCHOOL_NAME = "UF";
const FOUNDING_LIMIT = 1000;

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    spots_left: 152, 
    total_families: 848,
    salary_data_points: 847,
    interview_questions: 523
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data?.success) {
          setStats(prev => ({
            ...prev,
            spots_left: response.data.spots_left || 47,
            total_families: response.data.total_users || response.data.total_families || 623
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

  const handleGetInside = () => {
    trackEvent('cta_claim_free_spot_clicked');
    navigate('GatorAuth');
  };

  const handleSignIn = () => {
    trackEvent('cta_signin_clicked');
    navigate('GatorAuth');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <>
      <SocialMetaTags 
        title="College Fast Forward - The Private Career Network for UF Families"
        description="The private career network only UF families can access. Warm introductions, not cold applications."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen bg-white overflow-x-hidden">
        
        {/* TOP BAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0021A5] border-b border-white/10">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <span className="text-white font-bold text-base sm:text-lg md:text-xl tracking-tight">
              College Fast Forward
            </span>
            <Button
              onClick={handleSignIn}
              variant="ghost"
              className="text-white hover:bg-white/10 font-semibold"
            >
              Sign In
            </Button>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 sm:pt-28 pb-12 sm:pb-20 px-3 sm:px-4" style={{ backgroundColor: '#0021A5' }}>
          <div className="max-w-5xl mx-auto text-center">
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#FA4616] font-semibold text-sm tracking-widest uppercase mb-6"
            >
              THE PRIVATE CAREER NETWORK
            </motion.p>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white mb-4 sm:mb-6 leading-tight font-extrabold px-4"
            >
              Only {SCHOOL_NAME} Families Can Access
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8 sm:mb-10 max-w-3xl mx-auto px-4"
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold">
                Warm introductions, not cold applications.
              </p>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              <strong className="text-white">{stats.total_families} {SCHOOL_NAME} families</strong> opening doors for each other's students — with real connections to hiring managers, VPs, and professionals across 200+ industries.
            </motion.p>

            {/* CTA Box - FREE Founding */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-md mx-4 w-full"
            >
              <div className="flex items-center justify-center gap-2 text-[#FA4616] font-bold text-base sm:text-lg mb-2">
                <span className="text-xl">🔥</span>
                <span>{stats.spots_left} FREE founding spots left</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">(of {FOUNDING_LIMIT})</p>
              
              <Button
                onClick={handleGetInside}
                size="lg"
                className="bg-[#0021A5] hover:bg-[#001878] text-white px-6 sm:px-10 py-5 sm:py-7 text-lg sm:text-xl font-bold shadow-lg w-full min-h-[56px]"
              >
                Claim Your Free Spot
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
              </Button>
              
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p className="font-semibold">Founding members stay free forever.</p>
                <p className="text-slate-400">After 1,000: $9/mo · After 5K: $19/mo</p>
              </div>
            </motion.div>

            {/* Testimonial preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <p className="text-white/80 italic text-lg">
                "My daughter landed an internship with a legal marketing firm — through a connection she never would have found on a job board."
              </p>
              <p className="text-white/60 text-sm mt-2">— The Green Family, UF</p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROBLEM SECTION - "Your Student Is Invisible"                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Your Student Is Invisible to Employers
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-lg text-slate-500 mb-12"
            >
              (And it's not their fault. The system is broken.)
            </motion.p>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3 mb-12"
            >
              {[
                { emoji: '📄', text: 'They apply to 200 jobs' },
                { emoji: '🤖', text: 'AI rejects 98% before a human sees it' },
                { emoji: '😔', text: 'They never hear back' },
                { emoji: '📉', text: 'They watch friends with "connections" get interviews' },
                { emoji: '❓', text: 'They wonder what they\'re doing wrong' },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <motion.div variants={fadeInUp} className="text-slate-300 text-xl">↓</motion.div>}
                  <motion.div variants={fadeInUp} className="flex items-center gap-3 bg-slate-50 rounded-xl px-6 py-4 border border-slate-100">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </motion.div>
                </React.Fragment>
              ))}
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-slate-900 text-white rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <p className="text-lg text-gray-100">
                <strong className="text-white">Here's the truth:</strong> It doesn't matter how perfect their resume is. Without a warm connection, their resume goes into the same black hole as everyone else's.
              </p>
              <p className="text-gray-200 mt-4">
                The students who land jobs? <strong className="text-white">They have someone on the inside.</strong>
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATS SECTION - "The Numbers Don't Lie"                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12"
            >
              The Numbers Don't Lie
            </motion.h2>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6 mb-10"
            >
              <motion.div variants={fadeInUp}>
                <div className="bg-red-500 rounded-2xl p-8 text-center text-white h-full">
                  <div className="text-5xl md:text-6xl font-extrabold mb-2">1 in 250</div>
                  <div className="text-xl font-semibold mb-1">COLD APPLICATION</div>
                  <div className="text-white/80">Gets an interview</div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="bg-green-500 rounded-2xl p-8 text-center text-white h-full">
                  <div className="text-5xl md:text-6xl font-extrabold mb-2">1 in 5</div>
                  <div className="text-xl font-semibold mb-1">WARM INTRODUCTION</div>
                  <div className="text-white/80">Gets an interview</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-xl text-slate-700 mb-4">
                <strong>Same resume. Same student. 50x better odds.</strong>
              </p>
              <p className="text-slate-600">
                The only difference? Someone made an introduction.
              </p>
              <p className="text-[#0021A5] font-semibold mt-4 text-lg">
                That's what this network does. We turn your student from a stranger into a referral.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VALUE STACK SECTION - "What You Get Inside"                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                What You Get Inside
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-3">
                Your student gets instantly matched with {SCHOOL_NAME} parents and alumni whose experience directly fits what they need.
              </p>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                These aren't strangers. They're professionals who've been where your student wants to go — and they genuinely want to help them get there.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Value Item 1 - Instant Matching */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 md:p-8 border-2 border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="text-5xl">🤝</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Instant Matching
                      </h3>
                      <p className="text-slate-600">
                        Your student posts what they need. We match them with parents and alumni who have the exact expertise, connections, and experience to help. No searching. No cold outreach. No hoping someone responds.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Value Item 2 - Real Conversations */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 md:p-8 border-2 border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="text-5xl">💬</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Real Conversations, Real Help
                      </h3>
                      <p className="text-slate-600">
                        Your student messages their matches directly. Ask for advice. Get introductions. Practice for interviews. Whatever they need — from someone who actually does the job they want.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Value Item 3 - Family Karma */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 md:p-8 border-2 border-[#FA4616]/30 bg-gradient-to-r from-orange-50 to-white">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="text-5xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Family Karma — Your Activity Boosts Your Student
                      </h3>
                      <p className="text-slate-600 mb-3">
                        When you help other students, you earn Family Karma. The more karma you have, the <strong>more visible your student becomes</strong>.
                      </p>
                      <p className="text-[#FA4616] font-semibold">
                        You're not just helping others. You're helping YOUR kid.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SOCIAL PROOF - "Real Results"                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
            >
              Real Results from Real Families
            </motion.h2>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="text-slate-900 font-semibold mb-3">
                    "My son just accepted an offer at Goldman Sachs."
                  </p>
                  <p className="text-slate-600 text-sm mb-4">
                    "He connected with 4 parents through the network. One did a mock interview. Another reviewed his resume. A third referred him internally. He starts in June."
                  </p>
                  <p className="text-slate-400 text-sm">— The Martinez Family</p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <div className="text-3xl mb-3">💰</div>
                  <p className="text-slate-900 font-semibold mb-3">
                    "She negotiated $12K more because she knew what to ask for."
                  </p>
                  <p className="text-slate-600 text-sm mb-4">
                    "My daughter got an offer at HubSpot. The AI advisor helped her understand what similar roles were paying, and a parent in the network coached her through the negotiation. It worked."
                  </p>
                  <p className="text-slate-400 text-sm">— The Thompson Family</p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <div className="text-3xl mb-3">🎤</div>
                  <p className="text-slate-900 font-semibold mb-3">
                    "He walked into the Google interview feeling totally prepared."
                  </p>
                  <p className="text-slate-600 text-sm mb-4">
                    "The AI advisor told him what to expect, and then a parent who's a PM at a similar company did two mock interviews with him. He got the offer."
                  </p>
                  <p className="text-slate-400 text-sm">— The Rodriguez Family</p>
                </Card>
              </motion.div>
            </motion.div>

            {/* Activity stats */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white/10 rounded-2xl p-6 md:p-8"
            >
              <h3 className="text-white font-semibold text-center mb-6">📊 This Month's Network Activity</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {[
                  { num: '47', label: 'Warm intros made' },
                  { num: '23', label: 'Resume reviews' },
                  { num: '18', label: 'Mock interviews' },
                  { num: '156', label: 'AI advisor chats' },
                  { num: '3', label: 'Job offers accepted' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.num}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PRICE COMPARISON - "What This Would Cost"                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12"
            >
              What This Would Cost Anywhere Else
            </motion.h2>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-10"
            >
              <div className="space-y-4">
                {[
                  { service: 'Career coach with industry connections', cost: '$200-400/hour' },
                  { service: 'Professional resume rewrite', cost: '$300-500' },
                  { service: 'Mock interview coaching', cost: '$150-200/session' },
                  { service: 'LinkedIn Premium (cold outreach)', cost: '$60/month' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                    <span className="text-slate-700">{item.service}</span>
                    <span className="text-slate-500 font-medium">{item.cost}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-slate-300 flex justify-between items-center">
                <span className="text-slate-900 font-bold text-lg">Total if you bought it all separately:</span>
                <span className="text-red-500 font-bold text-xl line-through">$750 - $1,500+</span>
              </div>
            </motion.div>

            {/* Tiered Pricing */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-slate-600 text-lg mb-2">The Earlier You Join, The Less You Pay</p>
              <p className="text-slate-500">More members = more connections = more value. That's why the price goes up as we grow.</p>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-4 mb-10"
            >
              {/* Founding Tier */}
              <motion.div variants={fadeInUp}>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-2xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    YOU'RE HERE
                  </div>
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">FOUNDING</h3>
                  <p className="text-sm text-slate-500 mb-3">First 1,000 members</p>
                  <div className="text-4xl font-extrabold text-green-600 mb-2">FREE</div>
                  <p className="text-green-700 font-semibold text-sm">FOREVER</p>
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <p className="text-green-700 font-bold">⚡ {stats.spots_left} spots left</p>
                  </div>
                </div>
              </motion.div>

              {/* Growth Tier */}
              <motion.div variants={fadeInUp}>
                <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6 text-center opacity-75">
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">GROWTH</h3>
                  <p className="text-sm text-slate-500 mb-3">1,001 - 5,000 members</p>
                  <div className="text-4xl font-extrabold text-slate-700 mb-2">$9</div>
                  <p className="text-slate-500 font-semibold text-sm">/month per family</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-500">Coming soon</p>
                  </div>
                </div>
              </motion.div>

              {/* Scale Tier */}
              <motion.div variants={fadeInUp}>
                <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-6 text-center opacity-60">
                  <div className="text-3xl mb-2">🚀</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">SCALE</h3>
                  <p className="text-sm text-slate-500 mb-3">5,000+ members</p>
                  <div className="text-4xl font-extrabold text-slate-700 mb-2">$19</div>
                  <p className="text-slate-500 font-semibold text-sm">/month per family</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-500">Future</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center text-slate-600"
            >
              <strong>{stats.total_families} families</strong> already claimed their free spot. <strong>Your price locks in forever.</strong>
            </motion.p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-slate-600 text-lg">
                No algorithms. No job boards. Just real people helping real students.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  num: '1',
                  title: 'Join the Network',
                  desc: 'Sign up in 2 minutes. Add your job info. Connect your student.'
                },
                {
                  num: '2',
                  title: 'Your Student Gets Matched',
                  desc: 'We match them with parents & alumni in their target field. They can message directly.'
                },
                {
                  num: '3',
                  title: 'You Help Others, They Help You',
                  desc: 'Answer questions. Share expertise. The more you give, the more your student stands out.'
                }
              ].map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0021A5] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center text-[#FA4616] font-semibold text-lg mt-10"
            >
              Your student could have their first warm intro by tonight.
            </motion.p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* URGENCY / SCARCITY                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#0021A5' }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              We Keep the Network Small on Purpose
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white/80 text-lg mb-8 max-w-2xl mx-auto"
            >
              Here's the truth: If everyone had access to this, it wouldn't work. The power of this network is that it's <strong className="text-white">exclusive</strong>. It's {SCHOOL_NAME} families helping {SCHOOL_NAME} students. Not the whole internet.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 max-w-md mx-auto"
            >
              <div className="text-[#FA4616] font-bold text-2xl mb-2">
                🔥 {stats.spots_left} FREE FOUNDING SPOTS LEFT
              </div>
              <p className="text-slate-600 mb-6">
                {stats.total_families} families already claimed their free spot. Once the 1,000 founding spots are gone, new members pay $9/month.
              </p>
              <p className="text-green-600 font-semibold mb-4">Get in now. Stay free forever.</p>
              <Button
                onClick={handleGetInside}
                size="lg"
                className="bg-[#0021A5] hover:bg-[#001878] text-white px-10 py-6 text-lg font-bold w-full"
              >
                Claim Your Free Spot
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-slate-400 text-sm mt-3">Founding members stay free forever.</p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FAQ                                                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12"
            >
              Questions
            </motion.h2>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    q: "What if I don't have time to help other students?",
                    a: "No pressure. Help when you can. Even answering one question a month earns karma and keeps your student visible. Most parents spend 10-15 minutes per week."
                  },
                  {
                    q: "Is this just for certain majors or industries?",
                    a: "No. We have parents in tech, finance, healthcare, marketing, law, consulting, engineering, education, and more. If your student has a target industry, there's probably someone here who can help."
                  },
                  {
                    q: "How is this different from LinkedIn?",
                    a: "LinkedIn is cold outreach to strangers. This is warm intros from people who already want to help — because you're part of the same " + SCHOOL_NAME + " family. Response rates are 10x higher."
                  },
                  {
                    q: "What if my student is a freshman? Is it too early?",
                    a: "Never too early. Freshmen can explore careers, ask questions, and start building relationships before the pressure of job hunting kicks in. The students who start early have the biggest networks by junior year."
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Founding members are free forever — there's nothing to cancel! After we hit 1,000 members, new members pay $9/month and can cancel anytime."
                  },
                  {
                    q: "Why is it free for the first 1,000?",
                    a: "Founding members are helping us build something special. You're not just joining a network — you're creating it. In exchange for being early and helping us grow, you get free access forever. Once we hit 1,000, new members pay $9/month. At 5,000, it goes to $19/month. The earlier you join, the more you save."
                  }
                ].map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-6">
                    <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FINAL CTA                                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#FA4616' }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-white mb-4"
            >
              Your Network. Their Future.
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white/90 text-lg md:text-xl mb-2"
            >
              The connections you've built over 20+ years in your career?
            </motion.p>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white font-bold text-xl mb-8"
            >
              They're about to become your student's unfair advantage.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-6"
            >
              <p className="text-white/90 mb-2">{stats.total_families} families already claimed their free spot.</p>
              <p className="text-white font-semibold text-xl">{stats.spots_left} FREE founding spots left.</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button
                onClick={handleGetInside}
                size="lg"
                className="bg-white text-[#FA4616] hover:bg-slate-100 px-10 py-7 text-xl font-bold shadow-2xl"
              >
                Claim Your Free Spot
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-white/90 text-sm mt-4 font-medium">Founding members stay free forever.</p>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white/60 text-sm mt-8"
            >
              Questions? Email hello@collegefastforward.com
            </motion.p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-white/60 text-sm mb-4">
              Powered by College Fast Forward
            </p>
            <p className="text-white/40 text-sm mb-4">
              © {new Date().getFullYear()} College Fast Forward. All Rights Reserved.
            </p>
            <p className="text-white/40 text-xs mb-4">
              College Fast Forward is not affiliated with or endorsed by the University of Florida.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#Terms" className="text-white/50 hover:text-white transition-colors">Terms of Service</a>
              <a href="#Privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#CookiePolicy" className="text-white/50 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

LandingPage.isPublic = true;