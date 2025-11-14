import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, FileText, MapPin, Clock, Users } from 'lucide-react';
import { JobRequest } from '@/entities/JobRequest';
import { User } from '@/entities/User';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import { trackHelpOffer } from '@/functions/trackHelpOffer';
import { trackEvent } from '@/components/utils/analytics';

const roleStyles = {
  student: { colors: 'bg-blue-100 text-blue-800' },
  parent: { colors: 'bg-purple-100 text-purple-800' },
  alumni: { colors: 'bg-green-100 text-green-800' },
};

export default function RequestModal({ requestId, onClose, onHelpOffered, onIntroMade }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [poster, setPoster] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [showIntroForm, setShowIntroForm] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [introMessage, setIntroMessage] = useState('');

  useEffect(() => {
    if (requestId) {
      loadRequestData();
    }
  }, [requestId]);

  const loadRequestData = async () => {
    setIsLoading(true);
    try {
      const reqData = await JobRequest.get(requestId);
      setRequest(reqData);
      
      const posterData = await User.filter({ email: reqData.created_by });
      setPoster(posterData[0] || null);
      
      trackEvent('request_modal_opened', { requestId });
    } catch (err) {
      console.error("Failed to load request details:", err);
      toast({ 
        title: 'Error loading request', 
        description: 'Please try again later.',
        variant: 'destructive' 
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferHelp = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to offer help.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await trackHelpOffer({ 
        requestId,
        message: helpMessage || 'I\'d love to help with your request!'
      });
      
      toast({ 
        title: '🎉 Help offer sent!', 
        description: 'Your offer has been sent to the student. They can follow up via Messages.' 
      });
      
      onHelpOffered?.(requestId);
      onClose();
      
      trackEvent('help_offer_sent', { requestId, hasMessage: !!helpMessage });
    } catch (error) {
      console.error('Help offer error:', error);
      toast({ 
        title: 'Could not send offer', 
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeIntro = async () => {
    // For now, just show success message
    // In a real app, this would open an intro form or send data to backend
    toast({ 
      title: '🤝 Introduction feature coming soon!', 
      description: 'We\'re working on making introductions even easier.' 
    });
    
    onIntroMade?.(requestId);
    trackEvent('intro_attempted', { requestId });
  };

  if (!requestId) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Loading request...</span>
          </div>
        ) : request && poster ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-2xl font-bold pr-8">
                  {request.role}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="absolute top-4 right-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <UserAvatar user={poster} className="w-16 h-16" />
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {poster.full_name || 'A Gator'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={`border-0 ${roleStyles[poster.persona]?.colors || roleStyles.student.colors}`}>
                      {poster.persona || 'student'}
                    </Badge>
                    {poster.graduation_year && (
                      <span className="text-slate-500">
                        UF '{String(poster.graduation_year).slice(-2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Request Details</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{request.target_industry || 'Any Industry'}</span>
                </div>
                
                {(request.location_city || request.location_state) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[request.location_city, request.location_state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{request.job_type?.replace('_', ' ') || 'Full Time'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {(request.intros_count || 0)} intros · {(request.offers_count || 0)} offers
                  </span>
                </div>
              </div>

              {request.resume_url && (
                <div>
                  <a 
                    href={request.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                </div>
              )}

              {showHelpForm && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Add a personal message (optional)</h4>
                  <Textarea
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Let them know how you can help..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              {!showHelpForm ? (
                <>
                  <Button 
                    onClick={handleMakeIntro}
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Make Introduction
                  </Button>
                  <Button 
                    onClick={() => setShowHelpForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    Offer Help
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => {
                      setShowHelpForm(false);
                      setHelpMessage('');
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleOfferHelp}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Help Offer'
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-slate-600">Failed to load request details.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}