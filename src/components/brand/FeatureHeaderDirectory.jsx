
import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

export default function FeatureHeaderDirectory({
  members = 0,
  responseRate = 95,
  connections = 1247,
  initialQuery = ''
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('GatorDirectory', { q: searchQuery });
  };

  return (
    <>
      <style jsx>{`
        .hero-section {
          background-image: 
            linear-gradient(to right, rgba(0, 33, 165, 0.75), rgba(250, 70, 22, 0.6)),
            url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/451b54f81_image.png');
          background-size: cover;
          background-position: center 40%;
          min-height: 240px;
          padding: 48px 24px;
          color: white;
          text-align: center;
          position: relative;
          border-radius: 1.5rem;
          margin: 24px;
          overflow: hidden; /* Added overflow hidden */
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
          text-shadow: 0 2px 6px rgba(0,0,0,0.6); /* Added text-shadow */
        }

        .hero-subtitle {
          font-size: 1.125rem;
          opacity: 0.95; /* Updated opacity */
          margin-bottom: 32px;
          line-height: 1.5;
          max-width: 600px; /* Corrected max-w to max-width */
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5); /* Added text-shadow */
        }

        .search-form {
          margin-bottom: 24px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .search-container {
          position: relative;
          display: flex;
          gap: 12px;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px 12px 48px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          opacity: 0.7;
        }

        .search-button {
          background: white;
          color: #0021A5;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .search-button:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .action-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }

        .action-link:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
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
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .search-container {
            flex-direction: column;
          }
          
          .search-button {
            align-self: center;
            width: 200px;
          }
          
          .hero-stats {
            gap: 16px;
          }

          .hero-section {
            margin: 16px;
            padding: 32px 20px;
          }
        }
      `}</style>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🐊 {members.toLocaleString()}+ Gators in the directory</div>
          
          <h1 className="hero-title">Gator Directory</h1>
          
          <p className="hero-subtitle">
            Search parents, alumni, and fellow Gators for mentorship, referrals, and advice—then
            get a <span style={{ fontWeight: '600' }}>warm intro</span> to start the conversation.
          </p>

          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-container">
              <div style={{ position: 'relative', flex: 1 }}>
                <span className="search-icon">🔎</span>
                <input
                  name="q"
                  autoComplete="off"
                  placeholder="Search by role, company, or skill…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>

          <div className="hero-actions">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('PostRequest', {type: 'intro'}); }}
              className="action-link"
            >
              Ask for an Intro →
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('GatorDirectory'); }}
              className="action-link"
            >
              Browse All People
            </a>
          </div>

          <div className="hero-stats">
            <span className="stat-item">
              👥 <strong>{members.toLocaleString()}</strong> Members
            </span>
            <span className="stat-item">
              ⭐ <strong>{responseRate}%</strong> Response Rate
            </span>
            <span className="stat-item">
              📈 <strong>{connections.toLocaleString()}</strong> Connections
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
