import React from 'react';

export default function EmergingGatorsHero({ totalQuestions = 0, totalAnswers = 0, urgentCount = 0 }) {
  return (
    <div className="page-header">
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

      <style jsx>{`
        .page-header {
          background: white;
          padding: 40px 20px 24px;
          border-bottom: 1px solid #E5E7EB;
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .header-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 16px 0;
        }

        .header-stats {
          font-size: 14px;
          color: #6B7280;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .stat-separator {
          color: #D1D5DB;
        }

        .urgent-stat {
          color: #DC2626;
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