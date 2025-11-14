
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  ArrowRight, 
  Send, 
  Copy, 
  Loader2,
  CheckCircle,
  Edit3,
  Eye
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from '@/components/utils/analytics';

const relationshipOptions = [
  { value: 'colleague', label: 'Colleague' },
  { value: 'former_manager', label: 'Former Manager' },
  { value: 'friend', label: 'Friend' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'other', label: 'Other' }
];

const askTypes = [
  { value: 'warm_intro', label: 'Warm intro for a quick chat' },
  { value: 'job_opening', label: 'Share a relevant opening' },
  { value: 'resume_feedback', label: 'Resume feedback' },
  { value: 'forward_teammate', label: 'Forward to the right teammate' }
];

export default function IntroModal({ isOpen, onClose, request, student, helper, onIntroSent }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Step 1 - Contact Info
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [relationship, setRelationship] = useState('');
  const [addMeToThread, setAddMeToThread] = useState(true);
  
  // Step 2 - Context
  const [askType, setAskType] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [attachResume, setAttachResume] = useState(true);
  
  // Step 3 - Preview
  const [emailPreview, setEmailPreview] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [consent, setConsent] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setStep(1);
      setLoading(false);
      setSuccess(false);
      setRecipientName('');
      setRecipientEmail('');
      setRecipientCompany('');
      setRecipientRole('');
      setRelationship('');
      setAddMeToThread(true);
      setAskType('');
      setCustomNote('');
      setAttachResume(true);
      setEmailPreview('');
      setIsEditingEmail(false);
      setConsent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 3) {
      generateEmailPreview();
    }
  }, [step, recipientName, recipientEmail, recipientCompany, askType, customNote, relationship, attachResume, request, student, helper, isEditingEmail]);

  const generateEmailPreview = () => {
    const studentName = student?.full_name || 'Gator Student';
    const helperName = helper?.full_name || 'A Fellow Gator';
    const roleDescription = request?.role || 'opportunities';
    const industry = request?.target_industry || 'their field';
    
    const relationshipText = relationship === 'colleague' ? 'colleague' :
                           relationship === 'former_manager' ? 'former manager' :
                           relationship === 'friend' ? 'friend' :
                           relationship === 'recruiter' ? 'recruiter' :
                           'connection';

    const askDescription = askTypes.find(ask => ask.value === askType)?.label || 'guidance';

    const preview = `Subject: Intro: ${studentName} → ${recipientCompany || 'your team'} (via Gator Network)

Hi ${recipientName},

Hope you're doing well! I'm reaching out because I know a talented UF student who could benefit from your expertise.

${studentName} is a ${student?.major || 'UF student'} looking for ${roleDescription} opportunities in ${industry}. They're part of our Gator network, and I thought you might be able to help with ${askDescription.toLowerCase()}.

${customNote ? `\n${customNote}\n` : ''}

A bit about ${studentName}:
• ${student?.major || 'UF Student'} ${student?.graduation_year ? `(Class of ${student.graduation_year})` : ''}
• Looking for: ${roleDescription}
• Interested in: ${industry}
${(attachResume && request?.resume_url) ? `• Resume: ${request.resume_url}` : ''}

Would you be open to a brief conversation or able to point them in the right direction?

Thanks for considering - you know how much the Gator network means to all of us!

Best,
${helperName}
${relationship ? `\n(${relationshipText} at ${recipientCompany || 'your company'})` : ''}

---
This introduction was facilitated by College Fast Forward, connecting the UF community.`;

    // Only set the preview if we're not currently editing
    if (!isEditingEmail) {
      setEmailPreview(preview);
    }
  };

  const validateStep1 = () => {
    if (!recipientName.trim()) {
      toast({ title: "Please enter the recipient's name", variant: "destructive" });
      return false;
    }
    if (!recipientEmail.trim()) {
      toast({ title: "Please enter the recipient's email", variant: "destructive" });
      return false;
    }
    if (!relationship) {
      toast({ title: "Please select your relationship", variant: "destructive" });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!askType) {
      toast({ title: "Please select what you're asking for", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    setStep(step + 1);
    trackEvent('intro_step_completed', { 
      step, 
      requestId: request?.id,
      relationship,
      askType 
    });
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleToggleEdit = () => {
    if (!isEditingEmail) {
      // Switching to edit mode
      setIsEditingEmail(true);
      trackEvent('email_preview_edit_started', { requestId: request?.id });
    } else {
      // Switching to preview mode
      setIsEditingEmail(false);
      trackEvent('email_preview_edit_finished', { requestId: request?.id });
    }
  };

  const handleRegenerate = () => {
    setIsEditingEmail(false);
    generateEmailPreview();
    toast({
      title: "Email Regenerated",
      description: "The email has been regenerated with your current settings.",
    });
    trackEvent('email_preview_regenerated', { requestId: request?.id });
  };

  const handleSendIntro = async () => {
    if (!consent) {
      toast({ title: "Please confirm you have permission to contact this person", variant: "destructive" });
      return;
    }

    if (!emailPreview.trim()) {
      toast({ title: "Email content cannot be empty", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Here you would typically call your API to send the intro
      // For now, we'll simulate the success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the intro sent callback to update stats
      if (onIntroSent) {
        await onIntroSent();
      }

      trackEvent('intro_sent', {
        requestId: request?.id,
        relationship,
        askType,
        method: 'platform_email',
        was_edited: isEditingEmail
      });

      setSuccess(true);
      toast({
        title: "Intro Sent!",
        description: "Your introduction has been sent successfully.",
      });

    } catch (error) {
      console.error("Error sending intro:", error);
      toast({
        title: "Error",
        description: "There was an error sending the introduction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForwardableDraft = () => {
    navigator.clipboard.writeText(emailPreview);
    
    const subject = `Intro: ${student?.full_name} → ${recipientCompany || 'your team'} (via Gator Network)`;
    const body = emailPreview.split('\n').slice(1).join('\n'); // Remove subject line
    
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    trackEvent('intro_forwardable_generated', {
      requestId: request?.id,
      relationship,
      askType,
      was_edited: isEditingEmail
    });

    toast({
      title: "Draft Copied!",
      description: "Email draft copied to clipboard and opened in your email client.",
    });
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Intro Sent!</h3>
            <p className="text-slate-600 mb-4">Thanks for helping a Gator connect. We'll keep you posted on any updates.</p>
            <div className="flex gap-2 justify-center">
              {/* This button might navigate to a list of sent intros or similar */}
              {/* <Button variant="outline" size="sm">
                View Intros
              </Button> */}
              <Button onClick={onClose} size="sm">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--uf-blue)]" />
            Make an Intro
            <Badge variant="outline" className="ml-2">
              Step {step} of 3
            </Badge>
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {step === 1 && "Who do you want to introduce them to?"}
            {step === 2 && "We'll draft the perfect note—edit anything."}
            {step === 3 && "Review and send your introduction."}
          </p>
        </DialogHeader>

        {/* Request Summary */}
        <Card className="bg-slate-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--uf-blue)] to-[var(--uf-orange)] rounded-full flex items-center justify-center text-white font-semibold">
                {student?.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{request?.role}</h3>
                <p className="text-sm text-slate-600">by {student?.full_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="recipientEmail">Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientCompany">Company / Organization</Label>
                <Input
                  id="recipientCompany"
                  value={recipientCompany}
                  onChange={(e) => setRecipientCompany(e.target.value)}
                  placeholder="Company Inc."
                />
              </div>
              <div>
                <Label htmlFor="recipientRole">Their Role</Label>
                <Input
                  id="recipientRole"
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value)}
                  placeholder="Senior Manager"
                />
              </div>
            </div>

            <div>
              <Label>Your Relationship *</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="How do you know them?" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="addMeToThread" 
                checked={addMeToThread}
                onCheckedChange={setAddMeToThread}
              />
              <Label htmlFor="addMeToThread" className="text-sm">
                Add me to the email thread (recommended)
              </Label>
            </div>
          </div>
        )}

        {/* Step 2: Context */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>What are you asking for? *</Label>
              <Select value={askType} onValueChange={setAskType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the type of help" />
                </SelectTrigger>
                <SelectContent>
                  {askTypes.map((ask) => (
                    <SelectItem key={ask.value} value={ask.value}>
                      {ask.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customNote">Additional Context (Optional)</Label>
              <Textarea
                id="customNote"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Add any specific details about why this connection would be valuable..."
                className="h-24"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="attachResume" 
                checked={attachResume}
                onCheckedChange={setAttachResume}
              />
              <Label htmlFor="attachResume" className="text-sm">
                Include link to student's resume
              </Label>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Edit */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Email Preview</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleEdit}
                    className="text-xs"
                  >
                    {isEditingEmail ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                  {isEditingEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      className="text-xs"
                    >
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
              
              {isEditingEmail ? (
                <Textarea
                  value={emailPreview}
                  onChange={(e) => setEmailPreview(e.target.value)}
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Edit your email..."
                />
              ) : (
                <div className="bg-slate-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {emailPreview}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={setConsent}
              />
              <Label htmlFor="consent" className="text-sm">
                I confirm I have permission to contact this person
              </Label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleForwardableDraft}
                  disabled={loading || !consent || !emailPreview.trim()}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy & Open Mail
                </Button>
                <Button 
                  onClick={handleSendIntro}
                  disabled={loading || !consent || !emailPreview.trim()}
                  className="bg-[var(--uf-blue)] hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Intro
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
