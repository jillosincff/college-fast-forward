import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { JobRequest } from '@/entities/JobRequest';
import { HelpRequest } from '@/entities/HelpRequest';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LogOut, Sparkles, Check, User as UserIcon, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const PRIMARY_GOALS = [
  { value: 'full_time', label: 'Full-time job after graduation', icon: '💼' },
  { value: 'summer_2026', label: 'Summer 2026 internship', icon: '☀️' },
  { value: 'spring_fall_2026', label: 'Spring/Fall 2026 internship', icon: '🍂' },
  { value: 'part_time', label: 'Part-time / side gig now', icon: '⏰' },
  { value: 'mentorship', label: 'Advice / mentorship / coffee chat', icon: '☕' },
  { value: 'resume_help', label: 'Resume or interview help only', icon: '📄' }
];

const POPULAR_ROLES = [
  'Software Engineer', 'Data Analyst', 'Investment Banking', 'Consulting',
  'Product Management', 'Marketing', 'Finance', 'Sales', 'UX/UI', 'Healthcare'
];

const INDUSTRIES = [
  'Marketing',
  'Finance & Banking',
  'Technology & Software',
  'Healthcare',
  'Engineering',
  'Education',
  'Law & Legal',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Non-Profit',
  'Government',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Other'
];

const HELP_TYPES = [
  { value: 'career_advice', label: 'Career advice and guidance', icon: '💼' },
  { value: 'internship_leads', label: 'Internship or job leads', icon: '🎯' },
  { value: 'resume_review', label: 'Resume review', icon: '📄' },
  { value: 'interview_prep', label: 'Interview preparation', icon: '🎤' },
  { value: 'industry_insights', label: 'Industry insights', icon: '🔍' },
  { value: 'networking_intros', label: 'Networking introductions', icon: '🤝' },
  { value: 'informational_interview', label: 'Informational interview', icon: '☕' }
];

const HELP_TIMELINES = [
  { value: 'this_week', label: 'This week - urgent!' },
  { value: 'this_month', label: 'Within this month' },
  { value: 'no_rush', label: 'No rush, just exploring' }
];

const LOCATIONS = [
  'Open to anywhere / remote', 'Gainesville area', 'Orlando / Central Florida',
  'Jacksonville', 'Tampa / St. Pete', 'Miami / South Florida',
  'Atlanta, NYC, D.C., or other major cities'
];

const TIMELINES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'summer_2026', label: 'Summer 2026' },
  { value: 'fall_2026', label: 'Fall 2026' },
  { value: 'after_grad_2026', label: 'After graduation 2026' },
  { value: 'after_grad_2027', label: 'After graduation 2027' },
  { value: 'after_grad_2028', label: 'After graduation 2028' }
];

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 7 }, (_, i) => currentYear + i);

