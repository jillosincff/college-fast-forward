import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createReferralLink } from '@/functions/createReferralLink';
import { Loader2, ClipboardCopy, Check, Info, Link } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function IndirectHelpModal({ isOpen, onClose, request, posterUser, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [referralUrl, setReferralUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const studentFirstName = posterUser?.full_name?.split(' ')[0] || 'the student';

  const generateShareableLink = useCallback(async () => {
    if (!request || !posterUser) return;
    
    setIsLoading(true);
    setReferralUrl('');
    setShareMessage('');

    try {
      const { data } = await createReferralLink({
        studentRequestId: request.id,
        requestTitle: request.title || request.role,
        studentName: posterUser.full_name,
        studentEmail: posterUser.email,
      });

      if (data?.success && data.shortUrl) {
        // Track this as a parent invite if user is a parent
        if (user && (user.persona === 'parent' || user.roles?.includes('parent'))) {
          try {
            const { default: handleParentInvite } = await import('@/functions/handleParentInvite');
            await handleParentInvite({
              invite_id: data.referral_link_id,
              parent_email: user.email
            });
          } catch (err) {
            console.error('Failed to track parent invite:', err);
            // Don't block the main flow
          }
        }
        
        setReferralUrl(data.shortUrl);
        const messageTemplate = `Hi [Contact Name],

I saw a request from a fellow Gator, ${studentFirstName}, who is looking for help. While I may not be the perfect fit, I thought you might be able to assist.

Here's a link to ${studentFirstName}'s request for easy reference:
${data.shortUrl}

Let me know if you're open to connecting!

Go Gators! 🐊`;
        setShareMessage(messageTemplate);
      } else {
        throw new Error(data?.error || 'Failed to create link.');
      }
    } catch (error) {
      console.error("Failed to create referral link:", error);
      toast({
        title: "Error",
        description: "Could not create a shareable link. Please try again later.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [request, posterUser, toast, onClose, studentFirstName]);

  useEffect(() => {
    if (isOpen) {
      generateShareableLink();
    }
  }, [isOpen, generateShareableLink]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage);
    toast({
      title: "✅ Referral message copied!",
      description: `Now share it with someone who can help ${studentFirstName}.`,
      className: "bg-green-100 border-green-300 text-green-800",
    });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl p-0">
            <TooltipProvider>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <DialogHeader className="p-6 border-b">
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    🔄 UPDATED: Help {studentFirstName} with their search
                  </DialogTitle>
                  <DialogDescription>
                    Know someone who can help? Generate a unique link to share this request.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                      <Loader2 className="w-8 h-8 animate-spin mb-4" />
                      <p className="font-semibold">Generating your shareable link...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="share-message" className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          Edit your message (optional)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Customize this message before sharing it with your contact</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Textarea
                          id="share-message"
                          value={shareMessage}
                          onChange={(e) => setShareMessage(e.target.value)}
                          className="mt-2 h-48 font-mono text-sm"
                          placeholder="Loading your custom message..."
                        />
                      </div>

                      {/* Instructional Microcopy */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-blue-900 mb-1">
                              Share this link with someone in your network who might be able to help {studentFirstName}.
                            </p>
                            <p className="text-blue-700 text-sm">
                              Paste it in an email, LinkedIn message, or text.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action-Oriented Button with Icon and Tooltip */}
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={handleCopyToClipboard}
                          className="flex-1 bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-semibold py-3 text-lg h-12"
                          size="lg"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Message Copied!
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-5 h-5 mr-2" />
                              Copy & Share Referral Message
                            </>
                          )}
                        </Button>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12">
                              <Info className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="font-semibold mb-1">How to Use:</p>
                            <p className="text-sm">Copy this message and send it to someone you think can help. They'll be able to view {studentFirstName}'s request and reach out directly.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Additional Context */}
                      <div className="text-center text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                        <p className="flex items-center justify-center gap-2">
                          <Link className="w-4 h-4" />
                          Your referral link will track when someone connects with {studentFirstName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </TooltipProvider>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}