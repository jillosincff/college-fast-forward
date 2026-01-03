import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

/**
 * Post-Answer Thank You Component
 * Shows after a parent/alumni submits an answer to a student question
 */
export default function PostAnswerThankYou({ 
  user, 
  studentsHelpedThisMonth = 0,
  hasCareerRequest = false,
  onClose 
}) {
  const isAlumni = user?.persona === 'alumni' || user?.roles?.includes('alumni');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <div className="success-icon">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="headline">Thank you for paying it forward! 🎉</h2>
        
        <p className="subtext">
          Your answer just helped a UF student.<br />
          That's <strong>{studentsHelpedThisMonth}</strong> student{studentsHelpedThisMonth !== 1 ? 's' : ''} you've supported this month.
        </p>

        <div className="karma-notice">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>
            Your karma is now boosting visibility for any career requests you post.
          </span>
        </div>

        <div className="action-buttons">
          {!hasCareerRequest && isAlumni && (
            <Button
              onClick={() => {
                onClose?.();
                navigate('PostRequest?type=alumni');
              }}
              className="btn-primary"
            >
              Post a Career Request
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          <Button
            onClick={() => {
              onClose?.();
              navigate('MyImpact');
            }}
            variant="outline"
            className="btn-secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            See Your Impact
          </Button>
        </div>

        {onClose && (
          <button onClick={onClose} className="dismiss-link">
            Continue browsing
          </button>
        )}
      </div>

      <style jsx>{`
        .thank-you-container {
          text-align: center;
          padding: 32px 24px;
        }

        .success-icon {
          margin-bottom: 16px;
        }

        .headline {
          font-size: 1.5rem;
          font-weight: 700;
          color: #166534;
          margin: 0 0 12px;
        }

        .subtext {
          font-size: 1rem;
          color: #374151;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .subtext strong {
          color: #059669;
          font-weight: 700;
        }

        .karma-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 1px solid #FCD34D;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #92400E;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .thank-you-container :global(.btn-primary) {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          width: 100%;
        }

        .thank-you-container :global(.btn-primary:hover) {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        }

        .thank-you-container :global(.btn-secondary) {
          width: 100%;
        }

        .dismiss-link {
          background: none;
          border: none;
          color: #6B7280;
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
        }

        .dismiss-link:hover {
          color: #374151;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}