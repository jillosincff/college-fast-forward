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
import CelebrationScreen from '@/components/onboarding/student/CelebrationScreen';
import AskFirstQuestion from '@/components/onboarding/student/AskFirstQuestion';

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: About You
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [preTrack, setPreTrack] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  // Step 2: Interests
  const [industries, setIndustries] = useState([]);
  const [seeking, setSeeking] = useState([]);
  
  // Step 3: Question (new flow)
  const [helpNeeded, setHelpNeeded] = useState([]);
  const [helpRequest, setHelpRequest] = useState('');
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  
  // Pre-professional track options
  const PRE_TRACKS = [
    { id: '', label: 'None / Not applicable' },
    { id: 'Pre-Law', label: 'Pre-Law' },
    { id: 'Pre-Med', label: 'Pre-Med' },
    { id: 'Pre-Dental', label: 'Pre-Dental' },
    { id: 'Pre-Vet', label: 'Pre-Vet' },
    { id: 'Pre-Pharmacy', label: 'Pre-Pharmacy' },
    { id: 'Pre-PA', label: 'Pre-PA' },
    { id: 'Pre-Nursing', label: 'Pre-Nursing' },
    { id: 'Pre-Business', label: 'Pre-Business' },
  ];
  
  // Timeline options
  const TIMELINE_OPTIONS = [
    { id: '', label: 'Not sure yet' },
    { id: 'immediate', label: 'ASAP' },
    { id: 'this_semester', label: 'This Semester' },
    { id: 'next_semester', label: 'Next Semester' },
    { id: 'summer', label: 'Summer 2026' },
  ];
  
  // State for celebration screen
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchCount, setMatchCount] = useState(null);

  // Pre-fill from user data if available
  useEffect(() => {
    if (user) {
      if (user.major) setMajor(user.major);
      if (user.minor) setMinor(user.minor);
      if (user.pre_professional_track) setPreTrack(user.pre_professional_track);
      if (user.graduation_year) setGradYear(user.graduation_year);
      if (user.industries_interested) setIndustries(user.industries_interested);
      if (user.seeking_type) setSeeking(user.seeking_type);
      if (user.help_needed) setHelpNeeded(user.help_needed);
      if (user.preferred_work_location) setPreferredLocation(user.preferred_work_location);
      if (user.target_timeline) setTargetTimeline(user.target_timeline);
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
        minor: minor || '',
        pre_professional_track: preTrack || '',
        graduation_year: gradYear,
        industries_interested: industries,
        seeking_type: seeking,
        help_needed: helpNeeded,
        preferred_work_location: preferredLocation || '',
        target_timeline: targetTimeline || '',
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
      // Include student academic info for rich display on QuestionCard
      const nameParts = (user?.full_name || 'Student').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      const fullDescription = helpRequest.trim() + (questionContext.trim() ? '\n\n' + questionContext.trim() : '');
      const jobRequestData = {
        role: 'Student Question',
        title: helpRequest.trim(),
        description: fullDescription,
        category: questionCategory,
        target_industry: industries[0] || 'Other',
        poster_type: 'student',
        // CRITICAL: Always store poster_email so answer notifications can reach the student
        poster_email: user?.email,
        poster_name: user?.full_name || 'Student',
        poster_first_name: firstName,
        poster_last_name: lastName,
        // Store student academic info for QuestionCard display
        student_year: gradYear || '',
        student_major: major || '',
        student_minor: minor || '',
        student_pre_track: preTrack || '',
        status: 'active',
        role_type: 'full_time',
        target_helpers: ['alumni', 'parents'],
        resume_url: resumeUrl,
        help_types: questionCategory ? [questionCategory] : helpNeeded,
        start_timing: targetTimeline || '',
        location_preference: preferredLocation.trim() || ''
      };
      
      await JobRequest.create(jobRequestData);

      // Create ActivationPrompt for tracking first meaningful action
      // Student just posted a question during onboarding — that counts as activation
      try {
        const utmSource = sessionStorage.getItem('utm_source');
        const utmCampaign = sessionStorage.getItem('utm_campaign');
        let source = 'organic';
        if (utmSource === 'newsletter' && utmCampaign) {
          source = `newsletter_${utmCampaign}`;
        } else if (utmSource) {
          source = utmSource;
        }

        await base44.entities.ActivationPrompt.create({
          user_id: user.id,
          user_type: 'student',
          user_email: user.email,
          prompt_stage: 'welcome',
          status: 'acted',
          action_taken: true,
          action_type: 'posted_question',
          acted_at: new Date().toISOString(),
          source,
        });
        console.log('✅ ActivationPrompt created for student (already activated via question)');
      } catch (apErr) {
        console.log('ActivationPrompt creation failed (non-critical):', apErr.message);
      }

      await refreshUser();

      // Award student karma for completing profile (+15)
      try {
        await base44.functions.invoke('awardStudentKarma', {
          userId: user.id,
          userEmail: user.email,
          actionType: 'complete_profile',
          description: 'Completed student profile'
        });
        console.log('✅ Student karma awarded for profile completion');
      } catch (karmaErr) {
        console.log('Student karma for profile failed (non-critical):', karmaErr.message);
      }

      // Check if a parent already linked this student's email (auto-link)
      try {
        await base44.functions.invoke('linkStudentToParent', {
          action: 'auto_link',
          studentUserId: user.id,
          studentEmailAddress: user.email
        });
        console.log('✅ Auto-link check completed');
      } catch (autoLinkErr) {
        console.log('Auto-link check failed (non-critical):', autoLinkErr.message);
      }

      // Send welcome email (fire-and-forget)
      try {
        base44.functions.invoke('sendWelcomeEmail', {
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          persona: 'gator',
          userIndustries: industries,
        }).catch(e => console.log('Welcome email failed (non-critical):', e.message));
        console.log('✅ Welcome email triggered');
      } catch (e) {
        console.log('Welcome email trigger failed (non-critical):', e.message);
      }

      // Show celebration screen instead of navigating directly
      setShowCelebration(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setLoading(false);
    }
  };
  
  // Show celebration screen after onboarding complete
  if (showCelebration) {
    return <CelebrationScreen user={user} />;
  }

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
  const isStep3Valid = questionCategory && helpRequest.trim().length >= 10;

  // STEP 1: About You - High-Energy Two-Column Layout
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
        {/* LEFT SIDE - The Hook (Hidden on mobile, shows condensed version) */}
        <div className="lg:w-[45%] bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#0021A5] text-white p-4 sm:p-6 lg:p-10 flex flex-col justify-center">
          
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
              <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Welcome to</p>
              <h1 className="text-3xl font-bold text-white">College Fast Forward</h1>
            </div>
            
            {/* The Big Statement */}
            <div className="py-4">
              <p className="text-3xl lg:text-4xl font-black leading-tight text-white">
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
              <p className="text-sm text-white/80 italic leading-relaxed">
                "Think of CFF as a master key to a neighborhood of closed doors. Instead of standing on the sidewalk hoping someone notices your resume, you now have neighbors ready to walk you inside."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - The Form */}
        <div className="lg:w-[55%] bg-white p-4 sm:p-6 lg:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                Let's get to know you
              </h2>
              <p className="text-slate-500">
                Takes 2 minutes.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What's your major? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science, Business, Psychology"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>

              {/* Minor - Optional */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Minor <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  placeholder="e.g., Economics, Spanish"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>

              {/* Pre-Professional Track */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pre-professional track <span className="font-normal text-slate-400">(if applicable)</span>
                </label>
                <select
                  value={preTrack}
                  onChange={(e) => setPreTrack(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                           focus:border-[#0021A5] focus:outline-none transition-colors bg-white"
                >
                  {PRE_TRACKS.map(track => (
                    <option key={track.id} value={track.id}>{track.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  When do you graduate? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRAD_YEARS.map(year => (
                    <button
                      key={year}
                      type="button"
                      data-chip="true"
                      onClick={() => setGradYear(year)}
                      className={`
                        chip-btn px-4 py-2.5 rounded-xl font-medium transition-all border-2 text-sm
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
                    ? 'bg-[#FA4616] text-white hover:bg-[#E03E14] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                Continue →
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

  // STEP 3: Ask First Question (new category-first flow with inspiration chips)
  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onBack={handleBack}
      nextLabel={loading ? (resumeUploading ? 'Uploading resume...' : 'Finding matches...') : 'Post my question →'}
      nextDisabled={!isStep3Valid || loading}
    >
      <AskFirstQuestion
        question={helpRequest}
        onQuestionChange={setHelpRequest}
        category={questionCategory}
        onCategoryChange={setQuestionCategory}
        context={questionContext}
        onContextChange={setQuestionContext}
        location={preferredLocation}
        onLocationChange={setPreferredLocation}
        timeline={targetTimeline}
        onTimelineChange={setTargetTimeline}
      />

      {/* Skip option */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => {
            // Skip question posting - just complete onboarding
            setHelpRequest('__SKIP__');
            setQuestionCategory('networking');
          }}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}
        >
          Skip for now — I'll post a question later
        </button>
      </div>

      {/* Resume Upload - OPTIONAL */}
      {questionCategory && helpRequest.trim().length >= 10 && helpRequest !== '__SKIP__' && (
        <div className="max-w-lg mx-auto mt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Upload your resume <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              resumeFile ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-[#0021A5] hover:bg-blue-50/50'
            }`}
            onClick={() => document.getElementById('resume-upload').click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleResumeDrop}
          >
            <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
            {resumeFile ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <p className="font-medium text-slate-800">{resumeFile.name}</p>
                  <p className="text-xs text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }} className="ml-4 p-1 text-slate-400 hover:text-red-500">✕</button>
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
        </div>
      )}
    </OnboardingLayout>
  );
}