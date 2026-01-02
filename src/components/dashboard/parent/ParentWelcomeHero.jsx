import { Button } from '@/components/ui/button';
import { Heart, Briefcase } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ParentWelcomeHero({ user, stats }) {
  return (
    <>
      <style jsx>{`
        .hero-section {
          background: linear-gradient(to right, #0021A5, #FA4616);
          padding: 48px 24px;
          color: white;
          border-radius: 1.5rem;
          margin: 1rem 0;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-top: 8px;
          max-width: 600px;
        }

        .hero-actions {
          margin-top: 24px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary-white {
          background: white;
          color: #0021A5;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-secondary-white {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .hero-stats {
          margin-top: 24px;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 24px;
          width: 100%;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }
      `}</style>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome, {user?.full_name.split(' ')[0] || 'Parent'}!</h1>
          <p className="hero-subtitle">You are the bridge to opportunity. Tap into your network to help a student today.</p>
          
          <div className="hero-actions">
            <Button onClick={() => navigate('Connections')} className="btn-primary-white"><Heart className="w-4 h-4 mr-2" /> See Who Needs Help</Button>
            <Button onClick={() => navigate('PostOpportunity')} className="btn-secondary-white"><Briefcase className="w-4 h-4 mr-2" /> Share an Opportunity</Button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">{stats?.connectionsMade || 0}</span>
              <span className="stat-label">Introductions<br/>Made</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats?.studentsHelped || 0}</span>
              <span className="stat-label">Students<br/>Helped</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats?.opportunitiesPosted || 0}</span>
              <span className="stat-label">Opportunities<br/>Posted</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}