import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, Check, Link2 } from 'lucide-react';
import PushNotificationPrompt from '@/components/notifications/PushNotificationPrompt';
import { Switch } from '@/components/ui/switch';
import LinkStudentStep from '@/components/onboarding/parent/LinkStudentStep';

// Industry options
const INDUSTRIES = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'consulting', label: 'Consulting', emoji: '📊' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'marketing', label: 'Marketing', emoji: '📱' },
  { id: 'engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'law', label: 'Law', emoji: '⚖️' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { id: 'nonprofit', label: 'Nonprofit', emoji: '❤️' },
  { id: 'government', label: 'Government', emoji: '🏛️' },
  { id: 'media', label: 'Media/Entertainment', emoji: '🎬' },
  { id: 'startups', label: 'Startups', emoji: '🚀' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

// How they can help
const EXPERTISE_AREAS = [
  { id: 'career_advice', label: 'Career advice & guidance', emoji: '💼' },
  { id: 'resume_review', label: 'Resume & LinkedIn review', emoji: '📝' },
  { id: 'mock_interviews', label: 'Mock interviews', emoji: '🎤' },
  { id: 'networking', label: 'Networking & introductions', emoji: '🤝' },
  { id: 'salary_tips', label: 'Salary & negotiation tips', emoji: '💰' },
  { id: 'job_referrals', label: 'Job/internship referrals', emoji: '🔍' },
  { id: 'industry_insights', label: 'Industry insights', emoji: '🏢' },
  { id: 'grad_school', label: 'Grad school advice', emoji: '🎓' },
  { id: 'mentorship', label: 'General mentorship', emoji: '💡' },
];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [linkedStudent, setLinkedStudent] = useState(null);
  const [skippedLinking, setSkippedLinking] = useState(false);
  
  // Check if user is alumni - check multiple sources since role may be stored differently
  const isAlumni = user?.persona === 'alumni' || 
                   user?.roles?.includes('alumni') || 
                   localStorage.getItem('pending_invite_role') === 'alumni' ||
                   sessionStorage.getItem('pending_invite_role') === 'alumni';
  
  // Step 1: Basic Info
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  
  // Step 2: Expertise
  const [industries, setIndustries] = useState([]);
  const [expertise, setExpertise] = useState([]);
  const [bio, setBio] = useState('');
  
  // Step 3 (Alumni only): Alumni Details
  const [alumniGradYear, setAlumniGradYear] = useState('');
  const [alumniMajor, setAlumniMajor] = useState('');
  const [alumniMinor, setAlumniMinor] = useState('');
  const [graduateDegrees, setGraduateDegrees] = useState('');
  
  // Step 4: Visibility (or step 3 for parents)
  const [visibleInDirectory, setVisibleInDirectory] = useState(true);
  
  // Step 5 is now Link Student (or step 4 for parents)

  // LinkedIn URL validation
  const handleLinkedInChange = (value) => {
    setLinkedinUrl(value);
    if (!value.trim()) {
      setLinkedinError('');
      return;
    }
    if (!value.toLowerCase().includes('linkedin.com/in/')) {
      setLinkedinError('Please enter a valid LinkedIn URL (e.g., linkedin.com/in/yourname)');
    } else {
      setLinkedinError('');
    }
  };

  const formatLinkedInUrl = (url) => {
    if (!url.trim()) return '';
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i,
      /^([a-zA-Z0-9\-_]+)$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://linkedin.com/in/${match[1]}`;
      }
    }
    return null;
  };

  const toggleIndustry = (id) => {
    if (industries.includes(id)) {
      setIndustries(industries.filter(i => i !== id));
    } else {
      setIndustries([...industries, id]);
    }
  };

  const toggleExpertise = (id) => {
    if (expertise.includes(id)) {
      setExpertise(expertise.filter(e => e !== id));
    } else {
      setExpertise([...expertise, id]);
    }
  };

  const canProceedStep1 = !linkedinError;
  const canProceedStep2 = expertise.length > 0;
  const canProceedStep3Alumni = alumniGradYear && alumniMajor.trim();
  
  // Generate graduation year options (current year back to 1960)
  const currentYear = new Date().getFullYear();
  const gradYearOptions = [];
  for (let year = currentYear; year >= 1960; year--) {
    gradYearOptions.push(year);
  }

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      const updateData = {
        expertise_areas: expertise,
        help_types: expertise,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        visible_in_directory: visibleInDirectory
      };
      
      if (company.trim()) updateData.current_company = company.trim();
      if (jobTitle.trim()) updateData.current_position = jobTitle.trim();
      if (industries.length > 0) {
        updateData.industry = industries[0];
        updateData.industries = industries;
      }
      if (bio.trim()) updateData.bio = bio.trim();
      
      if (linkedinUrl.trim()) {
        const formattedLinkedIn = formatLinkedInUrl(linkedinUrl);
        if (formattedLinkedIn) {
          updateData.linkedin_url = formattedLinkedIn;
        }
      }
      
      // Alumni-specific fields
      if (isAlumni) {
        if (alumniGradYear) updateData.graduation_year = parseInt(alumniGradYear);
        if (alumniMajor.trim()) updateData.major = alumniMajor.trim();
        if (alumniMinor.trim()) updateData.minor = alumniMinor.trim();
        if (graduateDegrees.trim()) updateData.graduate_degrees = graduateDegrees.trim();
      }

      await base44.auth.updateMe(updateData);

      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');

      if (refreshUser) await refreshUser();
      
      setOnboardingComplete(true);
      setShowPushPrompt(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate('ParentDashboard');
  };

  // Show push notification prompt after onboarding is complete
  if (showPushPrompt && onboardingComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              You're all set!
            </h1>
            <p className="text-slate-600">
              One more thing before you go...
            </p>
          </div>
          
          <PushNotificationPrompt
            user={user}
            onComplete={goToDashboard}
            onSkip={goToDashboard}
          />
        </div>
      </div>
    );
  }

  // Progress bar component - Alumni has 6 steps, Parents have 5
  const totalSteps = isAlumni ? 6 : 5;
  
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-1.5 mb-6 lg:mb-8">
      <div className="flex items-center gap-1 text-sm">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= 1 ? 'bg-white/30' : 'bg-white/10'}`}>
          {step > 1 ? <Check className="w-3.5 h-3.5 text-white" /> : '👤'}
        </span>
        <span className="hidden sm:inline text-white/80 text-xs">You</span>
      </div>
      <div className={`w-4 h-0.5 ${step >= 2 ? 'bg-white/50' : 'bg-white/20'}`}></div>
      <div className="flex items-center gap-1 text-sm">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= 2 ? 'bg-white/30' : 'bg-white/10'}`}>
          {step > 2 ? <Check className="w-3.5 h-3.5 text-white" /> : '🏢'}
        </span>
        <span className="hidden sm:inline text-white/80 text-xs">Industry</span>
      </div>
      <div className={`w-4 h-0.5 ${step >= 3 ? 'bg-white/50' : 'bg-white/20'}`}></div>
      <div className="flex items-center gap-1 text-sm">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= 3 ? 'bg-white/30' : 'bg-white/10'}`}>
          {step > 3 ? <Check className="w-3.5 h-3.5 text-white" /> : '💼'}
        </span>
        <span className="hidden sm:inline text-white/80 text-xs">Help</span>
      </div>
      {isAlumni && (
        <>
          <div className={`w-4 h-0.5 ${step >= 4 ? 'bg-white/50' : 'bg-white/20'}`}></div>
          <div className="flex items-center gap-1 text-sm">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= 4 ? 'bg-white/30' : 'bg-white/10'}`}>
              {step > 4 ? <Check className="w-3.5 h-3.5 text-white" /> : '🎓'}
            </span>
            <span className="hidden sm:inline text-white/80 text-xs">UF</span>
          </div>
        </>
      )}
      <div className={`w-4 h-0.5 ${step >= (isAlumni ? 5 : 4) ? 'bg-white/50' : 'bg-white/20'}`}></div>
      <div className="flex items-center gap-1 text-sm">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= (isAlumni ? 5 : 4) ? 'bg-white/30' : 'bg-white/10'}`}>
          {step > (isAlumni ? 5 : 4) ? <Check className="w-3.5 h-3.5 text-white" /> : '🔗'}
        </span>
        <span className="hidden sm:inline text-white/80 text-xs">Link</span>
      </div>
      <div className={`w-4 h-0.5 ${step >= (isAlumni ? 6 : 5) ? 'bg-white/50' : 'bg-white/20'}`}></div>
      <div className="flex items-center gap-1 text-sm">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= (isAlumni ? 6 : 5) ? 'bg-white/30' : 'bg-white/10'}`}>🤝</span>
        <span className="hidden sm:inline text-white/80 text-xs">Ready</span>
      </div>
    </div>
  );

  // Left side content based on step
  const LeftSideContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Welcome to</p>
            <h1 className="text-3xl font-bold text-white">College Fast Forward</h1>
          </div>
          
          {isAlumni ? (
            <>
              <div className="py-3">
                <p className="text-2xl lg:text-3xl font-black leading-tight text-white">
                  Pay it forward and stay connected.
                </p>
              </div>
              
              <p className="text-lg text-white/90 mb-4">
                Your experience is invaluable to current students — and the network is here for your career moves too.
              </p>
              
              <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white">
                <p className="text-white text-sm">
                  <strong>As an alum, you can:</strong>
                </p>
                <ul className="text-white text-sm mt-2 space-y-1 ml-4 list-disc">
                  <li>Answer student questions and share your wisdom</li>
                  <li>Post exclusive opportunities from your company</li>
                  <li>Get discreet help with your own career transition, new role search, or industry shift</li>
                  <li>Earn karma that boosts visibility for your requests</li>
                </ul>
              </div>
              
              <p className="text-base text-white/90 mt-4">
                Every time you help a student, you strengthen your legacy — and unlock priority for your own needs.
              </p>
            </>
          ) : (
            <>
              <div className="py-3">
                <p className="text-2xl lg:text-3xl font-black leading-tight text-white">
                  You have something students desperately need:{' '}
                  <span className="underline decoration-4 decoration-white/70">access</span>.
                </p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white">
                <p className="text-white">
                  <strong>70-80% of jobs are filled through referrals.</strong>{' '}
                  But today's students are stuck in an "experience loop"—they can't get hired without experience, and can't get experience without being hired.
                </p>
              </div>
              
              <p className="text-lg text-white">
                Your <strong>single introduction</strong> could be the door that changes a student's entire career trajectory.{' '}
                <strong>And it takes you 5 minutes.</strong>
              </p>
            </>
          )}
        </div>
      );
    }
    
    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 2 of 5</p>
            <h1 className="text-3xl font-bold text-white">What's your industry?</h1>
          </div>
          
          <p className="text-xl text-white/90">
            We'll match you with students interested in your field.
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
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 3 of 5</p>
            <h1 className="text-3xl font-bold text-white">How can you help?</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Students need guidance in many areas. Pick what fits you best.
          </p>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🚀</span>
              <span className="font-semibold text-sm">One intro from you = months of cold applying for them</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">⏱️</span>
              <span className="font-semibold text-sm">Most help takes just 5-10 minutes</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Alumni Step 4: UF Details
    if (step === 4 && isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 4 of 6</p>
            <h1 className="text-3xl font-bold text-white">Your Alumni Details 🎓</h1>
          </div>
          
          <p className="text-xl text-white/90">
            A little more about your time at the University of Florida.
          </p>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white mt-6">
            <p className="text-white">
              This helps us match you with the right students and adds credibility to your profile.
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🔗</span>
              <span className="font-semibold text-sm">Students connect with alumni who share their major</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">✨</span>
              <span className="font-semibold text-sm">Your degree adds authority to your advice</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Link Student step (step 4 for parents, step 5 for alumni)
    if ((step === 4 && !isAlumni) || (step === 5 && isAlumni)) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step {isAlumni ? '5 of 6' : '4 of 5'}</p>
            <h1 className="text-3xl font-bold text-white">Link Your Student 🔗</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Unlock the most powerful feature: Family Karma.
          </p>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white mt-6">
            <p className="text-white">
              <strong>How it works:</strong><br />
              When you help other students, YOUR student's questions get pinned to the top of the feed — answered faster.
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">⚡</span>
              <span className="font-semibold text-sm">Your karma = your student's boost</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">📌</span>
              <span className="font-semibold text-sm">Their questions get priority visibility</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Ready step (step 5 for parents, step 6 for alumni)
    if ((step === 5 && !isAlumni) || (step === 6 && isAlumni)) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Final Step</p>
            <h1 className="text-3xl font-bold text-white">You're all set! 🎉</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Students are already looking for someone like you.
          </p>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white mt-6">
            <p className="text-white">
              <strong>What happens next?</strong><br />
              We'll match you with students who need your expertise. You'll get notified when someone wants to connect.
            </p>
          </div>
          
          <p className="text-white font-medium pt-4">
            Join <span className="font-bold">200+ parents & alumni</span> already opening doors
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE - UF Blue */}
      <div className="lg:w-[45%] lg:sticky lg:top-0 lg:h-screen bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#000F5C] text-white p-6 lg:p-10 flex flex-col lg:justify-start lg:pt-10 lg:overflow-y-auto">
        
        <ProgressBar />

        {/* Mobile: Condensed Content */}
        <div className="lg:hidden text-center mb-6">
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">
                {isAlumni 
                  ? 'Welcome to College Fast Forward — the private network for UF alumni.'
                  : 'Welcome to College Fast Forward'
                }
              </h1>
              <p className="text-lg font-black mb-3 text-white">
                {isAlumni 
                  ? 'Pay it forward and stay connected.'
                  : <>You have something students need: <span className="underline decoration-2 decoration-white/70">access</span>.</>
                }
              </p>
              {isAlumni && (
                <p className="text-sm text-white/80">
                  Your experience is invaluable to current students — and the network is here for your career moves too.
                </p>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">What's your superpower?</h1>
              <p className="text-sm text-white/90">Select your areas of expertise</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">How can you help?</h1>
              <p className="text-sm text-white/90">Select your expertise areas</p>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Link Your Student 🔗</h1>
              <p className="text-sm text-white/90">Unlock Family Karma boosts</p>
            </>
          )}
          {step === 5 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">You're all set! 🎉</h1>
              <p className="text-sm text-white/90">Just one more thing...</p>
            </>
          )}
        </div>

        {/* Desktop: Full Content */}
        <div className="hidden lg:block">
          <LeftSideContent />
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="lg:w-[55%] bg-white p-6 lg:p-10 lg:pt-10 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  Tell us about yourself
                </h2>
                <p className="text-slate-500">
                  So we can match you with students who need your expertise.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Where do you work? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What's your job title? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., VP of Marketing, Software Engineer, Attorney"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    LinkedIn Profile <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => handleLinkedInChange(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base
                             focus:outline-none transition-colors
                             ${linkedinError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-[#0021A5]'}`}
                  />
                  {linkedinError ? (
                    <p className="text-xs text-red-500 mt-1">{linkedinError}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Helps students learn more about your background</p>
                  )}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all
                    ${canProceedStep1
                      ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isAlumni ? 'Complete Profile & Start Helping →' : 'Continue →'}
                </button>
                
                {isAlumni && (
                  <button
                    onClick={() => {
                      // Copy invite link or open invite modal
                      const inviteUrl = `${window.location.origin}/#GatorAuth?role=alumni`;
                      navigator.clipboard.writeText(inviteUrl);
                      alert('Invite link copied! Share it with fellow alumni.');
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-[#0021A5] border-2 border-[#0021A5]/30 hover:bg-[#0021A5]/5 transition-all mt-2"
                  >
                    Invite Fellow Alumni
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 2: Industry */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  What's your industry?
                </h2>
                <p className="text-slate-500">
                  Select all that apply — this helps us match you with the right students.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => toggleIndustry(ind.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm
                        transition-all duration-200 border-2
                        ${industries.includes(ind.id)
                          ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }
                      `}
                    >
                      <span>{ind.emoji}</span>
                      <span className="font-medium">{ind.label}</span>
                      {industries.includes(ind.id) && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 rounded-xl font-bold text-lg transition-all bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl"
                  >
                    Continue →
                  </button>
                </div>

                <p className="text-center text-sm text-slate-400">
                  You can skip this if none apply
                </p>
              </div>
            </>
          )}

          {/* STEP 3: How to Help */}
          {step === 3 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  How would you like to help?
                </h2>
                <p className="text-slate-500">
                  Select at least one — this helps us match you with students.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  {EXPERTISE_AREAS.map(area => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleExpertise(area.id)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-left
                        transition-all duration-200 border-2
                        ${expertise.includes(area.id)
                          ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }
                      `}
                    >
                      <span className="text-lg">{area.emoji}</span>
                      <span className="font-medium">{area.label}</span>
                      {expertise.includes(area.id) && <span className="ml-auto text-[#0021A5]">✓</span>}
                    </button>
                  ))}
                </div>

                {expertise.length === 0 && (
                  <p className="text-xs text-amber-600">Please select at least one way you'd like to help</p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Anything else you'd like students to know? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g., 'Stay-at-home mom, my husband works in tech — happy to make intros'"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             resize-none h-20 focus:border-[#0021A5] focus:outline-none transition-colors"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!canProceedStep2}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg transition-all
                      ${canProceedStep2
                        ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 4: Link Your Student */}
          {step === 4 && (
            <LinkStudentStep
              user={user}
              onComplete={(student) => {
                setLinkedStudent(student);
                setStep(5);
              }}
              onSkip={() => {
                setSkippedLinking(true);
                setStep(5);
              }}
            />
          )}

          {/* STEP 5: Ready */}
          {step === 5 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  Almost there!
                </h2>
                <p className="text-slate-500">
                  Just confirm your visibility settings.
                </p>
              </div>

              <div className="space-y-6">
                {/* Show linked student status */}
                {linkedStudent && (
                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">
                          ✅ {linkedStudent.pending ? 'Invite sent to' : 'Linked to'} {linkedStudent.full_name || linkedStudent.email}
                        </p>
                        <p className="text-sm text-green-600">
                          {linkedStudent.pending ? 'They\'ll be linked when they sign up!' : 'Your karma will boost their visibility!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {skippedLinking && (
                  <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>No student linked.</strong> You can link them anytime from your dashboard to unlock karma boosts.
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Show my profile in the directory</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Students can discover you and reach out for help
                      </p>
                    </div>
                    <Switch
                      checked={visibleInDirectory}
                      onCheckedChange={setVisibleInDirectory}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Being visible in the directory means more students can find you based on your expertise. You can always change this later in your profile settings.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Here's what you've shared:</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {company && <p>🏢 {company}</p>}
                    {jobTitle && <p>💼 {jobTitle}</p>}
                    {industries.length > 0 && (
                      <p>🏭 {industries.map(i => INDUSTRIES.find(ind => ind.id === i)?.label).join(', ')}</p>
                    )}
                    <p>🤝 Ready to help with: {expertise.map(e => EXPERTISE_AREAS.find(a => a.id === e)?.label).join(', ')}</p>
                    {linkedStudent && <p>🔗 Linked to: {linkedStudent.full_name || linkedStudent.email}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl font-bold text-lg transition-all bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Setting up your account...
                      </span>
                    ) : (
                      'Complete Profile →'
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                  No spam • You control who contacts you
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}