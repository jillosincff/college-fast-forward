import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X, ChevronDown, ChevronUp, CheckCircle2, Shield } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { useToast } from '@/components/ui/use-toast';
import { useForm, Controller } from 'react-hook-form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Alumni career help types
const ALUMNI_HELP_TYPES = [
  { value: 'new_job_search', label: 'New job search', icon: '💼' },
  { value: 'career_transition', label: 'Career transition', icon: '🔄' },
  { value: 'industry_shift', label: 'Industry shift', icon: '🌐' },
  { value: 'business_advice', label: 'Business advice', icon: '💡' },
];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Consulting', 
  'Marketing & Advertising', 'Real Estate', 'Legal', 'Education',
  'Manufacturing', 'Retail', 'Media & Entertainment', 'Non-Profit', 'Other'
];

export default function AlumniCareerRequestForm({
  onSubmit,
  isSubmitting = false,
  initialData = null,
  user
}) {
  const { toast } = useToast();
  const [selectedHelpTypes, setSelectedHelpTypes] = useState(
    initialData?.alumni_help_type ? [initialData.alumni_help_type] : []
  );
  const [resumeUrl, setResumeUrl] = useState(initialData?.resume_url || '');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      role: '',
      target_industry: '',
      description: '',
      job_type: 'full_time',
      work_mode: 'on_site',
      location_city: '',
      location_state: '',
      start_timing: 'immediate',
      target_company: '',
      relocation_ok: false,
      visa_needed: false,
      linkedin_url: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        role: initialData.role || '',
        target_industry: initialData.target_industry || '',
        description: initialData.description || '',
        job_type: initialData.job_type || 'full_time',
        work_mode: initialData.work_mode || 'on_site',
        location_city: initialData.location_city || '',
        location_state: initialData.location_state || '',
        start_timing: initialData.start_timing || 'immediate',
        target_company: initialData.target_company || '',
        relocation_ok: initialData.relocation_ok || false,
        visa_needed: initialData.visa_needed || false,
        linkedin_url: initialData.linkedin_url || user?.linkedin_url || ''
      });
      setResumeUrl(initialData.resume_url || '');
    } else {
      reset({ linkedin_url: user?.linkedin_url || '' });
    }
  }, [initialData, reset, user]);

  const toggleHelpType = (value) => {
    setSelectedHelpTypes(prev => 
      prev.includes(value) 
        ? prev.filter(t => t !== value)
        : [...prev, value]
    );
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please use a file smaller than 5MB.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    setResumeUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 300);

    try {
      const response = await UploadFile({ file });
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const fileUrl = response?.file_url || response?.data?.file_url;
      if (fileUrl) {
        setResumeUrl(fileUrl);
        toast({ title: "✅ Resume uploaded" });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Upload failed",
        description: "Please try again or provide a link instead.",
        variant: "destructive"
      });
    } finally {
      e.target.value = '';
      setTimeout(() => {
        setResumeUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFormSubmit = async (data) => {
    if (selectedHelpTypes.length === 0) {
      toast({
        title: "Please select at least one help type",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      ...data,
      resume_url: resumeUrl,
      title: data.role || `${selectedHelpTypes.map(t => ALUMNI_HELP_TYPES.find(h => h.value === t)?.label).join(', ')} - Career Request`,
      target_helpers: ['alumni', 'parents'],
      is_anonymous: false,
      is_alumni_career_request: true,
      alumni_help_type: selectedHelpTypes[0],
      help_types: selectedHelpTypes
    };
    
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Section 1: Help Type Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-slate-900">
            What type of help are you looking for? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-slate-500 mt-1">Select all that apply</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {ALUMNI_HELP_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleHelpType(type.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-medium transition-all ${
                selectedHelpTypes.includes(type.value)
                  ? 'border-[#0021A5] bg-[#0021A5] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-[#0021A5] hover:bg-blue-50'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>Your request is private — not visible to students.</span>
      </div>

      {/* Section 2: What are you looking for? */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-lg font-semibold text-slate-900">What are you looking for?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700">Role/Position <span className="text-slate-400 text-sm font-normal">(optional)</span></Label>
            <Input
              {...register("role")}
              placeholder="e.g., VP of Marketing, Board Member"
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-700">Industry <span className="text-slate-400 text-sm font-normal">(optional)</span></Label>
            <Controller
              name="target_industry"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Target Company <span className="text-slate-400 text-sm font-normal">(optional)</span></Label>
          <Input
            {...register("target_company")}
            placeholder="e.g., Google, specific startups, Fortune 500"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">
            Tell us more about what you're looking for <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register("description", {
              required: "Please describe what you're looking for",
              minLength: { value: 30, message: "Please provide at least 30 characters" }
            })}
            placeholder="Be specific about your goals, experience, and what kind of help would be most valuable..."
            className="min-h-[140px] resize-none"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
          
          {/* Collapsible Examples */}
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-[#0021A5] hover:underline flex items-center gap-1 mt-2"
          >
            {showExamples ? 'Hide examples' : 'Show example descriptions'}
            {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showExamples && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 space-y-3">
              <div>
                <span className="font-medium text-slate-700">Example 1:</span> "I'm a 15-year marketing executive looking to transition into a C-suite role at a tech company. I've led teams of 50+ and managed $20M budgets. Looking for intros to hiring managers or board members at mid-stage startups."
              </div>
              <div>
                <span className="font-medium text-slate-700">Example 2:</span> "After 10 years in corporate law, I'm exploring a shift to the non-profit sector. Would love to connect with anyone who's made a similar transition or knows of executive director opportunities."
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Job Preferences (Collapsible) */}
      <Collapsible open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-slate-700">Job Preferences</span>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm">Optional details</span>
              {preferencesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Opportunity Type</Label>
              <Controller
                name="job_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="board">Board Position</SelectItem>
                      <SelectItem value="advisory">Advisory Role</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Work Mode</Label>
              <Controller
                name="work_mode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_site">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Start Timeline</Label>
              <Controller
                name="start_timing"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately</SelectItem>
                      <SelectItem value="this_quarter">This quarter</SelectItem>
                      <SelectItem value="next_quarter">Next quarter</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Preferred City</Label>
              <Input
                {...register("location_city")}
                placeholder="e.g., Miami, New York"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Preferred State</Label>
              <Input
                {...register("location_state")}
                placeholder="e.g., Florida, California"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Controller
                name="relocation_ok"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="relocation_ok"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="relocation_ok" className="text-slate-700 cursor-pointer">Open to relocating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="visa_needed"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="visa_needed"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="visa_needed" className="text-slate-700 cursor-pointer">Need visa sponsorship</Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 4: Your Information */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-lg font-semibold text-slate-900">Your Information</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">LinkedIn URL <span className="text-slate-400 text-sm font-normal">(optional)</span></Label>
          <Input
            {...register("linkedin_url", {
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL"
              }
            })}
            placeholder="https://linkedin.com/in/your-profile"
            className="h-11"
          />
          {errors.linkedin_url && (
            <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Resume <span className="text-slate-400 text-sm font-normal">(optional)</span></Label>
          {resumeUrl ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-medium text-green-800">✅ Resume uploaded</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setResumeUrl('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
                disabled={resumeUploading}
              />
              <Label htmlFor="resume" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {resumeUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      <div className="w-full max-w-xs">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#0021A5] h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 mt-1 block">Uploading... {uploadProgress}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Upload resume or CV</span>
                      <span className="text-xs text-slate-500">PDF, DOC, DOCX (Max 5MB)</span>
                    </>
                  )}
                </div>
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || selectedHelpTypes.length === 0}
          className="w-full bg-[#0021A5] hover:bg-[#001a7a] text-white h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post My Request'
          )}
        </Button>
      </div>

      {/* Footer Privacy Note */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-2">
        <Shield className="w-4 h-4" />
        <span>Your career request will only be visible to other parents and alumni in our network — not to students.</span>
      </div>
    </form>
  );
}