import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
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

export default function LandingPage() {
  const { user } = useAuth();
  const [foundingStats, setFoundingStats] = useState({ 
    spots_left: 206, 
    total_users: 794
  });

  useEffect(() => {
    const loadFoundingStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data?.success) {
          setFoundingStats({
            spots_left: response.data.spots_left,
            total_users: response.data.total_users || response.data.total_families
          });
        }
      } catch (error) {
        console.error('Failed to load founding stats:', error);
      }
    };
    loadFoundingStats();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_error') === 'timeout') {
      toast.error('Sign-in timed out. Please try again.', { duration: 5000 });
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []);

  const handleRoleClick = (role) => {
    trackEvent(`cta_${role}_clicked`);
    sessionStorage.setItem('pending_invite_role', role === 'student' ? 'gator' : role);
    navigate('GatorAuth');
  };

  const handleSignIn = () => {
    trackEvent('cta_signin_clicked');
    navigate('GatorAuth');
  };

  const spotsRemaining = foundingStats.spots_left;
  const totalFamilies = foundingStats.total_users;

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
        title="College Fast Forward - The Private Career Network for UF"
        description="The private career network for UF students, parents & alumni. Connect for warm introductions and career help."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen bg-white">
        
        {/* TOP BAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0021A5] border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="text-white font-bold text-lg md:text-xl tracking-tight">
              College Fast Forward
            </span>
            <Button
              onClick={handleSignIn}
              className="bg-white text-[#0021A5] hover:bg-white/90 font-semibold"
            >
              Join Now / Sign In
            </Button>
          </div>
        </nav>

        {/* SECTION 1: HERO */}
        <section className="pt-28 pb-20 px-4" style={{ backgroundColor: '#0021A5' }}>
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Top line - brand name */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#FA4616] font-semibold text-sm md:text-base tracking-widest uppercase mb-6"
            >
              COLLEGE FAST FORWARD
            </motion.p>

            {/* Main headline - two lines with different weights */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight"
            >
              <span className="font-normal block mb-2">Shared networks of people who care.</span>
              <span className="font-extrabold block">The ultimate unfair advantage for your student.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              UF parents and alumni who go out of their way to make warm introductions — the kind that change career trajectories.
            </motion.p>

            {/* Stat contrast */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mb-10"
            >
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-xl" style={{ color: '#B71234' }}>❌</span>
                <span>Cold applications: <strong style={{ color: '#B71234' }}>~0.4% success rate</strong></span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-xl" style={{ color: '#00843D' }}>✅</span>
                <span>Warm introductions: <strong style={{ color: '#00843D' }}>up to 50x better odds</strong></span>
              </div>
            </motion.div>

            {/* Urgency pill */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block rounded-full px-8 py-4 mb-8"
              style={{ backgroundColor: '#0A1628' }}
            >
              <span className="font-semibold" style={{ color: '#FA4616' }}>
                🔥 {totalFamilies} families inside. {spotsRemaining} founding spots left.
              </span>
            </motion.div>

            {/* Footnote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-white/40 max-w-2xl mx-auto"
            >
              *Business Insider 2025 (average ~242 applications per job). Referral data from LinkedIn & industry studies 2025.
            </motion.p>
          </div>
        </section>

        {/* SECTION 2: ROLE SELECTION */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-10"
            >
              Select your role to get started.
            </motion.h2>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* PARENT CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col border border-slate-200">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">👨‍👩‍👧</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">PARENT</h3>
                    <p className="text-slate-600 mb-6">
                      Get matched with students who need your expertise. Make intros. Change lives.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRoleClick('parent')}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Parent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>

              {/* STUDENT CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col border border-slate-200">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">STUDENT</h3>
                    <p className="text-slate-600 mb-6">
                      Tell us what help you need. Get instantly matched with parents who can help.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRoleClick('student')}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Student
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>

              {/* ALUMNI CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col border border-slate-200">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">ALUMNI</h3>
                    <p className="text-slate-600 mb-6">
                      Help students break into your industry. Get matched with those who need you.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRoleClick('alumni')}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Alumni
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center text-slate-600 mt-10 text-sm md:text-base"
            >
              🔥 First 1,000 members free forever. <span className="text-[#FA4616] font-semibold">{spotsRemaining} spots left.</span> Then $9-19/month per family.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 max-w-md mx-auto"
            >
              <p className="text-slate-700 text-sm">
                <strong>Already a member?</strong>{' '}
                <button
                  onClick={handleSignIn}
                  className="text-[#0021A5] font-semibold hover:underline"
                  type="button"
                >
                  Sign in here →
                </button>
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS BAR */}
        <section className="py-12 px-4" style={{ backgroundColor: '#FA4616' }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white text-lg md:text-xl font-medium">
              🎯 <strong>How it works:</strong> Students tell us what help they need → Instantly matched with parents & alumni who can help
            </p>
          </div>
        </section>

        {/* SECTION 4: TRUST ELEMENTS */}
        <section className="py-12 px-4" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-white/90">
                <Check className="w-5 h-5 text-green-400" />
                <span>Verified UF members only</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-white/90">
                <Check className="w-5 h-5 text-green-400" />
                <span>87% response rate within 48 hours</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-white/90">
                <Check className="w-5 h-5 text-green-400" />
                <span>Takes 2 minutes to join</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: THE PROBLEM */}
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
              className="text-lg text-slate-600 mb-12"
            >
              They're doing everything right. The grades. The internships. The resume. And still... nothing.
            </motion.p>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4 mb-12"
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-3 bg-slate-100 rounded-xl px-6 py-4">
                <span className="text-3xl">📄</span>
                <span className="text-slate-700 font-medium">They apply to 200 jobs</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-slate-400 text-2xl">↓</motion.div>
              <motion.div variants={fadeInUp} className="flex items-center gap-3 bg-slate-100 rounded-xl px-6 py-4">
                <span className="text-3xl">🤖</span>
                <span className="text-slate-700 font-medium">AI rejects 95% before a human sees it</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-slate-400 text-2xl">↓</motion.div>
              <motion.div variants={fadeInUp} className="flex items-center gap-3 bg-slate-100 rounded-xl px-6 py-4">
                <span className="text-3xl">👻</span>
                <span className="text-slate-700 font-medium">They never hear back</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-slate-400 text-2xl">↓</motion.div>
              <motion.div variants={fadeInUp} className="flex items-center gap-3 bg-slate-100 rounded-xl px-6 py-4">
                <span className="text-3xl">😩</span>
                <span className="text-slate-700 font-medium">You watch them lose confidence</span>
              </motion.div>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-slate-600 text-lg max-w-2xl mx-auto"
            >
              This is the black hole. It doesn't matter how qualified they are. <strong>Without a connection, they don't exist.</strong>
            </motion.p>
          </div>
        </section>

        {/* SECTION 6: THE SOLUTION */}
        <section className="py-20 px-4" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
            >
              You Can Change That in 5 Minutes
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white/80 text-lg text-center mb-12"
            >
              Your connections are the shortcut they need.
            </motion.p>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl h-full">
                  <div className="text-4xl mb-4">🚪</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Open Doors</h3>
                  <p className="text-slate-600">
                    Know someone at a company they're targeting? Make an intro. One email from you is worth 100 applications from them.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl h-full">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Share Your Expertise</h3>
                  <p className="text-slate-600">
                    Review their resume. Do a mock interview. Tell them what hiring managers actually look for. You know. They don't.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl h-full">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Help Other Students Too</h3>
                  <p className="text-slate-600">
                    Help another parent's student — and another parent will help yours. That's the network.
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 7: HOW IT WORKS */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-slate-600 text-lg text-center mb-12"
            >
              No algorithms. No job boards. Just real people helping real students.
            </motion.p>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#FA4616] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Join Your School's Network</h3>
                <p className="text-slate-600">
                  Takes 2 minutes. Verified UF students, parents, and alumni only. No strangers.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#FA4616] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">See Who Needs Help</h3>
                <p className="text-slate-600">
                  Browse students looking for intros, resume reviews, or advice in your industry.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#FA4616] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Make an Intro</h3>
                <p className="text-slate-600">
                  Connect them with someone in your network. One intro can change their entire trajectory.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 8: THE NUMBERS */}
        <section className="py-20 px-4" style={{ backgroundColor: '#F5F5F5' }}>
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
                <div className="bg-[#E53E3E] rounded-2xl p-8 text-center text-white">
                  <div className="text-5xl md:text-6xl font-extrabold mb-2">1 in 250</div>
                  <div className="text-xl font-semibold mb-1">Cold Application</div>
                  <div className="text-white/80">Their odds without you</div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="bg-[#38A169] rounded-2xl p-8 text-center text-white">
                  <div className="text-5xl md:text-6xl font-extrabold mb-2">1 in 5</div>
                  <div className="text-xl font-semibold mb-1">Warm Introduction</div>
                  <div className="text-white/80">Their odds with your network</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-slate-600 text-lg text-center"
            >
              Same resume. Same student. <strong>50x better odds</strong> — because someone made an intro. That someone is you.
            </motion.p>
          </div>
        </section>

        {/* SECTION 9: TESTIMONIALS */}
        <section className="py-20 px-4" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
            >
              Real Results from Real Families.
            </motion.h2>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <p className="text-slate-700 mb-6 italic">
                    "I posted my resume for review on Monday. By Wednesday I had 3 parents helping me. By Friday I had 2 interview intros. This actually works."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      MT
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Marcus T.</p>
                      <p className="text-sm text-slate-500">Class of 2024, Now at Deloitte</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <p className="text-slate-700 mb-6 italic">
                    "My daughter's classmates needed help breaking into consulting. I helped 5 students in one month. 3 got interviews. Feels good to give back."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold">
                      JK
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Jennifer K.</p>
                      <p className="text-sm text-slate-500">Parent, Partner at McKinsey</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white h-full">
                  <p className="text-slate-700 mb-6 italic">
                    "Not another 'networking platform' where nothing happens. This matched me with people who responded, cared, and helped. Game changer."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Alicia R.</p>
                      <p className="text-sm text-slate-500">Junior, Warrington College of Business</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 10: FAQ */}
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
                <AccordionItem value="item-1" className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    What if I don't know anyone at the companies my student wants?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    That's the point of the network. Other UF parents do. You help their kids, they help yours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    How much time does this take?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    As much or as little as you want. One intro takes 5 minutes. Some parents do one a month. Some do one a week.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    What does it cost?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    First 1,000 members free forever. After that, $9-19/month per family.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    What if my student won't use it?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    They will when they see intros coming in. You can also browse and make intros on their behalf.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    How is this different from LinkedIn?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    LinkedIn is 900 million strangers. This is verified UF families only. People actually respond.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* SECTION 11: FINAL CTA */}
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
              transition={{ delay: 0.1 }}
              className="text-white/90 text-lg md:text-xl mb-2"
            >
              Join {totalFamilies} UF families already inside.
            </motion.p>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-white/80 text-lg mb-8"
            >
              Change that in 2 minutes.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleSignIn}
                size="lg"
                className="bg-white text-[#FA4616] hover:bg-slate-100 px-10 py-7 text-xl font-bold shadow-2xl"
              >
                Get Started
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm mt-6"
            >
              {spotsRemaining} founding spots remaining
            </motion.p>
          </div>
        </section>

        {/* SECTION 12: FOOTER */}
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