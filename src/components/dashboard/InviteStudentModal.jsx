import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Copy, Heart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { User } from '@/entities/User';
import { sendStudentInviteEmail } from '@/functions/sendStudentInviteEmail';

// Simple navigation function
const navigate = (page) => {
  window.location.hash = `#${page}`;
};

export default function InviteStudentModal({ isOpen, onClose, parentName, studentName: defaultStudentName }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setIsSent(false);
      setEmail(user?.student_email || '');
    }
  }, [isOpen, user?.student_email]);

  const studentName = user?.student_name || defaultStudentName || 'your student';
  const studentFirstName = studentName.split(' ')[0];
  const parentFirstName = parentName || user?.full_name?.split(' ')[0] || 'A Gator Parent';

  const handleSendInvite = async () => {
    if (!email) {
      toast({ title: "Please enter your student's email address.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    trackEvent('invite_student_sent', { parentId: user?.id, studentEmail: email, location: 'modal' });

    try {
      // Save student's email to parent's profile for future reference
      await User.updateMyUserData({ student_email: email });

      // Call the new backend function to send the email
      await sendStudentInviteEmail({
        student_email: email,
        student_name: studentFirstName,
        parent_name: parentFirstName,
      });

      toast({
        title: "Invite sent!",
        description: `We've sent an invite to ${email}.`,
      });
      setIsSent(true);
    } catch (error) {
      console.error("Failed to send invite:", error);
      toast({
        title: "Oh no!",
        description: "Something went wrong sending the invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `https://app.collegefastforward.com/#PreAuth?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "Invite link copied to clipboard!" });
  };

  const handleBrowseRequests = () => {
    trackEvent('invite_confirmation_browse_clicked', { parentId: user?.id });
    onClose();
    navigate('Connections'); // Use our simple navigate function
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8">
        <AnimatePresence mode="wait">
          {isSent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center py-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">🎉 Invite Sent!</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We've sent your invite to {studentFirstName}. Once they join, they'll be able to connect with alumni, explore opportunities, and build their own network.
              </p>
              <p className="text-sm text-slate-500 mb-6 italic">
                Thanks for being part of the Gator village — your support helps all students thrive.
              </p>
              <Button 
                onClick={handleBrowseRequests}
                className="w-full bg-[var(--uf-blue)] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                size="lg"
              >
                <Heart className="w-4 h-4 mr-2" />
                👉 Browse Student Requests
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form">
              <DialogHeader className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
                <DialogTitle className="text-2xl">Invite Your Student to Join</DialogTitle>
                <DialogDescription className="text-base">
                  Send {studentFirstName} a quick invite so they can join the network and connect with alumni directly.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <Input
                  id="student-email"
                  type="email"
                  placeholder="Enter student's email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  disabled={isSending}
                />
              </div>
              <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-3">
                <Button 
                  onClick={handleSendInvite} 
                  disabled={isSending || !email}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? 'Sending...' : 'Send Invite'}
                </Button>
                <Button 
                  onClick={handleCopyLink} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy Invite Link
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}