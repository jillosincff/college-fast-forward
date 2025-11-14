
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Intro } from '@/entities/Intro'; // Changed from IntroOffer to Intro
import { Loader2 } from 'lucide-react';
// Assuming these are available in your project, adjust paths if necessary
import { base44 } from '@/lib/base44'; 
import { trackEvent } from '@/lib/analytics'; 

export default function IntroContactModal({ isOpen, onClose, request, user, onSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isSaving
  const [formData, setFormData] = useState({
    name: '', // Maps to recipient_name
    company: '', // Maps to recipient_company
    role: '', // Maps to recipient_role
    linkedin_url: '', // Kept for existing UI, not directly used in Intro.create payload
    email: '', // Maps to recipient_email
    notes: '', // Maps to custom_note
    relationship: '', // New field for the Intro entity
    ask_type: 'email', // New field for the Intro entity, default to email
    cc_student: true, // New field for the Intro entity, default to true
    cc_helper: true, // New field for the Intro entity, default to true
  });

  const validateForm = () => {
    if (!formData.name) {
      toast({
        title: "Name is required",
        variant: "destructive"
      });
      return false;
    }
    // Add more validation rules here if needed, e.g., email format based on ask_type
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) {
        // If user is null, it indicates an issue with authentication or props, prevent submission.
        if (!user) {
            toast({
                title: "Authentication error",
                description: "User information is missing. Please log in again.",
                variant: "destructive",
            });
        }
        return;
    }

    setIsSubmitting(true);
    try {
      const introData = {
        request_id: request.id,
        student_id: request.created_by,
        helper_user_id: user.id,
        recipient_name: formData.name, // Mapped from existing 'name' input
        recipient_email: formData.email, // Mapped from existing 'email' input
        recipient_company: formData.company, // Mapped from existing 'company' input
        recipient_role: formData.role, // Mapped from existing 'role' input
        relationship: formData.relationship,
        ask_type: formData.ask_type,
        custom_note: formData.notes, // Mapped from existing 'notes' textarea
        cc_student: formData.cc_student,
        cc_helper: formData.cc_helper,
        delivery_mode: 'platform_email',
        status: 'pending',
      };

      const intro = await Intro.create(introData);

      // Send email notification to student
      try {
        await base44.functions.invoke('sendIntroNotification', {
          intro: intro, // Pass the created intro object
          request: request,
          helper: user
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Do not block intro creation if notification fails, but log it.
        toast({
          title: "Warning: Notification failed",
          description: "Introduction was sent, but the notification email could not be sent. Please check logs.",
          variant: "default", // Use a default variant or specific warning variant
        });
      }

      // Track the intro
      await base44.functions.invoke('trackIntro', { requestId: request.id });

      toast({
        title: "✅ Introduction Sent!",
        description: "The student will be notified and can follow up.",
      });

      trackEvent('intro_made', {
        request_id: request.id,
        ask_type: formData.ask_type,
        relationship: formData.relationship,
      });

      onClose();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Failed to create intro:', error);
      toast({
        title: "Error",
        description: "Failed to send introduction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a contact for {request?.poster?.full_name?.split(' ')[0]}</DialogTitle>
          <DialogDescription>
            We'll let the student know you're offering to connect them. You can always edit or cancel later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Alex P." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Jefferies" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Title</Label>
            <Input id="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Analyst" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" value={formData.linkedin_url} onChange={e => setFormData({...formData, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/yourname" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Another UF alum who just started in IB..." />
          </div>
          {/* New fields are part of formData but no specific UI elements for them were provided in the outline.
              These would typically be implemented as RadioGroup, Checkbox, Select, etc. for 'relationship', 'ask_type', 'cc_student', 'cc_helper'.
              For now, their values are managed via state defaults or by implicit user interaction if UI was added elsewhere. */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Intro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
