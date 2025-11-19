import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight, MessageSquare, Bookmark, Heart, Share2, Copy, Briefcase, Zap, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Opportunity } from '@/entities/Opportunity';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { useAuth } from '@/components/auth/AuthContext';
import { formatOpportunityType, formatLocationDisplay } from '@/components/utils/format';
import { trackEvent } from '@/components/utils/analytics';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import AskButton from './AskButton';

const getInitials = (name) => {
  if (!name) return 'UF';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const MetaChip = ({ children }) => (
  <span className="inline-flex items-center rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-2 py-0.5 text-[11px] font-medium leading-5">
    {children}
  </span>
);

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {children}
  </section>
);

const SkeletonText = () => (
  <div className="space-y-2">
    <div className="h-4 bg-slate-200 rounded animate-pulse" />
    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
  </div>
);

const SaveButton = ({ oppId, saved, onToggle }) => {
  const [isSaved, setIsSaved] = useState(saved);
  
  const handleToggle = () => {
    setIsSaved(!isSaved);
    onToggle?.(!isSaved);
    trackEvent('opportunity_save_toggle', { id: oppId, saved: !isSaved });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`p-2 rounded-md hover:bg-slate-50 ${isSaved ? 'text-red-500' : 'text-slate-400'}`}
      aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
    >
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
    </Button>
  );
};

