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

  // STEP 1: About You - High-Energy Two-Column Layout
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* LEFT SIDE - The Hook (Hidden on mobile, shows condensed version) */}
        <div className="lg:w-[45%] bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#0021A5] text-white p-6 lg:p-10 flex flex-col justify-center">
          
          {/* Progress Bar - Mobile & Desktop */}
          <div className="flex items-center justify-center gap-2 mb-6 lg:mb-8">
            <div className="flex items-center gap-1 text-sm">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">👤</span>
              <span className="hidden sm:inline text-white/80">You</span>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className="flex items-center gap-1 text-sm opacity-50">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">🎯</span>
              <span className="hidden sm:inline text-white/60">Goals</span>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className="flex items-center gap-1 text-sm opacity-50">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">🎉</span>
              <span className="hidden sm:inline text-white/60">Matches</span>
            </div>
          </div>

          {/* Mobile: Condensed Content */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-xl font-bold mb-2">Welcome to College Fast Forward</h1>
            <p className="text-2xl font-black text-[#FA4616] mb-3">
              Access beats resumes.
            </p>
            <p className="text-white/80 text-sm mb-4">
              70-80% of jobs are filled through referrals. CFF gives you direct access to 500+ parents & alumni.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="bg-white/10 px-3 py-1.5 rounded-full">🔑 Skip the black hole</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full">🤝 Warm intros</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full">🚀 500+ connections</span>
            </div>
          </div>

          {/* Desktop: Full Content */}
          <div className="hidden lg:block space-y-6">
            <div>
              <p className="text-white/60 uppercase tracking-wider text-sm mb-2">Welcome to</p>
              <h1 className="text-3xl font-bold">College Fast Forward</h1>
            </div>
            
            {/* The Big Statement */}
            <div className="py-4">
              <p className="text-3xl lg:text-4xl font-black leading-tight">
                You've discovered the secret:{' '}
                <span className="text-[#FA4616] inline-block animate-pulse">access beats resumes.</span>
              </p>
            </div>
            
            {/* The Problem */}
            <div className="bg-white/10 rounded-xl p-4 border-l-4 border-[#FA4616]">
              <p className="text-white/90">
                <strong className="text-white">70-80% of jobs are filled through referrals.</strong>{' '}
                But your network is full of people your own age—not hiring managers.
              </p>
            </div>
            
            {/* The Solution */}
            <p className="text-lg text-white/90">
              CFF gives you an <strong className="text-white">unfair advantage</strong>: a pooled community of parents and alumni{' '}
              <strong className="text-white">ready to open doors for you.</strong>
            </p>
            
            {/* Value Props - Animated */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
                <span className="text-2xl">🔑</span>
                <span className="font-semibold">Skip the resume black hole</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
                <span className="text-2xl">🤝</span>
                <span className="font-semibold">Get warm intros to decision-makers</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold">Access 500+ parents & alumni connections</span>
              </div>
            </div>
            
            {/* Quote */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70 italic leading-relaxed">
                "Think of CFF as a master key to a neighborhood of closed doors. Instead of standing on the sidewalk hoping someone notices your resume, you now have neighbors ready to walk you inside."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - The Form */}
        <div className="lg:w-[55%] bg-white p-6 lg:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                Let's find your matches
              </h2>
              <p className="text-slate-500">
                Takes 2 minutes.
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
                           focus:border-[#0021A5] focus:outline-none transition-colors"
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
                          ? 'bg-blue-50 border-[#0021A5] text-[#0021A5] shadow-md'
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
                           focus:border-[#0021A5] focus:outline-none uppercase transition-colors"
                  maxLength={20}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Got a code from a friend or ambassador? Enter it here.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleNext}
                disabled={!isStep1Valid}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all
                  ${isStep1Valid
                    ? 'bg-gradient-to-r from-[#FA4616] to-orange-500 text-white hover:from-orange-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                Find My Matches →
              </button>

              {/* Social Proof */}
              <p className="text-center text-sm text-slate-500">
                Join <span className="font-semibold text-slate-700">500+</span> students already connecting
              </p>
            </div>
          </div>
        </div>
      </div>
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
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              What kind of work interests you?
            </h1>
            <p className="text-slate-600">
              We'll match you with parents and alumni who work in these fields.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Select all that apply
            </p>
          </div>

          <div className="space-y-8">
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

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

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
      nextLabel={loading ? (resumeUploading ? 'Uploading resume...' : 'Finding matches...') : 'Find My Matches →'}
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
                onClick={() => setHelpRequest("I'm interested in " + (industries[0] || "consulting") + " but not sure how to break in. I'd love to connect with someone who works in the field and learn about different career paths.")}
                className="text-left text-xs text-[#0021A5] hover:text-[#001580] hover:underline block"
              >
                → "I want to break into consulting and need guidance..."
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