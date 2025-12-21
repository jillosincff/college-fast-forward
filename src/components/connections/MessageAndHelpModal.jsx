import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, MessageCircle, Users, Briefcase, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { getDisplayName } from '@/components/utils/nameUtils';

const helpOptions = [
  {
    id: 'introduction',
    label: 'Make an Introduction',
    icon: Users,
    description: 'Connect them with someone in my network',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'career_guidance',
    label: 'Career Guidance',
    icon: Lightbulb,
    description: 'Share insights and advice about their career path',
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 'resume_review',
    label: 'Resume Review',
    icon: Briefcase,
    description: 'Provide feedback on their resume and application',
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 'industry_insights',
    label: 'Industry Insights',
    icon: MessageCircle,
    description: 'Share knowledge about industry trends and opportunities',
    color: 'text-orange-600 bg-orange-50'
  },
];

const quickTemplates = {
  introduction: {
    name: 'Introduction Offer',
    message: `Hi! I saw your request and I think I can help connect you with the right people. I have connections in your target industry and would be happy to make some warm introductions. Let me know if you'd like to chat about potential opportunities!`
  },
  guidance_offer: {
    name: 'Guidance Offer',
    message: `Hi! I'd be happy to share insights about the industry and what companies look for. Having been through a similar path, I can offer some practical advice and help you think through your career strategy. Would love to have a quick chat!`
  },
  resume_help: {
    name: 'Resume Help',
    message: `Hi! I noticed your request and would be glad to take a look at your resume. I've helped several students refine their applications and know what recruiters typically look for. Happy to provide some quick feedback if that would be helpful!`
  }
};

export default function MessageAndHelpModal({ isOpen, onClose, request }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedHelp, setSelectedHelp] = useState(['career_guidance']);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleHelpToggle = (helpId) => {
    setSelectedHelp(prev => 
      prev.includes(helpId) 
        ? prev.filter(id => id !== helpId)
        : [...prev, helpId]
    );
  };

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    setMessage(quickTemplates[templateKey].message);
  };

  const handleSubmit = async () => {
    if (!message.trim() || selectedHelp.length === 0 || !user) return;

    setIsSubmitting(true);
    
    try {
      console.log('📧 Sending help offer for request:', request.id);
      
      const helperName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name || user.email;

      const studentName = request.student_name || request.created_by?.split('@')[0] || 'Student';

      // Pass ALL data directly to avoid database queries
      const response = await base44.functions.invoke('trackHelpOffer', {
        requestId: request.id,
        message: message.trim(),
        helpTypes: selectedHelp,
        // Helper info
        helperEmail: user.email,
        helperName: helperName,
        helperPersona: user.persona,
        // Request info
        requestCreatorEmail: request.created_by,
        requestTitle: request.title || request.role,
        requestDescription: request.description,
        studentName: studentName
      });

      console.log('✅ Help offer response:', response.data);

      trackEvent('help_offer_sent', { 
        requestId: request.id,
        helpTypes: selectedHelp 
      });

      toast({
        title: '🎉 Help Offer Sent!',
        description: `Your message has been sent to ${studentName}!`,
        duration: 3000,
      });

      // Reset form
      setMessage('');
      setSelectedHelp(['career_guidance']);
      setSelectedTemplate('');
      
      onClose();
      
      // Trigger page refresh to update message counts - with small delay to ensure backend completes
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('cff:message-sent'));
      }, 500);

    } catch (error) {
      console.error('❌ Failed to send help offer:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to send your offer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedHelp(['career_guidance']);
    setMessage('');
    setSelectedTemplate('');
    onClose();
  };

  if (!request) return null;

  const isAnonymousQuestion = request.is_anonymous && request.poster_type === 'parent';
  const studentName = isAnonymousQuestion 
    ? 'Anonymous Parent' 
    : (request.student_name || request.created_by?.split('@')[0] || 'this student');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Anonymous Question Warning */}
        {isAnonymousQuestion && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-amber-900">Anonymous Question</h4>
                <p className="text-sm text-amber-800 mt-1">
                  This parent posted anonymously. If you message them, both of you will see each other's identities.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  Public answers keep their identity private. Private messages reveal both identities.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            How can you help {studentName}?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Help Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select ways you can help:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {helpOptions.map(option => {
                const Icon = option.icon;
                const isSelected = selectedHelp.includes(option.id);
                
                return (
                  <div
                    key={option.id}
                    onClick={() => handleHelpToggle(option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200 ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${option.color} ${isSelected ? 'scale-110' : ''} transition-transform duration-200`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {option.label}
                          </span>
                          {isSelected && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Quick Templates
                <Badge className="bg-purple-100 text-purple-800 text-xs">Save time</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(quickTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplateSelect(key)}
                    className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedTemplate === key
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className={`font-medium text-sm ${
                      selectedTemplate === key ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {template.message.substring(0, 60)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your message to {studentName}:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a personal message explaining how you can help..."
              className="h-32 text-base"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {message.length}/500 characters
              </p>
              {selectedTemplate && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Using {quickTemplates[selectedTemplate].name}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!message.trim() || selectedHelp.length === 0 || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Help Offer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}