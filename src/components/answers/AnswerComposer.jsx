import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lightbulb } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Answer } from '@/entities/Answer';
import { HelpRequest } from '@/entities/HelpRequest';
import { JobRequest } from '@/entities/JobRequest';

const MAX_CHARS = 5000;

export default function AnswerComposer({ 
  question, 
  currentUser, 
  onAnswerPosted 
}) {
  const { toast } = useToast();
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only parents and alumni can answer
  const canAnswer = currentUser?.persona === 'parent' || 
                    currentUser?.persona === 'alumni' ||
                    currentUser?.roles?.includes('parent') ||
                    currentUser?.roles?.includes('alumni');

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

      // Clear form
      setAnswerText('');

      toast({
        title: "✅ Answer posted!",
        description: "Thank you for sharing your wisdom"
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

  // Show message for students
  if (!canAnswer) {
    return (
      <div className="student-message-box">
        <Lightbulb className="w-5 h-5 text-blue-500" />
        <div>
          <h4>💡 Want to add your perspective?</h4>
          <p>
            Students can't answer questions directly, but you can:
          </p>
          <ul>
            <li>• Reply to existing answers with your thoughts</li>
            <li>• Message parents to continue the conversation</li>
            <li>• Share this question with friends who can help</li>
          </ul>
        </div>

        <style jsx>{`
          .student-message-box {
            background: #EFF6FF;
            border: 1px solid #BFDBFE;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            gap: 16px;
          }

          .student-message-box h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1E40AF;
            margin: 0 0 8px 0;
          }

          .student-message-box p {
            font-size: 14px;
            color: #374151;
            margin: 0 0 8px 0;
          }

          .student-message-box ul {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .student-message-box li {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 4px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="answer-composer">
      <h3 className="composer-title">Share Your Advice</h3>
      
      <Textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Share your experience and advice. Be specific - what did you learn? What would you do differently?"
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

      {/* Tips */}
      <div className="tips-section">
        <h4>💡 Tips for great answers:</h4>
        <ul>
          <li>Share your personal experience</li>
          <li>Be specific with examples</li>
          <li>Explain your reasoning</li>
          <li>Offer to chat more if helpful</li>
        </ul>
      </div>

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