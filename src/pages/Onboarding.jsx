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

const industries = [
  "Finance", "Tech", "Healthcare", "Engineering", "Consulting",
  "Real Estate", "Law", "Marketing", "Government", "Entrepreneurship", "Other"
];

const primaryGoals = [
  { id: 'career_advice', label: 'Career advice & mock interviews' },
  { id: 'job_leads', label: 'Internship or job leads at my company / network' },
  { id: 'resume_reviews', label: 'Resume & LinkedIn reviews' },
  { id: 'friendly_ear', label: 'Just be a friendly Gator ear when they\'re stressed' },
  { id: 'all_in', label: 'All of the above (I\'m all in!)' }
];


export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState(0); // 0 = connect gator, 1 = profile form
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    current_company: user?.current_company || '',
    current_position: user?.current_position || '',
    industries: user?.industries || [],
    primary_goal: user?.primary_goal || [],
    dream_companies: user?.dream_companies || '',
    bio: user?.bio || '',
    visible_in_directory: user?.visible_in_directory !== false,
    student_emails: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    trackEvent('parent_onboarding_started', { 
      parentId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [user?.id]);

  const handleIndustryToggle = (industry) => {
    setFormData(prev => {
      const current = prev.industries || [];
      if (current.includes(industry)) {
        return { ...prev, industries: current.filter(i => i !== industry) };
      }
      if (current.length >= 3) {
        toast({
          title: "Maximum 3 industries",
          description: "Please select up to 3 industries only.",
          variant: "destructive"
        });
        return prev;
      }
      return { ...prev, industries: [...current, industry] };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name?.trim()) newErrors.full_name = 'Required';
    if (!formData.industries?.length) newErrors.industries = 'Select at least 1';
    if (!formData.primary_goal?.length) newErrors.primary_goal = 'Required';
    
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
        industries: formData.industries,
        primary_goal: formData.primary_goal,
        dream_companies: formData.dream_companies,
        bio: formData.bio,
        onboarding_completed: true,
        expertise_shared: true,
        visible_in_directory: formData.visible_in_directory,
        profile_completion_score: 85
      };

      // Add referral code if provided
      if (referralCode?.trim()) {
        updateData.referral_code = referralCode.trim();
        console.log('🎟️ [Onboarding] Saving referral code:', referralCode.trim());
      }

      await base44.auth.updateMe(updateData);

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
      <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #FEFCFA 100%)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, rgba(250, 70, 22, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 20s ease-in-out infinite'
        }} 
      />
      <div className="absolute bottom-0 left-0 w-3/4 h-3/4 opacity-10 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, rgba(0, 33, 165, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 25s ease-in-out infinite reverse'
        }} 
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/80">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#003865', letterSpacing: '-0.02em' }}>
              UF Gator Network
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Where Gators connect for careers
            </p>
          </div>

          {/* Auth Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#003865' }}>
                Sign in with your @ufl.edu email
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your data is secure. We only use this to verify you're a UF student.
              </p>
            </div>

            {/* Referral Code Section */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowReferralInput(!showReferralInput)}
                className="inline-flex items-center gap-2 text-[#FA4616] font-medium hover:bg-orange-50 rounded-lg px-4 py-2 transition-all"
              >
                Have a referral code? Drop it here so we give your friend credit
                <div 
                  className={`w-5 h-5 border-2 border-current rounded-full flex items-center justify-center text-xs font-bold transition-all ${showReferralInput ? 'rotate-45 bg-[#FA4616] text-white' : 'bg-orange-50'}`}
                >
                  +
                </div>
              </button>
              
              {showReferralInput && (
                <motion.div
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 100 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter your friend's referral code"
                    className="text-center text-lg border-2 border-gray-200 focus:border-[#FA4616] rounded-xl py-6 bg-[#FEFCFA]"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll make sure your friend gets credit for referring you!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Google Button */}
            <button
              onClick={() => {
                if (referralCode?.trim()) {
                  sessionStorage.setItem('pending_referral_code', referralCode.trim());
                  console.log('🎟️ Stored referral code:', referralCode.trim());
                }
                base44.auth.redirectToLogin(window.location.origin + '/#GatorRoleSelection');
              }}
              className="w-full bg-gradient-to-r from-[#0021A5] to-[#003865] text-white rounded-2xl py-4 text-lg font-semibold hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <span>Continue with Google</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, -30px) rotate(2deg); }
          66% { transform: translate(20px, -20px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );

  // OLD ONBOARDING FORM - Keep for reference if needed to revert
  /*
  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-[32px] font-bold mb-2 relative inline-block" style={{ color: '#FA4616' }}>
          {user?.onboarding_completed ? 'Update Your Profile' : 'Thank You for Empowering Future Gators'}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FA4616] to-transparent opacity-30"></div>
          </h1>
          <p className="text-[18px] leading-[1.5] mt-4" style={{ color: '#0021A5' }}>
          {user?.onboarding_completed 
            ? 'Update your information to help students find you more easily'
            : 'In less than a minute, students will be able to find YOU when they need advice, internships, or job leads.'
          }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {/* Mandatory Fields */}
          <div className="space-y-6">
            <div>
              <Label className="text-[16px] font-bold mb-2 block" style={{ color: '#0021A5' }}>
                Full Name <span className="text-[#FF0000]">*</span>
              </Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Doe"
                className={`h-[44px] border-[#E0E0E0] rounded-[6px] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)] placeholder:text-[#757575] ${errors.full_name ? 'border-red-500' : ''}`}
                style={{ borderWidth: '1px' }}
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-[16px] font-bold mb-2 block" style={{ color: '#0021A5' }}>
                Current Company
              </Label>
              <Input
                value={formData.current_company}
                onChange={(e) => setFormData({...formData, current_company: e.target.value})}
                placeholder="Google, Goldman Sachs"
                className="h-[44px] border-[#E0E0E0] rounded-[6px] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)] placeholder:text-[#757575]"
                style={{ borderWidth: '1px' }}
              />
            </div>

            <div>
              <Label className="text-[16px] font-bold mb-2 block" style={{ color: '#0021A5' }}>
                Current Job Title
              </Label>
              <Input
                value={formData.current_position}
                onChange={(e) => setFormData({...formData, current_position: e.target.value})}
                placeholder="Senior Product Manager"
                className="h-[44px] border-[#E0E0E0] rounded-[6px] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)] placeholder:text-[#757575]"
                style={{ borderWidth: '1px' }}
              />
            </div>
            
            <div className="bg-blue-50 border-l-4 border-[#0021A5] p-4 rounded-r-lg">
              <p className="text-sm" style={{ color: '#0021A5' }}>
                💡 <strong>Pro tip:</strong> The more we know about your background and connections, the easier it is to match you with students who need your specific expertise.
              </p>
            </div>

            <div>
              <Label className="text-[16px] font-bold mb-3 block" style={{ color: '#0021A5' }}>
                Industry (max 3) <span className="text-[#FF0000]">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustryToggle(industry)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.industries?.includes(industry)
                        ? 'text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={formData.industries?.includes(industry) ? {
                      backgroundColor: '#FA4616',
                      border: '2px solid #FA4616'
                    } : {}}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              {errors.industries && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.industries}
                </p>
              )}
            </div>

            <div>
              <Label className="text-[16px] font-bold mb-3 block" style={{ color: '#0021A5' }}>
                Primary Goal – What are you most excited to help Gator students with? <span className="text-[#FF0000]">*</span>
              </Label>
              <p className="text-sm mb-3" style={{ color: '#757575' }}>Pick all that apply</p>
              <div className="space-y-2">
                {primaryGoals.map((goal) => (
                  <label
                    key={goal.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[6px] cursor-pointer border transition-all ${
                      formData.primary_goal?.includes(goal.id)
                        ? 'bg-blue-50 border-[#0021A5]'
                        : 'bg-white border-[#E0E0E0] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.primary_goal?.includes(goal.id)}
                      onChange={(e) => {
                        const newGoals = e.target.checked
                          ? [...(formData.primary_goal || []), goal.id]
                          : (formData.primary_goal || []).filter(g => g !== goal.id);
                        setFormData({...formData, primary_goal: newGoals});
                      }}
                      className="w-5 h-5 accent-[#0021A5]"
                    />
                    <span className="text-[14px] font-medium" style={{ color: '#333333' }}>{goal.label}</span>
                  </label>
                ))}
              </div>
              {errors.primary_goal && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.primary_goal}
                </p>
              )}
            </div>
          </div>

          {/* Optional Section */}
          <div className="border-t border-[#E0E0E0] mt-8 pt-8 space-y-6">
            <h3 className="text-[20px] font-bold flex items-center gap-2" style={{ color: '#FA4616' }}>
              <span className="text-[20px]">★</span>
              Supercharge your impact
            </h3>

            <div>
              <Label className="text-[16px] font-bold mb-2 block" style={{ color: '#0021A5' }}>
                Dream Companies you can open doors at
              </Label>
              <Input
                value={formData.dream_companies}
                onChange={(e) => setFormData({...formData, dream_companies: e.target.value})}
                placeholder="Disney, Microsoft, Tesla"
                className="h-[44px] border-[#E0E0E0] rounded-[6px] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)] placeholder:text-[#757575]"
                style={{ borderWidth: '1px' }}
              />
            </div>

            <div>
              <Label className="text-[16px] font-bold mb-2 block" style={{ color: '#0021A5' }}>
                Short bio (max 140 chars)
              </Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 140)})}
                placeholder="Ex: Former Disney Imagineer turned VC – happy to help Gators break into entertainment & startups."
                className="border-[#E0E0E0] rounded-[6px] focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)] placeholder:text-[#757575] min-h-[80px]"
                style={{ borderWidth: '1px' }}
                maxLength={140}
              />
              <p className="text-xs mt-1" style={{ color: '#757575' }}>{formData.bio?.length || 0}/140 characters</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-lg border-2 border-blue-200">
              <Label className="text-[16px] font-bold mb-2 flex items-center gap-2" style={{ color: '#0021A5' }}>
                📖 Gator Directory Visibility
              </Label>
              <div className="flex items-center gap-3 mt-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible_in_directory !== false}
                    onChange={(e) => setFormData({...formData, visible_in_directory: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0021A5]"></div>
                </label>
                <span className="text-sm text-slate-700 font-medium">
                  Show my profile in the Gator Directory
                </span>
              </div>
              <p className="text-xs mt-2 text-slate-600">
                When enabled, students can discover and connect with you through the directory.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-16 text-[18px] font-bold rounded-[8px] shadow-2xl hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: '#FA4616',
              color: '#FFFFFF',
              padding: '16px'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {user?.onboarding_completed ? 'Saving...' : 'Joining Gator Nation...'}
              </>
            ) : (
              user?.onboarding_completed ? 'Save Changes →' : 'Join Gator Nation →'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
  */
}