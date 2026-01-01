import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lightbulb, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Answer } from '@/entities/Answer';
import { HelpRequest } from '@/entities/HelpRequest';
import { JobRequest } from '@/entities/JobRequest';
import { base44 } from '@/api/base44Client';
import RecommendHelperModal from './RecommendHelperModal';
import ShareExternallyBox from './ShareExternallyBox';

const MAX_CHARS = 5000;

export default function AnswerComposer({ 
  question, 
  currentUser, 
  onAnswerPosted,
  autoFocus = false
}) {
  const textareaRef = useRef(null);
  
  // Auto-focus textarea when returning from auth
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);
  const { toast } = useToast();
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  // Anyone who is logged in can answer
  const canAnswer = !!currentUser;

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      toast({
        title: "Please write an answer",
        description: "Your answer cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (answerText.length > MAX_CHARS) {
      toast({
        title: "Answer too long",
        description: `Please keep your answer under ${MAX_CHARS} characters`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the answer
      const newAnswer = await Answer.create({
        question_id: question.id,
        answerer_user_id: currentUser.id,
        answerer_email: currentUser.email,
        answerer_name: currentUser.full_name || currentUser.email.split('@')[0],
        answerer_title: currentUser.current_position || currentUser.current_role,
        answerer_company: currentUser.current_company,
        answerer_years_experience: currentUser.years_experience,
        answerer_persona: currentUser.persona,
        answer_text: answerText.trim(),
        upvote_count: 0,
        is_best_answer: false
      });

      // Update question answer count in database
      // Use the _source field to know which entity to update
      const newCount = (Number(question.answer_count) || 0) + 1;
      console.log('Updating DB answer_count to:', newCount, 'source:', question._source);
      
      if (question._source === 'JobRequest') {
        JobRequest.update(question.id, { comments_count: newCount }).catch(err => {
          console.log('JobRequest update failed (expected if RLS):', err.message);
        });
      } else {
        HelpRequest.update(question.id, { answer_count: newCount }).catch(err => {
          console.log('HelpRequest update failed (expected if RLS):', err.message);
        });
      }

      // Award karma for posting an answer
      if (currentUser.family_group_id) {
        base44.functions.invoke('awardKarma', {
          familyGroupId: currentUser.family_group_id,
          parentUserId: currentUser.id,
          parentEmail: currentUser.email,
          actionType: 'answer',
          referenceId: newAnswer.id,
          description: 'Posted an answer'
        }).then(res => {
          console.log('Karma awarded for answer:', res?.data);
        }).catch(err => {
          console.log('Karma award failed (non-critical):', err.message);
        });
      }

      // Send email notification to the question poster
      // Handle cases where created_by is 'anonymous' - use student_email or other fallbacks
      console.log('📧 Attempting to send answer notification');
      console.log('📧 question.created_by:', question.created_by);
      console.log('📧 question.student_email:', question.student_email);
      console.log('📧 question.poster_email:', question.poster_email);
      console.log('📧 currentUser.email:', currentUser.email);
      
      const posterEmail = (question.created_by && question.created_by !== 'anonymous') 
        ? question.created_by 
        : question.student_email || question.poster_email;
      
      console.log('📧 Resolved posterEmail:', posterEmail);
      
      // Only send if valid email and not the same person answering their own question
      if (posterEmail && posterEmail.includes('@') && posterEmail !== currentUser.email) {
        console.log('📧 Conditions met, invoking sendAnswerNotification...');
        base44.functions.invoke('sendAnswerNotification', {
          questionId: question.id,
          questionTitle: question.title || question.role || 'Your question',
          posterEmail: posterEmail,
          posterName: question.poster_name || question.poster_first_name || question.student_name,
          answererName: currentUser.full_name || currentUser.email.split('@')[0],
          answererTitle: currentUser.current_position || currentUser.current_role,
          answererCompany: currentUser.current_company,
          answerPreview: answerText.trim()
        }).then(res => {
          console.log('Answer notification sent:', res?.data);
        }).catch(err => {
          console.log('Answer notification failed (non-critical):', err.message);
        });
      } else {
        console.log('No valid poster email found, skipping notification');
      }

      // Clear form
      setAnswerText('');

      toast({
        title: "✅ Answer posted!",
        description: "Thank you for sharing your wisdom (+10 karma)"
      });

      // Notify parent component to update UI immediately
      console.log('Answer created, calling onAnswerPosted callback');
      if (onAnswerPosted) {
        const answerWithDate = {
          ...newAnswer,
          created_date: new Date().toISOString()
        };
        console.log('Calling onAnswerPosted with:', answerWithDate);
        onAnswerPosted(answerWithDate);
      } else {
        console.warn('onAnswerPosted callback not provided');
      }

    } catch (err) {
      console.error('Failed to post answer:', err);
      toast({
        title: "Error",
        description: "Failed to post your answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show message if not logged in
  if (!canAnswer) {
    return null;
  }

  return (
    <div className="answer-composer">
      <h3 className="composer-title">Share what you've seen</h3>
      
      <Textarea
        ref={textareaRef}
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Short and real is perfect. What have you seen work in real life? (Even 2–3 sentences helps.)"
        rows={6}
        className="composer-textarea"
      />

      <div className="composer-footer">
        <span className="char-count">
          {answerText.length}/{MAX_CHARS} characters
        </span>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !answerText.trim()}
          className="submit-btn"
        >
          {isSubmitting ? (
            'Posting...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Post Answer
            </>
          )}
        </Button>
      </div>

      {/* Recommend Helper Button */}
      <div className="recommend-section">
        <Button
          variant="outline"
          onClick={() => setShowRecommendModal(true)}
          className="recommend-btn"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Know someone who can help? Tag them!
        </Button>

        {/* Share Externally Box */}
        <ShareExternallyBox question={question} currentUser={currentUser} />
      </div>

      {/* Tips */}
      <div className="tips-section">
        <h4>💡 Tips for helpful responses (keep it short):</h4>
        <ul>
          <li>Share what you've seen</li>
          <li>Be specific (one example is enough)</li>
          <li>Suggest one next step</li>
          <li>Optional: offer to connect them to someone</li>
        </ul>
      </div>

      {/* Recommend Helper Modal */}
      <RecommendHelperModal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        question={question}
        currentUser={currentUser}
      />

      <style jsx>{`
        .answer-composer {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          margin-top: 32px;
        }

        .composer-title {
          font-size: 20px;
          font-weight: 700;
          color: #0021A5;
          margin: 0 0 16px 0;
        }

        .composer-textarea {
          min-height: 150px;
          font-size: 16px;
          line-height: 1.6;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
          resize: vertical;
        }

        .composer-textarea:focus {
          border-color: #0021A5;
          outline: none;
        }

        .composer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .char-count {
          font-size: 13px;
          color: #9CA3AF;
        }

        .submit-btn {
          background: #FA4616;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #E03D0F;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tips-section {
          margin-top: 20px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 12px;
        }

        .recommend-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .recommend-btn {
          width: 100%;
          border: 2px dashed #0021A5;
          color: #0021A5;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          background: #F0F4FF;
        }

        .recommend-btn:hover {
          background: #E0E7FF;
          border-color: #001885;
        }

        .tips-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .tips-section ul {
          margin: 0;
          padding: 0 0 0 20px;
        }

        .tips-section li {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        @media (max-width: 640px) {
          .composer-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .char-count {
            text-align: center;
          }

          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}