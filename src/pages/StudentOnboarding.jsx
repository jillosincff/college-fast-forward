import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { HelpRequest } from '@/entities/HelpRequest';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LogOut, Check, AlertCircle, ArrowLeft, Loader2, Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Match } from '@/entities/Match';

// Industry options with icons
const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare_biotech', label: 'Healthcare & Biotech', icon: '🏥' },
  { value: 'finance_banking', label: 'Finance & Banking', icon: '💰' },
  { value: 'tech_engineering', label: 'Tech & Engineering', icon: '🏗️' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'energy', label: 'Energy', icon: '⚡' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'advertising_media', label: 'Advertising & Media', icon: '📺' },
  { value: 'construction', label: 'Construction', icon: '👷' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' }
];

// Help types with descriptions
const HELP_TYPES = [
  { value: 'career_guidance', label: 'Career Guidance', description: 'Get advice on career paths and next steps', defaultChecked: true },
  { value: 'resume_review', label: 'Resume Review', description: 'Get feedback on your resume from professionals', defaultChecked: true },
  { value: 'interview_prep', label: 'Interview Preparation', description: 'Practice interviews and get coaching', defaultChecked: true },
  { value: 'job_referrals', label: 'Job Referrals & Introductions', description: 'Get connected to hiring managers and recruiters', defaultChecked: false },
  { value: 'networking_advice', label: 'Networking Advice', description: 'Learn how to build your professional network', defaultChecked: false },
  { value: 'salary_negotiation', label: 'Salary Negotiation', description: 'Get help negotiating your job offer', defaultChecked: false }
];

// Year options
const YEAR_OPTIONS = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'graduate', label: 'Graduate Student' }
];

// Timeline options
const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP (within 2 weeks)' },
  { value: 'one_to_three_months', label: 'Next 1-3 months' },
  { value: 'three_to_six_months', label: '3-6 months' },
  { value: 'exploring', label: "I'm just exploring" }
];

