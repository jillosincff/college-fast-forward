
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ExternalLink, Paperclip, X, Linkedin, Share2, Bookmark, UserPlus } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
// NetworkModal and IntroModal imports are not needed here if they are handled by the parent
// import NetworkModal from './NetworkModal';
// import IntroModal from './IntroModal';
// AnimatePresence is not needed if modals are handled by the parent
// import { AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import StatsRow from '../connections/StatsRow';
// trackMessage and trackIntro are not directly used in this component anymore if modals are external
// import { trackMessage } from '@/functions/trackMessage';
// import { trackIntro } from '@/functions/trackIntro';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'G';

const DetailItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
    </div>
    <div>
      <dt className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</dt>
      <dd className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{children}</dd>
    </div>
  </div>
);

export default function RequestDetailDialog({ request, onClose, currentUser, onOfferHelp, onMakeIntro }) {
  const { toast } = useToast();
  // Removed showNetworkModal and showIntroModal as modals are handled by parent
  const [isSaved, setIsSaved] = useState(false);
  // Removed stats state as StatsRow now directly uses request properties

  if (!request) return null;

  const handleOfferHelpClick = () => {
    trackEvent('offer_help_clicked', { requestId: request.id, source: 'detail_modal' });
    onOfferHelp(request);
    onClose(); // Close detail view to show the modal
  };

  const handleMakeIntroClick = () => {
    trackEvent('make_intro_clicked', { requestId: request.id, source: 'detail_modal' });
    onMakeIntro(request);
    onClose(); // Close detail view to show the modal
  };
  
  // Removed handleMessageSent and handleIntroSent as they updated the removed stats state
  // and were primarily called by the now-external modals.
  // The parent component handling onOfferHelp/onMakeIntro should manage message/intro tracking.

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({ title: !isSaved ? 'Request saved!' : 'Request unsaved.' });
    trackEvent('save_toggled', { requestId: request.id, saved: !isSaved });
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#Connections?requestId=${request.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard!' });
    trackEvent('request_shared', { requestId: request.id, source: 'detail_modal' });
  };
  
  const posterName = request.poster_name || 'Gator Student';
  const posterImage = request.poster_profile_image;
  const isOwnRequest = currentUser && request.created_by === currentUser.email;

  // Construct posterUser object for modals
  const posterUser = { 
    name: posterName, 
    profileImage: posterImage, 
    email: request.created_by,
    major: request.major,
    graduationYear: request.graduation_year,
    locationPreference: request.location_preference,
    // Add any other relevant fields from request that modals might need
  };

  const formattedDescription = request.description?.split('\n').map((paragraph, index) => (
    <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed">{paragraph}</p>
  ));

  return (
    <>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <DialogHeader className="relative">
          <div className="flex items-start gap-4">
            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
              <AvatarImage src={posterImage} />
              <AvatarFallback className="bg-gradient-to-br from-[var(--uf-blue)] to-[var(--uf-orange)] text-white font-bold text-xl">
                {getInitials(posterName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{posterName}</DialogTitle>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span>{request.major || 'UF Student'}</span>
                {request.graduation_year && <span className="font-semibold text-[var(--uf-blue)]">Class of {request.graduation_year}</span>}
                {request.location_preference && <span>{request.location_preference}</span>}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={handleShare} data-testid={`share-btn-${request.id}`}>
              <Share2 className="w-4 h-4" />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onClose}>
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Role & Status */}
        <div className="my-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{request.role}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">{request.job_type === 'full_time' ? 'Full-Time' : 'Internship'}</Badge>
            {request.urgency && <Badge className="bg-red-100 text-red-800 border-red-200">{request.urgency}</Badge>}
            {request.target_industry && <Badge variant="outline">{request.target_industry}</Badge>}
            {request.location_preference?.toLowerCase().includes('remote') && <Badge variant="outline">Remote OK</Badge>}
          </div>

          {/* Engagement Stats */}
          <div className="mb-4">
            <StatsRow
              messagesCount={request.messages_count}
              introsCount={request.intros_count}
              isBoosted={request.is_boosted}
              lastActivityAt={request.last_activity_at}
              showLastActivity={true}
              variant="modal"
              showZeroAsNew={false}
            />
            {/* Removed dynamic text based on messagesCount/introsCount because StatsRow now handles display */}
            {/* {(stats.messagesCount > 0 || stats.introsCount > 0) && (
              <p className="text-xs text-slate-500 mt-2">
                {stats.messagesCount > 0 && `${stats.messagesCount} people have messaged this student.`}
                {stats.messagesCount > 0 && stats.introsCount > 0 && ' '}
                {stats.introsCount > 0 && `${stats.introsCount} people have made intros.`}
              </p>
            )} */}
          </div>
        </div>

        {/* About / Ask */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">About this ask</h3>
          <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">
            {formattedDescription}
          </div>
        </div>

        {/* Attachments & Links */}
        {(request.resume_url || request.linkedin_url) && (
          <div className="mt-6 pt-6 border-t dark:border-slate-700">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {request.resume_url && (
                <DetailItem icon={Paperclip} label="Resume">
                  <a href={request.resume_url} target="_blank" rel="noopener noreferrer" className="text-[var(--uf-blue)] hover:underline inline-flex items-center gap-1">
                    View Resume <ExternalLink className="w-3 h-3" />
                  </a>
                </DetailItem>
              )}
              {request.linkedin_url && (
                <DetailItem icon={Linkedin} label="LinkedIn">
                   <a href={request.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[var(--uf-blue)] hover:underline inline-flex items-center gap-1">
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </DetailItem>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isOwnRequest && (
        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800 border-t dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Button onClick={handleOfferHelpClick} data-testid={`offer-help-btn-${request.id}`} className="flex-1 sm:flex-none bg-[var(--uf-orange)] hover:bg-orange-600 text-white">
              <Heart className="w-4 h-4 mr-2" />Offer Help
            </Button>
            <Button onClick={handleMakeIntroClick} data-testid={`make-intro-btn-${request.id}`} variant="outline" className="flex-1 sm:flex-none border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-blue-50">
              <UserPlus className="w-4 h-4 mr-2" />Make Intro
            </Button>
          </div>
          <Button 
            onClick={handleSave} 
            data-testid={`save-btn-${request.id}`}
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 ${isSaved ? 'text-[var(--uf-blue)]' : 'text-slate-500'}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save for Later'}
          </Button>
        </DialogFooter>
      )}

      {/* AnimatePresence and Modals removed as they are now handled by the parent component */}
      {/* <AnimatePresence>
        {showNetworkModal && (
          <NetworkModal
            isOpen={showNetworkModal}
            onClose={() => setShowNetworkModal(false)}
            request={request}
            poster={posterUser}
            user={currentUser}
            onMessageSent={handleMessageSent}
            onMakeIntro={() => {
              setShowNetworkModal(false);
              setShowIntroModal(true);
            }}
          />
        )}
        {showIntroModal && (
          <IntroModal
            isOpen={showIntroModal}
            onClose={() => setShowIntroModal(false)}
            request={request}
            student={posterUser}
            helper={currentUser}
            onIntroSent={handleIntroSent}
          />
        )}
      </AnimatePresence> */}
    </>
  );
}
