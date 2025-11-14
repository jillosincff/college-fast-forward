import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Core } from '@/integrations/Core';

export default function ReportContentModal({ isOpen, onClose, contentType, contentId, contentTitle }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and provide a description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Send report to admin email
      await Core.SendEmail({
        to: 'admin@gatorconnect.app', // Replace with actual admin email
        subject: `Content Report: ${contentType} - ${contentTitle}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px;">
            <h2 style="color: #dc2626;">Content Report</h2>
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
              <p><strong>Content Type:</strong> ${contentType}</p>
              <p><strong>Content ID:</strong> ${contentId}</p>
              <p><strong>Content Title:</strong> ${contentTitle}</p>
              <p><strong>Reported By:</strong> ${user?.full_name || 'Anonymous'} (${user?.email || 'No email'})</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <div style="margin: 16px 0;">
              <h3>Description:</h3>
              <p style="background-color: #f9f9f9; padding: 12px; border-radius: 4px;">${description}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This report was submitted on ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        from_name: 'GatorConnect Reports'
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep GatorConnect safe. We'll review this content."
      });

      setReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report Content
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for Report</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="scam">Potential Scam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about why you're reporting this content..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}