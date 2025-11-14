
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  MapPin,
  Briefcase,
  Star,
  Zap,
  Trophy,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import { trackEvent } from '@/components/utils/analytics';
import HelpOfferModal from './HelpOfferModal';
import CommentsModal from './CommentsModal';
// Removed PosterInfo import as its functionality is now inlined
import RequestCardContent from './RequestCardContent'; // Import the new component

/**
 * Enhanced Masonry Feed with simplified infinite scroll and animations
 * Creates an engaging, dynamic user experience with "wow" moments
 */
const EnhancedMasonryFeed = ({ requests, onOfferHelp, onMakeIntro, onOpenModal, onCommentPosted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayedRequests, setDisplayedRequests] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [helpedRequests, setHelpedRequests] = useState(new Set());
  const [likedRequests, setLikedRequests] = useState(new Set());
  const [selectedRequestForHelp, setSelectedRequestForHelp] = useState(null);
  const [selectedRequestForComments, setSelectedRequestForComments] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalHelps, setTotalHelps] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Initialize feed with first batch
  useEffect(() => {
    if (requests.length > 0) {
      setDisplayedRequests(requests.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
      setHasMore(requests.length > ITEMS_PER_PAGE);
    }
  }, [requests]);

  // Simple load more function without external dependency
  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = requests.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedRequests(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < requests.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoadingMore(false);
    }, 1000);
  }, [currentPage, requests, displayedRequests.length, isLoadingMore, hasMore]);

  // Scroll event listener for manual infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
      if (hasMore && !isLoadingMore) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreItems, hasMore, isLoadingMore]);

  // Enhanced badge system with priority and animations
  const getBadgeForRequest = (request) => {
    const badges = [];
    
    if (request.urgency === 'Urgent') {
      badges.push({ 
        text: '🚨 URGENT', 
        color: 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30',
        priority: 4
      });
    }
    
    if (request.urgency === 'Interviewing Now') {
      badges.push({ 
        text: '⚡ INTERVIEWING', 
        color: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
        priority: 3
      });
    }
    
    if (request.is_featured) {
      badges.push({ 
        text: '✨ FEATURED', 
        color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg',
        priority: 2
      });
    }
    
    const totalActivity = (request.offers_count || 0) + (request.intros_count || 0);
    if (totalActivity >= 10) {
      badges.push({ 
        text: '🔥 TRENDING', 
        color: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg',
        priority: 2
      });
    }

    if (request.is_boosted) {
      badges.push({ 
        text: '🚀 BOOSTED', 
        color: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
        priority: 1
      });
    }

    // Return highest priority badge
    return badges.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0] || null;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
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
    setTotalHelps(prev => prev + 1);
    
    // Trigger celebration for milestones
    if ((totalHelps + 1) % 5 === 0) {
      toast({
        title: `🎉 ${totalHelps + 1} Helps and counting!`,
        description: 'You\'re making a real difference in the Gator community!',
        duration: 4000,
      });
    }
    
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
    
    if (navigator.share) {
      navigator.share({ title: text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast({
        title: 'Link copied!',
        description: 'Share this with your network to help a fellow Gator.',
      });
    }
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: (index) => ({
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <>
      {/* Help Offer Modal */}
      {selectedRequestForHelp && (
        <HelpOfferModal
          isOpen={!!selectedRequestForHelp}
          onClose={() => setSelectedRequestForHelp(null)}
          request={selectedRequestForHelp}
          poster={selectedRequestForHelp.poster}
          onHelpOffered={handleHelpOfferSuccess}
        />
      )}

      {/* Comments Modal */}
      {selectedRequestForComments && (
        <CommentsModal
          isOpen={!!selectedRequestForComments}
          onClose={() => setSelectedRequestForComments(null)}
          request={selectedRequestForComments}
          onCommentPosted={onCommentPosted}
        />
      )}

      {/* Enhanced Feed */}
      <div 
        className="masonry-grid"
        style={{
          columnCount: 'auto',
          columnWidth: '320px',
          columnGap: '1.5rem',
          width: '100%'
        }}
      >
        <AnimatePresence>
          {displayedRequests.map((request, index) => {
            const badge = getBadgeForRequest(request);
            const isHelped = helpedRequests.has(request.id);
            const { poster } = request;
            
            // Determine poster persona for network badge
            const posterPersona = poster?.persona || ['student', 'alumni', 'parent'][Math.floor(Math.random() * 3)];

            return (
              <motion.div
                key={request.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="break-inside-avoid mb-6"
                style={{ minWidth: '300px' }}
              >
                <Card className="h-full flex flex-col group overflow-hidden rounded-2xl shadow-sm border-slate-200/80 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Enhanced Card Header */}
                    <div className="p-5 relative">
                      {/* Gradient accent for special posts */}
                      {badge && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-orange-500" />
                      )}
                      
                      <div className="flex items-start gap-3 mb-4">
                        <UserAvatar user={poster} className="h-10 w-10 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 truncate">
                              {poster?.full_name || 'Gator User'}
                            </span>
                            {/* Network Badge */}
                            <span className={`network-badge ${posterPersona} inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold`}>
                              {posterPersona === 'parent' && '👨‍💼 Parent'}
                              {posterPersona === 'alumni' && '🎓 Alumni'}
                              {posterPersona === 'student' && '🎒 Student'}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatTimeAgo(request.created_date)}
                          </span>
                        </div>
                      </div>

                      <motion.h3
                        className="font-bold text-slate-800 text-lg mb-3 leading-snug cursor-pointer hover:text-blue-700 transition-colors"
                        onClick={() => onOpenModal(request.id)}
                        whileHover={{ x: 4 }}
                      >
                        {request.title || request.role}
                      </motion.h3>
                      
                      {/* Urgency Indicators */}
                      <div className="urgency-indicators flex flex-wrap gap-2 mb-3">
                        {(request.offers_count || 0) > 15 && (
                          <span className="urgency-badge hot bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-medium">
                            🔥 {request.offers_count || 0} people interested
                          </span>
                        )}
                        {new Date() - new Date(request.created_date) < 6 * 60 * 60 * 1000 && (
                          <span className="urgency-badge time bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-medium">
                            ⏰ Posted {formatTimeAgo(request.created_date)}
                          </span>
                        )}
                        {posterPersona === user?.persona && (
                          <span className="urgency-badge match bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                            🎯 Similar background
                          </span>
                        )}
                      </div>
                      
                      {badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mb-3"
                        >
                          <Badge className={`${badge.color} text-xs font-bold px-3 py-1 rounded-full`}>
                            {badge.text}
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced Card Body */}
                    <div className="px-5 pb-5 flex-1">
                      <RequestCardContent description={request.description} />
                      
                      {/* Enhanced Metadata */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {request.target_industry && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {request.target_industry}
                          </Badge>
                        )}
                        
                        {(request.location_city || request.location_state) && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <MapPin className="w-3 h-3 mr-1" />
                            {[request.location_city, request.location_state].filter(Boolean).join(', ')}
                          </Badge>
                        )}
                        
                        {request.job_type && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {request.job_type.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      {/* Activity Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{request.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{(request.offers_count || 0) + (request.intros_count || 0)} offers</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(request.id)}
                            className={`flex items-center gap-1.5 text-sm transition-colors ${
                              likedRequests.has(request.id) 
                                ? 'text-red-500' 
                                : 'text-slate-500 hover:text-red-500'
                            }`}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                          >
                            <Heart className={`w-4 h-4 ${likedRequests.has(request.id) ? 'fill-current' : ''}`} />
                            <span className="font-medium">
                              {(request.likes_count || 0) + (likedRequests.has(request.id) ? 1 : 0)}
                            </span>
                          </motion.button>
                        
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCommentsClick(request)}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{request.comments_count || 0}</span>
                          </motion.button>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleHelpGatorClick(request)}
                              disabled={isHelped}
                              className={`
                                ${isHelped 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100 cursor-default' 
                                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                                } 
                                font-bold px-4 py-2 rounded-full text-sm transition-all duration-300 transform
                              `}
                              style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                              {isHelped ? (
                                <>
                                  <Star className="w-4 h-4 mr-1 fill-current" />
                                  Helped!
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-1" />
                                  Help this Gator
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-8">
          <Button
            onClick={loadMoreItems}
            disabled={isLoadingMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
          >
            {isLoadingMore ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Load More Opportunities
              </>
            )}
          </Button>
        </div>
      )}

      {/* End Message */}
      {!hasMore && displayedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">You've seen it all!</h3>
          <p className="text-slate-600">Check back later for new opportunities to help fellow Gators.</p>
        </motion.div>
      )}

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        .network-badge.parent { 
          background: #ff6b35; 
          color: white; 
        }
        .network-badge.alumni { 
          background: #4a90e2; 
          color: white; 
        }
        .network-badge.student { 
          background: #7cb342; 
          color: white; 
        }
        
        .urgency-badge.hot { 
          background: rgba(255,0,0,0.1); 
          border: 1px solid rgba(255,0,0,0.2);
        }
        .urgency-badge.time { 
          background: rgba(255,165,0,0.1); 
          border: 1px solid rgba(255,165,0,0.2);
        }
        .urgency-badge.match { 
          background: rgba(0,255,0,0.1); 
          border: 1px solid rgba(0,255,0,0.2);
        }

        @media (max-width: 768px) {
          .masonry-grid {
            column-count: 1 !important;
            column-width: auto !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .masonry-grid {
            column-count: 2 !important;
          }
        }
        
        @media (min-width: 1025px) {
          .masonry-grid {
            column-count: 3 !important;
          }
        }
        
        @media (min-width: 1400px) {
          .masonry-grid {
            column-count: 4 !important;
          }
        }

        /* The line-clamp-3 class is now handled internally by RequestCardContent if needed */
      `}</style>
    </>
  );
};

export default EnhancedMasonryFeed;
