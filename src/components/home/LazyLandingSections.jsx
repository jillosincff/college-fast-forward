
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Users, Home, Briefcase, Send, UserCheck, Handshake, CheckCircle, Info } from "lucide-react";
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const testimonials = [
  {
    name: "Michael R.",
    role: "UF '24",
    text: "An alum saw my request and connected me with their former colleague. Two weeks later, I had a job offer at Microsoft!",
    avatar: "👨‍💼"
  },
  {
    name: "Jada Henson",
    role: "Proud Gator parent",
    text: "As a parent, this platform lets me help other Gators—amazing to give back to our community!",
    avatar: "👩"
  },
  {
    name: "Tyler G.",
    role: "UF '25",
    text: "I had no idea how to get into consulting. Then my mom's friend from CFF introduced me to someone at EY. I got the job.",
    avatar: "👨‍💻"
  },
  {
    name: "Sarah K.",
    role: "UF Parent",
    text: "I made one intro to a former colleague, and that student landed an internship. It felt amazing to help!",
    avatar: "🌟"
  }
];

export default function LazyLandingSections() {
  const { user } = useAuth();
  const [totalGatorsCount, setTotalGatorsCount] = useState(33);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showAuthInstructions, setShowAuthInstructions] = useState(false);

  // Fetch actual user count on mount - ONLY if user is authenticated
  useEffect(() => {
    const fetchUserCount = async () => {
      if (!user) {
        console.log('User not authenticated, using default count');
        return;
      }

      setIsLoadingCount(true);
      try {
        const users = await base44.entities.User.filter({
          persona: { $in: ['gator', 'parent'] }
        });
        setTotalGatorsCount(users.length);
      } catch (error) {
        console.log('Could not fetch user count, using default:', error);
        setTotalGatorsCount(33);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchUserCount();

    if (user) {
      const interval = setInterval(() => {
        fetchUserCount();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCTAClick = () => {
    if (user) {
      if (user.onboarding_completed) {
        if (user.persona === 'parent') {
          navigate('ParentDashboard');
        } else if (user.roles?.includes('admin')) {
          navigate('AdminDashboard');
        } else {
          navigate('Dashboard');
        }
      } else {
        if (user.persona === 'gator') {
          navigate('StudentOnboarding');
        } else if (user.persona === 'parent') {
          navigate('Onboarding');
        } else {
          navigate('WelcomeRole');
        }
      }
    } else {
      // Show modal before auth
      console.log('🔵 CTA clicked by unauthenticated user - showing modal');
      setShowAuthInstructions(true);
    }
  };

  const handleFeatureClick = (targetPage) => {
    if (user) {
      navigate(targetPage);
    } else {
      // Show modal before auth
      console.log('🔵 Feature link clicked by unauthenticated user - showing modal');
      setShowAuthInstructions(true);
    }
  };

  const handleProceedToAuth = () => {
    console.log('🟢 Proceeding to auth from LazyLandingSections');
    setShowAuthInstructions(false);
    setTimeout(() => {
      base44.auth.redirectToLogin(window.location.href);
    }, 200);
  };

  const progressPercentage = Math.min((totalGatorsCount / 1000) * 100, 100);
  const remainingToGoal = Math.max(0, 1000 - totalGatorsCount);

  return (
    <>
      {/* Auth Instructions Modal */}
      <Dialog open={showAuthInstructions} onOpenChange={setShowAuthInstructions}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How to Sign In
            </DialogTitle>
            <DialogDescription>
              Choose your sign-in method on the next page
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="font-bold text-blue-900 mb-3 text-sm">
                🎓 UF Students (@ufl.edu):
              </p>
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Click <strong>"Continue with Google"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Sign in with your <strong>@ufl.edu</strong> email</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>✅ <strong>Instant access!</strong> No invite code needed</span>
                </li>
              </ol>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <p className="font-bold text-orange-900 mb-3 text-sm">
                🧡 Alumni & Parents:
              </p>
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">1.</span>
                  <span>Click <strong>"Continue with Google"</strong> or <strong>"Continue with Facebook"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">2.</span>
                  <span>You'll be asked for an <strong>invite code</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">3.</span>
                  <span>Enter your code (e.g., UFPARENTS or GATORS2025)</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAuthInstructions(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToAuth}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white"
            >
              Got It - Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Why Parents Unlock the Hidden Market */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
              Why Parents Unlock the Hidden Market
            </h2>
            <p className="text-lg md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Most jobs never get posted. Parents know people. Parents open doors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-10 mb-12">
            <motion.div 
              {...fadeInUp} 
              className="text-center p-8 md:p-10 bg-blue-50 rounded-3xl border-4 border-blue-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-6xl md:text-7xl font-extrabold text-blue-600 mb-3">70%</div>
              <p className="text-lg md:text-xl font-bold text-slate-900 mb-3">of jobs filled through connections</p>
              <p className="text-sm md:text-base text-slate-600">LinkedIn, 2024</p>
            </motion.div>

            <motion.div 
              {...fadeInUp} 
              transition={{ delay: 0.1 }} 
              className="text-center p-8 md:p-10 bg-orange-50 rounded-3xl border-4 border-orange-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-6xl md:text-7xl font-extrabold text-orange-600 mb-3">54%</div>
              <p className="text-lg md:text-xl font-bold text-slate-900 mb-3">of students get jobs via family networks</p>
              <p className="text-sm md:text-base text-slate-600">National Association of Colleges and Employers</p>
            </motion.div>

            <motion.div 
              {...fadeInUp} 
              transition={{ delay: 0.2 }} 
              className="text-center p-8 md:p-10 bg-green-50 rounded-3xl border-4 border-green-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-6xl md:text-7xl font-extrabold text-green-600 mb-3">83%</div>
              <p className="text-lg md:text-xl font-bold text-slate-900 mb-3">of Gen Z ask parents for career help</p>
              <p className="text-sm md:text-base text-slate-600">Forbes, 2025</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The "Who You Know" Effect is real */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              The "Who You Know" Effect is real.
            </p>
            <p className="text-xl text-slate-600 mb-8">
              No cold applications. No black hole. Just warm intros from people who care.
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white px-12 py-6 text-xl rounded-xl shadow-lg"
            >
              Unlock Your Network — Join Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Parent Power Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              Parents don't just know people. They open doors.
            </h2>
            <p className="text-xl text-slate-600 mb-8 text-center">
              Your parents' professional network is your secret weapon. Here's why:
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 md:p-10 mb-10">
              <ul className="space-y-4">
                <motion.li {...fadeInUp} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-800">
                    <strong>Parents hold positions of authority</strong> — they make decisions.
                  </p>
                </motion.li>
                <motion.li {...fadeInUp} transition={{ delay: 0.1 }} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-800">
                    <strong>Parents have broader networks in their companies</strong> — they know the right people.
                  </p>
                </motion.li>
                <motion.li {...fadeInUp} transition={{ delay: 0.2 }} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-800">
                    <strong>Parents know about opportunities before they're posted</strong> — they get the first call.
                  </p>
                </motion.li>
                <motion.li {...fadeInUp} transition={{ delay: 0.3 }} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-800">
                    <strong>Parents' recommendations carry more weight</strong> — they get you in the room.
                  </p>
                </motion.li>
                <motion.li {...fadeInUp} transition={{ delay: 0.4 }} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-800">
                    <strong>Your job connections could be the most valuable gift you give your children.</strong>
                  </p>
                </motion.li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white px-12 py-6 text-xl rounded-xl shadow-lg"
              >
                Unlock Your Network — Join Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              How it works:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <motion.div {...fadeInUp} className="text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center text-white mx-auto mb-6 shadow-xl">
                <Send className="w-10 h-10 md:w-12 md:h-12 mb-1" />
                <span className="text-2xl md:text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Post a Request</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Looking for a job, internship, or connection? Post your need and let the Gator network know how they can help.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex flex-col items-center justify-center text-white mx-auto mb-6 shadow-xl">
                <Handshake className="w-10 h-10 md:w-12 md:h-12 mb-1" />
                <span className="text-2xl md:text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Parents Open Doors</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Your village of Gators offers to help. Parents make warm introductions, and share opportunities directly with you.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex flex-col items-center justify-center text-white mx-auto mb-6 shadow-xl">
                <UserCheck className="w-10 h-10 md:w-12 md:h-12 mb-1" />
                <span className="text-2xl md:text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Get Real Interviews</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Land your dream role. Find the perfect connections, and build a powerful professional network for life.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gator Strong, Career Bound */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Gator Strong, Career Bound
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
              Your UF network is more powerful than you think. Here's how we help you unlock it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <motion.div {...fadeInUp}>
              <Card className="p-6 md:p-8 h-full hover:shadow-2xl transition-all border-2 hover:border-blue-400">
                <Users className="w-12 h-12 md:w-14 md:h-14 text-blue-600 mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Your Network Is Your Superpower</h3>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  Skip the cold LinkedIn messages. Get warm introductions from people who actually care about your success.
                </p>
                <button
                  onClick={handleCTAClick}
                  className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 text-base md:text-lg min-h-[44px]"
                >
                  Find Connections <ArrowRight className="w-5 h-5" />
                </button>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-6 md:p-8 h-full hover:shadow-2xl transition-all border-2 hover:border-orange-400">
                <Home className="w-12 h-12 md:w-14 md:h-14 text-orange-600 mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Roommates You Can Trust</h3>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  Find a roommate who shares your UF roots. Start your next chapter with a fellow Gator—not just anyone.
                </p>
                <button
                  onClick={() => handleFeatureClick('Roommates')}
                  className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-2 text-base md:text-lg min-h-[44px]"
                >
                  Find a Roommate <ArrowRight className="w-5 h-5" />
                </button>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="p-6 md:p-8 h-full hover:shadow-2xl transition-all border-2 hover:border-green-400">
                <Briefcase className="w-12 h-12 md:w-14 md:h-14 text-green-600 mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Land Your Dream Job</h3>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  Whether it's a competitive internship or your first full-time role, let the Gator network open doors for you.
                </p>
                <button
                  onClick={() => handleFeatureClick('PostRequest')}
                  className="text-green-600 font-bold hover:text-green-700 flex items-center gap-2 text-base md:text-lg min-h-[44px]"
                >
                  Post a Job Request <ArrowRight className="w-5 h-5" />
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connect with Gator Nation */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-orange-500">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Connect with Gator Nation
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Whether you need a hand or want to lend one, your Gator family is here.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <motion.div {...fadeInUp}>
              <Card className="p-6 md:p-8 text-center h-full">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Ask for Help</h3>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  Tell us what you need—we've all been there, and Gators are here to help.
                </p>
                <Button
                  onClick={() => handleFeatureClick('PostRequest')}
                  className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white w-full min-h-[56px] text-base md:text-lg font-bold"
                >
                  Post Your Ask <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-6 md:p-8 text-center h-full">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Help Someone</h3>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  Browse requests from fellow Gators and be the connection that changes someone's life.
                </p>
                <Button
                  onClick={() => handleFeatureClick('Connections')}
                  className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white w-full min-h-[56px] text-base md:text-lg font-bold"
                >
                  Browse Requests <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Your Gator Network Is Your Superpower */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Your Gator Network Is Your Superpower
            </h2>
            <p className="text-xl md:text-2xl text-slate-600">
              Get replies from a community who truly cares.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <motion.div {...fadeInUp}>
              <Card className="p-6 md:p-10 h-full bg-slate-50 border-2">
                <div className="text-6xl mb-4">{testimonials[currentTestimonial].avatar}</div>
                <p className="text-lg md:text-xl italic text-slate-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <p className="font-bold text-lg text-slate-900">{testimonials[currentTestimonial].name}</p>
                <p className="text-base text-slate-600">{testimonials[currentTestimonial].role}</p>
                
                <div className="flex gap-2 justify-center mt-6">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className={`w-3 h-3 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        idx === currentTestimonial ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      aria-label={`View testimonial ${idx + 1}`}
                    >
                      <span className="w-3 h-3 rounded-full bg-current"></span>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-6 md:p-10 h-full bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col justify-center items-center text-center border-2 border-orange-200">
                <div className="text-6xl mb-4">🌟</div>
                <p className="text-xl md:text-2xl font-bold text-slate-900 mb-6 leading-relaxed">
                  Got a Success Story? Inspire other Gators by sharing how the network helped you succeed.
                </p>
                <Button
                  onClick={() => handleFeatureClick('SuccessStories')}
                  className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white min-h-[56px] px-8 text-base md:text-lg font-bold"
                >
                  Share Your Win
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Every New Member Progress */}
      <section 
        className="py-20 md:py-32 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 33, 165, 0.95), rgba(250, 70, 22, 0.95)), url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/c035843a2_IMG_0892.jpg')`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8 leading-tight">
              Every new member unlocks more opportunities — invite a friend and build the Gator network!
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-4">Progress to the first 1,000+ Gators</p>
            
            <div className="max-w-2xl mx-auto mb-6 md:mb-8">
              <div className="relative bg-white/20 rounded-full h-10 md:h-12 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                />
                {!isLoadingCount && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-base md:text-lg px-2 drop-shadow-lg">
                      {totalGatorsCount} / 1,000
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10">
              {isLoadingCount ? (
                <span className="opacity-50">Loading...</span>
              ) : (
                <>{remainingToGoal} more to unlock Gator Nation</>
              )}
            </p>

            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white px-12 md:px-20 py-6 md:py-8 text-xl md:text-2xl rounded-2xl shadow-2xl min-h-[56px] font-bold"
            >
              Join & Invite Gators <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