export default function StudentOnboarding() {
  const { user, refreshUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [matches, setMatches] = useState([]);
  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1
    industries: [],
    custom_industry: '',
    help_types: ['career_guidance', 'resume_review', 'interview_prep'],
    // Step 2
    year: '',
    major: '',
    timeline: 'one_to_three_months',
    description: '',
    referral_code: '',
    resume_url: '',
    resume_name: ''
  });

  // Validate @ufl.edu email
  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase() || '';
      if (!email.endsWith('@ufl.edu')) {
        setEmailError('Please use your @ufl.edu email to sign up as a student.');
      }
    }
  }, [user]);

  // Load saved state from session
  useEffect(() => {
    const saved = sessionStorage.getItem('student_onboarding_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load saved state');
      }
    }
  }, []);

  // Save state to session on change
  useEffect(() => {
    sessionStorage.setItem('student_onboarding_data', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleIndustry = (value) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(value)
        ? prev.industries.filter(v => v !== value)
        : [...prev.industries, value]
    }));
    setErrors(prev => ({ ...prev, industries: null }));
  };

  const toggleHelpType = (value) => {
    setFormData(prev => ({
      ...prev,
      help_types: prev.help_types.includes(value)
        ? prev.help_types.filter(v => v !== value)
        : [...prev.help_types, value]
    }));
    setErrors(prev => ({ ...prev, help_types: null }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (formData.industries.length === 0 && !formData.custom_industry?.trim()) {
      newErrors.industries = 'Please select at least one industry';
    }
    if (formData.help_types.length === 0) {
      newErrors.help_types = 'Please select at least one type of help';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.year) newErrors.year = 'Please select your year';
    if (!formData.major?.trim()) newErrors.major = 'Please enter your major';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setShowLoading(true);

    try {
      // Map internal values to HelpRequest schema values
      const industryMapping = {
        'technology': 'Technology & Software',
        'healthcare_biotech': 'Healthcare',
        'finance_banking': 'Finance & Banking',
        'tech_engineering': 'Engineering',
        'education': 'Education',
        'real_estate': 'Real Estate',
        'energy': 'Other',
        'retail': 'Retail',
        'manufacturing': 'Manufacturing',
        'advertising_media': 'Media & Entertainment',
        'construction': 'Other',
        'insurance': 'Other',
        'other': 'Other'
      };

      // Get primary industry (first selected) for HelpRequest
      const primaryIndustry = formData.industries[0] || 'other';
      const mappedPrimaryIndustry = industryMapping[primaryIndustry] || 'Other';

      // Map help types to schema values
      const helpTypeMapping = {
        'career_guidance': 'career_advice',
        'resume_review': 'resume_review',
        'interview_prep': 'interview_prep',
        'job_referrals': 'networking_intros',
        'networking_advice': 'industry_insights',
        'salary_negotiation': 'career_advice'
      };

      const mappedHelpTypes = formData.help_types.map(t => helpTypeMapping[t] || t);

      // Create HelpRequest
      const allIndustries = formData.industries.map(i => industryMapping[i] || i);
      if (formData.custom_industry?.trim()) {
        allIndustries.push(formData.custom_industry.trim());
      }
      
      const helpRequest = await HelpRequest.create({
        student_id: user.id,
        student_email: user.email,
        student_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        student_major: formData.major.trim(),
        student_year: formData.year,
        help_types: mappedHelpTypes,
        industry: mappedPrimaryIndustry,
        description: formData.description?.trim() || `Looking for help in ${allIndustries.join(', ') || 'various industries'}`,
        timeline: formData.timeline === 'asap' ? 'this_week' : 
                  formData.timeline === 'one_to_three_months' ? 'this_month' : 'no_rush',
        status: 'active'
      });

      console.log('✅ HelpRequest created:', helpRequest.id);

      // Update user profile
      const userUpdate = {
        onboarding_completed: true,
        profile_completion_score: 85,
        is_new_signup: false,
        major: formData.major.trim(),
        year: formData.year,
        currently_seeking: formData.description?.trim() || null
      };
      
      // Add referral code if provided
      if (formData.referral_code?.trim()) {
        userUpdate.referral_code = formData.referral_code.trim();
      }
      
      // Add resume URL if provided
      if (formData.resume_url) {
        userUpdate.resume_url = formData.resume_url;
      }
      
      await base44.auth.updateMe(userUpdate);

      // Generate matches (fire and forget, but wait a bit for UX)
      let matchCount = 0;
      try {
        await base44.functions.invoke('generateMatches', {
          help_request_id: helpRequest.id,
          mode: 'for_request'
        });
        
        // Wait a moment then fetch matches
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const studentMatches = await Match.filter(
          { help_request_id: helpRequest.id },
          '-match_score',
          3
        );
        setMatches(studentMatches || []);
        matchCount = studentMatches?.length || 0;
        
        // Update match count on help request
        if (matchCount > 0) {
          await HelpRequest.update(helpRequest.id, { match_count: matchCount });
        }
      } catch (matchError) {
        console.error('Match generation failed:', matchError);
      }

      // Clean up
      sessionStorage.removeItem('student_onboarding_data');
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_referral_code');

      await refreshUser();

      // Show welcome page
      setShowLoading(false);
      setShowWelcome(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FA4616', '#0021A5', '#FF6B35']
      });

    } catch (error) {
      console.error('❌ Onboarding failed:', error);
      setShowLoading(false);
      setIsSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  };

  // Email error screen
  if (emailError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">UF Email Required</h2>
            <p className="text-slate-600 mb-4">{emailError}</p>
            <p className="text-sm text-slate-500 mb-6">Current: <strong>{user?.email}</strong></p>
            <Button onClick={() => logout()} className="bg-[#0021A5] hover:bg-[#001580]">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Use UF Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading overlay
  if (showLoading) {
    return (
      <div className="min-h-screen bg-white/95 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-6 animate-bounce">🐊</div>
          <h2 className="text-2xl font-bold text-[#0021A5] mb-3">Finding your matches...</h2>
          <p className="text-slate-600 mb-6">Searching 700+ parents and alumni who can help</p>
          <div className="w-64 mx-auto">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FA4616] to-[#0021A5]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Welcome/celebration page
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-[#0021A5] mb-2">
              Welcome to Gator Network, {user?.first_name || 'Gator'}!
            </h1>
            {matches.length > 0 ? (
              <p className="text-xl text-slate-600">
                We found <span className="font-bold text-[#FA4616]">{matches.length}</span> parents who can help you!
              </p>
            ) : (
              <div>
                <p className="text-lg text-slate-600 mb-2">Your request is live on Emerging Gators!</p>
                <p className="text-slate-500">New parents join daily - we'll notify you when matches appear.</p>
              </div>
            )}
          </motion.div>

          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Your top matches:</h3>
              <div className="space-y-4">
                {matches.slice(0, 3).map((match, idx) => (
                  <Card key={match.id} className="border-2 border-slate-200 hover:border-[#FA4616] transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{match.parent_name || 'Gator Parent'}</h4>
                          <p className="text-slate-600">{match.parent_role} {match.parent_company && `at ${match.parent_company}`}</p>
                          <p className="text-sm text-slate-500">{match.parent_industry} • {match.parent_years_experience} experience</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {Math.round(match.match_score)}% match
                          </span>
                        </div>
                      </div>
                      {match.match_reasons?.length > 0 && (
                        <p className="text-sm text-slate-500 mt-2">
                          Can help with: {match.match_reasons.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8"
          >
            <h4 className="font-semibold text-slate-900 mb-3">💡 Quick Tips:</h4>
            <ul className="space-y-2 text-slate-700">
              <li>• Message 2-3 parents to start</li>
              <li>• Be specific about what you need help with</li>
              <li>• Most parents respond within 24 hours</li>
            </ul>
          </motion.div>

          <Button
            onClick={() => navigate('Dashboard')}
            className="w-full h-14 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-bold text-lg"
          >
            Go to Dashboard →
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = currentStep === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐊</span>
            <span className="font-bold text-[#0021A5]">Join Gator Network</span>
          </div>
          <div className="text-sm text-slate-500">Step {currentStep} of 2</div>
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Industry & Help Types */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Greeting */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Hi {user?.first_name || 'there'}! Let's find you the right parents & alumni.
                </h1>
                <p className="text-slate-600">Step 1 of 2 - Tell us how we can help</p>
              </div>

              {/* Industry Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-slate-800 mb-4">
                  What industries are you interested in? * <span className="font-normal text-slate-500">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {INDUSTRIES.map(ind => {
                    const isSelected = formData.industries.includes(ind.value);
                    return (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => toggleIndustry(ind.value)}
                        className={`p-4 rounded-xl transition-all text-center relative ${
                          isSelected
                            ? 'border-[#FA4616] bg-orange-50'
                            : 'border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200'
                        }`}
                        style={{ borderWidth: isSelected ? '3px' : '2px', borderStyle: 'solid' }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#FA4616] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span className="text-2xl block mb-1">{ind.icon}</span>
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-[#FA4616]' : 'text-slate-700'
                        }`}>
                          {ind.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Not seeing your industry?</p>
                  <Input
                    value={formData.custom_industry}
                    onChange={(e) => updateField('custom_industry', e.target.value)}
                    placeholder="Specify additional industry"
                    className="max-w-sm"
                  />
                </div>
                
                {errors.industries && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.industries}
                  </p>
                )}
              </div>

              {/* Help Types */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-slate-800 mb-4">
                  What help do you need? * <span className="font-normal text-slate-500">(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {HELP_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleHelpType(type.value)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                        formData.help_types.includes(type.value)
                          ? 'border-[#0021A5] bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        formData.help_types.includes(type.value)
                          ? 'bg-[#0021A5] border-[#0021A5]'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {formData.help_types.includes(type.value) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{type.label}</p>
                        <p className="text-sm text-slate-600">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.help_types && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.help_types}
                  </p>
                )}
              </div>

              <Button
                onClick={handleContinue}
                className="w-full h-14 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-bold text-lg"
              >
                Continue to Details →
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={handleBack}
                className="flex items-center text-slate-600 mb-6 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Almost done!</h1>
                <p className="text-slate-600">This helps us find the best matches.</p>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardContent className="p-6 space-y-6">
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      What year are you? *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {YEAR_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('year', opt.value)}
                          className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                            formData.year === opt.value
                              ? 'border-[#0021A5] bg-blue-50 text-[#0021A5]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-2">{errors.year}</p>
                    )}
                  </div>

                  {/* Major */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What's your major? *
                    </label>
                    <Input
                      value={formData.major}
                      onChange={(e) => updateField('major', e.target.value)}
                      placeholder="e.g., Computer Science, Marketing, Finance"
                      className={errors.major ? 'border-red-300' : ''}
                    />
                    {errors.major && (
                      <p className="text-red-500 text-sm mt-1">{errors.major}</p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      When do you need help? *
                    </label>
                    <div className="space-y-2">
                      {TIMELINE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('timeline', opt.value)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            formData.timeline === opt.value
                              ? 'border-[#0021A5] bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-medium text-slate-800">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description - Emphasized */}
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-[#0021A5] rounded-xl p-5">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-xl">📝</span>
                      <div>
                        <label className="block text-base font-bold text-slate-800">
                          Your Public Help Request
                        </label>
                        <p className="text-sm text-slate-600">This is what parents & alumni will see when deciding to help you</p>
                      </div>
                    </div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value.slice(0, 500))}
                      placeholder="E.g., I'm a junior Finance major looking for help preparing for investment banking interviews. Ideally looking for someone in wealth management or private equity who can help me understand the industry and review my resume."
                      rows={5}
                      className="border-2 border-slate-300 focus:border-[#FA4616] bg-white"
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-[#0021A5] font-medium">💡 Tip: Be specific! Mention roles, companies, or industries you're targeting.</p>
                      <p className="text-xs text-slate-500">{formData.description?.length || 0}/500</p>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Upload Your Resume <span className="font-normal text-slate-500">(optional but recommended)</span>
                    </label>
                    {formData.resume_url ? (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">{formData.resume_name || 'Resume uploaded'}</p>
                          <p className="text-xs text-green-600">Ready to share with parents</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateField('resume_url', '');
                            updateField('resume_name', '');
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-[#FA4616] transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600"><span className="font-semibold text-[#FA4616]">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-slate-500">PDF, DOC, or DOCX (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File too large. Maximum size is 5MB.');
                              return;
                            }
                            try {
                              const { file_url } = await base44.integrations.Core.UploadFile({ file });
                              updateField('resume_url', file_url);
                              updateField('resume_name', file.name);
                            } catch (err) {
                              console.error('Upload failed:', err);
                              alert('Failed to upload resume. Please try again.');
                            }
                          }}
                        />
                      </label>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Parents can review your resume and provide feedback</p>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Referral Code <span className="font-normal text-slate-500">(optional)</span>
                    </label>
                    <Input
                      value={formData.referral_code}
                      onChange={(e) => updateField('referral_code', e.target.value.toUpperCase())}
                      placeholder="Enter code if someone referred you"
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-14"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 h-14 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-bold text-lg"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Find My Matches →'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}