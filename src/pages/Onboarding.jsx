import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, Check, Link2 } from 'lucide-react';
import PushNotificationPrompt from '@/components/notifications/PushNotificationPrompt';
import { Switch } from '@/components/ui/switch';
import LinkStudentStep from '@/components/onboarding/parent/LinkStudentStep';
import AlumniIntentStep from '@/components/onboarding/alumni/AlumniIntentStep';

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

// How they can help (consolidated 5 categories)
const EXPERTISE_AREAS = [
  { id: 'career_guidance', label: 'Career guidance', emoji: '💼', description: 'Career paths, transitions, mentorship, salary advice' },
  { id: 'jobs_referrals', label: 'Jobs & referrals', emoji: '🔍', description: 'Job search help, referrals, sharing opportunities' },
  { id: 'resume_interviews', label: 'Resume & interviews', emoji: '📄', description: 'Resume review, LinkedIn optimization, mock interviews' },
  { id: 'industry_insights', label: 'Industry insights', emoji: '🏢', description: 'Day-to-day work, breaking into a field, career paths' },
  { id: 'introductions', label: 'Introductions', emoji: '🤝', description: 'Connecting with specific people or companies' },
];

// What SEEKER alumni need help with
const SEEKER_NEEDS = [
  { id: 'intros_hiring_managers', label: 'Introductions to hiring managers', emoji: '🤝' },
  { id: 'career_advice', label: 'Career advice / industry guidance', emoji: '💼' },
  { id: 'resume_review', label: 'Resume review', emoji: '📄' },
  { id: 'interview_prep', label: 'Interview prep', emoji: '🎤' },
  { id: 'salary_negotiation', label: 'Salary negotiation advice', emoji: '💰' },
  { id: 'career_pivot', label: 'Career pivot guidance', emoji: '🔄' },
];

