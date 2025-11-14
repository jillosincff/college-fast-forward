
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  Send,
  Clock,
  Loader2,
  Copy,
  Check,
  MessageCircle, // For Warm Intro
  Zap, // For Quick Ping
  Share2 // For Refer Someone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { createReferralLink } from '@/functions/createReferralLink';
import HelpOffer from '@/lib/models/HelpOffer'; // Assuming the path for HelpOffer model

// Message Templates
const getTemplates = (posterName, referralLink = '[Referral Link]') => ({
  'warm_intro': {
    title: 'Warm Introduction',
    text: `Hi ${posterName},\n\nI’m a fellow Gator and I’d love to support your search.\n\nLet’s connect soon!\n\nGo Gators! 🐊`
  },
  'quick_ping': {
    title: 'Quick Ping',
    text: `Hi ${posterName},\n\nHappy to help—let’s connect!\n\nGo Gators! 🐊`
  },
  'refer_someone': {
    title: 'Refer Someone',
    text: `Hi,\n\nI saw your request and while I may not be the perfect fit to help, I’d be happy to connect you with someone in my network who might be able to assist.\n\nHere’s a link to your profile/request for easy sharing:\n${referralLink}\n\nLet me know if you’re interested!\n\nGo Gators! 🐊`
  }
});

// Enhanced template configuration with visual distinctions
const getTemplateConfig = () => ({
  'warm_intro': {
    title: 'Warm Intro',
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Personal and friendly'
  },
  'quick_ping': {
    title: 'Quick Ping',
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Short and direct'
  },
  'refer_someone': {
    title: 'Refer Someone',
    icon: Share2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Share with your network'
  }
});

