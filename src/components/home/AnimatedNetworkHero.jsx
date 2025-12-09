import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Badge } from '@/components/ui/badge';
import { Typewriter } from '@/components/ui/typewriter';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { Button } from '@/components/ui/button';
import { LogOut, Info, UserPlus, Send } from 'lucide-react';
import { getUserCount } from '@/functions/getUserCount';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AnimatedNetworkHero = ({ 
  showAuthInstructions, 
  setShowAuthInstructions, 
  onProceedToAuth,
  onRequestInvite,
  onTopRightJoinClick,
  onInviteFriend,
  showTopButtons = true
}) => {
  const { user, logout } = useAuth();
  const [announceMessage, setAnnounceMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 226,
    studentCount: 66,
    spotsLeft: 774
  });
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [internalShowAuthInstructions, setInternalShowAuthInstructions] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isModalOpen = showAuthInstructions !== undefined ? showAuthInstructions : internalShowAuthInstructions;
  const setIsModalOpen = setShowAuthInstructions || setInternalShowAuthInstructions;

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setIsLoadingCount(true);
        console.log('🔍 Landing: Fetching counts...');
        
        const response = await getUserCount();
        const data = response.data;
        
        console.log('✅ Landing: Data received:', data);
        
        setStats({
          totalUsers: data?.totalUsers || data?.count || 226,
          studentCount: data?.gatorCount || data?.studentCount || 66,
          spotsLeft: data?.spotsLeft || 774
        });
      } catch (error) {
        console.error('❌ Landing: Error:', error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchUserCount();
  }, []);

  console.log('📊 Landing display:', stats);

  const trackEvent = (eventName, properties = {}) => {
    try {
      console.log('[Event]', eventName, properties);
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  };

  const handleCTAClick = () => {
    trackEvent('cta_join_clicked');
    
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
    }
  };

  const handleJoinClick = () => {
    console.log('🔵 Join button clicked - opening modal');
    setIsModalOpen(true);
  };

  const handleProceedToAuthInternal = () => {
    console.log('🟢 Proceeding to auth...');
    setIsModalOpen(false);
    
    if (onProceedToAuth) {
      onProceedToAuth();
    } else {
      setTimeout(() => {
        const base44 = require('@/api/base44Client').base44;
        base44.auth.redirectToLogin(window.location.href);
      }, 200);
    }
  };

  useEffect(() => {
    console.log('🔔 Modal state changed:', isModalOpen);
  }, [isModalOpen]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #FA4616;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        z-index: 100;
        font-weight: 600;
      }
      
      .skip-link:focus {
        top: 0;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      
      .sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
      
      .animated-hero { 
        background: linear-gradient(135deg, #001540 0%, #0021A5 50%, #002157 100%);
        min-height: 100vh; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        text-align: center; 
        color: white; 
        position: relative; 
        padding: 2rem; 
        padding-top: 6rem;
        overflow: hidden; 
      }
      
      .animated-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.05;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        z-index: 1;
      }
      
      .animated-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      
      .glow-top {
        position: absolute;
        top: 10%;
        right: 25%;
        height: 24rem;
        width: 24rem;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.1);
        filter: blur(80px);
        z-index: 2;
      }
      
      .glow-bottom {
        position: absolute;
        bottom: 10%;
        left: 25%;
        height: 24rem;
        width: 24rem;
        border-radius: 50%;
        background: rgba(250, 70, 22, 0.1);
        filter: blur(80px);
        z-index: 2;
      }
      
      .hero-content { 
        max-width: 900px; 
        z-index: 10; 
        position: relative; 
      }
      
      .animated-hero h1 { 
        font-size: 3rem;
        font-weight: 800;
        color: white;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }
      
      .animated-hero h1 .highlight { 
        color: #FA4616;
        font-weight: 800;
      }
      
      @media (min-width: 768px) {
        .animated-hero h1 {
          font-size: 4rem;
        }
      }
      
      @media (min-width: 1024px) {
        .animated-hero h1 {
          font-size: 5rem;
        }
      }
      
      @media (max-width: 768px) { 
        .animated-hero {
          min-height: 100vh;
          padding: 1.5rem;
          padding-top: 5rem;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .animated-hero::after {
          animation: none !important;
          transition: none !important;
        }
      }

      @keyframes pulse-border {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(250, 70, 22, 0.7);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(250, 70, 22, 0);
        }
      }

      .countdown-badge {
        animation: pulse-border 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      
      {/* Top Right Buttons */}
      {showTopButtons && (
        <div className="fixed top-20 right-4 z-40 flex gap-2">
          {!user ? (
            <>
              <Button
                variant="outline"
                onClick={onRequestInvite}
                className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Request an Invite
              </Button>
              <Button
                variant="outline"
                onClick={onTopRightJoinClick}
                className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
              >
                Join / Sign In
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onInviteFriend}
              className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Invite a Friend
            </Button>
          )}
        </div>
      )}
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
            <div className="bg-[#0021A5] border-2 border-blue-400 rounded-lg p-4">
              <p className="font-bold text-white mb-3 text-sm">
                🎓 UF Students (@ufl.edu):
              </p>
              <ol className="space-y-2 text-sm text-white">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-200">1.</span>
                  <span>Click <strong>"Continue with Google"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-200">2.</span>
                  <span>Sign in with your <strong>@ufl.edu</strong> email</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-200">3.</span>
                  <span>✅ <strong>Instant access!</strong> No invite code needed</span>
                </li>
              </ol>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <p className="font-bold text-orange-900 mb-3 text-sm">
                🧡 Parents and UF Alumni:
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
                  <span>Enter your code</span>
                </li>
              </ol>
            </div>
            
            <div className="text-center mt-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onRequestInvite) onRequestInvite();
                }}
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Don't have a code? Request an invite
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToAuthInternal}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white"
            >
              Got It - Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <section 
        className="animated-hero" 
        role="region" 
        aria-labelledby="hero-title"
      >
        <div className="glow-top" />
        <div className="glow-bottom" />
        
        <div className="hero-content">
          {!user && stats.spotsLeft > 0 && (
            <div className="mb-6 flex justify-center">
              <Badge className="countdown-badge bg-[#FA4616] text-white border-2 border-white/40 px-4 py-2 text-sm md:text-base font-bold shadow-xl">
                🔥 Free for first 1,000 Gators — {stats.spotsLeft} spots left
              </Badge>
            </div>
          )}

          <h1 id="hero-title">
            Get <span className="highlight">Gators</span> Hired.
          </h1>

          <p className="text-lg text-[#FFD700] mt-4 mb-2 px-4">
            College Fast Forward is a private, parent-driven network that accelerates the job search for every Gator.
          </p>

          <div className="text-center max-w-2xl mx-auto mb-2 px-4 mt-6">
            <div className="text-xl md:text-2xl mb-3">
              <span className="text-white font-semibold">College Fast Forward: </span>
              <span className="text-[#FA4616] font-semibold">Turning parents' connections into</span>
            </div>
            <div className="flex justify-center items-center" style={{ minHeight: '2.5rem' }}>
              <div style={{ minWidth: '200px' }} className="text-center">
                <Typewriter
                  text={["jobs", "interviews", "internships", "offers"]}
                  speed={80}
                  waitTime={2000}
                  deleteSpeed={50}
                  className="text-xl md:text-2xl bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold whitespace-nowrap"
                  cursorChar="_"
                  cursorClassName="text-orange-300"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-6 px-4">
            <div className="text-xs sm:text-sm text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="font-semibold">70% of Gen Zers ask their parents to help them find a job.</span>
              <span className="text-white/70 ml-1">(Forbes)</span>
            </div>
          </div>

          <p className="text-center text-white/90 italic text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed px-4">
            "Parents don't just get their kids jobs – they get them access to better employers. And that advantage can last a lifetime."
          </p>
          
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
            id="join-status"
          >
            {announceMessage}
          </div>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            {!user ? (
              <button
                onClick={handleJoinClick}
                className="rounded-full bg-[#FA4616] px-8 py-4 text-base md:text-lg font-semibold text-white shadow-lg hover:brightness-110 hover:shadow-xl transform hover:scale-105 transition-all min-h-[44px]"
              >
                <span className="mr-2">🐊</span>
                Join the Gator Network
              </button>
            ) : (
              <button
                onClick={handleCTAClick}
                className="rounded-full bg-white px-8 py-4 text-base md:text-lg font-semibold text-[#0021A5] shadow-lg hover:shadow-xl hover:bg-slate-50 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-white/60 min-h-[44px] min-w-[44px] flex items-center gap-2"
                aria-label="Go to dashboard"
              >
                <span>🐊</span>
                Go to Dashboard
              </button>
            )}
            
            {!user && (
              <p id="step1" className="text-xs md:text-sm text-white/80 mt-1">
                Join free · Takes 30 seconds
              </p>
            )}
          </div>

          {!user && (
            <>
              <div className="mt-12 mb-6">
                <p className="text-white/90 text-lg md:text-xl font-semibold mb-6">
                  How it works:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <p className="text-white font-medium">Join free</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <p className="text-white font-medium">Tell us who you are</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <p className="text-white font-medium">Your network starts working</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <p className="mt-8 text-center text-white/80 italic text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Your neighbor works at Google. Your friend's mom knows someone in consulting. Parents unlock the hidden job market.
          </p>
        </div>
      </section>
    </>
  );
};

export default AnimatedNetworkHero;