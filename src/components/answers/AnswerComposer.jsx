import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Answer } from '@/entities/Answer';
import { HelpRequest } from '@/entities/HelpRequest';
import { JobRequest } from '@/entities/JobRequest';
import { base44 } from '@/api/base44Client';
import ReferralSection from './ReferralSection';

const MAX_CHARS = 5000;

// Helper to extract student first name
const getStudentFirstName = (question) => {
  if (question?.poster_first_name) return question.poster_first_name;
  if (question?.poster_name) {
    // Handle "Last, First" format
    const parts = question.poster_name.split(',').map(p => p.trim());
    if (parts.length >= 2) return parts[1].split(' ')[0];
    return question.poster_name.split(' ')[0];
  }
  if (question?.student_name) return question.student_name.split(' ')[0];
  return 'this student';
};

export default function AnswerComposer({ 
  question, 
  currentUser, 
  onAnswerPosted,
  autoFocus = false,
  answerCount = 0
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

      // Award karma for posting an answer (parents and alumni)
      // Award karma even without family_group_id - awardKarma will handle finding linked students
      if (currentUser.persona === 'parent' || currentUser.persona === 'alumni' || currentUser.roles?.includes('parent') || currentUser.roles?.includes('alumni')) {
        base44.functions.invoke('awardKarma', {
          familyGroupId: currentUser.family_group_id || null,
          parentUserId: currentUser.id,
          parentEmail: currentUser.email,
          actionType: 'answer',
          referenceId: newAnswer.id,
          description: 'Posted an answer'
        }).then(res => {
          console.log('Karma awarded for answer:', res?.data);
          if (res?.data?.boost_multiplier > 0) {
            toast({
              title: "⚡ Karma Boost Active!",
              description: `Your linked student's requests are now boosted for ${res.data.boost_multiplier >= 3 ? '48h (Platinum)' : res.data.boost_multiplier >= 2 ? '48h (Gold)' : '48h (Silver)'}`,
            });
          }
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
      console.log('📧 question._original_created_by:', question._original_created_by);
      console.log('📧 currentUser.email:', currentUser.email);
      
      // Try multiple fallback fields for poster email
      // Priority: poster_email (new field) > created_by (if valid) > student_email
      let posterEmail = null;
      if (question.poster_email && question.poster_email.includes('@')) {
        // poster_email is always stored, even for anonymous posts
        posterEmail = question.poster_email;
      } else if (question.created_by && question.created_by !== 'anonymous' && question.created_by.includes('@')) {
        posterEmail = question.created_by;
      } else if (question._original_created_by && question._original_created_by.includes('@')) {
        // _original_created_by may be set during normalization for anonymous posts
        posterEmail = question._original_created_by;
      } else if (question.student_email && question.student_email.includes('@')) {
        posterEmail = question.student_email;
      }
      
      console.log('📧 Resolved posterEmail:', posterEmail);
      
      // Only send if valid email and not the same person answering their own question
      if (posterEmail && posterEmail.includes('@') && posterEmail !== currentUser.email) {
        console.log('📧 Conditions met, invoking sendAnswerNotification...');
        base44.functions.invoke('sendAnswerNotification', {
          questionId: question.id,
          questionTitle: question.title || question.role || 'Your question',
          posterEmail: posterEmail,
          posterName: question.poster_first_name || question.poster_name?.split(' ')[0] || question.student_name?.split(' ')[0],
          answererName: currentUser.full_name || currentUser.email.split('@')[0],
          answererTitle: currentUser.current_position || currentUser.current_role,
          answererCompany: currentUser.current_company,
          answerPreview: answerText.trim()
        }).then(res => {
          console.log('📧 ✅ Answer notification response:', JSON.stringify(res?.data));
        }).catch(err => {
          console.error('📧 ❌ Answer notification FAILED:', err.message, err);
        });
      } else {
        console.log('📧 ⚠️ Skipping notification - posterEmail:', posterEmail, 'currentUser:', currentUser.email);
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

  const studentName = getStudentFirstName(question);
  const headerText = answerCount === 0 ? 'Be the first to help' : 'Add your perspective';
  const ctaText = answerCount === 0 ? `Help ${studentName}` : 'Share Your Advice';

  return (
    <div className="answer-composer">
      <h3 className="composer-title">{headerText}</h3>
      
      <Textarea
        ref={textareaRef}
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Short and real is perfect. What have you seen work in real life?"
        rows={5}
        className="composer-textarea"
      />

      <div className="composer-meta">
        <span className="char-count">
          {answerText.length}/{MAX_CHARS} characters
        </span>
      </div>

      {/* Inline tip - minimal and subtle */}
      <p className="inline-tip">
        <span>💡</span> 2-3 sentences is plenty. Be specific.
      </p>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !answerText.trim()}
        className="submit-btn"
      >
        {isSubmitting ? (
          'Posting...'
        ) : (
          <>
            {ctaText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Collapsed Referral Section */}
      <ReferralSection question={question} currentUser={currentUser} collapsed={true} />



      <style jsx>{`
        .answer-composer {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }

        .composer-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .composer-textarea {
          min-height: 120px;
          font-size: 16px;
          line-height: 1.6;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          padding: 12px;
          resize: vertical;
          width: 100%;
        }

        .composer-textarea:focus {
          border-color: #0021A5;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 33, 165, 0.1);
        }

        .composer-meta {
          margin-top: 8px;
        }

        .char-count {
          font-size: 13px;
          color: #9CA3AF;
        }

        .inline-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6B7280;
          margin: 8px 0 16px 0;
        }

        .inline-tip span {
          flex-shrink: 0;
        }

        .submit-btn {
          width: 100%;
          background: #0021A5 !important;
          color: white;
          font-weight: 600;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-btn:hover:not(:disabled) {
          background: #001A84 !important;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .answer-composer {
            padding: 16px;
          }

          .composer-title {
            font-size: 16px;
          }

          .composer-textarea {
            font-size: 16px; /* Prevent iOS zoom */
          }
        }
      `}</style>
    </div>
  );
}