import React from 'react';

export default function EmergingGatorsHero({ totalQuestions = 0, totalAnswers = 0, urgentCount = 0 }) {
  return (
    <div className="page-header">
      <div className="page-header-inner">
      <h1>Questions From UF Students</h1>
      
      <p className="header-subtitle">
        Browse questions and share your advice. Anyone can answer.
      </p>
      
      <div className="header-stats">
        <span>📊 {totalQuestions} questions</span>
        <span className="stat-separator">•</span>
        <span>💬 {totalAnswers} answers</span>
        {urgentCount > 0 && (
          <>
            <span className="stat-separator">•</span>
            <span className="urgent-stat">🔥 {urgentCount} need help ASAP</span>
          </>
        )}
      </div>
      </div>

      <style jsx>{`
        .page-header {
          background: #0021A5;
          padding: 40px 20px 24px;
          border-bottom: none;
        }

        .page-header-inner {
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
        }

        .header-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 16px 0;
        }

        .header-stats {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .stat-separator {
          color: rgba(255, 255, 255, 0.5);
        }

        .urgent-stat {
          color: #FCD34D;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 24px 16px 20px;
          }

          h1 {
            font-size: 24px;
          }

          .header-subtitle {
            font-size: 14px;
          }

          .header-stats {
            font-size: 13px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}