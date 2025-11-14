
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Edit3, RotateCcw, CheckCircle, MessageSquare, Heart, PlusCircle } from 'lucide-react';
import { trackHelpOffer } from '@/functions/trackHelpOffer';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import IntroContactModal from './IntroContactModal';

export default function QuickComposeModal({ isOpen, onClose, request }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [originalAIDraft, setOriginalAIDraft] = useState('');
  const [shareLinkedIn, setShareLinkedIn] = useState(false);
  const [offerIntro, setOfferIntro] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showIntroPrompt, setShowIntroPrompt] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false); // Kept this state variable

  const [newLinkedInUrl, setNewLinkedInUrl] = useState('');
  const [isLinkedInValid, setIsLinkedInValid] = useState(true);

  const showLinkedInInput = shareLinkedIn && !user?.linkedin_url;
  
  const validateLinkedInUrl = (url) => {
    if (!url) return true; // Empty is valid until they try to send
    
    // Must start with http(s):// and include linkedin.com
    const linkedinRegex = /^https?:\/\/.*linkedin\.com\/.+/i;
    return linkedinRegex.test(url);
  };
  
  const handleLinkedInChange = (e) => {
    const url = e.target.value;
    setNewLinkedInUrl(url);
    setIsLinkedInValid(validateLinkedInUrl(url));
  };

  const generateAISuggestion = (req) => {
    const poster = req.poster || {};
    const firstName = poster.full_name?.split(' ')[0] || 'there';
    
    return `Hi ${firstName} — I saw your request and would be happy to help. I can share resume tips, interview prep ideas, or connect you with someone in my network. Let me know what's most useful!`;
  };

  // Generate AI-suggested message when modal opens
  useEffect(() => {
    if (isOpen && request) {
      const suggestedMessage = generateAISuggestion(request);
      setMessage(suggestedMessage);
      setOriginalAIDraft(suggestedMessage); // Make sure we store the original
      setNewLinkedInUrl('');
      setShareLinkedIn(false);
      setOfferIntro(false);
      setShowIntroPrompt(false);
      setShowIntroModal(false);
    }
  }, [isOpen, request]);

  const handleResetDraft = () => {
    if (originalAIDraft) {
      setMessage(originalAIDraft);
    } else {
      // Fallback: regenerate the AI suggestion if original is somehow lost
      const suggestedMessage = generateAISuggestion(request);
      setMessage(suggestedMessage);
      setOriginalAIDraft(suggestedMessage);
    }
  };

  const canSend = message.trim() && (!showLinkedInInput || (newLinkedInUrl && isLinkedInValid));

  const handleSend = async () => {
    if (!request?.id || !canSend) return;

    setSending(true);
    let finalMessage = message;
    let linkToAppend = user?.linkedin_url;
    let savedNewLinkedIn = false;

    // Save new LinkedIn URL if provided
    if (showLinkedInInput && newLinkedInUrl && isLinkedInValid) {
      try {
        const fullUrl = newLinkedInUrl.startsWith('http') ? newLinkedInUrl : `https://${newLinkedInUrl}`;
        await User.updateMyUserData({ linkedin_url: fullUrl });
        linkToAppend = fullUrl;
        savedNewLinkedIn = true;
        await refreshUser();
      } catch (error) {
        console.error('Error saving LinkedIn URL:', error);
        toast({
          title: "Couldn't save your LinkedIn URL",
          description: "We'll send your message without it. You can add your URL in Settings.",
          variant: 'destructive',
        });
        linkToAppend = null;
      }
    }

    // Assemble the final message
    if (offerIntro) {
      finalMessage += "\n\nIf helpful, I may be able to introduce you to someone in my network in this area—just say the word.";
    }
    if (shareLinkedIn && linkToAppend) {
      finalMessage += `\n\nYou can also view my LinkedIn here: ${linkToAppend}`;
    }

    // Send the help offer
    try {
      await trackHelpOffer({ 
        requestId: request.id, 
        message: finalMessage 
      });
      
      const firstName = request.poster?.full_name?.split(' ')[0] || 'the student';
      setSent(true);
      
      if (offerIntro) {
        setShowIntroPrompt(true);
      }
      
      // Different toast messages based on whether we saved LinkedIn
      if (savedNewLinkedIn) {
        toast({
          title: '✅ Message sent, and we saved your LinkedIn link for next time.',
          description: `Your offer was sent to ${firstName}.`,
        });
      } else {
        toast({
          title: '✅ Your offer was sent to ' + firstName + '.',
          description: 'You can continue the conversation in Messages.',
        });
      }
    } catch (error) {
      console.error('Error sending help offer:', error);
      toast({
        title: 'Error sending offer',
        description: 'Please try again in a moment.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setShowIntroPrompt(false);
    setShowIntroModal(false); 
    setMessage('');
    setOriginalAIDraft('');
    setShareLinkedIn(false);
    setOfferIntro(false);
    setNewLinkedInUrl('');
    onClose();
  };

  const handleViewMessages = () => {
    handleClose();
    navigate('Messages');
  };

  const handleHelpAnother = () => {
    handleClose();
  };

  if (!request) return null;

  const poster = request.poster || {};

  return (
    <>
      <Dialog open={isOpen && !showIntroModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Offer Help</DialogTitle>
                </DialogHeader>

                {/* Student Context Card */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={poster.profile_image_url} alt={poster.full_name} />
                      <AvatarFallback>{poster.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{request.role}</h3>
                      <p className="text-sm text-slate-600 mt-1">"{request.description}"</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">by {poster.full_name}</span>
                        {poster.graduation_year && (
                          <Badge variant="outline" className="text-xs">
                            '{String(poster.graduation_year).slice(-2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Section */}
                <div className="mt-6">
                  <Label htmlFor="message" className="text-sm font-medium text-slate-700 mb-2 block">
                    AI-suggested message — edit to personalize or send as-is
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[120px] resize-none border-slate-300 focus:border-[#FA4616] focus:ring-[#FA4616]"
                      placeholder="Write your message..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => document.getElementById('message').focus()}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={handleResetDraft}
                        disabled={!originalAIDraft || message === originalAIDraft}
                        className="text-slate-600 hover:text-slate-800 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset AI draft
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Extra Options */}
                <div className="mt-6 space-y-4">
                  {/* LinkedIn Option */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="linkedin"
                      checked={shareLinkedIn}
                      onCheckedChange={setShareLinkedIn}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="linkedin" className="text-sm font-medium cursor-pointer">
                        Share my LinkedIn profile
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        {user?.linkedin_url 
                          ? "We'll attach your LinkedIn link from your profile."
                          : "We'll add it to this message and save it to your profile for next time."
                        }
                      </p>
                      
                      {showLinkedInInput && (
                        <div className="mt-3">
                          <Input
                            placeholder="https://linkedin.com/in/yourname"
                            value={newLinkedInUrl}
                            onChange={handleLinkedInChange}
                            className={`text-sm ${!isLinkedInValid ? 'border-red-300 focus:border-red-500' : ''}`}
                          />
                          {!isLinkedInValid && newLinkedInUrl && (
                            <p className="text-xs text-red-600 mt-1">
                              That doesn't look like a LinkedIn URL. Please double-check.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Intro Option */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="intro"
                      checked={offerIntro}
                      onCheckedChange={setOfferIntro}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="intro" className="text-sm font-medium cursor-pointer">
                        Offer an intro
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        We'll add a note in your message that you're open to connecting them with someone from your network.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8 pt-4 border-t">
                  <Button
                    variant="outline" 
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={sending || !canSend}
                    className="flex-1 bg-[#FA4616] hover:bg-[#E24B14] text-white font-semibold"
                  >
                    {sending ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
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
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-600 mb-6">
                  Your help offer was sent to {poster.full_name?.split(' ')[0] || 'the student'}. 
                  They'll be able to reply directly in Messages.
                </p>
                
                {showIntroPrompt && (
                  <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <p className="font-semibold text-blue-800">💡 Want to suggest someone for an intro now?</p>
                    <div className="flex gap-3 mt-3">
                      <Button onClick={() => setShowIntroModal(true)} size="sm">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                      <Button onClick={handleClose} variant="ghost" size="sm">Maybe Later</Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleViewMessages}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                  <Button
                    onClick={handleHelpAnother}
                    className="flex-1 bg-[#FA4616] hover:bg-[#E24B14] text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Help Another Gator
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
      
      {/* Secondary modal for adding intro contact */}
      <IntroContactModal 
        isOpen={showIntroModal}
        onClose={handleClose} 
        request={request}
        user={user}
      />
    </>
  );
}
