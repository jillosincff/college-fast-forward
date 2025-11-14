import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mail } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import UserAvatar from '@/components/common/UserAvatar';
import { Message } from '@/entities/Message';

/**
 * Private Message Modal Component
 * Allows users to send private messages to job request posters
 */
export default function MessageModal({ isOpen, onClose, request, poster }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: `Re: ${request?.title || request?.role || 'Your job request'}`,
    message: '',
    senderName: user?.full_name || '',
    senderEmail: user?.email || ''
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle message submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: 'Please enter a message',
        description: 'Your message cannot be empty.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.senderName.trim()) {
      toast({
        title: 'Please enter your name',
        description: 'Your name is required to send a message.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the message record
      await Message.create({
        recipient_email: request.created_by,
        sender_email: user?.email || formData.senderEmail,
        post_id: request.id,
        post_title: request.title || request.role,
        subject: formData.subject,
        body: `From: ${formData.senderName} (${formData.senderEmail})\n\nRegarding: ${request.title || request.role}\n\n${formData.message}`
      });

      toast({
        title: '📧 Message Sent!',
        description: `Your message has been sent to ${poster?.full_name || 'the poster'}.`,
      });

      // Track the event
      trackEvent('private_message_sent', {
        requestId: request.id,
        recipientEmail: request.created_by,
        hasSubject: Boolean(formData.subject.trim())
      });

      // Reset form and close modal
      setFormData({
        subject: `Re: ${request?.title || request?.role || 'Your job request'}`,
        message: '',
        senderName: user?.full_name || '',
        senderEmail: user?.email || ''
      });
      onClose();

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get role badge styling
   */
  const getRoleBadgeColor = (persona) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      alumni: 'bg-green-100 text-green-800',
      parent: 'bg-purple-100 text-purple-800'
    };
    return colors[persona] || colors.student;
  };

  if (!isOpen || !request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Private Message
          </DialogTitle>
          <DialogDescription>
            Reach out privately about this request
          </DialogDescription>
        </DialogHeader>

        {/* Recipient Info */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex items-start gap-3">
            <UserAvatar 
              user={poster} 
              className="w-12 h-12" 
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">
                  {poster?.full_name || 'Fellow Gator'}
                </h3>
                <Badge className={`text-xs ${getRoleBadgeColor(poster?.persona)}`}>
                  {poster?.persona || 'student'}
                </Badge>
                {poster?.graduation_year && (
                  <span className="text-xs text-slate-500">
                    UF '{String(poster.graduation_year).slice(-2)}
                  </span>
                )}
              </div>
              <h4 className="font-medium text-slate-800 mb-2">
                "{request.title || request.role}"
              </h4>
              <p className="text-sm text-slate-600 line-clamp-2">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Your Name</Label>
              <Input
                id="senderName"
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Your Email</Label>
              <Input
                id="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting || Boolean(user?.email)}
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Message subject"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Hi! I saw your request and wanted to reach out about..."
              rows={6}
              required
              disabled={isSubmitting}
              className="resize-none"
              maxLength={2000}
            />
            <p className="text-sm text-slate-500 mt-2">
              {formData.message.length}/2000 characters • Be specific about how you can help or what you'd like to discuss.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.message.trim() || !formData.senderName.trim()}
              className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
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
        </form>
      </DialogContent>
    </Dialog>
  );
}