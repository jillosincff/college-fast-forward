import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';

export default function PublicQuestionGate({ questionId, onSharePerspective, onLightweightRespond, hasMoreResponses = false }) {
  // Extract share attribution from URL
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const shareSource = urlParams.get('src');
  const sharerRef = urlParams.get('ref');
  const isFromShare = shareSource === 'share';

  const handleSharePerspective = async () => {
    // Track gate click (Event 2) - only if from share link
    if (isFromShare) {
      trackEvent('shared_question_gate_clicked', {
        question_id: questionId,
        ref_sharer_user_id: sharerRef || null,
        cta_type: 'respond',
        timestamp: new Date().toISOString()
      });
    }

    // Use lightweight respond flow (email OTP, no account needed)
    if (onLightweightRespond) {
      onLightweightRespond();
    }
  };

  const handleSignIn = async () => {
    // Track gate click (Event 2) - only if from share link
    if (isFromShare) {
      trackEvent('shared_question_gate_clicked', {
        question_id: questionId,
        ref_sharer_user_id: sharerRef || null,
        cta_type: 'view_more',
        timestamp: new Date().toISOString()
      });
    }

    sessionStorage.setItem('pending_answer_question_id', questionId);
    
    // Store sharer ref for attribution tracking after auth
    if (sharerRef) {
      sessionStorage.setItem('share_ref_user_id', sharerRef);
    }
    
    const returnUrl = `${window.location.origin}/#QuestionDetail?id=${questionId}`;
    base44.auth.redirectToLogin(returnUrl);
  };

  return (
    <div className="public-gate">
      {/* Main CTA - Make it super clear no account needed */}
      <div className="main-cta-section">
        <div className="no-account-badge">
          <span>✉️</span>
          <span>No account needed — just verify your email</span>
        </div>
        
        <h3 className="cta-headline">Can you help this student?</h3>
        
        <p className="microcopy">
          Even 2–3 sentences of real-world perspective can make a difference.
        </p>
        
        <Button
          onClick={handleSharePerspective}
          className="share-perspective-btn"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Answer this question
        </Button>
        
        <p className="how-it-works">
          <strong>How it works:</strong> Enter your name & email → verify with a code → submit your answer. Takes ~1 minute.
        </p>
      </div>

      {/* Secondary options */}
      <div className="secondary-options">
        {hasMoreResponses && (
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="sign-in-btn"
          >
            Sign in to view all responses
          </Button>
        )}
        
        <p className="read-only-text">
          Just browsing? No problem — read as much as you'd like.
        </p>
      </div>

      <div className="community-norms">
        <h4>Community guidelines</h4>
        <ul>
          <li>Be respectful</li>
          <li>Share what you've seen</li>
          <li>No recruiting or pitching</li>
        </ul>
      </div>

      <style jsx>{`
        .public-gate {
          background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
          border: 2px solid #86EFAC;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
        }

        .main-cta-section {
          text-align: center;
        }

        .no-account-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #86EFAC;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #166534;
          margin-bottom: 16px;
        }

        .cta-headline {
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 8px 0;
        }

        .microcopy {
          font-size: 15px;
          color: #4B5563;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .share-perspective-btn {
          background: #16A34A;
          color: white;
          font-weight: 700;
          font-size: 16px;
          padding: 16px 32px;
          border-radius: 12px;
          width: 100%;
          max-width: 320px;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }

        .share-perspective-btn:hover {
          background: #15803D;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
        }

        .how-it-works {
          font-size: 13px;
          color: #6B7280;
          margin: 16px 0 0 0;
          line-height: 1.5;
        }

        .how-it-works strong {
          color: #374151;
        }

        .secondary-options {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #BBF7D0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .sign-in-btn {
          max-width: 280px;
          justify-content: center;
          border-color: #D1D5DB;
          color: #374151;
        }

        .sign-in-btn:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }

        .read-only-text {
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
          margin: 0;
        }

        .community-norms {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #BBF7D0;
        }

        .community-norms h4 {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
        }

        .community-norms ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .community-norms li {
          font-size: 13px;
          color: #6B7280;
        }

        .community-norms li::before {
          content: "•";
          margin-right: 6px;
          color: #9CA3AF;
        }

        @media (max-width: 640px) {
          .public-gate {
            padding: 20px 16px;
            border-radius: 12px;
          }

          .cta-headline {
            font-size: 18px;
          }

          .share-perspective-btn {
            font-size: 15px;
            padding: 14px 24px;
          }

          .community-norms ul {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}