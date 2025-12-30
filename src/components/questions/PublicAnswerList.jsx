import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Lock } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import moment from 'moment';
import { navigate } from '@/components/utils/navigation';

// Simplified answer card for public view (no upvote counts, no profile links)
function PublicAnswerCard({ answer }) {
  return (
    <div className="public-answer-card">
      <div className="answer-header">
        <div className="answerer-avatar-placeholder">
          <span>{answer.answerer_name?.charAt(0) || 'A'}</span>
        </div>
        <div className="answerer-info">
          <span className="answerer-name">{answer.answerer_name || 'Community Member'}</span>
          {answer.answerer_title && (
            <span className="answerer-title">
              {answer.answerer_title}
              {answer.answerer_company && ` at ${answer.answerer_company}`}
            </span>
          )}
          <span className="answer-time">{moment(answer.created_date).fromNow()}</span>
        </div>
      </div>

      <div className="answer-content">
        <p>{answer.answer_text}</p>
      </div>

      {answer.is_best_answer && (
        <div className="best-answer-badge">
          ✓ Best Answer
        </div>
      )}

      <style jsx>{`
        .public-answer-card {
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .answer-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .answerer-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #4338CA;
          flex-shrink: 0;
        }

        .answerer-info {
          display: flex;
          flex-direction: column;
        }

        .answerer-name {
          font-weight: 600;
          color: #1F2937;
          font-size: 14px;
        }

        .answerer-title {
          font-size: 13px;
          color: #6B7280;
        }

        .answer-time {
          font-size: 12px;
          color: #9CA3AF;
        }

        .answer-content {
          padding-left: 52px;
        }

        .answer-content p {
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          white-space: pre-wrap;
        }

        .best-answer-badge {
          display: inline-block;
          background: #D1FAE5;
          color: #065F46;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 16px;
          margin-top: 12px;
          margin-left: 52px;
        }

        @media (max-width: 640px) {
          .public-answer-card {
            padding: 16px;
            border-radius: 8px;
          }

          .answer-content {
            padding-left: 0;
            margin-top: 12px;
          }

          .answer-content p {
            font-size: 14px;
          }

          .best-answer-badge {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function PublicAnswerList({ answers, questionId }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_COUNT = 2;
  
  const visibleAnswers = showAll ? answers : answers.slice(0, VISIBLE_COUNT);
  const hiddenCount = answers.length - VISIBLE_COUNT;

  const handleViewMore = () => {
    // Store intent and redirect to auth
    sessionStorage.setItem('pending_answer_question_id', questionId);
    navigate('GatorAuth');
  };

  if (answers.length === 0) {
    return (
      <div className="no-answers-public">
        <p>No answers yet. Be the first to help!</p>
        <style jsx>{`
          .no-answers-public {
            text-align: center;
            padding: 32px;
            color: #6B7280;
          }
          .no-answers-public p {
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="public-answer-list">
      {visibleAnswers.map(answer => (
        <PublicAnswerCard key={answer.id} answer={answer} />
      ))}

      {!showAll && hiddenCount > 0 && (
        <button 
          className="view-more-btn"
          onClick={handleViewMore}
        >
          <Lock className="w-4 h-4" />
          View {hiddenCount} more response{hiddenCount > 1 ? 's' : ''} (join or sign in)
        </button>
      )}

      <style jsx>{`
        .public-answer-list {
          margin-top: 16px;
        }

        .view-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          background: #F9FAFB;
          border: 2px dashed #D1D5DB;
          border-radius: 12px;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .view-more-btn:hover {
          background: #F3F4F6;
          border-color: #9CA3AF;
          color: #374151;
        }
      `}</style>
    </div>
  );
}