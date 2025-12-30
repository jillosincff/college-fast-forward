import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Lightweight Answer Composer
 * 
 * For verified lightweight responders (not full users)
 * - Rate limited: max 2 responses per minute
 * - Auto-strips links from first-time responders
 * - Flags posts for review
 */
export default function LightweightAnswerComposer({ 
  question, 
  responderInfo,
  onAnswerPosted 
}) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef(null);
  
  const MAX_CHARS = 2000;
  const MIN_CHARS = 50;

  // Auto-scroll to composer on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, []);

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setText(value);
      setCharCount(value.length);
    }
  };

  // Strip URLs from text (anti-spam for first-time responders)
  const stripLinks = (text) => {
    // Remove URLs
    return text.replace(/https?:\/\/[^\s]+/gi, '[link removed]')
               .replace(/www\.[^\s]+/gi, '[link removed]');
  };

  const handleSubmit = async () => {
    if (!text.trim() || text.length < MIN_CHARS) {
      toast({
        title: "Answer too short",
        description: `Please write at least ${MIN_CHARS} characters to be helpful.`,
        variant: "destructive"
      });
      return;
    }

    if (!responderInfo?.email || !responderInfo?.firstName) {
      toast({
        title: "Verification required",
        description: "Please verify your email first.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit via backend function (handles rate limiting, spam checks)
      const response = await base44.functions.invoke('submitLightweightAnswer', {
        questionId: question.id,
        questionType: question._source || 'HelpRequest',
        answerText: stripLinks(text.trim()),
        responderEmail: responderInfo.email,
        responderFirstName: responderInfo.firstName,
        responderRole: responderInfo.role || 'other'
      });

      if (response?.data?.success) {
        setSubmitted(true);
        setText('');
        
        toast({
          title: "🎉 Thank you!",
          description: "Your answer has been submitted and will help this student."
        });

        // Notify parent component
        if (onAnswerPosted && response.data.answer) {
          onAnswerPosted(response.data.answer);
        }
      } else {
        throw new Error(response?.data?.error || 'Failed to submit answer');
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      toast({
        title: "Couldn't submit answer",
        description: err.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already submitted
  if (submitted) {
    return (
      <div className="lightweight-composer submitted">
        <div className="success-message">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h3>Thanks for helping!</h3>
          <p>Your perspective has been shared with the student.</p>
          <p className="cta">
            Want to help more students?{' '}
            <button 
              onClick={() => window.location.href = '/#GatorAuth'}
              className="join-link"
            >
              Join College Fast Forward →
            </button>
          </p>
        </div>
        
        <style jsx>{`
          .lightweight-composer.submitted {
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border: 2px solid #86EFAC;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
          }
          
          .success-message h3 {
            font-size: 20px;
            font-weight: 700;
            color: #166534;
            margin: 16px 0 8px;
          }
          
          .success-message p {
            color: #374151;
            margin: 0 0 16px;
          }
          
          .cta {
            font-size: 14px;
            color: #6B7280;
          }
          
          .join-link {
            background: none;
            border: none;
            color: #0021A5;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
          }
          
          .join-link:hover {
            color: #001580;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lightweight-composer">
      <div className="composer-header">
        <h3>Share your perspective</h3>
        <p>
          Responding as <strong>{responderInfo?.firstName}</strong> ({responderInfo?.email})
        </p>
      </div>

      <div className="composer-body">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Share advice, insights, or encouragement based on your experience..."
          className="answer-input"
          rows={6}
        />
        
        <div className="composer-footer">
          <div className="char-count">
            <span className={charCount < MIN_CHARS ? 'warning' : ''}>
              {charCount}/{MAX_CHARS}
            </span>
            {charCount < MIN_CHARS && (
              <span className="min-hint">
                ({MIN_CHARS - charCount} more needed)
              </span>
            )}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || charCount < MIN_CHARS}
            className="submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>

        <div className="guidelines-reminder">
          <AlertTriangle className="w-4 h-4" />
          <span>Keep it helpful, respectful, and free of self-promotion.</span>
        </div>
      </div>

      <style jsx>{`
        .lightweight-composer {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 24px;
        }

        .composer-header {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          padding: 16px 20px;
          border-bottom: 1px solid #BFDBFE;
        }

        .composer-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1E40AF;
          margin: 0 0 4px;
        }

        .composer-header p {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .composer-header strong {
          color: #1F2937;
        }

        .composer-body {
          padding: 20px;
        }

        .composer-body :global(.answer-input) {
          min-height: 150px;
          resize: vertical;
          font-size: 15px;
          border-color: #E5E7EB;
        }

        .composer-body :global(.answer-input:focus) {
          border-color: #0021A5;
          ring-color: #0021A5;
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

        .char-count .warning {
          color: #F59E0B;
        }

        .min-hint {
          color: #F59E0B;
          margin-left: 8px;
        }

        .composer-body :global(.submit-btn) {
          background: #16A34A;
          color: white;
          font-weight: 600;
        }

        .composer-body :global(.submit-btn:hover) {
          background: #15803D;
        }

        .composer-body :global(.submit-btn:disabled) {
          background: #9CA3AF;
        }

        .guidelines-reminder {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 10px 12px;
          background: #FEF3C7;
          border-radius: 8px;
          font-size: 13px;
          color: #92400E;
        }

        @media (max-width: 640px) {
          .composer-header {
            padding: 12px 16px;
          }

          .composer-header h3 {
            font-size: 16px;
          }

          .composer-body {
            padding: 16px;
          }

          .composer-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .char-count {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}