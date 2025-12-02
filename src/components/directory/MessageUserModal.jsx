import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { trackEvent } from '@/components/utils/analytics';
import { getDisplayName, getFirstName } from '@/components/utils/nameUtils';
import { useAccessControl } from '@/components/access/useAccessControl';

export default function MessageUserModal({ isOpen, onClose, recipientUser }) {
  const { user, refreshUser } = useAuth();
  const accessInfo = useAccessControl(user);
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

    // Check free tier daily message quota
    if (accessInfo.isLimitedMode && !accessInfo.canSendMessages) {
      toast({
        title: "Daily message limit reached",
        description: "You've used all 3 messages today. Upgrade to Full Access for unlimited messaging!",
        variant: "destructive",
      });
      return;
    }

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

      // Track daily message count for free tier users (resets midnight ET)
      if (accessInfo.isLimitedMode && user.persona === 'gator') {
        const now = new Date();
        const etOptions = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentDayET = new Intl.DateTimeFormat('en-US', etOptions).format(now);
        const currentCount = user.messages_day_reset === currentDayET 
          ? (user.messages_sent_today || 0) 
          : 0;
        
        try {
          await base44.auth.updateMe({
            messages_sent_today: currentCount + 1,
            messages_day_reset: currentDayET
          });
          console.log('✅ Daily message count updated:', currentCount + 1);
          refreshUser?.();
        } catch (countErr) {
          console.error('Failed to update message count:', countErr);
        }
      }

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

      // If parent is messaging a student, trigger boost for linked students
      if ((user.persona === 'parent' || user.roles?.includes('parent')) && 
          (recipientUser.persona === 'gator' || recipientUser.roles?.includes('gator'))) {
        console.log('🚀 Parent messaged student - triggering boost...');
        setTimeout(async () => {
          try {
            await base44.functions.invoke('boostStudentRequests', {
              parentId: user.id,
              parentEmail: user.email,
              actionType: 'message_sent'
            });
            console.log('✅ Boost triggered successfully');
          } catch (boostError) {
            console.error('❌ Boost failed (background):', boostError);
            // Silent fail - message was already sent
          }
        }, 200);

        // Trigger Pay It Forward notification to the student's parent
        console.log('❤️ Triggering Pay It Forward notification...');
        setTimeout(async () => {
          try {
            await base44.functions.invoke('sendPayItForwardNotification', {
              helper_parent_email: user.email,
              helper_parent_name: user.full_name || user.first_name || 'A Gator Parent',
              student_email: recipientUser.email,
              student_name: recipientUser.full_name || recipientUser.first_name,
              trigger_type: 'message'
            });
            console.log('✅ Pay It Forward notification sent');
          } catch (pifError) {
            console.error('❌ Pay It Forward notification failed (background):', pifError);
          }
        }, 300);
      }

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
          {/* Free tier daily limit warning */}
          {accessInfo.isLimitedMode && user?.persona === 'gator' && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">
                  {accessInfo.messagesRemaining} message{accessInfo.messagesRemaining !== 1 ? 's' : ''} remaining today
                </p>
                <p className="text-orange-600 text-xs mt-1">
                  Upgrade to Full Access ($9/mo) for unlimited messaging
                </p>
              </div>
            </div>
          )}
          
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