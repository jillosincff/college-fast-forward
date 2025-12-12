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
}