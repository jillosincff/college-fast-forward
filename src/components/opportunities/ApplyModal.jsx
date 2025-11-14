
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { Reminder } from '@/entities/Reminder';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { Upload, AlertTriangle, Link as LinkIcon, Loader2, Zap, Briefcase, Info, Send } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const defaultNote = () => [
  "Hi there — I'm a UF student interested in this opportunity. I've attached my resume.",
  "I'm excited about the role because it aligns with my coursework and experience.",
  "Happy to connect for a quick chat. Thank you for your time!"
].join(' ');

export default function ApplyModal({ isOpen, onClose, opportunity, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [note, setNote] = useState(defaultNote());
  const [resumeUrl, setResumeUrl] = useState(user?.resume_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [inputMode, setInputMode] = useState('link');

  // IMPORTANT: For shared/external opportunities, we should never show this modal
  // This is a safety check - the parent component should handle external redirects
  const isExternal = opportunity?.posting_type === 'shared_link';
  const isPlatformApply = opportunity?.posting_type === 'manual_entry' && opportunity?.created_by;
  
  // NEW: Determine who receives the application
  const applicationRecipientEmail = opportunity?.application_email || opportunity?.created_by;
  const applicationRecipientName = opportunity?.application_email 
    ? (opportunity?.contact_name || 'the hiring manager')
    : 'the poster';

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setNote(defaultNote());
      setResumeUrl(user?.resume_url || '');
      setErrors({});
      setUploadError(null);
    }
  }, [isOpen, user?.resume_url]);

  // If this modal was opened for an external opportunity, close it immediately
  // This shouldn't happen, but it's a safety measure
  useEffect(() => {
    if (isOpen && isExternal) {
      console.warn('ApplyModal opened for external opportunity - closing immediately');
      onClose();
    }
  }, [isOpen, isExternal, onClose]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size BEFORE attempting upload
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({ 
        title: 'File too large', 
        description: 'Please use a file smaller than 5MB or paste a link to your resume instead.', 
        variant: 'destructive' 
      });
      e.target.value = '';
      setInputMode('link');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please upload a PDF or DOC file.', 
        variant: 'destructive' 
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const uploadWithTimeout = (timeoutMs = 30000) => {
        return Promise.race([
          base44.integrations.Core.UploadFile({ file }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout - file may be too large')), timeoutMs)
          )
        ]);
      };

      const response = await uploadWithTimeout();
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      let fileUrl = null;
      if (response?.file_url) {
        fileUrl = response.file_url;
      } else if (response?.data?.file_url) {
        fileUrl = response.data.file_url;
      } else if (typeof response === 'string' && response.startsWith('http')) {
        fileUrl = response;
      }
      
      if (!fileUrl) {
        throw new Error('Upload succeeded but no file URL returned');
      }
      
      setResumeUrl(fileUrl);
      toast({ 
        title: '✅ Resume uploaded!',
        description: 'Your resume has been attached.',
        duration: 2000
      });
      
    } catch (error) {
      console.error("❌ Upload error:", error);
      clearInterval(progressInterval);
      
      let errorMessage = 'Upload failed. Please try pasting a public link to your resume instead (recommended for faster submission).';
      
      if (error.message?.includes('timeout') || error.message?.includes('Upload timeout')) {
        errorMessage = 'Upload timed out - your file may be too large. Please paste a link to your resume (Google Drive, Dropbox, etc.) for instant submission.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('network')) {
        errorMessage = 'Network error - please check your connection and try again, or paste a link to your resume instead.';
      } else if (error.message?.includes('413') || error.message?.includes('too large')) {
        errorMessage = 'File is too large. Please paste a link to your resume (Google Drive, Dropbox, etc.).';
      }
      
      setUploadError(errorMessage);
      toast({ 
        title: '❌ Upload Failed', 
        description: errorMessage, 
        variant: 'destructive', 
        duration: 8000 
      });
      
      setInputMode('link');
    } finally {
      e.target.value = '';
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!note || note.trim().length < 10) newErrors.note = 'Please write a short personal note.';
    if (!resumeUrl || !resumeUrl.trim()) newErrors.resumeUrl = 'Please provide your resume.';
    else {
      try { new URL(resumeUrl); }
      catch { newErrors.resumeUrl = 'Please provide a valid URL.'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for this opportunity.",
        variant: "destructive"
      });
      return;
    }
    
    if (!note.trim()) {
      toast({
        title: "Note Required",
        description: "Please add a note explaining why you're interested.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create application record with snapshot of opportunity details
      const applicationData = {
        opportunity_id: opportunity.id,
        applicant_id: user.id,
        method: 'message',
        note: note.trim(),
        resume_url: resumeUrl.trim(),
        status: 'applied',
        opportunity_title: opportunity.title,
        opportunity_company: opportunity.org_name,
        opportunity_type: opportunity.opportunity_type,
        opportunity_deleted: false
      };

      const application = await OpportunityApplication.create(applicationData);

      if (!application || !application.id) {
        throw new Error('Database did not return a valid application object.');
      }
      
      trackEvent('opportunity_application_submitted', { id: opportunity.id, applicationId: application.id });
      
      // FIXED: Send notification to the correct recipient (application_email or created_by)
      if (applicationRecipientEmail) {
        try {
          const applicantName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.full_name || user.email;

          const response = await base44.functions.invoke('sendApplicationNotification', {
            applicationId: application.id,
            posterEmail: applicationRecipientEmail, // FIXED: Now uses application_email if available
            opportunityTitle: opportunity.title,
            opportunityId: opportunity.id,
            applicantName: applicantName,
            applicantEmail: user.email,
            applicationNote: note.trim(),
            resumeUrl: resumeUrl.trim()
          });
          
          if (response?.data?.success) {
            console.log('✅ Notification sent:', response.data);
          }
        } catch (notificationError) {
          console.error('⚠️ Notification failed (silent):', notificationError);
        }
      }
      
      toast({
        title: "🎉 Application Sent!",
        description: `Your application has been sent to ${applicationRecipientName}.`,
      });

      // Set up reminder for 1 week from now
      if (user.id) {
        try {
          const remindAt = new Date();
          remindAt.setDate(remindAt.getDate() + 7);
          
          await Reminder.create({
            user_id: user.id,
            application_id: application.id,
            remind_at: remindAt.toISOString(),
            type: 'application_followup'
          });
        } catch (reminderError) {
          console.warn('⚠️ Failed to create reminder:', reminderError);
        }
      }

      if (onSuccess) {
        onSuccess(opportunity.id);
      }
      
      onClose();
      navigate('MyApplications');

    } catch (error) {
      console.error('❌ Application failed:', error);
      toast({ 
        title: 'Application Failed', 
        description: error.message || "Failed to submit your application. Please try again.",
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || uploading) return;
    onClose();
  };

  // Don't render for external opportunities
  if (isExternal) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {isPlatformApply ? (
              <>
                <Zap className="w-6 h-6 text-violet-600" />
                Apply via Platform
              </>
            ) : (
              <>
                <Briefcase className="w-6 h-6 text-blue-600" />
                Apply to {opportunity?.title}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Opportunity Summary */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {isPlatformApply ? '🐊' : '🔗'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 mb-1">{opportunity?.title}</h3>
              <p className="text-sm text-slate-600">{opportunity?.org_name}</p>
              {isPlatformApply && (
                <div className="mt-2">
                  <Badge className="bg-violet-100 text-violet-800 text-xs">
                    Posted by Gator Helper
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform Apply Info - UPDATED */}
          {isPlatformApply && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-violet-900 mb-1">Direct Platform Application</h4>
                  <p className="text-sm text-violet-700">
                    Your application will be sent directly to <strong>{applicationRecipientName}</strong> at{' '}
                    <strong>{applicationRecipientEmail}</strong> via email and in-platform notification.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Resume Upload */}
          <div>
            <Label className="block text-sm font-semibold text-slate-700 mb-2">
              Resume / CV <span className="text-red-500">*</span>
            </Label>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={inputMode === 'link' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('link')}
                className="flex-1"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Paste Link (Instant)
              </Button>
              <Button
                type="button"
                variant={inputMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('upload')}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>

            {inputMode === 'link' ? (
              <div>
                <Input 
                  value={resumeUrl} 
                  onChange={(e) => setResumeUrl(e.target.value)} 
                  placeholder="https://drive.google.com/..." 
                  className={errors.resumeUrl ? 'border-red-500' : ''} 
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Recommended: Paste a Google Drive, Dropbox, or personal website link for instant submission
                </p>
              </div>
            ) : (
              <div>
                {resumeUrl && !uploading ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium text-green-800">✓ Resume attached</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeUrl('')}
                      className="h-auto p-1"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                            <span className="text-sm font-medium text-slate-700">
                              Click to upload resume
                            </span>
                            <span className="text-xs text-slate-500">PDF, DOC, or DOCX (Max 5MB)</span>
                            <span className="text-xs text-amber-600 mt-1">⚠️ Large files may take 5-10 seconds to upload</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
            
            {errors.resumeUrl && <p className="text-xs text-red-600 mt-1">{errors.resumeUrl}</p>}
            {uploadError && (
              <div className="mt-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md flex items-start gap-2 border border-yellow-200">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{uploadError}</span>
              </div>
            )}
          </div>

          {/* Application Note */}
          <div>
            <Label className="block text-sm font-semibold text-slate-700 mb-2">
              {isPlatformApply ? 'Message to Poster' : 'Cover Letter / Note'} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isPlatformApply 
                ? "Tell the poster why you're interested and how you can contribute..." 
                : "Why are you interested in this opportunity?"}
              rows={6}
              className={errors.note ? 'border-red-500 w-full' : 'w-full'}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {isPlatformApply 
                ? 'This message will be sent directly to the poster along with your resume' 
                : 'Make your application stand out with a personalized message'}
            </p>
            {errors.note && <p className="text-xs text-red-600 mt-1">{errors.note}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading || !resumeUrl || !note.trim()}
              className={cn(
                "flex-1 font-bold",
                isPlatformApply 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" 
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Send to {applicationRecipientName}
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
