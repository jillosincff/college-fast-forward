import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { trackEvent } from '@/components/utils/analytics';
import { getDisplayName, getFirstName } from '@/components/utils/nameUtils';

export default function MessageUserModal({ isOpen, onClose, recipientUser }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (recipientUser && isOpen) {
      const firstName = getFirstName(recipientUser);
      setMessage(`Hi ${firstName}, \n\n`);
    }
  }, [recipientUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !recipientUser) return;

    setIsSending(true);
    trackEvent('send_message_submitted', { recipient_persona: recipientUser?.persona });

    try {
      console.log('📧 Creating message...');
      
      const senderName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name || user.email;

      const recipientName = getDisplayName(recipientUser);
      
      // Create the message
      const newMessage = await Message.create({
        sender_email: user.email,
        recipient_email: recipientUser.email,
        subject: `A message from ${senderName}`,
        body: message,
      });

      console.log('✅ Message created with ID:', newMessage.id);

      // Show success immediately
      toast({
        title: "✅ Message Sent!",
        description: `Your message to ${recipientName} has been delivered.`,
        duration: 3000,
      });

      // Clear form and close modal immediately
      setMessage('');
      setIsSending(false);
      onClose();

      // Send email notification asynchronously with all data (no DB queries)
      console.log('📧 Triggering email notification (with full data)...');
      setTimeout(async () => {
        try {
          await base44.functions.invoke('sendMessageNotification', {
            messageId: newMessage.id,
            senderName: senderName,
            senderEmail: user.email,
            recipientEmail: recipientUser.email,
            recipientName: recipientName,
            subject: `A message from ${senderName}`,
            body: message
          });
          console.log('✅ Email notification sent successfully');
        } catch (notifError) {
          console.error('❌ Email notification failed (background):', notifError);
          // Silent fail - message was already saved
        }
      }, 100);

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setIsSending(false);
      toast({
        title: "❌ Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recipientUser) {
    return null;
  }

  const displayName = getDisplayName(recipientUser);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <UserAvatar user={recipientUser} className="w-12 h-12" />
            <div>
              <DialogTitle className="text-xl">Message {displayName}</DialogTitle>
              <DialogDescription>
                {recipientUser.current_position || recipientUser.headline || recipientUser.persona}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-none"
            required
          />
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSending || !message.trim()} 
              className="bg-blue-600 hover:bg-blue-700"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}