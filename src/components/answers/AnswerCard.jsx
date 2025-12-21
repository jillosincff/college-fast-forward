import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, MessageSquare, Mail, Award, Clock } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Upvote } from '@/entities/Upvote';
import { Answer } from '@/entities/Answer';
import moment from 'moment';

export default function AnswerCard({ 
  answer, 
  currentUser, 
  isQuestionAsker = false,
  onUpvoteChange,
  onMarkBest,
  onMessage 
}) {
  const { toast } = useToast();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvote_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user already upvoted this answer
  useEffect(() => {
    const checkUpvote = async () => {
      if (!currentUser?.id || !answer?.id) return;
      
      try {
        const existing = await Upvote.filter({
          answer_id: answer.id,
          user_id: currentUser.id
        });
        setUpvoted(existing.length > 0);
      } catch (err) {
        console.error('Failed to check upvote status:', err);
      }
    };
    
    checkUpvote();
  }, [answer?.id, currentUser?.id]);

  const handleUpvote = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Please log in",
        description: "You must be logged in to upvote",
        variant: "destructive"
      });
      return;
    }

    // Can't upvote own answer
    if (answer.answerer_user_id === currentUser.id) {
      toast({
        title: "Can't upvote your own answer",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (upvoted) {
        // Remove upvote
        const existing = await Upvote.filter({
          answer_id: answer.id,
          user_id: currentUser.id
        });
        
        if (existing.length > 0) {
          await Upvote.delete(existing[0].id);
          
          // Update answer upvote count
          const newCount = Math.max(0, upvoteCount - 1);
          await Answer.update(answer.id, { upvote_count: newCount });
          
          setUpvoted(false);
          setUpvoteCount(newCount);
          
          if (onUpvoteChange) onUpvoteChange(answer.id, newCount);
        }
      } else {
        // Add upvote
        await Upvote.create({
          answer_id: answer.id,
          user_id: currentUser.id,
          user_email: currentUser.email
        });
        
        // Update answer upvote count
        const newCount = upvoteCount + 1;
        await Answer.update(answer.id, { upvote_count: newCount });
        
        setUpvoted(true);
        setUpvoteCount(newCount);
        
        if (onUpvoteChange) onUpvoteChange(answer.id, newCount);
        
        toast({
          title: "⬆️ Upvoted!",
          description: "You found this answer helpful"
        });
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      toast({
        title: "Error",
        description: "Failed to save your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkBest = async () => {
    if (!isQuestionAsker) return;
    
    try {
      if (onMarkBest) {
        await onMarkBest(answer.id);
      }
    } catch (err) {
      console.error('Failed to mark best answer:', err);
      toast({
        title: "Error",
        description: "Failed to mark as best answer",
        variant: "destructive"
      });
    }
  };

  const timeAgo = moment(answer.created_date).fromNow();

  return (
    <div className={`answer-card ${answer.is_best_answer ? 'best-answer' : ''}`}>
      {/* Best Answer Badge */}
      {answer.is_best_answer && (
        <div className="best-answer-badge">
          <Award className="w-4 h-4" />
          Best Answer
        </div>
      )}

      <div className="answer-layout">
        {/* Upvote Section - Left Side */}
        <div className="upvote-section">
          <button
            onClick={handleUpvote}
            disabled={isLoading}
            className={`upvote-button ${upvoted ? 'upvoted' : ''}`}
            aria-label={upvoted ? 'Remove upvote' : 'Upvote this answer'}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <span className={`upvote-count ${upvoted ? 'upvoted' : ''}`}>
            {upvoteCount}
          </span>
        </div>

        {/* Answer Content - Right Side */}
        <div className="answer-content">
          {/* Author Info */}
          <div className="author-section">
            <UserAvatar 
              user={{ 
                full_name: answer.answerer_name,
                email: answer.answerer_email 
              }} 
              className="author-avatar"
              showFallback={true}
            />
            <div className="author-details">
              <div className="author-name-row">
                <span className="author-name">{answer.answerer_name}</span>
                {answer.answerer_persona === 'parent' && (
                  <span className="persona-badge parent">👨‍👩‍👧 Parent</span>
                )}
                {answer.answerer_persona === 'alumni' && (
                  <span className="persona-badge alumni">🎯 Alumni</span>
                )}
              </div>
              <div className="author-meta">
                {answer.answerer_title && (
                  <span className="author-title">
                    {answer.answerer_title}
                    {answer.answerer_company && ` at ${answer.answerer_company}`}
                  </span>
                )}
                {answer.answerer_years_experience && (
                  <span className="author-experience">
                    • {answer.answerer_years_experience} years
                  </span>
                )}
              </div>
              <div className="post-time">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            </div>
          </div>

          {/* Answer Text */}
          <div className="answer-text">
            {answer.answer_text}
          </div>

          {/* Actions */}
          <div className="answer-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isLoading}
              className={`action-btn ${upvoted ? 'upvoted' : ''}`}
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              {upvoted ? 'Upvoted' : 'Upvote'} ({upvoteCount})
            </Button>

            {onMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMessage(answer)}
                className="action-btn"
              >
                <Mail className="w-4 h-4 mr-1" />
                Message {answer.answerer_name?.split(' ')[0]}
              </Button>
            )}

            {/* Mark as Best - Only for question asker */}
            {isQuestionAsker && !answer.is_best_answer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkBest}
                className="action-btn mark-best"
              >
                <Award className="w-4 h-4 mr-1" />
                Mark as Best Answer
              </Button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .answer-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .answer-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .answer-card.best-answer {
          border: 2px solid #10B981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, white 100%);
        }

        .best-answer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #10B981;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .answer-layout {
          display: flex;
          gap: 16px;
        }

        .upvote-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 48px;
        }

        .upvote-button {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid #E5E7EB;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
        }

        .upvote-button:hover:not(:disabled) {
          border-color: #FA4616;
          color: #FA4616;
          transform: scale(1.05);
        }

        .upvote-button.upvoted {
          background: #FFF4ED;
          border-color: #FA4616;
          color: #FA4616;
        }

        .upvote-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upvote-count {
          font-size: 14px;
          font-weight: 700;
          color: #6B7280;
        }

        .upvote-count.upvoted {
          color: #FA4616;
        }

        .answer-content {
          flex: 1;
          min-width: 0;
        }

        .author-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .author-details {
          flex: 1;
        }

        .author-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .author-name {
          font-size: 16px;
          font-weight: 700;
          color: #0021A5;
        }

        .persona-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .persona-badge.parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .persona-badge.alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .author-meta {
          font-size: 14px;
          color: #6B7280;
          margin-top: 2px;
        }

        .author-title {
          color: #374151;
        }

        .author-experience {
          color: #9CA3AF;
        }

        .post-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 4px;
        }

        .answer-text {
          font-size: 16px;
          line-height: 1.7;
          color: #374151;
          white-space: pre-wrap;
          margin-bottom: 16px;
        }

        .answer-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #F3F4F6;
        }

        .action-btn {
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
        }

        .action-btn:hover {
          color: #374151;
          background: #F9FAFB;
        }

        .action-btn.upvoted {
          color: #FA4616;
        }

        .action-btn.mark-best {
          color: #10B981;
        }

        .action-btn.mark-best:hover {
          background: #ECFDF5;
          color: #059669;
        }

        @media (max-width: 640px) {
          .answer-layout {
            flex-direction: column;
          }

          .upvote-section {
            flex-direction: row;
            gap: 8px;
          }

          .answer-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}