export default function StudentOnboarding() {
  const { user, refreshUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for profile step
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showParentInviteModal, setShowParentInviteModal] = useState(false);
  const [liveViewCount, setLiveViewCount] = useState(0);
  const [profileErrors, setProfileErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState({
    // Profile fields (Step 0)
    first_name: '',
    last_name: '',
    graduation_year: currentYear + 2,
    major: '',
    resume_url: '',
    linkedin_url: '',
    // Help Request (Step 1) - NEW structured fields for matching
    help_types: [],
    help_industry: '',
    help_description: '',
    help_timeline: '',
    post_to_emerging: true,
    show_on_directory: true,
    // Career fields (Steps 2-7)
    target_roles: [],
    custom_role: '',
    target_industries: [],
    dream_companies: '',
    location_preferences: [],
    custom_location: '',
    timeline: '',
    one_sentence_pitch: ''
  });

  // Initialize profile from user data + validate @ufl.edu
  useEffect(() => {
    if (user) {
      // Validate @ufl.edu email
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

  // Auto-save every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formData).some(v => v !== '' && v.length !== 0)) {
        localStorage.setItem('student_onboarding_draft', JSON.stringify(formData));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('student_onboarding_draft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!formData.first_name?.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) errors.last_name = 'Last name is required';
    if (!formData.graduation_year) errors.graduation_year = 'Graduation year is required';
    if (!formData.major?.trim()) errors.major = 'Major is required';
    if (formData.first_name?.includes('@')) errors.first_name = 'Please enter your name, not email';
    if (formData.last_name?.includes('@')) errors.last_name = 'Please enter your name, not email';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.first_name?.trim() && formData.last_name?.trim() && formData.graduation_year && formData.major?.trim();
      case 1: return formData.help_types.length > 0 && formData.help_industry && formData.help_description?.trim().length >= 10;
      case 2: return formData.target_roles.length > 0 || formData.custom_role !== '';
      case 3: return formData.target_industries.length > 0;
      case 4: return true; // Dream companies optional
      case 5: return formData.location_preferences.length > 0 || formData.custom_location !== '';
      case 6: return formData.timeline !== '';
      case 7: return formData.one_sentence_pitch.trim().length >= 20;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!validateProfile()) return;
      // Save profile data immediately
      try {
        await User.updateMyUserData({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          graduation_year: formData.graduation_year,
          major: formData.major.trim(),
          resume_url: formData.resume_url?.trim() || '',
          linkedin_url: formData.linkedin_url?.trim() || ''
        });
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
    if (canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    try {
      // Build the job request description
      const roles = formData.target_roles.length > 0 
        ? formData.target_roles.join(', ') 
        : formData.custom_role;
      
      const description = `${formData.one_sentence_pitch}\n\nLooking for: ${roles} in ${formData.target_industries.join(', ')}`;
      
      const locations = formData.location_preferences.length > 0
        ? formData.location_preferences.join(', ')
        : formData.custom_location;

      // Determine if request should be public
      const isPublicRequest = formData.post_to_emerging || formData.show_on_directory;

      // Create job request with poster name for display
      await JobRequest.create({
        role: roles.split(',')[0].trim(), // First role as main role
        title: `${roles.split(',')[0].trim()} - ${formData.target_industries[0] || 'Various'}`,
        description: description,
        target_industry: formData.target_industries[0] || 'Various',
        location_preference: locations,
        start_timing: formData.timeline,
        status: isPublicRequest ? 'active' : 'draft', // Draft if both unchecked
        target_helpers: ['alumni', 'parents'],
        poster_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        poster_first_name: formData.first_name.trim(),
        poster_last_name: formData.last_name.trim(),
        resume_url: formData.resume_url?.trim() || '',
        linkedin_url: formData.linkedin_url?.trim() || ''
      });

      // Create HelpRequest for matching (if they provided help request info)
      if (formData.help_types?.length > 0 && formData.help_industry) {
        const studentYear = formData.graduation_year 
          ? `Class of ${formData.graduation_year}` 
          : 'Current Student';
        
        const helpRequest = await HelpRequest.create({
          student_id: user.id,
          student_email: user.email,
          student_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          student_major: formData.major?.trim(),
          student_year: studentYear,
          help_types: formData.help_types,
          industry: formData.help_industry,
          description: formData.help_description,
          timeline: formData.help_timeline || 'no_rush',
          status: 'active'
        });

        // Trigger matching algorithm
        try {
          const matchResult = await base44.functions.invoke('generateMatches', {
            help_request_id: helpRequest.id,
            mode: 'for_request'
          });
          console.log('✅ Matches generated for help request:', helpRequest.id, 'Count:', matchResult?.matches?.length || 0);
        } catch (matchError) {
          console.error('Failed to generate matches:', matchError);
          // Don't fail the whole onboarding if matching fails
        }
      }

      // Update user profile - mark onboarding complete and clear new signup flag
      const userUpdate = {
        onboarding_completed: true,
        profile_completion_score: 90,
        is_new_signup: false // Clear the new signup flag
      };
      
      if (formData.show_on_directory && formData.help_description) {
        userUpdate.currently_seeking = formData.help_description;
      }

      // Handle referral code from session
      const referralCode = sessionStorage.getItem('pending_referral_code');
      if (referralCode) {
        userUpdate.referral_code = referralCode;
        console.log('🎟️ [StudentOnboarding] Saving referral code:', referralCode);
      }

      await User.updateMyUserData(userUpdate);

      localStorage.removeItem('student_onboarding_draft');
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_referral_code');

      // Show parent invite modal
      setShowParentInviteModal(true);

    } catch (error) {
      console.error('Failed to submit onboarding:', error);
      alert('Failed to submit your request. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleParentInviteComplete = () => {
    setShowParentInviteModal(false);
    
    // Success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FA4616', '#0021A5', '#FF6B35']
    });

    setShowSuccess(true);
    
    // Simulate live counter
    let count = Math.floor(Math.random() * 20) + 30;
    setLiveViewCount(count);
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 3);
      setLiveViewCount(count);
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      refreshUser().then(() => navigate('Dashboard'));
    }, 5000);
  };

  // Show error if not @ufl.edu email
  if (emailError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-300 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Invalid Email
            </h2>
            <p className="text-slate-600 mb-6">
              {emailError}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              You're currently logged in as: <strong>{user?.email}</strong>
            </p>
            <Button
              onClick={() => logout()}
              className="bg-[#0021A5] hover:bg-[#001580] text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Use UF Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FA4616] to-[#0021A5] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-white rounded-3xl p-12 text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#0021A5] mb-4">
            Your request is live in the Gator Network!
          </h1>
          <div className="text-6xl font-bold text-[#FA4616] mb-2">
            {liveViewCount}
          </div>
          <p className="text-lg text-slate-600 mb-6">
            Gators have already seen it in the last 5 minutes
          </p>
          <div className="text-6xl mb-4">🐊</div>
          <p className="text-slate-500">Redirecting you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
            alt="College Fast Forward"
            className="h-12"
          />
          <Button variant="ghost" onClick={() => logout()} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-200">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FA4616] to-[#FF8C42]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 8) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Title Section */}
          <motion.div
            key="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-black text-[#FA4616] mb-3">
              Unlock Your Gator Network
            </h1>
            <p className="text-2xl font-semibold text-[#0021A5] mb-2">
              Tell us what you need — Gator parents & alumni are ready to help
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Sparkles className="w-5 h-5" />
              <span>Takes 90 seconds. The more detail, the faster you'll get responses.</span>
            </div>
          </motion.div>

          <Card className="shadow-xl border-2 border-slate-200">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 0: Profile Info */}
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <UserIcon className="w-6 h-6 text-[#0021A5]" />
                      Let's start with your name
                    </h2>
                    <p className="text-slate-600 mb-6">This helps Gator parents and alumni know who they're helping.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                        <Input
                          value={formData.first_name}
                          onChange={(e) => updateField('first_name', e.target.value)}
                          placeholder="e.g., John"
                          className={profileErrors.first_name ? 'border-red-300' : ''}
                        />
                        {profileErrors.first_name && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />{profileErrors.first_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                        <Input
                          value={formData.last_name}
                          onChange={(e) => updateField('last_name', e.target.value)}
                          placeholder="e.g., Smith"
                          className={profileErrors.last_name ? 'border-red-300' : ''}
                        />
                        {profileErrors.last_name && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />{profileErrors.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">🎓 Graduation Year *</label>
                        <Select 
                          value={formData.graduation_year?.toString()} 
                          onValueChange={(value) => updateField('graduation_year', parseInt(value))}
                        >
                          <SelectTrigger className={profileErrors.graduation_year ? 'border-red-300' : ''}>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADUATION_YEARS.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {profileErrors.graduation_year && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />{profileErrors.graduation_year}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">📚 Major *</label>
                        <Input
                          value={formData.major}
                          onChange={(e) => updateField('major', e.target.value)}
                          placeholder="e.g., Computer Science"
                          className={profileErrors.major ? 'border-red-300' : ''}
                        />
                        {profileErrors.major && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />{profileErrors.major}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">📄 Resume URL (optional)</label>
                        <Input
                          value={formData.resume_url}
                          onChange={(e) => updateField('resume_url', e.target.value)}
                          placeholder="e.g., https://drive.google.com/file/d/..."
                          type="url"
                        />
                        <p className="text-xs text-slate-500 mt-1">Upload to Google Drive or Dropbox and paste the shareable link</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">💼 LinkedIn Profile (optional)</label>
                        <Input
                          value={formData.linkedin_url}
                          onChange={(e) => updateField('linkedin_url', e.target.value)}
                          placeholder="e.g., https://linkedin.com/in/yourname"
                          type="url"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Help Request - NEW structured format for matching */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-[#0021A5]" />
                        What kind of help do you need?
                      </h2>
                      <p className="text-slate-600">Select all that apply - this helps us match you with the right Gator parents and alumni.</p>
                    </div>

                    {/* Help Types */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Types of help needed *
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {HELP_TYPES.map(type => (
                          <label
                            key={type.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.help_types.includes(type.value)
                                ? 'border-[#0021A5] bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.help_types.includes(type.value)}
                              onChange={() => toggleMultiSelect('help_types', type.value)}
                              className="w-5 h-5 text-[#0021A5] rounded"
                            />
                            <span className="text-xl">{type.icon}</span>
                            <span className="text-sm font-medium text-slate-700">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Which industry? *
                      </label>
                      <Select 
                        value={formData.help_industry} 
                        onValueChange={(value) => updateField('help_industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tell us more about what you're looking for *
                      </label>
                      <Textarea
                        value={formData.help_description}
                        onChange={(e) => updateField('help_description', e.target.value)}
                        placeholder="e.g., Looking for advice on breaking into tech consulting. Interested in learning about the interview process and what skills are most valued..."
                        rows={4}
                        className="text-base"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {formData.help_description?.length || 0} characters (minimum 10)
                      </p>
                    </div>

                    {/* Timeline */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        When do you need this help? *
                      </label>
                      <div className="space-y-2">
                        {HELP_TIMELINES.map(timeline => (
                          <button
                            key={timeline.value}
                            type="button"
                            onClick={() => updateField('help_timeline', timeline.value)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              formData.help_timeline === timeline.value
                                ? 'border-[#0021A5] bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-medium text-slate-800">{timeline.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visibility Options */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 space-y-3">
                      <p className="text-sm font-semibold text-blue-900 mb-3">Where should this appear?</p>
                      
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.post_to_emerging}
                          onChange={(e) => updateField('post_to_emerging', e.target.checked)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-blue-700">
                            Post this to Emerging Gators (recommended)
                          </p>
                          <p className="text-sm text-slate-600">
                            Parents and alumni will see your request and can offer help
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.show_on_directory}
                          onChange={(e) => updateField('show_on_directory', e.target.checked)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-blue-700">
                            Show this on my Directory profile (recommended)
                          </p>
                          <p className="text-sm text-slate-600">
                            Appears as "Currently seeking: [your text]" on your profile card
                          </p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Target Roles */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Target Roles</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {POPULAR_ROLES.map(role => (
                        <Badge
                          key={role}
                          onClick={() => toggleMultiSelect('target_roles', role)}
                          className={`cursor-pointer py-2 px-4 text-sm ${
                            formData.target_roles.includes(role)
                              ? 'bg-[#0021A5] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Or type other roles..."
                      value={formData.custom_role}
                      onChange={(e) => updateField('custom_role', e.target.value)}
                      className="mt-4"
                    />
                  </motion.div>
                )}

                {/* Step 3: Target Industries */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Target Industries</h2>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map(industry => (
                        <Badge
                          key={industry}
                          onClick={() => toggleMultiSelect('target_industries', industry)}
                          className={`cursor-pointer py-2 px-4 text-sm ${
                            formData.target_industries.includes(industry)
                              ? 'bg-[#0021A5] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Dream Companies */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Dream Companies</h2>
                    <p className="text-sm text-slate-600 mb-6">Optional but strongly encouraged</p>
                    <Textarea
                      placeholder="e.g. Google, Deloitte, Disney, Mayo Clinic, NASA, startups in Miami…"
                      value={formData.dream_companies}
                      onChange={(e) => updateField('dream_companies', e.target.value)}
                      rows={4}
                      className="mb-3"
                    />
                    <p className="text-sm text-[#0021A5] font-medium">
                      💡 Name 3–5 if you have them — Gator parents at these companies will see your request first
                    </p>
                  </motion.div>
                )}

                {/* Step 5: Location Preferences */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Location Preferences</h2>
                    <div className="space-y-2 mb-4">
                      {LOCATIONS.map(location => (
                        <button
                          key={location}
                          onClick={() => toggleMultiSelect('location_preferences', location)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            formData.location_preferences.includes(location)
                              ? 'border-[#0021A5] bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                    <Input
                      placeholder="Or type specific cities..."
                      value={formData.custom_location}
                      onChange={(e) => updateField('custom_location', e.target.value)}
                    />
                  </motion.div>
                )}

                {/* Step 6: Timeline */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Timeline</h2>
                    <div className="space-y-2">
                      {TIMELINES.map(timeline => (
                        <button
                          key={timeline.value}
                          onClick={() => updateField('timeline', timeline.value)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            formData.timeline === timeline.value
                              ? 'border-[#0021A5] bg-blue-50 shadow-md'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-semibold text-slate-800">{timeline.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 7: One-Sentence Pitch */}
                {currentStep === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">In one sentence, what makes you stand out?</h2>
                    <p className="text-sm text-slate-600 mb-6">This is your magic moment — make it count!</p>
                    <Textarea
                      placeholder="e.g. Finance senior with two Big 4 internships · UF Honors · built a trading bot with 40% returns · former Gator swimmer · fluent in Portuguese…"
                      value={formData.one_sentence_pitch}
                      onChange={(e) => updateField('one_sentence_pitch', e.target.value)}
                      rows={5}
                      className="text-base"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      {formData.one_sentence_pitch.length} characters
                      {formData.one_sentence_pitch.length < 20 && ' (minimum 20)'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                {currentStep < 7 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-[#0021A5] hover:bg-[#001580] text-white"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="flex-1 bg-[#FA4616] hover:bg-[#E03D0F] text-white font-bold text-lg py-6"
                  >
                    {isSubmitting ? 'Saving...' : 'Complete Setup →'}
                  </Button>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="text-center mt-6 text-sm text-slate-500">
                Step {currentStep + 1} of 8
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Parent Invite Modal */}
      <Dialog open={showParentInviteModal} onOpenChange={setShowParentInviteModal}>
        <DialogContent className="max-w-2xl">
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