
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { JobRequest } from "@/entities/JobRequest";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useParams, navigate } from "@/components/utils/navigation";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { Progress } from "@/components/ui/progress";
import ConfettiCelebration from "@/components/viral/ConfettiCelebration";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing", "Sales",
  "Consulting", "Real Estate", "Non-Profit", "Government", "Media", "Entertainment",
  "Retail", "Manufacturing", "Engineering", "Law", "Hospitality", "Other"
];

const JOB_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full Time" }
];

// Mock AI-suggested options based on user's profile
// This is now less critical as we show the full list
const getAISuggestions = (user) => {
  if (user?.major?.toLowerCase().includes("computer science")) {
    return {
      industries: ["Technology", "Finance", "Healthcare"],
      jobTypes: ["internship", "full_time"]
    };
  }
  if (user?.major?.toLowerCase().includes("finance")) {
    return {
      industries: ["Finance", "Consulting", "Real Estate"],
      jobTypes: ["internship", "full_time"]
    };
  }
  return {
    industries: INDUSTRIES,
    jobTypes: JOB_TYPES.map(jt => jt.value)
  };
};

export default function SimpleJobRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const editId = params.editId;

  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [jobType, setJobType] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [locationPreference, setLocationPreference] = useState(user?.location || "");
  const [targetHelpers, setTargetHelpers] = useState({ alumni: true, parents: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Load existing request for editing
  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      setIsLoading(true);
      
      JobRequest.filter({ id: editId }, undefined, 1)
        .then(requests => {
          if (requests && requests.length > 0) {
            const request = requests[0];
            // Check if user owns this request
            if (request.created_by !== user?.email) {
              toast({
                title: "Access Denied",
                description: "You can only edit your own requests.",
                variant: "destructive",
              });
              navigate('Dashboard');
              return;
            }
            
            // Load the data into form
            setRole(request.role || "");
            setDescription(request.description || "");
            setTargetIndustry(request.target_industry || "");
            setJobType(request.job_type || "");
            setTargetCompany(request.target_company || "");
            setLocationPreference(request.location_preference || "");
            setResumeUrl(request.resume_url || "");
            
            if (request.target_helpers && Array.isArray(request.target_helpers)) {
              setTargetHelpers({
                alumni: request.target_helpers.includes('alumni'),
                parents: request.target_helpers.includes('parents')
              });
            }
          } else {
            toast({
              title: "Request Not Found",
              description: "The request you're trying to edit could not be found.",
              variant: "destructive",
            });
            navigate('Dashboard');
          }
        })
        .catch(error => {
          console.error('Error loading request:', error);
          toast({
            title: "Error Loading Request",
            description: "There was an error loading your request for editing.",
            variant: "destructive",
          });
          navigate('Dashboard');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editId, user, toast]);

  const aiSuggestions = getAISuggestions(user);

  const validate = () => {
    const newErrors = {};
    if (!role.trim()) newErrors.role = "Role is required.";
    if (description.trim().length < 20) newErrors.description = "Description must be at least 20 characters.";
    if (!targetIndustry) newErrors.industry = "Please select an industry.";
    if (!jobType) newErrors.jobType = "Please select a job type.";
    if (!locationPreference.trim()) newErrors.location = "Location preference is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResumeChange = async (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 10 : 90));
    }, 200);

    try {
      const response = await UploadFile({ file });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setResumeUrl(response.file_url);
      setTimeout(() => {
        toast({ title: "✅ Resume uploaded!", description: "Your resume is now attached to your request." });
        setIsUploadingResume(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploadingResume(false);
      setResumeFile(null);
      toast({ title: "Upload failed", description: "There was an error uploading your resume. Please try again.", variant: "destructive" });
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeUrl("");
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Please fix the errors", description: "Fill in all required fields before submitting.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedHelpers = Object.keys(targetHelpers).filter(key => targetHelpers[key]);
      const requestData = {
        role,
        title: role,
        description,
        target_industry: targetIndustry,
        target_company: targetCompany,
        job_type: jobType,
        role_type: jobType,
        location_preference: locationPreference,
        resume_url: resumeUrl || "",
        status: 'active',
        target_helpers: selectedHelpers,
      };

      if (isEditing) {
        await JobRequest.update(editId, requestData);
        toast({
          title: "✅ Request Updated!",
          description: "Your job request has been successfully updated.",
          duration: 5000,
        });
      } else {
        await JobRequest.create(requestData);
        setShowConfetti(true);
        toast({
          title: "🎉 Request Posted!",
          description: "Your request is live. We're notifying the Gator Network now!",
          duration: 5000,
        });
      }
      
      setTimeout(() => {
        // Trigger dashboard refresh event when navigating back
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        }
        navigate('Dashboard', { tab: 'requests', success: isEditing ? 'request_updated' : 'request_posted' });
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      toast({ 
        title: isEditing ? "Failed to update request" : "Failed to post request", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
    }
  };

  const descriptionLength = description.length;
  const descriptionColor = descriptionLength < 20 ? 'text-red-500' : descriptionLength > 450 ? 'text-orange-500' : 'text-slate-500';

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-white rounded-lg space-y-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg space-y-8">
      <ConfettiCelebration trigger={showConfetti} duration={4000} />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="role" className="font-semibold text-slate-700">Role You're Seeking *</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Software Engineer Intern" className="mt-2 h-11 focus-within:border-blue-500 focus-within:ring-blue-500/20" />
              {errors.role && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.role}</p>}
            </div>
            <div>
              <Label htmlFor="target_company" className="font-semibold text-slate-700">Target Companies (Optional)</Label>
              <Input id="target_company" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="e.g., Google, Nike, a local startup" className="mt-2 h-11 focus-within:border-blue-500" />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="font-semibold text-slate-700">Detailed Description *</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tell the network about your background, what you're looking for, and how they can help..." 
              className="mt-2 h-36 focus-within:border-blue-500"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              {errors.description && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.description}</p>}
              <p className={`text-xs ${descriptionColor} mt-1 ml-auto`}>{descriptionLength}/500 characters</p>
            </div>
          </div>
        </div>

        {/* Targeting Section */}
        <div className="space-y-6 border-t border-slate-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-slate-700">Target Industry *</Label>
              <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                <SelectTrigger className="mt-2 h-11 focus-within:border-blue-500"><SelectValue placeholder="Select an industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.industry}</p>}
            </div>
            <div>
              <Label className="font-semibold text-slate-700">Job Type *</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="mt-2 h-11 focus-within:border-blue-500"><SelectValue placeholder="Select a job type" /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.jobType && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.jobType}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="location_preference" className="font-semibold text-slate-700">Location Preference *</Label>
            <Input id="location_preference" value={locationPreference} onChange={(e) => setLocationPreference(e.target.value)} placeholder="e.g., San Francisco, Remote, Florida" className="mt-2 h-11 focus-within:border-blue-500" />
            {errors.location && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.location}</p>}
          </div>

          <div>
             <Label className="font-semibold text-slate-700 block mb-3">Target Helpers</Label>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg flex-1">
                  <Switch id="target-alumni" checked={targetHelpers.alumni} onCheckedChange={(checked) => setTargetHelpers(p => ({...p, alumni: checked}))} />
                  <Label htmlFor="target-alumni" className="cursor-pointer">Alumni</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg flex-1">
                  <Switch id="target-parents" checked={targetHelpers.parents} onCheckedChange={(checked) => setTargetHelpers(p => ({...p, parents: checked}))} />
                  <Label htmlFor="target-parents" className="cursor-pointer">Parents</Label>
                </div>
             </div>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="space-y-2 border-t border-slate-200 pt-8">
          <Label className="font-semibold text-slate-700">Resume (Highly Recommended)</Label>
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
              onDrop={handleDrop}
            >
              {isUploadingResume ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                  <p className="text-sm text-slate-600">Uploading {resumeFile?.name}...</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : resumeUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{resumeFile?.name || "Resume uploaded"}</p>
                      <p className="text-sm text-green-700">Ready to share!</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveResume} className="text-slate-500 hover:text-red-600"><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">Drag & drop or <span className="font-semibold text-blue-600">browse files</span></p>
                  <p className="text-xs text-slate-500">PDF or Word, max 5MB</p>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeChange(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="resume-upload" />
                </div>
              )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-slate-500 text-center cursor-help">💡 Tip: Including a resume increases responses by 50%!</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>A resume gives helpers the context to provide relevant advice.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex justify-end items-center gap-4 pt-8 border-t border-slate-200/80">
          <Button type="button" variant="outline" onClick={() => navigate('Dashboard')} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || isUploadingResume} className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white min-w-[120px]">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? "Update Request" : "Post Request")}
          </Button>
        </div>
      </form>
    </div>
  );
}
