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
              className="mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 leading-snug">
                What if <strong className="text-white">{stats.total_families} parents</strong> cared about your student's career as much as you do?
              </p>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-white font-bold mb-4 px-4"
            >
              They do. They're already inside.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-sm sm:text-base md:text-lg text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              College Fast Forward is a private network of {SCHOOL_NAME} parents and alumni who've pledged to help each other's students succeed — with real introductions, real advice, and real connections to people who can change their trajectory.
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
                The students who land jobs? <strong className="text-white">They have someone on the inside who cares enough to pick up the phone.</strong>
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
                The only difference? Someone cared enough to make an introduction.
              </p>
              <p className="text-[#0021A5] font-semibold mt-4 text-lg">
                That's what this network does. We turn your student from a stranger into a referral.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HOW IT ACTUALLY WORKS - "Parents Who Care"                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                This Isn't a Job Board. It's Parents Who Care.
              </h2>
              <p className="text-lg text-slate-600">
                Here's what happens inside CFF every single day:
              </p>
            </motion.div>

            {/* Story Cards */}
            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 mb-12"
            >
              <motion.div variants={fadeInUp}>
                <Card className="p-6 md:p-8 border-2 border-blue-100 bg-blue-50/50">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">👩‍💼</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-1">Sarah <span className="font-normal text-slate-500">— Marketing VP, 22 years exp</span></p>
                      <p className="text-slate-700 leading-relaxed">
                        A student asks about breaking into brand management. Sarah answers in 10 minutes. She offers to introduce the student to her contact at P&G.
                      </p>
                      <p className="text-[#0021A5] font-semibold mt-3 italic">
                        Why? Because she'd want someone to do the same for her kid.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-center">
                <span className="text-slate-300 text-2xl">↕</span>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 md:p-8 border-2 border-green-100 bg-green-50/50">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">👨‍💼</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-1">David <span className="font-normal text-slate-500">— Tech Director, 18 years exp</span></p>
                      <p className="text-slate-700 leading-relaxed">
                        Sarah's daughter needs help breaking into tech. David answers her question and connects her with his former colleague at Microsoft.
                      </p>
                      <p className="text-green-700 font-semibold mt-3 italic">
                        Why? Because he pledged to help. And because someone else is helping HIS son right now.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* The Deal */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-slate-900 text-white rounded-2xl p-8 text-center mb-10"
            >
              <p className="text-xl md:text-2xl font-bold mb-2">This is the deal:</p>
              <p className="text-2xl md:text-3xl font-extrabold text-[#FA4616]">
                You help their kid. They help yours.
              </p>
              <p className="text-xl md:text-2xl font-bold mt-2">Everyone's student wins.</p>
            </motion.div>

            {/* Network Description */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-lg text-slate-700 mb-4">
                Right now, <strong className="text-slate-900">{stats.total_families} {SCHOOL_NAME} families</strong> are doing this for each other. Their connections span 200+ industries. VPs. Directors. Hiring managers. People who can actually open doors.
              </p>
              <p className="text-lg text-slate-700">
                Your student gets matched instantly with the parents and alumni whose experience fits what they need. They message directly. No algorithms. No gatekeepers. <strong className="text-slate-900">Just people who care.</strong>
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* THE CFF PLEDGE                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="text-4xl mb-4 block">🤝</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Our Pledge to Each Other
              </h2>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-lg text-slate-600 mb-10"
            >
              This network works because every parent makes the same promise:
            </motion.p>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border-2 border-slate-200 p-8 md:p-10 text-left max-w-xl mx-auto mb-10 shadow-sm"
            >
              <div className="space-y-5">
                {[
                  "I'll respond when a student reaches out.",
                  "I'll share what I know.",
                  "I'll open doors when I can.",
                  "I'll help other people's kids the way I'd want someone to help mine."
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#0021A5] mt-0.5 flex-shrink-0" />
                    <p className="text-slate-800 font-medium text-lg leading-snug">{line}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3 mb-10"
            >
              <p className="text-slate-600 text-lg">
                That's it. No algorithms. No AI matching you with strangers who don't care.
              </p>
              <p className="text-slate-800 font-semibold text-lg">
                Just a community of parents who show up for each other's students.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-slate-700 mb-1">
                <strong>{stats.total_families} parents</strong> have already taken this pledge.
              </p>
              <p className="text-slate-600 mb-8">
                Your student is already benefiting from their generosity.
              </p>
              <p className="text-[#0021A5] font-bold text-xl mb-6">Now it's your turn.</p>
              <Button
                onClick={handleGetInside}
                size="lg"
                className="bg-[#0021A5] hover:bg-[#001878] text-white px-10 py-6 text-lg font-bold shadow-lg"
              >
                I'll Take the Pledge
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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
              className="text-center max-w-2xl mx-auto mb-10"
            >
              <p className="text-xl md:text-2xl text-slate-700 mb-2">
                A career coach charges <strong className="text-slate-900">$200–400/hour</strong> to make the introductions you'll find inside.
              </p>
              <p className="text-xl md:text-2xl text-slate-700 mt-6 mb-2">
                Your student gets <strong className="text-slate-900">unlimited access</strong>.
              </p>
              <p className="text-xl md:text-2xl text-slate-900 font-bold">
                Founding members pay nothing. Forever.
              </p>
            </motion.div>

            {/* Founding Tier - Single Card */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-md mx-auto mb-10"
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  YOU'RE HERE
                </div>
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">FOUNDING</h3>
                <p className="text-sm text-slate-500 mb-3">First 1,000 members</p>
                <div className="text-5xl font-extrabold text-green-600 mb-2">FREE</div>
                <p className="text-green-700 font-semibold text-sm">FOREVER</p>
                <div className="mt-4 pt-4 border-t border-green-300">
                  <p className="text-green-700 font-bold">⚡ {stats.spots_left} spots left</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm text-center mt-4">
                After 1,000: $9/mo · After 5K: $19/mo
              </p>
            </motion.div>
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