// How seekers can pay it forward (help students)
const SEEKER_PAY_IT_FORWARD = [
  { id: 'career_guidance_pif', label: 'Career guidance — I can share what I\'ve learned', emoji: '💡' },
  { id: 'interview_tips_pif', label: 'Interview tips — I\'ve been through it recently', emoji: '🎯' },
  { id: 'salary_data_pif', label: 'Salary data — I can share offer details anonymously', emoji: '📊' },
  { id: 'resume_feedback_pif', label: 'Resume feedback — I know what works', emoji: '📝' },
  { id: 'industry_insights_pif', label: 'Industry insights — I can share what my field is really like', emoji: '🏢' },
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
  
  // Alumni Intent (help_students or seeking_help)
  const [alumniIntent, setAlumniIntent] = useState('');

  // Step 3 (Alumni only): Alumni Details
  const [alumniGradYear, setAlumniGradYear] = useState('');
  const [alumniMajor, setAlumniMajor] = useState('');
  const [alumniMinor, setAlumniMinor] = useState('');
  const [graduateDegrees, setGraduateDegrees] = useState('');
  
  // Step 5 (Alumni only): Story Sharing
  const [storyOption, setStoryOption] = useState(''); // 'yes', 'maybe', 'no'
  const [alumniStory, setAlumniStory] = useState('');
  const [storyAnonymous, setStoryAnonymous] = useState(true);
  
  // Alumni "Get Help" - what they need help with (Step 3)
  const [needsHelpWith, setNeedsHelpWith] = useState([]);
  const [isGoodForNow, setIsGoodForNow] = useState(false);
  
  // Alumni helper: Years of experience
  const [yearsExperience, setYearsExperience] = useState('');
  
  // Alumni seeker specific fields
  const [seekerNeeds, setSeekerNeeds] = useState([]);
  const [seekerPayItForward, setSeekerPayItForward] = useState([]);
  const [seekerCurrentRole, setSeekerCurrentRole] = useState('');
  const [seekerActivelyLooking, setSeekerActivelyLooking] = useState(false);
  const [seekerTargetRoles, setSeekerTargetRoles] = useState('');
  
  // Visibility setting
  const [visibleInDirectory, setVisibleInDirectory] = useState(true);

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

  const toggleNeedsHelp = (id) => {
    if (isGoodForNow) setIsGoodForNow(false);
    if (needsHelpWith.includes(id)) {
      setNeedsHelpWith(needsHelpWith.filter(e => e !== id));
    } else {
      setNeedsHelpWith([...needsHelpWith, id]);
    }
  };

  const handleGoodForNow = () => {
    setIsGoodForNow(!isGoodForNow);
    if (!isGoodForNow) {
      setNeedsHelpWith([]);
    }
  };

  // Derived: is the alumni a helper?
  const isAlumniHelper = isAlumni && alumniIntent === 'help_students';
  const isAlumniSeeker = isAlumni && alumniIntent === 'seeking_help';

  const toggleSeekerNeed = (id) => {
    setSeekerNeeds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };
  const toggleSeekerPIF = (id) => {
    setSeekerPayItForward(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const canProceedStep1 = !linkedinError;
  const canProceedStep2 = isAlumniSeeker ? seekerNeeds.length > 0 : expertise.length > 0;
  const canProceedStep3Alumni = alumniGradYear && alumniMajor.trim();
  const canProceedStep5Alumni = storyOption !== '' && (storyOption !== 'yes' || alumniStory.trim().length > 0);
  
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
        if (alumniIntent) updateData.alumni_intent = alumniIntent;
        if (alumniGradYear) updateData.graduation_year = parseInt(alumniGradYear);
        if (alumniMajor.trim()) updateData.major = alumniMajor.trim();
        if (alumniMinor.trim()) updateData.minor = alumniMinor.trim();
        if (graduateDegrees.trim()) updateData.graduate_degrees = graduateDegrees.trim();
        if (yearsExperience) updateData.years_experience = yearsExperience;
        
        // Seeker-specific fields
        if (alumniIntent === 'seeking_help') {
          updateData.seeker_needs = seekerNeeds;
          updateData.seeker_pay_it_forward = seekerPayItForward;
          if (seekerCurrentRole.trim()) updateData.seeker_current_role = seekerCurrentRole.trim();
          updateData.seeker_actively_looking = seekerActivelyLooking;
          if (seekerTargetRoles.trim()) updateData.seeker_target_roles = seekerTargetRoles.trim();
          // Also save seeker pay-it-forward as expertise for matching
          updateData.expertise_areas = seekerPayItForward;
          updateData.help_types = seekerPayItForward;
        }
        
        // Story sharing
        if (storyOption === 'yes' && alumniStory.trim()) {
          updateData.alumni_story = alumniStory.trim();
          updateData.willing_to_share_story = true;
          updateData.story_anonymous = storyAnonymous;
        } else if (storyOption === 'maybe') {
          updateData.willing_to_share_story = null; // remind later
        } else {
          updateData.willing_to_share_story = false;
        }
      }

      await base44.auth.updateMe(updateData);

      // Award karma for completing onboarding (+50 pts)
      try {
        await base44.functions.invoke('awardKarma', {
          parentUserId: user.id,
          parentEmail: user.email,
          parentName: user.full_name,
          actionType: 'onboarding_complete',
          referenceType: 'onboarding',
          referenceId: user.id,
          description: 'Completed alumni onboarding'
        });
        console.log('✅ Alumni onboarding karma awarded');
      } catch (karmaErr) {
        console.log('Alumni onboarding karma failed (non-critical):', karmaErr.message);
      }

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
    // Alumni go to ParentDashboard (same as parents) since they share the helper view
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

  // Progress bar component - Alumni has 8 steps (with intent + invite parent), Parents have 5 (with link student)
  const totalSteps = isAlumni ? 8 : 5;
  
  // Alumni steps: 1=You, 2=Industry, 3=Intent, 4=Help, 5=UF, 6=Story, 7=Family, 8=Ready
  // Parent steps: 1=You, 2=Industry, 3=Help, 4=Link, 5=Ready
  const ProgressBar = () => {
    const alumniSteps = [
      { emoji: '👤', label: 'You' },
      { emoji: '🏢', label: 'Industry' },
      { emoji: '🎯', label: 'Intent' },
      { emoji: '💼', label: 'Help' },
      { emoji: '🎓', label: 'UF' },
      { emoji: '📖', label: 'Story' },
      { emoji: '👨‍👩‍👧', label: 'Family' },
      { emoji: '🤝', label: 'Ready' },
    ];
    const parentSteps = [
      { emoji: '👤', label: 'You' },
      { emoji: '🏢', label: 'Industry' },
      { emoji: '💼', label: 'Help' },
      { emoji: '🔗', label: 'Link' },
      { emoji: '🤝', label: 'Ready' },
    ];
    const steps = isAlumni ? alumniSteps : parentSteps;

    return (
      <div className="flex items-center justify-center gap-1.5 mb-6 lg:mb-8">
        {steps.map((s, i) => {
          const stepNum = i + 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div className={`w-4 h-0.5 ${step >= stepNum ? 'bg-white/50' : 'bg-white/20'}`}></div>}
              <div className="flex items-center gap-1 text-sm">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${step >= stepNum ? 'bg-white/30' : 'bg-white/10'}`}>
                  {step > stepNum ? <Check className="w-3.5 h-3.5 text-white" /> : s.emoji}
                </span>
                <span className="hidden sm:inline text-white/80 text-xs">{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

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
                  Pay it forward to current students — and get discreet help with your own career when you need it.
                </p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white">
                <p className="text-white text-sm">
                  <strong>As an alum, you can:</strong>
                </p>
                <ul className="text-white text-sm mt-2 space-y-1 ml-4 list-disc">
                  <li>Answer student questions and share your experience</li>
                  <li>Post exclusive opportunities</li>
                  <li>Privately post career requests (new role, industry shift, business advice)</li>
                  <li>Earn karma that boosts visibility for your own requests</li>
                </ul>
              </div>
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
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 2 of {totalSteps}</p>
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
    
    // Alumni step 3: Intent selection
    if (step === 3 && isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 3 of {totalSteps}</p>
            <h1 className="text-3xl font-bold text-white">What brings you here?</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Whether you're here to give back or get a career boost — we've got you covered.
          </p>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🤝</span>
              <span className="font-semibold text-sm">Helpers answer questions & open doors for students</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🔍</span>
              <span className="font-semibold text-sm">Seekers get matched with parents & alumni who can help</span>
            </div>
          </div>
        </div>
      );
    }

    // Step 3 for parents, step 4 for alumni: How to help
    if ((step === 3 && !isAlumni) || (step === 4 && isAlumni)) {
      const stepLabel = isAlumni ? `Step 4 of ${totalSteps}` : `Step 3 of ${totalSteps}`;
      
      // Alumni helpers get a dedicated left panel
      if (isAlumniHelper) {
        return (
          <div className="space-y-5">
            <div>
              <p className="text-white/80 uppercase tracking-wider text-sm mb-2">{stepLabel}</p>
              <h1 className="text-3xl font-bold text-white">Help Students Succeed</h1>
            </div>
            
            <p className="text-xl text-white/90">
              Your experience opens doors. Share what you know, make introductions, and help the next generation of UF graduates launch their careers.
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
      
      if (isAlumniSeeker) {
        return (
          <div className="space-y-5">
            <div>
              <p className="text-white/80 uppercase tracking-wider text-sm mb-2">{stepLabel}</p>
              <h1 className="text-3xl font-bold text-white">Get Help. Pay It Forward.</h1>
            </div>
            
            <p className="text-xl text-white/90">
              Connect with parents and alumni who want to help you succeed. And when you do — help someone coming up behind you.
            </p>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
                <span className="text-xl">🤝</span>
                <span className="font-semibold text-sm">Alumni & parents in your industry are ready to help</span>
              </div>
              <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
                <span className="text-xl">🔄</span>
                <span className="font-semibold text-sm">Pay it forward by helping current students</span>
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">{stepLabel}</p>
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
    
    // Alumni Step 5: UF Details
    if (step === 5 && isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 5 of {totalSteps}</p>
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
    
    // Alumni Step 6: Story Sharing
    if (step === 6 && isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 6 of {totalSteps}</p>
            <h1 className="text-3xl font-bold text-white">One last thing — inspire the next generation? 📖</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Many students love hearing real stories from alumni who've been in their shoes. Would you be open to sharing yours?
          </p>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white mt-6">
            <p className="text-white">
              A short version of your journey (2–5 sentences) could motivate students facing similar paths.
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">💡</span>
              <span className="font-semibold text-sm">"From political science major to policy advisor — the one class that changed everything"</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🚀</span>
              <span className="font-semibold text-sm">"Non-traditional student → tech founder — how I broke in without CS degree"</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Link Student step (step 4 for parents ONLY)
    if (step === 4 && !isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 4 of {totalSteps}</p>
            <h1 className="text-3xl font-bold text-white">Link Your Student 🔗</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Connect your student to boost their visibility.
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
              <span className="font-semibold text-sm">Help others = boost your student</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">📌</span>
              <span className="font-semibold text-sm">Their questions get priority visibility</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Alumni Step 7: Invite Parent
    if (step === 7 && isAlumni) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-white/80 uppercase tracking-wider text-sm mb-2">Step 7 of {totalSteps}</p>
            <h1 className="text-3xl font-bold text-white">Invite a Parent 👨‍👩‍👧</h1>
          </div>
          
          <p className="text-xl text-white/90">
            Recent grad? Invite a parent to join — together, you earn karma faster.
          </p>
          
          <div className="bg-white/20 rounded-xl p-4 border-l-4 border-white mt-6">
            <p className="text-white">
              <strong>Why invite family?</strong><br />
              When your parent helps other students, YOUR career requests get boosted. It's a team effort!
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">⚡</span>
              <span className="font-semibold text-sm">Parents' karma boosts YOUR visibility</span>
            </div>
            <div className="flex items-center gap-3 bg-white text-slate-800 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-xl">🤝</span>
              <span className="font-semibold text-sm">Their network becomes your advantage</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Ready step (step 5 for parents, step 8 for alumni)
    if ((step === 5 && !isAlumni) || (step === 8 && isAlumni)) {
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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT SIDE - UF Blue */}
      <div className="lg:w-[45%] lg:sticky lg:top-0 lg:h-screen bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#000F5C] text-white p-4 sm:p-6 lg:p-10 flex flex-col lg:justify-start lg:pt-10 lg:overflow-y-auto">
        
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
                  ? 'Pay it forward to current students — and get help with your own career.'
                  : <>You have something students need: <span className="underline decoration-2 decoration-white/70">access</span>.</>
                }
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">What's your superpower?</h1>
              <p className="text-sm text-white/90">Select your areas of expertise</p>
            </>
          )}
          {step === 3 && isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">What brings you to CFF?</h1>
              <p className="text-sm text-white/90">Choose your path</p>
            </>
          )}
          {step === 3 && !isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">How can you help?</h1>
              <p className="text-sm text-white/90">Select your expertise areas</p>
            </>
          )}
          {step === 4 && isAlumniHelper && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Help Students Succeed</h1>
              <p className="text-sm text-white/90">Select your expertise areas</p>
            </>
          )}
          {step === 4 && isAlumniSeeker && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Get Help. Pay It Forward.</h1>
              <p className="text-sm text-white/90">Tell us what you need and how you can help students</p>
            </>
          )}
          {step === 5 && isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Your Alumni Details 🎓</h1>
              <p className="text-sm text-white/90">Tell us about your time at UF</p>
            </>
          )}
          {step === 6 && isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Inspire the next generation? 📖</h1>
              <p className="text-sm text-white/90">Share your story with students</p>
            </>
          )}
          {step === 7 && isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Invite a Parent 👨‍👩‍👧</h1>
              <p className="text-sm text-white/90">Earn karma together as a family</p>
            </>
          )}
          {step === 4 && !isAlumni && (
            <>
              <h1 className="text-xl font-bold mb-2 text-white">Link Your Student 🔗</h1>
              <p className="text-sm text-white/90">Boost your student's visibility</p>
            </>
          )}
          {((step === 5 && !isAlumni) || (step === 8 && isAlumni)) && (
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
      <div className="lg:w-[55%] bg-white p-4 sm:p-6 lg:p-10 lg:pt-10 overflow-y-auto">
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
                  Continue →
                </button>
                

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

          {/* STEP 3 (Alumni only): Intent Selection */}
          {step === 3 && isAlumni && (
            <AlumniIntentStep
              selectedIntent={alumniIntent}
              onSelect={setAlumniIntent}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {/* STEP 3 (Parents) / STEP 4 (Alumni Helper): How to Help */}
          {((step === 3 && !isAlumni) || (step === 4 && isAlumniHelper)) && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  How would you like to help?
                </h2>
                <p className="text-slate-500">Select at least one</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  {EXPERTISE_AREAS.map(area => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleExpertise(area.id)}
                      className={`flex items-start gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
                        expertise.includes(area.id)
                          ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{area.emoji}</span>
                      <div className="flex-1">
                        <span className="font-semibold block">{area.label}</span>
                        {area.description && <span className="text-sm text-slate-500 mt-0.5 block">{area.description}</span>}
                      </div>
                      {expertise.includes(area.id) && <span className="text-[#0021A5] font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                {expertise.length === 0 && (
                  <p className="text-xs text-amber-600">Please select at least one way you'd like to help</p>
                )}

                {/* Additional helper fields for alumni helpers - years of experience */}
                {isAlumniHelper && (
                  <>
                    <div className="border-t border-slate-200 my-4" />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Years of experience <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <select
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors bg-white"
                      >
                        <option value="">Select range</option>
                        <option value="0-2">0–2 years</option>
                        <option value="3-5">3–5 years</option>
                        <option value="6-10">6–10 years</option>
                        <option value="11-15">11–15 years</option>
                        <option value="16-20">16–20 years</option>
                        <option value="20+">20+ years</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Anything else you'd like {isAlumni ? 'others' : 'students'} to know? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={isAlumni ? "E.g., specific industries you know well, companies you've worked at, topics you're passionate about..." : ""}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base resize-none h-20 focus:border-[#0021A5] focus:outline-none transition-colors"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(isAlumni ? 3 : 2)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(isAlumni ? 5 : 4)}
                    disabled={expertise.length === 0}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                      expertise.length > 0
                        ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 4 (Alumni Seeker): What do you need help with + Pay it forward */}
          {step === 4 && isAlumniSeeker && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  What do you need help with?
                </h2>
                <p className="text-slate-500">Select at least one</p>
              </div>

              <div className="space-y-6">
                {/* Seeker needs */}
                <div className="grid grid-cols-1 gap-2">
                  {SEEKER_NEEDS.map(need => (
                    <button
                      key={need.id}
                      type="button"
                      onClick={() => toggleSeekerNeed(need.id)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
                        seekerNeeds.includes(need.id)
                          ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{need.emoji}</span>
                      <span className="font-semibold flex-1">{need.label}</span>
                      {seekerNeeds.includes(need.id) && <span className="text-[#0021A5] font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                {seekerNeeds.length === 0 && (
                  <p className="text-xs text-amber-600">Please select at least one area you need help with</p>
                )}

                {/* Pay it forward section */}
                <div className="border-t border-slate-200 my-4" />
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    How can you help students?
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    While you're here, you can also help current students. What can you offer? <span className="text-slate-400">(optional)</span>
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {SEEKER_PAY_IT_FORWARD.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSeekerPIF(item.id)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 border-2 ${
                          seekerPayItForward.includes(item.id)
                            ? 'bg-orange-50 border-[#FA4616] text-[#FA4616]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="font-medium flex-1 text-sm">{item.label}</span>
                        {seekerPayItForward.includes(item.id) && <span className="text-[#FA4616] font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional seeker fields */}
                <div className="border-t border-slate-200 my-4" />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Current role <span className="font-normal text-slate-400">(or leave blank if actively looking)</span>
                  </label>
                  <input
                    type="text"
                    value={seekerCurrentRole}
                    onChange={(e) => setSeekerCurrentRole(e.target.value)}
                    placeholder="e.g., Marketing Coordinator at Google"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setSeekerActivelyLooking(!seekerActivelyLooking)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border-2 ${
                        seekerActivelyLooking
                          ? 'bg-orange-50 border-[#FA4616] text-[#FA4616]'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        seekerActivelyLooking ? 'border-[#FA4616] bg-[#FA4616]' : 'border-slate-300'
                      }`}>
                        {seekerActivelyLooking && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span>I'm actively looking</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What kind of roles are you looking for? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={seekerTargetRoles}
                    onChange={(e) => setSeekerTargetRoles(e.target.value)}
                    placeholder="e.g., Product Manager, UX Designer, Data Analyst"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors"
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
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none transition-colors ${
                      linkedinError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-[#0021A5]'
                    }`}
                  />
                  {linkedinError && <p className="text-xs text-red-500 mt-1">{linkedinError}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    disabled={!canProceedStep2}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                      canProceedStep2
                        ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 5 (Alumni only): Alumni Details */}
          {step === 5 && isAlumni && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  Your Alumni Details
                </h2>
                <p className="text-slate-500">
                  A little more about your time at the University of Florida.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What year did you graduate? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={alumniGradYear}
                    onChange={(e) => setAlumniGradYear(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Select year</option>
                    {gradYearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What was your major? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={alumniMajor}
                    onChange={(e) => setAlumniMajor(e.target.value)}
                    placeholder="e.g., Computer Science, Finance, Political Science"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Minor <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={alumniMinor}
                    onChange={(e) => setAlumniMinor(e.target.value)}
                    placeholder="e.g., Business Administration, Psychology"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Any graduate degrees? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={graduateDegrees}
                    onChange={(e) => setGraduateDegrees(e.target.value)}
                    placeholder="e.g., MBA Harvard 2015, JD Yale 2018"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                             focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">List any graduate degrees with school and year</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    disabled={!canProceedStep3Alumni}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg transition-all
                      ${canProceedStep3Alumni
                        ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue →
                  </button>
                </div>

                {!canProceedStep3Alumni && (
                  <p className="text-xs text-amber-600 text-center">Please enter your graduation year and major</p>
                )}
              </div>
            </>
          )}

          {/* STEP 6 (Alumni only): Story Sharing */}
          {step === 6 && isAlumni && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  Share Your Story
                </h2>
                <p className="text-slate-500">
                  Would you be open to inspiring the next generation of Gators?
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setStoryOption('yes')}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
                      storyOption === 'yes'
                        ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">✨</span>
                    <span className="font-medium">Yes, I'd love to share my story!</span>
                    {storyOption === 'yes' && <span className="ml-auto text-[#0021A5]">✓</span>}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStoryOption('maybe')}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
                      storyOption === 'maybe'
                        ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">⏰</span>
                    <span className="font-medium">Maybe later — remind me</span>
                    {storyOption === 'maybe' && <span className="ml-auto text-[#0021A5]">✓</span>}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStoryOption('no')}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
                      storyOption === 'no'
                        ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">🙅</span>
                    <span className="font-medium">Not right now</span>
                    {storyOption === 'no' && <span className="ml-auto text-[#0021A5]">✓</span>}
                  </button>
                </div>

                {storyOption === 'yes' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Your Story <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={alumniStory}
                        onChange={(e) => setAlumniStory(e.target.value.slice(0, 500))}
                        placeholder="Keep it brief — what advice or moment from your path would you share with current students?"
                        className={`w-full px-4 py-3 border-2 rounded-xl text-base
                                 resize-none h-32 focus:outline-none transition-colors
                                 ${alumniStory.trim().length === 0 ? 'border-amber-300 focus:border-amber-500' : 'border-slate-200 focus:border-[#0021A5]'}`}
                        maxLength={500}
                      />
                      <div className="flex justify-between mt-1">
                        {alumniStory.trim().length === 0 && (
                          <p className="text-xs text-amber-600">Please share your story to continue</p>
                        )}
                        <p className="text-xs text-slate-400 ml-auto">{alumniStory.length}/500</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700 text-sm">Share anonymously?</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {storyAnonymous ? 'Your story will be shared without your name' : 'Your first name will be shown with your story'}
                          </p>
                        </div>
                        <Switch
                          checked={storyAnonymous}
                          onCheckedChange={setStoryAnonymous}
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 text-center">
                      🔒 Your story will be shared {storyAnonymous ? 'anonymously' : 'with first name only'} (your choice).
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(5)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(7)}
                    disabled={!canProceedStep5Alumni}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg transition-all
                      ${canProceedStep5Alumni
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

          {/* STEP 4 (Parents ONLY): Link Your Student */}
          {step === 4 && !isAlumni && (
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

          {/* STEP 7 (Alumni ONLY): Invite Parent */}
          {step === 7 && isAlumni && (
            <>
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  Invite a Parent
                </h2>
                <p className="text-slate-500">
                  Recent grad? Team up with a parent to earn karma faster.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                      👨‍👩‍👧
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">Why invite family?</h3>
                      <p className="text-sm text-slate-600">
                        When your parent helps other students on CFF, <strong>your career requests get priority visibility</strong>. Their karma = your boost!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('GatorParentInvite')}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all bg-[#FA4616] text-white hover:bg-[#E03D12] shadow-lg hover:shadow-xl"
                  >
                    <span>📧</span>
                    Invite a Parent Now
                  </button>
                  
                  <button
                    onClick={() => setStep(8)}
                    className="w-full py-3 rounded-xl font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Skip for now — I'll do this later
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  You can always invite parents later from your dashboard
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(6)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 5 (Parents) / STEP 8 (Alumni): Ready */}
          {((step === 5 && !isAlumni) || (step === 8 && isAlumni)) && (
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
                {/* Show linked student status - PARENTS ONLY */}
                {!isAlumni && linkedStudent && (
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

                {!isAlumni && skippedLinking && (
                  <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>No student linked.</strong> You can link them anytime from your dashboard to unlock karma boosts.
                    </p>
                  </div>
                )}

                {/* Alumni karma info - no family/student language */}
                {isAlumni && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Your Karma:</strong> Points you earn from helping students boost visibility for your own career requests.
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
                    {yearsExperience && <p>📅 {yearsExperience} years experience</p>}
                    {industries.length > 0 && (
                      <p>🏭 {industries.map(i => INDUSTRIES.find(ind => ind.id === i)?.label).join(', ')}</p>
                    )}
                    {isAlumni && alumniMajor && (
                      <p>🎓 {alumniMajor}{alumniMinor ? ` / ${alumniMinor}` : ''} '{String(alumniGradYear).slice(-2)}{graduateDegrees ? `, ${graduateDegrees}` : ''}</p>
                    )}
                    {isAlumni && storyOption === 'yes' && alumniStory && (
                      <p>📖 Sharing your story {storyAnonymous ? '(anonymously)' : '(with first name)'}</p>
                    )}
                    <p>🤝 Ready to help with: {expertise.map(e => EXPERTISE_AREAS.find(a => a.id === e)?.label).join(', ')}</p>
                    {/* Only show linked student for parents */}
                    {!isAlumni && linkedStudent && <p>🔗 Linked to: {linkedStudent.full_name || linkedStudent.email}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(isAlumni ? 7 : 4)}
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