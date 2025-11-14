import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { HelpOffer } from "@/entities/HelpOffer";

export default function InviteHelpModal({ isOpen, onClose, request, poster, inviteData }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Generate pre-filled message for invited users
  useEffect(() => {
    if (isOpen && user && request && poster && inviteData) {
      const studentFirstName = poster.full_name?.split(' ')[0] || 'there';
      const helperFirstName = user.full_name?.split(' ')[0] || 'A fellow Gator';
      const role = request.role || request.title || 'your career journey';
      
      const prefilledMessage = `Hey ${studentFirstName},

Thanks to ${inviteData.helper_name}, I'm here to help you with your ${role} journey. Let's set up a time to chat or I can answer your questions right here.

Looking forward to connecting!
${helperFirstName}`;
      
      setMessage(prefilledMessage);
    }
  }, [isOpen, user, request, poster, inviteData]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await HelpOffer.create({
        request_id: request.id,
        request_title: request.role || request.title,
        offerer_user_id: user.id,
        offerer_role: user.persona,
        recipient_email: request.created_by,
        message: message,
        is_read: false,
        status: 'pending',
        template_used: 'invite_1st_degree',
        selected_degree: 1 // Invited users are always 1st degree
      });
      
      toast({
        title: "You're now connected! 🎉",
        description: `Your message is on its way to ${poster.full_name?.split(' ')[0]}.`,
        duration: 4000,
      });
      
      setIsSent(true);
      setTimeout(() => onClose(), 1500);
      
    } catch (error) {
      console.error('Error sending help offer:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setIsSending(false);
  };

  const handleClose = () => {
    setIsSent(false);
    setIsSending(false);
    setMessage('');
    onClose();
  };

  if (!request || !poster || !inviteData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold">
                  Connect with {poster.full_name?.split(' ')[0]}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 1st Degree Connection Badge */}
              <div className="bg-green-50 rounded-lg p-4">
                <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                  1st-Degree Connection
                </Badge>
                <p className="text-sm text-green-800">
                  You're connecting directly with this student through {inviteData.helper_name}'s invitation.
                </p>
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 block">
                  Your Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-40 resize-none"
                  disabled={isSending || isSent}
                  placeholder="Your message..."
                />
                <p className="text-xs text-slate-500">
                  Feel free to customize this message before sending.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={isSending}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={isSending || isSent || !message.trim()}
                  className="bg-green-600 hover:bg-green-700 w-36 transition-all"
                >
                  {isSending && (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  )}
                  {isSent && (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sent!
                    </div>
                  )}
                  {!isSending && !isSent && "Send Message"}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}