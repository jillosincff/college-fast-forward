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

// Topic tags for matching (optional)
const TOPIC_TAGS = [
  { value: 'career_paths', label: 'Career paths & major decisions' },
  { value: 'entrepreneurship', label: 'Starting a business / Entrepreneurship' },
  { value: 'grad_school', label: 'Grad school decisions (MBA, Med school, Law school, etc.)' },
  { value: 'job_offers', label: 'Job offers & salary negotiation' },
  { value: 'industry_insights', label: 'Industry insights & day-in-the-life' },
  { value: 'work_life_balance', label: 'Work-life balance & career transitions' },
  { value: 'internship_search', label: 'Internship & job search help' },
  { value: 'career_switch', label: 'Switching careers or industries' },
  { value: 'other', label: 'Other career advice' }
];

// Legacy help types mapping for database compatibility
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

  const [matches, setMatches] = useState([]);
  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 - Question first
    question: '',
    topic_tags: [],
    industry: 'not_applicable',
    // Step 2 - Details
    year: '',
    major: '',
    timeline: 'one_to_three_months',
    referral_code: '',
    resume_url: '',
    resume_name: '',
    // Legacy fields for compatibility
    industries: [],
    custom_industry: '',
    help_types: ['career_guidance', 'resume_review', 'interview_prep']
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
    // Only validate if they entered something - allow skipping entirely
    if (formData.question?.trim() && formData.question.trim().length < 20) {
      newErrors.question = 'Please ask a question (at least 20 characters) or leave blank to skip';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const toggleTopicTag = (value) => {
    setFormData(prev => ({
      ...prev,
      topic_tags: prev.topic_tags.includes(value)
        ? prev.topic_tags.filter(v => v !== value)
        : [...prev.topic_tags, value]
    }));
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
      // Map industry value to HelpRequest schema
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
        'not_applicable': 'Other',
        'other': 'Other'
      };

      const mappedIndustry = industryMapping[formData.industry] || 'Other';

      // Map topic tags to help types for matching algorithm
      const topicToHelpType = {
        'career_paths': 'career_advice',
        'entrepreneurship': 'industry_insights',
        'grad_school': 'career_advice',
        'job_offers': 'career_advice',
        'industry_insights': 'industry_insights',
        'work_life_balance': 'career_advice',
        'internship_search': 'internship_leads',
        'career_switch': 'career_advice',
        'other': 'career_advice'
      };

      const mappedHelpTypes = formData.topic_tags.length > 0 
        ? [...new Set(formData.topic_tags.map(t => topicToHelpType[t] || 'career_advice'))]
        : ['career_advice'];
      
      // Create HelpRequest with question as description
      const helpRequest = await HelpRequest.create({
        student_id: user.id,
        student_email: user.email,
        student_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        student_major: formData.major.trim(),
        student_year: formData.year,
        poster_type: 'student',
        help_types: mappedHelpTypes,
        industry: mappedIndustry,
        description: formData.question.trim(),
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
        currently_seeking: formData.question?.trim() || null
      };
      
      // Add referral code if provided
      if (formData.referral_code?.trim()) {
        userUpdate.referral_code_used = formData.referral_code.trim();
        userUpdate.referral_used_at = new Date().toISOString();
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

      // Go directly to dashboard (welcome was already shown on GatorWelcome page)
      setShowLoading(false);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FA4616', '#0021A5', '#FF6B35']
      });

      // Navigate to dashboard after a brief moment for confetti
      setTimeout(() => {
        navigate('Dashboard');
      }, 1500);

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
          <h2 className="text-2xl font-bold text-[#0021A5] mb-3">Finding people who can answer...</h2>
          <p className="text-slate-600 mb-6">Searching 700+ parents and alumni with real experience</p>
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



  const progressPercent = currentStep === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
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
          {/* STEP 1: Ask Your Question */}
          {currentStep === 1 && (
          <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          >
          {/* EMPATHY SECTION - Lead with support */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              We've got your back. 🐊
            </h1>
            
            <p className="text-lg text-slate-600 mb-4">
              Transitioning to "real life" is hard.<br />
              <strong className="text-slate-800">But you're not doing it alone.</strong>
            </p>
            
            <p className="text-slate-500 leading-relaxed max-w-lg mx-auto">
              The job search, the rejections, the "what am I even doing?" moments — 
              we've all been there. That's why thousands of Gator parents and alumni 
              are here to help <strong className="text-[#0021A5]">YOU</strong> figure it out.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-8"></div>

          {/* SECTION 1: THE QUESTION - Primary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              What do you need help with?
            </h2>
            
            <Textarea
              value={formData.question}
              onChange={(e) => updateField('question', e.target.value.slice(0, 500))}
              placeholder="Career advice, job search, interviews, salary negotiation — or just figuring out what's next. Nothing is off limits."
              rows={5}
              className={`min-h-[130px] text-base border-2 rounded-xl ${errors.question ? 'border-red-300' : 'border-slate-200 focus:border-[#0021A5]'}`}
              style={{ fontSize: '16px' }}
            />
            <div className="flex justify-between mt-2">
              {errors.question ? (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.question}
                </p>
              ) : (
                <span></span>
              )}
              <p className="text-xs text-slate-400">{formData.question?.length || 0}/500</p>
            </div>
          </div>

          {/* Example Questions - Clickable */}
          <div className="bg-blue-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-slate-500 mb-3">💭 Other Gators are asking:</p>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => updateField('question', "How do I choose between two job offers?")}
                  className="text-sm text-slate-600 italic hover:text-[#0021A5] transition-colors text-left w-full"
                >
                  "How do I choose between two job offers?"
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => updateField('question', "Is it okay to not have it all figured out yet? I'm graduating soon and feeling lost.")}
                  className="text-sm text-slate-600 italic hover:text-[#0021A5] transition-colors text-left w-full"
                >
                  "Is it okay to not have it all figured out yet?"
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => updateField('question', "How do I network without feeling awkward or fake?")}
                  className="text-sm text-slate-600 italic hover:text-[#0021A5] transition-colors text-left w-full"
                >
                  "How do I network without feeling awkward?"
                </button>
              </li>
            </ul>
          </div>

          {/* SECTION 2: Helpful Details - Secondary */}
          <div className="mb-8 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Help us find the right people <span className="font-normal text-slate-500">(optional)</span>
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              These details help us match you with parents who can answer your question.
            </p>

            {/* Topic Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                What type of advice are you looking for?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTopicTag(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.topic_tags.includes(tag.value)
                        ? 'bg-[#0021A5] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formData.topic_tags.includes(tag.value) && <Check className="w-3 h-3 inline mr-0.5" />}
                    {tag.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Select any that apply</p>
            </div>

            {/* Industry Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry (if relevant)
              </label>
              <select
                value={formData.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full max-w-sm p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="not_applicable">Not applicable</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Optional - only if your question is industry-specific</p>
            </div>
          </div>

              {/* Buttons */}
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => navigate('Dashboard')}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  ← Back
                </button>
                
                <Button
                  onClick={formData.question?.trim().length >= 20 ? handleContinue : () => {
                    // Skip question - go directly to step 2
                    setCurrentStep(2);
                    window.scrollTo(0, 0);
                  }}
                  className="px-6 py-3 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-semibold rounded-xl"
                >
                  {formData.question?.trim().length >= 20 ? 'Post & Continue →' : 'Skip for now →'}
                </Button>
              </div>

              {/* Referral Code - Small, at bottom */}
              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Have a referral code?{' '}
                  <button 
                    type="button"
                    onClick={() => {
                      const code = prompt('Enter your referral code:');
                      if (code) {
                        updateField('referral_code', code.toUpperCase().slice(0, 20));
                      }
                    }}
                    className="text-[#0021A5] hover:underline"
                  >
                    Enter it here
                  </button>
                </p>
              </div>
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
                <p className="text-slate-600">A few more details to find the right people.</p>
              </div>

              {/* Show the question they asked */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-blue-800 mb-1">Your question:</p>
                <p className="text-slate-700 italic">"{formData.question}"</p>
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
                      When do you need guidance? *
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
                        'Find People Who Can Answer →'
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