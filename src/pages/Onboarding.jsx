import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { navigate } from '@/components/utils/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';

const industries = [
  "Finance", "Tech", "Healthcare", "Engineering", "Consulting",
  "Real Estate", "Law", "Marketing", "Government", "Entrepreneurship", "Other"
];

const primaryGoals = [
  { id: 'career_advice', label: 'Career advice & mock interviews' },
  { id: 'job_leads', label: 'Internship or job leads at my company / network' },
  { id: 'resume_reviews', label: 'Resume & LinkedIn reviews' },
  { id: 'friendly_ear', label: 'Just be a friendly Gator ear when they\'re stressed' },
  { id: 'all_in', label: 'All of the above (I\'m all in!)' }
];


// --- Main Onboarding Component ---

export default function Onboarding() {
  const { user, logout, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Updated from 3 to 4
  const { toast } = useToast();

  const [parentData, setParentData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    full_name: user?.full_name || '', // Will be derived from first/last
    current_position: user?.current_position || '',
    current_company: user?.current_company || '',
    industry: user?.industry || '',
    location: user?.location || '',
    linkedin_url: user?.linkedin_url || '',
    ways_to_help: user?.ways_to_help || [],
    description_of_work: user?.description_of_work || '',
    includeInDirectory: user?.includeInDirectory !== false, // Default to true if not explicitly false
    student_links: [], // New field for student links
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    trackEvent('parent_onboarding_completed', {
      parentId: user.id,
      ...parentData
    });
    try {
      // Ensure names are properly capitalized
      const capitalizedFirstName = capitalizeName(parentData.first_name);
      const capitalizedLastName = capitalizeName(parentData.last_name);
      const fullName = `${capitalizedFirstName} ${capitalizedLastName}`.trim();

      const payload = {
        ...parentData,
        first_name: capitalizedFirstName,
        last_name: capitalizedLastName,
        full_name: fullName,
        onboarding_completed: true,
        expertise_shared: false, // Explicitly set to false to trigger ShareExpertise flow
      };
      await User.updateMyUserData(payload);

      // Link students if provided
      if (parentData.student_links && parentData.student_links.length > 0) {
        try {
          const { data } = await linkStudentsToParent({
            studentEmailsOrNames: parentData.student_links
          });
          
          if (data.linkedCount > 0) {
            toast({
              title: "Students linked!",
              description: `Successfully linked ${data.linkedCount} student(s). They'll benefit from your Parent Power Boost! ⭐`,
            });
          }
        } catch (err) {
          console.error('Failed to link students:', err);
          toast({
            title: "Student Linking Error",
            description: "Some students could not be linked. Please try again later or contact support.",
            variant: "destructive",
          });
        }
      }

      await refreshUser();

      // Clear invite session data after successful onboarding
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_type');
      sessionStorage.removeItem('pending_inviter_name');

      console.log('✅ Profile saved! Redirecting to expertise sharing...');
      toast({
        title: "Almost Done! 🎉",
        description: "One more step to help students find you."
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('ShareExpertise');
      }, 1000);

    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Onboarding Failed",
        description: "There was an issue saving your profile. Please try again.",
        variant: "destructive",
      });
      navigate('ParentDashboard'); // Still navigate to dashboard, but user might need to re-onboard
    }
  };

  // Function to render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} userName={capitalizeName(user?.first_name || user?.full_name?.split(' ')[0] || 'Gator')} />;
      case 2:
        return <WorkInfoStep onNext={nextStep} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      case 3:
        return <LinkStudentsStep onNext={nextStep} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      case 4:
        return <OptionalExtrasStep onFinish={handleFinish} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      default:
        return <WelcomeStep onNext={nextStep} userName={capitalizeName(user?.first_name || user?.full_name?.split(' ')[0] || 'Gator')} />;
    }
  };

  React.useEffect(() => {
    trackEvent('parent_onboarding_started', { parentId: user?.id });
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 z-10"
        onClick={() => logout()}
        aria-label="Start Over"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Start Over
      </Button>

      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="bg-slate-200 rounded-full h-2 w-full max-w-md mx-auto">
            <motion.div
              className="bg-[var(--uf-orange)] h-2 rounded-full"
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}