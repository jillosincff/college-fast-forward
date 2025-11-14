
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Send,
  Loader2,
  Share2,
  MessageSquare,
  Users,
  FileText
} from "lucide-react";
import { HelpOffer } from '@/entities/HelpOffer';
import { trackEvent } from '@/components/utils/analytics';
import { sendMessageNotification } from '@/functions/sendMessageNotification';
import { useToast } from "@/components/ui/use-toast";

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
};

const templates = [
  {
    id: 'advice',
    icon: MessageSquare,
    title: 'Advice / Quick Call',
    description: 'Share insights and have a brief conversation',
    template: 'Hi! I saw your request for {role} and would love to share some advice from my experience in {industry}. I can offer insights on the industry, career paths, and answer any questions you might have. Would you be open to a quick 15-20 minute call?'
  },
  {
    id: 'resume',
    icon: FileText,
    title: 'Resume Review',
    description: 'Provide feedback on their resume',
    template: 'Hi! I noticed you\'re looking for opportunities in {industry}. I have {experience} years of experience in this field and would be happy to review your resume and provide feedback. I can help you highlight your strengths and optimize it for the roles you\'re targeting.'
  },
  {
    id: 'interview',
    icon: Users,
    title: 'Interview Prep',
    description: 'Help them prepare for interviews',
    template: 'Hi! I saw your request for {role} positions. Having been through many interviews in {industry}, I\'d be happy to help you prepare. We can do a mock interview, review common questions, and discuss what companies in this space typically look for.'
  },
  {
    id: 'referral',
    icon: Share2,
    title: 'Referral / Intro',
    description: 'Connect them with someone in your network',
    template: 'Hi! I saw your interest in {role} and I may be able to help connect you with someone in my network. I know several professionals in {industry} who might be able to provide guidance or share relevant opportunities.'
  }
];

export default function NetworkModal({ isOpen, onClose, request, poster, user, onMakeIntro, onMessageSent }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReferralNudge, setShowReferralNudge] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setMessage("");
      setLoading(false);
      setSuccess(false);
      setShowReferralNudge(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate) {
      let templateText = selectedTemplate.template;
      
      // Replace placeholders
      templateText = templateText.replace(/{role}/g, request?.role || 'opportunities');
      templateText = templateText.replace(/{industry}/g, request?.target_industry || 'this field');
      templateText = templateText.replace(/{experience}/g, '5+'); // Could be dynamic based on user data
      
      setMessage(templateText);
      
      // Show referral nudge if referral template is selected
      if (selectedTemplate.id === 'referral') {
        setShowReferralNudge(true);
      } else {
        setShowReferralNudge(false);
      }
    }
  }, [selectedTemplate, request]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    trackEvent('help_template_selected', { 
      templateId: template.id, 
      requestId: request?.id 
    });
  };

  const handleSubmit = async () => {
    if (!user || !request || !message.trim()) {
      toast({
        title: "Error",
        description: "Please write a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const offerData = {
        request_id: request.id,
        request_title: request.title || request.role,
        offerer_user_id: user.id,
        offerer_role: user.persona,
        recipient_email: request.created_by,
        message: message,
        status: 'pending',
        template_used: selectedTemplate?.title || 'Custom Message',
        selected_degree: 'direct',
      };

      await HelpOffer.create(offerData);

      await sendMessageNotification({
        recipient_email: request.created_by,
        subject: `Help with your post: "${request.title || request.role}"`,
        body: message,
        sender_name: user.full_name || 'A Gator',
      });

      // Call the message sent callback to update stats
      if (onMessageSent) {
        onMessageSent(); // No need to await this, it's for UI updates
      }

      trackEvent('help_offer_sent', {
        template: selectedTemplate?.id || 'custom',
        request_type: request.job_type,
        request_id: request.id,
      });

      setSuccess(true);
      toast({
        title: "Help Offer Sent!",
        description: "Your offer has been sent to the student.",
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error submitting help offer:", error);
      toast({
        title: "Error",
        description: "There was an error sending your offer. Please try again.",
        variant: "destructive",
      });
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeIntro = () => {
    onClose();
    if (onMakeIntro) {
      onMakeIntro(request, poster);
    }
    trackEvent('make_intro_clicked_from_help_modal', { requestId: request?.id });
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Help Offer Sent!</h3>
            <p className="text-slate-600">Thanks for helping a fellow Gator. They'll receive your message soon.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5 text-[var(--uf-orange)]" />
              How would you like to help?
            </DialogTitle>
          </DialogHeader>

          {/* Request Summary */}
          <Card className="bg-slate-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-[var(--uf-blue)] to-[var(--uf-orange)] text-white font-semibold">
                    {getInitials(poster?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{request?.title || request?.role}</h3>
                  <p className="text-sm text-slate-600">by {poster?.full_name}</p>
                  {request?.target_industry && (
                    <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">
                      {request.target_industry}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          {!selectedTemplate && (
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Choose how you'd like to help:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <template.icon className="w-5 h-5 mt-0.5 text-slate-600" />
                      <div>
                        <div className="font-medium text-slate-900">{template.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{template.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Template & Message */}
          {selectedTemplate && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <selectedTemplate.icon className="w-4 h-4" />
                  {selectedTemplate.title}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change
                </Button>
              </div>

              {/* Referral Nudge */}
              {showReferralNudge && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 For smooth introductions, consider using our <strong>Make an Intro</strong> feature instead.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleMakeIntro}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Make an Intro
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message" className="font-medium">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Edit the message or add your personal touch..."
                  className="min-h-[120px] resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedTemplate && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="flex-1 bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-semibold py-3"
              >
                {loading ? (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
