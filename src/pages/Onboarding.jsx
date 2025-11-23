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
    graduation_years: '',
    current_company: '',
    current_position: '',
    industries: [],
    primary_goal: '',
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
    
    if (!formData.graduation_years?.trim()) newErrors.graduation_years = 'Required';
    if (!formData.current_company?.trim()) newErrors.current_company = 'Required';
    if (!formData.current_position?.trim()) newErrors.current_position = 'Required';
    if (!formData.industries?.length) newErrors.industries = 'Select at least 1';
    if (!formData.primary_goal) newErrors.primary_goal = 'Required';
    
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
        graduation_years: formData.graduation_years,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FA4616' }}>
            Unlock the full Gator Network
          </h1>
          <p className="text-xl" style={{ color: '#0021A5' }}>
            In less than a minute, students will be able to find YOU when they need advice, internships, or job leads.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 space-y-8"
        >
          {/* Mandatory Fields */}
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-2xl">🐊</span> Your Graduation Year(s)
              </Label>
              <Input
                value={formData.graduation_years}
                onChange={(e) => setFormData({...formData, graduation_years: e.target.value})}
                placeholder="e.g., 1998, 2012 MBA"
                className={`h-12 mt-2 ${errors.graduation_years ? 'border-red-500' : ''}`}
              />
              {errors.graduation_years && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.graduation_years}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-2xl">🐊</span> Current Company
              </Label>
              <Input
                value={formData.current_company}
                onChange={(e) => setFormData({...formData, current_company: e.target.value})}
                placeholder="e.g., Google, Goldman Sachs"
                className={`h-12 mt-2 ${errors.current_company ? 'border-red-500' : ''}`}
              />
              {errors.current_company && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.current_company}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-2xl">🐊</span> Current Job Title
              </Label>
              <Input
                value={formData.current_position}
                onChange={(e) => setFormData({...formData, current_position: e.target.value})}
                placeholder="e.g., Senior Product Manager"
                className={`h-12 mt-2 ${errors.current_position ? 'border-red-500' : ''}`}
              />
              {errors.current_position && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.current_position}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <span className="text-2xl">🐊</span> Industry (max 3)
              </Label>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleIndustryToggle(industry)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.industries?.includes(industry)
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
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
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <span className="text-2xl">🐊</span> Primary Goal – What are you most excited to help Gator students with?
              </Label>
              <div className="space-y-2">
                {primaryGoals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setFormData({...formData, primary_goal: goal.id})}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      formData.primary_goal === goal.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {goal.label}
                  </button>
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
          <div className="border-t-2 border-slate-200 pt-8 space-y-6">
            <h3 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Supercharge your impact
            </h3>

            <div>
              <Label className="text-base font-semibold">Dream Companies you can open doors at</Label>
              <Input
                value={formData.dream_companies}
                onChange={(e) => setFormData({...formData, dream_companies: e.target.value})}
                placeholder="e.g., Disney, Microsoft, Tesla (comma-separated)"
                className="h-12 mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Short bio / fun fact (max 140 chars)</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value.slice(0, 140)})}
                placeholder="Ex: Former Disney Imagineer turned VC – happy to help Gators break into entertainment & startups."
                className="mt-2 min-h-[80px]"
                maxLength={140}
              />
              <p className="text-xs text-slate-500 mt-1">{formData.bio?.length || 0}/140 characters</p>
            </div>
          </div>
        </motion.div>

        {/* Sticky CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky bottom-4 mt-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-16 text-xl font-bold shadow-2xl animate-pulse"
            style={{
              backgroundColor: '#FA4616',
              color: '#0021A5'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                Joining the Swarm...
              </>
            ) : (
              'Join the Gator Parent Swarm →'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}