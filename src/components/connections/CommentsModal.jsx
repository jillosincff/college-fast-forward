import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import UserAvatar from '@/components/common/UserAvatar';



// Simple in-memory storage for comments to persist across modal sessions
const commentStorage = new Map();

// Mock Comments API - replace with real API calls
const baseMockComments = [
  {
    id: 'comment1',
    user: {
      full_name: 'Sarah Johnson',
      persona: 'alumni',
      graduation_year: 2019,
      profile_image_url: null
    },
    message: "I went through a similar search last year. Happy to share what worked for me! The key is networking through informational interviews.",
    created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes_count: 3,
    is_top_comment: true,
    replies: [
      {
        id: 'reply1',
        user: {
          full_name: 'Mike Chen',
          persona: 'parent',
          profile_image_url: null
        },
        message: "Great advice! I'd also recommend checking out the UF Career Center's industry-specific resources.",
        created_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes_count: 1
      }
    ]
  },
  {
    id: 'comment2',
    user: {
      full_name: 'David Rodriguez',
      persona: 'alumni',
      graduation_year: 2020,
      profile_image_url: null
    },
    message: "I work at a similar company. Feel free to reach out if you want to chat about the interview process!",
    created_date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    likes_count: 5,
    is_top_comment: false,
    replies: []
  }
];

/**
 * Get comments for a specific request, including any user-added comments
 */
const getCommentsForRequest = (requestId) => {
  const storedComments = commentStorage.get(requestId) || [];
  // Merge stored comments with base mock comments, newest first
  return [...storedComments, ...baseMockComments];
};

/**
 * Add a comment to storage
 */
const addCommentToStorage = (requestId, comment) => {
  const existingComments = commentStorage.get(requestId) || [];
  commentStorage.set(requestId, [comment, ...existingComments]);
};

/**
 * Individual comment component with threading support
 */
const CommentItem = ({ comment, onLike, onReply, isReply = false }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(comment.id);
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  const getRoleBadgeColor = (persona) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      alumni: 'bg-green-100 text-green-800', 
      parent: 'bg-purple-100 text-purple-800'
    };
    return colors[persona] || colors.student;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''} mb-4`}
    >
      <div className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
        <UserAvatar 
          user={comment.user} 
          className="w-8 h-8 flex-shrink-0" 
        />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900">
                {comment.user?.full_name || 'Gator User'}
              </span>
              
              <Badge className={`text-xs border-0 ${getRoleBadgeColor(comment.user?.persona)}`}>
                {comment.user?.persona || 'student'}
              </Badge>
              
              {comment.user?.graduation_year && (
                <span className="text-xs text-slate-500">
                  UF '{String(comment.user.graduation_year).slice(-2)}
                </span>
              )}
              
              {comment.is_top_comment && (
                <Badge className="bg-amber-100 text-amber-800 text-xs border-amber-200">
                  ⭐ Top Comment
                </Badge>
              )}
            </div>
            
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {formatTimeAgo(comment.created_date)}
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-sm text-slate-700 mb-3 leading-relaxed">
            {comment.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
              }`}
              aria-label={`${isLiked ? 'Unlike' : 'Like'} this comment`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{(comment.likes_count || 0) + (isLiked ? 1 : 0)}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a thoughtful reply..."
                    className="text-sm min-h-[60px]"
                    maxLength={500}
                  />
                  <div className="flex flex-col gap-1">
                    <Button onClick={handleSubmitReply} size="sm" disabled={!replyText.trim()}>
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => setShowReplyForm(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              isReply={true}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * Comments Modal Component with threading and real-time features
 */
export default function CommentsModal({ isOpen, onClose, request, onCommentPosted }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && request) {
      loadComments();
    }
  }, [isOpen, request]);

  /**
   * Load comments for the request (now includes user-added comments)
   */
  const loadComments = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const requestComments = getCommentsForRequest(request.id);
      setComments(requestComments);
      trackEvent('comments_loaded', { requestId: request.id });
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle comment submission
   */
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Please write a comment',
        description: 'Comments cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNewComment = {
        id: `comment_${Date.now()}`,
        user: {
          full_name: user?.full_name || 'Current User',
          persona: user?.persona || 'student',
          graduation_year: user?.graduation_year,
          profile_image_url: user?.profile_image_url
        },
        message: newComment,
        created_date: new Date().toISOString(),
        likes_count: 0,
        is_top_comment: false,
        replies: []
      };

      // Add to storage for persistence
      addCommentToStorage(request.id, mockNewComment);
      
      // Update local state
      setComments(prev => [mockNewComment, ...prev]);
      setNewComment('');
      
      // Notify parent component that a comment has been posted
      if (onCommentPosted) {
        onCommentPosted(request.id);
      }
      
      toast({
        title: '💬 Comment Posted!',
        description: 'Your comment has been added to the discussion.',
      });
      
      trackEvent('comment_posted', { requestId: request.id });
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: 'Error posting comment',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle comment like
   */
  const handleLike = (commentId) => {
    trackEvent('comment_liked', { commentId, requestId: request.id });
    // In real app, this would make an API call
  };

  /**
   * Handle reply to comment
   */
  const handleReply = async (commentId, replyText) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockReply = {
        id: `reply_${Date.now()}`,
        user: {
          full_name: user?.full_name || 'Current User',
          persona: user?.persona || 'student',
          profile_image_url: user?.profile_image_url
        },
        message: replyText,
        created_date: new Date().toISOString(),
        likes_count: 0
      };

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), mockReply] }
          : comment
      ));
      
      toast({
        title: '💬 Reply Posted!',
        description: 'Your reply has been added.',
      });
      
      trackEvent('comment_reply_posted', { commentId, requestId: request.id });
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            Comments on "{request.title || request.role}"
          </DialogTitle>
          <DialogDescription>
            Join the discussion and share your insights
          </DialogDescription>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex gap-3">
            <UserAvatar user={user} className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, advice, or encouragement..."
                className="min-h-[80px] mb-3 resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {newComment.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className={`
                      ${newComment.trim() && !isSubmitting 
                        ? 'bg-[var(--uf-blue)] hover:bg-blue-700 text-white' 
                        : 'bg-slate-300 text-slate-600 cursor-not-allowed hover:bg-slate-300'
                      }
                      transition-all duration-200
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}