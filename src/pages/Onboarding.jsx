import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Briefcase, Linkedin, Handshake, LogOut, AlertTriangle, Sparkles, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { trackEvent } from '@/components/utils/analytics';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { navigate } from '@/components/utils/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';
import { linkStudentsToParent } from '@/functions/linkStudentsToParent';

// --- Step Components ---

const WelcomeStep = ({ onNext, userName = 'Gator' }) => {
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#0021A5', '#FA4616', '#FF6B35', '#004E98'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-lg relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 to-white opacity-40"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, black 40%, transparent 100%)',
        }}
      ></div>
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <span className="text-5xl">🐊</span>
          </div>
        </motion.div>

        {showContent && (
          <>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Welcome, {userName}! 🎉
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 mb-6 max-w-lg mx-auto"
            >
              You're now part of the Gator village! Let's set up your profile so you can start helping students.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 text-orange-600 mb-8"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Takes just 2 minutes</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={onNext}
                className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Let's Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to capitalize names
const capitalizeName = (name) => {
  if (!name) return '';
  return name.trim().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const WorkInfoStep = ({ onNext, onBack, parentData, setParentData }) => {
  const {
    first_name = '',
    last_name = '',
    current_position = '',
    current_company = '',
    industry = '',
    location = ''
  } = parentData;

  const [errors, setErrors] = useState({});

  // Both first and last name are required
  const canContinue = first_name.trim() &&
                      !first_name.includes('@') &&
                      last_name.trim() &&
                      !last_name.includes('@');

  const industries = [
    "Marketing",
    "Finance",
    "Tech",
    "Healthcare",
    "Education",
    "Government",
    "Non-profit",
    "Real Estate",
    "Legal",
    "Automotive",
    "Retail",
    "Construction",
    "Manufacturing",
    "Other"
  ];

  const handleFieldChange = (field, value) => {
    let finalValue = value;

    // Capitalize first and last names
    if (field === 'first_name' || field === 'last_name') {
      finalValue = capitalizeName(value);
    }

    setParentData(prevData => {
      const newData = { ...prevData, [field]: finalValue };

      // Auto-construct full_name
      if (field === 'first_name' || field === 'last_name') {
        const currentFirstName = field === 'first_name' ? finalValue : prevData.first_name;
        const currentLastName = field === 'last_name' ? finalValue : prevData.last_name;
        if (currentFirstName && currentLastName) {
          newData.full_name = `${currentFirstName.trim()} ${currentLastName.trim()}`;
        } else {
          newData.full_name = `${currentFirstName.trim()} ${currentLastName.trim()}`.trim();
        }
      }
      return newData;
    });

    // Clear errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const newErrors = {};

    if (!first_name || !first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (first_name.includes('@')) {
      newErrors.first_name = 'Please enter your first name, not your email';
    }

    if (!last_name || !last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (last_name.includes('@')) {
      newErrors.last_name = 'Please enter your last name, not your email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Ensure full_name is correctly set for tracking if not already updated by handleFieldChange
    const updatedFullName = `${first_name.trim()} ${last_name.trim()}`;
    if (parentData.full_name !== updatedFullName) {
        setParentData(prevData => ({ ...prevData, full_name: updatedFullName }));
    }

    trackEvent('parent_onboarding_work_info_completed');
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
        <Briefcase className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Tell us about yourself
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
        Help us understand your background so students can discover opportunities and reach out for advice.
      </p>

      <div className="max-w-md mx-auto space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first-name">First Name *</Label>
            <Input
              id="first-name"
              value={first_name}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="e.g., Sarah"
              className={`h-12 mt-1 ${errors.first_name ? 'border-red-300' : ''}`}
            />
            {errors.first_name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.first_name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="last-name">Last Name *</Label>
            <Input
              id="last-name"
              value={last_name}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
              placeholder="e.g., Smith"
              className={`h-12 mt-1 ${errors.last_name ? 'border-red-300' : ''}`}
            />
            {errors.last_name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="job-title">Current Job Title</Label>
          <Input
            id="job-title"
            value={current_position}
            onChange={(e) => handleFieldChange('current_position', e.target.value)}
            placeholder="e.g., Senior Marketing Manager (or leave blank)"
            className="h-12 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company">Current Employer / Company</Label>
          <Input
            id="company"
            value={current_company}
            onChange={(e) => handleFieldChange('current_company', e.target.value)}
            placeholder="e.g., PwC (or leave blank)"
            className="h-12 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={industry} onValueChange={(value) => handleFieldChange('industry', value)}>
            <SelectTrigger id="industry" className="h-12 mt-1">
              <SelectValue placeholder="Select your industry (optional)" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location / Metro Area</Label>
          <Input id="location" value={location} onChange={(e) => handleFieldChange('location', e.target.value)} placeholder="e.g., Miami, FL" className="h-12 mt-1" />
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={handleNext} disabled={!canContinue} className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl">
          Next <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

const LinkStudentsStep = ({ onNext, onBack, parentData, setParentData }) => {
  const [studentInputs, setStudentInputs] = useState(['']);

  const addStudentInput = () => {
    setStudentInputs([...studentInputs, '']);
  };

  const removeStudentInput = (index) => {
    const newInputs = studentInputs.filter((_, i) => i !== index);
    setStudentInputs(newInputs.length > 0 ? newInputs : ['']); // Ensure at least one input field remains
  };

  const updateStudentInput = (index, value) => {
    const newInputs = [...studentInputs];
    newInputs[index] = value;
    setStudentInputs(newInputs);
  };

  const handleNext = () => {
    const validInputs = studentInputs.filter(input => input.trim());
    setParentData({ ...parentData, student_links: validInputs });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
        <UserPlus className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Link Your Student(s)
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
        Enter your student's name or email to unlock <strong>Parent Power Boost</strong> — when you post a job, their requests get starred ⭐ for 14 days!
      </p>

      <div className="max-w-md mx-auto space-y-4 text-left">
        {studentInputs.map((input, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => updateStudentInput(index, e.target.value)}
              placeholder="Enter student's name or @ufl.edu email"
              className="h-12 flex-1"
            />
            {studentInputs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStudentInput(index)}
                className="h-12 w-12 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={addStudentInput}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Another Student
        </Button>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> You can link multiple students. When you post opportunities, all their job requests will be boosted to the top!
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={handleNext} className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl">
          Next <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};


const OptionalExtrasStep = ({ onFinish, onBack, parentData, setParentData }) => {
  const { linkedin_url = '', ways_to_help = [], description_of_work = '' } = parentData;

  const helpOptions = [
    { id: 'introduce', label: 'Introduce students to my network' },
    { id: 'share_leads', label: 'Share job or internship leads' },
    { id: 'resume_feedback', label: 'Offer resume feedback' },
    { id: 'career_advice', label: 'Provide career advice / mentoring' }
  ];

  const handleHelpToggle = (optionId) => {
    const newHelpOptions = ways_to_help.includes(optionId)
      ? ways_to_help.filter(id => id !== optionId)
      : [...ways_to_help, optionId];
    setParentData({ ...parentData, ways_to_help: newHelpOptions });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
        <Handshake className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Add a little more (optional)
      </h1>
      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
        These details make it even easier for students to connect with you.
      </p>

      <div className="max-w-md mx-auto space-y-6 text-left">
        <div>
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <div className="relative mt-1">
             <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input id="linkedin" value={linkedin_url} onChange={(e) => setParentData({ ...parentData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourname" className="h-12 pl-10" />
          </div>
        </div>
        <div>
          <Label>Ways I Can Help</Label>
          <div className="mt-2 space-y-3">
            {helpOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Checkbox id={option.id} checked={ways_to_help.includes(option.id)} onCheckedChange={() => handleHelpToggle(option.id)} />
                <Label htmlFor={option.id} className="font-normal text-sm cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="description_of_work">Briefly explain what you do</Label>
          <Textarea
            id="description_of_work"
            value={description_of_work}
            onChange={(e) => setParentData({ ...parentData, description_of_work: e.target.value })}
            placeholder="e.g., I lead a team of software engineers building innovative AI products at Google."
            className="mt-1 min-h-[80px]"
          />
          <p className="text-xs text-slate-500 mt-1">This helps students understand what you do and how you can help.</p>
        </div>
        <div>
          <Label>Gator Directory</Label>
          <div className="flex items-center justify-between mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="pr-4">
              <p className="font-medium text-sm text-slate-800">Appear in the public directory</p>
              <p className="text-xs text-slate-700">Allow students and alumni to find your profile and request help.</p>
            </div>
            <Switch
              checked={parentData.includeInDirectory}
              onCheckedChange={(checked) => setParentData({ ...parentData, includeInDirectory: checked })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={onFinish} className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl">
          Finish
        </Button>
      </div>
    </motion.div>
  );
};


// --- Main Onboarding Component ---

export default function Onboarding() {
  const { user, logout, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Updated from 3 to 4
  const { toast } = useToast();

  const [parentData, setParentData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    full_name: user?.full_name || '', // Will be derived from first/last
    current_position: user?.current_position || '',
    current_company: user?.current_company || '',
    industry: user?.industry || '',
    location: user?.location || '',
    linkedin_url: user?.linkedin_url || '',
    ways_to_help: user?.ways_to_help || [],
    description_of_work: user?.description_of_work || '',
    includeInDirectory: user?.includeInDirectory !== false, // Default to true if not explicitly false
    student_links: [], // New field for student links
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    trackEvent('parent_onboarding_completed', {
      parentId: user.id,
      ...parentData
    });
    try {
      // Ensure names are properly capitalized
      const capitalizedFirstName = capitalizeName(parentData.first_name);
      const capitalizedLastName = capitalizeName(parentData.last_name);
      const fullName = `${capitalizedFirstName} ${capitalizedLastName}`.trim();

      const payload = {
        ...parentData,
        first_name: capitalizedFirstName,
        last_name: capitalizedLastName,
        full_name: fullName,
        onboarding_completed: true,
      };
      await User.updateMyUserData(payload);

      // Link students if provided
      if (parentData.student_links && parentData.student_links.length > 0) {
        try {
          const { data } = await linkStudentsToParent({
            studentEmailsOrNames: parentData.student_links
          });
          
          if (data.linkedCount > 0) {
            toast({
              title: "Students linked!",
              description: `Successfully linked ${data.linkedCount} student(s). They'll benefit from your Parent Power Boost! ⭐`,
            });
          }
        } catch (err) {
          console.error('Failed to link students:', err);
          toast({
            title: "Student Linking Error",
            description: "Some students could not be linked. Please try again later or contact support.",
            variant: "destructive",
          });
        }
      }

      await refreshUser();

      // Clear invite session data after successful onboarding
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_type');
      sessionStorage.removeItem('pending_inviter_name');

      console.log('✅ Profile saved! Redirecting to expertise sharing...');
      toast({
        title: "Almost Done! 🎉",
        description: "One more step to help students find you."
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('ShareExpertise');
      }, 1000);

    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Onboarding Failed",
        description: "There was an issue saving your profile. Please try again.",
        variant: "destructive",
      });
      navigate('ParentDashboard'); // Still navigate to dashboard, but user might need to re-onboard
    }
  };

  // Function to render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} userName={capitalizeName(user?.first_name || user?.full_name?.split(' ')[0] || 'Gator')} />;
      case 2:
        return <WorkInfoStep onNext={nextStep} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      case 3:
        return <LinkStudentsStep onNext={nextStep} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      case 4:
        return <OptionalExtrasStep onFinish={handleFinish} onBack={prevStep} parentData={parentData} setParentData={setParentData} />;
      default:
        return <WelcomeStep onNext={nextStep} userName={capitalizeName(user?.first_name || user?.full_name?.split(' ')[0] || 'Gator')} />;
    }
  };

  React.useEffect(() => {
    trackEvent('parent_onboarding_started', { parentId: user?.id });
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 z-10"
        onClick={() => logout()}
        aria-label="Start Over"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Start Over
      </Button>

      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="bg-slate-200 rounded-full h-2 w-full max-w-md mx-auto">
            <motion.div
              className="bg-[var(--uf-orange)] h-2 rounded-full"
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}