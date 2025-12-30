import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageSquare, Users, Eye } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

export default function PublicQuestionGate({ questionId, onSharePerspective }) {
  const handleSharePerspective = () => {
    // Store intent to redirect back after auth
    sessionStorage.setItem('pending_answer_question_id', questionId);
    
    if (onSharePerspective) {
      onSharePerspective();
    } else {
      // Default: trigger login with redirect back
      navigate('GatorAuth');
    }
  };

  const handleJoin = () => {
    sessionStorage.setItem('pending_answer_question_id', questionId);
    navigate('GatorAuth');
  };

  return (
    <div className="public-gate">
      <div className="gate-content">
        <h3>Want to help?</h3>
        <p>Share your perspective with this student.</p>
        
        <div className="gate-actions">
          <Button
            onClick={handleSharePerspective}
            className="share-perspective-btn"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Share a quick perspective
          </Button>
          
          <button 
            className="read-only-link"
            onClick={() => {/* Do nothing - just stay on page */}}
          >
            Just read for now
          </button>
          
          <Button
            variant="outline"
            onClick={handleJoin}
            className="join-btn"
          >
            <Users className="w-4 h-4 mr-2" />
            Join College Fast Forward
          </Button>
        </div>
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

        .gate-content h3 {
          font-size: 20px;
          font-weight: 700;
          color: #166534;
          margin: 0 0 8px 0;
        }

        .gate-content p {
          font-size: 15px;
          color: #374151;
          margin: 0 0 20px 0;
        }

        .gate-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .share-perspective-btn {
          background: #16A34A;
          color: white;
          font-weight: 600;
          padding: 14px 24px;
          border-radius: 10px;
          width: 100%;
          justify-content: center;
        }

        .share-perspective-btn:hover {
          background: #15803D;
        }

        .read-only-link {
          background: transparent;
          border: none;
          color: #6B7280;
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .read-only-link:hover {
          color: #374151;
        }

        .join-btn {
          width: 100%;
          justify-content: center;
          border-color: #D1D5DB;
          color: #374151;
        }

        .join-btn:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
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

          .gate-content h3 {
            font-size: 18px;
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