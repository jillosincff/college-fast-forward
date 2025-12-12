import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';

export default function GatorWelcome() {
  const { user, refreshUser } = useAuth();
  const params = useParams();
  
  // Get role from params, user persona, or sessionStorage
  const pendingRole = sessionStorage.getItem('pending_invite_role');
  const role = user?.persona || params.role || pendingRole;

  useEffect(() => {
    if (!user) {
      console.log('❌ No user on welcome, redirecting to auth');
      navigate('GatorAuth');
    } else {
      console.log('✅ User on welcome page:', user.email, 'role:', role);
      
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      // If parent with invite code, process it
      if (pendingRole === 'parent' && pendingCode && !user.persona) {
        console.log('🔄 [GatorWelcome] Processing parent invite code:', pendingCode);
        
        const processInvite = async () => {
          try {
            const { processParentInviteCode } = await import('@/functions/processParentInviteCode');
            const result = await processParentInviteCode({ invite_code: pendingCode });
            
            if (result.data.success) {
              console.log('✅ [GatorWelcome] Parent linked:', result.data);
              await refreshUser();
              trackEvent('parent_linked_via_code', { 
                student_email: result.data.student_email,
                parent_slot: result.data.parent_slot 
              });
            } else {
              console.error('❌ [GatorWelcome] Failed:', result.data.error);
              alert(`Failed to process invite code: ${result.data.error}`);
            }
          } catch (error) {
            console.error('❌ [GatorWelcome] Error:', error);
            alert('Failed to process invite. Please contact support.');
          }
        };
        
        processInvite();
      }
      // Otherwise just set role
      else if (pendingRole && !user.persona) {
        console.log('🔄 [GatorWelcome] Setting role:', pendingRole);
        base44.auth.updateMe({
          persona: pendingRole,
          roles: [pendingRole]
        }).then(() => {
          console.log('✅ [GatorWelcome] Role set successfully');
          refreshUser();
        }).catch(err => {
          console.error('❌ [GatorWelcome] Failed to set role:', err);
        });
      }
    }
  }, [user]);

  useEffect(() => {
    // Confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      if (window.confetti) {
        window.confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FA4616', '#0021A5', '#FFD700']
        }));
        window.confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FA4616', '#0021A5', '#FFD700']
        }));
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    console.log('🚀 Starting onboarding for role:', role);
    trackEvent('onboarding_started', { role });
    
    // Preserve referral code for onboarding to process
    const referralCode = sessionStorage.getItem('pending_referral_code');
    console.log('🎟️ [GatorWelcome] Preserving referral code for onboarding:', referralCode);
    
    // Clear other pending flags since we're completing onboarding
    sessionStorage.removeItem('pending_invite_role');
    sessionStorage.removeItem('pending_invite_code');
    sessionStorage.removeItem('selected_role');
    // Don't remove pending_referral_code yet - StudentOnboarding needs it
    
    if (role === 'gator') {
      console.log('➡️ Going to StudentOnboarding');
      navigate('StudentOnboarding');
    } else if (role === 'parent' || role === 'alumni') {
      console.log('➡️ Going to Onboarding');
      navigate('Onboarding');
    } else {
      console.log('➡️ Going to Dashboard (fallback)');
      navigate('Dashboard');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-orange-400 opacity-30" />
          </div>
        ))}
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-0 relative">
        <CardContent className="pt-16 pb-12 px-8 text-center">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000"
              style={{ width: '100%' }}
            />
          </div>

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 mx-auto mb-8 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-6xl">🐊</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Welcome to<br />College Fast Forward! 🎉
          </h1>

          <p className="text-lg text-slate-600 mb-3 max-w-xl mx-auto">
            {role === 'gator'
              ? "You're joining a vibrant network of Gators, parents, and alumni accelerating your college success."
              : role === 'parent'
                ? "You're joining a powerful network of parents, students, and alumni empowering Gators to succeed."
                : role === 'alumni'
                  ? "Welcome! As a Gator alum, you're joining a network of students, parents, and fellow alumni."
                  : "You're joining a powerful network of parents helping Gators get hired."
            }
          </p>
          
          <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto">
            {role === 'gator'
              ? "Let's set up your profile to unlock opportunities."
              : role === 'parent'
                ? "Let's set up your profile so you can start supporting your student."
                : role === 'alumni'
                  ? "Let's set up your profile to start networking."
                  : "Let's set up your profile so you can start making an impact."
            }
          </p>

          <div className="inline-flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-full px-6 py-3 mb-10">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-orange-800 font-semibold text-sm">
              ✨ Takes just 2 minutes
            </span>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="h-14 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: role === 'gator' ? '#0021A5' : '#FA4616' }}
          >
            Let's Get Started
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}