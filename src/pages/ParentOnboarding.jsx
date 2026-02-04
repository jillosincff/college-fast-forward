import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, Check } from 'lucide-react';
import PushNotificationPrompt from '@/components/notifications/PushNotificationPrompt';
import ParentOnboardingStep1 from '@/components/onboarding/parent/ParentOnboardingStep1';
import ParentOnboardingStep2 from '@/components/onboarding/parent/ParentOnboardingStep2';
import ParentOnboardingStep3 from '@/components/onboarding/parent/ParentOnboardingStep3';
import ParentOnboardingSuccess from '@/components/onboarding/parent/ParentOnboardingSuccess';
import Testimonial from '@/components/onboarding/parent/Testimonial';

export default function ParentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  
  // Form data across all steps
  const [formData, setFormData] = useState({
    studentName: '',
    jobTitle: '',
    company: '',
    yearsExperience: '',
    industries: [],
    waysToHelp: []
  });

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleStep3Complete = async (result) => {
    setLoading(true);
    
    try {
      // Save all profile data
      const updateData = {
        current_position: formData.jobTitle?.trim() || undefined,
        current_company: formData.company?.trim() || undefined,
        job_title: formData.jobTitle?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        years_experience: formData.yearsExperience || undefined,
        industries: formData.industries,
        industry: formData.industries[0] || undefined,
        ways_to_help: formData.waysToHelp,
        expertise_areas: formData.waysToHelp,
        help_types: formData.waysToHelp,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_question_answered: result.answeredQuestion || false,
        onboarding_flow_type: result.flowType || 'unknown',
        onboarding_referral_submitted: result.referredSomeone || false,
        visible_in_directory: true
      };

      // Clean undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      await base44.auth.updateMe(updateData);

      // Clear any pending invite data
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');

      if (refreshUser) await refreshUser();
      
      setCompletionResult(result);
      setOnboardingComplete(true);
      setShowPushPrompt(true);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate('ParentDashboard');
  };

  // Show push notification prompt after success screen
  if (showPushPrompt && onboardingComplete) {
    // If user answered a question, go straight to dashboard (they already saw success in Step 3)
    if (completionResult?.answeredQuestion) {
      goToDashboard();
      return null;
    }
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <ParentOnboardingSuccess 
            result={completionResult}
            onComplete={goToDashboard}
          />
          
          <div className="mt-8">
            <PushNotificationPrompt
              user={user}
              onComplete={goToDashboard}
              onSkip={goToDashboard}
            />
          </div>
        </div>
      </div>
    );
  }

  // Progress bar
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-[#0021A5] text-white' : 'bg-slate-200 text-slate-500'}
          `}>
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-1 rounded ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Left side content
  const LeftSideContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Welcome to</p>
            <h1 className="text-3xl font-bold text-white">College Fast Forward</h1>
          </div>
          
          <div className="py-3">
            <p className="text-2xl lg:text-3xl font-black leading-tight text-white">
              Let's set up your profile so we can connect you with students who need your expertise.
            </p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white">
            <p className="text-white">
              <strong>70-80% of jobs are filled through referrals.</strong>{' '}
              Your single introduction could change a student's entire career trajectory.
            </p>
          </div>
        </div>
      );
    }
    
    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 2 of 3</p>
            <h1 className="text-3xl font-bold text-white">What's your background?</h1>
          </div>
          
          <p className="text-xl text-white/90">
            This helps us match you with students who can benefit from your experience.
          </p>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🎯</span>
              <span className="font-semibold text-sm">We match you with students in YOUR industry</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">💫</span>
              <span className="font-semibold text-sm">Your network is their opportunity</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 3) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 3 of 3</p>
            <h1 className="text-3xl font-bold text-white">Help your first student</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Your experience could be exactly what a student needs right now.
          </p>
          
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
              <span className="text-2xl">🚀</span>
              <p className="text-white">One answer from you = months of cold applying for them</p>
            </div>
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
              <span className="text-2xl">⏱️</span>
              <p className="text-white">Most answers take just 2-3 minutes</p>
            </div>
          </div>
          
          {/* Social proof testimonial */}
          <div className="border-t border-blue-700/50 pt-6 mt-6">
            <Testimonial />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT SIDE - UF Blue */}
      <div className="lg:w-[45%] lg:sticky lg:top-0 lg:h-screen bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#000F5C] text-white p-4 sm:p-6 lg:p-10 flex flex-col lg:justify-start lg:pt-10 lg:overflow-y-auto">
        
        <ProgressBar />

        {/* Mobile: Condensed Content */}
        <div className="lg:hidden text-center mb-6">
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Welcome to College Fast Forward</h1>
              <p className="text-sm text-white/90">Let's set up your profile</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">What's your background?</h1>
              <p className="text-sm text-white/90">Help us match you with the right students</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Help your first student</h1>
              <p className="text-sm text-white/90">A student needs your expertise right now</p>
            </>
          )}
        </div>

        {/* Desktop: Full Content */}
        <div className="hidden lg:block">
          <LeftSideContent />
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="lg:w-[55%] bg-white p-4 sm:p-6 lg:p-10 lg:pt-10 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin mb-4" />
              <p className="text-slate-600">Setting up your account...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <ParentOnboardingStep1
                  formData={formData}
                  onUpdate={updateFormData}
                  onNext={() => setStep(2)}
                  userName={user?.full_name}
                />
              )}

              {step === 2 && (
                <ParentOnboardingStep2
                  formData={formData}
                  onUpdate={updateFormData}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <ParentOnboardingStep3
                  formData={formData}
                  onComplete={handleStep3Complete}
                  onBack={() => setStep(2)}
                  user={user}
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}