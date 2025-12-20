import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Users, MessageSquare, Check, Crown, Star, Clock, GraduationCap } from "lucide-react";
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { motion, useInView, useAnimation } from 'framer-motion';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Transparent logo URL
const TRANSPARENT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/bce7b6d4c_Untitleddesign31.png";

// Animated counter hook
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;
    
    setHasStarted(true);
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView, hasStarted]);

  return { count, ref };
}

// Fade in from bottom animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

// Card hover animation
const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  hover: { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }
};

export default function LandingPage() {
  const { user } = useAuth();
  const [foundingStats, setFoundingStats] = useState({ 
    spots_left: 300, 
    total_users: 700,
    current_tier: 'founding'
  });

  useEffect(() => {
    const loadFoundingStats = async () => {
      try {
        const response = await base44.functions.invoke('getFoundingStats');
        if (response.data?.success) {
          setFoundingStats({
            spots_left: response.data.spots_left,
            total_users: response.data.total_users || response.data.total_families,
            current_tier: response.data.current_tier
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

  const handleStudentAlumniClick = () => {
    trackEvent('cta_student_alumni_clicked');
    if (user) {
      navigate(user.onboarding_completed ? 'Dashboard' : 'StudentOnboarding');
    } else {
      sessionStorage.setItem('pending_invite_role', 'gator');
      navigate('WelcomeRole');
    }
  };

  const handleParentClick = () => {
    trackEvent('cta_parent_clicked');
    if (user) {
      navigate(user.onboarding_completed ? 'ParentDashboard' : 'Onboarding');
    } else {
      sessionStorage.setItem('pending_invite_role', 'parent');
      navigate('WelcomeRole');
    }
  };

  const spotsRemaining = foundingStats.spots_left;
  const totalFamilies = foundingStats.total_users;

  // Dynamic urgency messaging based on member count
  const getUrgencyMessage = () => {
    const count = totalFamilies;
    if (count <= 1000) {
      return {
        primary: `${count} Families Claimed`,
        secondary: `${1000 - count} FREE Spots Left`,
        note: 'After 1,000 members: $9-19/month'
      };
    } else if (count <= 5000) {
      return {
        primary: `${count} Families Joined`,
        secondary: `${5000 - count} Spots at $9/month`,
        note: 'After 5,000 members: $19/month'
      };
    } else {
      return {
        primary: `${count} Gator Families Strong`,
        secondary: 'Join the Network',
        note: 'Standard pricing: $19/month'
      };
    }
  };

  const urgencyMessage = getUrgencyMessage();

  const handleMainCTA = () => {
    trackEvent('cta_main_clicked');
    navigate('WelcomeRole');
  };

  // Animated stats card component
  const AnimatedStatsCard = () => {
    const { count, ref } = useCountUp(87, 1500);
    
    return (
      <motion.div
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div variants={cardHover} initial="rest" whileHover="hover">
          <Card className="p-6 border-2 border-green-200 bg-white transition-all cursor-default">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">⚡ Fast Results</h3>
                <p className="text-slate-600">
                  <span className="text-2xl font-extrabold text-green-600">{count}%</span> of students get responses within 48 hours. No waiting weeks for a cold LinkedIn 
                  message to maybe get a response.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <SocialMetaTags 
        title="College Fast Forward - Get Matched with UF Parents & Alumni"
        description="Our matching algorithm connects UF students with industry professionals for resume reviews, interview prep, job intros, and career advice."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div className="min-h-screen bg-white">
        
        {/* SECTION 1: HERO */}
        <section className="relative overflow-hidden hero-animated-bg" style={{
          minHeight: '100vh'
        }}>
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .hero-animated-bg {
              background: linear-gradient(-45deg, #001540, #0021A5, #002157, #001a4d);
              background-size: 400% 400%;
              animation: gradientShift 15s ease infinite;
            }
            @keyframes pulseGlow {
              0%, 100% { box-shadow: 0 0 20px rgba(250, 70, 22, 0.4), 0 0 40px rgba(250, 70, 22, 0.2); }
              50% { box-shadow: 0 0 30px rgba(250, 70, 22, 0.6), 0 0 60px rgba(250, 70, 22, 0.3); }
            }
            .urgency-box-glow {
              animation: pulseGlow 2s ease-in-out infinite;
            }
            @keyframes borderGlow {
              0%, 100% { box-shadow: 0 0 10px rgba(250, 200, 50, 0.5), inset 0 0 10px rgba(250, 200, 50, 0.1); }
              50% { box-shadow: 0 0 25px rgba(250, 200, 50, 0.8), inset 0 0 15px rgba(250, 200, 50, 0.2); }
            }
            .founding-card-glow {
              animation: borderGlow 2s ease-in-out infinite;
            }
            @keyframes pulseBadge {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .pulse-badge {
              animation: pulseBadge 1.5s ease-in-out infinite;
            }
            @keyframes ctaPulse {
              0%, 100% { box-shadow: 0 10px 40px rgba(255,255,255,0.3); }
              50% { box-shadow: 0 15px 60px rgba(255,255,255,0.5); }
            }
            .cta-pulse {
              animation: ctaPulse 2s ease-in-out infinite;
            }
            @keyframes ctaButtonPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            .cta-button-pulse {
              animation: ctaButtonPulse 2s ease-in-out infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .bounce-subtle {
              animation: bounce 3s ease-in-out infinite;
            }
          `}</style>
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20 text-center">
            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Get Matched with UF Parents Who Can Help You Land Jobs
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Our proprietary matching algorithm connects students and alumni with industry professionals for 
              resume reviews, interview prep, job intros, and career advice — from people who actually want to help.
            </motion.p>

            {/* Urgency Box - Dynamic from database */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 md:p-8 max-w-xl mx-auto mb-10 shadow-2xl urgency-box-glow"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <span className="text-white font-bold text-lg md:text-xl">FOUNDING MEMBER OPPORTUNITY</span>
              </div>
              {totalFamilies <= 1000 && (
                <p className="text-white text-lg mb-6">
                  First 1,000 families join <span className="font-extrabold text-yellow-300">FREE FOREVER</span>
                </p>
              )}
              <div className="flex items-center justify-center gap-8 text-white">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-extrabold text-yellow-300">{totalFamilies}</div>
                  <div className="text-base font-semibold mt-1">{urgencyMessage.primary.split(' ').slice(1).join(' ')}</div>
                </div>
                <div className="w-px h-16 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-extrabold text-yellow-300">{spotsRemaining}</div>
                  <div className="text-base font-semibold mt-1">{urgencyMessage.secondary.split(' ').slice(1).join(' ') || 'Spots Left'}</div>
                </div>
              </div>
              <p className="text-white/90 text-sm mt-6 font-medium">{urgencyMessage.note}</p>
            </motion.div>

            {/* Two CTA Buttons - Alumni grouped with Students */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="cta-button-pulse">
                <Button
                  onClick={handleStudentAlumniClick}
                  size="lg"
                  className="bg-white text-[#0021A5] hover:bg-slate-100 px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  I'm a Student/Alumni
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="cta-button-pulse">
                <Button
                  onClick={handleParentClick}
                  size="lg"
                  className="bg-[#FA4616] text-white hover:bg-orange-600 px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                >
                  🐊 I'm a Parent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80"
            >
              Join <span className="font-bold text-white">{totalFamilies}</span> Gator families already connected
            </motion.p>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section className="py-20 md:py-28 bg-white" id="how-it-works">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4">
              How It Works
            </h2>
            <p className="text-center text-slate-600 mb-12 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-orange-600">Proprietary matching algorithm — not random</span>
            </p>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 */}
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl bounce-subtle"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-3xl font-bold">1</span>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Post What You Need</h3>
                <p className="text-slate-600">
                  Students describe the career help they need — resume review, interview prep, job leads, industry advice
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl bounce-subtle"
                  style={{ animationDelay: '0.5s' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-3xl font-bold">2</span>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Get Matched Instantly</h3>
                <p className="text-slate-600">
                  Our proprietary algorithm matches you with parents in your industry who can actually help
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl bounce-subtle"
                  style={{ animationDelay: '1s' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-3xl font-bold">3</span>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Connect & Get Help</h3>
                <p className="text-slate-600">
                  Message directly, schedule calls, get the help you need — no cold outreach, no ghosting
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHY IT WORKS */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
              Why Gator Network Works
            </h2>

            <div className="space-y-6">
              {/* Point 1 */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.div variants={cardHover} initial="rest" whileHover="hover">
                  <Card className="p-6 border-2 border-blue-200 bg-white transition-all cursor-default">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">🎯 Smart Matching Algorithm</h3>
                        <p className="text-slate-600">
                          Not a directory. Not random networking. Our system matches students with parents based on 
                          industry, help needed, experience, and availability. <strong>Every match is relevant.</strong>
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Point 2 */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.div variants={cardHover} initial="rest" whileHover="hover">
                  <Card className="p-6 border-2 border-orange-200 bg-white transition-all cursor-default">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">👨‍👩‍👧 Parents Actually Want to Help</h3>
                        <p className="text-slate-600">
                          These aren't strangers — they're UF parents and alumni who signed up specifically to help 
                          students succeed. <strong>They respond, they care.</strong>
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Point 3 - with animated counter */}
              <AnimatedStatsCard />
            </div>
          </div>
        </section>

        {/* SECTION 4: FOR STUDENTS & ALUMNI vs FOR PARENTS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* For Students & Alumni */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white h-full hover:shadow-xl hover:-translate-y-1 transition-all">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">For Students & Alumni</h3>
                  <p className="text-slate-600 mb-6">Get the Connections That Actually Matter</p>
                  
                  <p className="text-slate-600 mb-4 text-sm">
                    Whether you're still in school or recently graduated, get matched with experienced professionals who can help:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {[
                      'Resume reviews from people who hire',
                      'Interview prep from industry experts',
                      'Job referrals and warm introductions',
                      'Career advice from people ahead of you',
                      'Unlimited help requests and messages'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleStudentAlumniClick}
                    className="w-full bg-[#0021A5] hover:bg-blue-800 text-white py-6 text-lg font-bold"
                  >
                    Join as Student/Alumni
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>

              {/* For Parents */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white h-full hover:shadow-xl hover:-translate-y-1 transition-all">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">For Parents</h3>
                  <p className="text-slate-600 mb-6">Help UF Students Launch Their Careers</p>
                  
                  <p className="text-slate-600 mb-4 text-sm">
                    As a parent, you have the network and experience students need. Make a difference:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {[
                      'Get matched with students you can actually help',
                      '10 minutes per student = life-changing impact',
                      'See direct results of your advice',
                      'Stay connected to the UF community',
                      'Always FREE for parents (we pay with our time)'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleParentClick}
                    className="w-full bg-[#FA4616] hover:bg-orange-600 text-white py-6 text-lg font-bold"
                  >
                    Join as Parent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5: TESTIMONIALS */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
              Real Gators, Real Results
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <Card className="p-6 bg-white border-l-4 border-l-orange-500 h-full">
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

              {/* Testimonial 2 */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6 bg-white border-l-4 border-l-orange-500 h-full">
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

              {/* Testimonial 3 */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 bg-white border-l-4 border-l-orange-500 h-full">
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
            </div>
          </div>
        </section>

        {/* SECTION 6: PRICING */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
              Simple Pricing
            </h2>

            <div className="space-y-6">
              {/* Founding Members */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden founding-card-glow">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-sm font-bold pulse-badge">
                    {spotsRemaining} spots left
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">FOUNDING MEMBERS</h3>
                      <p className="text-slate-600">First 1,000 families</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-green-600 mb-4">FREE FOREVER</div>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Students & alumni get unlimited help</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Parents help for free</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Family plan (2 students + 2 parents)</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Founding Member badge</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Early access to features</li>
                  </ul>
                  <Button
                    onClick={handleMainCTA}
                    className="w-full mt-6 bg-[#FA4616] hover:bg-orange-600 text-white py-4 text-lg font-bold cta-pulse"
                  >
                    CLAIM YOUR SPOT
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-center text-sm text-slate-600 mt-3">{totalFamilies}/1,000 claimed</p>
                </Card>
              </motion.div>

              {/* Early Adopters */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6 border-2 border-blue-200 bg-white opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">EARLY ADOPTERS</h3>
                      <p className="text-slate-600">Members 1,001-5,000</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-blue-600 mb-4">$9<span className="text-lg font-normal text-slate-500">/month</span></div>
                  <p className="text-sm text-slate-600 mb-4">Locked in forever — your price never increases</p>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> All founding member benefits</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Price never increases</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Family plan included</li>
                  </ul>
                </Card>
              </motion.div>

              {/* Standard */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 border-2 border-slate-200 bg-white opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="w-8 h-8 text-slate-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">STANDARD</h3>
                      <p className="text-slate-600">Members 5,001+</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-slate-700 mb-4">$19<span className="text-lg font-normal text-slate-500">/month</span></div>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> All features</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Family plan included</li>
                  </ul>
                </Card>
              </motion.div>
            </div>

            <p className="text-center text-slate-500 mt-8 text-sm">
              Students & alumni pay. Parents are always FREE.
            </p>
          </div>
        </section>

        {/* SECTION 7: FINAL CTA - High contrast white text */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Stadium background */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/c035843a2_IMG_0892.jpg')`
            }}
          />
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/80" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.h2 
              className="text-4xl md:text-6xl font-extrabold text-white mb-8"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              THE GATOR NETWORK IS WAITING
            </motion.h2>
            <motion.div 
              className="text-xl md:text-2xl text-white mb-12 space-y-3"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-medium">{totalFamilies} families are already inside.</p>
              <p className="font-medium">Students and alumni are getting hired.</p>
              <p className="font-medium">Parents are changing lives.</p>
              <p className="pt-6 font-bold text-2xl md:text-3xl">The only question is:<br/>Are you in or are you out?</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleMainCTA}
                  size="lg"
                  className="bg-[#FA4616] hover:bg-orange-600 text-white px-12 py-7 text-xl font-bold shadow-2xl cta-pulse transition-all"
                >
                  JOIN THE GATOR NETWORK
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.p 
              className="text-yellow-300 mt-8 text-lg font-bold"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              ⚡ {spotsRemaining} Free Founding Spots Remaining
            </motion.p>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-8 bg-slate-900 text-center">
          <div className="max-w-6xl mx-auto px-4">
            <img 
              src={TRANSPARENT_LOGO}
              alt="College Fast Forward"
              className="h-16 mx-auto mb-4 opacity-90"
            />
            <p className="text-slate-400 text-sm mb-4">
              © {new Date().getFullYear()} College Fast Forward. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#Privacy" className="text-slate-400 hover:text-white">Privacy</a>
              <a href="#Terms" className="text-slate-400 hover:text-white">Terms</a>
              <a href="#CookiePolicy" className="text-slate-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

LandingPage.isPublic = true;