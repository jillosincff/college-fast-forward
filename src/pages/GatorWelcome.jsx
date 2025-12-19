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
  
  // Get role from params or localStorage (survives redirects better)
  const pendingRole = localStorage.getItem('pending_invite_role');
  const role = pendingRole || params.role || user?.persona;

  useEffect(() => {
    if (!user) {
      console.log('❌ No user on welcome, redirecting to auth');
      navigate('GatorAuth');
    } else {
      console.log('✅ User on welcome page:', user.email, 'role:', role);
      
      const pendingCode = localStorage.getItem('pending_invite_code');
      const isUFL = user.email?.toLowerCase().endsWith('@ufl.edu');
      
      // If student without code and UFL email, auto-verify
      if (pendingRole === 'gator' && !pendingCode && isUFL) {
        console.log('✅ [GatorWelcome] UFL student - auto-verifying');
        base44.auth.updateMe({
          persona: 'gator',
          roles: ['gator'],
          onboarding_completed: false
        }).then(() => {
          console.log('✅ [GatorWelcome] UFL student role set');
          refreshUser();
          
          // Increment user counter
          base44.functions.invoke('incrementUserCount', { user_id: user.id });
          
          // Notify admin of new user
          base44.functions.invoke('notifyNewUserJoined', {
            user_email: user.email,
            user_name: user.full_name,
            user_persona: 'gator',
            user_id: user.id
          });
        });
      }
      // If parent with invite code, set persona first then process invite
      // CRITICAL: Also check if current persona doesn't match pendingRole (fixes wrong persona from previous attempts)
      else if (pendingRole === 'parent' && pendingCode && user.persona !== 'parent') {
        console.log('🔄 [GatorWelcome] Setting parent persona first, then processing invite code:', pendingCode);
        
        const processParentFlow = async () => {
          try {
            // CRITICAL: Set persona to parent FIRST
            await base44.auth.updateMe({
              persona: 'parent',
              roles: ['parent'],
              onboarding_completed: false
            });
            console.log('✅ [GatorWelcome] Parent persona set');
            
            // Increment user counter
            await base44.functions.invoke('incrementUserCount', { user_id: user.id });
            
            // Notify admin of new user
            await base44.functions.invoke('notifyNewUserJoined', {
              user_email: user.email,
              user_name: user.full_name,
              user_persona: 'parent',
              user_id: user.id
            });
            
            // Then process the invite code to link to student
            const response = await base44.functions.invoke('processParentInviteCode', { 
              invite_code: pendingCode 
            });
            
            console.log('✅ [GatorWelcome] Full response:', response);
            const result = response.data || response;
            console.log('✅ [GatorWelcome] Invite code result:', result);
            
            if (result.success) {
              console.log('✅ [GatorWelcome] Parent linked successfully:', result);
              await refreshUser();
              
              // Show success message
              if (result.student_name) {
                alert(`🎉 Success! You're now connected to ${result.student_name}. Let's set up your profile!`);
              } else {
                alert(`🎉 Success! Your parent account is ready. Let's set up your profile!`);
              }
              
              trackEvent('parent_linked_via_code', { 
                student_email: result.student_email,
                parent_slot: result.parent_slot 
              });
            } else {
              console.error('❌ [GatorWelcome] Failed to link:', result.error);
              await refreshUser(); // Still refresh to get the parent persona
              alert(`❌ ${result.error || 'Unable to process invite code'}. You can connect to your student later from your dashboard.`);
            }
          } catch (error) {
            console.error('❌ [GatorWelcome] Error:', error);
            await refreshUser(); // Refresh to get parent persona
            alert('❌ Invite code processing had an issue, but you can connect to your student from the dashboard.');
          }
        };
        
        processParentFlow();
      }
      // Otherwise just set role (or correct wrong persona)
      else if (pendingRole && user.persona !== pendingRole) {
        console.log('🔄 [GatorWelcome] Setting role:', pendingRole);
        base44.auth.updateMe({
          persona: pendingRole,
          roles: [pendingRole],
          onboarding_completed: false
        }).then(() => {
          console.log('✅ [GatorWelcome] Role set successfully');
          refreshUser();
          
          // Increment user counter
          base44.functions.invoke('incrementUserCount', { user_id: user.id });
          
          // Notify admin of new user
          base44.functions.invoke('notifyNewUserJoined', {
            user_email: user.email,
            user_name: user.full_name,
            user_persona: pendingRole,
            user_id: user.id
          });
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
    
    // Clear pending flags from both storage types
    localStorage.removeItem('pending_invite_role');
    localStorage.removeItem('pending_invite_code');
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