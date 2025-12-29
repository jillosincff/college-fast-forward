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
  const [helpRequest, setHelpRequest] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

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
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        setResumeUploading(true);
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({ file: resumeFile });
          resumeUrl = uploadResult.file_url;
        } catch (uploadError) {
          console.error('Resume upload failed:', uploadError);
          // Continue without resume - don't block onboarding
        }
        setResumeUploading(false);
      }

      // Save student profile data
      const updateData = {
        major,
        graduation_year: gradYear,
        industries_interested: industries,
        seeking_type: seeking,
        help_needed: helpNeeded,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        // Start the 30-day intro challenge
        challenge_start_date: new Date().toISOString(),
        challenge_intros_count: 0,
        challenge_completed: false,
        challenge_intros: []
      };
      
      if (resumeUrl) updateData.resume_url = resumeUrl;
      if (referralCode.trim()) updateData.referral_code = referralCode.trim();
      
      await base44.auth.updateMe(updateData);

      // Post the help request to All Questions (REQUIRED now)
      const jobRequestData = {
        role: 'Student Question',
        title: helpRequest.trim(),
        description: helpRequest.trim(),
        target_industry: industries[0] || 'Other',
        poster_type: 'student',
        poster_name: user?.full_name || 'Student',
        poster_first_name: user?.full_name?.split(' ')[0] || 'Student',
        status: 'active',
        role_type: 'full_time',
        target_helpers: ['alumni', 'parents'],
        resume_url: resumeUrl,
        help_types: helpNeeded
      };
      
      if (preferredLocation.trim()) {
        jobRequestData.location_preference = preferredLocation.trim();
      }
      
      await JobRequest.create(jobRequestData);

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

  // Resume handlers
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetResume(file);
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetResume(file);
  };

  const validateAndSetResume = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    setResumeFile(file);
  };

  // Validation for each step
  const isStep1Valid = major.trim().length > 0 && gradYear;
  const isStep2Valid = industries.length > 0 && seeking.length > 0;
  const isStep3Valid = helpNeeded.length > 0 && helpRequest.trim().length >= 20;

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
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              You're 2 minutes away from your first intro.
            </h1>
            <p className="text-slate-600">
              Tell us a bit about yourself so we can find the right matches.
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
                placeholder="e.g., UF-JOHN"
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

  // STEP 3: Help Request (REQUIRED) + Resume Upload
  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onBack={handleBack}
      nextLabel={loading ? (resumeUploading ? 'Uploading resume...' : 'Posting...') : 'Post & Find My Matches →'}
      nextDisabled={!isStep3Valid || loading}
    >
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            What do you need help with?
          </h1>
          <p className="text-slate-600">
            This is how parents and alumni find you!
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Your request will appear in the community feed where people can offer advice and connections.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Help Categories */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              What kind of help do you need? <span className="text-slate-400 font-normal">(select all that apply)</span>
            </label>
            <ChipSelector
              options={STUDENT_HELP_NEEDED}
              selected={helpNeeded}
              onChange={setHelpNeeded}
              multiple={true}
              columns={1}
            />
          </div>

          {/* Preferred Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Where are you looking to work? <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="e.g., Miami, New York City, Remote, Anywhere"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                       focus:border-[#0021A5] focus:outline-none"
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">
              This helps connect you with people in your target area.
            </p>
          </div>

          {/* Help Request - REQUIRED */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-[#0021A5] rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold text-[#0021A5] mb-2">
              ⭐ Tell us what you're looking for: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={helpRequest}
              onChange={(e) => setHelpRequest(e.target.value)}
              placeholder={`Be specific! The more detail, the better help you'll get.

e.g., "I'm a junior marketing major looking for summer internships in tech. I'd love advice on breaking into product marketing and help with my resume."`}
              className={`
                w-full px-4 py-4 border-2 rounded-xl text-base
                resize-none h-36 focus:outline-none transition-colors
                ${helpRequest.trim().length < 20 
                  ? 'border-slate-200 focus:border-[#0021A5]' 
                  : 'border-green-300 focus:border-green-500 bg-green-50/50'
                }
              `}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs ${helpRequest.trim().length < 20 ? 'text-amber-600' : 'text-green-600 font-medium'}`}>
                {helpRequest.trim().length < 20 
                  ? `Please write at least 20 characters (${helpRequest.trim().length}/20)` 
                  : '✓ Looks good!'
                }
              </p>
              <p className="text-xs text-slate-400">{helpRequest.length}/500</p>
            </div>
          </div>

          {/* Clickable Examples */}
          <div>
            <p className="text-xs text-slate-500 mb-2">💡 Click an example to get started:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setHelpRequest("I'm a junior studying " + (major || "[major]") + " and looking for summer internships in " + (industries[0] || "[industry]") + ". I'd love advice on how to stand out and any connections in the field.")}
                className="text-left text-xs text-[#0021A5] hover:text-[#001580] hover:underline block"
              >
                → "I'm looking for internships and want advice on how to stand out..."
              </button>
              <button
                type="button"
                onClick={() => setHelpRequest("I'm graduating in " + (gradYear || "[year]") + " and have two job offers - one pays more but the other has better growth potential. I could really use advice from someone who's been in this situation.")}
                className="text-left text-xs text-[#0021A5] hover:text-[#001580] hover:underline block"
              >
                → "I have two job offers and need help deciding..."
              </button>
              <button
                type="button"
                onClick={() => setHelpRequest("I'm interested in " + (industries[0] || "[industry]") + " but not sure how to break in. I'd love to connect with someone who works in the field and learn about different career paths.")}
                className="text-left text-xs text-[#0021A5] hover:text-[#001580] hover:underline block"
              >
                → "I want to break into [industry] and need guidance..."
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📄</span>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-700">This will be posted</strong> to the community feed where parents & alumni can see it and help.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✏️</span>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-700">You can edit this anytime</strong> from your dashboard.
              </p>
            </div>
          </div>

          {/* Resume Upload - OPTIONAL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload your resume <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            
            <div 
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                transition-colors
                ${resumeFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-slate-300 hover:border-[#0021A5] hover:bg-blue-50/50'
                }
              `}
              onClick={() => document.getElementById('resume-upload').click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleResumeDrop}
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
              />
              
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{resumeFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                    className="ml-4 p-1 text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-medium text-slate-700">Drag & drop your resume here</p>
                  <p className="text-sm text-slate-500">or click to browse</p>
                  <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX (max 5MB)</p>
                </>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              💡 Adding your resume helps parents give you specific feedback on your experience.
            </p>
          </div>

        </div>
      </div>
    </OnboardingLayout>
  );
}