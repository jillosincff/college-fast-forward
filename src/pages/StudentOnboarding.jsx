import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import ChipSelector from '@/components/onboarding/ChipSelector';
import { 
  INDUSTRIES, 
  STUDENT_SEEKING, 
  STUDENT_HELP_NEEDED,
  GRAD_YEARS 
} from '@/components/onboarding/onboardingOptions';
import { JobRequest } from '@/entities/JobRequest';
import confetti from 'canvas-confetti';

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: About You
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  // Step 2: Interests
  const [industries, setIndustries] = useState([]);
  const [seeking, setSeeking] = useState([]);
  
  // Step 3: Help Needed
  const [helpNeeded, setHelpNeeded] = useState([]);
  const [question, setQuestion] = useState('');

  // Pre-fill from user data if available
  useEffect(() => {
    if (user) {
      if (user.major) setMajor(user.major);
      if (user.graduation_year) setGradYear(user.graduation_year);
      if (user.industries_interested) setIndustries(user.industries_interested);
      if (user.seeking_type) setSeeking(user.seeking_type);
      if (user.help_needed) setHelpNeeded(user.help_needed);
    }
  }, [user]);

  const handleNext = () => {
    if (step < 3) {
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

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Save student profile data
      const updateData = {
        major,
        graduation_year: gradYear,
        industries_interested: industries,
        seeking_type: seeking,
        help_needed: helpNeeded,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      };
      
      // Add referral code if provided
      if (referralCode.trim()) {
        updateData.referral_code = referralCode.trim();
      }
      
      await base44.auth.updateMe(updateData);

      // If they wrote a question, post it
      if (question.trim().length > 10) {
        await JobRequest.create({
          role: 'Student Question',
          title: question.trim(),
          description: question.trim(),
          target_industry: industries[0] || 'Other',
          poster_type: 'student',
          poster_name: user?.full_name || 'Student',
          poster_first_name: user?.full_name?.split(' ')[0] || 'Student',
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

      // Navigate to dashboard after brief delay
      setTimeout(() => {
        navigate('Dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setLoading(false);
    }
  };

  // Validation for each step
  const isStep1Valid = major.trim().length > 0 && gradYear;
  const isStep2Valid = industries.length > 0 && seeking.length > 0;
  const isStep3Valid = helpNeeded.length > 0;

  // STEP 1: About You
  if (step === 1) {
    return (
      <OnboardingLayout
        currentStep={1}
        totalSteps={3}
        onNext={handleNext}
        nextDisabled={!isStep1Valid}
        showBack={false}
      >
        <div className="max-w-lg mx-auto">
          {/* Empathy Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🐊</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              We've got your back.
            </h1>
            <p className="text-slate-600">
              Transitioning to "real life" is hard.<br />
              <strong className="text-slate-800">But you're not doing it alone.</strong>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What's your major?
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science, Business, Psychology"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base
                         focus:border-[#0021A5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                When do you graduate?
              </label>
              <div className="flex flex-wrap gap-2">
                {GRAD_YEARS.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setGradYear(year)}
                    className={`
                      px-5 py-3 rounded-xl font-medium transition-all border-2
                      ${gradYear === year
                        ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }
                    `}
                  >
                    {year}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGradYear('graduated')}
                  className={`
                    px-5 py-3 rounded-xl font-medium transition-all border-2
                    ${gradYear === 'graduated'
                      ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  Already graduated
                </button>
              </div>
            </div>

            {/* Optional Referral Code */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Referral code <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g., GATOR-JOHN"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                         focus:border-[#0021A5] focus:outline-none uppercase"
                maxLength={20}
              />
              <p className="text-xs text-slate-400 mt-1">
                Got a code from a friend or ambassador? Enter it here.
              </p>
            </div>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  // STEP 2: Interests
  if (step === 2) {
    return (
      <OnboardingLayout
        currentStep={2}
        totalSteps={3}
        onNext={handleNext}
        onBack={handleBack}
        nextDisabled={!isStep2Valid}
      >
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              What kind of work interests you?
            </h1>
            <p className="text-slate-500 text-sm">
              Select all that apply
            </p>
          </div>

          <div className="space-y-6">
            {/* Industries */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Industries
              </label>
              <ChipSelector
                options={INDUSTRIES}
                selected={industries}
                onChange={setIndustries}
                multiple={true}
                columns={2}
              />
            </div>

            {/* What are you looking for */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What are you looking for?
              </label>
              <ChipSelector
                options={STUDENT_SEEKING}
                selected={seeking}
                onChange={setSeeking}
                multiple={true}
                columns={2}
              />
            </div>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  // STEP 3: Help Needed
  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onBack={handleBack}
      nextLabel={loading ? 'Finding matches...' : 'Find My Matches →'}
      nextDisabled={!isStep3Valid || loading}
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            What do you need help with?
          </h1>
          <p className="text-slate-500 text-sm">
            Select all that apply
          </p>
        </div>

        <div className="space-y-6">
          {/* Help categories */}
          <ChipSelector
            options={STUDENT_HELP_NEEDED}
            selected={helpNeeded}
            onChange={setHelpNeeded}
            multiple={true}
            columns={1}
          />

          {/* Optional question */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Anything specific on your mind? <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., I have two job offers and can't decide which to take..."
              className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-base
                       resize-none h-24 focus:border-[#0021A5] focus:outline-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right mt-1">
              {question.length}/500
            </p>
          </div>

          {/* Example questions */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-2">💭 Other Gators are asking:</p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li 
                className="italic cursor-pointer hover:text-[#0021A5]"
                onClick={() => setQuestion("How do I choose between two job offers?")}
              >
                "How do I choose between two job offers?"
              </li>
              <li 
                className="italic cursor-pointer hover:text-[#0021A5]"
                onClick={() => setQuestion("Is it okay to not have it all figured out yet?")}
              >
                "Is it okay to not have it all figured out yet?"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}