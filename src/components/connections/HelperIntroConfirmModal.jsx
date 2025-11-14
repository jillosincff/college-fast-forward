import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { updateIntroStatus } from '@/functions/updateIntroStatus';
import { Loader2, Share, X } from 'lucide-react';

export default function HelperIntroConfirmModal({ isOpen, onClose, intro, studentName }) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  
  const [formData, setFormData] = useState({
    name: intro?.candidate_name || '',
    company: intro?.candidate_company || '',
    role: intro?.candidate_role || '',
    linkedin_url: intro?.candidate_linkedin || '',
    email: intro?.candidate_email || '',
    notes: intro?.candidate_notes || '',
  });

  const [askBeforeReShare, setAskBeforeReShare] = useState(true);

  React.useEffect(() => {
    if (intro) {
      setFormData({
        name: intro.candidate_name || '',
        company: intro.candidate_company || '',
        role: intro.candidate_role || '',
        linkedin_url: intro.candidate_linkedin || '',
        email: intro.candidate_email || '',
        notes: intro.candidate_notes || '',
      });
    }
  }, [intro]);

  const handleShare = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.linkedin_url.trim() && !formData.email.trim()) {
      toast({
        title: "Contact info required",
        description: "Please provide at least LinkedIn or email.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      await updateIntroStatus({
        introId: intro.id,
        status: 'SHARED',
        candidate: {
          name: formData.name,
          company: formData.company,
          role: formData.role,
          linkedin_url: formData.linkedin_url,
          email: formData.email,
          notes: formData.notes,
        }
      });

      toast({
        title: "✅ Intro shared!",
        description: `Contact details for ${formData.name} have been sent to ${studentName}.`,
      });

      onClose();
    } catch (error) {
      console.error('Error sharing intro:', error);
      toast({
        title: "Error sharing intro",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await updateIntroStatus({
        introId: intro.id,
        status: 'DECLINED'
      });

      toast({
        title: "Intro declined",
        description: "No worries. You can offer another contact anytime.",
      });

      onClose();
    } catch (error) {
      console.error('Error declining intro:', error);
      toast({
        title: "Error declining intro",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeclining(false);
    }
  };

  if (!intro) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this introduction?</DialogTitle>
          <DialogDescription>
            Share contact details for {formData.name} with {studentName}? You can review or edit before sending.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Alex Perez" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={formData.company} 
                onChange={e => setFormData({...formData, company: e.target.value})} 
                placeholder="Jefferies" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                placeholder="Analyst" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input 
              id="linkedin" 
              value={formData.linkedin_url} 
              onChange={e => setFormData({...formData, linkedin_url: e.target.value})} 
              placeholder="https://linkedin.com/in/alexp" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="alex@jefferies.com" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              placeholder="UF '22, sports finance interest"
              rows={2}
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="re-share"
              checked={askBeforeReShare}
              onCheckedChange={setAskBeforeReShare}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="re-share" className="text-sm font-medium">
                Ask me before re-sharing my contact's info again
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll check with you before sharing this contact with other students.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDecline} disabled={isDeclining || isSharing}>
            {isDeclining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            Decline
          </Button>
          <Button onClick={handleShare} disabled={isSharing || isDeclining}>
            {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share className="mr-2 h-4 w-4" />}
            Share Intro
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          We'll send these details to {studentName}. You can withdraw later.
        </p>
      </DialogContent>
    </Dialog>
  );
}