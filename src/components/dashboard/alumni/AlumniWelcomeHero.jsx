import { Button } from '@/components/ui/button';
import { Heart, Briefcase, UserPlus, Sparkles } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function AlumniWelcomeHero({ user, stats, hasActivity = false }) {
  const firstName = user?.full_name?.split(' ')[0] || 'Gator';
  
  // If no activity yet - motivational banner
  if (!hasActivity) {
    return (
      <div className="alumni-hero inactive">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4" />
            Alumni Network
          </div>
          <h1 className="hero-title">
            Help a student today — earn karma and keep your network active.
          </h1>
          <p className="hero-subtitle">
            Answer questions, share opportunities, and build karma for your own career requests.
          </p>
          
          <div className="hero-actions">
            <Button 
              onClick={() => navigate('Connections')} 
              className="btn-primary"
            >
              <Heart className="w-4 h-4 mr-2" /> 
              Help a Student
            </Button>
            <Button 
              onClick={() => navigate('PostRequest?type=alumni')} 
              className="btn-secondary"
            >
              <Briefcase className="w-4 h-4 mr-2" /> 
              Post My Career Request
            </Button>
          </div>
        </div>

        <style jsx>{`
          .alumni-hero.inactive {
            background: linear-gradient(135deg, #0021A5 0%, #1E40AF 50%, #3B82F6 100%);
            padding: 32px 24px;
            color: white;
            border-radius: 1.5rem;
            margin: 1rem 0;
          }

          .hero-content {
            max-width: 700px;
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
          }

          .hero-title {
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 12px;
          }

          .hero-subtitle {
            font-size: 1rem;
            opacity: 0.9;
            line-height: 1.5;
          }

          .hero-actions {
            margin-top: 24px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .hero-actions :global(.btn-primary) {
            background: white;
            color: #0021A5;
            font-weight: 600;
          }

          .hero-actions :global(.btn-primary:hover) {
            background: #F0F4FF;
          }

          .hero-actions :global(.btn-secondary) {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            font-weight: 600;
          }

          .hero-actions :global(.btn-secondary:hover) {
            background: rgba(255, 255, 255, 0.25);
          }

          @media (max-width: 640px) {
            .hero-title {
              font-size: 1.5rem;
            }
            
            .hero-actions {
              flex-direction: column;
            }
            
            .hero-actions :global(button) {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // Active alumni - show karma status
  return (
    <div className="alumni-hero active">
      <div className="hero-content">
        <div className="karma-badge">
          <span className="karma-icon">⚡</span>
          Karma Active
        </div>
        <h1 className="hero-title">
          Your impact: {stats?.studentsHelped || 0} student{(stats?.studentsHelped || 0) !== 1 ? 's' : ''} helped this month!
        </h1>
        <p className="hero-subtitle">
          Your karma boosts visibility for your own career requests.
        </p>
        
        <div className="hero-actions">
          <Button 
            onClick={() => navigate('Connections')} 
            className="btn-primary"
          >
            <Heart className="w-4 h-4 mr-2" /> 
            Keep Helping
          </Button>
          <Button 
            onClick={() => navigate('PostRequest?type=alumni')} 
            className="btn-secondary"
          >
            <Briefcase className="w-4 h-4 mr-2" /> 
            Post Career Request
          </Button>
          <Button 
            onClick={() => navigate('GatorDirectory')} 
            className="btn-tertiary"
          >
            <UserPlus className="w-4 h-4 mr-2" /> 
            Invite Alumni
          </Button>
        </div>
      </div>

      <style jsx>{`
        .alumni-hero.active {
          background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);
          padding: 32px 24px;
          color: white;
          border-radius: 1.5rem;
          margin: 1rem 0;
        }

        .hero-content {
          max-width: 700px;
        }

        .karma-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .karma-icon {
          font-size: 18px;
        }

        .hero-title {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .hero-subtitle {
          font-size: 1rem;
          opacity: 0.9;
        }

        .hero-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-actions :global(.btn-primary) {
          background: white;
          color: #059669;
          font-weight: 600;
        }

        .hero-actions :global(.btn-secondary) {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-weight: 600;
        }

        .hero-actions :global(.btn-tertiary) {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.4);
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 1.5rem;
          }
          
          .hero-actions {
            flex-direction: column;
          }
          
          .hero-actions :global(button) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}