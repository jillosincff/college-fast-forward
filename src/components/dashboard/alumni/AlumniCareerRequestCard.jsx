import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Lock, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

/**
 * Alumni Career Request Card
 * Prominently displayed on dashboard to encourage alumni to post their own career needs
 */
export default function AlumniCareerRequestCard({ hasExistingRequest = false }) {
  if (hasExistingRequest) {
    return null; // Don't show if they already have an active request
  }

  return (
    <Card className="alumni-career-card">
      <CardContent className="p-6">
        <div className="card-header">
          <div className="icon-wrapper">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="card-title">Need help with your next move?</h3>
        </div>
        
        <p className="card-subtitle">
          Post privately — visible only to fellow parents and alumni.
        </p>
        
        <p className="card-description">
          Whether it's a new role search, industry shift, or business advice, the network has your back — just like you have theirs.
        </p>

        <div className="options-preview">
          <span className="option-chip">💼 New job search</span>
          <span className="option-chip">🔄 Career transition</span>
          <span className="option-chip">🌐 Industry shift</span>
          <span className="option-chip">💡 Business advice</span>
        </div>

        <div className="privacy-note">
          <Lock className="w-4 h-4" />
          <span>Alumni requests are private — seen only by other parents and alumni.</span>
        </div>

        <Button 
          onClick={() => navigate('PostRequest?type=alumni')}
          className="cta-button"
        >
          Post a Career Request
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>

      <style jsx>{`
        .alumni-career-card {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 2px solid #FCD34D;
          border-radius: 16px;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #92400E;
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.95rem;
          font-weight: 600;
          color: #B45309;
          margin: 0 0 8px;
        }

        .card-description {
          font-size: 0.9rem;
          color: #78350F;
          line-height: 1.5;
          margin: 0 0 16px;
        }

        .options-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .option-chip {
          background: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: #78350F;
          border: 1px solid #FDE68A;
        }

        .privacy-note {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.7);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #78350F;
        }

        .alumni-career-card :global(.cta-button) {
          width: 100%;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
        }

        .alumni-career-card :global(.cta-button:hover) {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        }

        @media (max-width: 640px) {
          .card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </Card>
  );
}