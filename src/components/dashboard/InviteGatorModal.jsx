import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Copy, CheckCircle2, Users2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function InviteGatorModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const isUFEmail = (emailAddress) => {
    return emailAddress.toLowerCase().trim().endsWith('@ufl.edu');
  };

  const handleSendEmail = async () => {
    if (!email || !email.trim()) {
      toast({ title: "Please enter your student's email address.", variant: "destructive" });
      return;
    }

    const trimmedEmail = email.trim();
    
    setIsSending(true);
    try {
      // Generate a unique invite link for this parent
      const inviteToken = `${user.id}_${Date.now()}`;
      const link = `${window.location.origin}/#LandingPage?invite=${inviteToken}&from=${encodeURIComponent(user.full_name || 'A Gator Parent')}`;

      // Send email via SendGrid
      await base44.integrations.Core.SendEmail({
        to: trimmedEmail,
        subject: `${user.full_name || 'A Gator Parent'} invited you to College Fast Forward! 🐊`,
        body: `Hi!

${user.full_name || 'A Gator Parent'} has invited you to join College Fast Forward - the private network where UF students connect with alumni and parents for career opportunities, advice, and support.

Click here to join: ${link}

${isUFEmail(trimmedEmail) ? 'Since you have a UF email, you can sign in directly with Google - no invite code needed!' : 'Use this link to get started!'}

What you'll get access to:
• Connect with UF alumni and parents who can help with your career
• Browse exclusive job and internship opportunities
• Get advice, referrals, and introductions
• Find roommates and housing

Go Gators! 🧡💙

College Fast Forward Team`
      });

      toast({
        title: "Invite sent! 🎉",
        description: `We've sent an invite to ${trimmedEmail}`,
      });
      
      setEmail('');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Failed to send invite:", error);
      toast({
        title: "Failed to send",
        description: "Please try again or use the copy link option.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateLink = () => {
    const inviteToken = `${user.id}_${Date.now()}`;
    const link = `${window.location.origin}/#LandingPage?invite=${inviteToken}&from=${encodeURIComponent(user.full_name || 'A Gator Parent')}`;
    
    const message = `Hey! I'm inviting you to join College Fast Forward - a private network for UF students to connect with alumni and parents for career opportunities.

${isUFEmail(email) ? 'Since you have a @ufl.edu email, just sign in with Google - no code needed!' : 'Click this link to join:'}

${link}

You'll get access to exclusive job postings, career advice, introductions, and more. Go Gators! 🐊🧡💙`;

    setInviteLink(link);
    setShowCopyMessage(message);
  };

  const handleCopy = () => {
    if (showCopyMessage) {
      navigator.clipboard.writeText(showCopyMessage);
      toast({ 
        title: "Copied! 📋", 
        description: "Now paste it into a text or WhatsApp message to your student." 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users2 className="w-7 h-7 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl text-center">Invite Your Gator Student</DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose how you'd like to invite them to the network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Option 1: Send by Email */}
          <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Option 1: Send by Email</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              We'll send them a personalized invite directly to their inbox
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="student@ufl.edu or any email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSending}
              />
              <Button 
                onClick={handleSendEmail}
                disabled={isSending || !email}
                className="whitespace-nowrap"
              >
                {isSending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
            {email && isUFEmail(email) && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                UF email detected - they can sign in directly with Google!
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">OR</span>
            </div>
          </div>

          {/* Option 2: Copy & Paste */}
          <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-purple-400 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <Copy className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-slate-900">Option 2: Copy & Text</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Generate a message you can copy and text/WhatsApp to them
            </p>
            
            {!showCopyMessage ? (
              <Button 
                onClick={handleGenerateLink}
                variant="outline"
                className="w-full"
              >
                Generate Message to Copy
              </Button>
            ) : (
              <div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm mb-3 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700">
                    {showCopyMessage}
                  </pre>
                </div>
                <Button 
                  onClick={handleCopy}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Message
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          💡 Students with @ufl.edu emails can sign in directly with Google - no code needed!
        </div>
      </DialogContent>
    </Dialog>
  );
}