import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import ChipSelector from '@/components/onboarding/ChipSelector';
import { INDUSTRIES, EXPERTISE_AREAS } from '@/components/onboarding/onboardingOptions';
import { ParentExpertise } from '@/entities/ParentExpertise';
import { JobRequest } from '@/entities/JobRequest';
import confetti from 'canvas-confetti';

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Determine if user is alumni (they need invite code)
  const isAlumni = user?.persona === 'alumni' || user?.roles?.includes('alumni');
  const totalSteps = isAlumni ? 4 : 3;
  
  // Step 1: About You
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState([]);
  const [title, setTitle] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  // Step 2: How Can You Help
  const [expertise, setExpertise] = useState([]);
  
  // Step 3: Question
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Pre-fill from user data if available
  useEffect(() => {
    if (user) {
      if (user.current_company) setCompany(user.current_company);
      if (user.industry) setIndustry([user.industry]);
      if (user.current_position) setTitle(user.current_position);
      if (user.help_types) setExpertise(user.help_types);
    }
  }, [user]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Save parent/alumni profile data
      const updateData = {
        current_company: company,
        industry: industry[0] || '',
        industries: industry,
        current_position: title,
        help_types: expertise,
        expertise_areas: expertise,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        visible_in_directory: true
      };
      
      // Add referral code if provided (alumni)
      if (referralCode.trim()) {
        updateData.referral_code = referralCode.trim();
      }
      
      await base44.auth.updateMe(updateData);

      // Create ParentExpertise for matching
      try {
        await ParentExpertise.create({
          parent_id: user.id,
          parent_email: user.email,
          parent_name: user.full_name,
          industry: industry[0] || '',
          current_role: title,
          current_company: company,
          help_types: expertise,
          available: true
        });
      } catch (expertiseError) {
        console.log('ParentExpertise creation skipped:', expertiseError);
      }

      // If they wrote a question, post it
      if (question.trim().length > 10) {
        await JobRequest.create({
          role: 'Parent Question',
          title: 'Parent Question',
          description: question.trim(),
          target_industry: industry[0] || 'Other',
          poster_type: 'parent',
          is_anonymous: isAnonymous,
          poster_name: isAnonymous ? 'Anonymous Parent' : (user?.full_name || 'Parent'),
          poster_first_name: isAnonymous ? 'Anonymous' : (user?.full_name?.split(' ')[0] || 'Parent'),
          status: 'active',
          role_type: 'full_time',
          target_helpers: ['alumni', 'parents']
        });
      }

      await refreshUser();

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0021A5', '#FA4616', '#FF6B35']
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate('ParentDashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setLoading(false);
    }
  };

  // Validation
  const isStep1Valid = company.trim().length > 0 && industry.length > 0 && title.trim().length > 0;
  const isStep2Valid = expertise.length > 0;

  // STEP 0 (Alumni only): Invite Code
  if (isAlumni && step === 1) {
    return (
      <OnboardingLayout
        currentStep={1}
        totalSteps={totalSteps}
        onNext={handleNext}
        nextDisabled={!referralCode.trim()}
        showBack={false}
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🐊</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome back, Gator!
            </h1>
            <p className="text-slate-600">
              Enter your invite code to join the network.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g., GATOR-JOHN"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base text-center
                         focus:border-[#0021A5] focus:outline-none uppercase tracking-widest"
                maxLength={20}
              />
              <p className="text-xs text-slate-400 mt-2 text-center">
                Don't have a code? Ask a current member or <a href="#RequestInvite" className="text-[#0021A5] underline">request access</a>.
              </p>
            </div>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  // Adjust step number for alumni (they have an extra step at the beginning)
  const displayStep = isAlumni ? step : step;
  const actualStep = isAlumni ? step - 1 : step;

  // STEP 1: About You (Step 2 for alumni)
  if ((isAlumni && step === 2) || (!isAlumni && step === 1)) {
    return (
      <OnboardingLayout
        currentStep={displayStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        nextDisabled={!isStep1Valid}
        showBack={isAlumni}
        onBack={isAlumni ? handleBack : undefined}
      >
        <div className="max-w-lg mx-auto">
          {/* Empathy Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💙</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              We know this time isn't easy.
            </h1>
            <p className="text-slate-600">
              For them AND for you.<br />
              <strong className="text-slate-800">You're not alone.</strong>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Where do you work?
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base
                         focus:border-[#0021A5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What industry?
              </label>
              <ChipSelector
                options={INDUSTRIES}
                selected={industry}
                onChange={setIndustry}
                multiple={true}
                columns={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your role/title?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., VP of Marketing, Software Engineer, Attorney"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base
                         focus:border-[#0021A5] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  // STEP 2: How Can You Help (Step 3 for alumni)
  if ((isAlumni && step === 3) || (!isAlumni && step === 2)) {
    return (
      <OnboardingLayout
        currentStep={isAlumni ? 3 : 2}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        nextDisabled={expertise.length === 0}
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              How would you like to help students?
            </h1>
            <p className="text-slate-500 text-sm">
              Select all that apply
            </p>
          </div>

          <ChipSelector
            options={EXPERTISE_AREAS}
            selected={expertise}
            onChange={setExpertise}
            multiple={true}
            columns={1}
          />
        </div>
      </OnboardingLayout>
    );
  }

  // STEP 3: Optional Question
  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onBack={handleBack}
      nextLabel={loading ? 'Setting up...' : (question.trim().length > 10 ? 'Post & Finish →' : 'Finish →')}
      nextDisabled={loading}
      showSkip={true}
      onSkip={handleSkip}
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Almost done!
          </h1>
          <p className="text-slate-600">
            Thousands of Gator parents are going through this too.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What's on your mind lately?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Share a concern, ask a question, or just vent. This community gets it."
              className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base
                       resize-none h-32 focus:border-[#0021A5] focus:outline-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right mt-1">
              {question.length}/500
            </p>
          </div>

          {/* Anonymous option */}
          {question.trim().length > 10 && (
            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-[#0021A5] rounded mt-0.5"
              />
              <div>
                <p className="font-medium text-slate-900 text-sm">Post anonymously</p>
                <p className="text-xs text-slate-600">
                  Your question will show as "Anonymous Parent"
                </p>
              </div>
            </label>
          )}

          {/* Example questions */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-2">💭 Other parents are asking:</p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li 
                className="italic cursor-pointer hover:text-[#0021A5]"
                onClick={() => setQuestion("My daughter got rejected from her dream job. How do I support her without making it worse?")}
              >
                "My daughter got rejected from her dream job. How do I support her?"
              </li>
              <li 
                className="italic cursor-pointer hover:text-[#0021A5]"
                onClick={() => setQuestion("How do I help without being a helicopter parent?")}
              >
                "How do I help without being a helicopter parent?"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}