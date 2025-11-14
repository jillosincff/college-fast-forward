import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Opportunity } from '@/entities/Opportunity';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Send, Wand2, Link as LinkIcon, Plus } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

export default function OpportunityForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [showCompensation, setShowCompensation] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    posted_by_role: 'direct_hirer',
    opportunity_type: '',
    level: 'any',
    location_type: '',
    city: '',
    state: '',
    description: '',
    compensation_min: '',
    compensation_max: '',
    compensation_period: 'year',
    apply_method: 'email',
    apply_url: '',
    apply_email: '',
    source_link: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.company_name) {
      toast({
        title: "Please enter a title and company first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSuggesting(true);
    setSuggestedDescription('');
    
    const prompt = `Generate a concise, friendly, and appealing job description for a "${formData.title}" role at "${formData.company_name}". It's for a community of college students. Keep it under 150 words. Focus on the opportunity and what a student will learn.`;
    
    try {
      const result = await InvokeLLM({ prompt });
      setSuggestedDescription(result);
    } catch (error) {
      console.error("AI description generation failed:", error);
      toast({ title: "AI suggestion failed. Please try again.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSubmit = {
      ...formData,
      compensation_min: formData.compensation_min ? Number(formData.compensation_min) : null,
      compensation_max: formData.compensation_max ? Number(formData.compensation_max) : null,
    };
    
    // Clear irrelevant fields based on role
    if (formData.posted_by_role === 'sharer') {
      dataToSubmit.apply_email = '';
      dataToSubmit.apply_method = 'external'; // Assume external if sharing
      dataToSubmit.apply_url = formData.source_link;
    } else {
      dataToSubmit.source_link = '';
    }

    try {
      await Opportunity.create(dataToSubmit);
      toast({
        title: "🎉 Success!",
        description: "Your opportunity has been posted.",
      });
      navigate('ParentDashboard');
    } catch (error) {
      console.error("Failed to create opportunity:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem posting your opportunity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSharer = formData.posted_by_role === 'sharer';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--uf-orange)] to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Share an Opportunity</h1>
          <p className="text-slate-600">Help a Gator find their next big thing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Role Selection */}
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
            <Label className="text-lg font-semibold text-slate-800">First, how are you involved?</Label>
            <RadioGroup
              value={formData.posted_by_role}
              onValueChange={(value) => handleInputChange('posted_by_role', value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                <RadioGroupItem value="direct_hirer" id="hirer" />
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900">I'm the Hirer/Owner</span>
                  <p className="text-sm text-slate-600">You are directly involved in hiring for this role.</p>
                </div>
              </Label>
              <Label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                <RadioGroupItem value="sharer" id="sharer" />
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900">I'm Just Sharing</span>
                  <p className="text-sm text-slate-600">You found this opportunity and want to pass it along.</p>
                </div>
              </Label>
            </RadioGroup>
          </div>
          
          <AnimatePresence>
            <motion.div
              key={formData.posted_by_role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Software Engineering Intern" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input id="company_name" value={formData.company_name} onChange={(e) => handleInputChange('company_name', e.target.value)} placeholder="e.g., Microsoft" required />
                </div>
              </div>

              {/* Opportunity Type and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="opportunity_type">Opportunity Type *</Label>
                  <Select onValueChange={(value) => handleInputChange('opportunity_type', value)} value={formData.opportunity_type} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="shadowing">Job Shadowing</SelectItem>
                      <SelectItem value="project">Project Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Experience Level</Label>
                  <Select onValueChange={(value) => handleInputChange('level', value)} value={formData.level}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Level</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Work Location */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location_type">Work Location *</Label>
                  <Select onValueChange={(value) => handleInputChange('location_type', value)} value={formData.location_type} required>
                    <SelectTrigger><SelectValue placeholder="Select work location" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.location_type === 'onsite' || formData.location_type === 'hybrid') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="e.g., Tampa" required /></div>
                    <div className="space-y-2"><Label htmlFor="state">State *</Label><Input id="state" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="e.g., FL" required /></div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <div className="relative">
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe the opportunity, responsibilities, and what makes it special..." className="min-h-[120px] pr-28" required />
                  <Button type="button" size="sm" variant="outline" onClick={handleGenerateDescription} disabled={isSuggesting} className="absolute top-2 right-2 group">
                    {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wand2 className="w-4 h-4 mr-2 text-orange-500 group-hover:animate-pulse" /> AI Assist</>}
                  </Button>
                </div>
                {suggestedDescription && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 mt-2">
                    <p className="font-semibold mb-2">AI Suggestion:</p>
                    <p className="whitespace-pre-wrap">{suggestedDescription}</p>
                    <Button type="button" size="sm" variant="link" className="p-0 h-auto" onClick={() => handleInputChange('description', suggestedDescription)}>Use this text</Button>
                  </div>
                )}
              </div>
              
              {/* Compensation */}
              <div className="space-y-4">
                <Label>Compensation (Optional)</Label>
                {!showCompensation ? (
                  <Button type="button" variant="outline" onClick={() => setShowCompensation(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Compensation Details
                  </Button>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-2"><Label htmlFor="compensation_min">Min</Label><Input id="compensation_min" type="number" value={formData.compensation_min} onChange={(e) => handleInputChange('compensation_min', e.target.value)} placeholder="50000" /></div>
                    <div className="space-y-2"><Label htmlFor="compensation_max">Max</Label><Input id="compensation_max" type="number" value={formData.compensation_max} onChange={(e) => handleInputChange('compensation_max', e.target.value)} placeholder="70000" /></div>
                    <div className="space-y-2"><Label htmlFor="compensation_period">Period</Label><Select onValueChange={(value) => handleInputChange('compensation_period', value)} value={formData.compensation_period}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hour">Per Hour</SelectItem><SelectItem value="year">Per Year</SelectItem><SelectItem value="project">Per Project</SelectItem><SelectItem value="stipend">Stipend</SelectItem></SelectContent></Select></div>
                  </div>
                )}
              </div>

              {/* Conditional Application Fields */}
              {isSharer ? (
                <div className="space-y-2">
                  <Label htmlFor="source_link">Link to Opportunity *</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="source_link" type="url" value={formData.source_link} onChange={(e) => handleInputChange('source_link', e.target.value)} placeholder="https://linkedin.com/jobs/..." required className="pl-9" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apply_method">How should students apply? *</Label>
                    <Select onValueChange={(value) => handleInputChange('apply_method', value)} value={formData.apply_method} required>
                      <SelectTrigger><SelectValue placeholder="Select application method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email me directly</SelectItem>
                        <SelectItem value="external">External application link</SelectItem>
                        <SelectItem value="message">Message through platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.apply_method === 'email' && <div className="space-y-2"><Label htmlFor="apply_email">Application Email *</Label><Input id="apply_email" type="email" value={formData.apply_email} onChange={(e) => handleInputChange('apply_email', e.target.value)} placeholder="careers@company.com" required /></div>}
                  {formData.apply_method === 'external' && <div className="space-y-2"><Label htmlFor="apply_url">Application URL *</Label><Input id="apply_url" type="url" value={formData.apply_url} onChange={(e) => handleInputChange('apply_url', e.target.value)} placeholder="https://company.com/careers/position" required /></div>}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button type="submit" disabled={isSubmitting} className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Posting...</> : <><Send className="w-5 h-5 mr-2" />Post Opportunity</>}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}