// Custom template selector component
const TemplateSelector = ({ activeTemplate, onTemplateChange, isGeneratingLink }) => {
  const templateConfig = getTemplateConfig();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700">Choose your message style</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(templateConfig).map(([templateId, config]) => {
          const Icon = config.icon;
          const isActive = activeTemplate === templateId;
          const isDisabled = templateId === 'refer_someone' && isGeneratingLink;

          return (
            <motion.button
              key={templateId}
              type="button"
              onClick={() => !isDisabled && onTemplateChange(templateId)}
              disabled={isDisabled}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isActive
                  ? `${config.bgColor} ${config.borderColor} shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className="flex items-center gap-3 mb-2">
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-white shadow-sm' : config.bgColor}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? config.color : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isActive ? config.color : 'text-slate-700'}`}>
                    {config.title}
                  </h3>
                  <p className="text-xs text-slate-500">{config.description}</p>
                </div>
              </div>

              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default function ConnectModal({
  isOpen,
  onClose,
  request,
  poster, // `poster` prop is preserved as it's used extensively
  onSubmit
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState('warm_intro');
  const [message, setMessage] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSubmittingWithAnimation, setIsSubmittingWithAnimation] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const posterName = poster?.full_name?.split(' ')[0] || 'there';

  // Effect to reset the state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTemplate('warm_intro');
      setReferralLink('');
      setLinkCopied(false);
      setIsSubmittingWithAnimation(false);
      setIsGeneratingLink(false); // Also reset generating state
    }
  }, [isOpen]);

  // Effect to update the message whenever the template or referral link changes
  useEffect(() => {
    if (!isOpen) return; // Only update message when modal is open

    const templates = getTemplates(posterName, referralLink || '[Referral Link]');

    // If we are on the referral tab and the link is still being generated, show a placeholder.
    if (activeTemplate === 'refer_someone' && isGeneratingLink) {
      setMessage("Generating your unique referral link...");
      return;
    }

    // Otherwise, set the message from the templates object.
    if (templates[activeTemplate]) {
      setMessage(templates[activeTemplate].text);
    }

  }, [isOpen, activeTemplate, referralLink, posterName, isGeneratingLink]);

  const generateAndSetReferralLink = async () => {
    if (referralLink || isGeneratingLink) return;

    setIsGeneratingLink(true);
    try {
      const response = await createReferralLink({
        studentRequestId: request.id,
        requestTitle: request.title,
        studentName: poster.full_name,
        studentEmail: poster.email
      });

      const { data } = response;

      if (data && data.success) {
        setReferralLink(data.shortUrl);
        toast({
          title: "Referral link created!",
          description: "It's been added to your message.",
        });
      } else {
        throw new Error(data.error || "Failed to create referral link.");
      }
    } catch (error) {
      console.error("Error generating referral link:", error);
      setActiveTemplate('warm_intro'); // Fallback to a safe template if link generation fails
      toast({
        title: "Error",
        description: "Could not create a referral link. Please try again.",
        variant: "destructive",
      });
    }
    setIsGeneratingLink(false);
  };

  const handleTemplateChange = (templateId) => {
    setActiveTemplate(templateId);
    if (templateId === 'refer_someone' && !referralLink) {
      generateAndSetReferralLink();
    }
  };

  const handleCopyLink = () => {
    if (!referralLink) return; // Prevent copying if link isn't generated yet
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share the link anywhere.",
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please write a message before sending your help offer.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingWithAnimation(true);

    try {
      const offerData = {
        request_id: request.id,
        request_title: request.title || request.role,
        offerer_user_id: user?.id,
        offerer_role: user?.persona,
        recipient_email: request.created_by, // Assuming request.created_by holds the recipient's email
        message: message,
        template_used: activeTemplate, // Mapped `selectedTemplate` to `activeTemplate`
        selected_degree: user?.graduation_year || null // Assuming `user.graduation_year` is the relevant degree info for the offerer
      };

      await HelpOffer.create(offerData);

      // Track that user has helped someone for the share modal
      localStorage.setItem('has_helped_someone', 'true');

      onSubmit?.(offerData); // Pass `offerData` to the `onSubmit` callback
      onClose(); // Close the modal on successful submission
    } catch (error) {
      console.error('Failed to send help offer:', error);
      toast({
        title: "Submission Error",
        description: "Failed to send your help offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingWithAnimation(false);
    }
  };

  if (!request || !poster) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="text-center pb-4 border-b border-slate-200 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Help {posterName} with their {request.role} search
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Student Info Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={poster.profile_image_url} alt={poster.full_name} />
              <AvatarFallback>{poster.full_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{poster.full_name} • UF '{String(poster.graduation_year || '24').slice(-2)}</p>
              <p className="text-sm text-slate-600 line-clamp-1">"{request.title}"</p>
            </div>
          </div>

          {/* Enhanced Template Selector */}
          <TemplateSelector
            activeTemplate={activeTemplate}
            onTemplateChange={handleTemplateChange}
            isGeneratingLink={isGeneratingLink}
          />

          {/* Message Compose Area */}
           <div>
            <Label htmlFor="message-compose" className="text-sm font-semibold text-slate-700">Edit your message (optional)</Label>
            <Textarea
              id="message-compose"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message will appear here..."
              rows={8}
              className="mt-1"
            />
          </div>

          {/* Copy Link Button (only for refer someone) */}
          {activeTemplate === 'refer_someone' && (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={isGeneratingLink || !referralLink}
                className="w-full md:w-auto border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {isGeneratingLink ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : linkCopied ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {isGeneratingLink ? 'Generating Link...' : linkCopied ? 'Link Copied!' : 'Copy Referral Link'}
              </Button>
            </div>
          )}

          {/* Personal Impact Message - NEW */}
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <p className="font-semibold text-lg text-orange-800 mb-1">
              Your offer could make all the difference for {posterName}.
            </p>
            <p className="text-sm text-orange-600">
              One connection can change everything. 🐊
            </p>
          </div>

          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Clock className="w-3 h-3" />
            Takes less than 2 minutes.
          </p>
        </div>

        {/* Fixed Footer with Send Button */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-200 bg-white">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmittingWithAnimation || (activeTemplate === 'refer_someone' && isGeneratingLink)}
              className="w-full bg-gradient-to-r from-[var(--uf-orange)] to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isSubmittingWithAnimation ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Help Offer
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmittingWithAnimation}
              className="w-full text-slate-600 hover:text-slate-900"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
