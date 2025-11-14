
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  MapPin,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import HelpOfferModal from './HelpOfferModal';
import CommentsModal from './CommentsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PosterInfo from '../common/PosterInfo'; // Added this import

const MasonryFeed = ({ requests, onOfferHelp, onMakeIntro, onOpenModal, onCommentPosted }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [helpedRequests, setHelpedRequests] = useState(new Set());
  const [likedRequests, setLikedRequests] = useState(new Set());
  const [selectedRequestForHelp, setSelectedRequestForHelp] = useState(null);
  const [selectedRequestForComments, setSelectedRequestForComments] = useState(null);

  const getBadgeForRequest = (request) => {
    if (request.urgency === 'Urgent') return {
      text: '🚨 URGENT',
      color: 'bg-red-500 text-white animate-pulse',
      priority: 3
    };
    if (request.urgency === 'Interviewing Now') return {
      text: '⚡ INTERVIEWING',
      color: 'bg-orange-500 text-white',
      priority: 2
    };
    if (request.is_featured) return {
      text: '✨ Featured',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      priority: 1
    };
    if ((request.offers_count || 0) + (request.intros_count || 0) >= 10) return {
      text: '🔥 Trending',
      color: 'bg-red-100 text-red-800',
      priority: 1
    };
    return null;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleHelpGatorClick = (request) => {
    if (!user) {
      toast({
        title: 'Sign in to help! 🐊',
        description: 'Join the Gator Network to start helping fellow Gators.',
        variant: 'destructive',
      });
      return;
    }

    if (helpedRequests.has(request.id)) {
      toast({
        title: 'Already helping! 🎉',
        description: 'You\'ve already offered to help this Gator.',
        duration: 3000,
      });
      return;
    }

    setSelectedRequestForHelp(request);
    trackEvent('help_gator_modal_opened', {
      requestId: request.id,
      posterPersona: request.poster?.persona
    });
  };

  const handleHelpOfferSuccess = (requestId) => {
    setHelpedRequests(prev => new Set([...prev, requestId]));
    onOfferHelp(requestId);
    setSelectedRequestForHelp(null);
  };

  const handleCommentsClick = (request) => {
    setSelectedRequestForComments(request);
    trackEvent('comments_modal_opened', { requestId: request.id });
  };

  const handleLike = (requestId) => {
    trackEvent('feed_card_liked', { requestId: requestId, liked: !likedRequests.has(requestId) });
    setLikedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const handleShare = (request) => {
    trackEvent('feed_card_shared', { requestId: request.id });
    const url = `${window.location.origin}/#Connections?request=${request.id}`;
    const text = `Help ${request.poster?.full_name || 'a fellow Gator'} with: ${request.title || request.role}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <>
      {selectedRequestForHelp && (
        <HelpOfferModal
          isOpen={!!selectedRequestForHelp}
          onClose={() => setSelectedRequestForHelp(null)}
          request={selectedRequestForHelp}
          poster={selectedRequestForHelp.poster}
          onHelpOffered={handleHelpOfferSuccess}
        />
      )}

      {selectedRequestForComments && (
        <CommentsModal
          isOpen={!!selectedRequestForComments}
          onClose={() => setSelectedRequestForComments(null)}
          request={selectedRequestForComments}
          onCommentPosted={onCommentPosted}
        />
      )}

      <div className="masonry-feed" style={{ columnCount: 3, columnGap: '1rem' }}>
        {requests.map((request, index) => {
          const badge = getBadgeForRequest(request);
          const isHelped = helpedRequests.has(request.id);
          const { poster } = request;

          return (
            <motion.div
              key={request.id}
              className="break-inside-avoid mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg border-slate-200/80 transition-all duration-300">
                <CardContent className="p-0 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="p-4">
                    <PosterInfo
                      user={poster}
                      postDate={request.created_date}
                    />

                    <h3
                      className="font-semibold text-slate-800 text-lg my-3 leading-snug cursor-pointer hover:text-blue-700"
                      onClick={() => onOpenModal(request.id)}
                    >
                      {request.title || request.role}
                    </h3>

                    {badge && (
                      <div className="mb-2">
                        <Badge className={`${badge.color} text-xs font-bold`}>{badge.text}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="px-4 flex-1">
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                      <Badge variant="outline" className="bg-slate-100 border-slate-200">
                        <Briefcase className="w-3 h-3 mr-1.5" />
                        {request.target_industry}
                      </Badge>
                      {(request.location_city || request.location_state) && (
                        <Badge variant="outline" className="bg-slate-100 border-slate-200">
                          <MapPin className="w-3 h-3 mr-1.5" />
                          {[request.location_city, request.location_state].filter(Boolean).join(', ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(request.id)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            likedRequests.has(request.id)
                              ? 'text-red-500'
                              : 'text-slate-500 hover:text-red-500'
                          }`}
                          aria-label={`${likedRequests.has(request.id) ? 'Unlike' : 'Like'} this request`}
                          style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                          <Heart className={`w-4 h-4 ${likedRequests.has(request.id) ? 'fill-current' : ''}`} />
                          <span className="font-medium">
                            {(request.likes_count || 0) + (likedRequests.has(request.id) ? 1 : 0)}
                          </span>
                        </button>

                        <button
                          onClick={() => handleCommentsClick(request)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                          aria-label="View comments for this request"
                          style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{request.comments_count || 0}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleHelpGatorClick(request)}
                          disabled={helpedRequests.has(request.id)}
                          className={`${
                            helpedRequests.has(request.id)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-[var(--uf-orange)] hover:bg-orange-600 text-white'
                          } font-semibold px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                          style={{ minHeight: '44px' }}
                          aria-label={helpedRequests.has(request.id) ? 'You have already helped this Gator' : 'Help this Gator with their request'}
                        >
                          {helpedRequests.has(request.id) ? (
                            <>
                              ✅ <span className="hidden sm:inline ml-2">Helped!</span>
                            </>
                          ) : (
                            <>
                              🐊 <span className="hidden sm:inline ml-2">Help this Gator</span>
                            </>
                          )}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-slate-600"
                              style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShare(request)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share on LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOpenModal(request.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default MasonryFeed;
