import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { navigate } from '@/components/utils/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';
import ConnectGatorStep from '@/components/onboarding/parent/ConnectGatorStep';
import { ParentExpertise } from '@/entities/ParentExpertise';
import { JobRequest } from '@/entities/JobRequest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  { value: 'career_advice', label: 'Career advice and guidance' },
  { value: 'internship_leads', label: 'Internship or job leads' },
  { value: 'resume_review', label: 'Resume review' },
  { value: 'interview_prep', label: 'Interview preparation' },
  { value: 'industry_insights', label: 'Industry insights' },
  { value: 'networking_intros', label: 'Networking introductions' },
  { value: 'informational_interview', label: 'Informational interview' }
];


export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState(0); // 0 = connect gator, 1 = question, 2 = profile form
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    current_company: '',
    current_position: '',
    industry: '',
    years_experience: '',
    help_types: [],
    company_connections: '',
    bio: '',
    visible_in_directory: true,
    student_emails: '',
    question: '',
    is_anonymous: false
  });

  // Initialize form data from user when available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        current_company: user.current_company || prev.current_company,
        current_position: user.current_position || prev.current_position,
        industry: user.industry || prev.industry,
        years_experience: user.years_experience || prev.years_experience,
        help_types: user.help_types || prev.help_types,
        company_connections: user.company_connections || prev.company_connections,
        bio: user.bio || prev.bio,
        visible_in_directory: user.visible_in_directory !== false
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    trackEvent('parent_onboarding_started', { 
      parentId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [user?.id]);

  const handleHelpTypeToggle = (helpType) => {
    setFormData(prev => {
      const current = prev.help_types || [];
      if (current.includes(helpType)) {
        return { ...prev, help_types: current.filter(h => h !== helpType) };
      }
      return { ...prev, help_types: [...current, helpType] };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name?.trim()) newErrors.full_name = 'Required';
    if (!formData.current_position?.trim()) newErrors.current_position = 'Required';
    if (!formData.industry) newErrors.industry = 'Required';
    if (!formData.years_experience) newErrors.years_experience = 'Required';
    if (!formData.help_types?.length) newErrors.help_types = 'Select at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all fields marked with 🐊",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const completionTime = Math.round((Date.now() - startTime) / 1000);

    try {
      const updateData = {
        full_name: formData.full_name,
        current_company: formData.current_company,
        current_position: formData.current_position,
        industry: formData.industry,
        years_experience: formData.years_experience,
        company_connections: formData.company_connections,
        bio: formData.bio,
        onboarding_completed: true,
        is_new_signup: false, // Clear the new signup flag
        expertise_shared: true,
        visible_in_directory: formData.visible_in_directory,
        profile_completion_score: 85
      };

      // Add referral code if provided
      if (referralCode?.trim()) {
        updateData.referral_code_used = referralCode.trim();
        updateData.referral_used_at = new Date().toISOString();
        console.log('🎟️ [Onboarding] Saving referral code:', referralCode.trim());
      }

      await base44.auth.updateMe(updateData);

      // Create ParentExpertise profile for matching
      await ParentExpertise.create({
        parent_id: user.id,
        parent_email: user.email,
        parent_name: formData.full_name,
        industry: formData.industry,
        current_role: formData.current_position,
        current_company: formData.current_company || '',
        years_experience: formData.years_experience,
        help_types: formData.help_types,
        company_connections: formData.company_connections || '',
        available: true
      });

      // Trigger matching for existing student requests
      try {
        const parentExpertise = await ParentExpertise.filter({ parent_id: user.id });
        if (parentExpertise && parentExpertise.length > 0) {
          await base44.functions.invoke('generateMatches', {
            parent_expertise_id: parentExpertise[0].id,
            mode: 'for_parent'
          });
          console.log('✅ Generated matches for parent expertise');
        }
      } catch (matchError) {
        console.error('Failed to generate matches:', matchError);
      }

      // Link students if provided
      if (formData.student_emails?.trim()) {
        try {
          const emails = formData.student_emails.split(',').map(e => e.trim()).filter(e => e);
          const response = await base44.functions.invoke('linkStudentsToParent', {
            studentEmailsOrNames: emails
          });
          console.log('Linked students:', response);
        } catch (linkError) {
          console.error('Failed to link students:', linkError);
        }
      }

      // Create parent's question as a JobRequest if they provided one
      if (formData.question?.trim()) {
        try {
          await JobRequest.create({
            role: 'Parent Question',
            title: 'Parent Question',
            description: formData.question,
            target_industry: formData.industry || 'Other',
            poster_type: 'parent',
            is_anonymous: formData.is_anonymous || false,
            poster_name: formData.is_anonymous ? 'Anonymous Parent' : formData.full_name,
            poster_first_name: formData.is_anonymous ? 'Anonymous' : (formData.full_name?.split(' ')[0] || 'Parent'),
            poster_last_name: formData.is_anonymous ? 'Parent' : (formData.full_name?.split(' ').slice(1).join(' ') || ''),
            status: 'active',
            role_type: 'full_time',
            work_mode: 'on_site',
            target_helpers: ['alumni', 'parents']
          });
          console.log('✅ Created parent question as JobRequest (anonymous:', formData.is_anonymous, ')');
        } catch (questionError) {
          console.error('Failed to create parent question:', questionError);
        }
      }

      await refreshUser();

      trackEvent('parent_onboarding_completed', {
        parentId: user.id,
        completionTimeSeconds: completionTime,
        ...formData
      });

      // Clear session data
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_type');
      sessionStorage.removeItem('pending_inviter_name');

      // Only show confetti for first-time completion
      if (!user?.onboarding_completed) {
        setShowSuccess(true);
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0021A5', '#FA4616', '#FF6B35']
        });

        setTimeout(() => {
          navigate('ParentDashboard');
        }, 4000);
      } else {
        // If editing profile, go directly back to dashboard
        navigate('ParentDashboard');
      }

    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-7xl">🐊</span>
            </div>
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#FA4616' }}>
              BOOM!
            </h1>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              You're officially in the Swamp!
            </h2>
            <p className="text-xl text-slate-600 mb-6">
              Students can now find and message you. You'll get notified the second someone reaches out.
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Redirecting to your dashboard...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 0: Connect with Gator (only for new users)
  if (currentStep === 0 && !user?.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-slate-100 relative overflow-hidden"
          >
            {/* Decorative gradient bar at top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0021A5] via-[#FA4616] to-[#0021A5]" />
            
            <ConnectGatorStep 
              onComplete={(student) => {
                if (student?.email) {
                  setFormData(prev => ({ ...prev, student_emails: student.email }));
                }
                setCurrentStep(1);
              }}
              onSkip={() => setCurrentStep(1)}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  const exampleQuestions = [
    "My daughter got rejected from her dream job. How do I support her?",
    "Is it normal to worry this much about their future?",
    "How do I help without being a helicopter parent?"
  ];

  // Step 1: What's on your mind? (Parent's question - optional)
  if (currentStep === 1 && !user?.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Empathy Section */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-6">💙</div>
              
              <h1 className="text-2xl font-bold text-slate-800 mb-4">
                We know this time isn't easy.
              </h1>
              
              <p className="text-slate-600 leading-relaxed mb-4">
                Watching your student navigate their future can be exciting, stressful, 
                and everything in between. The job search, the uncertainty, the "what ifs" — 
                it's a lot.
              </p>
              
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">For them AND for you.</strong>
              </p>
              
              <p className="text-slate-500 mt-4 text-sm">
                That's why we built this community. You're not alone.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-8"></div>

            {/* Question Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                What's on your mind lately?
              </h2>
              
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value.slice(0, 500) }))}
                placeholder="Share a concern, ask a question, or just vent. This community gets it."
                rows={5}
                className="min-h-[130px] text-base border-2 border-slate-200 focus:border-[#0021A5] resize-none placeholder:text-slate-400"
              />
              <div className="text-right text-xs text-slate-400 mt-1">
                {formData.question?.length || 0}/500
              </div>
            </div>

            {/* Anonymous Posting Option */}
            {formData.question?.trim().length > 10 && (
              <div className="mb-6">
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="w-5 h-5 text-[#0021A5] rounded mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Post anonymously</p>
                    <p className="text-sm text-slate-600">
                      Your question will show as "Anonymous Parent" instead of your name.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Example Questions (clickable) */}
            <div className="bg-slate-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-slate-500 mb-2">💭 Other parents are sharing:</p>
              <ul className="text-sm text-slate-600 space-y-2">
                {exampleQuestions.map((example, i) => (
                  <li 
                    key={i}
                    onClick={() => setFormData(prev => ({ ...prev, question: example }))}
                    className="italic cursor-pointer hover:text-[#0021A5] transition-colors"
                  >
                    "{example}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                ← Back
              </button>
              
              <Button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-[#FA4616] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                {formData.question?.trim().length > 10 ? 'Share & Continue →' : 'Skip for now →'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Back button for step 2 */}
          {currentStep === 2 && !user?.onboarding_completed && (
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center text-slate-600 mb-4 hover:text-slate-900 transition-colors text-sm"
            >
              ← Back to question
            </button>
          )}
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#0021A5] mb-2">
              Share Your Expertise
            </h1>
            <p className="text-slate-600">
              Help us match you with students who need your guidance
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="John Smith"
                className={errors.full_name ? 'border-red-300' : ''}
              />
              {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>}
            </div>

            {/* Current Position */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Current Role/Title *</Label>
              <Input
                value={formData.current_position}
                onChange={(e) => setFormData(prev => ({ ...prev, current_position: e.target.value }))}
                placeholder="e.g., Senior Marketing Manager"
                className={errors.current_position ? 'border-red-300' : ''}
              />
              {errors.current_position && <p className="text-red-600 text-xs mt-1">{errors.current_position}</p>}
            </div>

            {/* Current Company */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Current Company (optional)</Label>
              <Input
                value={formData.current_company}
                onChange={(e) => setFormData(prev => ({ ...prev, current_company: e.target.value }))}
                placeholder="e.g., Google"
              />
            </div>

            {/* Industry */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Industry *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger className={errors.industry ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-red-600 text-xs mt-1">{errors.industry}</p>}
            </div>

            {/* Years of Experience */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Years of Experience *</Label>
              <Select 
                value={formData.years_experience} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, years_experience: value }))}
              >
                <SelectTrigger className={errors.years_experience ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-15">10-15 years</SelectItem>
                  <SelectItem value="15-20">15-20 years</SelectItem>
                  <SelectItem value="20+">20+ years</SelectItem>
                </SelectContent>
              </Select>
              {errors.years_experience && <p className="text-red-600 text-xs mt-1">{errors.years_experience}</p>}
            </div>

            {/* Help Types */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                What types of help can you provide? * <span className="text-xs font-normal text-slate-500">(Select all that apply)</span>
              </Label>
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
                      onChange={() => handleHelpTypeToggle(type.value)}
                      className="w-5 h-5 text-[#0021A5] rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.help_types && <p className="text-red-600 text-xs mt-1">{errors.help_types}</p>}
            </div>

            {/* Company Connections */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">
                Companies/organizations you have connections at (optional)
              </Label>
              <Input
                value={formData.company_connections}
                onChange={(e) => setFormData(prev => ({ ...prev, company_connections: e.target.value }))}
                placeholder="e.g., Google, Microsoft, Meta (comma-separated)"
              />
              <p className="text-xs text-slate-500 mt-1">
                List companies where you have hiring connections or insider knowledge
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Bio (optional)</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell students a bit about yourself and your career journey..."
                rows={4}
              />
            </div>

            {/* Visibility Toggle */}
            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visible_in_directory}
                onChange={(e) => setFormData(prev => ({ ...prev, visible_in_directory: e.target.checked }))}
                className="w-5 h-5 text-[#0021A5] rounded"
              />
              <div>
                <p className="font-medium text-slate-900">Show in Gator Directory</p>
                <p className="text-sm text-slate-600">Students can discover and message you</p>
              </div>
            </label>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#0021A5] to-[#003865] hover:from-[#001580] hover:to-[#002050] text-white py-6 text-lg font-semibold rounded-xl"
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup & Start Helping'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}