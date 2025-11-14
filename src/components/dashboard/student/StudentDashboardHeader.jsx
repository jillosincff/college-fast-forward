
export default function StudentDashboardHeader({ user }) {
  return (
    <>
      <style jsx>{`
        .student-dashboard-hero {
          position: relative;
          background: linear-gradient(135deg, #0021A5 0%, #0021A5 42%, #5A2D7E 70%, #FA4616 100%);
          background-image: 
            linear-gradient(135deg, rgba(0, 33, 165, 0.85) 0%, rgba(0, 33, 165, 0.75) 42%, rgba(90, 45, 126, 0.8) 70%, rgba(250, 70, 22, 0.85) 100%),
            url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/c035843a2_IMG_0892.jpg');
          background-size: cover;
          background-position: center 60%;
          background-repeat: no-repeat;
          padding: 3rem 2rem;
          text-align: center;
          color: white;
          overflow: hidden;
        }

        .student-dashboard-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
          z-index: 1;
        }

        .student-dashboard-hero::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.15)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.12)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="70" cy="80" r="1.2" fill="rgba(255,255,255,0.15)"/><circle cx="10" cy="70" r="0.8" fill="rgba(255,255,255,0.08)"/></svg>') repeat;
          animation: float 25s ease-in-out infinite;
          z-index: 2;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-8px) translateX(-5px); }
          75% { transform: translateY(-12px) translateX(10px); }
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
        }

        .network-activity-banner {
          display: inline-flex;
          align-items: center;
          background: rgba(16, 185, 129, 0.2);
          backdrop-filter: blur(10px);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .activity-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }

        .dashboard-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .quick-stats-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .mini-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-icon {
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .student-dashboard-hero {
            padding: 2rem 1.5rem;
          }

          .dashboard-title {
            font-size: 1.875rem;
          }

          .dashboard-subtitle {
            font-size: 1rem;
          }

          .quick-stats-row {
            gap: 0.75rem;
          }

          .mini-stat {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
      
      <section className="student-dashboard-hero">
        <div className="hero-content">
          <div className="network-activity-banner">
            <span className="activity-dot"></span>
            <span className="activity-text">Your Gator network is actively helping you succeed</span>
          </div>
          
          <h1 className="dashboard-title">Your Career Command Center</h1>
          <p className="dashboard-subtitle">
            Track opportunities, connect with your network, and watch your career take off with{' '}
            <strong>families, alumni, and fellow Gators</strong> in your corner.
          </p>
          
          <div className="quick-stats-row">
            <div className="mini-stat">
              <span className="stat-icon parent-icon">👨‍💼</span>
              <span className="stat-text">12 parents viewed your profile</span>
            </div>
            <div className="mini-stat">
              <span className="stat-icon alumni-icon">🎓</span>
              <span className="stat-text">3 alumni ready to connect</span>
            </div>
            <div className="mini-stat">
              <span className="stat-icon student-icon">👥</span>
              <span className="stat-text">47 peer connections</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}