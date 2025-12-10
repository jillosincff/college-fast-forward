import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';

export default function WelcomeRole() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showError, setShowError] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);

  useEffect(() => {
    // Check for pending invite code from session
    const pendingCode = sessionStorage.getItem('pending_invite_code');
    const pendingType = sessionStorage.getItem('pending_invite_type');
    const pendingInviterName = sessionStorage.getItem('pending_inviter_name');

    if (pendingCode && pendingType && pendingInviterName) {
      console.log('Found pending invite:', { code: pendingCode, type: pendingType });
      setInviteInfo({
        code: pendingCode,
        type: pendingType,
        inviterName: pendingInviterName
      });
      
      // Pre-select the appropriate role based on invite type
      if (pendingType === 'gator_to_parent' || pendingType === 'parent_to_parent') {
        setSelectedRole('parent');
      }
    }
  }, []);

  const roles = [
    {
      id: 'gator',
      icon: GraduationCap,
      title: "I'm a Gator (student or alum)",
      description: 'Forever free — find jobs & get hired',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '🐊'
    },
    {
      id: 'parent',
      icon: Users,
      title: "I'm a Gator parent",
      description: 'Help Gators get hired — open your network',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      emoji: '🧡'
    }
  ];

  const handleContinue = async () => {
    if (!selectedRole) {
      setShowError(true);
      toast({
        title: "Selection Required",
        description: "Please select your role to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userEmail = user.email?.toLowerCase() || '';
      const hasUFLEmail = userEmail.endsWith('@ufl.edu');
      
      // GATOR ROLE: @ufl.edu gets instant access, others need invite code
      if (selectedRole === 'gator') {
        if (hasUFLEmail) {
          console.log('✅ @ufl.edu Gator - instant access!');
          
          toast({
            title: "Welcome Gator! 🎉",
            description: "You earned 50 points for joining with @ufl.edu!",
          });
        } else {
          // Alumni without @ufl.edu need invite code
          if (!inviteInfo || !inviteInfo.code) {
            console.log('Alumni without @ufl.edu - needs invite code');
            
            sessionStorage.setItem('pending_role_selection', 'gator');
            navigate('InviteRequired');
            return;
          }

          console.log('Verifying alumni invite code...');
          
          const result = await verifyInviteCode({
            code: inviteInfo.code,
            invite_type: inviteInfo.type
          });

          if (!result.data.success) {
            toast({
              title: "Invite Verification Failed",
              description: result.data.error || "Invalid invite code",
              variant: "destructive"
            });
            
            sessionStorage.removeItem('pending_invite_code');
            sessionStorage.removeItem('pending_invite_type');
            sessionStorage.removeItem('pending_inviter_name');
            setInviteInfo(null);
            setIsSubmitting(false);
            return;
          }

          console.log('✅ Alumni invite verified successfully!');
          toast({
            title: "Welcome Gator! 🎉",
            description: `Invited by ${result.data.inviter_name}. You earned 50 points!`,
          });

          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_type');
          sessionStorage.removeItem('pending_inviter_name');
        }
      } 
      // PARENT ROLE: Must have invite code
      else if (selectedRole === 'parent') {
        if (!inviteInfo || !inviteInfo.code) {
          console.log('No invite code found - redirecting to InviteRequired page');
          
          // Save the selected role so they don't have to select it again
          sessionStorage.setItem('pending_role_selection', 'parent');
          
          // Redirect to InviteRequired page where they can enter their code
          navigate('InviteRequired');
          return;
        }

        console.log('Verifying parent invite code...');
        
        const result = await verifyInviteCode({
          code: inviteInfo.code,
          invite_type: inviteInfo.type
        });

        if (!result.data.success) {
          toast({
            title: "Invite Verification Failed",
            description: result.data.error || "Invalid invite code",
            variant: "destructive"
          });
          
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_type');
          sessionStorage.removeItem('pending_inviter_name');
          setInviteInfo(null);
          setIsSubmitting(false);
          return;
        }

        console.log('✅ Parent invite verified successfully!');
        toast({
          title: "Welcome! 🎉",
          description: `Invited by ${result.data.inviter_name}. You earned 50 points!`,
        });

        sessionStorage.removeItem('pending_invite_code');
        sessionStorage.removeItem('pending_invite_type');
        sessionStorage.removeItem('pending_inviter_name');
      }

      const updateData = {
        roles: [selectedRole],
        persona: selectedRole,
        onboarding_completed: false,
        profile_completion_score: 10,
        gator_points: 50
      };
      
      console.log('🔄 WelcomeRole: Updating user with:', updateData);

      await base44.auth.updateMe(updateData);
      await refreshUser();

      const nextPage = selectedRole === 'gator' ? 'StudentOnboarding' : 'Onboarding';
      
      console.log('➡️ WelcomeRole: Navigating to:', nextPage);

      navigate(nextPage);

    } catch (error) {
      console.error('Failed to update user role:', error);
      toast({
        title: "Error",
        description: "Failed to save your selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🐊</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
            Welcome to the Gator Network!
          </h1>
          
          {inviteInfo && inviteInfo.code && (
            <div className="mx-auto max-w-md mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🎉 <strong>{inviteInfo.inviterName}</strong> invited you to join!
              </p>
            </div>
          )}
          
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto px-4">
            Select your role to get started
          </p>
        </div>

        {showError && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Selection Required</p>
              <p className="text-sm text-red-700 mt-1">
                Please choose your role to continue.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setShowError(false);
                }}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${isSelected ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' : 'hover:ring-1 hover:ring-slate-300 bg-white'}
                  ${showError && !isSelected ? 'ring-2 ring-red-200 animate-pulse' : ''}
                `}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`${role.bgColor} p-2 sm:p-3 rounded-xl flex-shrink-0`}>
                      <span className="text-2xl sm:text-3xl">{role.emoji}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
                        {role.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`
                        w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-slate-300'}
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm pt-4 pb-safe border-t">
          <Button
            onClick={handleContinue}
            disabled={isSubmitting}
            size="lg"
            className={`
              w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg
              ${!selectedRole 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </Button>
          {!selectedRole && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Select your role to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}