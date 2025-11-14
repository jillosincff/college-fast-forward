
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, LogOut, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// Import student onboarding steps - ONLY StudentStep1Profile
import StudentStep1Profile from '@/components/onboarding/student/StudentStep1Profile';

// Helper function to capitalize names
const capitalizeName = (name) => {
  if (!name) return '';
  return name.trim().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export default function StudentOnboarding() {
  const { user, refreshUser, logout, onSignupComplete } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for welcome
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Simplified form data for onboarding
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    full_name: user?.full_name || '',
    graduation_year: user?.graduation_year || new Date().getFullYear() + 2,
    major: user?.major || '',
    school: user?.school || 'University of Florida',
    location: user?.location || '',
    linkedin_url: user?.linkedin_url || '',
    bio: user?.bio || '',
    profile_image_url: user?.profile_image_url || '',
    includeInDirectory: user?.includeInDirectory !== false,
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const handleUpdate = (data) => {
    // Capitalize names when updated
    const updates = { ...data };
    if (data.first_name !== undefined) {
      updates.first_name = capitalizeName(data.first_name);
    }
    if (data.last_name !== undefined) {
      updates.last_name = capitalizeName(data.last_name);
    }

    // Auto-construct full_name if first_name or last_name are being updated
    if (data.first_name !== undefined || data.last_name !== undefined) {
      const currentFirstName = updates.first_name !== undefined ? updates.first_name : formData.first_name;
      const currentLastName = updates.last_name !== undefined ? updates.last_name : formData.last_name;
      updates.full_name = `${currentFirstName} ${currentLastName}`.trim();
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // First verify we have a valid user context
      if (!user || !user.id || !user.email) {
        throw new Error('User authentication is required. Please sign in again.');
      }

      // Construct full_name from first and last name if not already set, ensuring capitalization
      const firstName = capitalizeName(formData.first_name);
      const lastName = capitalizeName(formData.last_name);
      const fullName = `${firstName} ${lastName}`.trim();

      // Ensure graduation_year is a number if provided
      const updateData = {
        ...formData,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        major: formData.major || null,
        school: formData.school || null,
        location: formData.location || null,
        linkedin_url: formData.linkedin_url || null,
        bio: formData.bio || null,
        profile_image_url: formData.profile_image_url || null,
        includeInDirectory: Boolean(formData.includeInDirectory),
        onboarding_completed: true,
        profile_completion_score: 75,
      };

      // Validate required fields
      if (!updateData.first_name || updateData.first_name.trim() === '') {
        throw new Error('First name is required');
      }
      if (!updateData.last_name || updateData.last_name.trim() === '') {
        throw new Error('Last name is required');
      }

      // Try to refresh user first to ensure valid session
      await refreshUser();

      await User.updateMyUserData(updateData);

      // Refresh to get the updated user object
      await refreshUser();
      
      // Get the fresh user data
      const updatedUser = await User.me();

      // Clear invite session data after successful onboarding
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_type');
      sessionStorage.removeItem('pending_inviter_name');

      // Call onSignupComplete to handle proper routing
      if (onSignupComplete) {
        onSignupComplete(updatedUser);
      } else {
        // Fallback if onSignupComplete is not available
        navigate('Dashboard');
      }

    } catch (error) {
      let userFriendlyMessage = 'There was an error completing your profile. ';

      if (error.status === 401 || error.message?.includes('authentication') || error.message?.includes('Unauthorized')) {
        userFriendlyMessage = 'Your session has expired. Please sign in again to complete your profile.';
        setTimeout(() => {
          navigate('LandingPage');
        }, 2000);
      } else if (error.message?.includes('required')) {
        userFriendlyMessage += 'Please make sure all required fields are filled out.';
      } else if (error.message?.includes('validation')) {
        userFriendlyMessage += 'Please check your information format.';
      } else if (error.status === 403) {
        userFriendlyMessage += 'Permission denied. Please contact support.';
      } else {
        userFriendlyMessage += `Error: ${error.message}`;
      }

      alert(userFriendlyMessage);
      setIsSubmitting(false);
    }
  };

  const handleExitClick = () => {
    if (currentStep > 0) {
      setShowExitModal(true);
    } else {
      navigate('LandingPage');
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    logout();
    navigate('LandingPage');
  };

  // Welcome step component
  const WelcomeStep = () => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#0021A5', '#FA4616', '#FF6B35', '#004E98'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      setTimeout(() => setShowContent(true), 500);
    }, []);

    const userName = capitalizeName(user?.first_name || user?.full_name?.split(' ')[0] || 'Gator');

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 md:p-12 text-center min-h-[500px] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <span className="text-5xl">🐊</span>
          </div>
        </motion.div>

        {showContent && (
          <>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Welcome, {userName}! 🎉
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 mb-6 max-w-lg"
            >
              You're now part of the Gator network! Let's set up your profile to unlock opportunities.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-blue-600 mb-8"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Takes just 2 minutes</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={nextStep}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Let's Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 md:top-6 md:left-6 text-slate-600 hover:text-slate-900 z-10"
        onClick={handleExitClick}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Home
      </Button>

      <Button
        variant="ghost"
        className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-600 hover:text-slate-900 z-10"
        onClick={() => logout()}
        aria-label="Start Over"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Start Over
      </Button>

      <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-white/80 backdrop-blur-sm border-0">
        <CardContent className="p-0">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && (
            <StudentStep1Profile
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleSubmit}
              onBack={prevStep}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to exit?</DialogTitle>
            <DialogDescription>
              Your changes won't be saved if you leave onboarding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitModal(false)}>Stay</Button>
            <Button variant="destructive" onClick={handleConfirmExit}>Exit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
