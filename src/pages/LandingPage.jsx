import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

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
    
    // Check for OAuth timeout error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_error') === 'timeout') {
      toast.error('Sign-in timed out. Please try again.', { duration: 5000 });
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []);

  const handleParentClick = () => {
    trackEvent('cta_parent_clicked');
    navigate('GatorAuth');
  };

  const handleStudentClick = () => {
    trackEvent('cta_student_clicked');
    navigate('GatorAuth');
  };

  const handleAlumniClick = () => {
    trackEvent('cta_alumni_clicked');
    navigate('GatorAuth');
  };

  const handleSignIn = () => {
    trackEvent('cta_signin_clicked');
    navigate('GatorAuth');
  };

  const spotsRemaining = foundingStats.spots_left;
  const totalFamilies = foundingStats.total_users;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <SocialMetaTags 
        title="College Fast Forward - The UF Gators Network"
        description="Your network is the career advantage your Gator doesn't have. Connect students with parents and alumni for warm introductions and career help."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
        
        {/* TOP BAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="text-white font-bold text-lg md:text-xl tracking-tight">
              College Fast Forward
            </span>
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-28 pb-16 px-4" style={{ 
          background: 'linear-gradient(180deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)'
        }}>
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Small text above headline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#FA4616] font-semibold text-sm md:text-base tracking-wide uppercase mb-4"
            >
              The UF Gators Network
            </motion.p>

            {/* HEADLINE */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Your Network Is the Career Advantage Your Gator Doesn't Have.
            </motion.h1>

            {/* SUBHEAD */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto"
            >
              You've spent 20+ years building connections. They're starting from zero. Let's fix that.
            </motion.p>

            {/* STATS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8"
            >
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-red-400 text-xl">❌</span>
                <span>Cold applications: <strong className="text-red-400">~0.4% success rate</strong></span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-green-400 text-xl">✅</span>
                <span>Warm introductions: <strong className="text-green-400">up to 50x better odds</strong></span>
              </div>
            </motion.div>

            {/* LIVE COUNTER */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-full px-6 py-3 mb-12"
            >
              <span className="text-white font-semibold">
                🔥 <span className="text-yellow-400">{totalFamilies}</span> families inside. <span className="text-yellow-400">{spotsRemaining}</span> founding spots left.
              </span>
            </motion.div>
          </div>
        </section>

        {/* ROLE SELECTION */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-5xl mx-auto">
            
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-white text-center mb-10"
            >
              Select your role to get started.
            </motion.h2>

            {/* THREE ROLE CARDS */}
            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* PARENT CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">👨‍👩‍👧</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">PARENT</h3>
                    <p className="text-slate-600 mb-6">
                      Get matched with students who need your expertise. Make intros. Change lives.
                    </p>
                  </div>
                  <Button
                    onClick={handleParentClick}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Parent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>

              {/* STUDENT CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">STUDENT</h3>
                    <p className="text-slate-600 mb-6">
                      Tell us what help you need. Get instantly matched with parents who can help.
                    </p>
                  </div>
                  <Button
                    onClick={handleStudentClick}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Student
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>

              {/* ALUMNI CARD */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">ALUMNI</h3>
                    <p className="text-slate-600 mb-6">
                      Help students break into your industry. Get matched with those who need you.
                    </p>
                  </div>
                  <Button
                    onClick={handleAlumniClick}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Alumni
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            </motion.div>

            {/* PRICING LINE */}
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center text-white/80 mt-10 text-sm md:text-base"
            >
              🔥 First 1,000 members free forever. <span className="text-yellow-400 font-semibold">{spotsRemaining} spots left.</span> Then $9-19/month per family.
            </motion.p>
          </div>
        </section>

        {/* MATCHING EXPLAINER */}
        <section className="py-12 px-4" style={{ backgroundColor: 'rgba(0, 33, 165, 0.3)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white text-lg md:text-xl"
            >
              🎯 <strong>How it works:</strong> Students tell us what help they need → Instantly matched with parents & alumni who can help
            </motion.p>
          </div>
        </section>

        {/* TRUST ELEMENTS */}
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

        {/* TESTIMONIALS */}
        <section className="py-16 px-4" style={{ backgroundColor: '#0D1F3C' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-white text-center mb-10"
            >
              Real Gators. Real Results.
            </motion.h2>

            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Testimonial 1 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <p className="text-white/90 mb-6 italic">
                    "I posted my resume for review on Monday. By Wednesday I had 3 parents helping me. By Friday I had 2 interview intros. This actually works."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      MT
                    </div>
                    <div>
                      <p className="font-semibold text-white">Marcus T.</p>
                      <p className="text-sm text-white/60">Class of 2024, Now at Deloitte</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <p className="text-white/90 mb-6 italic">
                    "My daughter's classmates needed help breaking into consulting. I helped 5 students in one month. 3 got interviews. Feels good to give back."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold">
                      JK
                    </div>
                    <div>
                      <p className="font-semibold text-white">Jennifer K.</p>
                      <p className="text-sm text-white/60">Parent, Partner at McKinsey</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <p className="text-white/90 mb-6 italic">
                    "Not another 'networking platform' where nothing happens. This matched me with people who responded, cared, and helped. Game changer."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <p className="font-semibold text-white">Alicia R.</p>
                      <p className="text-sm text-white/60">Junior, Warrington College of Business</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SIGN IN LINK */}
        <section className="py-8 px-4 text-center" style={{ backgroundColor: '#0A1628' }}>
          <p className="text-white/70">
            Already have an account?{' '}
            <button 
              onClick={handleSignIn}
              className="text-[#FA4616] hover:text-orange-400 font-semibold underline underline-offset-2"
            >
              Sign in →
            </button>
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 px-4" style={{ backgroundColor: '#FA4616' }}>
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
              className="text-white/90 text-lg md:text-xl mb-8"
            >
              Join {totalFamilies} Gator families already inside.
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
                className="bg-white text-[#0021A5] hover:bg-slate-100 px-10 py-7 text-xl font-bold shadow-2xl"
              >
                Join the Gator Network
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

        {/* FOOTER */}
        <footer className="py-8 text-center" style={{ backgroundColor: '#0A1628' }}>
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-white/60 text-sm mb-4">
              Powered by College Fast Forward
            </p>
            <p className="text-white/40 text-sm mb-4">
              © {new Date().getFullYear()} College Fast Forward. All Rights Reserved.
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