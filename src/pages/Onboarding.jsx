import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import PushNotificationPrompt from '@/components/notifications/PushNotificationPrompt';

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
  const [loading, setLoading] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Form fields (all optional except expertise)
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industries, setIndustries] = useState([]);
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  const [expertise, setExpertise] = useState([]);

  // LinkedIn URL validation and formatting
  const formatLinkedInUrl = (url) => {
    if (!url.trim()) return '';
    
    // Remove whitespace
    let cleaned = url.trim().toLowerCase();
    
    // Extract username from various formats
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i,
      /^([a-zA-Z0-9\-_]+)$/  // Just username
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://linkedin.com/in/${match[1]}`;
      }
    }
    
    return null; // Invalid format
  };

  const handleLinkedInChange = (value) => {
    setLinkedinUrl(value);
    
    if (!value.trim()) {
      setLinkedinError('');
      return;
    }
    
    // Check if it contains linkedin.com/in/
    if (!value.toLowerCase().includes('linkedin.com/in/')) {
      setLinkedinError('Please enter a valid LinkedIn URL (e.g., linkedin.com/in/yourname)');
    } else {
      setLinkedinError('');
    }
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

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Build update data - only include non-null values
      const updateData = {
        expertise_areas: expertise,
        help_types: expertise,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        visible_in_directory: true
      };
      
      // Add optional fields only if they have values
      if (company.trim()) updateData.current_company = company.trim();
      if (jobTitle.trim()) updateData.current_position = jobTitle.trim();
      if (industries.length > 0) {
        updateData.industry = industries[0];
        updateData.industries = industries;
      }
      if (bio.trim()) updateData.bio = bio.trim();
      
      // Format and save LinkedIn URL
      if (linkedinUrl.trim()) {
        const formattedLinkedIn = formatLinkedInUrl(linkedinUrl);
        if (formattedLinkedIn) {
          updateData.linkedin_url = formattedLinkedIn;
        }
      }

      console.log('Saving onboarding data:', updateData);
      
      // Save profile data
      await base44.auth.updateMe(updateData);

      // Clear pending invite data
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');

      // Refresh user
      if (refreshUser) await refreshUser();
      
      // Show push notification prompt before going to dashboard
      setOnboardingComplete(true);
      setShowPushPrompt(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      console.error('Error details:', error.message, error.status);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate('ParentDashboard');
  };

  // Can finish if they selected at least one way to help and no LinkedIn error
  const canFinish = expertise.length > 0 && !linkedinError;

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE - The Hook */}
      <div className="lg:w-[45%] bg-gradient-to-br from-[#FA4616] via-[#E03E14] to-[#C73612] text-white p-6 lg:p-10 flex flex-col justify-center">
        
        {/* Progress Bar - Mobile & Desktop */}
        <div className="flex items-center justify-center gap-2 mb-6 lg:mb-8">
          <div className="flex items-center gap-1 text-sm">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">👤</span>
            <span className="hidden sm:inline text-white/80">You</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <div className="flex items-center gap-1 text-sm">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">💼</span>
            <span className="hidden sm:inline text-white/80">Expertise</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <div className="flex items-center gap-1 text-sm opacity-50">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">🤝</span>
            <span className="hidden sm:inline text-white/60">Ready</span>
          </div>
        </div>

        {/* Mobile: Condensed Content */}
        <div className="lg:hidden text-center mb-6">
          <h1 className="text-xl font-bold mb-2">Welcome to College Fast Forward</h1>
          <p className="text-2xl font-black mb-3">
            You have something students need: <span className="underline decoration-2">access</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-white/10 px-3 py-1.5 rounded-full">🚀 One intro = months of applying</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">🎯 Matched to YOUR industry</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">💫 Real-time impact</span>
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
              You have something students desperately need:{' '}
              <span className="underline decoration-4 decoration-white/50">access</span>.
            </p>
          </div>
          
          {/* The Reality Check */}
          <div className="bg-white/10 rounded-xl p-4 border-l-4 border-white/50">
            <p className="text-white/90">
              <strong className="text-white">70-80% of jobs are filled through referrals.</strong>{' '}
              But today's students are stuck in an "experience loop"—they can't get hired without experience, and can't get experience without being hired.
            </p>
          </div>
          
          {/* The Opportunity */}
          <p className="text-lg text-white/90">
            Your <strong className="text-white">single introduction</strong> could be the door that changes a student's entire career trajectory.{' '}
            <strong className="text-white">And it takes you 5 minutes.</strong>
          </p>
          
          {/* Value Props */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
              <span className="text-2xl">🚀</span>
              <span className="font-semibold">One intro from you = months of cold applying for them</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
              <span className="text-2xl">🎯</span>
              <span className="font-semibold">We match you with students in YOUR industry</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transform transition-all hover:bg-white/10 hover:translate-x-1">
              <span className="text-2xl">💫</span>
              <span className="font-semibold">Watch your impact grow in real-time</span>
            </div>
          </div>
          
          {/* Social Proof */}
          <p className="text-white/80 font-medium pt-2">
            Join <span className="text-white font-bold">200+ UF parents & alumni</span> already opening doors
          </p>
          
          {/* Quote */}
          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/70 italic leading-relaxed">
              "Remember when someone gave YOU a chance? A referral, an introduction, a 15-minute coffee chat that changed everything? This is your chance to be that person for the next generation."
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - The Form */}
      <div className="lg:w-[55%] bg-white p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
              Tell us about yourself
            </h2>
            <p className="text-slate-500">
              So we can match you with students who need your expertise.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            
            {/* Company */}
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

            {/* Job Title */}
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

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What industry? <span className="font-normal text-slate-400">(optional - select all that apply)</span>
              </label>
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
            </div>

            {/* Bio / Expertise Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Anything else you'd like students to know about you? <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g., 'Stay-at-home mom, my husband works in tech — happy to make intros'&#10;or 'Retired engineer with a great network in aerospace'&#10;or '20 years in marketing, love reviewing resumes'"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                         resize-none h-24 focus:border-[#0021A5] focus:outline-none transition-colors"
                maxLength={500}
              />
              <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
            </div>

            {/* LinkedIn URL */}
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

            {/* How they want to help - REQUIRED */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                How would you like to help students? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">Select at least one — this helps us match you with the right students</p>
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
                <p className="text-xs text-amber-600 mt-2">Please select at least one way you'd like to help</p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleFinish}
              disabled={!canFinish || loading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all
                ${canFinish && !loading
                  ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
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

            {/* Micro-copy */}
            <p className="text-center text-sm text-slate-500">
              No spam • You control who contacts you
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}