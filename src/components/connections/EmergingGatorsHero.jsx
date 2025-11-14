import { Users, BrainCircuit } from 'lucide-react';

export default function EmergingGatorsHero({ onBrowse }) {
  const scrollToHowItWorks = () => {
    console.log("Scroll to how it works section");
  };

  return (
    <>
      <style jsx>{`
        .hero-section {
          background: linear-gradient(to right, #0021A5, #FA4616); /* Match student dashboard gradient */
          min-height: 240px;
          padding: 48px 24px;
          color: white;
          text-align: center;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .btn-primary-white {
          background: white;
          color: #0021A5; /* Match student dashboard button text color */
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-secondary-white {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary-white:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .btn-secondary-white:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .stat-item {
          font-size: 0.875rem;
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-actions .btn-primary-white,
          .hero-actions .btn-secondary-white {
            width: 200px;
            text-align: center;
          }
          
          .hero-stats {
            gap: 16px;
          }
        }
      `}</style>
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">✅ 847 students found help today</div>
          <h1 className="hero-title">Students Seeking Your Help</h1>
          <p className="hero-subtitle">
            Real students, real dreams, real opportunities to make a difference. 
            <strong> Your network could be their breakthrough.</strong>
          </p>
          <div className="hero-actions">
            <button onClick={onBrowse} className="btn-primary-white">View All Requests</button>
            <button onClick={scrollToHowItWorks} className="btn-secondary-white">How It Works</button>
          </div>
          <div className="hero-stats">
            <span className="stat-item">
              <Users size={16} /> 3+ new requests this week
            </span>
            <span className="stat-item">
              <BrainCircuit size={16} /> AI-matched by industry & goals
            </span>
          </div>
        </div>
      </div>
    </>
  );
}