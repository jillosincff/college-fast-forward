import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function PublicPurposeBanner() {
  return (
    <div className="purpose-banner">
      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <p>
        <strong>This question was shared with you</strong> because someone thought your perspective could help a student.
      </p>

      <style jsx>{`
        .purpose-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 1px solid #FCD34D;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }

        .purpose-banner p {
          margin: 0;
          font-size: 15px;
          color: #92400E;
          line-height: 1.5;
        }

        .purpose-banner strong {
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .purpose-banner {
            padding: 14px 16px;
            border-radius: 0;
            margin-bottom: 12px;
          }

          .purpose-banner p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}