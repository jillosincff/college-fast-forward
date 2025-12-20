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
import { LogOut, Check, AlertCircle, ArrowLeft, Sparkles, GraduationCap, Briefcase, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Constants
const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 7 }, (_, i) => currentYear + i);

const INDUSTRIES = [
  { value: 'Technology & Software', label: 'Technology & Software', icon: '💻' },
  { value: 'Finance & Banking', label: 'Finance & Banking', icon: '💰' },
  { value: 'Consulting', label: 'Consulting', icon: '📊' },
  { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'Engineering', label: 'Engineering', icon: '⚙️' },
  { value: 'Marketing', label: 'Marketing', icon: '📱' },
  { value: 'Law & Legal', label: 'Law & Legal', icon: '⚖️' },
  { value: 'Education', label: 'Education', icon: '📚' },
  { value: 'Real Estate', label: 'Real Estate', icon: '🏠' },
  { value: 'Media & Entertainment', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'Non-Profit', label: 'Non-Profit', icon: '❤️' },
  { value: 'Government', label: 'Government', icon: '🏛️' },
  { value: 'Other', label: 'Other', icon: '🔮' }
];

const HELP_TYPES = [
  { value: 'career_advice', label: 'Career advice', icon: '💡' },
  { value: 'internship_leads', label: 'Internship/job leads', icon: '🎯' },
  { value: 'resume_review', label: 'Resume review', icon: '📄' },
  { value: 'interview_prep', label: 'Interview prep', icon: '🎤' },
  { value: 'networking_intros', label: 'Networking intros', icon: '🤝' },
  { value: 'informational_interview', label: 'Coffee chat', icon: '☕' }
];

const GOAL_OPTIONS = [
  { value: 'summer_internship', label: 'Summer 2025 internship', icon: '☀️' },
  { value: 'fall_internship', label: 'Fall 2025 internship', icon: '🍂' },
  { value: 'full_time', label: 'Full-time job after graduation', icon: '💼' },
  { value: 'exploring', label: 'Just exploring options', icon: '🔍' }
];

const TIMELINE_OPTIONS = [
  { value: 'this_week', label: 'ASAP - this week' },
  { value: 'this_month', label: 'Within a month' },
  { value: 'no_rush', label: 'No rush' }
];

