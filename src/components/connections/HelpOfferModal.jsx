import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const trackEvent = (eventName, properties) => {
  console.log(`Analytics Event: ${eventName}`, properties);
};

export default function HelpOfferModal({ isOpen, onClose, request, user, onSuccess }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !request) {
      toast({
        title: "Error",
        description: "User or request information is missing. Cannot send offer.",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({ title: "Please write a message", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      // Track the help offer
      const result = await base44.functions.invoke('trackHelpOffer', {
        requestId: request.id,
        message: message.trim()
      });

      console.log('✅ Help offer tracked:', result);

      // Send email notification
      try {
        await base44.functions.invoke('sendHelpOfferNotification', {
          helpOffer: { message: message.trim() },
          request: request,
          helper: user
        });
        console.log('✅ Help offer notification sent.');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        toast({
          title: "Notification Warning",
          description: "Help offer sent, but we had trouble sending the notification email.",
          variant: "warning",
        });
      }

      toast({
        title: "✅ Help Offer Sent!",
        description: `Your message has been sent to ${request.poster?.full_name || 'the student'}. They have been notified and will see your message.`,
        duration: 5000
      });

      trackEvent('help_offer_sent', {
        request_id: request.id,
        request_role: request.role,
        helper_id: user.id
      });

      setMessage('');
      onClose();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('❌ Failed to send help offer:', error);
      const errorMessage = error.message || "Failed to send help offer. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Help {request?.poster?.full_name || 'This Gator'}
          </DialogTitle>
        </DialogHeader>
        
        <form className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="font-medium text-slate-900">{request?.role}</p>
            <p className="text-sm text-slate-600 mt-1">{(request?.description || '').substring(0, 150)}{request?.description?.length > 150 ? '...' : ''}</p>
          </div>
          
          <div>
            <Label htmlFor="help-message">Your Help Offer</Label>
            <Textarea
              id="help-message"
              placeholder="Hi! I'd be happy to help with your request. I can offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={isSending}
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific about how you can help (intro, advice, resume review, etc.)
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim() || isSending}
              className="bg-[var(--uf-orange)] hover:bg-orange-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Help Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}