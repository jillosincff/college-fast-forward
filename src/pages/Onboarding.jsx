import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { navigate } from '@/components/utils/navigation';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';

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

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    current_company: '',
    current_position: '',
    industries: [],
    primary_goal: [],
    dream_companies: '',
    bio: ''
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
      await base44.auth.updateMe({
        full_name: formData.full_name,
        current_company: formData.current_company,
        current_position: formData.current_position,
        industries: formData.industries,
        primary_goal: formData.primary_goal,
        dream_companies: formData.dream_companies,
        bio: formData.bio,
        onboarding_completed: true,
        expertise_shared: true,
        visible_in_directory: true,
        profile_completion_score: 85
      });

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

      // Show success and trigger confetti
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-[32px] font-bold mb-2 relative inline-block" style={{ color: '#FA4616' }}>
            Thank You for Empowering Future Gators
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FA4616] to-transparent opacity-30"></div>
          </h1>
          <p className="text-[18px] leading-[1.5] mt-4" style={{ color: '#0021A5' }}>
            In less than a minute, students will be able to find YOU when they need advice, internships, or job leads.
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
                Joining Gator Nation...
              </>
            ) : (
              'Join Gator Nation →'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}