import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Flag, Heart, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import UserAvatar from '@/components/common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock Comment entity - in real app this would be imported
const Comment = {
  filter: async (query) => {
    // Mock comments for demonstration
    return [
      {
        id: 'comment1',
        request_id: query.request_id,
        message: "I went through a similar search last year. Happy to share what worked for me! The key is networking through informational interviews.",
        created_by: 'sarah.johnson@ufl.edu',
        created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: {
          full_name: 'Sarah Johnson',
          persona: 'alumni',
          profile_image_url: null,
          graduation_year: 2019
        },
        likes_count: 3,
        is_top_comment: true
      },
      {
        id: 'comment2', 
        request_id: query.request_id,
        message: "Great advice! I'd also recommend checking out the UF Career Center's industry-specific resources.",
        created_by: 'mike.chen@ufl.edu',
        created_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: {
          full_name: 'Mike Chen',
          persona: 'parent',
          profile_image_url: null
        },
        likes_count: 1,
        is_top_comment: false
      }
    ];
  },
  create: async (data) => {
    // Mock creation
    return {
      id: `comment_${Date.now()}`,
      ...data,
      created_date: new Date().toISOString(),
      likes_count: 0,
      is_top_comment: false
    };
  }
};

const CommentItem = ({ comment, onLike, onReport }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(comment.id);
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
      className="flex gap-3 p-3 rounded-lg bg-white border border-slate-100"
    >
      <UserAvatar 
        user={comment.user} 
        className="w-8 h-8 flex-shrink-0" 
      />
      
      <div className="flex-1 min-w-0">
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
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">
              {formatTimeAgo(comment.created_date)}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReport(comment.id)} className="text-red-600">
                  <Flag className="w-3 h-3 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <p className="text-sm text-slate-700 leading-relaxed mb-2">
          {comment.message}
        </p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            <span>{(comment.likes_count || 0) + (isLiked ? 1 : 0)}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommentSection({ request, isOpen, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      loadComments();
    }
  }, [isOpen, request]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await Comment.filter({ request_id: request.id });
      setComments(fetchedComments || []);
      trackEvent('comments_viewed', { requestId: request.id });
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast({
        title: 'Error loading comments',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join the conversation.',
        variant: 'destructive'
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Please add a comment',
        description: 'Share your thoughts or advice!',
        variant: 'destructive'
      });
      return;
    }

    if (newComment.length > 500) {
      toast({
        title: 'Comment too long',
        description: 'Please keep comments under 500 characters.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = await Comment.create({
        request_id: request.id,
        message: newComment.trim(),
        user: user
      });
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      toast({
        title: '💬 Comment posted!',
        description: 'Thanks for contributing to the discussion.',
      });
      
      trackEvent('comment_posted', { 
        requestId: request.id,
        commentLength: newComment.length 
      });

    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: 'Error posting comment',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    trackEvent('comment_liked', { commentId, requestId: request.id });
    toast({
      title: '❤️ Liked!',
      description: 'Thanks for engaging with the community.',
      duration: 2000
    });
  };

  const handleReportComment = (commentId) => {
    trackEvent('comment_reported', { commentId, requestId: request.id });
    toast({
      title: '🚩 Reported',
      description: 'Thank you for helping keep our community safe.',
      duration: 3000
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t border-slate-200 bg-slate-50 p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">
            Discussion ({comments.length})
          </h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Add Comment Section */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <UserAvatar user={user} className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1">
              <Textarea
                placeholder={comments.length > 0 ? "Add to the discussion..." : "Be the first to comment—share your advice!"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">
                  {newComment.length}/500 characters
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-gator-blue hover:bg-gator-blue/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onReport={handleReportComment}
              />
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No comments yet.</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}