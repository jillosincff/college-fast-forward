import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '@/entities/Message';
import { useToast } from '@/components/ui/use-toast';
import UserAvatar from '@/components/common/UserAvatar';

export default function ReachOutModal({ isOpen, onClose, student, currentUser }) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    opportunityType: 'job',
    subject: '',
    message: ''
  });

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both subject and message',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      await Message.create({
        recipient_email: student.email,
        sender_email: currentUser.email,
        subject: formData.subject,
        body: formData.message,
        is_read: false
      });

      toast({
        title: 'Message Sent! 🎉',
        description: `Your opportunity has been sent to ${student.full_name}`,
      });

      onClose();
      setFormData({ opportunityType: 'job', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to Send',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const generateSubject = (type) => {
    const types = {
      job: `Exciting Job Opportunity for ${student.major || 'Gator'} Student`,
      internship: `Internship Opportunity at ${currentUser.current_company || 'Our Company'}`,
      mentorship: `Mentorship Opportunity from ${currentUser.full_name}`,
      project: `Collaboration Opportunity for ${student.full_name}`,
      referral: `Referral Opportunity from ${currentUser.full_name}`
    };
    return types[type] || 'Opportunity from Gator Network';
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      opportunityType: type,
      subject: generateSubject(type)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Reach Out to {student.full_name}</DialogTitle>
          <DialogDescription>
            Share an opportunity, offer mentorship, or start a conversation with this talented Gator
          </DialogDescription>
        </DialogHeader>

        {/* Student Preview */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
          <UserAvatar user={student} className="w-16 h-16" />
          <div>
            <h4 className="font-bold text-lg">{student.full_name}</h4>
            <p className="text-sm text-gray-600">{student.major} • Class of {student.graduation_year}</p>
            {student.looking_for && student.looking_for.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Looking for: {student.looking_for.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Opportunity Type */}
          <div>
            <Label>What are you offering?</Label>
            <Select 
              value={formData.opportunityType} 
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">Full-time Job</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="project">Project Collaboration</SelectItem>
                <SelectItem value="referral">Referral/Introduction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label>Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="e.g., Software Engineering Internship at Google"
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label>Your Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder={`Hi ${student.first_name || student.full_name},\n\nI came across your profile on the Gator Talent Spotlight and was impressed by...\n\nI'd love to discuss an opportunity that might be a great fit for you.\n\nBest regards,\n${currentUser.full_name}`}
              className="mt-1 h-48"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pro tip: Mention specific skills or projects from their profile to show genuine interest
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending}
            className="bg-[#FA4616] hover:bg-[#E03D00]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}