export default function StudentOnboarding() {
  const { user, refreshUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showParentInviteModal, setShowParentInviteModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Profile
    first_name: '',
    last_name: '',
    graduation_year: currentYear + 2,
    major: '',
    
    // Step 2: Help Request
    primary_goal: '',
    industry: '',
    help_types: [],
    
    // Step 3: Details
    description: '',
    timeline: 'this_month',
    dream_companies: '',
    linkedin_url: ''
  });

  // Initialize from user data + validate @ufl.edu
  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase() || '';
      if (!email.endsWith('@ufl.edu')) {
        setEmailError('Please use your @ufl.edu email to sign up as a student.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        graduation_year: user.graduation_year || currentYear + 2,
        major: user.major || ''
      }));
    }
  }, [user]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('student_onboarding_v2', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem('student_onboarding_v2');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          help_types: Array.isArray(parsed.help_types) ? parsed.help_types : []
        }));
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleHelpType = (value) => {
    setFormData(prev => ({
      ...prev,
      help_types: prev.help_types.includes(value)
        ? prev.help_types.filter(v => v !== value)
        : [...prev.help_types, value]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.first_name?.trim()) newErrors.first_name = 'Required';
      if (!formData.last_name?.trim()) newErrors.last_name = 'Required';
      if (!formData.graduation_year) newErrors.graduation_year = 'Required';
      if (!formData.major?.trim()) newErrors.major = 'Required';
    } else if (step === 2) {
      if (!formData.primary_goal) newErrors.primary_goal = 'Please select your goal';
      if (!formData.industry) newErrors.industry = 'Please select an industry';
      if (formData.help_types.length === 0) newErrors.help_types = 'Select at least one';
    } else if (step === 3) {
      if (!formData.description?.trim() || formData.description.trim().length < 20) {
        newErrors.description = 'Please write at least 20 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    // Save profile on step 1
    if (currentStep === 1) {
      try {
        await base44.auth.updateMe({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          graduation_year: formData.graduation_year,
          major: formData.major.trim()
        });
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    console.log('🚀 [StudentOnboarding] Starting submission...');
    
    try {
      const studentYear = formData.graduation_year 
        ? `Class of ${formData.graduation_year}` 
        : 'Current Student';
      
      // Create HelpRequest for matching
      console.log('📝 Creating HelpRequest...');
      const helpRequest = await HelpRequest.create({
        student_id: user.id,
        student_email: user.email,
        student_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        student_major: formData.major?.trim(),
        student_year: studentYear,
        help_types: formData.help_types,
        industry: formData.industry,
        description: formData.description.trim(),
        timeline: formData.timeline,
        status: 'active'
      });
      console.log('✅ HelpRequest created:', helpRequest.id);

      // Trigger matching (fire and forget)
      base44.functions.invoke('generateMatches', {
        help_request_id: helpRequest.id,
        mode: 'for_request'
      }).then(result => {
        console.log('✅ Matches generated:', result?.data?.matches_created || 0);
      }).catch(err => {
        console.error('Match generation failed (non-blocking):', err);
      });

      // Update user profile
      const userUpdate = {
        onboarding_completed: true,
        profile_completion_score: 85,
        is_new_signup: false,
        currently_seeking: formData.description.trim(),
        linkedin_url: formData.linkedin_url?.trim() || ''
      };

      // Handle referral code
      const referralCode = sessionStorage.getItem('pending_referral_code');
      if (referralCode) {
        userUpdate.referral_code = referralCode;
      }

      await base44.auth.updateMe(userUpdate);
      console.log('✅ User profile updated');

      // Clean up
      localStorage.removeItem('student_onboarding_v2');
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_referral_code');

      setIsSubmitting(false);
      setShowParentInviteModal(true);

    } catch (error) {
      console.error('❌ Failed to submit:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleParentInviteComplete = () => {
    setShowParentInviteModal(false);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FA4616', '#0021A5', '#FF6B35']
    });

    setShowSuccess(true);
    
    setTimeout(() => {
      refreshUser().then(() => navigate('Dashboard'));
    }, 3000);
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

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FA4616] to-[#0021A5] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0021A5] mb-3">You're all set!</h1>
          <p className="text-lg text-slate-600 mb-6">
            We're matching you with Gator parents & alumni who can help.
          </p>
          <div className="text-5xl mb-4">🐊</div>
          <p className="text-slate-500">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const progressPercent = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
            alt="College Fast Forward"
            className="h-10"
          />
          <div className="text-sm text-slate-500">Step {currentStep} of 3</div>
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Profile */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-7 h-7 text-[#0021A5]" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome to Gator Network</h1>
                <p className="text-slate-600 mt-1">Let's set up your profile</p>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder="John"
                        className={errors.first_name ? 'border-red-300' : ''}
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        placeholder="Smith"
                        className={errors.last_name ? 'border-red-300' : ''}
                      />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">🎓 Graduation Year *</label>
                    <Select 
                      value={formData.graduation_year?.toString()} 
                      onValueChange={(v) => updateField('graduation_year', parseInt(v))}
                    >
                      <SelectTrigger className={errors.graduation_year ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADUATION_YEARS.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.graduation_year && <p className="text-red-500 text-xs mt-1">{errors.graduation_year}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">📚 Major *</label>
                    <Input
                      value={formData.major}
                      onChange={(e) => updateField('major', e.target.value)}
                      placeholder="e.g., Computer Science"
                      className={errors.major ? 'border-red-300' : ''}
                    />
                    {errors.major && <p className="text-red-500 text-xs mt-1">{errors.major}</p>}
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-12 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-semibold text-base"
                  >
                    Continue →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: What do you need help with? */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button onClick={handleBack} className="flex items-center text-slate-600 mb-4 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-7 h-7 text-[#FA4616]" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">What do you need?</h1>
                <p className="text-slate-600 mt-1">This helps us match you with the right people</p>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardContent className="p-6 space-y-5">
                  {/* Primary Goal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What's your primary goal? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {GOAL_OPTIONS.map(goal => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => updateField('primary_goal', goal.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            formData.primary_goal === goal.value
                              ? 'border-[#FA4616] bg-orange-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-lg">{goal.icon}</span>
                          <p className="text-sm font-medium text-slate-800 mt-1">{goal.label}</p>
                        </button>
                      ))}
                    </div>
                    {errors.primary_goal && <p className="text-red-500 text-xs mt-1">{errors.primary_goal}</p>}
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Which industry interests you? *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {INDUSTRIES.slice(0, 9).map(ind => (
                        <button
                          key={ind.value}
                          type="button"
                          onClick={() => updateField('industry', ind.value)}
                          className={`p-2 rounded-lg border-2 text-center transition-all ${
                            formData.industry === ind.value
                              ? 'border-[#0021A5] bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-lg">{ind.icon}</span>
                          <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">{ind.label.split(' ')[0]}</p>
                        </button>
                      ))}
                    </div>
                    <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Or select from all industries..." />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(ind => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {ind.icon} {ind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                  </div>

                  {/* Help Types */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What kind of help? * <span className="font-normal text-slate-500">(select all)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HELP_TYPES.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => toggleHelpType(type.value)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            formData.help_types.includes(type.value)
                              ? 'border-[#0021A5] bg-blue-50 text-[#0021A5]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {type.icon} {type.label}
                        </button>
                      ))}
                    </div>
                    {errors.help_types && <p className="text-red-500 text-xs mt-1">{errors.help_types}</p>}
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-12 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-semibold text-base"
                  >
                    Continue →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Tell us more */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button onClick={handleBack} className="flex items-center text-slate-600 mb-4 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Almost done!</h1>
                <p className="text-slate-600 mt-1">Add details to get better matches</p>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardContent className="p-6 space-y-5">
                  {/* Description - THE KEY FIELD */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <label className="text-sm font-bold text-slate-900">
                        Tell us what you're looking for *
                      </label>
                    </div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="e.g., I'm a junior studying Finance looking for a summer internship at an investment bank. I've done some coursework in valuation and financial modeling, and I'd love to connect with someone who can give me advice on recruiting..."
                      rows={4}
                      className={`text-base ${errors.description ? 'border-red-300' : 'border-orange-200'}`}
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-slate-600">
                        {formData.description?.length || 0} characters
                      </p>
                      {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      How soon do you need help?
                    </label>
                    <div className="flex gap-2">
                      {TIMELINE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('timeline', opt.value)}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.timeline === opt.value
                              ? 'border-[#0021A5] bg-blue-50 text-[#0021A5]'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional: Dream companies */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dream companies <span className="text-slate-400">(optional)</span>
                    </label>
                    <Input
                      value={formData.dream_companies}
                      onChange={(e) => updateField('dream_companies', e.target.value)}
                      placeholder="e.g., Google, Goldman Sachs, McKinsey"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      We'll prioritize parents/alumni at these companies
                    </p>
                  </div>

                  {/* Optional: LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      LinkedIn <span className="text-slate-400">(optional)</span>
                    </label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => updateField('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      type="url"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-bold text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Setting up your matches...
                      </span>
                    ) : (
                      'Find My Matches 🐊'
                    )}
                  </Button>

                  <p className="text-center text-xs text-slate-500">
                    By continuing, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Parent Invite Modal */}
      <Dialog open={showParentInviteModal} onOpenChange={setShowParentInviteModal}>
        <DialogContent className="max-w-lg">
          <InviteParentModal
            isOpen={showParentInviteModal}
            onClose={handleParentInviteComplete}
            onSuccess={handleParentInviteComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}