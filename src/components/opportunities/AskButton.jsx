import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';

export default function AskButton({ 
  oppId, 
  posterId, 
  posterEmail, 
  oppTitle,
  onAsked,
  size = "default",
  variant = "outline"
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to ask questions.",
        variant: "destructive"
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question before sending.",
        variant: "destructive"
      });
      return;
    }

    if (!posterEmail) {
      console.error('Missing posterEmail:', { oppId, posterEmail, oppTitle });
      toast({
        title: "Cannot send message",
        description: "Poster contact information is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending question:', {
        sender_email: user.email,
        recipient_email: posterEmail,
        subject: `Question about: ${oppTitle}`,
        post_id: oppId,
        post_title: oppTitle
      });

      // Create the message
      const message = await Message.create({
        sender_email: user.email,
        recipient_email: posterEmail,
        subject: `Question about: ${oppTitle}`,
        body: question,
        post_id: oppId,
        post_title: oppTitle
      });

      console.log('Message created successfully:', message);

      trackEvent('opportunity_question_sent', { 
        opportunityId: oppId,
        questionLength: question.length 
      });

      toast({
        title: "✅ Question sent!",
        description: "The poster will receive your message."
      });

      setQuestion('');
      setIsOpen(false);
      
      if (onAsked) {
        onAsked(message.id);
      }
    } catch (error) {
      console.error('Failed to send question:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: "Failed to send question",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Ask
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Send a question about <span className="font-semibold">{oppTitle}</span> to the poster.
            </p>
            
            <Textarea
              placeholder="Hi! I'm a UF student and I'm interested in this opportunity. Could you share any details about timelines or qualifications? Thanks!"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={6}
              className="resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? 'Sending...' : 'Send Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}