import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Eye, ChevronUp, Award, Share2 } from 'lucide-react';
import { HelpRequest } from '@/entities/HelpRequest';
import { JobRequest } from '@/entities/JobRequest';
import { Answer } from '@/entities/Answer';
import UserAvatar from '@/components/common/UserAvatar';
import AnswerCard from '@/components/answers/AnswerCard';
import AnswerComposer from '@/components/answers/AnswerComposer';
import MessageAndHelpModal from '@/components/connections/MessageAndHelpModal';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function QuestionDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const questionId = params.id;

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes', 'newest', 'oldest'
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAnswerAuthor, setSelectedAnswerAuthor] = useState(null);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    setIsLoading(true);
    try {
      // Try to get from HelpRequest first, then JobRequest
      let q = null;
      let questionSource = null;
      
      try {
        const helpRequests = await HelpRequest.filter({ id: questionId });
        if (helpRequests && helpRequests.length > 0) {
          q = helpRequests[0];
          questionSource = 'HelpRequest';
        }
      } catch {
        // Not found in HelpRequest, will try JobRequest
      }
      
      if (!q) {
        try {
          const jobRequests = await JobRequest.filter({ id: questionId });
          if (jobRequests && jobRequests.length > 0) {
            q = jobRequests[0];
            questionSource = 'JobRequest';
          }
        } catch {
          // Not found in JobRequest either
        }
      }
      
      // Fallback: search in full lists
      if (!q) {
        const [helpRequests, jobRequests] = await Promise.all([
          HelpRequest.list('-created_date', 500),
          JobRequest.list('-created_date', 500)
        ]);
        
        q = helpRequests.find(item => item.id === questionId);
        if (q) {
          questionSource = 'HelpRequest';
        } else {
          q = jobRequests.find(item => item.id === questionId);
          if (q) questionSource = 'JobRequest';
        }
      }
      
      if (!q) {
        toast({
          title: "Question not found",
          variant: "destructive"
        });
        navigate('Connections');
        return;
      }
      
      // Load answers FIRST so we can get accurate count
      const allAnswers = await Answer.filter({ question_id: questionId });
      const sorted = sortAnswers(allAnswers, sortBy);
      setAnswers(sorted);
      
      // NORMALIZE: Use actual answers count from DB as source of truth
      const normalizedQuestion = {
        ...q,
        _source: questionSource,
        answer_count: sorted.length, // Use actual count from answers
        view_count: Number(q.view_count) || Number(q.views_count) || 0,
        total_upvotes: Number(q.total_upvotes) || 0,
        has_best_answer: Boolean(q.has_best_answer)
      };
      
      console.log('Question loaded and normalized:', {
        id: normalizedQuestion.id,
        source: questionSource,
        answer_count: normalizedQuestion.answer_count,
        actual_answers: sorted.length
      });
      
      setQuestion(normalizedQuestion);

      // Increment view count silently
      if (questionSource === 'HelpRequest') {
        HelpRequest.update(questionId, { 
          view_count: normalizedQuestion.view_count + 1 
        }).catch(() => {});
      } else {
        JobRequest.update(questionId, { 
          views_count: normalizedQuestion.view_count + 1 
        }).catch(() => {});
      }

    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortAnswers = (answerList, sort) => {
    let sorted = [...answerList];
    
    // Always put best answer first
    const bestIndex = sorted.findIndex(a => a.is_best_answer);
    let bestAnswer = null;
    if (bestIndex > -1) {
      bestAnswer = sorted.splice(bestIndex, 1)[0];
    }

    // Sort the rest
    if (sort === 'upvotes') {
      sorted.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
    } else if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }

    // Put best answer at the top
    if (bestAnswer) {
      sorted.unshift(bestAnswer);
    }

    return sorted;
  };

  useEffect(() => {
    if (answers.length > 0) {
      setAnswers(sortAnswers(answers, sortBy));
    }
  }, [sortBy]);

  const handleAnswerPosted = (newAnswer) => {
    console.log('handleAnswerPosted called with:', newAnswer);
    
    // Add new answer to the top of the list
    setAnswers(prev => {
      const updated = [newAnswer, ...prev];
      console.log('Answers list updated, new length:', updated.length);
      return updated;
    });
    
    // Update question stats immediately (optimistic update)
    setQuestion(prev => {
      if (!prev) {
        console.error('No previous question state!');
        return prev;
      }
      const currentCount = Number(prev.answer_count) || 0;
      const newCount = currentCount + 1;
      console.log('Updating answer_count:', currentCount, '→', newCount);
      return {
        ...prev,
        answer_count: newCount
      };
    });
  };

  const handleUpvoteChange = (answerId, newCount) => {
    setAnswers(prev => prev.map(a => 
      a.id === answerId ? { ...a, upvote_count: newCount } : a
    ));

    // Recalculate total upvotes
    const totalUpvotes = answers.reduce((sum, a) => 
      sum + (a.id === answerId ? newCount : (a.upvote_count || 0)), 0
    );
    
    HelpRequest.update(questionId, { total_upvotes: totalUpvotes }).catch(console.error);
  };

  const handleMarkBest = async (answerId) => {
    try {
      // Remove best from all other answers
      for (const a of answers) {
        if (a.is_best_answer) {
          await Answer.update(a.id, { is_best_answer: false });
        }
      }

      // Mark this one as best
      await Answer.update(answerId, { is_best_answer: true });
      await HelpRequest.update(questionId, { has_best_answer: true });

      // Update local state
      setAnswers(prev => prev.map(a => ({
        ...a,
        is_best_answer: a.id === answerId
      })));

      setQuestion(prev => ({ ...prev, has_best_answer: true }));

      toast({
        title: "✅ Best answer marked!",
        description: "The answerer has been notified"
      });

    } catch (err) {
      console.error('Failed to mark best answer:', err);
      throw err;
    }
  };

  const handleMessageAuthor = (answer) => {
    setSelectedAnswerAuthor({
      id: answer.answerer_user_id,
      email: answer.answerer_email,
      full_name: answer.answerer_name
    });
    setShowMessageModal(true);
  };

  const isQuestionAsker = question?.student_id === user?.id || 
                          question?.student_email === user?.email ||
                          question?.created_by === user?.email;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading question...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top-color: #0021A5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p { color: #6B7280; }
        `}</style>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const posterType = question.poster_type || 'student';
  const isAnonymous = question.is_anonymous && posterType === 'parent';
  const posterName = isAnonymous ? 'Anonymous Parent' : (question.student_name || 'Gator');

  return (
    <div className="question-detail-page">
      {/* Back Navigation */}
      <div className="nav-header">
        <Button
          variant="ghost"
          onClick={() => navigate('Connections')}
          className="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Questions
        </Button>
      </div>

      <div className="content-container">
        {/* Question Section */}
        <div className="question-section">
          <div className="question-header">
            {/* Poster Type Badge */}
            {posterType !== 'student' && (
              <span className={`poster-badge ${posterType}`}>
                {posterType === 'parent' ? '👨‍👩‍👧 Parent Question' : '🎯 Alumni Question'}
              </span>
            )}
            
            {/* Poster Info */}
            <div className="poster-info">
              {isAnonymous ? (
                <div className="anonymous-avatar">
                  <span>👨‍👩‍👧</span>
                </div>
              ) : (
                <UserAvatar 
                  user={{ full_name: posterName }}
                  className="poster-avatar"
                  showFallback={true}
                />
              )}
              <div className="poster-details">
                <span className="poster-name">{posterName}</span>
                {posterType === 'student' && question.student_major && (
                  <span className="poster-meta">
                    {question.student_year && `${question.student_year} • `}
                    {question.student_major}
                  </span>
                )}
                <span className="post-time">
                  Posted {moment(question.created_date).fromNow()}
                </span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <p className="question-text">"{question.description}"</p>
            
            {/* Tags */}
            <div className="question-tags">
              {question.help_types?.map((type, idx) => (
                <span key={idx} className="tag">
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
              {question.industry && (
                <span className="tag industry">{question.industry}</span>
              )}
            </div>

            {/* Stats - use answers.length as source of truth since DB may not update due to RLS */}
            <div className="question-stats">
              <span className="stat">
                <MessageSquare className="w-4 h-4" />
                {answers.length} answers
              </span>
              <span className="stat">
                <Eye className="w-4 h-4" />
                {question.view_count || 0} views
              </span>
              {question.total_upvotes > 0 && (
                <span className="stat">
                  <ChevronUp className="w-4 h-4" />
                  {question.total_upvotes} upvotes
                </span>
              )}
              {question.has_best_answer && (
                <span className="stat best">
                  <Award className="w-4 h-4" />
                  Best answer selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="answers-section">
          <div className="answers-header">
            <h2>Answers ({answers.length})</h2>
            
            {answers.length > 0 && (
              <div className="sort-controls">
                <span>Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="upvotes">Most Upvoted</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            )}
          </div>

          {/* Answer List */}
          <div className="answers-list">
            {answers.map(answer => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                currentUser={user}
                isQuestionAsker={isQuestionAsker}
                onUpvoteChange={handleUpvoteChange}
                onMarkBest={handleMarkBest}
                onMessage={handleMessageAuthor}
              />
            ))}
          </div>
          
          {answers.length === 0 && !isLoading && (
            <div className="no-answers">
              <MessageSquare className="w-12 h-12 text-gray-300" />
              <h3>No answers yet</h3>
              <p>Be the first to share your advice!</p>
            </div>
          )}

          {/* Answer Composer */}
          <AnswerComposer
            question={question}
            currentUser={user}
            onAnswerPosted={handleAnswerPosted}
          />
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedAnswerAuthor && (
        <MessageAndHelpModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedAnswerAuthor(null);
          }}
          request={{
            ...question,
            created_by: selectedAnswerAuthor.email,
            poster_name: selectedAnswerAuthor.full_name
          }}
        />
      )}

      <style jsx>{`
        .question-detail-page {
          min-height: 100vh;
          background: #F9FAFB;
          padding-bottom: 60px;
        }

        .nav-header {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          color: #6B7280;
          font-weight: 600;
        }

        .back-btn:hover {
          color: #0021A5;
        }

        .content-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .question-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .question-header {
          margin-bottom: 20px;
        }

        .poster-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .poster-badge.parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .poster-badge.alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .poster-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .poster-avatar, .anonymous-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .anonymous-avatar {
          background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .poster-details {
          display: flex;
          flex-direction: column;
        }

        .poster-name {
          font-size: 16px;
          font-weight: 700;
          color: #0021A5;
        }

        .poster-meta {
          font-size: 14px;
          color: #6B7280;
        }

        .post-time {
          font-size: 13px;
          color: #9CA3AF;
        }

        .question-content {
          border-top: 1px solid #F3F4F6;
          padding-top: 20px;
        }

        .question-text {
          font-size: 20px;
          line-height: 1.6;
          color: #1F2937;
          font-style: italic;
          margin: 0 0 20px 0;
        }

        .question-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: #F3F4F6;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 16px;
          text-transform: capitalize;
        }

        .tag.industry {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .question-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6B7280;
        }

        .stat.best {
          color: #10B981;
          font-weight: 600;
        }

        .answers-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .answers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .answers-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6B7280;
        }

        .sort-select {
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .sort-select:focus {
          outline: none;
          border-color: #0021A5;
        }

        .answers-list {
          margin-bottom: 24px;
        }

        .no-answers {
          text-align: center;
          padding: 48px 20px;
        }

        .no-answers h3 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 16px 0 8px;
        }

        .no-answers p {
          font-size: 14px;
          color: #9CA3AF;
        }

        @media (max-width: 640px) {
          .question-text {
            font-size: 18px;
          }

          .question-stats {
            gap: 12px;
          }

          .stat {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}