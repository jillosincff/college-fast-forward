import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X, AlertCircle, Sparkles } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { useToast } from '@/components/ui/use-toast';
import { useForm, Controller } from 'react-hook-form';

export default function JobRequestForm({
  onSubmit,
  isSubmitting = false,
  initialData = null,
  user,
  isParentQuestion = false
}) {
  // Only allow anonymous posting for actual parents (not students, even if isParentQuestion is passed)
  const isParent = user?.persona === 'parent' || user?.roles?.includes('parent');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
  const { toast } = useToast();
  const [resumeUrl, setResumeUrl] = useState(initialData?.resume_url || '');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      start_timing: 'next_semester',
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
        start_timing: initialData.start_timing || 'next_semester',
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

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size BEFORE attempting upload
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please use a file smaller than 5MB or provide a link to your resume.",
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

    // Progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      console.log('📤 Uploading resume:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Add timeout wrapper
      const uploadWithTimeout = (timeoutMs = 30000) => {
        return Promise.race([
          UploadFile({ file }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout - please try a smaller file or use a link instead')), timeoutMs)
          )
        ]);
      };

      const response = await uploadWithTimeout();
      console.log('📥 Upload response:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Handle different response structures
      let fileUrl = null;
      
      if (response?.file_url) {
        fileUrl = response.file_url;
      } else if (response?.data?.file_url) {
        fileUrl = response.data.file_url;
      } else if (typeof response === 'string' && response.startsWith('http')) {
        fileUrl = response;
      }
      
      if (!fileUrl) {
        console.error('❌ No file URL in response:', response);
        throw new Error('Upload succeeded but no file URL returned');
      }
      
      console.log('✅ Resume uploaded:', fileUrl);
      setResumeUrl(fileUrl);
      
      toast({
        title: "✅ Resume uploaded",
        description: "Your resume has been successfully uploaded.",
      });
      
    } catch (error) {
      console.error('❌ Resume upload error:', error);
      clearInterval(progressInterval);
      
      let errorMessage = 'Failed to upload resume. Please try providing a link to your resume instead (Google Drive, Dropbox, etc.).';
      
      if (error.message?.includes('timeout') || error.message?.includes('Upload timeout')) {
        errorMessage = 'Upload timed out. Please provide a link to your resume for faster processing.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('network')) {
        errorMessage = 'Network error occurred. Please check your connection or provide a resume link instead.';
      } else if (error.message?.includes('413') || error.message?.includes('too large')) {
        errorMessage = 'File is too large. Please provide a link to your resume (5MB max).';
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
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
    const submitData = {
      ...data,
      resume_url: resumeUrl,
      title: data.role,
      target_helpers: ['alumni', 'parents'],
      is_anonymous: isParent ? isAnonymous : false
    };
    
    // Submit the request first
    await onSubmit(submitData);
  };

  const FormField = ({ label, error, children }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.message}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>What are you looking for?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role/Position *" error={errors.role}>
              <Input
                {...register("role", {
                  required: "Role is required",
                  minLength: { value: 3, message: "Role must be at least 3 characters" }
                })}
                placeholder="e.g., Software Engineer, Marketing Intern"
              />
              <p className="text-xs text-slate-500 mt-1">✨ Be specific: "Product Manager" not just "Business job"</p>
            </FormField>
            
            <FormField label="Industry *" error={errors.target_industry}>
              <Input
                {...register("target_industry", {
                  required: "Industry is required",
                  minLength: { value: 3, message: "Industry must be at least 3 characters" }
                })}
                placeholder="e.g., Technology, Finance, Healthcare"
              />
              <p className="text-xs text-slate-500 mt-1">✨ Be specific: "FinTech" or "Med-Tech" not just "Tech"</p>
            </FormField>
          </div>

          <FormField label="Target Company (Optional)" error={errors.target_company}>
            <Input
              {...register("target_company")}
              placeholder="e.g., Google, JPMorgan Chase, or similar companies"
            />
            <p className="text-xs text-slate-500 mt-1">💡 Name specific companies or say "similar to X" - this helps us find the right connections!</p>
          </FormField>

          <FormField label="Tell us more about what you're looking for *" error={errors.description}>
            <Textarea
              {...register("description", {
                required: "Please provide more details",
                minLength: { value: 50, message: "Description must be at least 50 characters - be specific!" }
              })}
              placeholder="Example: 'I'm a CS junior with React & Python experience looking for a summer 2026 SWE internship at a fintech startup. I'm interested in payment systems and would love an intro to anyone in engineering at Stripe/Square, or advice on breaking into fintech. I can also share my portfolio of 3 web apps I've built.'"
              className="h-40"
            />
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-orange-900">
                  <strong>Pro tip:</strong> Include what makes you unique, what kind of help you need (intro, advice, resume review), and your timeline. The more details, the more likely someone will reach out!
                </div>
              </div>
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Opportunity Type *" error={errors.job_type}>
              <Controller
                name="job_type"
                control={control}
                rules={{ required: "Opportunity type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Work Mode *" error={errors.work_mode}>
              <Controller
                name="work_mode"
                control={control}
                rules={{ required: "Work mode is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
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
            </FormField>

            <FormField label="When do you want to start? *" error={errors.start_timing}>
              <Controller
                name="start_timing"
                control={control}
                rules={{ required: "Start timing is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately</SelectItem>
                      <SelectItem value="this_semester">This semester</SelectItem>
                      <SelectItem value="next_semester">Next semester</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Preferred City (Optional)" error={errors.location_city}>
              <Input
                {...register("location_city")}
                placeholder="e.g., Miami, Orlando"
              />
            </FormField>
            <FormField label="Preferred State (Optional)" error={errors.location_state}>
              <Input
                {...register("location_state")}
                placeholder="e.g., Florida, California"
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-6">
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
              <Label htmlFor="relocation_ok">Open to relocating</Label>
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
              <Label htmlFor="visa_needed">Need visa sponsorship</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField label="LinkedIn Profile (Optional)" error={errors.linkedin_url}>
            <Input
              {...register("linkedin_url", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Please enter a valid URL"
                }
              })}
              placeholder="https://linkedin.com/in/your-profile"
            />
            <p className="text-xs text-slate-500 mt-1">💼 Recommended: Helps connections learn about your experience!</p>
          </FormField>

          <div>
            <Label>Resume (Optional but recommended)</Label>
            <div className="mt-2">
              {resumeUrl ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Resume uploaded successfully</span>
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
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
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
                                className="bg-blue-600 h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 mt-1 block">Uploading... {uploadProgress}%</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">
                            Click to upload resume
                          </span>
                          <span className="text-xs text-slate-500">PDF, DOC, or DOCX (Max 5MB)</span>
                          <span className="text-xs text-blue-600 mt-2">💡 Tip: Or paste a Google Drive/Dropbox link in your description</span>
                        </>
                      )}
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Posting Option - Parents Only */}
      {isParent && (
        <Card>
          <CardContent className="pt-6">
            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
              <Checkbox
                id="is_anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(!!checked)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="is_anonymous" className="font-medium text-slate-900 cursor-pointer">
                    Post anonymously
                  </Label>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Your question will show as "Anonymous Parent" instead of your name. Your identity stays private.
                </p>
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  💡 Recommended for sensitive family topics
                </p>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0021A5] hover:bg-[#001a7a] text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Request' : 'Post My Request'
          )}
        </Button>
      </div>

      {/* Helpful note */}
      <div className="text-center text-sm text-slate-600 max-w-md mx-auto">
        <p>📢 Your request will be visible to all UF parents and alumni in our network to maximize your chances of getting help!</p>
      </div>
    </form>
  );
}