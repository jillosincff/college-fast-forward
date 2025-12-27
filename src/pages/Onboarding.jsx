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
  const [expertise, setExpertise] = useState([]);

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

  // Can finish if they selected at least one way to help
  const canFinish = expertise.length > 0;

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
    <div className="min-h-screen bg-slate-50">
      {/* Progress Bar */}
      <div className="h-1 bg-slate-200">
        <div className="h-full bg-[#0021A5] w-full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header - Warm Intro */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💙</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Thanks for stepping up to help UF students.
          </h1>
          <p className="text-slate-600 leading-relaxed">
            It takes a village, and you're an important part of it.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Share your background so we can match you with students who could use your expertise and wisdom.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          
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
              In a few words, tell us about your expertise: <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g., I'm a CTO for an e-commerce company that sells luxury clothing. 20 years in tech, happy to help with career advice and mock interviews."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base
                       resize-none h-24 focus:border-[#0021A5] focus:outline-none transition-colors"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
          </div>

          {/* How they want to help - REQUIRED */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              How would you like to help students?
            </label>
            <p className="text-xs text-slate-500 mb-3">Select all that apply — this helps us match you with the right students</p>
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

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={handleFinish}
            disabled={!canFinish || loading}
            className={`
              w-full max-w-md py-4 rounded-xl font-semibold text-lg transition-all
              ${canFinish && !loading
                ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg'
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
              'Go to Dashboard →'
            )}
          </button>
          
          <p className="mt-4 text-slate-500">
            🙏 <strong className="text-slate-700">Thank you!</strong> We appreciate you!
          </p>
        </div>

      </div>
    </div>
  );
}