const ShareButton = ({ oppId, title }) => {
  const { toast } = useToast();
  
  const handleShare = async () => {
    trackEvent('opportunity_share', { id: oppId });
    
    // Use hash-based URL for the app
    const url = `${window.location.origin}/#Opportunities?id=${oppId}`;
    
    const shareData = {
      title: `${title} - College Fast Forward`,
      text: `Check out this opportunity: ${title}`,
      url: url
    };
    
    // Try native share first (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ 
          title: "✅ Shared!",
          description: "Thanks for spreading the word!"
        });
        return;
      } catch (error) {
        // User cancelled - fall through to copy
        if (error.name === 'AbortError') {
          return; // User cancelled, don't show error
        }
      }
    }
    
    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(url);
      toast({ 
        title: "✅ Link copied!",
        description: "Share this opportunity with others."
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({ 
        title: "❌ Failed to copy",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className="p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600"
      aria-label="Share opportunity"
    >
      <Share2 className="w-5 h-5" />
    </Button>
  );
};

export default function OpportunityModal({ isOpen, onClose, opportunity, onApply, hasApplied }) {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && opportunity) {
      trackEvent('opportunity_modal_open', { id: opportunity.id });
    }
  }, [isOpen, opportunity]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleUserApply = (method) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply to opportunities.",
        variant: "destructive"
      });
      return;
    }
    onApply(opportunity, method);
  };

  const handleAskQuestion = (messageId) => {
    // Placeholder for ask question functionality
  };

  const handleSaveToggle = (saved) => {
    toast({ title: saved ? 'Opportunity saved!' : 'Opportunity unsaved!' });
  };

  if (!isOpen || !opportunity) return null;

  const isNew = opportunity?.created_date && 
    (new Date() - new Date(opportunity.created_date)) < 7 * 24 * 60 * 60 * 1000;
  
  const isClosingSoon = opportunity?.expires_at && 
    (new Date(opportunity.expires_at) - new Date()) < 7 * 24 * 60 * 60 * 1000;

  const posterStyle = opportunity?.posted_by_role === 'alumni' ? 
    { icon: '🎓', role: 'UF Alumni' } : 
    { icon: '👨‍👩‍👧', role: 'UF Parent' };

  const avatarSrc = opportunity?.company?.logo_url || opportunity?.poster_avatar_url;
  const avatarFallback = opportunity?.company?.name ? 
    opportunity.company.name.substring(0, 2).toUpperCase() : 
    getInitials(opportunity?.poster_name);

  const isGatorNetworkPost = opportunity.posting_type === 'manual_entry' && opportunity.created_by;
  
  const hasCustomApplicationEmail = opportunity.application_email && 
    opportunity.application_email !== opportunity.created_by;
  
  const isPlatformApply = isGatorNetworkPost && !hasCustomApplicationEmail;

  const handleEmailApply = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply to opportunities.",
        variant: "destructive"
      });
      return;
    }

    window.location.href = `mailto:${opportunity.application_email}?subject=Application for ${encodeURIComponent(opportunity.title)}`;
    
    trackEvent('opportunity_email_apply_click', { id: opportunity.id });
    
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-start gap-4 p-4 border-b bg-white z-10 sticky top-0">
          <Avatar className="h-12 w-12 rounded-lg ring-1 ring-slate-100">
            <AvatarImage src={avatarSrc} alt={opportunity?.company?.name || opportunity?.poster_name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <h2 id="opp-title" className="text-lg font-semibold text-slate-900 line-clamp-2">
              {opportunity?.title}
            </h2>
            {opportunity && (
              <p className="text-sm text-slate-600 mt-1">
                {posterStyle.icon} Posted by {opportunity.poster_name || 'Gator Helper'}, {posterStyle.role} {opportunity.posted_by_relationship || ''}
                {opportunity.company?.name && ` @ ${opportunity.company.name}`}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {opportunity?.is_boosted && <Badge color="amber">⭐ Featured</Badge>}
              {isNew && <Badge color="sky">🆕 New</Badge>}
              {isClosingSoon && <Badge color="orange">⏱️ Closing Soon</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <SaveButton 
              oppId={opportunity.id} 
              saved={false}
              onToggle={handleSaveToggle}
            />
            <ShareButton 
              oppId={opportunity.id} 
              title={opportunity?.title || ''}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Meta - Company Info Section */}
        {opportunity && (
          <div className="px-4 py-3 flex flex-wrap gap-2 border-b text-xs">
            <MetaChip>{formatOpportunityType(opportunity.opportunity_type)}</MetaChip>
            <MetaChip>{formatLocationDisplay(opportunity.location_type, opportunity.city, opportunity.state)}</MetaChip>
            {opportunity.tags?.slice(0, 3).map(tag => (
              <MetaChip key={tag}>{tag}</MetaChip>
            ))}
          </div>
        )}

        {/* Body content */}
        <div className="p-4 space-y-6">

          {/* Description */}
          {opportunity.description && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About this Role</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {opportunity?.requirements?.length > 0 && (
            <Section title="Requirements">
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {opportunity.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Compensation */}
          {(opportunity?.compensation_min || opportunity?.compensation_max) && (
            <Section title="Compensation">
              <p className="text-sm text-slate-700">
                {opportunity.compensation_min && opportunity.compensation_max ? 
                  `$${opportunity.compensation_min.toLocaleString()} - $${opportunity.compensation_max.toLocaleString()}` :
                  opportunity.compensation_min ? 
                    `$${opportunity.compensation_min.toLocaleString()}+` :
                    `Up to $${opportunity.compensation_max.toLocaleString()}`
                }
                {opportunity.compensation_period && ` per ${opportunity.compensation_period}`}
              </p>
            </Section>
          )}

          {/* How to Apply Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              How to Apply
            </h3>
            
            {isPlatformApply ? (
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-violet-900 text-lg mb-1">Apply via Platform</h4>
                    <p className="text-violet-700 text-sm">
                      Send your application directly through the platform to this Gator Helper
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUserApply('message')}
                  disabled={hasApplied}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  {hasApplied ? '✓ Applied' : 'Apply via Platform →'}
                </Button>
              </div>
            ) : hasCustomApplicationEmail ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-lg mb-1">Apply via Email</h4>
                    <p className="text-blue-700 text-sm">
                      Click below to send your resume via email
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEmailApply}
                  disabled={hasApplied}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base"
                >
                  {hasApplied ? '✓ Applied' : 'Send Your Resume'}
                </Button>
              </div>
            ) : opportunity.external_apply_url || opportunity.contact_url ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <ExternalLink className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Apply on External Site</h4>
                    <p className="text-green-700 text-sm mb-3">
                      Click below to apply on the company's website:
                    </p>
                    <a 
                      href={opportunity.external_apply_url || opportunity.contact_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 font-medium hover:underline break-all"
                      onClick={() => trackEvent('opportunity_external_link_click', { id: opportunity.id })}
                    >
                      {opportunity.external_apply_url || opportunity.contact_url}
                    </a>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const url = opportunity.external_apply_url || opportunity.contact_url;
                    handleUserApply('external');
                    window.location.href = url;
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-base"
                >
                  Apply on External Site →
                </Button>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 text-center">
                <p className="text-slate-600">
                  Contact the poster for application details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Stats and Ask button only */}
        {opportunity && (
          <>
            <Separator />
            <div className="p-4 flex items-center justify-between bg-white sticky bottom-0 z-10">
              <div className="text-xs text-slate-600 flex gap-4">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {opportunity.save_count || 0} Saves
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {opportunity.question_count || 0} Questions
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {opportunity.apply_click_count || 0} Applies
                </span>
              </div>
              <div className="flex gap-2">
                <AskButton 
                  oppId={opportunity.id}
                  posterId={opportunity.created_by}
                  posterEmail={opportunity.created_by}
                  oppTitle={opportunity.title}
                  onAsked={handleAskQuestion}
                  size="sm"
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}