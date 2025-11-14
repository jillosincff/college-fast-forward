
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { 
  Star, 
  Plus, 
  Trash2, 
  Video, 
  Link as LinkIcon, 
  Upload, 
  Sparkles, 
  Loader2,
  X,
  CheckCircle2,
  Save,
  MapPin,
  Linkedin,
  FileText,
  Camera,
  User as UserIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const LOOKING_FOR_OPTIONS = ['Full-time', 'Internship', 'Part-time', 'Research', 'Mentorship', 'Projects'];

const LOCATION_OPTIONS = [
  'Gainesville, FL', 'Remote', 'Hybrid', 'Orlando, FL', 'Tampa, FL', 
  'Miami, FL', 'Jacksonville, FL', 'Atlanta, GA', 'New York, NY', 
  'Austin, TX', 'San Francisco, CA', 'Open to Relocation'
];

const SKILLS_SUGGESTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL', 
  'Data Analysis', 'Project Management', 'Marketing', 'Design',
  'Communication', 'Leadership', 'Problem Solving', 'Teamwork'
];

const BIO_MAX_CHARS = 500;
const PROJECT_DESC_MAX_CHARS = 300;

// Simple Progress Bar Component
const ProgressBar = ({ value }) => (
  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-[#0021A5] to-[#FA4616] transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Simple Label Component
const Label = ({ children, htmlFor, className = '' }) => (
  <label 
    htmlFor={htmlFor} 
    className={`text-sm font-medium text-slate-700 ${className}`}
  >
    {children}
  </label>
);

export default function TalentSpotlightSetupModal({ isOpen, onClose, user, onSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const videoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    talent_spotlight_enabled: user?.talent_spotlight_enabled || false,
    bio: user?.bio || '',
    profile_image_url: user?.profile_image_url || '',
    skills_showcase: user?.skills_showcase || [],
    projects: user?.projects || [],
    video_intro_url: user?.video_intro_url || '',
    portfolio_url: user?.portfolio_url || '',
    linkedin_url: user?.linkedin_url || '',
    resume_url: user?.resume_url || '',
    looking_for: user?.looking_for || [],
    location: user?.location || '',
    available_start: user?.available_start || '',
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    url: '',
    image_url: ''
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 8; // Increased from 7 to 8 to include photo

    if (formData.profile_image_url) completed++;
    if (formData.bio && formData.bio.length > 0) completed++;
    if (formData.skills_showcase.length > 0) completed++;
    if (formData.looking_for.length > 0) completed++;
    if (formData.location) completed++;
    if (formData.projects.length > 0 || formData.portfolio_url) completed++;
    if (formData.video_intro_url || formData.resume_url || formData.linkedin_url) completed++;
    if (formData.available_start) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Photo must be under 5MB.'
      });
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, or WebP image.'
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image_url: file_url }));
      toast({
        title: '✅ Photo uploaded!',
        description: 'Your profile photo is ready.'
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload photo. Please try again.'
      });
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const acceptedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Video must be under 50MB. Try compressing it first.'
      });
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an MP4, MOV, or WebM video.'
      });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, video_intro_url: file_url }));
      toast({
        title: '✅ Video uploaded!',
        description: 'Your intro video is ready.'
      });
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload video. Please try again.'
      });
    } finally {
      setIsUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Resume must be under 5MB.'
      });
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF or Word document.'
      });
      return;
    }

    setIsUploadingResume(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, resume_url: file_url }));
      toast({
        title: '✅ Resume uploaded!',
        description: 'Your resume is ready.'
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload resume. Please try again.'
      });
    } finally {
      setIsUploadingResume(false);
      if (e.target) e.target.value = '';
    }
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide at least a title and description.'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...newProject, id: Date.now() }]
    }));

    setNewProject({ title: '', description: '', url: '', image_url: '' });
    setShowProjectForm(false);
    
    toast({
      title: '✅ Project added!',
      description: 'Your project has been added to your showcase.'
    });
  };

  const removeProject = (projectId) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId)
    }));
  };

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills_showcase.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills_showcase: [...prev.skills_showcase, trimmedSkill]
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills_showcase: prev.skills_showcase.filter(s => s !== skill)
    }));
  };

  const toggleLookingFor = (option) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(option)
        ? prev.looking_for.filter(o => o !== option)
        : [...prev.looking_for, option]
    }));
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await User.updateMyUserData({
        ...formData,
        talent_spotlight_enabled: false // Save as draft, not enabled yet
      });

      toast({
        title: '💾 Draft Saved',
        description: 'Your changes have been saved. Come back anytime to finish!'
      });
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your draft. Please try again.'
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.profile_image_url) {
      toast({
        variant: 'destructive',
        title: 'Profile Photo Missing',
        description: 'Please upload a profile photo.'
      });
      return;
    }

    if (!formData.bio || formData.bio.trim().length < 50) {
      toast({
        variant: 'destructive',
        title: 'Bio Too Short',
        description: 'Please write at least 50 characters about yourself.'
      });
      return;
    }

    if (formData.skills_showcase.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Add Skills',
        description: 'Please add at least one skill to showcase.'
      });
      return;
    }

    if (formData.looking_for.length === 0) {
      toast({
        variant: 'destructive',
        title: 'What Are You Seeking?',
        description: 'Please select what type of opportunities you\'re looking for.'
      });
      return;
    }

    if (!formData.location) {
      toast({
        variant: 'destructive',
        title: 'Location Required',
        description: 'Please select your preferred work location.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await User.updateMyUserData({
        ...formData,
        talent_spotlight_enabled: true,
        spotlight_enabled_date: new Date().toISOString()
      });

      toast({
        title: '🎉 You\'re Featured!',
        description: 'Your Talent Spotlight profile is now live for 30 days!'
      });

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not activate your spotlight. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Set Up Your Talent Spotlight
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Get discovered by 70,000+ alumni and parents looking to hire
              </DialogDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">Profile Completion</span>
              <span className="text-[#0021A5] font-bold">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
            <p className="text-xs text-slate-500">
              {progress < 100 ? 
                `Add ${100 - progress}% more to get featured` : 
                'Great! Your profile is ready to go live 🎉'
              }
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-[#0021A5]">Personal Info</h3>
              {formData.bio && formData.bio.length >= 50 && formData.profile_image_url && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Profile Photo */}
            <div className="space-y-2">
              <Label>
                <Camera className="w-4 h-4 inline mr-1" />
                Profile Photo
              </Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-slate-200">
                  <AvatarImage src={formData.profile_image_url} alt="Profile" />
                  <AvatarFallback className="bg-[#0021A5] text-white text-2xl">
                    {user?.first_name?.[0] || user?.full_name?.[0] || <UserIcon className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    aria-label="Upload profile photo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full sm:w-auto"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.profile_image_url ? 'Change Photo' : 'Upload Photo'}
                      </>
                    )}
                  </Button>
                  {formData.profile_image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, profile_image_url: '' }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-slate-500">JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                About You * <span className="text-slate-500 font-normal">
                  (Tell employers what makes you unique)
                </span>
              </Label>
              <Textarea
                id="bio"
                placeholder="I'm a Computer Science student passionate about building apps that solve real problems. In my free time, I love hackathons and contributing to open source..."
                value={formData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX_CHARS) {
                    setFormData(prev => ({ ...prev, bio: e.target.value }));
                  }
                }}
                className="min-h-[120px] resize-none"
                aria-label="Tell us about yourself"
              />
              <div className="flex justify-between text-xs">
                <span className={formData.bio.length < 50 ? 'text-orange-600' : 'text-green-600'}>
                  {formData.bio.length < 50 ? 
                    `${50 - formData.bio.length} more characters needed` : 
                    '✓ Looks good!'
                  }
                </span>
                <span className="text-slate-500">
                  {formData.bio.length}/{BIO_MAX_CHARS}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-[#0021A5]">Skills & Expertise</h3>
              {formData.skills_showcase.length > 0 && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="skills">
                Your Top Skills * <span className="text-slate-500 font-normal">
                  (Add at least 3-5 skills)
                </span>
              </Label>
              
              {/* Skills Input */}
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g., JavaScript, Leadership, Data Analysis"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                  aria-label="Add a skill"
                />
                <Button
                  type="button"
                  onClick={() => addSkill(newSkill)}
                  disabled={!newSkill.trim()}
                  className="bg-[#0021A5] hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Skill Suggestions */}
              {formData.skills_showcase.length < 5 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">Quick add:</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_SUGGESTIONS
                      .filter(skill => !formData.skills_showcase.includes(skill))
                      .slice(0, 8)
                      .map(skill => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 hover:border-[#0021A5] transition-colors"
                          onClick={() => addSkill(skill)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Selected Skills */}
              {formData.skills_showcase.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                  {formData.skills_showcase.map(skill => (
                    <Badge
                      key={skill}
                      className="bg-[#0021A5] text-white hover:bg-blue-700 pr-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Intent & Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-[#0021A5]">What You're Seeking</h3>
              {formData.looking_for.length > 0 && formData.location && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Looking For */}
            <div className="space-y-3">
              <Label>
                I'm Looking For * <span className="text-slate-500 font-normal">
                  (Select all that apply)
                </span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOOKING_FOR_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleLookingFor(option)}
                    className={`p-3 rounded-lg border-2 transition-all text-left font-medium ${
                      formData.looking_for.includes(option)
                        ? 'border-[#0021A5] bg-blue-50 text-[#0021A5]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                    aria-pressed={formData.looking_for.includes(option)}
                  >
                    <div className="flex items-center gap-2">
                      {formData.looking_for.includes(option) && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Preference */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Preferred Work Location *
              </Label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0021A5] focus:border-transparent"
                aria-label="Select your preferred work location"
              >
                <option value="">Select location...</option>
                {LOCATION_OPTIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Available Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date">
                When Can You Start?
              </Label>
              <Input
                id="start-date"
                type="month"
                value={formData.available_start}
                onChange={(e) => setFormData(prev => ({ ...prev, available_start: e.target.value }))}
                min={new Date().toISOString().slice(0, 7)}
                aria-label="Select when you can start"
              />
            </div>
          </div>

          {/* Showcase Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-[#0021A5]">Showcase Your Work</h3>
              {(formData.projects.length > 0 || formData.portfolio_url || formData.video_intro_url || formData.resume_url || formData.linkedin_url) && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Professional Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">
                  <Linkedin className="w-4 h-4 inline mr-1 text-[#0077B5]" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  aria-label="Enter your LinkedIn profile URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Portfolio / Website
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  aria-label="Enter your portfolio or website URL"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resume Upload */}
              <div className="space-y-2">
                <Label>
                  <FileText className="w-4 h-4 inline mr-1" />
                  Resume / CV
                </Label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  aria-label="Upload your resume"
                />
                {formData.resume_url ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 flex-1">Resume uploaded</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, resume_url: '' }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={isUploadingResume}
                  >
                    {isUploadingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                )}
                <p className="text-xs text-slate-500">PDF or Word, max 5MB</p>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <Label>
                  <Video className="w-4 h-4 inline mr-1" />
                  30-Second Video Intro
                </Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                  aria-label="Upload a video introduction"
                />
                {formData.video_intro_url ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 flex-1">Video uploaded</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, video_intro_url: '' }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                  >
                    {isUploadingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                )}
                <p className="text-xs text-slate-500">MP4/MOV/WebM, max 50MB</p>
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Featured Projects</Label>
                {!showProjectForm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProjectForm(true)}
                    className="text-[#0021A5] border-[#0021A5]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Project
                  </Button>
                )}
              </div>

              {/* Project Form */}
              {showProjectForm && (
                <div className="p-4 border-2 border-[#0021A5] rounded-lg bg-blue-50 space-y-3">
                  <Input
                    placeholder="Project Title *"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Describe what you built and the impact it had *"
                    value={newProject.description}
                    onChange={(e) => {
                      if (e.target.value.length <= PROJECT_DESC_MAX_CHARS) {
                        setNewProject(prev => ({ ...prev, description: e.target.value }));
                      }
                    }}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="text-xs text-slate-500 text-right">
                    {newProject.description.length}/{PROJECT_DESC_MAX_CHARS}
                  </div>
                  <Input
                    placeholder="Project URL (GitHub, live demo, etc.)"
                    type="url"
                    value={newProject.url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={addProject}
                      className="flex-1 bg-[#0021A5] hover:bg-blue-700"
                    >
                      Add Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowProjectForm(false);
                        setNewProject({ title: '', description: '', url: '', image_url: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Project List */}
              {formData.projects.length > 0 && (
                <div className="space-y-2">
                  {formData.projects.map((project, index) => (
                    <div
                      key={project.id || index}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{project.title}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{project.description}</p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0021A5] hover:underline flex items-center gap-1"
                        >
                          View Project <LinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-200 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={saveDraft}
            disabled={isSavingDraft}
            className="flex-1 border-[#0021A5] text-[#0021A5] hover:bg-blue-50"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || progress < 70}
            className="flex-1 bg-gradient-to-r from-[#FA4616] to-[#0021A5] hover:opacity-90 text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Go Live! 🎉
              </>
            )}
          </Button>
        </div>

        {progress < 70 && (
          <p className="text-center text-sm text-orange-600 mt-2">
            Complete at least 70% of your profile to get featured
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
